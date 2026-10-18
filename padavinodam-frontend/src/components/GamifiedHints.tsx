import React from 'react';
import type { HintOption, HintType } from '../types/puzzle';
import { TRANSLATIONS, type Language } from '../utils/translations';
import { Eye, Clock, Wand2, HelpCircle, Flame, Coins } from 'lucide-react';

interface GamifiedHintsProps {
  hints: HintOption[];
  coins: number;
  language: Language;
  onUseHint: (hintType: HintType) => void;
  onAddFreeCoins: () => void;
}

export const GamifiedHints: React.FC<GamifiedHintsProps> = ({
  hints,
  coins,
  language,
  onUseHint,
  onAddFreeCoins
}) => {
  const t = TRANSLATIONS[language];
  const maxUsed = Math.max(...hints.map(h => h.usedCount), 0);

  const getIcon = (id: HintType) => {
    switch (id) {
      case 'reveal_syllable':
        return <Eye size={16} className="text-amber-600" />;
      case 'extra_time':
        return <Clock size={16} className="text-blue-600" />;
      case 'reveal_word':
        return <Wand2 size={16} className="text-purple-600" />;
      case 'first_letter_clue':
        return <HelpCircle size={16} className="text-rose-600" />;
    }
  };

  const getHintDetails = (hint: HintOption) => {
    if (language === 'en') {
      const enMap: Record<HintType, { name: string; desc: string }> = {
        reveal_syllable: { name: 'Reveal Letter', desc: 'Fills selected cell' },
        extra_time: { name: 'Time Boost (+60s)', desc: '+60s bonus time' },
        reveal_word: { name: 'Reveal Word', desc: 'Solves current word' },
        first_letter_clue: { name: 'First Letter Peek', desc: 'Shows word starting syllable' }
      };
      return enMap[hint.id] || { name: hint.name, desc: hint.description };
    }
    return { name: hint.teluguName, desc: hint.description };
  };

  return (
    <div className="bg-gradient-to-r from-amber-50/70 via-stone-50 to-orange-50/70 border border-amber-200/80 rounded-xl p-3.5 shadow-sm w-full my-3">
      {/* Header with Coin Wallet */}
      <div className="flex items-center justify-between mb-2.5 pb-2 border-b border-amber-200/60">
        <div className="flex items-center gap-2">
          <div className="p-1 bg-amber-500 text-white rounded-md shadow-xs">
            <Flame size={16} className="animate-pulse" />
          </div>
          <div>
            <h4 className="font-bold text-stone-900 text-sm md:text-base font-telugu">
              {t.powerUpsTitle} ({t.mostUsed})
            </h4>
            <p className="text-[11px] text-stone-500 font-sans">
              {language === 'te'
                ? 'గెలవడానికి అత్యధికంగా ఉపయోగించే పవర్-అప్‌లను ఎంచుకోండి'
                : 'Choose popular power-ups to help solve the puzzle faster'}
            </p>
          </div>
        </div>

        {/* Coins Wallet */}
        <div className="flex items-center gap-1.5 bg-amber-100/90 border border-amber-300 px-2.5 py-1 rounded-full shadow-2xs">
          <Coins size={15} className="text-amber-600 fill-amber-500" />
          <span className="font-bold text-amber-950 text-xs md:text-sm font-mono">
            {coins}
          </span>
          <button
            type="button"
            onClick={onAddFreeCoins}
            title={t.freeCoinsBtn}
            className="text-[10px] bg-amber-600 hover:bg-amber-700 text-white font-bold px-1.5 py-0.5 rounded-full ml-1 transition"
          >
            +50
          </button>
        </div>
      </div>

      {/* Hints Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
        {hints.map((hint) => {
          const isMostUsed = hint.usedCount > 0 && hint.usedCount === maxUsed;
          const canAfford = coins >= hint.coinCost;
          const details = getHintDetails(hint);

          return (
            <button
              key={hint.id}
              type="button"
              onClick={() => onUseHint(hint.id)}
              disabled={!canAfford}
              className={`relative flex flex-col items-start p-2.5 rounded-lg border text-left transition-all duration-150 active:scale-96 ${
                isMostUsed
                  ? 'bg-amber-50/90 border-amber-400 ring-1 ring-amber-300 shadow-xs'
                  : 'bg-white hover:bg-stone-50 border-stone-200 shadow-2xs'
              } ${!canAfford ? 'opacity-50 cursor-not-allowed' : 'hover:border-amber-400'}`}
            >
              {isMostUsed && (
                <span className="absolute -top-2 right-1.5 bg-gradient-to-r from-red-600 to-amber-600 text-white text-[9px] font-bold px-1.5 py-0.2 rounded-full shadow-xs flex items-center gap-0.5 font-sans">
                  <Flame size={9} /> {t.mostUsed} ({hint.usedCount})
                </span>
              )}

              <div className="flex items-center justify-between w-full mb-1">
                <div className="p-1 bg-stone-100 rounded-md">
                  {getIcon(hint.id)}
                </div>
                <span className="text-[11px] font-bold font-mono text-amber-700 flex items-center gap-0.5">
                  <Coins size={11} className="text-amber-500 fill-amber-500" />
                  {hint.coinCost}
                </span>
              </div>

              <div className="font-bold text-stone-900 text-xs font-telugu line-clamp-1">
                {details.name}
              </div>
              <div className="text-[10px] text-stone-500 font-sans line-clamp-1">
                {details.desc}
              </div>

              {hint.usedCount > 0 && (
                <span className="text-[9px] text-stone-400 mt-1 font-sans">
                  {language === 'te' ? `వాడినవి: ${hint.usedCount} సార్లు` : `Used: ${hint.usedCount} times`}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};
