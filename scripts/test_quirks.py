import json
import re

def parse_bank_sms(text: str):
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

# What if MacroDroid literally sent [sms_body] because tags were not evaluated?
print("Literal [sms_body]:", parse_bank_sms("[sms_body]"))

# What if MacroDroid sent raw text with newlines?
sample_with_newlines = '{"sender":"AD-HDFCBK","message":"Dear Customer,\nRs 49.00 has been credited to your account **9063 on 19-OCT-26 by UPI/429810384912.\nAvailable Bal: Rs 15,420.00"}'
try:
    data = json.loads(sample_with_newlines, strict=False)
    print("strict=False json loads succeeded:", data)
except Exception as e:
    print("strict=False failed:", e)

try:
    data = json.loads(sample_with_newlines)
    print("Normal json loads succeeded")
except Exception as e:
    print("Normal json loads FAILED:", e)
