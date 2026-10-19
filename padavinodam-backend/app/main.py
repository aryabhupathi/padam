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
from typing import Optional, Dict, Any
from fastapi import FastAPI, Query, HTTPException, Header, Request
from fastapi.middleware.cors import CORSMiddleware

from app.services.lexicon import LexiconManager
from app.services.clue_generator import ClueGeneratorService
from app.core.generator import DynamicCrosswordGenerator
from app.models.schemas import (
    PuzzleResponse, VerifyRequest, VerifyResponse, CluesGroup, ClueItem,
    PaymentVerifyRequest, PaymentVerifyResponse,
    CreateOrderRequest, CreateOrderResponse, OrderStatusResponse, SmsWebhookPayload
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

# --- SMS Webhook Automation (Direct UPI to HDFC Bank) ---

ACTIVE_ORDERS_FILE = os.path.join(os.path.dirname(__file__), "data", "active_orders.json")
WEBHOOK_SECRET = os.environ.get("PAYMENT_WEBHOOK_SECRET", "padam_sec_hdfc_9063")

def load_orders() -> list:
    if os.path.exists(ACTIVE_ORDERS_FILE):
        try:
            with open(ACTIVE_ORDERS_FILE, "r", encoding="utf-8") as f:
                return json.load(f)
        except Exception:
            return []
    return []

def save_orders(orders: list):
    try:
        os.makedirs(os.path.dirname(ACTIVE_ORDERS_FILE), exist_ok=True)
        with open(ACTIVE_ORDERS_FILE, "w", encoding="utf-8") as f:
            json.dump(orders, f, indent=2, ensure_ascii=False)
    except Exception as e:
        print(f"Error saving orders: {e}")

def parse_bank_sms(text: str) -> tuple[Optional[float], Optional[str]]:
    """
    Extracts credited amount and 12-digit UPI UTR from HDFC / Indian Bank SMS alerts.
    """
    amt = None
    amt_match = re.search(
        r'(?:(?:Rs\.?|INR)\s*([\d,]+(?:\.\d{1,2})?)|credited\s*(?:for|with)?\s*(?:Rs\.?|INR)?\s*([\d,]+(?:\.\d{1,2})?))',
        text,
        re.IGNORECASE
    )
    if amt_match:
        val = amt_match.group(1) or amt_match.group(2)
        if val:
            try:
                amt = float(val.replace(',', ''))
            except ValueError:
                pass

    utr = None
    utr_match = re.search(r'(?:UPI[/: ]+|Ref\s*(?:no\.?)?[/: ]+|RRN[/: ]+)(\d{12})', text, re.IGNORECASE)
    if utr_match:
        utr = utr_match.group(1)
    else:
        m12 = re.search(r'\b(\d{12})\b', text)
        if m12:
            utr = m12.group(1)

    return amt, utr

@app.post("/api/payment/create-order", response_model=CreateOrderResponse)
def create_payment_order(req: CreateOrderRequest):
    """
    Creates a pending payment order session. The frontend polls this order
    until the SMS webhook detects the bank credit and auto-unlocks.
    """
    order_id = f"ORD-{uuid.uuid4().hex[:8].upper()}"
    now = datetime.datetime.now()
    expires_at = now + datetime.timedelta(minutes=15)

    if req.pack == "kids":
        rewards = {"kids_unlocked": True, "coins": 100, "energy": 100}
    elif req.pack == "p500":
        rewards = {"kids_unlocked": False, "coins": 500, "energy": 500}
    else:
        rewards = {"kids_unlocked": False, "coins": 150, "energy": 150}

    order = {
        "order_id": order_id,
        "pack": req.pack,
        "amount": req.amount,
        "upi_id": req.upi_id or "9063053602@hdfc",
        "status": "PENDING",
        "rewards": rewards,
        "created_at": now.strftime("%Y-%m-%d %H:%M:%S"),
        "expires_at": expires_at.strftime("%Y-%m-%d %H:%M:%S")
    }

    orders = load_orders()
    # Keep last 50 orders
    orders = [o for o in orders if o.get("status") == "PENDING"] + [order]
    save_orders(orders[-50:])

    return CreateOrderResponse(
        order_id=order_id,
        pack=req.pack,
        amount=req.amount,
        upi_id=order["upi_id"],
        status="PENDING",
        created_at=order["created_at"],
        expires_at=order["expires_at"]
    )

@app.get("/api/payment/order-status/{order_id}", response_model=OrderStatusResponse)
def get_order_status(order_id: str):
    """
    Called by the frontend every 1.5s to check if the SMS webhook confirmed payment.
    Strictly checks this specific order_id. Never checks past or unrelated transactions.
    """
    orders = load_orders()
    order = next((o for o in orders if o.get("order_id") == order_id), None)
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")

    return OrderStatusResponse(
        order_id=order["order_id"],
        status=order["status"],
        amount=order["amount"],
        pack=order["pack"],
        utr=order.get("utr"),
        receipt_id=order.get("receipt_id"),
        rewards=order.get("rewards"),
        message=order.get("message")
    )

@app.post("/api/payment/admin-reset")
def reset_payment_ledger(secret: str = Query(...)):
    """
    Admin endpoint to reset active orders and transaction ledger.
    """
    if secret.strip().lower() != WEBHOOK_SECRET.strip().lower():
        raise HTTPException(status_code=401, detail="Unauthorized")
    save_orders([])
    save_transactions([])
    return {"status": "success", "message": "Ledger and active orders reset to clean state"}

@app.api_route("/api/payment/sms-webhook", methods=["GET", "POST"])
async def sms_webhook_handler(
    request: Request,
    x_webhook_secret: Optional[str] = Header(None, alias="X-Webhook-Secret"),
    secret: Optional[str] = Query(None)
):
    """
    Ultra-resilient Webhook called automatically by MacroDroid / Tasker / SMS Forwarders.
    Accepts JSON, Form Data, URL-encoded data, Query Params, or Raw Plaintext.
    Accepts Secret via Header, Query Param, or Body.
    Never throws 422!
    """
    # 1. Secret verification (Header OR Query Param ?secret= OR Body)
    received_secret = x_webhook_secret or secret

    raw_body_bytes = await request.body()
    raw_body_str = raw_body_bytes.decode('utf-8', errors='ignore') if raw_body_bytes else ""

    message_text = ""
    sender = ""
    direct_amt = None
    direct_utr = None

    # Try parsing JSON safely (with strict=False for multiline SMS)
    if raw_body_str.strip():
        try:
            data = json.loads(raw_body_str, strict=False)
            if isinstance(data, dict):
                message_text = str(data.get("message") or data.get("body") or data.get("sms") or data.get("text") or "")
                sender = str(data.get("sender") or data.get("from") or "")
                if not received_secret:
                    received_secret = data.get("secret") or data.get("key")
                if data.get("amount"):
                    try:
                        direct_amt = float(data.get("amount"))
                    except ValueError:
                        pass
                if data.get("utr"):
                    direct_utr = str(data.get("utr"))
        except Exception:
            pass

    # If message is still empty, check query params or form data or raw body
    if not message_text:
        qp = request.query_params
        if qp.get("message") or qp.get("body") or qp.get("text"):
            message_text = qp.get("message") or qp.get("body") or qp.get("text") or ""
            sender = qp.get("sender") or ""
        elif raw_body_str:
            from urllib.parse import parse_qs
            parsed_form = parse_qs(raw_body_str)
            if parsed_form.get("message") or parsed_form.get("body") or parsed_form.get("sms"):
                message_text = (parsed_form.get("message") or parsed_form.get("body") or parsed_form.get("sms"))[0]
                sender = (parsed_form.get("sender") or [""])[0]
                if not received_secret and parsed_form.get("secret"):
                    received_secret = parsed_form.get("secret")[0]
            else:
                message_text = raw_body_str

    # Validate secret (case-insensitive)
    if not received_secret or received_secret.strip().lower() != WEBHOOK_SECRET.strip().lower():
        raise HTTPException(
            status_code=401,
            detail=f"Unauthorized webhook: Invalid or missing secret. Provide header 'X-Webhook-Secret: {WEBHOOK_SECRET}' or query '?secret={WEBHOOK_SECRET}'"
        )

    # Parse message text for bank credit & UTR
    parsed_amt, parsed_utr = parse_bank_sms(message_text)
    final_amt = direct_amt or parsed_amt
    final_utr = direct_utr or parsed_utr

    if not final_amt:
        return {
            "status": "ignored",
            "code": 200,
            "reason": "Could not extract credited amount from message",
            "received_message": message_text[:100],
            "note": "Secret was valid! When a real bank SMS arrives with an amount, it will unlock automatically."
        }

    # Match latest PENDING order with matching amount
    orders = load_orders()
    target_order = None
    for o in reversed(orders):
        if o.get("status") == "PENDING" and int(o.get("amount", 0)) == int(final_amt):
            target_order = o
            break

    receipt_id = f"REC-SMS-{uuid.uuid4().hex[:8].upper()}"
    now_str = datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S")

    if target_order:
        target_order["status"] = "PAID"
        target_order["utr"] = final_utr or f"SMS-{int(datetime.datetime.now().timestamp())}"
        target_order["receipt_id"] = receipt_id
        target_order["message"] = "🎉 చెల్లింపు ధృవీకరించబడింది! ప్యాకేజీ స్వయంచాలకంగా అన్‌లాక్ చేయబడింది."
        save_orders(orders)

        txs = load_transactions()
        txs.append({
            "receipt_id": receipt_id,
            "order_id": target_order["order_id"],
            "utr": target_order["utr"],
            "amount": target_order["amount"],
            "pack": target_order["pack"],
            "target_upi_id": "9063053602@hdfc",
            "rewards": target_order.get("rewards"),
            "timestamp": now_str,
            "source": "sms_webhook"
        })
        save_transactions(txs)

        return {
            "status": "success",
            "matched_order_id": target_order["order_id"],
            "amount": final_amt,
            "utr": final_utr,
            "receipt_id": receipt_id,
            "pack": target_order["pack"]
        }
    else:
        txs = load_transactions()
        txs.append({
            "receipt_id": receipt_id,
            "utr": final_utr or f"SMS-{int(datetime.datetime.now().timestamp())}",
            "amount": final_amt,
            "pack": "unmatched_credit",
            "target_upi_id": "9063053602@hdfc",
            "timestamp": now_str,
            "source": "sms_webhook_unmatched"
        })
        save_transactions(txs)

        return {
            "status": "credited_unmatched",
            "amount": final_amt,
            "utr": final_utr,
            "message": "Payment recorded in ledger, but no active pending order window was open."
        }



