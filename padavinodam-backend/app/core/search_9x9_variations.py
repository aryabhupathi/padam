# -*- coding: utf-8 -*-
import sys
import os
import itertools
import copy

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..')))
from app.core.authentic_puzzles import FLOWERS_9X9
from app.services.lexicon import LexiconManager
from app.core.crossword_csp import CrosswordCSP
from app.core.verify_puzzle_integrity import verify_puzzle

sys.stdout.reconfigure(encoding='utf-8')

N = 9
base_flowers = set(FLOWERS_9X9)

lex = LexiconManager()
words_by_len = {}
for L, wlist in lex.index.words_by_length.items():
    words_by_len[L] = [(w, syls, clue, lex.get_category(w)) for w, syls, clue in wlist]

# All symmetric pairs in 9x9
pairs = []
for r in range(N):
    for c in range(N):
        r2, c2 = N - 1 - r, N - 1 - c
        if (r, c) < (r2, c2):
            pairs.append(((r, c), (r2, c2)))
        elif (r, c) == (r2, c2):
            pairs.append(((r, c),))

# Symmetric pairs in base_flowers
base_pairs = []
seen = set()
for r, c in base_flowers:
    if (r, c) not in seen:
        r2, c2 = N - 1 - r, N - 1 - c
        if (r, c) == (r2, c2):
            base_pairs.append(((r, c),))
        else:
            base_pairs.append(((r, c), (r2, c2)))
        seen.add((r, c))
        seen.add((r2, c2))

print(f"Base flowers has {len(base_pairs)} symmetric pairs.")

def test_mask(fset):
    # Adjacency check
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
                st = c
                while c < N and mask[r][c]: c += 1
                if c - st >= 2: across.append((r, st, c - st))
            else: c += 1
    if len(across) != 20: return None
    down = []
    for c in range(N):
        r = 0
        while r < N:
            if mask[r][c]:
                st = r
                while r < N and mask[r][c]: r += 1
                if r - st >= 2: down.append((st, c, r - start if 'start' in locals() else st, c)) # wait
            else: r += 1

def eval_fset(fset):
    for r, c in fset:
        for dr, dc in [(0, 1), (1, 0)]:
            if (r + dr, c + dc) in fset: return None
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
    if len(across) != 20: return None
    down = []
    for c in range(N):
        r = 0
        while r < N:
            if mask[r][c]:
                st = r
                while r < N and mask[r][c]: r += 1
                if r - st >= 2: down.append((st, c, r - st))
            else: r += 1
    if len(down) != 20: return None
    covered = set()
    for r, c, l in across:
        for i in range(l): covered.add((r, c + i))
    for r, c, l in down:
        for i in range(l): covered.add((r + i, c))
    if len(covered) != sum(row.count(True) for row in mask): return None
    if max(l for _,_,l in across) > 5 or max(l for _,_,l in down) > 5: return None
    return mask

print("Searching variations of FLOWERS_9X9 for (20 across, 20 down)...")
found_candidates = []

# Try removing 0, 1, or 2 pairs and adding 1, 2, or 3 pairs
other_pairs = [p for p in pairs if p not in base_pairs]

for rem_count in [0, 1, 2]:
    for rem_comb in itertools.combinations(base_pairs, rem_count):
        cur = set(base_pairs) - set(rem_comb)
        for add_count in [1, 2, 3]:
            for add_comb in itertools.combinations(other_pairs, add_count):
                test_p = cur | set(add_comb)
                fset = set()
                for p in test_p: fset.update(p)
                mask = eval_fset(fset)
                if mask:
                    print(f"FOUND MASK with {len(fset)} flowers ({sum(row.count(True) for row in mask)/81*100:.1f}% letters)!")
                    for row in mask:
                        print(' '.join('.' if cell else '*' for cell in row))
                    csp = CrosswordCSP(N, mask, words_by_len)
                    sol = csp.solve(max_seconds=2.0)
                    if sol:
                        ok, errs = verify_puzzle(sol)
                        if ok:
                            print("🎉 9x9 SOLVED AND VERIFIED!")
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
                            print(f"Verification error: {errs}")
                    else:
                        print("CSP timed out on this candidate.")
