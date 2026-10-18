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

def analyze_mask(flowers):
    fset = set(flowers)
    # Check flower adjacency
    for r, c in fset:
        for dr, dc in [(0, 1), (1, 0)]:
            if (r + dr, c + dc) in fset:
                return None # Adjacent flowers not allowed
                
    mask = [[(r, c) not in fset for c in range(N)] for r in range(N)]
    
    # Extract across slots
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
    
    # Extract down slots
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
    
    # Check all white cells covered by at least one slot
    covered = set()
    for r, c, l in across:
        for i in range(l): covered.add((r, c + i))
    for r, c, l in down:
        for i in range(l): covered.add((r + i, c))
    if len(covered) != sum(row.count(True) for row in mask): return None
    
    # Max word length <= 4
    if max(l for _, _, l in across) > 4 or max(l for _, _, l in down) > 4:
        return None
        
    # Find connected components of white cells
    visited = set()
    components = []
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
                components.append(comp)
                
    comp_sizes = [len(c) for c in components]
    return mask, flowers, components, comp_sizes

print("Searching for masks where max component size <= 18...")
found = 0
for k in range(8, 16):
    print(f"Trying k={k} flower pairs...")
    for _ in range(50000):
        chosen = random.sample(pairs, k)
        fl = []
        for p in chosen: fl.extend(p)
        res = analyze_mask(fl)
        if res:
            mask, flowers, components, comp_sizes = res
            if max(comp_sizes) <= 18:
                found += 1
                print(f"Match {found}! Flowers: {len(flowers)} ({len(flowers)/81*100:.1f}%), Comp sizes: {comp_sizes}")
                for row in mask:
                    print(' '.join('.' if cell else '*' for cell in row))
                if found >= 3:
                    sys.exit(0)
