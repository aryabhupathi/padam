
import json
from app.services.lexicon import LexiconManager
from app.core.grapheme import split_into_syllables

lex = LexiconManager()
idx = lex.index

# Let's inspect words of length 3:
w3 = idx.words_by_length.get(3, [])
w4 = idx.words_by_length.get(4, [])
w2 = idx.words_by_length.get(2, [])

# Map of words by length and syllable positions:
# syl_pos_map[(length, pos, syl)] = [word_obj, ...]
syl_map = {}
for word, syls, clue in w2 + w3 + w4:
    l = len(syls)
    for pos, syl in enumerate(syls):
        key = (l, pos, syl)
        if key not in syl_map: syl_map[key] = []
        syl_map[key].append((word, syls, clue))

print(f'Total w2: {len(w2)}, w3: {len(w3)}, w4: {len(w4)}')
print('Syl map keys:', len(syl_map))
