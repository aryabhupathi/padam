import os
import sys
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from app.core.grapheme import split_into_syllables, get_syllable_count, is_valid_telugu_word

def test_syllable_segmentation():
    test_cases = [
        ("పదవినోదం", 5, ["ప", "ద", "వి", "నో", "దం"]),
        ("ఈనాడు", 3, ["ఈ", "నా", "డు"]),
        ("ఆనందం", 3, ["ఆ", "నం", "దం"]),
        ("కల్యాణం", 3, ["క", "ల్యా", "ణం"]),
        ("శ్రీకృష్ణుడు", 4, ["శ్రీ", "కృ", "ష్ణు", "డు"]),
        ("నమస్కారం", 4, ["న", "మ", "స్కా", "రం"]),
        ("జ్యోతిష్యశాస్త్రం", 5, ["జ్యో", "తి", "ష్య", "శా", "స్త్రం"])
    ]
    for word, expected_count, expected_tokens in test_cases:
        tokens = split_into_syllables(word)
        assert tokens == expected_tokens, f"Failed for {word}: got {tokens}, expected {expected_tokens}"
        assert get_syllable_count(word) == expected_count
        assert is_valid_telugu_word(word) is True

if __name__ == "__main__":
    test_syllable_segmentation()
    print("All Telugu Grapheme Tests Passed Successfully!")
