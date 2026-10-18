# -*- coding: utf-8 -*-
import sys
import os
import time

N = 9
# Collect all cells where (r + c) % 2 == 0
even_cells = [(r, c) for r in range(N) for c in range(N) if (r + c) % 2 == 0]
print(f"Total even cells: {len(even_cells)}")

# Symmetric pairs of even cells
even_pairs = []
for r, c in even_cells:
    r2, c2 = N - 1 - r, N - 1 - c
    if (r, c) < (r2, c2):
        even_pairs.append(((r, c), (r2, c2)))
    elif (r, c) == (r2, c2):
        even_pairs.append(((r, c),))

print(f"Total symmetric even pairs: {len(even_pairs)}")
