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
    ". . * . . * . . * . . .",
    ". * . . * . * . . . * .",
    "* . . * . . . * . * . *",
    ". . * . . * . . * . . .",
    ". * . . * . . * . . * .",
    "* . . * . * . . . * . .",
    ". . * . . . * . * . . *",
    ". * . . * . . * . . * .",
    ". . . * . . * . . * . .",
    "* . * . * . . . * . . *",
    ". * . . . * . * . . * .",
    ". . . * . . * . . * . ."
]

N = 12
mask = [[c == '.' for c in row.split()] for row in mask_str]

print("Solving 12x12 Match #77 with CSP...")
t0 = time.time()
csp = CrosswordCSP(N, mask, words_by_len)
sol = csp.solve(max_seconds=10.0)
print(f"CSP solved in {time.time()-t0:.2f}s: {sol is not None}")

if sol:
    ok, errs = verify_puzzle(sol)
    print(f"Verification: {ok}, errors: {errs}")
    if ok:
        out_b = os.path.join(os.path.dirname(__file__), "verified_12x12.json")
        out_f = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", "..", "padavinodam-frontend", "src", "data", "verified_12x12.json"))
        with open(out_b, 'w', encoding='utf-8') as f:
            json.dump(sol, f, ensure_ascii=False, indent=2)
        with open(out_f, 'w', encoding='utf-8') as f:
            json.dump(sol, f, ensure_ascii=False, indent=2)
        print(f"Saved to {out_b} and {out_f}!")
        print(f"Across count: {len(sol['clues']['across'])}, Down count: {len(sol['clues']['down'])}")
        white = sum(row.count(True) for row in mask)
        print(f"Letters: {white}/144 ({white/144*100:.1f}%)")
    else:
        print("Verification errors:", errs)
else:
    print("Could not solve Match #77 directly, will run search.")
