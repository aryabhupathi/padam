/**
 * Padavinodam Telugu Crossword - UPI Payment Configuration
 *
 * Set your personal or business UPI ID below (e.g., 'yourname@okaxis', 'phone@paytm', 'yourname@ybl').
 * - On Mobile: Opens GPay, PhonePe, Paytm, or BHIM directly with your UPI ID and amount pre-filled.
 * - On Desktop/Tablet: Generates a live scannable UPI QR code.
 * - 0% Commission: 100% of the funds go directly into your linked bank account.
 */

export const DEFAULT_UPI_ID = '9063053602@hdfc';
export const DEFAULT_PAYEE_NAME = 'Padavinodam Telugu Crossword';

export function getSavedUpiId(): string {
  const saved = localStorage.getItem('padam_custom_upi_id');
  if (!saved || saved === 'padam@okaxis') {
    return DEFAULT_UPI_ID;
  }
  return saved;
}

export function saveUpiId(newUpiId: string): void {
  localStorage.setItem('padam_custom_upi_id', newUpiId.trim());
}

export function buildUpiPaymentUrl(amount: number, packName: string, upiId?: string): string {
  const targetUpi = upiId || getSavedUpiId();
  const note = encodeURIComponent(`Padavinodam ${packName}`);
  const name = encodeURIComponent(DEFAULT_PAYEE_NAME);
  return `upi://pay?pa=${targetUpi}&pn=${name}&am=${amount}&cu=INR&tn=${note}`;
}

export function buildUpiQrUrl(upiUrl: string): string {
  return `https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=${encodeURIComponent(upiUrl)}`;
}
