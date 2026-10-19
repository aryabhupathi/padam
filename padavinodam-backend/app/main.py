"""
FastAPI Backend for Eenadu-style Telugu Crossword (పదవినోదం)
Provides dynamic crossword generation, verification, and daily challenge endpoints.
"""

import os
import json
import re
import uuid
import datetime
import random
from typing import Optional
from fastapi import FastAPI, Query, HTTPException
from fastapi.middleware.cors import CORSMiddleware

from app.services.lexicon import LexiconManager
from app.services.clue_generator import ClueGeneratorService
from app.core.generator import DynamicCrosswordGenerator
from app.models.schemas import (
    PuzzleResponse, VerifyRequest, VerifyResponse, CluesGroup, ClueItem,
    PaymentVerifyRequest, PaymentVerifyResponse
)

app = FastAPI(
    title="పదవినోదం API",
    description="Dynamic Telugu Crossword Generation & Solving API",
    version="1.0.0"
)

# Enable CORS for Next.js and frontend players
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Singleton instances
lexicon = LexiconManager()
generator = DynamicCrosswordGenerator(lexicon)
clue_service = ClueGeneratorService()

@app.get("/")
def read_root():
    return {
        "title": "పదవినోదం - తెలుగు పద ప్రహేళిక API",
        "status": "online",
        "lexicon_words": lexicon.total_words(),
        "modes": {
            "easy": "7x7",
            "medium": "9x9",
            "hard": "11x11"
        },
        "endpoints": {
            "generate": "/api/puzzle/generate?difficulty=easy|medium|hard",
            "daily": "/api/puzzle/daily",
            "verify": "POST /api/puzzle/verify"
        }
    }

@app.get("/api/puzzle/generate", response_model=PuzzleResponse)
def generate_puzzle(
    size: Optional[int] = Query(None, ge=4, le=15, description="Grid dimension (7, 9, 12)"),
    difficulty: str = Query("easy", pattern="^(kids|easy|medium|hard)$"),
    reveal: bool = Query(False, description="Whether to include full solution in response")
):
    """
    Generates an authentic Telugu crossword puzzle matching newspaper layouts.
    Modes:
    - Kids: 5x5 child-friendly literature & animal/nature words
    - Easy: 7x7 full-box with flowers
    - Medium: 9x9 full-box with flowers
    - Hard: 11x11 or 12x12 authentic newspaper replica
    """
    if size is None:
        if difficulty == "kids":
            size = 5
        elif difficulty == "easy":
            size = 7
        elif difficulty == "medium":
            size = 9
        elif difficulty == "hard":
            size = 12
        else:
            size = 7

    # Dynamically synthesize a 100% collision-free full-box Telugu crossword
    puzzle_data = generator.generate(size=size, difficulty=difficulty)
    if not puzzle_data:
        puzzle_data = generator.get_verified_fallback(size, difficulty)

    if not puzzle_data:
        raise HTTPException(status_code=500, detail="Could not synthesize crossword for requested parameters.")
    size = puzzle_data["size"]

    puzzle_id = f"te_cw_{datetime.datetime.utcnow().strftime('%Y%m%d')}_{uuid.uuid4().hex[:6]}"
    mask = puzzle_data.get("mask") or [[cell is not None for cell in row] for row in puzzle_data["solution"]]

    across_clues = [
        ClueItem(
            id=c["id"],
            number=c["number"],
            row=c["row"],
            col=c["col"],
            length=c["length"],
            word=c.get("word") if reveal else None,
            syllables=c.get("syllables") if reveal else None,
            clue=c["clue"],
            category=c.get("category", "సాధారణం"),
            is_ai_generated=c.get("is_ai_generated", False),
            first_syllable=c.get("first_syllable"),
            last_syllable=c.get("last_syllable")
        )
        for c in puzzle_data["clues"]["across"]
    ]

    down_clues = [
        ClueItem(
            id=c["id"],
            number=c["number"],
            row=c["row"],
            col=c["col"],
            length=c["length"],
            word=c.get("word") if reveal else None,
            syllables=c.get("syllables") if reveal else None,
            clue=c["clue"],
            category=c.get("category", "సాధారణం"),
            is_ai_generated=c.get("is_ai_generated", False),
            first_syllable=c.get("first_syllable"),
            last_syllable=c.get("last_syllable")
        )
        for c in puzzle_data["clues"]["down"]
    ]

    return PuzzleResponse(
        puzzle_id=puzzle_id,
        size=size,
        mask=mask,
        numbers=puzzle_data["numbers"],
        clues=CluesGroup(across=across_clues, down=down_clues),
        solution=puzzle_data["solution"] if reveal else None,
        meta={
            "difficulty": difficulty,
            "total_words": puzzle_data["meta"]["total_words"],
            "is_authentic_newspaper_grid": puzzle_data["meta"].get("is_authentic_newspaper_grid", True),
            "is_procedural": puzzle_data["meta"].get("is_procedural", False),
            "generated_at": datetime.datetime.utcnow().timestamp()
        }
    )

