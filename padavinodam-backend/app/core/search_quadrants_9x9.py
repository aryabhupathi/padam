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

N = 9
# Base cross flowers
cross_flowers = [
    (4, 1), (4, 3), (4, 5), (4, 7),
    (1, 4), (3, 4), (5, 4), (7, 4)
]

# We can also test without some cross flowers or with them
# Candidate flowers inside top-left quadrant (rows 0..3, cols 0..3)
quad_cells = [(r, c) for r in range(4) for c in range(4) if (r, c) not in [(0, 0)]]

# Symmetric pairs within top-left and bottom-right:
# If (r, c) is in top-left, its 180-deg partner (8-r, 8-c) is in bottom-right!
print(f"Candidate quadrant cells: {len(quad_cells)}")

def eval_mask(fset):
    # Isolation check
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
    covered = set()
    for r, c, l in across:
        for i in range(l): covered.add((r, c + i))
    for r, c, l in down:
        for i in range(l): covered.add((r + i, c))
    white_cells = sum(row.count(True) for row in mask)
    if len(covered) != white_cells: return None
    if max(l for _,_,l in across) > 5 or max(l for _,_,l in down) > 5: return None
    return mask

# Test combinations of flowers in quad_cells (pairs) + combinations of cross flowers
print("Searching for quadrant-based 20x20 masks...")
found = 0
for num_q in [2, 3, 1, 4]:
    for q_comb in itertools.combinations(quad_cells, num_q):
        # Top-left and bottom-right
        fl = set()
        for r, c in q_comb:
            fl.add((r, c))
            fl.add((N - 1 - r, N - 1 - c))
            # Also top-right and bottom-left for 4-fold or 180-symmetry?
            # 180-symmetry: (r, 8-c) has partner (8-r, c)
            fl.add((r, N - 1 - c))
            fl.add((N - 1 - r, c))
            
        # Test with subsets of cross flowers
        for cross_sub in [
            cross_flowers,
            [(4, 1), (4, 7), (1, 4), (7, 4)],
            [(4, 2), (4, 6), (2, 4), (6, 4)],
            [(4, 3), (4, 5), (3, 4), (5, 4)],
            [(4, 4)],
            [(4, 4), (4, 1), (4, 7), (1, 4), (7, 4)],
            [(4, 4), (4, 2), (4, 6), (2, 4), (6, 4)],
            []
        ]:
            total_fl = fl | set(cross_sub)
            mask = eval_mask(total_fl)
            if mask:
                found += 1
                white = sum(row.count(True) for row in mask)
                print(f"\n[Found #{found}] Mask with {len(total_fl)} flowers ({white/81*100:.1f}% letters):")
                for row in mask:
                    print(' '.join('.' if cell else '*' for cell in row))
                # Test CSP solve!
                csp = CrosswordCSP(N, mask, words_by_len)
                sol = csp.solve(max_seconds=1.5)
                if sol:
                    ok, errs = verify_puzzle(sol)
                    if ok:
                        print("SUCCESS! SOLVED 9x9!")
                        import json
                        out_b = os.path.join(os.path.dirname(__file__), "verified_9x9.json")
                        out_f = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", "..", "padavinodam-frontend", "src", "data", "verified_9x9.json"))
                        with open(out_b, 'w', encoding='utf-8') as f:
                            json.dump(sol, f, ensure_ascii=False, indent=2)
                        with open(out_f, 'w', encoding='utf-8') as f:
                            json.dump(sol, f, ensure_ascii=False, indent=2)
                        print(f"Saved to {out_b} and {out_f}!")
                        sys.exit(0)
                else:
                    print("CSP timeout on this mask.")
                if found >= 25:
                    break
        if found >= 25:
            break

print("Quadrants search finished.")
