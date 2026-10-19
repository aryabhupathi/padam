import requests
import sys

sys.stdout.reconfigure(encoding='utf-8')

RENDER_URL = 'https://padam.onrender.com'
SECRET = 'padam_sec_hdfc_9063'

print('--- STEP 1: Reset ledger to pristine state ---')
res = requests.post(f'{RENDER_URL}/api/payment/admin-reset?secret={SECRET}')
print('Reset:', res.json())

print('\n--- STEP 2: Create Order A (Kids Mode ₹49) ---')
res = requests.post(f'{RENDER_URL}/api/payment/create-order', json={'pack': 'kids', 'amount': 49})
order_a = res.json()
oid_a = order_a['order_id']
print(f'Order A created: {oid_a}, Status: {order_a["status"]}')

print('\n--- STEP 3: Check Order A Status (Must be PENDING, NO BYPASS) ---')
res = requests.get(f'{RENDER_URL}/api/payment/order-status/{oid_a}')
status_a = res.json()['status']
print(f'Order A status: {status_a}')
assert status_a == 'PENDING', f'FAIL: Order was {status_a}, expected PENDING'
print('PASS: Order is strictly PENDING!')

print('\n--- STEP 4: Test Fake UTR Manual Submission (Must be REJECTED 400) ---')
res = requests.post(f'{RENDER_URL}/api/payment/verify-utr', json={'utr': '987654321098', 'amount': 49, 'pack': 'kids'})
print(f'Fake UTR status: {res.status_code} (Rejected as expected)')
assert res.status_code == 400
print('PASS: Random uncredited UTR strictly rejected!')

print('\n--- STEP 5: Fire Webhook with SMS containing real UTR ---')
test_utr = '429819482019'
sms_text = f'Dear Customer, Rs 49.00 has been credited to your account **9063 on 19-OCT-26 by UPI/{test_utr} - HDFC Bank'
res = requests.post(
    f'{RENDER_URL}/api/payment/sms-webhook',
    json={'sender': 'AD-HDFCBK', 'message': sms_text},
    headers={'X-Webhook-Secret': SECRET}
)
print('Webhook Response:', res.json())
assert res.json()['status'] == 'success'
assert res.json()['matched_order_id'] == oid_a
print('PASS: Webhook successfully matched Order A!')

print('\n--- STEP 6: Check Order A Status (Must now be PAID) ---')
res = requests.get(f'{RENDER_URL}/api/payment/order-status/{oid_a}')
print(f'Order A status: {res.json()["status"]}, UTR: {res.json()["utr"]}')
assert res.json()['status'] == 'PAID'
print('PASS: Order A is now PAID!')

print('\n--- STEP 7: Create Order B (₹49) and Test Replay Attack with same UTR ---')
res = requests.post(f'{RENDER_URL}/api/payment/create-order', json={'pack': 'kids', 'amount': 49})
order_b = res.json()
oid_b = order_b['order_id']
print(f'Order B created: {oid_b}, Status: {order_b["status"]}')

res = requests.post(
    f'{RENDER_URL}/api/payment/sms-webhook',
    json={'sender': 'AD-HDFCBK', 'message': sms_text},
    headers={'X-Webhook-Secret': SECRET}
)
print('Replay Webhook Response:', res.json())
assert res.json()['status'] == 'ignored'
print('PASS: Replay attack blocked (duplicate UTR ignored)!')

print('\n--- STEP 8: Check Order B Status (Must still be PENDING, NOT hijacked by replay) ---')
res = requests.get(f'{RENDER_URL}/api/payment/order-status/{oid_b}')
status_b = res.json()['status']
print(f'Order B status: {status_b}')
assert status_b == 'PENDING', f'FAIL: Order B was {status_b}, expected PENDING'
print('PASS: Order B is strictly PENDING and was NOT fulfilled by replayed SMS!')

# Clean up ledger again so production is pristine
requests.post(f'{RENDER_URL}/api/payment/admin-reset?secret={SECRET}')
print('\n====================================')
print('ALL INTEGRATION TESTS PASSED 100%!')
print('====================================')
