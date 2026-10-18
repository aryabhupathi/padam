# -*- coding: utf-8 -*-
import sys
import os
import json
import itertools
import random
import math
import time

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

def count_components(mask):
    visited = set()
    sizes = []
    for r in range(N):
        for c in range(N):
            if mask[r][c] and (r, c) not in visited:
                comp = []
                queue = [(r, c)]
                visited.add((r, c))
                while queue:
                    curr_r, curr_c = queue.pop(0)
                    comp.append((curr_r, curr_c))
                    for dr, dc in [(-1,0),(1,0),(0,-1),(0,1)]:
                        nr, nc = curr_r + dr, curr_c + dc
                        if 0 <= nr < N and 0 <= nc < N and mask[nr][nc] and (nr, nc) not in visited:
                            visited.add((nr, nc))
                            queue.append((nr, nc))
                sizes.append(len(comp))
    return sizes

def cost(chosen_pairs):
    flowers = set()
    for p in chosen_pairs: flowers.update(p)
    fset = set(flowers)
    
    adj_penalty = 0
    for r, c in fset:
        for dr, dc in [(0, 1), (1, 0)]:
            if (r+dr, c+dc) in fset: adj_penalty += 1
            
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
    
    lens_a = [l for _,_,l in across]
    lens_d = [l for _,_,l in down]
    max_len = max(lens_a + lens_d) if lens_a and lens_d else 9
    len_penalty = max(0, max_len - 4)
    
    comp_sizes = count_components(mask)
    max_comp = max(comp_sizes) if comp_sizes else 81
    # Penalize if largest component > 28 cells
    large_comp_penalty = max(0, max_comp - 28)
    
    c = abs(len(across) - 20) + abs(len(down) - 20) + 20 * adj_penalty + 20 * uncovered + 5 * len_penalty + 2 * large_comp_penalty
    return c, comp_sizes, fset, mask

def run():
    print("Running SA search for 9x9...")
    random.seed(42)
    for restart in range(150):
        k = random.randint(8, 14)
        current = random.sample(pairs, k)
        c, comp_sizes, fset, mask = cost(current)
        T = 6.0
        while T > 0.05:
            for step in range(80):
                if c == 0:
                    print(f"Mask found! Flowers: {len(fset)}, Comp sizes: {comp_sizes}")
                    for row in mask:
                        print(' '.join('.' if cell else '*' for cell in row))
                    csp = CrosswordCSP(N, mask, words_by_len)
                    sol = csp.solve(max_seconds=2.0)
                    if sol:
                        ok, errors = verify_puzzle(sol)
                        if ok:
                            print("SUCCESS! Solved 9x9!")
                            out_b = os.path.join(os.path.dirname(__file__), "verified_9x9.json")
                            out_f = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", "..", "padavinodam-frontend", "src", "data", "verified_9x9.json"))
                            json.dump(sol, open(out_b, 'w', encoding='utf-8'), ensure_ascii=False, indent=2)
                            json.dump(sol, open(out_f, 'w', encoding='utf-8'), ensure_ascii=False, indent=2)
                            print(f"Saved to {out_b} and {out_f}!")
                            return True
                    # If CSP timed out, break and find another mask
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
                
                nc, ncomp_sizes, nfset, nmask = cost(nxt)
                if nc < c or random.random() < math.exp((c - nc) / T):
                    current = nxt
                    c, comp_sizes, fset, mask = nc, ncomp_sizes, nfset, nmask
            T *= 0.88
    print("Done search.")
    return False

if __name__ == "__main__":
    run()
