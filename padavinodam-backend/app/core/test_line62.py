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

# Extract slots
csp = CrosswordCSP(N, mask, words_by_len)
print(f"Across slots: {len(csp.across_slots)}, Down slots: {len(csp.down_slots)}")
print(f"Across lens: {[s['length'] for s in csp.across_slots]}")
print(f"Down lens: {[s['length'] for s in csp.down_slots]}")

t0 = time.time()
sol = csp.solve(max_seconds=5.0)
el = time.time() - t0
print(f"CSP solved in {el*1000:.1f}ms: {sol is not None}")
if sol:
    ok, errs = verify_puzzle(sol)
    print(f"Verified: {ok}, errs: {errs}")
    if ok:
        out_b = os.path.join(os.path.dirname(__file__), "verified_9x9.json")
        out_f = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", "..", "padavinodam-frontend", "src", "data", "verified_9x9.json"))
        with open(out_b, 'w', encoding='utf-8') as f:
            json.dump(sol, f, ensure_ascii=False, indent=2)
        with open(out_f, 'w', encoding='utf-8') as f:
            json.dump(sol, f, ensure_ascii=False, indent=2)
        print("SAVED 9x9!")
