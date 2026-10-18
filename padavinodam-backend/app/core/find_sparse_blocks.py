# -*- coding: utf-8 -*-
import sys
import os
import random
import time

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..')))
from app.services.lexicon import LexiconManager

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

def evaluate(chosen_pairs):
    fl = []
    for p in chosen_pairs: fl.extend(p)
    fset = set(fl)
    
    # Adjacency check
    for r, c in fset:
        for dr, dc in [(0, 1), (1, 0)]:
            if (r + dr, c + dc) in fset:
                return None
                
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
    
    # Covered check
    covered = set()
    for r, c, l in across:
        for i in range(l): covered.add((r, c + i))
    for r, c, l in down:
        for i in range(l): covered.add((r + i, c))
    white_cells = sum(row.count(True) for row in mask)
    if len(covered) != white_cells: return None
    
    # Word lengths max <= 4
    if max(l for _,_,l in across) > 4 or max(l for _,_,l in down) > 4:
        return None
        
    # Count 2x2 white blocks
    solid_2x2 = 0
    for r in range(N - 1):
        for c in range(N - 1):
            if mask[r][c] and mask[r+1][c] and mask[r][c+1] and mask[r+1][c+1]:
                solid_2x2 += 1
                
    return mask, fl, solid_2x2, across, down

print("Searching for masks with 20 across, 20 down, and MINIMAL 2x2 blocks...")
best_solid = 99
best_masks = []

for k in range(10, 16):
    for trial in range(30000):
        chosen = random.sample(pairs, k)
        res = evaluate(chosen)
        if res:
            mask, fl, solid_2x2, across, down = res
            if solid_2x2 < best_solid:
                best_solid = solid_2x2
                print(f"New best solid 2x2 count: {solid_2x2} (k={k}, flowers={len(fl)})")
                best_masks.append((mask, fl, solid_2x2))
            if solid_2x2 <= 2:
                print(f"EXCELLENT MASK FOUND! solid_2x2 = {solid_2x2}")
                for row in mask:
                    print(' '.join('.' if cell else '*' for cell in row))
                print("Flowers:", fl)
                sys.exit(0)

print(f"Search done. Best solid 2x2 was {best_solid}")
