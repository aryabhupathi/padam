# -*- coding: utf-8 -*-
import sys
import os

N = 9
# Center cross flowers
cross_flowers = [
    (4, 1), (4, 3), (4, 5), (4, 7),
    (1, 4), (3, 4), (5, 4), (7, 4)
]

# Check adjacency of cross flowers
for i, f1 in enumerate(cross_flowers):
    for j, f2 in enumerate(cross_flowers):
        if i < j:
            dr = abs(f1[0] - f2[0])
            dc = abs(f1[1] - f2[1])
            assert dr + dc > 1, f"Adjacent: {f1} and {f2}"

print("Cross flowers are 100% isolated!")
