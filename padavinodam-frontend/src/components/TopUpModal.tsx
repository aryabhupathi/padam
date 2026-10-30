import React from 'react';
import { X, Zap, Sparkles, Baby, Lock, Hourglass, ShieldCheck, Check } from 'lucide-react';
import type { Language } from '../utils/translations';

interface TopUpModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentPoints: number;
  currentCoins?: number;
  isKidsUnlocked: boolean;
  language: Language;
  onAddPoints: (points: number, coins: number) => void;
  onUnlockKids: () => void;
  initialMode?: 'points' | 'kids';
}

export const TopUpModal: React.FC<TopUpModalProps> = ({
  isOpen,
  onClose,
  currentPoints,
  currentCoins = 0,
  isKidsUnlocked,
  language,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-200 print:hidden overflow-y-auto font-telugu">
      <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full border border-stone-200 overflow-hidden relative my-auto">
        {/* Header */}
        <div className="bg-gradient-to-r from-amber-600 via-orange-600 to-rose-600 text-white p-4 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-white/20 rounded-xl backdrop-blur-xs">
              <Zap size={22} className="text-yellow-300 fill-yellow-300" />
            </div>
            <div>
              <h3 className="text-lg font-bold">
                {language === 'te' ? 'పాయింట్లు & విభాగాల టాప్-అప్' : 'Points & Modes Top-Up'}
              </h3>
              <p className="text-xs text-white/90">
                {language === 'te' ? 'చెల్లింపుల విభాగం • త్వరలో అందుబాటులోకి వస్తుంది' : 'In-App Purchases • Available in Future'}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 hover:bg-white/20 rounded-full transition text-white/90 hover:text-white cursor-pointer"
          >
            <X size={20} />
          </button>
        </div>

        {/* Current Balance & Free Auto-Regen Status */}
        <div className="px-4 py-3 bg-amber-50/70 border-b border-amber-200/60 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div>
              <span className="text-[10px] text-stone-600 block">
                {language === 'te' ? 'శక్తి నిల్వ:' : 'Energy:'}
              </span>
              <div className="flex items-center gap-1 font-bold text-sm text-amber-950 font-mono">
                <Zap size={14} className="text-amber-500 fill-amber-500" />
                <span>{currentPoints}</span>
                {currentPoints <= 100 ? (
                  <span className="text-stone-400 text-[10px] font-normal">/ 100</span>
                ) : (
                  <span className="text-amber-700 text-[10px] font-bold">⚡BOOST</span>
                )}
              </div>
            </div>
            <div className="border-l border-amber-200/80 pl-3">
              <span className="text-[10px] text-stone-600 block">
                {language === 'te' ? 'క్లూ నాణాలు:' : 'Clue Coins:'}
              </span>
              <div className="flex items-center gap-1 font-bold text-sm text-amber-950 font-mono">
                <span className="text-amber-600">🪙</span>
                <span>{currentCoins}</span>
              </div>
            </div>
          </div>
          <div className="text-right bg-white px-2.5 py-1 rounded-lg border border-amber-200 shadow-2xs">
            <span className="text-[11px] text-amber-800 font-medium block">
              ⏰ {language === 'te' ? 'ఉచిత రీఛార్జ్' : 'Free Auto-Regen'}
            </span>
            <span className="text-[10px] text-stone-500">
              {language === 'te' ? 'ప్రతి 2 గంటలకు 1 పాయింట్' : '1 point every 2 hours'}
            </span>
          </div>
        </div>

        {/* Content Body with Payment Pause Mask */}
        <div className="p-4 space-y-4">
          {/* Main "Available in Future" Feature Mask Card */}
          <div className="relative rounded-2xl overflow-hidden border-2 border-amber-300 bg-gradient-to-br from-amber-50/90 via-orange-50/80 to-yellow-50/90 p-4 sm:p-5 text-center shadow-md space-y-3">
            {/* Hourglass & Lock Medallion */}
            <div className="relative w-14 h-14 mx-auto flex items-center justify-center">
              <div className="absolute inset-0 rounded-full bg-amber-400/30 blur-md animate-pulse" />
              <div className="relative w-13 h-13 rounded-full bg-gradient-to-tr from-amber-500 to-yellow-400 p-0.5 shadow-md flex items-center justify-center">
                <div className="w-full h-full rounded-full bg-white flex items-center justify-center text-amber-700">
                  <Hourglass size={24} className="text-amber-600 animate-spin" style={{ animationDuration: '8s' }} />
                </div>
              </div>
            </div>

            {/* Status Heading */}
            <div className="space-y-1">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-200/90 border border-amber-400 text-amber-950 text-xs font-extrabold uppercase tracking-wide">
                <Lock size={12} className="text-amber-800" />
                <span>{language === 'te' ? 'చెల్లింపుల విభాగం తాత్కాలికంగా నిలిపివేయబడింది' : 'Payments Temporarily Paused'}</span>
              </div>

              <h4 className="text-base sm:text-lg font-black text-amber-950 pt-1">
                {language === 'te'
                  ? 'త్వరలోనే సరికొత్త ఫీచర్లతో అందుబాటులోకి వస్తుంది!'
                  : 'Available in a Future Update!'}
              </h4>

              <p className="text-xs text-stone-600 max-w-sm mx-auto leading-relaxed">
                {language === 'te'
                  ? 'మా డిజిటల్ చెల్లింపుల వ్యవస్థ ప్రస్తుతానికి అప్‌గ్రేడ్ అవుతోంది. భవిష్యత్ అప్‌డేట్‌లో డైరెక్ట్ యాప్ కొనుగోళ్లు అందుబాటులోకి వస్తాయి. అప్పటివరకు రోజువారీ పజిల్స్, ఉచిత రీఛార్జ్ & ఆదివారం స్పెషల్స్‌ను ఉచితంగా ఆస్వాదించండి!'
                  : 'In-app payment and top-up features are paused for an upcoming platform upgrade and will be available in a future update. All daily challenges, Sunday specials, and auto-recharging energy remain 100% free!'}
              </p>
            </div>

            {/* Free Perks Highlight Card */}
            <div className="bg-white/90 rounded-xl p-3 border border-amber-200/90 text-left text-xs space-y-1.5 shadow-2xs">
              <div className="flex items-center gap-2 text-emerald-800 font-bold">
                <Check size={14} className="text-emerald-600 shrink-0" />
                <span>{language === 'te' ? 'రోజువారీ పద ప్రహేళిక — 100% ఉచితం' : 'Daily Crossword Challenge — 100% Free'}</span>
              </div>
              <div className="flex items-center gap-2 text-emerald-800 font-bold">
                <Check size={14} className="text-emerald-600 shrink-0" />
                <span>{language === 'te' ? 'ఆదివారం స్పెషల్స్ — ఉచిత ప్రవేశం' : 'Sunday Themed Specials — Free Access'}</span>
              </div>
              <div className="flex items-center gap-2 text-emerald-800 font-bold">
                <Check size={14} className="text-emerald-600 shrink-0" />
                <span>{language === 'te' ? 'శక్తి పాయింట్లు — ప్రతి 2 గంటలకు ఆటోమేటిక్ ఉచిత రీఛార్జ్' : 'Energy Points — Automatic Free Regen'}</span>
              </div>
            </div>
          </div>

          {/* Masked Package Preview Section */}
          <div className="space-y-2">
            <div className="flex items-center justify-between px-1">
              <label className="text-[11px] font-bold text-stone-500 uppercase tracking-wider block">
                {language === 'te' ? 'రాబోయే ప్యాకేజీలు (Upcoming Packages):' : 'Upcoming Packages:'}
              </label>
              <span className="text-[10px] font-bold text-amber-800 bg-amber-100 border border-amber-300 px-2 py-0.5 rounded-full flex items-center gap-1">
                <ShieldCheck size={11} className="text-amber-700" />
                <span>{language === 'te' ? 'త్వరలో' : 'Soon'}</span>
              </span>
            </div>

            {/* Kids Mode Package - Masked */}
            {!isKidsUnlocked && (
              <div className="w-full p-2.5 rounded-xl border border-stone-200 bg-stone-50/70 opacity-60 pointer-events-none select-none flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 bg-purple-100 text-purple-700 rounded-lg">
                    <Baby size={18} />
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="font-bold text-xs sm:text-sm text-stone-800">
                        {language === 'te' ? 'బాలల విభాగం (5x5)' : 'Kids Mode (5x5)'}
                      </span>
                      <span className="bg-purple-200 text-purple-800 text-[9px] font-bold px-1.5 py-0.2 rounded-full">
                        లైఫ్‌టైమ్
                      </span>
                    </div>
                    <p className="text-[10px] text-stone-500">
                      {language === 'te' ? 'పిల్లల కోసం ప్రత్యేక 5x5 పజిల్స్ శాశ్వతంగా అన్‌లాక్' : '5x5 puzzles for kids permanently unlocked'}
                    </p>
                  </div>
                </div>
                <span className="font-bold text-amber-800 text-[11px] bg-amber-100 border border-amber-300 px-2 py-0.5 rounded-full whitespace-nowrap">
                  {language === 'te' ? 'త్వరలో' : 'In Future'}
                </span>
              </div>
            )}

            {/* 500 Coins Pack - Masked */}
            <div className="w-full p-2.5 rounded-xl border border-stone-200 bg-stone-50/70 opacity-60 pointer-events-none select-none flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-amber-100 text-amber-700 rounded-lg">
                  <Sparkles size={18} />
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="font-bold text-xs sm:text-sm text-stone-800">
                      {language === 'te' ? '500 నాణాలు + 500 శక్తి పాయింట్లు' : '500 Coins + 500 Energy'}
                    </span>
                    <span className="bg-rose-200 text-rose-800 text-[9px] font-bold px-1.5 py-0.2 rounded-full">
                      సూపర్ ప్యాక్
                    </span>
                  </div>
                  <p className="text-[10px] text-stone-500">
                    {language === 'te' ? 'అదనపు క్లూలు, అక్షర వెల్లడి & పజిల్ మార్పిడులు' : 'Extra clues, reveals & skips'}
                  </p>
                </div>
              </div>
              <span className="font-bold text-amber-800 text-[11px] bg-amber-100 border border-amber-300 px-2 py-0.5 rounded-full whitespace-nowrap">
                {language === 'te' ? 'త్వరలో' : 'In Future'}
              </span>
            </div>

            {/* 150 Coins Pack - Masked */}
            <div className="w-full p-2.5 rounded-xl border border-stone-200 bg-stone-50/70 opacity-60 pointer-events-none select-none flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-stone-100 text-stone-700 rounded-lg">
                  <Zap size={18} />
                </div>
                <div>
                  <span className="font-bold text-xs sm:text-sm text-stone-800">
                    {language === 'te' ? '150 నాణాలు + 150 శక్తి పాయింట్లు' : '150 Coins + 150 Energy'}
                  </span>
                  <p className="text-[10px] text-stone-500">
                    {language === 'te' ? 'అదనపు క్లూలు & తక్షణ సూచనల స్టార్టర్ ప్యాక్' : 'Extra clues & instant hints starter pack'}
                  </p>
                </div>
              </div>
              <span className="font-bold text-amber-800 text-[11px] bg-amber-100 border border-amber-300 px-2 py-0.5 rounded-full whitespace-nowrap">
                {language === 'te' ? 'త్వరలో' : 'In Future'}
              </span>
            </div>
          </div>

          {/* Close Action Button */}
          <button
            type="button"
            onClick={onClose}
            className="w-full py-3 px-4 rounded-2xl bg-gradient-to-r from-amber-600 via-orange-600 to-amber-700 hover:from-amber-700 hover:to-orange-700 text-white font-extrabold text-sm sm:text-base shadow-lg transition active:scale-97 cursor-pointer"
          >
            {language === 'te' ? 'సరే, ఆట కొనసాగించండి (Got it)' : 'Got it, Continue Playing'}
          </button>
        </div>
      </div>
    </div>
  );
};
