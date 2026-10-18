# -*- coding: utf-8 -*-
import sys
import os

N = 9
flowers = [
    (0, 3), (0, 6),
    (1, 4),
    (2, 0), (2, 3), (2, 5),
    (3, 2), (3, 6), (3, 8),
    (4, 1), (4, 4), (4, 7),
    (5, 0), (5, 2), (5, 6),
    (6, 3), (6, 5), (6, 8),
    (7, 4),
    (8, 2), (8, 5)
]

fset = set(flowers)
print(f"Total flowers: {len(fset)}")

# Verify symmetry
for r, c in flowers:
    r2, c2 = N - 1 - r, N - 1 - c
    assert (r2, c2) in fset, f"Asymmetry at ({r},{c})"

# Verify adjacency
for r, c in flowers:
    for dr, dc in [(0, 1), (1, 0), (0, -1), (-1, 0)]:
        assert (r + dr, c + dc) not in fset, f"Adjacent flowers at ({r},{c}) and ({r+dr},{c+dc})"

print("Symmetry: OK, Isolation: OK")

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

print(f"Across count: {len(across)}")
print("Across lengths:", [l for _,_,l in across])
print(f"Down count: {len(down)}")
print("Down lengths:", [l for _,_,l in down])

covered = set()
for r, c, l in across:
    for i in range(l): covered.add((r, c + i))
for r, c, l in down:
    for i in range(l): covered.add((r + i, c))
total_white = sum(row.count(True) for row in mask)
print(f"Total white: {total_white}, covered: {len(covered)}")

# Find components
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

print(f"Components ({len(components)}): {[len(c) for c in components]}")
for idx, comp in enumerate(components):
    # Which across and down slots belong to this component?
    cset = set(comp)
    ca = [s for s in across if (s[0], s[1]) in cset]
    cd = [s for s in down if (s[0], s[1]) in cset]
    print(f"  Comp {idx} ({len(comp)} cells): {len(ca)} across slots, {len(cd)} down slots")
    print(f"    across: {ca}")
    print(f"    down: {cd}")
