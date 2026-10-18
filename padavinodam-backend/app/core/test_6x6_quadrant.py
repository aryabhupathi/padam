# -*- coding: utf-8 -*-
import sys
import os
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

N = 6
# Symmetrical pairs in 6x6
pairs = []
for r in range(N):
    for c in range(N):
        r2, c2 = N - 1 - r, N - 1 - c
        if (r, c) < (r2, c2):
            pairs.append(((r, c), (r2, c2)))

print(f"6x6 symmetric pairs: {len(pairs)}")

# Search for 6x6 mask with 9 across and 9 down
for k in [2, 3, 4]:
    for comb in itertools.combinations(pairs, k):
        flowers = set()
        for p in comb: flowers.update(p)
        # Check adjacency
        adj = False
        for r, c in flowers:
            for dr, dc in [(0, 1), (1, 0)]:
                if (r + dr, c + dc) in flowers: adj = True; break
            if adj: break
        if adj: continue
        
        mask = [[(r, c) not in flowers for c in range(N)] for r in range(N)]
        across = []
        for r in range(N):
            c = 0
            while c < N:
                if mask[r][c]:
                    st = c
                    while c < N and mask[r][c]: c += 1
                    if c - st >= 2: across.append((r, st, c - st))
                else: c += 1
        if len(across) != 9: continue
        
        down = []
        for c in range(N):
            r = 0
            while r < N:
                if mask[r][c]:
                    st = r
                    while r < N and mask[r][c]: r += 1
                    if r - st >= 2: down.append((st, c, r - st))
                else: r += 1
        if len(down) != 9: continue
        
        covered = set()
        for r, c, l in across:
            for i in range(l): covered.add((r, c + i))
        for r, c, l in down:
            for i in range(l): covered.add((r + i, c))
        if len(covered) != sum(row.count(True) for row in mask): continue
        if max(l for _,_,l in across) > 5 or max(l for _,_,l in down) > 5: continue
        
        print(f"FOUND 6x6 MASK with {len(flowers)} flowers! Testing CSP...")
        for row in mask:
            print(' '.join('.' if cell else '*' for cell in row))
        csp = CrosswordCSP(N, mask, words_by_len)
        sol = csp.solve(max_seconds=1.0)
        if sol:
            print("🎉 6x6 SOLVED IN < 1 SECOND!")
            for row in sol['solution']:
                print(' '.join(c if c else '*' for c in row))
            sys.exit(0)
        else:
            print("CSP timed out on this mask.")

print("Search complete.")
