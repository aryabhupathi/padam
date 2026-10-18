# -*- coding: utf-8 -*-
import sys
import os
import json
import random
import time
import math

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
pairs = []
for r in range(N):
    for c in range(N):
        r2, c2 = N - 1 - r, N - 1 - c
        if (r, c) < (r2, c2):
            pairs.append(((r, c), (r2, c2)))

print(f"12x12 symmetric pairs: {len(pairs)}")

def cost(current):
    flowers = set()
    for p in current: flowers.update(p)
    adj = 0
    for r, c in flowers:
        for dr, dc in [(0, 1), (1, 0)]:
            if (r + dr, c + dc) in flowers: adj += 1
            
    mask = [[(r, c) not in flowers for c in range(N)] for r in range(N)]
    across = []
    for r in range(N):
        c = 0
        while c < N:
            if mask[r][c]:
                st = c
                while c < N and mask[r][c]: c += 1
                if c - st >= 2: across.append((r, st, c - st))
            else: c += 1
    down = []
    for c in range(N):
        r = 0
        while r < N:
            if mask[r][c]:
                st = r
                while r < N and mask[r][c]: r += 1
                if r - st >= 2: down.append((st, c, r - st))
            else: r += 1
            
    covered = set()
    for r, c, l in across:
        for i in range(l): covered.add((r, c + i))
    for r, c, l in down:
        for i in range(l): covered.add((r + i, c))
    white = sum(row.count(True) for row in mask)
    unc = white - len(covered)
    lens = [l for _,_,l in across] + [l for _,_,l in down]
    max_len = max(lens) if lens else 12
    len_p = max(0, max_len - 5)
    
    # 2x2 blocks
    b2x2 = 0
    for r in range(N - 1):
        for c in range(N - 1):
            if mask[r][c] and mask[r+1][c] and mask[r][c+1] and mask[r+1][c+1]:
                b2x2 += 1
                
    # Target: 35 or 36 across, 35 or 36 down
    diff_a = min(abs(len(across) - 35), abs(len(across) - 36))
    diff_d = min(abs(len(down) - 35), abs(len(down) - 36))
    
    c_val = diff_a * 15 + diff_d * 15 + adj * 40 + unc * 40 + len_p * 15 + b2x2 * 3
    return c_val, adj, b2x2, len(across), len(down), flowers, mask

def run():
    print("Searching for 12x12 mask with >= 35 across and >= 35 down...")
    random.seed(42)
    candidates_tested = 0
    start_time = time.time()
    
    for restart in range(400):
        k = random.randint(12, 16)
        current = random.sample(pairs, k)
        c_val, adj, b2x2, na, nd, flowers, mask = cost(current)
        T = 8.0
        while T > 0.1:
            for step in range(80):
                if adj == 0 and na >= 35 and nd >= 35 and b2x2 <= 15:
                    candidates_tested += 1
                    white = sum(row.count(True) for row in mask)
                    pct = white / 144 * 100
                    print(f"\n[12x12 Candidate #{candidates_tested}] na={na}, nd={nd}, flowers={len(flowers)} ({pct:.1f}% letters), b2x2={b2x2}")
                    for row in mask:
                        print(' '.join('.' if cell else '*' for cell in row))
                    csp = CrosswordCSP(N, mask, words_by_len)
                    sol = csp.solve(max_seconds=2.5)
                    if sol:
                        ok, errs = verify_puzzle(sol)
                        if ok:
                            print("🎉🎉🎉 12x12 HARD PUZZLE SOLVED AND VERIFIED! 🎉🎉🎉")
                            out_b = os.path.join(os.path.dirname(__file__), "verified_12x12.json")
                            out_f = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", "..", "padavinodam-frontend", "src", "data", "verified_12x12.json"))
                            with open(out_b, 'w', encoding='utf-8') as f:
                                json.dump(sol, f, ensure_ascii=False, indent=2)
                            with open(out_f, 'w', encoding='utf-8') as f:
                                json.dump(sol, f, ensure_ascii=False, indent=2)
                            print(f"Saved to {out_b} and {out_f}!")
                            return True
                        else:
                            print(f"Verification errors: {errs}")
                    else:
                        print("CSP timed out on this mask, continuing...")
                    c_val = 999
                    break
                    
                nxt = list(current)
                move = random.choice(['swap', 'add', 'remove'])
                if move == 'swap' and len(nxt) > 0:
                    idx = random.randrange(len(nxt))
                    rem = [p for p in pairs if p not in nxt]
                    if rem: nxt[idx] = random.choice(rem)
                elif move == 'add' and len(nxt) < 20:
                    rem = [p for p in pairs if p not in nxt]
                    if rem: nxt.append(random.choice(rem))
                elif move == 'remove' and len(nxt) > 10:
                    nxt.pop(random.randrange(len(nxt)))
                    
                nc, nadj, nb2x2, nna, nnd, nflowers, nmask = cost(nxt)
                if nc < c_val or random.random() < math.exp((c_val - nc) / T):
                    current = nxt
                    c_val, adj, b2x2, na, nd, flowers, mask = nc, nadj, nb2x2, nna, nnd, nflowers, nmask
            T *= 0.88
            
    print("Done search.")
    return False

if __name__ == "__main__":
    run()
