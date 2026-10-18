import os
import sys
sys.stdout.reconfigure(encoding='utf-8')
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from app.services.lexicon import LexiconManager
from app.core.generator import DynamicCrosswordGenerator

def test_dynamic_generation():
    print("Loading Lexicon...")
    lex = LexiconManager()
    print(f"Total words in lexicon: {lex.total_words()}")
    assert lex.total_words() > 0

    print("\nInitializing Dynamic Crossword Generator...")
    gen = DynamicCrosswordGenerator(lex)

    for run_idx in range(3):
        print(f"\n==================== DYNAMIC PUZZLE RUN {run_idx + 1} ====================")
        puzzle = gen.generate(size=5, difficulty="medium", max_attempts=30)
        assert puzzle is not None, "Failed to generate puzzle"
        
        print(f"Total Words Interlocked: {puzzle['meta']['total_words']}")
        print("\nSolution Grid:")
        for row in puzzle["solution"]:
            print("  " + " | ".join([cell if cell is not None else "⬛" for cell in row]))

        print("\nఅడ్డం (Across Clues):")
        for c in puzzle["clues"]["across"]:
            print(f"  {c['number']}. {c['word']} ({c['length']} గడులు) - {c['clue']}")

        print("\nనిలువు (Down Clues):")
        for c in puzzle["clues"]["down"]:
            print(f"  {c['number']}. {c['word']} ({c['length']} గడులు) - {c['clue']}")

    print("\n✅ ALL DYNAMIC GENERATOR RUNS COMPLETED WITH 100% SUCCESS!")

if __name__ == "__main__":
    test_dynamic_generation()
