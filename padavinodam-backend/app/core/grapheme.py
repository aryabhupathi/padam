"""
Telugu Grapheme Cluster & Syllable Engine
Handles precise Unicode segmentation for Telugu crossword puzzles (పదవినోదం).
"""

import re
from typing import List

# Telugu Unicode Ranges:
# Vowels: \u0C05-\u0C14
# Consonants: \u0C15-\u0C39\u0C58-\u0C5A
# Virama (Polly/Halant): \u0C4D
# Matras (Gunintham signs): \u0C3E-\u0C4C\u0C55\u0C56
# Modifiers (Sunna/Visarga): \u0C01-\u0C03

TELUGU_AKSHARA_PATTERN = re.compile(
    r'(?:'
    r'[\u0C05-\u0C14][\u0C01-\u0C03]?'  # Independent vowel + optional sunna/visarga
    r'|'
    r'[\u0C15-\u0C39\u0C58-\u0C5A]'     # Base consonant
    r'(?:\u0C4D[\u0C15-\u0C39\u0C58-\u0C5A])*'  # Zero or more conjunct consonants (vatthulu)
    r'[\u0C3E-\u0C4C\u0C55\u0C56]?'     # Optional vowel sign (matra)
    r'[\u0C01-\u0C03]?'                 # Optional anusvara/visarga (sunna)
    r'(?:\u0C4D)?'                      # Optional trailing virama (pollu like న్)
    r')'
)

def split_into_syllables(text: str) -> List[str]:
    """
    Splits a Telugu word or phrase into its constituent crossword syllables (అక్షరాలు).
    Example:
      'పదవినోదం' -> ['ప', 'ద', 'వి', 'నో', 'దం']
      'శ్రీకృష్ణుడు' -> ['శ్రీ', 'కృ', 'ష్ణు', 'డు']
      'కల్యాణం' -> ['క', 'ల్యా', 'ణం']
    """
    if not text:
        return []
    # Normalize spaces
    clean_text = text.strip()
    matches = TELUGU_AKSHARA_PATTERN.findall(clean_text)
    return [m for m in matches if m.strip()]

def get_syllable_count(text: str) -> int:
    """Returns number of crossword cells this word will occupy."""
    return len(split_into_syllables(text))

def is_valid_telugu_word(text: str) -> bool:
    """Verifies if the word consists purely of valid Telugu syllables."""
    syllables = split_into_syllables(text)
    rejoined = "".join(syllables)
    return len(syllables) > 0 and rejoined == text.strip()