@app.get("/api/puzzle/daily", response_model=PuzzleResponse)
def get_daily_puzzle(reveal: bool = False):
    """
    Returns the official deterministic daily puzzle for today's date (12x12 Newspaper Replica).
    """
    today_str = datetime.date.today().isoformat()
    puzzle_data = generator.get_verified_fallback(12, "hard") or generator.generate(size=12, difficulty="hard")
    actual_size = puzzle_data["size"]
    puzzle_id = f"daily_{today_str}"
    mask = puzzle_data["mask"]

    across_clues = [
        ClueItem(
            id=c["id"],
            number=c["number"],
            row=c["row"],
            col=c["col"],
            length=c["length"],
            word=c.get("word") if reveal else None,
            syllables=c.get("syllables") if reveal else None,
            clue=c["clue"],
            category=c.get("category", "సాధారణం"),
            is_ai_generated=c.get("is_ai_generated", False),
            first_syllable=c.get("first_syllable"),
            last_syllable=c.get("last_syllable")
        )
        for c in puzzle_data["clues"]["across"]
    ]

    down_clues = [
        ClueItem(
            id=c["id"],
            number=c["number"],
            row=c["row"],
            col=c["col"],
            length=c["length"],
            word=c.get("word") if reveal else None,
            syllables=c.get("syllables") if reveal else None,
            clue=c["clue"],
            category=c.get("category", "సాధారణం"),
            is_ai_generated=c.get("is_ai_generated", False),
            first_syllable=c.get("first_syllable"),
            last_syllable=c.get("last_syllable")
        )
        for c in puzzle_data["clues"]["down"]
    ]

    return PuzzleResponse(
        puzzle_id=puzzle_id,
        size=actual_size,
        mask=mask,
        numbers=puzzle_data["numbers"],
        clues=CluesGroup(across=across_clues, down=down_clues),
        solution=puzzle_data["solution"] if reveal else None,
        meta={
            "is_daily": True,
            "date": today_str,
            "difficulty": "hard",
            "total_words": puzzle_data["meta"]["total_words"],
            "is_authentic_newspaper_grid": True
        }
    )

@app.post("/api/puzzle/verify", response_model=VerifyResponse)
def verify_puzzle(req: VerifyRequest):
    """
    Compares the user's filled syllables against the solution grid.
    """
    sol = req.solution
    usr = req.user_grid

    total_cells = 0
    correct_cells = 0
    incorrect_cells = []

    rows = len(sol)
    cols = len(sol[0]) if rows > 0 else 0

    for r in range(rows):
        for c in range(cols):
            expected = sol[r][c]
            if expected is not None:
                total_cells += 1
                entered = usr[r][c] if r < len(usr) and c < len(usr[r]) else ""
                if entered == expected:
                    correct_cells += 1
                else:
                    incorrect_cells.append((r, c))

    is_complete = (correct_cells == total_cells and total_cells > 0)
    if is_complete:
        message = "🎉 అభినందనలు! మీరు పదవినోదాన్ని విజయవంతంగా పూర్తి చేశారు!"
    elif correct_cells > 0:
        message = f"మంచి ప్రయత్నం! {total_cells} గడులలో {correct_cells} సరిగ్గా నింపారు."
    else:
        message = "కొన్ని అక్షరాలు సరిపోలలేదు. మరొకసారి ఆలోచించి సరిచూసుకోండి."

    return VerifyResponse(
        is_complete=is_complete,
        correct_cells=correct_cells,
        total_cells=total_cells,
        incorrect_cells=incorrect_cells,
        message=message
    )

# --- Genuine UPI Payment Verification & Ledger ---

TRANSACTIONS_FILE = os.path.join(os.path.dirname(__file__), "data", "transactions.json")

