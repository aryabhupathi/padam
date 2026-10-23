import React, { useEffect, useRef } from 'react';
import type { PuzzleData, ClueItem } from '../types/puzzle';
import { TRANSLATIONS, type Language } from '../utils/translations';
import { templeAudio } from '../utils/templeAudio';

interface CrosswordGridProps {
  puzzle: PuzzleData;
  userGrid: (string | null)[][];
  selectedCell: { r: number; c: number };
  direction: 'across' | 'down';
  activeClue: ClueItem | null;
  incorrectCells: [number, number][];
  language?: Language;
  onSelectCell: (r: number, c: number) => void;
  onBackspace: () => void;
  onToggleDirection: () => void;
}

/**
 * Authentic Telugu Crossword Rosette Emblem (పూల గుర్తు)
 * Matches the newspaper photo's dark indigo/navy 8-petal symmetrical rosette (#2c2b8c).
 */
export const TeluguFlowerRosette: React.FC<{ className?: string }> = ({ className = "w-4 h-4 md:w-5 md:h-5" }) => (
  <svg viewBox="0 0 100 100" className={`${className} pointer-events-none select-none`} fill="#2c2b8c">
    {/* Center dot & inner ring */}
    <circle cx="50" cy="50" r="7.5" fill="#2c2b8c" />
    <circle cx="50" cy="50" r="13" fill="none" stroke="#2c2b8c" strokeWidth="3" />
    {/* 8 symmetrical floral petals */}
    {[0, 45, 90, 135, 180, 225, 270, 315].map((angle) => (
      <g key={angle} transform={`rotate(${angle} 50 50)`}>
        <path
          d="M 50 20 C 44 26, 43 38, 50 41 C 57 38, 56 26, 50 20 Z"
          fill="#2c2b8c"
        />
        <circle cx="50" cy="14" r="4.5" fill="#2c2b8c" />
        <line x1="50" y1="22" x2="50" y2="36" stroke="#ffffff" strokeWidth="1.5" />
      </g>
    ))}
  </svg>
);

