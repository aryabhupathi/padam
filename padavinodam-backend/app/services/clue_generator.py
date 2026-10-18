"""
Dynamic Clue Generator Service
Uses Google Gemini API to generate witty, Babu/Eenadu-style Telugu clues
with automatic fallback to curated lexicon definitions.
"""

import os
import json
from typing import Dict, List, Optional

class ClueGeneratorService:
    def __init__(self, api_key: Optional[str] = None):
        self.api_key = api_key or os.getenv("GEMINI_API_KEY")
        self.client = None
        self.cache: Dict[str, str] = {}

        if self.api_key:
            try:
                from google import genai
                self.client = genai.Client(api_key=self.api_key)
            except Exception as e:
                print(f"Warning: Could not initialize Gemini Client: {e}")

    def enrich_puzzle_clues(self, puzzle: Dict) -> Dict:
        """
        Enriches all Across and Down clues in the puzzle with Gemini-generated
        Eenadu Padavinodam-style clues.
        """
        if not self.client:
            return puzzle

        words_to_query = []
        for c in puzzle["clues"]["across"] + puzzle["clues"]["down"]:
            word = c["word"]
            if word not in self.cache:
                words_to_query.append((word, c["length"], c["clue"]))

        if not words_to_query:
            self._apply_cache(puzzle)
            return puzzle

        prompt = (
            "You are a master puzzle creator for Eenadu Sunday Telugu Crossword (పదవినోదం), "
            "famous for witty, clever, and literary clues in the style of legendary cartoonist 'Babu'.\n"
            "Generate authentic, clever, humorous, or mythological clues for the following Telugu words.\n"
            "Each clue must be in pure Telugu script and under 15 words.\n\n"
            "Words:\n"
        )
        for w, l, defn in words_to_query:
            prompt += f"- {w} ({l} అక్షరాలు): [ప్రస్తుత అర్థం: {defn}]\n"

        prompt += (
            "\nReturn your answer ONLY as a valid JSON object mapping each word to its new witty clue, like:\n"
            "{\n"
            '  "పదవినోదం": "ఆదివారం కాఫీతో పాటు మెదడుకు పదును పెట్టే అక్షరాల ఆట",\n'
            '  "ఈనాడు": "రామోజీ కలం నుంచి వెలువడిన వార్తా వసంతం"\n'
            "}"
        )

        try:
            response = self.client.models.generate_content(
                model="gemini-2.0-flash",
                contents=prompt
            )
            text = response.text.strip()
            # Clean possible markdown wrapping
            if text.startswith("```"):
                text = text.split("```")[1]
                if text.startswith("json"):
                    text = text[4:]
            data = json.loads(text.strip())
            for word, new_clue in data.items():
                if new_clue and isinstance(new_clue, str):
                    self.cache[word] = new_clue
        except Exception as e:
            print(f"Notice: Gemini clue generation failed or timed out ({e}). Using curated fallback clues.")

        self._apply_cache(puzzle)
        return puzzle

    def _apply_cache(self, puzzle: Dict):
        for c in puzzle["clues"]["across"] + puzzle["clues"]["down"]:
            if c["word"] in self.cache:
                c["clue"] = self.cache[c["word"]]
                c["is_ai_generated"] = True
