"""
Telugu Lexicon Service
Loads, tokenizes, and caches Telugu words for dynamic crossword generation.
"""

import json
import os
from typing import List, Dict, Optional
from app.core.grapheme import split_into_syllables, is_valid_telugu_word
from app.core.trie import SyllablePatternIndex

DEFAULT_DATA_PATH = os.path.join(os.path.dirname(__file__), "..", "data", "telugu_lexicon.json")

class LexiconManager:
    def __init__(self, data_path: str = DEFAULT_DATA_PATH):
        self.data_path = data_path
        self.index = SyllablePatternIndex()
        self.word_clues: Dict[str, str] = {}
        self.word_categories: Dict[str, str] = {}
        self._load_lexicon()

    def _load_lexicon(self):
        if not os.path.exists(self.data_path):
            return

        with open(self.data_path, "r", encoding="utf-8") as f:
            data = json.load(f)

        for entry in data:
            word = entry.get("word", "").strip()
            clue = entry.get("clue", "").strip()
            category = entry.get("category", "సాధారణం")

            if not word or not is_valid_telugu_word(word):
                continue

            syllables = split_into_syllables(word)
            self.index.add_word(word, syllables, clue)
            self.word_clues[word] = clue
            self.word_categories[word] = category

    def get_clue(self, word: str) -> str:
        return self.word_clues.get(word, "")

    def get_category(self, word: str) -> str:
        return self.word_categories.get(word, "సాధారణం")

    def total_words(self) -> int:
        return len(self.index.all_words)
