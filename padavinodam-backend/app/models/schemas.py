"""
Pydantic Schemas for Telugu Crossword API
"""

from typing import List, Dict, Optional, Tuple, Any
from pydantic import BaseModel, Field

class ClueItem(BaseModel):
    id: str
    number: int
    row: int
    col: int
    length: int
    word: Optional[str] = None
    syllables: Optional[List[str]] = None
    clue: str
    category: str = "సాధారణం"
    is_ai_generated: Optional[bool] = False
    first_syllable: Optional[str] = None
    last_syllable: Optional[str] = None

class CluesGroup(BaseModel):
    across: List[ClueItem]
    down: List[ClueItem]

class PuzzleResponse(BaseModel):
    puzzle_id: str
    size: int
    mask: List[List[bool]]
    numbers: Dict[str, int]
    clues: CluesGroup
    solution: Optional[List[List[Optional[str]]]] = None
    meta: Dict[str, Any]

class VerifyRequest(BaseModel):
    solution: List[List[Optional[str]]]
    user_grid: List[List[Optional[str]]]

class VerifyResponse(BaseModel):
    is_complete: bool
    correct_cells: int
    total_cells: int
    incorrect_cells: List[Tuple[int, int]]
    message: str
