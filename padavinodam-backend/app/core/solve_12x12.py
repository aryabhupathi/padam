
# 12x12 solver and validator
flowers = [(0,4),(0,7),(1,1),(1,3),(1,8),(1,10),(2,2),(2,5),(2,6),(2,9),(3,1),(3,3),(3,8),(3,10),(4,0),(4,4),(4,5),(4,6),(4,7),(4,11),(5,2),(5,4),(5,7),(5,9),(6,2),(6,4),(6,7),(6,9),(7,0),(7,4),(7,5),(7,6),(7,7),(7,11),(8,1),(8,3),(8,8),(8,10),(9,2),(9,5),(9,6),(9,9),(10,1),(10,3),(10,8),(10,10),(11,4),(11,7)]
fset = set(flowers)

# Check all slots
across_slots = []
down_slots = []
cur = 1
for r in range(12):
    for c in range(12):
        if (r, c) in fset: continue
        sa = (c == 0 or (r, c-1) in fset) and (c + 1 < 12 and (r, c+1) not in fset)
        sd = (r == 0 or (r-1, c) in fset) and (r + 1 < 12 and (r+1, c) not in fset)
        if sa or sd:
            if sa:
                l = 0
                while c + l < 12 and (r, c + l) not in fset: l += 1
                across_slots.append((cur, [(r, c + i) for i in range(l)]))
            if sd:
                l = 0
                while r + l < 12 and (r + l, c) not in fset: l += 1
                down_slots.append((cur, [(r + i, c) for i in range(l)]))
            cur += 1

print(f'Total across: {len(across_slots)}, Total down: {len(down_slots)}')