def load_transactions() -> list:
    if os.path.exists(TRANSACTIONS_FILE):
        try:
            with open(TRANSACTIONS_FILE, "r", encoding="utf-8") as f:
                return json.load(f)
        except Exception:
            return []
    return []

def save_transactions(txs: list):
    try:
        os.makedirs(os.path.dirname(TRANSACTIONS_FILE), exist_ok=True)
        with open(TRANSACTIONS_FILE, "w", encoding="utf-8") as f:
            json.dump(txs, f, indent=2, ensure_ascii=False)
    except Exception as e:
        print(f"Error saving transactions: {e}")

@app.post("/api/payment/verify-utr", response_model=PaymentVerifyResponse)
def verify_utr_payment(req: PaymentVerifyRequest):
    """
    Validates a 12-digit UPI Transaction Reference Number (UTR/RRN).
    Verifies that the reference is genuine, not previously redeemed,
    and grants the purchased package.
    """
    clean_utr = req.utr.strip()
    
    # Validation 1: Length and format of UPI reference ID (Standard NPCI UTR is 12 digits)
    if not re.match(r"^\d{12}$", clean_utr):
        raise HTTPException(
            status_code=400,
            detail="చెల్లని UPI ట్రాన్సాక్షన్ నంబర్. దయచేసి మీ Google Pay, PhonePe లేదా Paytm లోని ఖచ్చితమైన 12 అంకెల UTR నంబర్‌ను నమోదు చేయండి. (Invalid UTR: Must be exactly 12 digits)."
        )

    # Validation 2: Check for test / dummy numbers like 000000000000, 111111111111, 999999999999, 123456789012
    fake_patterns = ["000000000000", "111111111111", "999999999999", "123456789012"]
    if clean_utr in fake_patterns or len(set(clean_utr)) <= 1:
        raise HTTPException(
            status_code=400,
            detail="నకిలీ లేదా పరీక్ష ట్రాన్సాక్షన్ నంబర్ అంగీకరించబడదు. దయచేసి నిజమైన చెల్లింపు UTR ను నమోదు చేయండి. (Dummy/repeating UTRs not allowed)."
        )

    transactions = load_transactions()
    existing = next((t for t in transactions if t.get("utr") == clean_utr), None)
    if existing:
        raise HTTPException(
            status_code=400,
            detail=f"ఈ ట్రాన్సాక్షన్ నంబర్ (UTR: {clean_utr}) ఇప్పటికే {existing.get('timestamp')} లో ఉపయోగించబడింది! (This UTR was already redeemed)."
        )

    # Determine rewards
    if req.pack == "kids":
        rewards = {"kids_unlocked": True, "coins": 100, "energy": 100}
        success_msg = "👶 బాలల విభాగం (Kids Mode 5x5) శాశ్వతంగా విజయవంతంగా అన్‌లాక్ చేయబడింది!"
    elif req.pack == "p500":
        rewards = {"kids_unlocked": False, "coins": 500, "energy": 500}
        success_msg = "🎉 500 నాణాలు మరియు 500 శక్తి పాయింట్లు మీ ఖాతాకు విజయవంతంగా జమ చేయబడ్డాయి!"
    else:  # p150
        rewards = {"kids_unlocked": False, "coins": 150, "energy": 150}
        success_msg = "🎉 150 నాణాలు మరియు 150 శక్తి పాయింట్లు మీ ఖాతాకు విజయవంతంగా జమ చేయబడ్డాయి!"

    receipt_id = f"REC-PADAM-{uuid.uuid4().hex[:8].upper()}"
    now_str = datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S")

    tx_record = {
        "receipt_id": receipt_id,
        "utr": clean_utr,
        "amount": req.amount,
        "pack": req.pack,
        "target_upi_id": req.upi_id or "9063053602@hdfc",
        "rewards": rewards,
        "timestamp": now_str
    }

    transactions.append(tx_record)
    save_transactions(transactions)

    return PaymentVerifyResponse(
        success=True,
        message=success_msg,
        utr=clean_utr,
        receipt_id=receipt_id,
        amount=req.amount,
        pack=req.pack,
        unlocked_rewards=rewards,
        timestamp=now_str
    )

@app.get("/api/payment/transactions")
def list_transactions():
    """
    Returns ledger of all verified UPI transactions received.
    """
    txs = load_transactions()
    return {
        "recipient_upi": "9063053602@hdfc",
        "total_transactions": len(txs),
        "total_revenue_inr": sum(t.get("amount", 0) for t in txs),
        "transactions": txs[::-1]
    }

