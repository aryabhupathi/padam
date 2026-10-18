# -*- coding: utf-8 -*-
import sys
import os
import json

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..')))
from app.services.lexicon import LexiconManager
from app.core.crossword_csp import CrosswordCSP

sys.stdout.reconfigure(encoding='utf-8')

lex = LexiconManager()
words_by_len = {}
for L, wlist in lex.index.words_by_length.items():
    words_by_len[L] = [(w, syls, clue, lex.get_category(w)) for w, syls, clue in wlist]

mask_str = [
    ". . * . . . . * .",
    ". . . * . . * . .",
    "* . . . * . . * .",
    ". * . . . * . . *",
    ". . * . * . * . .",
    "* . . * . . . * .",
    ". * . . * . . . *",
    ". . * . . * . . .",
    ". * . . . . * . ."
]
N = 9
mask = [[cell == '.' for cell in row.split()] for row in mask_str]

# Extract components of cells
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

print(f"Total components: {len(components)}")
for idx, comp in enumerate(components):
    # Create subgrid mask
    submask = [[(r, c) in comp for c in range(N)] for r in range(N)]
    csp = CrosswordCSP(N, submask, words_by_len)
    sol = csp.solve(max_seconds=1.0)
    print(f"Component {idx} ({len(comp)} cells, {len(csp.all_slots)} slots): solvable = {sol is not None}")
    if sol is None:
        for s in csp.all_slots:
            print(f"   {s['direction']} {s['number']}: length={s['length']}, coords={s['coords']}")
