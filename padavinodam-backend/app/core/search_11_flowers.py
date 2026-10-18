# -*- coding: utf-8 -*-
import sys
import os
import itertools

N = 9
# Symmetric pairs
pairs = []
for r in range(N):
    for c in range(N):
        r2, c2 = N - 1 - r, N - 1 - c
        if (r, c) < (r2, c2):
            pairs.append(((r, c), (r2, c2)))

print(f"Total pairs (excluding center): {len(pairs)}")

def test_flowers(fset):
    # Adjacency check
    for r, c in fset:
        for dr, dc in [(0, 1), (1, 0)]:
            if (r + dr, c + dc) in fset:
                return False
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
    if len(across) != 20: return False
    down = []
    for c in range(N):
        r = 0
        while r < N:
            if mask[r][c]:
                st = r
                while r < N and mask[r][c]: r += 1
                if r - st >= 2: down.append((st, c, r - st))
            else: r += 1
    if len(down) != 20: return False
    covered = set()
    for r, c, l in across:
        for i in range(l): covered.add((r, c + i))
    for r, c, l in down:
        for i in range(l): covered.add((r + i, c))
    if len(covered) != sum(row.count(True) for row in mask): return False
    if max(l for _,_,l in across) > 5 or max(l for _,_,l in down) > 5: return False
    return True

# If 11 flowers: center (4, 4) + 5 pairs!
valid_masks = []
print("Searching for 11-flower masks with center (4, 4)...")
for comb in itertools.combinations(pairs, 5):
    fset = {(4, 4)}
    for p in comb: fset.update(p)
    if test_flowers(fset):
        valid_masks.append(fset)
        print(f"Found valid 11-flower mask #{len(valid_masks)}!")
        mask = [[(r, c) not in fset for c in range(N)] for r in range(N)]
        for row in mask:
            print(' '.join('.' if cell else '*' for cell in row))
        if len(valid_masks) >= 10:
            break

# If center is not a flower: 6 pairs = 12 flowers or 7 pairs = 14 flowers?
if not valid_masks:
    print("Testing 12 or 13 flowers...")
    for k in [6, 7]:
        print(f"Trying k={k} pairs...")
        for comb in itertools.combinations(pairs, k):
            fset = set()
            for p in comb: fset.update(p)
            if test_flowers(fset):
                valid_masks.append(fset)
                print(f"Found valid mask with {len(fset)} flowers!")
                mask = [[(r, c) not in fset for c in range(N)] for r in range(N)]
                for row in mask:
                    print(' '.join('.' if cell else '*' for cell in row))
                if len(valid_masks) >= 10:
                    break
        if valid_masks: break
