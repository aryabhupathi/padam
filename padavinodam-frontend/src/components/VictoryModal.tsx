import React, { useEffect } from 'react';
import { Trophy, Sparkles, Clock, Coins, Play, Home, Share2, X, Award, CheckCircle2 } from 'lucide-react';
import type { GameDifficulty } from '../types/puzzle';
import type { Language } from '../utils/translations';
import { TenaliRamaMascot } from './TenaliRamaMascot';
import confetti from 'canvas-confetti';

export interface VictoryStats {
  timerSeconds: number;
  earnedCoins: number;
  speedBonusCoins: number;
  earnedScore: number;
  isUnderTime: boolean;
  difficulty: GameDifficulty;
  isDailyChallenge?: boolean;
}

interface VictoryModalProps {
  isOpen: boolean;
  onClose: () => void; // Dismiss modal to review grid
  stats: VictoryStats;
  language: Language;
  onNextPuzzle: () => void;
  onGoHome: () => void;
  onShareWhatsApp: () => void;
}

export const VictoryModal: React.FC<VictoryModalProps> = ({
  isOpen,
  onClose,
  stats,
  language,
  onNextPuzzle,
  onGoHome,
  onShareWhatsApp
}) => {
  // Fire secondary confetti burst when modal mounts
  useEffect(() => {
    if (isOpen) {
      confetti({
        particleCount: 120,
        spread: 80,
        origin: { y: 0.5 }
      });
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const m = Math.floor(stats.timerSeconds / 60);
  const s = stats.timerSeconds % 60;
  const timeFormatted = `${m}:${s.toString().padStart(2, '0')}`;

  const getCourtTitle = () => {
    if (stats.difficulty === 'kids') {
      return language === 'te' ? 'బాల విద్వాంసుడు 📜' : 'Young Scholar 📜';
    }
    if (stats.difficulty === 'easy') {
      return language === 'te' ? 'ఆస్థాన పద శిల్పి 📜' : 'Court Word Sculptor 📜';
    }
    if (stats.difficulty === 'medium') {
      return language === 'te' ? 'విజయనగర విద్వాంసుడు 👑' : 'Vijayanagara Scholar 👑';
    }
    return language === 'te' ? 'అష్టదిగ్గజ పండితుడు 💎' : 'Ashtadiggaja Laureate 💎';
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/65 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 select-none overflow-y-auto font-telugu animate-in fade-in duration-200">
      <div className="relative w-full max-w-md sm:max-w-lg bg-gradient-to-b from-[#FFFDF8] via-[#FFF9F0] to-[#FEF3E2] rounded-3xl sm:rounded-[2.2rem] shadow-2xl border-3 sm:border-4 border-amber-400/90 overflow-hidden my-auto animate-in zoom-in-95 duration-300">
        
        {/* Ornate Top Golden Banner */}
        <div className="bg-gradient-to-r from-amber-600 via-yellow-500 to-amber-600 p-3 sm:p-4 text-amber-950 flex items-center justify-between border-b-2 border-amber-400 shadow-sm relative overflow-hidden">
          {/* Subtle Golden Sheen Sweep */}
          <div className="absolute inset-0 w-1/2 h-full bg-gradient-to-r from-transparent via-white/30 to-transparent pointer-events-none animate-pulse" />
          
          <div className="flex items-center gap-2 relative z-10">
            <span className="p-1.5 rounded-full bg-white/30 backdrop-blur-xs">
              <Trophy size={20} className="text-amber-950 fill-yellow-200" />
            </span>
            <span className="text-xs sm:text-sm font-black tracking-wider uppercase">
              {language === 'te' ? 'విజయ ఘనత • పదవినోదం' : 'Victory Celebration • Padavinodam'}
            </span>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-full hover:bg-black/10 transition text-amber-950 cursor-pointer relative z-10"
            title={language === 'te' ? 'గ్రిడ్‌ను చూడండి (Review Grid)' : 'Review Grid'}
          >
            <X size={20} />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-4 sm:p-6 flex flex-col items-center text-center space-y-4">
          
          {/* Celebrating Mascot & Laurel Crown */}
          <div className="relative flex flex-col items-center">
            {/* Ambient Golden Glow Behind Mascot */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-40 h-40 sm:w-48 sm:h-48 rounded-full bg-gradient-to-tr from-amber-400/35 via-orange-300/30 to-yellow-300/25 blur-2xl pointer-events-none" />

            <div className="relative z-10 w-28 h-32 sm:w-36 sm:h-40 flex items-center justify-center">
              <TenaliRamaMascot mood="celebrating" className="w-full h-full" />
            </div>

            {/* Victory Title */}
            <div className="space-y-1 mt-1 z-10">
              <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-gradient-to-r from-amber-900 to-amber-800 text-amber-100 border border-amber-400 text-xs sm:text-sm font-extrabold shadow-md">
                <Sparkles size={14} className="text-yellow-300 animate-spin" />
                <span>{getCourtTitle()}</span>
                <Sparkles size={14} className="text-yellow-300 animate-spin" />
              </div>

              <h2 className="text-2xl sm:text-3xl font-black text-amber-950 tracking-wide pt-1">
                {language === 'te' ? '🎉 అద్భుతం! పజిల్ పూర్తయింది!' : '🎉 Splendid! Puzzle Solved!'}
              </h2>

              <p className="text-xs sm:text-sm font-semibold text-amber-900/90 max-w-xs sm:max-w-sm mx-auto">
                {language === 'te'
                  ? 'మీ అపారమైన పదసంపదతో రాజాస్థాన పజిల్ విజయవంతంగా పూరించబడింది!'
                  : 'You cracked every clue and completed the Royal Crossword!'}
              </p>
            </div>
          </div>

          {/* Performance Summary Cards (2x2 Grid) */}
          <div className="w-full grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-2.5 pt-1">
            
            {/* 1. Time Taken */}
            <div className="p-2.5 sm:p-3 rounded-2xl bg-white/90 border border-amber-200/90 shadow-xs flex flex-col items-center">
              <span className="text-[10px] sm:text-xs text-stone-500 font-bold flex items-center gap-1">
                <Clock size={12} className="text-amber-600" />
                <span>{language === 'te' ? 'సమయం' : 'Time'}</span>
              </span>
              <span className="font-mono font-black text-sm sm:text-base md:text-lg text-amber-950 mt-0.5">
                {timeFormatted}
              </span>
              {stats.isUnderTime && (
                <span className="text-[9px] font-extrabold text-emerald-700 bg-emerald-100 px-1.5 py-0.2 rounded-full mt-1 border border-emerald-300">
                  {language === 'te' ? '⚡ వేగ బోనస్' : '⚡ Speed Bonus'}
                </span>
              )}
            </div>

            {/* 2. Coins Earned */}
            <div className="p-2.5 sm:p-3 rounded-2xl bg-white/90 border border-amber-200/90 shadow-xs flex flex-col items-center">
              <span className="text-[10px] sm:text-xs text-stone-500 font-bold flex items-center gap-1">
                <Coins size={12} className="text-amber-600" />
                <span>{language === 'te' ? 'నాణాలు' : 'Coins'}</span>
              </span>
              <span className="font-mono font-black text-sm sm:text-base md:text-lg text-emerald-800 mt-0.5">
                +{stats.earnedCoins} 🪙
              </span>
              {stats.speedBonusCoins > 0 && (
                <span className="text-[9px] font-bold text-amber-800 bg-amber-100 px-1.5 py-0.2 rounded-full mt-1">
                  (+{stats.speedBonusCoins} బోనస్)
                </span>
              )}
            </div>

            {/* 3. Score Earned */}
            <div className="p-2.5 sm:p-3 rounded-2xl bg-white/90 border border-amber-200/90 shadow-xs flex flex-col items-center">
              <span className="text-[10px] sm:text-xs text-stone-500 font-bold flex items-center gap-1">
                <Award size={12} className="text-amber-600" />
                <span>{language === 'te' ? 'స్కోరు' : 'Score'}</span>
              </span>
              <span className="font-mono font-black text-sm sm:text-base md:text-lg text-amber-950 mt-0.5">
                +{stats.earnedScore}
              </span>
              <span className="text-[9px] font-bold text-stone-500 mt-1">
                {stats.difficulty.toUpperCase()}
              </span>
            </div>

            {/* 4. Accuracy / Status */}
            <div className="p-2.5 sm:p-3 rounded-2xl bg-white/90 border border-amber-200/90 shadow-xs flex flex-col items-center">
              <span className="text-[10px] sm:text-xs text-stone-500 font-bold flex items-center gap-1">
                <CheckCircle2 size={12} className="text-emerald-600" />
                <span>{language === 'te' ? 'ఫలితం' : 'Accuracy'}</span>
              </span>
              <span className="font-bold text-sm sm:text-base md:text-lg text-emerald-700 mt-0.5">
                100%
              </span>
              <span className="text-[9px] font-bold text-emerald-800 bg-emerald-100 px-1.5 py-0.2 rounded-full mt-1 border border-emerald-300">
                {language === 'te' ? 'ఖచ్చితం' : 'Perfect'}
              </span>
            </div>
          </div>

          {/* Action CTAs Section */}
          <div className="w-full space-y-2.5 pt-1">
            
            {/* 1. Primary Giant "Play Next Puzzle" Button (Push to Next) */}
            <button
              type="button"
              onClick={onNextPuzzle}
              className="w-full py-3.5 sm:py-4 px-6 rounded-2xl sm:rounded-3xl bg-gradient-to-r from-emerald-500 via-emerald-600 to-teal-700 hover:from-emerald-600 hover:to-teal-800 text-white font-black text-lg sm:text-xl border-2 sm:border-3 border-emerald-300 shadow-xl active:scale-97 transition-all cursor-pointer flex items-center justify-center gap-2.5 relative overflow-hidden group"
            >
              {/* Internal Sheen Sweep */}
              <div className="absolute inset-0 w-1/2 h-full bg-gradient-to-r from-transparent via-white/30 to-transparent pointer-events-none group-hover:translate-x-full transition-transform duration-700" />

              <div className="p-1 rounded-full bg-white/20">
                <Play size={20} className="fill-white translate-x-0.5" />
              </div>
              <span className="tracking-wide drop-shadow-sm">
                {language === 'te' ? 'తదుపరి కొత్త పజిల్ ఆడండి' : 'Play Next Puzzle'}
              </span>
              <Sparkles size={18} className="text-emerald-200 animate-pulse" />
            </button>

            {/* Secondary Action Row: Share & Go Home */}
            <div className="grid grid-cols-2 gap-2">
              {/* WhatsApp Share Button */}
              <button
                type="button"
                onClick={onShareWhatsApp}
                className="py-2.5 sm:py-3 px-3 rounded-xl sm:rounded-2xl bg-white hover:bg-emerald-50 border-2 border-emerald-300/80 text-emerald-800 text-xs sm:text-sm font-extrabold shadow-xs transition active:scale-97 flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Share2 size={16} className="text-emerald-600 shrink-0" />
                <span>{language === 'te' ? 'వాట్సాప్ షేర్' : 'Share Status'}</span>
              </button>

              {/* Home Screen Button */}
              <button
                type="button"
                onClick={onGoHome}
                className="py-2.5 sm:py-3 px-3 rounded-xl sm:rounded-2xl bg-white hover:bg-amber-50 border-2 border-amber-300/80 text-amber-950 text-xs sm:text-sm font-extrabold shadow-xs transition active:scale-97 flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Home size={16} className="text-amber-700 shrink-0" />
                <span>{language === 'te' ? 'హోమ్ స్క్రీన్' : 'Back to Home'}</span>
              </button>
            </div>

            {/* Review Grid Secondary Action */}
            <button
              type="button"
              onClick={onClose}
              className="w-full py-1.5 text-center text-xs font-bold text-stone-500 hover:text-stone-800 underline transition cursor-pointer"
            >
              {language === 'te' ? '🔍 పజిల్‌ని పరిశీలించండి (Review Grid)' : '🔍 Review Completed Grid'}
            </button>
          </div>

        </div>
      </div>
    </div>
  );
};
