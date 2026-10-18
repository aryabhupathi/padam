# -*- coding: utf-8 -*-
import sys
import os
import json
import itertools
import random
import time

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..')))
from app.services.lexicon import LexiconManager
from app.core.crossword_csp import CrosswordCSP
from app.core.verify_puzzle_integrity import verify_puzzle

sys.stdout.reconfigure(encoding='utf-8')

lex = LexiconManager()
words_by_len = {}
for L, wlist in lex.index.words_by_length.items():
    words_by_len[L] = [(w, syls, clue, lex.get_category(w)) for w, syls, clue in wlist]

N = 9
# Corners (0,0), (0,8), (8,0), (8,8) shouldn't be flowers so edge words can start at (0,0)
even_cells = [(r, c) for r in range(N) for c in range(N) if (r + c) % 2 == 0 and (r, c) not in [(0,0),(0,8),(8,0),(8,8)]]

even_pairs = []
for r, c in even_cells:
    r2, c2 = N - 1 - r, N - 1 - c
    if (r, c) < (r2, c2):
        even_pairs.append(((r, c), (r2, c2)))
    elif (r, c) == (r2, c2):
        even_pairs.append(((r, c),))

print(f"Candidate even pairs: {len(even_pairs)}", flush=True)

def eval_and_solve():
    found_masks = 0
    start_time = time.time()
    
    for k in [7, 8, 9, 6, 10]:
        print(f"Scanning k={k} pairs...", flush=True)
        # Shuffle order of combinations to get diverse topologies
        all_combs = list(itertools.combinations(even_pairs, k))
        random.seed(42)
        random.shuffle(all_combs)
        
        for comb in all_combs:
            flowers = []
            for p in comb: flowers.extend(p)
            fset = set(flowers)
            
            mask = [[(r, c) not in fset for c in range(N)] for r in range(N)]
            
            # Count across
            across = []
            for r in range(N):
                c = 0
                while c < N:
                    if mask[r][c]:
                        start = c
                        while c < N and mask[r][c]: c += 1
                        if c - start >= 2: across.append((r, start, c - start))
                    else: c += 1
            if len(across) != 20: continue
            
            # Count down
            down = []
            for c in range(N):
                r = 0
                while r < N:
                    if mask[r][c]:
                        start = r
                        while r < N and mask[r][c]: r += 1
                        if r - start >= 2: down.append((start, c, r - start))
                    else: r += 1
            if len(down) != 20: continue
            
            # Check all white cells covered
            covered = set()
            for r, c, l in across:
                for i in range(l): covered.add((r, c + i))
            for r, c, l in down:
                for i in range(l): covered.add((r + i, c))
            white_cells = sum(row.count(True) for row in mask)
            if len(covered) != white_cells: continue
            
            # Max word length <= 5
            if max(l for _,_,l in across) > 5 or max(l for _,_,l in down) > 5: continue
            
            found_masks += 1
            print(f"\n[Mask #{found_masks}] Found 20x20 mask with {len(flowers)} flowers! ({white_cells/81*100:.1f}% letters)", flush=True)
            for row in mask:
                print(' '.join('.' if cell else '*' for cell in row), flush=True)
                
            # Attempt CSP solve
            csp = CrosswordCSP(N, mask, words_by_len)
            sol = csp.solve(max_seconds=1.5)
            if sol:
                ok, errs = verify_puzzle(sol)
                if ok:
                    print("SUCCESS! 9x9 SOLVED AND 100% VERIFIED!", flush=True)
                    out_b = os.path.join(os.path.dirname(__file__), "verified_9x9.json")
                    out_f = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", "..", "padavinodam-frontend", "src", "data", "verified_9x9.json"))
                    with open(out_b, 'w', encoding='utf-8') as f:
                        json.dump(sol, f, ensure_ascii=False, indent=2)
                    with open(out_f, 'w', encoding='utf-8') as f:
                        json.dump(sol, f, ensure_ascii=False, indent=2)
                    print(f"Saved to {out_b} and {out_f}!", flush=True)
                    return True
                else:
                    print(f"CSP solved but integrity check errors: {errs}", flush=True)
            else:
                print("CSP timeout on this mask, trying next...", flush=True)

            if found_masks >= 30:
                print("Tried 30 masks, moving to next k", flush=True)
                break

    print("Search complete.", flush=True)
    return False

if __name__ == "__main__":
    eval_and_solve()
