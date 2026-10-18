# ఈనాడు ఆదివారం పదవినోదం - Backend & Dynamic Generation Engine

A production-grade Python (FastAPI) backend for generating and solving authentic, 100% dynamic Telugu crossword puzzles (*ఈనాడు పదవినోదం*).

---

## 🌟 Key Features

1. **Telugu Grapheme Cluster Engine (`app/core/grapheme.py`)**
   - Precise Unicode syllabification for complex conjuncts (*సంయుక్తాక్షరాలు, ద్విత్వాక్షరాలు, గుణింతాలు*).
   - Treats multi-codepoint graphemes (e.g., `శ్రీ`, `కృ`, `ష్ణు`, `ల్యా`) as exact single crossword cells.

2. **Syllable Pattern Indexer (`app/core/trie.py`)**
   - Inverted positional index: `(length, pos, syllable) -> set(words)`.
   - Microsecond intersection queries for arbitrary patterns (e.g. `[None, 'ద', None]`).

3. **Dynamic Crossword Synthesis Engine (`app/core/generator.py`)**
   - Generates zero-collision, interlocking Telugu crosswords procedurally on every request.
   - Assigns official crossword clue numbers (scanning row-by-row, left-to-right).
   - Guarantees zero duplicate words in a puzzle.

4. **Curated Telugu Lexicon (`app/data/telugu_lexicon.json`)**
   - 250+ culturally rich words across literature, mythology, nature, and geography.

5. **AI Clue Enrichment (`app/services/clue_generator.py`)**
   - Integrates with Google Gemini 2.0 Flash to generate witty, Babu-style crossword clues.
   - Automatic fallback to verified dictionary definitions.

6. **FastAPI Endpoints (`app/main.py`)**
   - `GET /api/puzzle/generate?size=5&difficulty=medium`
   - `GET /api/puzzle/daily` (Deterministic daily challenge)
   - `POST /api/puzzle/verify` (Grid verification & celebratory Telugu feedback)

---

## 🚀 Quickstart

### 1. Run the Server
```bash
uvicorn app.main:app --reload --port 8000
```

### 2. Interactive API Documentation
Open your browser to:
- **Swagger UI:** `http://localhost:8000/docs`
- **ReDoc:** `http://localhost:8000/redoc`

---

## 🧪 Running Automated Tests
```bash
python tests/test_grapheme.py
python tests/test_generator.py
python tests/test_api.py
```
