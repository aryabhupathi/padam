import React, { useEffect, useRef, useState } from 'react';
import type { CluesGroup, ClueItem } from '../types/puzzle';
import { TRANSLATIONS, type Language } from '../utils/translations';
import { Columns, LayoutList, Volume2 } from 'lucide-react';
import { speakTeluguText } from '../utils/speech';

interface ClueListProps {
  clues: CluesGroup;
  activeClue: ClueItem | null;
  direction: 'across' | 'down';
  language: Language;
  onSelectClue: (clue: ClueItem, dir: 'across' | 'down') => void;
}

export const ClueList: React.FC<ClueListProps> = ({
  clues,
  activeClue,
  direction,
  language,
  onSelectClue
}) => {
  const t = TRANSLATIONS[language];
  const [activeTab, setActiveTab] = useState<'both' | 'across' | 'down'>('both');
  const activeClueRef = useRef<HTMLDivElement>(null);

  // Auto-scroll active clue into view smoothly
  useEffect(() => {
    if (activeClueRef.current) {
      activeClueRef.current.scrollIntoView({
        behavior: 'smooth',
        block: 'nearest'
      });
    }
  }, [activeClue?.id, direction]);

  const renderClueItem = (c: ClueItem, dir: 'across' | 'down') => {
    const isActive = direction === dir && activeClue?.id === c.id;
    return (
      <div
        key={c.id}
        ref={isActive ? activeClueRef : null}
        onClick={() => onSelectClue(c, dir)}
        className={`py-1.5 px-2 rounded-md cursor-pointer transition-all flex items-baseline gap-1.5 text-xs md:text-sm select-none ${
          isActive
            ? 'bg-amber-100 border-l-4 border-amber-600 font-semibold shadow-xs text-amber-950 scale-[1.01]'
            : 'hover:bg-stone-100 border-l-4 border-transparent text-stone-800'
        }`}
      >
        <span className="font-bold text-red-600 min-w-[22px] shrink-0 font-sans text-xs md:text-sm">
          {c.number}.
        </span>
        <span className="font-telugu leading-snug flex-1">
          {c.clue}
        </span>
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            speakTeluguText(c.clue);
          }}
          title={language === 'te' ? 'చదివి వినిపించు (Read Aloud)' : 'Read Aloud'}
          className="p-1 hover:bg-amber-200/90 rounded text-amber-700 hover:text-amber-900 transition shrink-0"
        >
          <Volume2 size={13} />
        </button>
        <span className="text-[11px] text-stone-600 font-mono font-bold shrink-0 ml-0.5">
          ({c.length})
        </span>
      </div>
    );
  };

  return (
    <div className="bg-white border-2 border-stone-200 rounded-xl p-3 shadow-xs flex flex-col h-[520px] md:h-[580px] w-full">
      {/* Clues Header with Tab Toggles for flexible viewing */}
      <div className="flex items-center justify-between border-b border-stone-200 pb-2 mb-2 shrink-0">
        <div className="flex items-center gap-1.5 bg-stone-100 p-0.5 rounded-lg text-xs font-semibold">
          <button
            type="button"
            onClick={() => setActiveTab('both')}
            className={`px-2.5 py-1 rounded-md transition-all flex items-center gap-1 ${
              activeTab === 'both'
                ? 'bg-white text-stone-900 shadow-xs font-bold'
                : 'text-stone-500 hover:text-stone-900'
            }`}
          >
            <Columns size={13} />
            <span>{language === 'te' ? 'రెండు (Both)' : 'Both'}</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('across')}
            className={`px-2.5 py-1 rounded-md transition-all flex items-center gap-1 ${
              activeTab === 'across'
                ? 'bg-white text-stone-900 shadow-xs font-bold'
                : 'text-stone-500 hover:text-stone-900'
            }`}
          >
            <LayoutList size={13} />
            <span>{t.across} ({clues.across.length})</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('down')}
            className={`px-2.5 py-1 rounded-md transition-all flex items-center gap-1 ${
              activeTab === 'down'
                ? 'bg-white text-stone-900 shadow-xs font-bold'
                : 'text-stone-500 hover:text-stone-900'
            }`}
          >
            <LayoutList size={13} />
            <span>{t.down} ({clues.down.length})</span>
          </button>
        </div>

        <span className="text-[11px] text-stone-600 font-sans hidden sm:inline font-bold">
          {clues.across.length + clues.down.length} {t.clues}
        </span>
      </div>

      {/* Clues Content Container with min-h-0 and flex-1 */}
      <div className="flex-1 min-h-0 flex flex-col">
        {/* VIEW 1: BOTH TABS SIDE-BY-SIDE */}
        {activeTab === 'both' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 h-full min-h-0 flex-1">
            {/* Across Column */}
            <div className="flex flex-col h-full min-h-0 bg-stone-50/70 border border-stone-200 rounded-lg p-2.5">
              <div className="flex items-center justify-between border-b border-red-200/80 pb-1.5 mb-1.5 shrink-0">
                <span className="font-bold text-red-900 text-sm font-telugu">
                  {t.across} ({clues.across.length})
                </span>
                <span className="text-[10px] text-stone-500 font-sans">
                  {clues.across.length} ఆధారాలు
                </span>
              </div>
              <div className="flex-1 min-h-0 overflow-y-auto space-y-0.5 pr-1 divide-y divide-stone-100">
                {clues.across.map((c) => renderClueItem(c, 'across'))}
              </div>
            </div>

            {/* Down Column */}
            <div className="flex flex-col h-full min-h-0 bg-stone-50/70 border border-stone-200 rounded-lg p-2.5">
              <div className="flex items-center justify-between border-b border-red-200/80 pb-1.5 mb-1.5 shrink-0">
                <span className="font-bold text-red-900 text-sm font-telugu">
                  {t.down} ({clues.down.length})
                </span>
                <span className="text-[10px] text-stone-500 font-sans">
                  {clues.down.length} ఆధారాలు
                </span>
              </div>
              <div className="flex-1 min-h-0 overflow-y-auto space-y-0.5 pr-1 divide-y divide-stone-100">
                {clues.down.map((c) => renderClueItem(c, 'down'))}
              </div>
            </div>
          </div>
        )}

        {/* VIEW 2: ACROSS ONLY (Full Width 2-Column Grid of Clues) */}
        {activeTab === 'across' && (
          <div className="flex flex-col h-full min-h-0 bg-stone-50/70 border border-stone-200 rounded-lg p-3 flex-1">
            <div className="flex items-center justify-between border-b border-red-200/80 pb-1.5 mb-2 shrink-0">
              <span className="font-bold text-red-900 text-base font-telugu flex items-center gap-2">
                <span>{t.across}</span>
                <span className="text-xs bg-red-100 text-red-800 px-2 py-0.5 rounded-full font-mono font-bold">
                  {clues.across.length} {t.clues}
                </span>
              </span>
              <span className="text-xs text-stone-500 font-sans">
                {language === 'te' ? 'అన్ని అడ్డం ఆధారాలు (స్క్రోల్ చేయవచ్చు)' : 'All Across Clues (Scrollable)'}
              </span>
            </div>
            {/* 2-column grid of across clues so user sees almost all without scrolling */}
            <div className="flex-1 min-h-0 overflow-y-auto pr-2">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-1">
                {clues.across.map((c) => renderClueItem(c, 'across'))}
              </div>
            </div>
          </div>
        )}

        {/* VIEW 3: DOWN ONLY (Full Width 2-Column Grid of Clues) */}
        {activeTab === 'down' && (
          <div className="flex flex-col h-full min-h-0 bg-stone-50/70 border border-stone-200 rounded-lg p-3 flex-1">
            <div className="flex items-center justify-between border-b border-red-200/80 pb-1.5 mb-2 shrink-0">
              <span className="font-bold text-red-900 text-base font-telugu flex items-center gap-2">
                <span>{t.down}</span>
                <span className="text-xs bg-red-100 text-red-800 px-2 py-0.5 rounded-full font-mono font-bold">
                  {clues.down.length} {t.clues}
                </span>
              </span>
              <span className="text-xs text-stone-500 font-sans">
                {language === 'te' ? 'అన్ని నిలువు ఆధారాలు (స్క్రోల్ చేయవచ్చు)' : 'All Down Clues (Scrollable)'}
              </span>
            </div>
            {/* 2-column grid of down clues so user sees almost all without scrolling */}
            <div className="flex-1 min-h-0 overflow-y-auto pr-2">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-1">
                {clues.down.map((c) => renderClueItem(c, 'down'))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
