import React, { useState } from 'react';
import type { CluesGroup, ClueItem } from '../types/puzzle';
import { ClueList } from './ClueList';
import { TenaliRamaStoryClue } from './TenaliRamaStoryClue';
import type { MascotMood } from './TenaliRamaMascot';
import type { Language } from '../utils/translations';
import { X } from 'lucide-react';

interface ClueListDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  clues: CluesGroup;
  activeClue: ClueItem | null;
  direction: 'across' | 'down';
  language: Language;
  selectedCell?: { r: number; c: number };
  userGrid?: (string | null)[][];
  mascotMoodOverride?: MascotMood | null;
  onToggleDirection?: () => void;
  onUseHint?: () => void;
  onSelectClue: (clue: ClueItem, dir: 'across' | 'down') => void;
}

export const ClueListDrawer: React.FC<ClueListDrawerProps> = ({
  isOpen,
  onClose,
  clues,
  activeClue,
  direction,
  language,
  selectedCell = { r: 0, c: 0 },
  userGrid = [],
  mascotMoodOverride,
  onToggleDirection,
  onUseHint,
  onSelectClue
}) => {
  const [activeTab, setActiveTab] = useState<'clues' | 'story'>('clues');

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/60 backdrop-blur-xs animate-fadeIn select-none print:hidden">
      <div className="bg-white rounded-2xl border-2 border-amber-600 shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden font-telugu">
        {/* Header with Mode Switcher */}
        <div className="bg-gradient-to-r from-amber-800 via-amber-700 to-amber-900 text-amber-50 p-3 sm:p-3.5 flex items-center justify-between border-b border-amber-600 shrink-0">
          <div className="flex items-center gap-2">
            <span className="text-xl">📜</span>
            <div>
              <h3 className="font-bold text-sm sm:text-base md:text-lg leading-tight">
                {activeTab === 'clues' 
                  ? (language === 'te' ? 'సంపూర్ణ ఆధారాలు (All Clues)' : 'All Puzzle Clues')
                  : (language === 'te' ? 'తెనాలి రామకృష్ణ కథనం (Story Mode)' : 'Tenali Story Mode')}
              </h3>
              <p className="text-[11px] text-amber-200">
                {activeTab === 'clues'
                  ? (language === 'te' ? 'ఏదైనా పదాన్ని ఎంచుకోండి, ఆ గడిలోకి చేరుకోవచ్చు' : 'Tap any clue to select that word')
                  : (language === 'te' ? 'రాయలవారి ఆస్థాన వికటకవి చతుర సూచనలు' : 'Court jester witty clues & dialogue')}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-white/20 text-white transition cursor-pointer"
            title="మూసివేయండి (Close)"
          >
            <X size={20} />
          </button>
        </div>

        {/* Tab Selector Bar */}
        <div className="bg-amber-50 border-b border-amber-200 p-2 flex items-center justify-center gap-2 shrink-0">
          <button
            type="button"
            onClick={() => setActiveTab('clues')}
            className={`py-1.5 px-3 rounded-lg text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'clues'
                ? 'bg-amber-700 text-white shadow-xs'
                : 'bg-white text-stone-700 hover:bg-stone-100 border border-amber-200'
            }`}
          >
            <span>📜</span>
            <span>{language === 'te' ? 'అన్ని ఆధారాలు (All Clues)' : 'All Clues Table'}</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('story')}
            className={`py-1.5 px-3 rounded-lg text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'story'
                ? 'bg-amber-700 text-white shadow-xs'
                : 'bg-white text-stone-700 hover:bg-stone-100 border border-amber-200'
            }`}
          >
            <span>🎭</span>
            <span>{language === 'te' ? 'తెనాలి రామ కథ (Story Mode)' : 'Tenali Story Mode'}</span>
          </button>
        </div>

        {/* Body: Either ClueList or TenaliRamaStoryClue */}
        <div className="p-3 flex-1 overflow-y-auto">
          {activeTab === 'clues' ? (
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
          ) : (
            <TenaliRamaStoryClue
              activeClue={activeClue}
              direction={direction}
              selectedCell={selectedCell}
              userGrid={userGrid}
              allClues={clues}
              language={language}
              mascotMoodOverride={mascotMoodOverride}
              onToggleDirection={onToggleDirection || (() => {})}
              onSelectAlternateClue={(c, dir) => onSelectClue(c, dir)}
              onOpenFullClues={() => setActiveTab('clues')}
              onUseHint={onUseHint}
            />
          )}
        </div>
      </div>
    </div>
  );
};
