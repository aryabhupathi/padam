import type { PuzzleData, GameDifficulty } from '../types/puzzle';

import v5 from './verified_5x5.json';
import v7 from './verified_7x7.json';
import v9 from './verified_9x9.json';
import v12 from './verified_12x12.json';

function formatFallback(raw: any, id: string): PuzzleData {
  return {
    puzzle_id: id,
    size: raw.size,
    mask: raw.mask,
    numbers: raw.numbers,
    clues: raw.clues,
    solution: raw.solution,
    meta: {
      difficulty: raw.meta?.difficulty,
      total_words: raw.meta?.total_words || (raw.clues.across.length + raw.clues.down.length),
      generated_at: raw.meta?.generated_at || Date.now()
    }
  };
}

export const FALLBACK_PUZZLES: Record<string, PuzzleData> = {
  kids: formatFallback(v5, 'padam_dense_kids_5x5'),
  easy: formatFallback(v7, 'padam_dense_easy_7x7'),
  medium: formatFallback(v9, 'padam_dense_medium_9x9'),
  hard: formatFallback(v12, 'padam_dense_hard_12x12'),
  daily: formatFallback(v12, `daily_${new Date().toISOString().split('T')[0]}`)
};

export function getFallbackPuzzle(difficulty: GameDifficulty, size?: number): PuzzleData {
  if (difficulty === 'kids' || size === 5) return FALLBACK_PUZZLES.kids;
  if (difficulty === 'easy' || size === 7) return FALLBACK_PUZZLES.easy;
  if (difficulty === 'medium' || size === 9) return FALLBACK_PUZZLES.medium;
  return FALLBACK_PUZZLES.hard;
}
