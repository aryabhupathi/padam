"""
SMS Webhook Simulator for Padavinodam.
Simulates an incoming HDFC Bank UPI Credit SMS from your phone
to verify that automatic payment detection & game unlock works seamlessly.
"""

import sys
import random
import requests

DEFAULT_URL = "http://127.0.0.1:8000/api/payment/sms-webhook"
SECRET_KEY = "padam_sec_hdfc_9063"

def simulate_sms(amount=49, backend_url=DEFAULT_URL):
    # Generate random authentic 12-digit UPI UTR
    utr = f"429{random.randint(100000000, 999999999)}"
    
    # Standard HDFC Bank Credit SMS Format
    sms_text = f"Dear Customer, Rs {amount}.00 has been credited to your account **9063 on 19-OCT-26 by UPI/{utr}. Available Bal: Rs 15,420.00 - HDFC Bank"
    
    print(f"\n[1] Generated Fake Bank SMS:")
    print(f"    Sender: AD-HDFCBK")
    print(f"    Message: \"{sms_text}\"")
    print(f"    Extracted Amount: Rs {amount}")
    print(f"    Extracted UTR: {utr}")

    print(f"\n[2] Firing Webhook to: {backend_url}...")
    try:
        res = requests.post(
            backend_url,
            json={
                "sender": "AD-HDFCBK",
                "message": sms_text,
                "amount": float(amount),
                "utr": utr
            },
            headers={"X-Webhook-Secret": SECRET_KEY},
            timeout=5
        )
        print(f"\n[3] Webhook Server Response (Status {res.status_code}):")
        print(res.json())
        
        if res.status_code == 200 and res.json().get("status") == "success":
            print(f"\nSUCCESS: Matched active game order '{res.json().get('matched_order_id')}'! The game should have unlocked instantly!")
        else:
            print(f"\nRecorded in server ledger (if modal was open with this amount, it unlocked automatically).")
    except Exception as e:
        print(f"Failed to connect to backend: {e}")

if __name__ == "__main__":
    amt = int(sys.argv[1]) if len(sys.argv) > 1 else 49
    simulate_sms(amt)
