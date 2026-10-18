# -*- coding: utf-8 -*-
import sys
import os
import json
import time

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..')))
from app.services.lexicon import LexiconManager
from app.core.verify_puzzle_integrity import verify_puzzle

lex = LexiconManager()
words_by_len = {}
for L, wlist in lex.index.words_by_length.items():
    words_by_len[L] = [(w, syls, clue, lex.get_category(w)) for w, syls, clue in wlist]

N = 9
flowers = [
    (0, 3), (0, 6),
    (1, 4),
    (2, 0), (2, 3), (2, 5),
    (3, 2), (3, 6), (3, 8),
    (4, 1), (4, 4), (4, 7),
    (5, 0), (5, 2), (5, 6),
    (6, 3), (6, 5), (6, 8),
    (7, 4),
    (8, 2), (8, 5)
]
fset = set(flowers)
mask = [[(r, c) not in fset for c in range(N)] for r in range(N)]

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
                    "id": f"across_{cur_num}",
                    "number": cur_num,
                    "direction": "across",
                    "row": r,
                    "col": c,
                    "length": L,
                    "coords": coords
                })
            if sd:
                L = 0
                coords = []
                while r + L < N and mask[r+L][c]:
                    coords.append((r + L, c))
                    L += 1
                down_slots.append({
                    "id": f"down_{cur_num}",
                    "number": cur_num,
                    "direction": "down",
                    "row": r,
                    "col": c,
                    "length": L,
                    "coords": coords
                })
            cur_num += 1

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

print(f"Across: {len(across_slots)}, Down: {len(down_slots)}")
print(f"Components: {len(components)}")

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

# Let's test solving each component individually in isolation!
def solve_single(comp_slot_ids):
    comp_intersections = {sid: [] for sid in comp_slot_ids}
    for sid in comp_slot_ids:
        s = all_slots[sid]
        for pos, coord in enumerate(s["coords"]):
            for other_sid, other_pos in cell_to_slots[coord]:
                if other_sid != sid and other_sid in comp_intersections:
                    comp_intersections[sid].append((other_sid, pos, other_pos))
                    
    assigned = {}
    used_words = set()
    grid_letters = {}

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
        return {wid for wid in cand_ids if wlist[wid][0] not in used_words}

    def backtrack():
        if len(assigned) == len(comp_slot_ids):
            return True
        best_sid = -1
        best_cands = None
        min_c = 999999
        for sid in comp_slot_ids:
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
        
        for wid in list(best_cands):
            wentry = wlist[wid]
            wname = wentry[0]
            wsyls = wentry[1]
            
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

    t0 = time.time()
    res = backtrack()
    el = time.time() - t0
    return res, el

for idx, comp in enumerate(components):
    ok, el = solve_single(comp)
    print(f"Component {idx} ({len(comp)} slots): solvable={ok} in {el*1000:.1f}ms")
    if not ok:
        # inspect component slots
        for sid in comp:
            s = all_slots[sid]
            print(f"   Slot {s['direction']} {s['number']}: length={s['length']}, coords={s['coords']}")
