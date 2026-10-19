import type { PuzzleData, VerifyResult, GameDifficulty } from '../types/puzzle';
import { getFallbackPuzzle, FALLBACK_PUZZLES } from '../data/fallbackPuzzles';

const ENV_API_BASE = (import.meta as any).env?.VITE_API_BASE_URL?.trim();
const RENDER_PROD_URL = 'https://padam.onrender.com';
let ACTIVE_API_BASE = ENV_API_BASE || RENDER_PROD_URL;

async function getWorkingBaseUrl(): Promise<string> {
  if (ENV_API_BASE) {
    return ENV_API_BASE.replace(/\/+$/, '');
  }
  // Try live Render backend first so payment webhooks from mobile MacroDroid always match
  try {
    const testRes = await fetch(`${RENDER_PROD_URL}/`, { method: 'GET', signal: AbortSignal.timeout(3000) });
    if (testRes.ok) {
      ACTIVE_API_BASE = RENDER_PROD_URL;
      return ACTIVE_API_BASE;
    }
  } catch {
    // Fall back to local if Render is offline
  }
  const hosts = ['127.0.0.1', 'localhost'];
  const ports = [8000, 8001];
  for (const host of hosts) {
    for (const port of ports) {
      try {
        const testRes = await fetch(`http://${host}:${port}/`, { method: 'GET', signal: AbortSignal.timeout(1000) });
        if (testRes.ok) {
          ACTIVE_API_BASE = `http://${host}:${port}`;
          return ACTIVE_API_BASE;
        }
      } catch {
        // try next
      }
    }
  }
  return ACTIVE_API_BASE;
}

export async function fetchGeneratedPuzzle(difficulty: GameDifficulty = 'easy', size?: number): Promise<PuzzleData> {
  const defaultSize = difficulty === 'kids' ? 5 : (difficulty === 'easy' ? 7 : (difficulty === 'medium' ? 9 : 12));
  const targetSize = size || defaultSize;
  const baseUrl = await getWorkingBaseUrl();

  try {
    const res = await fetch(`${baseUrl}/api/puzzle/generate?difficulty=${difficulty}&size=${targetSize}&reveal=true&_t=${Date.now()}`, {
      headers: { 'Content-Type': 'application/json' },
      signal: AbortSignal.timeout(12000)
    });
    if (!res.ok) throw new Error(`API request failed with status: ${res.status}`);
    const data = await res.json();
    if (!data || !data.clues || !data.clues.across || (data.clues.across.length + data.clues.down.length < 5)) {
      throw new Error('API returned invalid or sparse puzzle');
    }
    return data;
  } catch (err) {
    console.warn('Backend API offline or error, using verified dense fallback:', err);
    return getFallbackPuzzle(difficulty, targetSize);
  }
}

export async function fetchDailyPuzzle(): Promise<PuzzleData> {
  const baseUrl = await getWorkingBaseUrl();
  try {
    const res = await fetch(`${baseUrl}/api/puzzle/daily?reveal=true`, {
      headers: { 'Content-Type': 'application/json' },
      signal: AbortSignal.timeout(4000)
    });
    if (!res.ok) throw new Error('API request failed');
    const data = await res.json();
    if (!data || !data.clues || !data.clues.across || (data.clues.across.length + data.clues.down.length < 10)) {
      throw new Error('API returned invalid daily puzzle');
    }
    return data;
  } catch (err) {
    console.warn('Backend API offline, using verified dense daily fallback:', err);
    return FALLBACK_PUZZLES.daily;
  }
}

export async function verifyPuzzleOnline(
  solution: (string | null)[][],
  userGrid: (string | null)[][]
): Promise<VerifyResult> {
  const baseUrl = await getWorkingBaseUrl();
  try {
    const res = await fetch(`${baseUrl}/api/puzzle/verify`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ solution, user_grid: userGrid }),
      signal: AbortSignal.timeout(3000)
    });
    if (!res.ok) throw new Error('Verify API failed');
    return await res.json();
  } catch {
    let total = 0;
    let correct = 0;
    const incorrect: [number, number][] = [];

    for (let r = 0; r < solution.length; r++) {
      for (let c = 0; c < solution[r].length; c++) {
        const expected = solution[r][c];
        if (expected !== null) {
          total++;
          const entered = userGrid[r]?.[c] || '';
          if (entered === expected) {
            correct++;
          } else {
            incorrect.push([r, c]);
          }
        }
      }
    }

    const isComplete = correct === total && total > 0;
    return {
      is_complete: isComplete,
      correct_cells: correct,
      total_cells: total,
      incorrect_cells: incorrect,
      message: isComplete
        ? '🎉 అద్భుతం! మీరు పదవినోదాన్ని విజయవంతంగా పూర్తి చేశారు!'
        : `బాగా ప్రయత్నించారు! ${total} గడులలో ${correct} సరిగ్గా నింపారు.`
    };
  }
}

