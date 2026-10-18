# -*- coding: utf-8 -*-
import sys
import os
import json
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

N = 12

# Dividing border flowers between quadrants:
# Row 5 (odd cols) & Row 6 (even cols)
# Col 5 (odd rows) & Col 6 (even rows)
border_flowers = set()
for c in [1, 3, 5, 7, 9, 11]:
    border_flowers.add((5, c))
for c in [0, 2, 4, 6, 8, 10]:
    border_flowers.add((6, c))
for r in [1, 3, 5, 7, 9, 11]:
    border_flowers.add((r, 5))
for r in [0, 2, 4, 6, 8, 10]:
    border_flowers.add((r, 6))

print(f"Border flowers count: {len(border_flowers)}")

# Verify no two border flowers are adjacent
clumps = []
for r, c in border_flowers:
    for dr, dc in [(0, 1), (1, 0)]:
        if (r + dr, c + dc) in border_flowers:
            clumps.append(((r, c), (r + dr, c + dc)))
print(f"Border flower clumps: {len(clumps)}")
assert len(clumps) == 0, f"Clumps found: {clumps}"

# Verify 180-deg rotational symmetry of border flowers:
for r, c in border_flowers:
    r2, c2 = N - 1 - r, N - 1 - c
    assert (r2, c2) in border_flowers, f"Asymmetry at ({r},{c})"
print("Border flowers have 100% 180-degree rotational symmetry!")
