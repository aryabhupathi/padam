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
pairs = []
for r in range(N):
    for c in range(N):
        r2, c2 = N - 1 - r, N - 1 - c
        if (r, c) < (r2, c2):
            pairs.append(((r, c), (r2, c2)))
        elif (r, c) == (r2, c2):
            pairs.append(((r, c),))

def cost_with_no_2x2(chosen_pairs):
    fl = []
    for p in chosen_pairs: fl.extend(p)
    fset = set(fl)
    
    # 1. Adjacency check
    adj = 0
    for r, c in fset:
        for dr, dc in [(0, 1), (1, 0)]:
            if (r + dr, c + dc) in fset:
                adj += 1
                
    mask = [[(r, c) not in fset for c in range(N)] for r in range(N)]
    
    # 2. Count 2x2 blocks
    b2x2 = 0
    for r in range(N - 1):
        for c in range(N - 1):
            if mask[r][c] and mask[r+1][c] and mask[r][c+1] and mask[r+1][c+1]:
                b2x2 += 1
                
    # 3. Across & down counts
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
    white_cells = sum(row.count(True) for row in mask)
    uncovered = white_cells - len(covered)
    
    lens = [l for _,_,l in across] + [l for _,_,l in down]
    max_len = max(lens) if lens else 9
    len_penalty = max(0, max_len - 5)
    
    total_cost = (
        abs(len(across) - 20) * 10 +
        abs(len(down) - 20) * 10 +
        adj * 50 +
        uncovered * 50 +
        len_penalty * 10 +
        b2x2 * 15 # heavily penalize 2x2 blocks!
    )
    return total_cost, adj, b2x2, len(across), len(down), fset, mask

print("Searching with SA for 20x20 9x9 mask with ZERO 2x2 blocks...")
random.seed(99)
import math

start_time = time.time()
for restart in range(200):
    k = random.randint(10, 16)
    current = random.sample(pairs, k)
    c, adj, b2x2, na, nd, fset, mask = cost_with_no_2x2(current)
    T = 8.0
    while T > 0.05:
        for step in range(80):
            if adj == 0 and na == 20 and nd == 20 and b2x2 <= 2:
                print(f"\nFOUND CANDIDATE! b2x2 = {b2x2}, flowers = {len(fset)} ({sum(row.count(True) for row in mask)/81*100:.1f}% letters)")
                for row in mask:
                    print(' '.join('.' if cell else '*' for cell in row))
                csp = CrosswordCSP(N, mask, words_by_len)
                sol = csp.solve(max_seconds=2.0)
                if sol:
                    ok, errs = verify_puzzle(sol)
                    if ok:
                        print("🎉 SUCCESS! 9x9 SOLVED AND VERIFIED!")
                        import json
                        out_b = os.path.join(os.path.dirname(__file__), "verified_9x9.json")
                        out_f = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", "..", "padavinodam-frontend", "src", "data", "verified_9x9.json"))
                        with open(out_b, 'w', encoding='utf-8') as f:
                            json.dump(sol, f, ensure_ascii=False, indent=2)
                        with open(out_f, 'w', encoding='utf-8') as f:
                            json.dump(sol, f, ensure_ascii=False, indent=2)
                        print(f"Saved to {out_b} and {out_f}!")
                        sys.exit(0)
                    else:
                        print(f"Verification errors: {errs}")
                else:
                    print("CSP solve timed out, continuing...")
                c = 999
                break
                
            nxt = list(current)
            move = random.choice(['swap', 'add', 'remove'])
            if move == 'swap' and len(nxt) > 0:
                idx = random.randrange(len(nxt))
                rem = [p for p in pairs if p not in nxt]
                if rem: nxt[idx] = random.choice(rem)
            elif move == 'add' and len(nxt) < 18:
                rem = [p for p in pairs if p not in nxt]
                if rem: nxt.append(random.choice(rem))
            elif move == 'remove' and len(nxt) > 8:
                nxt.pop(random.randrange(len(nxt)))
                
            nc, nadj, nb2x2, nna, nnd, nfset, nmask = cost_with_no_2x2(nxt)
            if nc < c or random.random() < math.exp((c - nc) / T):
                current = nxt
                c, adj, b2x2, na, nd, fset, mask = nc, nadj, nb2x2, nna, nnd, nfset, nmask
        T *= 0.88

print("Search completed.")
