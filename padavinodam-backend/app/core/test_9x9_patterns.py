# -*- coding: utf-8 -*-
import sys
import os

N = 9

def test_mask(fset):
    # Check adjacency
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
    down = []
    for c in range(N):
        r = 0
        while r < N:
            if mask[r][c]:
                start = r
                while r < N and mask[r][c]: r += 1
                if r - start >= 2: down.append((start, c, r - start))
            else: r += 1
            
    # Check uncovered cells
    covered = set()
    for r, c, l in across:
        for i in range(l): covered.add((r, c + i))
    for r, c, l in down:
        for i in range(l): covered.add((r + i, c))
    white_cells = sum(row.count(True) for row in mask)
    if len(covered) != white_cells:
        return None
        
    return len(across), len(down), [l for _,_,l in across], [l for _,_,l in down], len(fset), mask

# Let's explore combinations of flowers in the quadrants
# Let symmetry be 180 degrees
quadrant_coords = [(r, c) for r in range(4) for c in range(4)]
print(f"Quadrant coords: {len(quadrant_coords)}")

import itertools

# We want 20 across and 20 down!
for q_flowers in itertools.combinations(quadrant_coords, 3):
    # Symmetrize
    fl = set(q_flowers)
    for r, c in q_flowers:
        fl.add((N - 1 - r, N - 1 - c))
    # Maybe add some in row 4 or col 4
    for extra in [
        (),
        ((4, 4),),
        ((4, 1), (4, 7)),
        ((1, 4), (7, 4)),
        ((4, 4), (4, 1), (4, 7)),
        ((4, 4), (1, 4), (7, 4)),
        ((4, 1), (4, 7), (1, 4), (7, 4)),
        ((4, 4), (4, 1), (4, 7), (1, 4), (7, 4)),
        ((4, 2), (4, 6)),
        ((2, 4), (6, 4)),
        ((4, 2), (4, 6), (2, 4), (6, 4))
    ]:
        full_fl = fl | set(extra)
        res = test_mask(full_fl)
        if res:
            na, nd, la, ld, fcount, mask = res
            if na == 20 and nd == 20:
                print(f"FOUND 20x20 MASK! Flowers: {fcount} ({fcount/81*100:.1f}%), lengths max: a={max(la)}, d={max(ld)}")
                for row in mask:
                    print(' '.join('.' if cell else '*' for cell in row))
                print("Flowers:", sorted(list(full_fl)))
                sys.exit(0)
print("Finished search.")