export const CrosswordGrid: React.FC<CrosswordGridProps> = ({
  puzzle,
  userGrid,
  selectedCell,
  direction,
  activeClue,
  incorrectCells,
  language = 'te',
  onSelectCell,
  onBackspace,
  onToggleDirection
}) => {
  const t = TRANSLATIONS[language];
  const containerRef = useRef<HTMLDivElement>(null);

  const isInActiveWord = (r: number, c: number) => {
    if (!activeClue) return false;
    if (direction === 'across') {
      return r === activeClue.row && c >= activeClue.col && c < activeClue.col + activeClue.length;
    } else {
      return c === activeClue.col && r >= activeClue.row && r < activeClue.row + activeClue.length;
    }
  };

  const isIncorrect = (r: number, c: number) => {
    return incorrectCells.some(([ir, ic]) => ir === r && ic === c);
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return;
      }

      if (e.key === 'ArrowRight') {
        e.preventDefault();
        moveToCell(selectedCell.r, selectedCell.c + 1);
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        moveToCell(selectedCell.r, selectedCell.c - 1);
      } else if (e.key === 'ArrowDown') {
        e.preventDefault();
        moveToCell(selectedCell.r + 1, selectedCell.c);
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        moveToCell(selectedCell.r - 1, selectedCell.c);
      } else if (e.key === ' ') {
        e.preventDefault();
        onToggleDirection();
      } else if (e.key === 'Backspace') {
        e.preventDefault();
        onBackspace();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedCell, puzzle]);

  const moveToCell = (r: number, c: number) => {
    if (r >= 0 && r < puzzle.size && c >= 0 && c < puzzle.size) {
      if (puzzle.mask[r][c]) {
        onSelectCell(r, c);
      }
    }
  };

  // Cell sizing calibrated to match authentic Telugu newspaper layouts and fit tablets & mobile screens
  const getCellDimensions = () => {
    if (puzzle.size <= 5) {
      return {
        cellClass: 'w-12 h-12 sm:w-13 sm:h-13 md:w-14 md:h-14',
        fontSize: 'text-xl sm:text-2xl md:text-2xl',
        numSize: 'text-[10px] sm:text-xs md:text-xs',
        flowerSize: 'w-6 h-6 sm:w-7 sm:h-7 md:w-7 md:h-7'
      };
    } else if (puzzle.size <= 7) {
      return {
        cellClass: 'w-10 h-10 sm:w-11 sm:h-11 md:w-12 md:h-12',
        fontSize: 'text-base sm:text-lg md:text-xl',
        numSize: 'text-[9px] sm:text-[10px] md:text-xs',
        flowerSize: 'w-5.5 h-5.5 sm:w-6 sm:h-6 md:w-6.5 md:h-6.5'
      };
    } else if (puzzle.size <= 9) {
      return {
        cellClass: 'w-8.5 h-8.5 sm:w-9 sm:h-9 md:w-9.5 md:h-9.5 lg:w-10 lg:h-10',
        fontSize: 'text-xs sm:text-sm md:text-base',
        numSize: 'text-[8px] sm:text-[8.5px] md:text-[9px]',
        flowerSize: 'w-4.5 h-4.5 sm:w-5 sm:h-5 md:w-5.5 md:h-5.5'
      };
    } else {
      // 12x12 Newspaper Classic (photo replica, tablet calibrated to prevent vertical overflow)
      return {
        cellClass: 'w-7 h-7 sm:w-7.5 sm:h-7.5 md:w-8 md:h-8 lg:w-8.5 lg:h-8.5',
        fontSize: 'text-xs sm:text-xs md:text-sm',
        numSize: 'text-[7px] sm:text-[7.5px] md:text-[8px]',
        flowerSize: 'w-4 h-4 sm:w-4.5 sm:h-4.5 md:w-5 md:h-5'
      };
    }
  };

  const dims = getCellDimensions();

  return (
    <div className="flex flex-col items-center">
      {/* 
        Authentic Newspaper Crossword Box:
        - Outer border: 2px coral-red (#ea3a3a)
        - Inner lines: 1px coral-red grid gap (#f87171)
        - Pure white cell backgrounds
        - Dark blue flower rosettes for blocked cells
        - Small red numbers in top-left
      */}
      <div
        ref={containerRef}
        className="inline-grid bg-[#f87171] p-[2px] rounded-xs border-2 border-[#ea3a3a] shadow-lg select-none max-w-full overflow-hidden"
        style={{
          gridTemplateColumns: `repeat(${puzzle.size}, auto)`,
          gridTemplateRows: `repeat(${puzzle.size}, auto)`,
          gap: '1px'
        }}
      >
        {puzzle.mask.map((row, r) =>
          row.map((isPlayable, c) => {
            // Blocked / Rosette cell (White box with blue flower)
            if (!isPlayable) {
              return (
                <div
                  key={`${r}-${c}`}
                  className={`${dims.cellClass} bg-white aspect-square flex items-center justify-center p-0.5 select-none pointer-events-none`}
                  title="పూల గుర్తు"
                >
                  <TeluguFlowerRosette className={dims.flowerSize} />
                </div>
              );
            }

            const isSelected = selectedCell.r === r && selectedCell.c === c;
            const inWord = isInActiveWord(r, c);
            const num = puzzle.numbers[`${r},${c}`];
            const val = userGrid[r]?.[c] || '';
            const error = isIncorrect(r, c);

            return (
              <div
                key={`${r}-${c}`}
                onClick={() => {
                  templeAudio.playTileTap();
                  onSelectCell(r, c);
                }}
                className={`${dims.cellClass} relative aspect-square flex items-center justify-center cursor-pointer select-none transition-colors ${
                  isSelected
                    ? 'bg-amber-100 ring-2 ring-amber-500 ring-inset z-10'
                    : inWord
                    ? 'bg-amber-50/90 hover:bg-amber-100/70'
                    : error
                    ? 'bg-rose-50 text-rose-900 ring-1 ring-rose-400 ring-inset'
                    : 'bg-white hover:bg-stone-50'
                }`}
              >
                {/* Red Clue Number in Top-Left (Exact replica of newspaper photo) */}
                {num && (
                  <span className={`absolute top-0.5 left-0.5 ${dims.numSize} font-bold text-red-600 font-sans leading-none pointer-events-none`}>
                    {num}
                  </span>
                )}
                {/* Telugu Syllable in Center */}
                <span className={`${dims.fontSize} font-bold text-stone-900 tracking-wide font-telugu pointer-events-none select-none mt-1`}>
                  {val}
                </span>
              </div>
            );
          })
        )}
      </div>

      <div className="flex items-center gap-3 mt-1.5 sm:mt-2 text-xs text-stone-500 font-sans">
        <span className="inline-flex items-center gap-1">
          <kbd className="px-1.5 py-0.5 bg-stone-200 rounded text-[10px] border border-stone-300 font-mono">{t.spaceKey}</kbd>
          {t.toggleDirection}
        </span>
        <span className="inline-flex items-center gap-1">
          <kbd className="px-1.5 py-0.5 bg-stone-200 rounded text-[10px] border border-stone-300 font-mono">{t.arrowKeys}</kbd>
          {t.move}
        </span>
      </div>
    </div>
  );
};
