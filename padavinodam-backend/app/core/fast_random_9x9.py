# -*- coding: utf-8 -*-
import sys
import os
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
# Symmetric pairs
pairs = []
for r in range(N):
    for c in range(N):
        r2, c2 = N - 1 - r, N - 1 - c
        if (r, c) < (r2, c2):
            pairs.append(((r, c), (r2, c2)))
        elif (r, c) == (r2, c2):
            pairs.append(((r, c),))

def check_mask(chosen_pairs):
    fset = set()
    for p in chosen_pairs: fset.update(p)
    # Adjacency check
    for r, c in fset:
        for dr, dc in [(0, 1), (1, 0)]:
            if (r + dr, c + dc) in fset: return None
            
    mask = [[(r, c) not in fset for c in range(N)] for r in range(N)]
    across = []
    for r in range(N):
        c = 0
        while c < N:
            if mask[r][c]:
                st = c
                while c < N and mask[r][c]: c += 1
                if c - st >= 2: across.append((r, st, c - st))
            else: c += 1
    if len(across) != 20: return None
    
    down = []
    for c in range(N):
        r = 0
        while r < N:
            if mask[r][c]:
                st = r
                while r < N and mask[r][c]: r += 1
                if r - st >= 2: down.append((st, c, r - st))
            else: r += 1
    if len(down) != 20: return None
    
    covered = set()
    for r, c, l in across:
        for i in range(l): covered.add((r, c + i))
    for r, c, l in down:
        for i in range(l): covered.add((r + i, c))
    if len(covered) != sum(row.count(True) for row in mask): return None
    
    # Word lengths
    lens_a = [l for _,_,l in across]
    lens_d = [l for _,_,l in down]
    if max(lens_a) > 5 or max(lens_d) > 5: return None
    
    # Check max 2x2 solid blocks
    b2x2 = 0
    for r in range(N - 1):
        for c in range(N - 1):
            if mask[r][c] and mask[r+1][c] and mask[r][c+1] and mask[r+1][c+1]:
                b2x2 += 1
    return mask, fset, b2x2

print("Starting search for 20x20 9x9 masks and testing CSP solve...", flush=True)
random.seed(42)
tested = 0
start_time = time.time()

for trial in range(200000):
    k = random.choice([8, 9, 10])
    chosen = random.sample(pairs, k)
    res = check_mask(chosen)
    if res:
        mask, fset, b2x2 = res
        tested += 1
        white = sum(row.count(True) for row in mask)
        pct = white / 81 * 100
        print(f"\n[Match #{tested}] Flowers: {len(fset)} ({pct:.1f}% letters), b2x2={b2x2}", flush=True)
        for row in mask:
            print(' '.join('.' if cell else '*' for cell in row), flush=True)
            
        csp = CrosswordCSP(N, mask, words_by_len)
        sol = csp.solve(max_seconds=1.5)
        if sol:
            ok, errs = verify_puzzle(sol)
            if ok:
                print("🎉 SUCCESS! 9x9 SOLVED AND VERIFIED!", flush=True)
                import json
                out_b = os.path.join(os.path.dirname(__file__), "verified_9x9.json")
                out_f = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", "..", "padavinodam-frontend", "src", "data", "verified_9x9.json"))
                with open(out_b, 'w', encoding='utf-8') as f:
                    json.dump(sol, f, ensure_ascii=False, indent=2)
                with open(out_f, 'w', encoding='utf-8') as f:
                    json.dump(sol, f, ensure_ascii=False, indent=2)
                print(f"Saved to {out_b} and {out_f}!", flush=True)
                sys.exit(0)
            else:
                print(f"CSP solved but integrity errors: {errs}", flush=True)
        else:
            print("CSP timed out, trying next match...", flush=True)

print("Search completed.", flush=True)
