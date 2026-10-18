# -*- coding: utf-8 -*-
import sys
import os
import json
import time

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..')))
from app.services.lexicon import LexiconManager
from app.core.verify_puzzle_integrity import verify_puzzle

sys.stdout.reconfigure(encoding='utf-8')

lex = LexiconManager()
words_by_len = {}
for L, wlist in lex.index.words_by_length.items():
    words_by_len[L] = [(w, syls, clue, lex.get_category(w)) for w, syls, clue in wlist]

mask_str = [
    '. * . . * . . * . . . *',
    '. . * . . * . . . * . .',
    '* . . * . . * . * . * .',
    '. * . . * . . * . . . *',
    '. . * . . * . . * . * .',
    '* . . * . . * . . * . .',
    '. . * . . * . . * . . *',
    '. * . * . . * . . * . .',
    '* . . . * . . * . . * .',
    '. * . * . * . . * . . *',
    '. . * . . . * . . * . .',
    '* . . . * . . * . . * .'
]
N = 12
mask = [[c == '.' for c in row.split()] for row in mask_str]

# Extract across and down slots
across_slots = []
down_slots = []
cur_num = 1
numbers = {}

for r in range(N):
    for c in range(N):
        if not mask[r][c]: continue
        sa = (c == 0 or not mask[r][c-1]) and (c + 1 < N and mask[r][c+1])
        sd = (r == 0 or not mask[r-1][c]) and (r + 1 < N and mask[r+1][c])
        if sa or sd:
            numbers[f"{r},{c}"] = cur_num
            if sa:
                L = 0
                coords = []
                while c + L < N and mask[r][c+L]:
                    coords.append((r, c + L))
                    L += 1
                across_slots.append({
                    "id": f"across_{cur_num}", "number": cur_num, "direction": "across",
                    "row": r, "col": c, "length": L, "coords": coords
                })
            if sd:
                L = 0
                coords = []
                while r + L < N and mask[r+L][c]:
                    coords.append((r + L, c))
                    L += 1
                down_slots.append({
                    "id": f"down_{cur_num}", "number": cur_num, "direction": "down",
                    "row": r, "col": c, "length": L, "coords": coords
                })
            cur_num += 1

print(f"Across: {len(across_slots)}, Down: {len(down_slots)}")

all_slots = []
for s in across_slots:
    s["global_id"] = len(all_slots)
    all_slots.append(s)
for s in down_slots:
    s["global_id"] = len(all_slots)
    all_slots.append(s)

cell_to_slots = {}
for s in all_slots:
    for pos, coord in enumerate(s["coords"]):
        if coord not in cell_to_slots:
            cell_to_slots[coord] = []
        cell_to_slots[coord].append((s["global_id"], pos))

slot_adj = {s["global_id"]: set() for s in all_slots}
for coord, s_list in cell_to_slots.items():
    for i in range(len(s_list)):
        for j in range(i + 1, len(s_list)):
            id1, pos1 = s_list[i]
            id2, pos2 = s_list[j]
            slot_adj[id1].add(id2)
            slot_adj[id2].add(id1)

visited = set()
components = []
for s in all_slots:
    sid = s["global_id"]
    if sid not in visited:
        comp = []
        queue = [sid]
        visited.add(sid)
        while queue:
            curr = queue.pop(0)
            comp.append(curr)
            for neighbor in slot_adj[curr]:
                if neighbor not in visited:
                    visited.add(neighbor)
                    queue.append(neighbor)
        components.append(comp)

# Sort components by size (smallest first)
components.sort(key=len)
print(f"Components ({len(components)}): {[len(c) for c in components]}")

# Build fast indexing for lexicon
pos_index = {}
all_ids_by_len = {}
for L, wlist in words_by_len.items():
    all_ids_by_len[L] = set(range(len(wlist)))
    for wid, entry in enumerate(wlist):
        syls = entry[1]
        for pos, syl in enumerate(syls):
            key = (L, pos, syl)
            if key not in pos_index:
                pos_index[key] = set()
            pos_index[key].add(wid)

empty_set = frozenset()