export interface UtrVerifyResult {
  success: boolean;
  message: string;
  utr: string;
  receipt_id: string;
  amount: number;
  pack: string;
  unlocked_rewards: {
    kids_unlocked?: boolean;
    coins?: number;
    energy?: number;
  };
  timestamp: string;
}

export async function verifyPaymentUtr(
  utr: string,
  amount: number,
  pack: string,
  upiId: string = '9063053602@hdfc'
): Promise<UtrVerifyResult> {
  const cleanUtr = utr.trim();
  if (!cleanUtr || cleanUtr.length !== 12 || !/^\d{12}$/.test(cleanUtr)) {
    throw new Error('చెల్లని UPI ట్రాన్సాక్షన్ నంబర్. దయచేసి మీ Google Pay, PhonePe లేదా Paytm లోని ఖచ్చితమైన 12 అంకెల UTR నంబర్‌ను నమోదు చేయండి. (Must be exactly 12 digits).');
  }

  const fakePatterns = ['000000000000', '111111111111', '999999999999', '123456789012'];
  if (fakePatterns.includes(cleanUtr) || new Set(cleanUtr).size <= 1) {
    throw new Error('నకిలీ లేదా పరీక్ష ట్రాన్సాక్షన్ నంబర్ అంగీకరించబడదు. దయచేసి నిజమైన చెల్లింపు UTR ను నమోదు చేయండి.');
  }

  const baseUrl = await getWorkingBaseUrl();
  try {
    const res = await fetch(`${baseUrl}/api/payment/verify-utr`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ utr: cleanUtr, amount, pack, upi_id: upiId }),
      signal: AbortSignal.timeout(8000)
    });
    
    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.detail || 'చెల్లింపు ధృవీకరణ విఫలమైంది. దయచేసి సరైన UTR ను నమోదు చేయండి.');
    }
    return data;
  } catch (err: any) {
    throw new Error(err.message || 'సర్వర్ నుండి చెల్లింపు ధృవీకరించబడలేదు. దయచేసి ఇంటర్నెట్ కనెక్షన్ సరిచూసుకోండి.');
  }
}

export interface OrderSession {
  order_id: string;
  pack: string;
  amount: number;
  upi_id: string;
  status: 'PENDING' | 'PAID' | 'EXPIRED';
  created_at: string;
  expires_at: string;
}

export interface OrderStatusResult {
  order_id: string;
  status: 'PENDING' | 'PAID' | 'EXPIRED';
  amount: number;
  pack: string;
  utr?: string;
  receipt_id?: string;
  rewards?: {
    kids_unlocked?: boolean;
    coins?: number;
    energy?: number;
  };
  message?: string;
}

export async function createPaymentOrder(
  pack: string,
  amount: number,
  upiId: string = '9063053602@hdfc'
): Promise<OrderSession> {
  const baseUrl = await getWorkingBaseUrl();
  try {
    const res = await fetch(`${baseUrl}/api/payment/create-order`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ pack, amount, upi_id: upiId }),
      signal: AbortSignal.timeout(5000)
    });
    if (!res.ok) throw new Error('Order creation failed');
    return await res.json();
  } catch {
    return {
      order_id: `ORD-LOC-${Date.now().toString(36).toUpperCase()}`,
      pack,
      amount,
      upi_id: upiId,
      status: 'PENDING',
      created_at: new Date().toISOString(),
      expires_at: new Date(Date.now() + 15 * 60000).toISOString()
    };
  }
}

export async function checkOrderStatus(orderId: string): Promise<OrderStatusResult> {
  const baseUrl = await getWorkingBaseUrl();
  try {
    const res = await fetch(`${baseUrl}/api/payment/order-status/${orderId}`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
      signal: AbortSignal.timeout(3000)
    });
    if (!res.ok) throw new Error('Order status check failed');
    return await res.json();
  } catch {
    return {
      order_id: orderId,
      status: 'PENDING',
      amount: 0,
      pack: 'unknown'
    };
  }
}


