# -*- coding: utf-8 -*-
import sys
import os
import json
import itertools

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..')))
from app.services.lexicon import LexiconManager
from app.core.crossword_csp import CrosswordCSP

lex = LexiconManager()
words_by_len = {}
for L, wlist in lex.index.words_by_length.items():
    words_by_len[L] = [(w, syls, clue, lex.get_category(w)) for w, syls, clue in wlist]

N = 7
pairs = []
for r in range(N):
    for c in range(N):
        if (r, c) in [(0,0), (0,6), (6,0), (6,6)]: continue
        r2, c2 = N - 1 - r, N - 1 - c
        if (r, c) < (r2, c2):
            pairs.append(((r, c), (r2, c2)))
        elif (r, c) == (r2, c2):
            pairs.append(((r, c),))

def solve():
    print(f"Searching and solving 7x7 (target: 10 across, 10 down)...")
    solved_puzzle = None
    for k in range(3, 7):
        for comb in itertools.combinations(pairs, k):
            flowers = set()
            for p in comb: flowers.update(p)
            adj = False
            for r, c in flowers:
                for dr, dc in [(-1,0),(1,0),(0,-1),(0,1)]:
                    if (r+dr, c+dc) in flowers: adj = True; break
                if adj: break
            if adj: continue
            
            mask = [[(r, c) not in flowers for c in range(N)] for r in range(N)]
            csp = CrosswordCSP(N, mask, words_by_len)
            if len(csp.across_slots) == 10 and len(csp.down_slots) == 10:
                lens_a = [s['length'] for s in csp.across_slots]
                lens_d = [s['length'] for s in csp.down_slots]
                if max(lens_a) <= 5 and max(lens_d) <= 5:
                    sol = csp.solve(max_seconds=1.2)
                    if sol:
                        print("SUCCESS 7x7 SOLVED!")
                        print("Flowers:", len(flowers))
                        for row in sol['solution']:
                            print(' '.join(cell if cell else '*' for cell in row))
                        print(f"Across clues: {len(sol['clues']['across'])}, Down clues: {len(sol['clues']['down'])}")
                        out_path = os.path.join(os.path.dirname(__file__), "verified_7x7.json")
                        with open(out_path, "w", encoding="utf-8") as f:
                            json.dump(sol, f, ensure_ascii=False, indent=2)
                        print(f"Saved to {out_path}!")
                        return sol
    print("Could not find solution with given candidates")
    return None

if __name__ == "__main__":
    solve()
