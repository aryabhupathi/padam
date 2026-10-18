import type { PuzzleData, VerifyResult, GameDifficulty } from '../types/puzzle';
import { getFallbackPuzzle, FALLBACK_PUZZLES } from '../data/fallbackPuzzles';

let ACTIVE_API_BASE = 'http://127.0.0.1:8000';

async function getWorkingBaseUrl(): Promise<string> {
  const hosts = ['127.0.0.1', 'localhost'];
  const ports = [8000, 8001];
  for (const host of hosts) {
    for (const port of ports) {
      try {
        const testRes = await fetch(`http://${host}:${port}/`, { method: 'GET', signal: AbortSignal.timeout(1500) });
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
      signal: AbortSignal.timeout(4000)
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
