# -*- coding: utf-8 -*-
import sys
import os
import random
import time
import math

N = 12
pairs = []
for r in range(N):
    for c in range(N):
        r2, c2 = N - 1 - r, N - 1 - c
        if (r, c) < (r2, c2):
            pairs.append(((r, c), (r2, c2)))

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
    
    b2x2 = 0
    for r in range(N - 1):
        for c in range(N - 1):
            if mask[r][c] and mask[r+1][c] and mask[r][c+1] and mask[r+1][c+1]:
                b2x2 += 1
                
    diff_a = min(abs(len(across) - 35), abs(len(across) - 36))
    diff_d = min(abs(len(down) - 35), abs(len(down) - 36))
    
    # Heavily penalize b2x2!
    c_val = diff_a * 20 + diff_d * 20 + adj * 50 + unc * 50 + len_p * 20 + b2x2 * 10
    return c_val, adj, b2x2, len(across), len(down), flowers, mask

print("Searching for 12x12 mask with low b2x2...")
random.seed(42)
best_b2x2 = 99

for restart in range(100):
    k = random.randint(14, 20)
    current = random.sample(pairs, k)
    c_val, adj, b2x2, na, nd, flowers, mask = cost(current)
    T = 8.0
    while T > 0.05:
        for step in range(80):
            if adj == 0 and na >= 35 and nd >= 35 and b2x2 < best_b2x2:
                best_b2x2 = b2x2
                print(f"New best b2x2 = {b2x2} (na={na}, nd={nd}, flowers={len(flowers)}, letters={sum(row.count(True) for row in mask)/144*100:.1f}%)")
                if b2x2 <= 4:
                    print("EXCELLENT 12x12 MASK FOUND!")
                    for row in mask:
                        print(' '.join('.' if cell else '*' for cell in row))
                    sys.exit(0)
            nxt = list(current)
            move = random.choice(['swap', 'add', 'remove'])
            if move == 'swap' and len(nxt) > 0:
                idx = random.randrange(len(nxt))
                rem = [p for p in pairs if p not in nxt]
                if rem: nxt[idx] = random.choice(rem)
            elif move == 'add' and len(nxt) < 24:
                rem = [p for p in pairs if p not in nxt]
                if rem: nxt.append(random.choice(rem))
            elif move == 'remove' and len(nxt) > 12:
                nxt.pop(random.randrange(len(nxt)))
                
            nc, nadj, nb2x2, nna, nnd, nflowers, nmask = cost(nxt)
            if nc < c_val or random.random() < math.exp((c_val - nc) / T):
                current = nxt
                c_val, adj, b2x2, na, nd, flowers, mask = nc, nadj, nb2x2, nna, nnd, nflowers, nmask
        T *= 0.88
