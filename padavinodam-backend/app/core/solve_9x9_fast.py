# -*- coding: utf-8 -*-
import sys
import os
import json
import random
import time

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..')))
from app.services.lexicon import LexiconManager
from app.core.verify_puzzle_integrity import verify_puzzle

lex = LexiconManager()
words_by_len = {}
for L, wlist in lex.index.words_by_length.items():
    words_by_len[L] = [(w, syls, clue, lex.get_category(w)) for w, syls, clue in wlist]

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
N = 9
pairs = []
for r in range(N):
    for c in range(N):
        r2, c2 = N - 1 - r, N - 1 - c
        if (r, c) < (r2, c2):
            pairs.append(((r, c), (r2, c2)))
        elif (r, c) == (r2, c2):
            pairs.append(((r, c),))

def check_mask_and_solve(fset):
    # 1. No adjacent flowers
    for r, c in fset:
        for dr, dc in [(0, 1), (1, 0)]:
            if (r + dr, c + dc) in fset:
                return None
                
    mask = [[(r, c) not in fset for c in range(N)] for r in range(N)]
    
    # 2. Extract slots
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

    if len(across_slots) != 20 or len(down_slots) != 20:
        return None
        
    # Check max word length <= 5
    if any(s["length"] > 5 for s in across_slots) or any(s["length"] > 5 for s in down_slots):
        return None

    # Check all white cells covered
    covered = set()
    for s in across_slots:
        for coord in s["coords"]: covered.add(coord)
    for s in down_slots:
        for coord in s["coords"]: covered.add(coord)
    white_cells = sum(row.count(True) for row in mask)
    if len(covered) != white_cells:
        return None

    # 3. Group slots by connected component
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
    
    # 4. Solve components sequentially
    used_words = set()
    grid_letters = {}
    all_assigned = {}
    
    def solve_comp(comp_sids):
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
            
            cands_list = list(best_cands)
            random.shuffle(cands_list)
            # Limit candidate trials to prevent hanging
            for wid in cands_list[:40]:
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

    # Solve all components
    for comp_sids in components:
        comp_res = solve_comp(comp_sids)
        if comp_res is None:
            return None
        all_assigned.update(comp_res)

    # Success! Build solution
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

    return {
        "size": N,
        "mask": mask,
        "solution": sol_grid,
        "numbers": numbers,
        "clues": {"across": ac_res, "down": dw_res}
    }

def cost_mask(chosen_pairs):
    flowers = set()
    for p in chosen_pairs: flowers.update(p)
    adj_penalty = 0
    for r, c in flowers:
        for dr, dc in [(0, 1), (1, 0)]:
            if (r+dr, c+dc) in flowers: adj_penalty += 1
    mask = [[(r, c) not in flowers for c in range(N)] for r in range(N)]
    across = []
    for r in range(N):
        c = 0
        while c < N:
            if mask[r][c]:
                start = c
                while c < N and mask[r][c]: c += 1
                if c - start >= 2: across.append((r, start, c - start))
            else: c += 1
    down = []
    for c in range(N):
        r = 0
        while r < N:
            if mask[r][c]:
                start = r
                while r < N and mask[r][c]: r += 1
                if r - start >= 2: down.append((start, c, r - start))
            else: r += 1
    covered = set()
    for r, c, l in across:
        for i in range(l): covered.add((r, c + i))
    for r, c, l in down:
        for i in range(l): covered.add((r + i, c))
    total_white = sum(row.count(True) for row in mask)
    uncovered = total_white - len(covered)
    lens = [l for _,_,l in across] + [l for _,_,l in down]
    max_len = max(lens) if lens else 9
    len_penalty = max(0, max_len - 5)
    return abs(len(across) - 20) + abs(len(down) - 20) + 20 * adj_penalty + 20 * uncovered + 5 * len_penalty, flowers

def run_search():
    print("Searching for 20x20 9x9 puzzle using SA + component CSP...")
    random.seed(101)
    import math
    masks_tested = 0
    start_time = time.time()
    
    for restart in range(300):
        k = random.randint(8, 14)
        current = random.sample(pairs, k)
        c, flowers = cost_mask(current)
        T = 5.0
        while T > 0.1:
            for step in range(60):
                if c == 0:
                    masks_tested += 1
                    puzzle = check_mask_and_solve(flowers)
                    if puzzle:
                        ok, errs = verify_puzzle(puzzle)
                        if ok:
                            print(f"\n🎉 9x9 SOLVED AND VERIFIED! (Tested {masks_tested} masks in {time.time()-start_time:.1f}s)")
                            out_b = os.path.join(os.path.dirname(__file__), "verified_9x9.json")
                            out_f = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", "..", "padavinodam-frontend", "src", "data", "verified_9x9.json"))
                            with open(out_b, 'w', encoding='utf-8') as f:
                                json.dump(puzzle, f, ensure_ascii=False, indent=2)
                            with open(out_f, 'w', encoding='utf-8') as f:
                                json.dump(puzzle, f, ensure_ascii=False, indent=2)
                            print(f"Saved to {out_b} and {out_f}!")
                            return True
                    c = 999
                    break
                nxt = list(current)
                move = random.choice(['swap', 'add', 'remove'])
                if move == 'swap' and len(nxt) > 0:
                    idx = random.randrange(len(nxt))
                    rem = [p for p in pairs if p not in nxt]
                    if rem: nxt[idx] = random.choice(rem)
                elif move == 'add' and len(nxt) < 16:
                    rem = [p for p in pairs if p not in nxt]
                    if rem: nxt.append(random.choice(rem))
                elif move == 'remove' and len(nxt) > 7:
                    nxt.pop(random.randrange(len(nxt)))
                nc, nflowers = cost_mask(nxt)
                if nc < c or random.random() < math.exp((c - nc) / T):
                    current = nxt
                    c, flowers = nc, nflowers
            T *= 0.88
    print("Search ended without solution.")
    return False

if __name__ == "__main__":
    run_search()
