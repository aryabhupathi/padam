"""
Telugu Syllable Pattern Indexer
Provides instant constraint-based lookup for crossword word placement.
Supports arbitrary positional syllable constraints (e.g., [None, 'ద', None]).
"""

from typing import List, Optional, Set, Dict, Tuple
from collections import defaultdict

class SyllablePatternIndex:
    def __init__(self):
        # words_by_length[length] = list of (word_str, syllables_list, clue_str)
        self.words_by_length: Dict[int, List[Tuple[str, List[str], str]]] = defaultdict(list)
        # index[(length, pos, syllable)] = set of word indices in words_by_length[length]
        self.pos_index: Dict[Tuple[int, int, str], Set[int]] = defaultdict(set)
        self.all_words: Set[str] = set()

    def add_word(self, word: str, syllables: List[str], clue: str = ""):
        """Adds a tokenized word to the index."""
        if word in self.all_words:
            return
        
        length = len(syllables)
        if length == 0:
            return

        self.all_words.add(word)
        word_idx = len(self.words_by_length[length])
        self.words_by_length[length].append((word, syllables, clue))

        # Index each position's syllable
        for pos, syl in enumerate(syllables):
            self.pos_index[(length, pos, syl)].add(word_idx)

    def find_matching_words(self, pattern: List[Optional[str]]) -> List[Tuple[str, List[str], str]]:
        """
        Finds all words of length len(pattern) matching the constraints.
        pattern: list where each element is either a Telugu syllable string or None (unconstrained).
        Example: [None, 'ద', None] -> finds 3-syllable words having 'ద' in the middle.
        """
        length = len(pattern)
        if length not in self.words_by_length:
            return []

        # Find all constrained positions
        constraints = [(pos, syl) for pos, syl in enumerate(pattern) if syl is not None]

        # If no constraints, return all words of this length
        if not constraints:
            return list(self.words_by_length[length])

        # Intersect candidate sets for each constraint
        candidate_indices: Optional[Set[int]] = None

        for pos, syl in constraints:
            key = (length, pos, syl)
            matching = self.pos_index.get(key, set())
            if candidate_indices is None:
                candidate_indices = set(matching)
            else:
                candidate_indices &= matching
            
            # Fast abort if intersection becomes empty
            if not candidate_indices:
                return []

        word_list = self.words_by_length[length]
        return [word_list[idx] for idx in candidate_indices]

    def count_matches(self, pattern: List[Optional[str]]) -> int:
        """Quickly counts how many words can satisfy this pattern without allocating full list."""
        length = len(pattern)
        if length not in self.words_by_length:
            return 0

        constraints = [(pos, syl) for pos, syl in enumerate(pattern) if syl is not None]
        if not constraints:
            return len(self.words_by_length[length])

        candidate_indices: Optional[Set[int]] = None
        for pos, syl in constraints:
            matching = self.pos_index.get((length, pos, syl), set())
            if candidate_indices is None:
                candidate_indices = set(matching)
            else:
                candidate_indices &= matching
            if not candidate_indices:
                return 0

        return len(candidate_indices)
