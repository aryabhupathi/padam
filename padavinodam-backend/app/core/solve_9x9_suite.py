# -*- coding: utf-8 -*-
"""
Solver for Medium Mode (9x9) Telugu Crossword
Target: Exactly 20 Across clues and 20 Down clues (Total 40 clues)
Isolated single rosettes, 180-degree symmetry, >= 75-80% letters.
Zero collisions.
"""

import sys
import os
import json
import itertools
import random

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..')))
from app.services.lexicon import LexiconManager
from app.core.crossword_csp import CrosswordCSP
from app.core.verify_puzzle_integrity import verify_puzzle

lex = LexiconManager()
words_by_len = {}
for L, wlist in lex.index.words_by_length.items():
    words_by_len[L] = [(w, syls, clue, lex.get_category(w)) for w, syls, clue in wlist]

N = 9
pairs = []
for r in range(N):
    for c in range(N):
        r2, c2 = N - 1 - r, N - 1 - c
        if (r, c) < (r2, c2):
            pairs.append(((r, c), (r2, c2)))
        elif (r, c) == (r2, c2):
            pairs.append(((r, c),))

def fast_eval_mask(flowers):
    fset = set(flowers)
    mask = [[(r, c) not in fset for c in range(N)] for r in range(N)]
    across = []
    for r in range(N):
        c = 0
        while c < N:
            if mask[r][c]:
                start = c
                while c < N and mask[r][c]: c += 1
                if c - start >= 2: across.append((r, start, c - start))
            else: c += 1
    if len(across) != 20: return None
    down = []
    for c in range(N):
        r = 0
        while r < N:
            if mask[r][c]:
                start = r
                while r < N and mask[r][c]: r += 1
                if r - start >= 2: down.append((start, c, r - start))
            else: r += 1
    if len(down) != 20: return None
    
    covered = set()
    for r, c, l in across:
        for i in range(l): covered.add((r, c + i))
    for r, c, l in down:
        for i in range(l): covered.add((r + i, c))
    if len(covered) != sum(row.count(True) for row in mask): return None
    
    lens_a = [l for _,_,l in across]
    lens_d = [l for _,_,l in down]
    if max(lens_a) > 5 or max(lens_d) > 5: return None
    return mask, flowers

def solve():
    print("Searching for 9x9 masks (target: 20 across, 20 down)...")
    random.seed(42)
    # Search over sample space or random subsets of pairs
    tested_masks = 0
    # Try combinations of k in [7, 8, 9, 10, 11]
    for k in [7, 8, 9, 10, 11]:
        print(f"Trying k={k} pairs...")
        # Since combinations can be large, sample up to 100,000 combinations per k
        comb_iter = itertools.combinations(pairs, k)
        for idx, comb in enumerate(comb_iter):
            if idx > 150000: break
            fl = []
            for p in comb: fl.extend(p)
            fset = set(fl)
            adj = False
            for r, c in fset:
                for dr, dc in [(-1,0),(1,0),(0,-1),(0,1)]:
                    if (r+dr, c+dc) in fset: adj = True; break
                if adj: break
            if adj: continue
            
            res = fast_eval_mask(fl)
            if res:
                mask, flowers = res
                tested_masks += 1
                print(f"Testing valid mask #{tested_masks} with {len(flowers)} flowers...")
                csp = CrosswordCSP(N, mask, words_by_len)
                sol = csp.solve(max_seconds=1.2)
                if sol:
                    ok, errors = verify_puzzle(sol)
                    if ok:
                        print("SUCCESS 9x9 SOLVED!")
                        out_backend = os.path.join(os.path.dirname(__file__), "verified_9x9.json")
                        with open(out_backend, "w", encoding="utf-8") as f:
                            json.dump(sol, f, ensure_ascii=False, indent=2)
                        out_frontend = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", "..", "padavinodam-frontend", "src", "data", "verified_9x9.json"))
                        with open(out_frontend, "w", encoding="utf-8") as f:
                            json.dump(sol, f, ensure_ascii=False, indent=2)
                        print(f"Saved 9x9 to {out_backend} and {out_frontend}!")
                        return True

    print(f"Search complete. Tested {tested_masks} masks.")
    return False

if __name__ == "__main__":
    solve()
