import React from 'react';
import type { CluesGroup, ClueItem } from '../types/puzzle';
import { ClueList } from './ClueList';
import type { Language } from '../utils/translations';
import { X } from 'lucide-react';

interface ClueListDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  clues: CluesGroup;
  activeClue: ClueItem | null;
  direction: 'across' | 'down';
  language: Language;
  onSelectClue: (clue: ClueItem, dir: 'across' | 'down') => void;
}

export const ClueListDrawer: React.FC<ClueListDrawerProps> = ({
  isOpen,
  onClose,
  clues,
  activeClue,
  direction,
  language,
  onSelectClue
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/60 backdrop-blur-xs animate-fadeIn">
      <div className="bg-white rounded-2xl border-2 border-amber-600 shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-amber-800 via-amber-700 to-amber-900 text-amber-50 p-3.5 flex items-center justify-between border-b border-amber-600">
          <div className="flex items-center gap-2">
            <span className="text-xl">📜</span>
            <div>
              <h3 className="font-bold text-base md:text-lg font-telugu leading-tight">
                సంపూర్ణ పద నిరూపణలు (All Clues)
              </h3>
              <p className="text-[11px] text-amber-200">
                ఏదైనా పదాన్ని ఎంచుకోండి, ఆ గడిలోకి చేరుకోవచ్చు
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-amber-600 text-amber-100 transition"
            title="మూసివేయండి (Close)"
          >
            <X size={20} />
          </button>
        </div>

        {/* Body: Embedded ClueList */}
        <div className="p-3 flex-1 overflow-hidden">
          <ClueList
            clues={clues}
            activeClue={activeClue}
            direction={direction}
            language={language}
            onSelectClue={(c, dir) => {
              onSelectClue(c, dir);
              onClose();
            }}
          />
        </div>
      </div>
    </div>
  );
};
