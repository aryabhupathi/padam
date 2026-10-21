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
  className?: string;
  onSelectClue: (clue: ClueItem, dir: 'across' | 'down') => void;
}

export const ClueList: React.FC<ClueListProps> = ({
  clues,
  activeClue,
  direction,
  language,
  className = '',
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
    const isAcross = dir === 'across';

    return (
      <div
        key={c.id}
        ref={isActive ? activeClueRef : null}
        onClick={() => onSelectClue(c, dir)}
        className={`py-2 px-2.5 rounded-lg cursor-pointer transition-all flex items-start gap-2 text-xs md:text-sm select-none group ${
          isActive
            ? isAcross
              ? 'bg-red-50/95 border-l-4 border-red-600 font-medium shadow-xs text-stone-900 ring-1 ring-red-200 scale-[1.005]'
              : 'bg-blue-50/95 border-l-4 border-blue-600 font-medium shadow-xs text-stone-900 ring-1 ring-blue-200 scale-[1.005]'
            : 'hover:bg-amber-50/70 border-l-4 border-transparent text-stone-800'
        }`}
      >
        {/* Number Badge */}
        <span
          className={`font-mono font-bold text-xs md:text-sm min-w-[24px] shrink-0 pt-0.5 ${
            isAcross ? 'text-red-600' : 'text-blue-600'
          }`}
        >
          {c.number}.
        </span>

        {/* Clue Text: Takes full available space, wraps words cleanly */}
        <span className="font-telugu leading-relaxed flex-1 min-w-0 break-words text-stone-900">
          {c.clue}
        </span>

        {/* Trailing Controls: Audio Speaker + Syllable Count Badge (Never trimmed) */}
        <div className="flex items-center gap-1.5 shrink-0 ml-1.5 pt-0.5">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              speakTeluguText(c.clue);
            }}
            title={language === 'te' ? 'చదివి వినిపించు (Read Aloud)' : 'Read Aloud'}
            className="p-1 hover:bg-amber-200/80 rounded-md text-stone-500 hover:text-stone-900 transition shrink-0 opacity-70 group-hover:opacity-100 cursor-pointer"
          >
            <Volume2 size={13} />
          </button>
          <span className="text-[11px] text-stone-600 font-mono font-semibold shrink-0 whitespace-nowrap bg-stone-100 px-1.5 py-0.5 rounded border border-stone-200 shadow-2xs">
            {c.length}
          </span>
        </div>
      </div>
    );
  };

  return (
    <div
      className={`bg-white border-2 border-stone-200 rounded-2xl p-3 sm:p-4 shadow-xs flex flex-col w-full h-[540px] md:h-[580px] lg:h-full lg:min-h-[520px] ${className}`}
    >
      {/* Clues Header with Tab Toggles for flexible viewing */}
      <div className="flex items-center justify-between border-b border-stone-200 pb-2.5 mb-2.5 shrink-0">
        <div className="flex items-center gap-1.5 bg-stone-100 p-0.5 rounded-lg text-xs font-semibold">
          <button
            type="button"
            onClick={() => setActiveTab('both')}
            className={`px-2.5 py-1 rounded-md transition-all flex items-center gap-1 cursor-pointer ${
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
            className={`px-2.5 py-1 rounded-md transition-all flex items-center gap-1 cursor-pointer ${
              activeTab === 'across'
                ? 'bg-white text-red-700 shadow-xs font-bold'
                : 'text-stone-500 hover:text-stone-900'
            }`}
          >
            <LayoutList size={13} />
            <span>{t.across} ({clues.across.length})</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('down')}
            className={`px-2.5 py-1 rounded-md transition-all flex items-center gap-1 cursor-pointer ${
              activeTab === 'down'
                ? 'bg-white text-blue-700 shadow-xs font-bold'
                : 'text-stone-500 hover:text-stone-900'
            }`}
          >
            <LayoutList size={13} />
            <span>{t.down} ({clues.down.length})</span>
          </button>
        </div>

        <span className="text-[11px] text-stone-500 font-sans hidden sm:inline font-bold">
          {clues.across.length + clues.down.length} {t.clues}
        </span>
      </div>

      {/* Clues Content Container with min-h-0 and flex-1 */}
      <div className="flex-1 min-h-0 flex flex-col">
        {/* VIEW 1: BOTH TABS SIDE-BY-SIDE */}
        {activeTab === 'both' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 h-full min-h-0 flex-1">
            {/* Across Column */}
            <div className="flex flex-col h-full min-h-0 bg-stone-50/70 border border-stone-200 rounded-xl p-3">
              <div className="flex items-center justify-between border-b border-red-200/80 pb-2 mb-2 shrink-0">
                <span className="font-bold text-red-900 text-sm font-telugu flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-red-600"></span>
                  <span>{t.across}</span>
                </span>
                <span className="text-xs text-stone-500 font-sans font-medium">
                  {clues.across.length} {language === 'te' ? 'ఆధారాలు' : 'clues'}
                </span>
              </div>
              <div className="flex-1 min-h-0 overflow-y-auto space-y-1 pr-2.5 divide-y divide-stone-100">
                {clues.across.map((c) => renderClueItem(c, 'across'))}
              </div>
            </div>

            {/* Down Column */}
            <div className="flex flex-col h-full min-h-0 bg-stone-50/70 border border-stone-200 rounded-xl p-3">
              <div className="flex items-center justify-between border-b border-blue-200/80 pb-2 mb-2 shrink-0">
                <span className="font-bold text-blue-900 text-sm font-telugu flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-blue-600"></span>
                  <span>{t.down}</span>
                </span>
                <span className="text-xs text-stone-500 font-sans font-medium">
                  {clues.down.length} {language === 'te' ? 'ఆధారాలు' : 'clues'}
                </span>
              </div>
              <div className="flex-1 min-h-0 overflow-y-auto space-y-1 pr-2.5 divide-y divide-stone-100">
                {clues.down.map((c) => renderClueItem(c, 'down'))}
              </div>
            </div>
          </div>
        )}

        {/* VIEW 2: ACROSS ONLY (Full Width 2-Column Grid of Clues) */}
        {activeTab === 'across' && (
          <div className="flex flex-col h-full min-h-0 bg-stone-50/70 border border-stone-200 rounded-xl p-3.5 flex-1">
            <div className="flex items-center justify-between border-b border-red-200/80 pb-2 mb-2 shrink-0">
              <span className="font-bold text-red-900 text-base font-telugu flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-red-600"></span>
                <span>{t.across}</span>
                <span className="text-xs bg-red-100 text-red-800 px-2.5 py-0.5 rounded-full font-mono font-bold">
                  {clues.across.length} {t.clues}
                </span>
              </span>
              <span className="text-xs text-stone-500 font-sans">
                {language === 'te' ? 'అన్ని అడ్డం ఆధారాలు' : 'All Across Clues'}
              </span>
            </div>
            {/* 2-column grid of across clues so user sees almost all without scrolling */}
            <div className="flex-1 min-h-0 overflow-y-auto pr-3">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-1.5">
                {clues.across.map((c) => renderClueItem(c, 'across'))}
              </div>
            </div>
          </div>
        )}

        {/* VIEW 3: DOWN ONLY (Full Width 2-Column Grid of Clues) */}
        {activeTab === 'down' && (
          <div className="flex flex-col h-full min-h-0 bg-stone-50/70 border border-stone-200 rounded-xl p-3.5 flex-1">
            <div className="flex items-center justify-between border-b border-blue-200/80 pb-2 mb-2 shrink-0">
              <span className="font-bold text-blue-900 text-base font-telugu flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-blue-600"></span>
                <span>{t.down}</span>
                <span className="text-xs bg-blue-100 text-blue-800 px-2.5 py-0.5 rounded-full font-mono font-bold">
                  {clues.down.length} {t.clues}
                </span>
              </span>
              <span className="text-xs text-stone-500 font-sans">
                {language === 'te' ? 'అన్ని నిలువు ఆధారాలు' : 'All Down Clues'}
              </span>
            </div>
            {/* 2-column grid of down clues so user sees almost all without scrolling */}
            <div className="flex-1 min-h-0 overflow-y-auto pr-3">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-1.5">
                {clues.down.map((c) => renderClueItem(c, 'down'))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
