# Build authentic puzzles
import json

# Define the exact 12x12 solution grid
grid_12x12 = [
    ['రా', 'మా', 'య', 'ణం', None, 'క', 'లం', None, 'గో', 'దా', 'వ', 'రి'],
    ['జ', None, 'తి', None, 'మ', 'ళ', 'క', 'రం', None, 'న', None, 'వా'],
    ['స', 'భ', None, 'వ', 'న', None, None, 'గ', 'జం', None, 'జ', 'జు'],
    ['భ', None, 'క', None, 'భా', 'ర', 'తం', 'గ', None, 'స', None, 'లు'],
    [None, 'భా', 'వి', 'కం', None, None, None, None, 'న', 'ల', 'భీ', None],
    ['స', 'ర', None, 'ళ', None, 'రా', 'జ', None, 'వ', None, 'మ', 'న'],
    ['త్యం', 'ణం', None, 'త', None, 'మ', 'న', None, 'త', None, 'నో', 'రం'],
    [None, 'తం', 'తు', 'వు', None, None, None, None, 'క', 'మ', 'లం', None],
    ['పు', None, 'పా', None, 'మ', 'ధు', 'రం', 'గం', None, 'న', None, 'రా'],
    ['స్త', 'కం', None, 'ఆ', 'హా', None, None, 'ధా', 'ర', None, 'గ', 'గం'],
    ['కం', None, 'వ', None, 'ఆ', 'నం', 'దం', 'ర', None, 'గ', None, 'రా'],
    ['భా', 'గ', 'వ', 'తం', None, 'దం', 'డ', None, 'సు', 'మ', 'ధు', 'రం']
]

# Let's verify the grid dimensions and flowers
flowers = [(0,4),(0,7),(1,1),(1,3),(1,8),(1,10),(2,2),(2,5),(2,6),(2,9),(3,1),(3,3),(3,8),(3,10),(4,0),(4,4),(4,5),(4,6),(4,7),(4,11),(5,2),(5,4),(5,7),(5,9),(6,2),(6,4),(6,7),(6,9),(7,0),(7,4),(7,5),(7,6),(7,7),(7,11),(8,1),(8,3),(8,8),(8,10),(9,2),(9,5),(9,6),(9,9),(10,1),(10,3),(10,8),(10,10),(11,4),(11,7)]
fset = set(flowers)

errors = []
for r in range(12):
    for c in range(12):
        is_fl = (r, c) in fset
        val = grid_12x12[r][c]
        if is_fl and val is not None:
            errors.append(f'Expected flower at ({r},{c}), got {val}')
        elif not is_fl and val is None:
            errors.append(f'Expected syllable at ({r},{c}), got None')

print('Flower/playable errors:', len(errors))
if errors:
    print(errors[:5])

across_words = []
down_words = []
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
                w = ''.join([grid_12x12[r][c+i] for i in range(l)])
                across_words.append((cur, w, l))
            if sd:
                l = 0
                while r + l < 12 and (r + l, c) not in fset: l += 1
                w = ''.join([grid_12x12[r+i][c] for i in range(l)])
                down_words.append((cur, w, l))
            cur += 1

with open('app/core/words_extracted.txt', 'w', encoding='utf-8') as wf:
    wf.write('ACROSS:\n')
    for num, w, l in across_words:
        wf.write(f'{num}: {w} ({l})\n')
    wf.write('\nDOWN:\n')
    for num, w, l in down_words:
        wf.write(f'{num}: {w} ({l})\n')

print(f'Successfully extracted {len(across_words)} across and {len(down_words)} down words')