def solve_comp(comp_sids, used_words, grid_letters):
    comp_intersections = {sid: [] for sid in comp_sids}
    for sid in comp_sids:
        s = all_slots[sid]
        for pos, coord in enumerate(s["coords"]):
            for o_sid, o_pos in cell_to_slots[coord]:
                if o_sid != sid and o_sid in comp_intersections:
                    comp_intersections[sid].append((o_sid, pos, o_pos))
                    
    assigned = {}
    
    def get_cands(sid):
        s = all_slots[sid]
        L = s["length"]
        constraints = []
        for pos, coord in enumerate(s["coords"]):
            if coord in grid_letters:
                constraints.append((pos, grid_letters[coord]))
        if not constraints:
            cand_ids = all_ids_by_len.get(L, set())
        else:
            sets = [pos_index.get((L, p, syl), empty_set) for p, syl in constraints]
            if any(len(st) == 0 for st in sets):
                return set()
            cand_ids = set.intersection(*sets)
        wlist = words_by_len[L]
        return [wid for wid in cand_ids if wlist[wid][0] not in used_words]

    def backtrack():
        if len(assigned) == len(comp_sids):
            return True
        best_sid = -1
        best_cands = None
        min_c = 999999
        for sid in comp_sids:
            if sid in assigned: continue
            cands = get_cands(sid)
            cnt = len(cands)
            if cnt == 0: return False
            if cnt < min_c:
                min_c = cnt
                best_sid = sid
                best_cands = cands
                if cnt == 1: break
        s = all_slots[best_sid]
        L = s["length"]
        coords = s["coords"]
        wlist = words_by_len[L]
        
        import random
        cands_list = list(best_cands)
        random.shuffle(cands_list)
        for wid in cands_list[:60]:
            wentry = wlist[wid]
            wname, wsyls = wentry[0], wentry[1]
            assigned[best_sid] = wid
            used_words.add(wname)
            added = []
            for pos, coord in enumerate(coords):
                if coord not in grid_letters:
                    grid_letters[coord] = wsyls[pos]
                    added.append(coord)
            fwd_ok = True
            for n_sid, _, _ in comp_intersections[best_sid]:
                if n_sid not in assigned:
                    if len(get_cands(n_sid)) == 0:
                        fwd_ok = False
                        break
            if fwd_ok and backtrack():
                return True
            for coord in added:
                del grid_letters[coord]
            used_words.remove(wname)
            del assigned[best_sid]
        return False

    if backtrack():
        return assigned
    return None

import random
random.seed(42)

for trial in range(50):
    used_words = set()
    grid_letters = {}
    all_assigned = {}
    success = True
    
    t0 = time.time()
    for c_idx, comp_sids in enumerate(components):
        ans = solve_comp(comp_sids, used_words, grid_letters)
        if ans is None:
            # print(f"Comp {c_idx} failed on trial {trial}")
            success = False
            break
        all_assigned.update(ans)
        
    if success:
        el = time.time() - t0
        print(f"🎉 SUCCESS ON TRIAL {trial} in {el*1000:.1f}ms! ALL 74 SLOTS SOLVED!")
        
        sol_grid = [[None for _ in range(N)] for _ in range(N)]
        for (r, c), syl in grid_letters.items():
            sol_grid[r][c] = syl
            
        ac_res = []
        for s in across_slots:
            wid = all_assigned[s["global_id"]]
            entry = words_by_len[s["length"]][wid]
            ac_res.append({
                "id": s["id"], "number": s["number"], "row": s["row"], "col": s["col"],
                "length": s["length"], "word": entry[0], "syllables": entry[1],
                "clue": entry[2], "category": entry[3]
            })
        dw_res = []
        for s in down_slots:
            wid = all_assigned[s["global_id"]]
            entry = words_by_len[s["length"]][wid]
            dw_res.append({
                "id": s["id"], "number": s["number"], "row": s["row"], "col": s["col"],
                "length": s["length"], "word": entry[0], "syllables": entry[1],
                "clue": entry[2], "category": entry[3]
            })
            
        sol_data = {
            "size": N,
            "mask": mask,
            "solution": sol_grid,
            "numbers": numbers,
            "clues": {"across": ac_res, "down": dw_res}
        }
        
        ok, errs = verify_puzzle(sol_data)
        print(f"Verification: {ok}, errors: {errs}")
        if ok:
            out_b = os.path.join(os.path.dirname(__file__), "verified_12x12.json")
            out_f = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", "..", "padavinodam-frontend", "src", "data", "verified_12x12.json"))
            with open(out_b, 'w', encoding='utf-8') as f:
                json.dump(sol_data, f, ensure_ascii=False, indent=2)
            with open(out_f, 'w', encoding='utf-8') as f:
                json.dump(sol_data, f, ensure_ascii=False, indent=2)
            print(f"Saved to {out_b} and {out_f}!")
            sys.exit(0)

print("Trials completed.")
