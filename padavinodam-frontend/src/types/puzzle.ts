export interface ClueItem {
  id: string;
  number: number;
  row: number;
  col: number;
  length: number;
  word?: string | null;
  syllables?: string[] | null;
  clue: string;
  category: string;
  is_ai_generated?: boolean;
  first_syllable?: string | null;
  last_syllable?: string | null;
}

export interface CluesGroup {
  across: ClueItem[];
  down: ClueItem[];
}

export interface PuzzleData {
  puzzle_id: string;
  size: number;
  mask: boolean[][];
  numbers: Record<string, number>;
  clues: CluesGroup;
  solution?: (string | null)[][] | null;
  meta: {
    difficulty?: string;
    is_daily?: boolean;
    date?: string;
    total_words: number;
    generated_at?: number;
  };
}

export interface VerifyResult {
  is_complete: boolean;
  correct_cells: number;
  total_cells: number;
  incorrect_cells: [number, number][];
  message: string;
}

export type GameDifficulty = 'kids' | 'easy' | 'medium' | 'hard';

export type HintType = 'reveal_syllable' | 'extra_time' | 'reveal_word' | 'first_letter_clue';

export interface HintOption {
  id: HintType;
  name: string;
  teluguName: string;
  coinCost: number;
  iconName: string;
  description: string;
  usedCount: number;
}
