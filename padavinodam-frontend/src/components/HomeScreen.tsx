import React, { useState } from 'react';
import type { GameDifficulty } from '../types/puzzle';
import type { Language } from '../utils/translations';
import { TRANSLATIONS } from '../utils/translations';
import {
  Bell,
  BellOff,
  Flame,
  Play,
  Grid3X3,
  Scroll,
  RotateCcw,
  ShieldCheck,
  Sparkles,
  Lock,
  X,
  Clock,
  ChevronRight
} from 'lucide-react';
import { templeAudio } from '../utils/templeAudio';

interface HomeScreenProps {
  language: Language;
  onToggleLanguage: () => void;
  coins: number;
  energyPoints: number;
  onOpenTopUp: (mode?: 'points' | 'kids') => void;
  onOpenPrivacy: () => void;
  onStartDaily: () => void;
  onStartClassic: (diff: GameDifficulty) => void;
  onStartStory: () => void;
  hasActiveSession: boolean;
  activeSessionInfo?: {
    difficulty: GameDifficulty;
    timerSeconds: number;
  } | null;
  onResumeGame: () => void;
  isKidsUnlocked: boolean;
}

export const HomeScreen: React.FC<HomeScreenProps> = ({
  language,
  onToggleLanguage,
  coins,
  energyPoints,
  onOpenTopUp,
  onOpenPrivacy,
  onStartDaily,
  onStartClassic,
  onStartStory,
  hasActiveSession,
  activeSessionInfo,
  onResumeGame,
  isKidsUnlocked
}) => {
  const t = TRANSLATIONS[language];
  const [isMuted, setIsMuted] = useState(templeAudio.isMuted());
  const [isClassicModalOpen, setIsClassicModalOpen] = useState(false);

  // Read or calculate streak count from localStorage
  const [streakCount] = useState<number>(() => {
    const saved = localStorage.getItem('padam_streak_count');
    return saved !== null ? parseInt(saved, 10) : 3;
  });

  const handleToggleSound = () => {
    const next = templeAudio.toggleMute();
    setIsMuted(next);
    if (!next) {
      templeAudio.playTempleBell();
    }
  };

  const handleStartDailyWithSound = () => {
    if (!isMuted) {
      templeAudio.playTempleBell();
    }
    onStartDaily();
  };

  const formatTimer = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  const difficultyDetails: {
    diff: GameDifficulty;
    nameTe: string;
    nameEn: string;
    size: string;
    time: string;
    badgeColor: string;
    locked?: boolean;
  }[] = [
    {
      diff: 'kids',
      nameTe: 'చిన్నారులు',
      nameEn: 'Kids Mode',
      size: '5x5',
      time: '2:00 mins',
      badgeColor: 'border-pink-300 bg-pink-50 text-pink-900',
      locked: !isKidsUnlocked
    },
    {
      diff: 'easy',
      nameTe: 'సులభం',
      nameEn: 'Easy',
      size: '7x7',
      time: '3:30 mins',
      badgeColor: 'border-emerald-300 bg-emerald-50 text-emerald-900'
    },
    {
      diff: 'medium',
      nameTe: 'మధ్యమం',
      nameEn: 'Medium',
      size: '9x9',
      time: '6:00 mins',
      badgeColor: 'border-amber-300 bg-amber-50 text-amber-900'
    },
    {
      diff: 'hard',
      nameTe: 'కఠినం',
      nameEn: 'Hard',
      size: '12x12',
      time: '10:00 mins',
      badgeColor: 'border-rose-300 bg-rose-50 text-rose-900'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#F7EFE1] via-[#FBF7EE] to-[#F5ECE0] text-stone-900 flex flex-col justify-between selection:bg-amber-200 select-none font-telugu p-3 sm:p-5 relative overflow-x-hidden">
      {/* 1. Top Status & Wallet Bar */}
      <header className="w-full max-w-lg mx-auto flex items-center justify-between gap-1.5 pt-1 pb-3">
        {/* Left: Coins Pill */}
        <button
          type="button"
          onClick={() => onOpenTopUp('points')}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/90 backdrop-blur-xs border border-amber-300/80 shadow-xs hover:bg-amber-50 active:scale-95 transition cursor-pointer"
          title="నాణేల వివరాలు (Coins)"
        >
          <span className="text-amber-500 text-sm">🪙</span>
          <span className="font-mono font-bold text-xs sm:text-sm text-stone-800">{coins}</span>
        </button>

        {/* Center: Energy Pill */}
        <button
          type="button"
          onClick={() => onOpenTopUp('points')}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/90 backdrop-blur-xs border border-amber-300/80 shadow-xs hover:bg-amber-50 active:scale-95 transition cursor-pointer"
          title="శక్తి పాయింట్లు (Energy)"
        >
          <span className="text-amber-500 text-sm">⚡</span>
          <span className="font-mono font-bold text-xs sm:text-sm text-stone-800">{energyPoints}</span>
        </button>

        {/* Right Controls: Sound, Language, Privacy */}
        <div className="flex items-center gap-1.5">
          {/* Sound Toggle */}
          <button
            type="button"
            onClick={handleToggleSound}
            className={`p-2 rounded-full border shadow-xs transition active:scale-95 cursor-pointer ${
              !isMuted
                ? 'bg-amber-100/90 text-amber-900 border-amber-300 hover:bg-amber-200'
                : 'bg-white/80 text-stone-400 border-stone-200 hover:bg-stone-100'
            }`}
            title={!isMuted ? 'ధ్వని ఆన్ (Sound On)' : 'ధ్వని మ్యూట్ (Muted)'}
          >
            {!isMuted ? <Bell size={15} className="text-amber-700" /> : <BellOff size={15} />}
          </button>

          {/* Language Switch */}
          <button
            type="button"
            onClick={onToggleLanguage}
            className="px-2.5 py-1.5 bg-white/90 hover:bg-amber-50 border border-amber-300/80 text-amber-950 rounded-full text-xs font-bold font-sans shadow-xs transition active:scale-95 cursor-pointer"
            title="Switch Language (భాష మార్చు)"
          >
            {language === 'te' ? 'EN' : 'TEL'}
          </button>

          {/* Privacy Policy */}
          <button
            type="button"
            onClick={onOpenPrivacy}
            className="p-2 bg-white/90 hover:bg-amber-50 border border-stone-300/80 text-stone-700 rounded-full shadow-xs transition active:scale-95 cursor-pointer"
            title="Privacy Policy"
          >
            <ShieldCheck size={15} className="text-emerald-700" />
          </button>
        </div>
      </header>

      {/* 2. Main Content Container */}
      <main className="w-full max-w-md mx-auto flex-1 flex flex-col items-center justify-center space-y-4 py-2">
        {/* Ornate Tenali Rama Hero Graphic */}
        <div className="relative w-full flex flex-col items-center text-center">
          <div className="relative max-w-[270px] sm:max-w-[320px] w-full aspect-[4/3] rounded-3xl overflow-hidden shadow-xl border-2 border-amber-300/80 bg-amber-50/50">
            <img
              src="/assets/tenali_home_hero.png"
              alt="పదవినోదం - తెనాలి రామ"
              className="w-full h-full object-cover object-top hover:scale-102 transition duration-500"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-stone-900/20 via-transparent to-transparent pointer-events-none" />
          </div>

          <p className="mt-2 text-xs font-bold text-amber-900 tracking-wide bg-amber-100/70 border border-amber-200/80 px-3 py-0.5 rounded-full shadow-2xs">
            {t.welcomeGreeting}
          </p>
        </div>

        {/* 3. Resume Active Game Banner (If session exists) */}
        {hasActiveSession && activeSessionInfo && (
          <div className="w-full bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 rounded-2xl p-3.5 text-white shadow-lg flex items-center justify-between border border-amber-300 animate-in fade-in slide-in-from-top-2 duration-200">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-white/20 backdrop-blur-xs">
                <RotateCcw size={18} className="text-amber-100" />
              </div>
              <div className="text-left">
                <p className="text-xs font-bold text-amber-100">{t.resumeActiveGame}</p>
                <p className="text-[11px] text-amber-50">
                  {activeSessionInfo.difficulty.toUpperCase()} • {formatTimer(activeSessionInfo.timerSeconds)}
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={onResumeGame}
              className="px-3.5 py-1.5 bg-white text-amber-950 font-bold rounded-xl text-xs shadow-md hover:bg-amber-50 active:scale-95 transition cursor-pointer flex items-center gap-1"
            >
              <span>కొనసాగించు</span>
              <ChevronRight size={14} />
            </button>
          </div>
        )}

        {/* 4. Center Floating Hero Card: Streak & Play Daily Challenge */}
        <div className="w-full bg-white/90 backdrop-blur-md rounded-3xl p-5 border-2 border-amber-300/85 shadow-xl text-center space-y-3.5 relative overflow-hidden">
          {/* Streak & Difficulty Badges */}
          <div className="flex items-center justify-center gap-2">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-orange-100/90 border border-orange-300 text-orange-800 text-xs font-extrabold shadow-2xs">
              <Flame size={15} className="text-orange-500 fill-orange-500 animate-pulse" />
              <span>{streakCount} {t.streakDays}</span>
            </div>
            <div className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-amber-50 border border-amber-200 text-amber-900 text-[11px] font-bold">
              <Clock size={12} className="text-amber-700" />
              <span>{language === 'te' ? 'మధ్యమం 9x9 • 10 నిమి' : 'Medium 9x9 • 10m'}</span>
            </div>
          </div>

          {/* Primary Action Button: Large Emerald-Gold CTA */}
          <button
            type="button"
            onClick={handleStartDailyWithSound}
            className="w-full py-4 px-6 rounded-2xl bg-gradient-to-r from-emerald-600 via-emerald-700 to-teal-800 hover:from-emerald-700 hover:to-teal-900 border-2 border-emerald-400 text-white font-extrabold text-base sm:text-lg shadow-xl shadow-emerald-950/20 active:scale-97 transition duration-150 flex items-center justify-center gap-2.5 cursor-pointer group"
          >
            <div className="p-1 rounded-full bg-white/20 group-hover:scale-110 transition">
              <Play size={18} className="fill-white translate-x-0.5" />
            </div>
            <span className="tracking-wide">{t.playDailyBtn}</span>
            <Sparkles size={16} className="text-emerald-200 animate-pulse" />
          </button>
        </div>

        {/* 5. Game Mode Tiles (2-Column Grid) */}
        <div className="w-full grid grid-cols-2 gap-3">
          {/* Tile 1: Classic Game (Opens Size Modal) */}
          <button
            type="button"
            onClick={() => setIsClassicModalOpen(true)}
            className="bg-white/85 hover:bg-white backdrop-blur-xs rounded-2xl p-4 border-2 border-amber-200/90 hover:border-amber-400 shadow-md text-left transition active:scale-95 cursor-pointer flex flex-col justify-between group"
          >
            <div className="flex items-center justify-between mb-2">
              <div className="p-2 rounded-xl bg-amber-100/80 border border-amber-300 text-amber-800 group-hover:scale-110 transition">
                <Grid3X3 size={20} />
              </div>
              <ChevronRight size={16} className="text-stone-400 group-hover:translate-x-0.5 transition" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-stone-900">{t.classicGame}</h3>
              <p className="text-[11px] text-stone-500 leading-tight mt-0.5">{t.classicGameDesc}</p>
            </div>
          </button>

          {/* Tile 2: Tenali Story Mode */}
          <button
            type="button"
            onClick={onStartStory}
            className="bg-white/85 hover:bg-white backdrop-blur-xs rounded-2xl p-4 border-2 border-amber-200/90 hover:border-amber-400 shadow-md text-left transition active:scale-95 cursor-pointer flex flex-col justify-between group"
          >
            <div className="flex items-center justify-between mb-2">
              <div className="p-2 rounded-xl bg-amber-100/80 border border-amber-300 text-amber-800 group-hover:scale-110 transition">
                <Scroll size={20} />
              </div>
              <ChevronRight size={16} className="text-stone-400 group-hover:translate-x-0.5 transition" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-stone-900">{t.storyGame}</h3>
              <p className="text-[11px] text-stone-500 leading-tight mt-0.5">{t.storyGameDesc}</p>
            </div>
          </button>
        </div>
      </main>

      {/* 6. Footer */}
      <footer className="w-full max-w-md mx-auto text-center pt-2 pb-1 text-[11px] text-stone-500">
        <p className="font-medium">
          {t.appName} • {language === 'te' ? 'స్వచ్ఛమైన తెలుగు క్రాస్‌వర్డ్ ప్లాట్‌ఫామ్' : 'Pure Telugu Crossword Platform'}
        </p>
      </footer>

      {/* 7. Classic Mode Difficulty Selection Modal */}
      {isClassicModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl shadow-2xl max-w-sm w-full border-2 border-amber-300 overflow-hidden font-telugu">
            <div className="bg-gradient-to-r from-amber-700 via-amber-800 to-amber-900 text-white p-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="p-1.5 bg-amber-500/20 border border-amber-400/30 rounded-xl">
                  <Grid3X3 size={20} className="text-amber-300" />
                </div>
                <div>
                  <h3 className="text-sm sm:text-base font-bold">{t.selectSizeTitle}</h3>
                  <p className="text-[11px] text-amber-200">
                    {language === 'te' ? 'మీకు నచ్చిన గ్రిడ్ పరిమాణాన్ని ఎంచుకోండి' : 'Choose your desired grid size'}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsClassicModalOpen(false)}
                className="p-1.5 hover:bg-white/20 rounded-full text-white cursor-pointer transition"
              >
                <X size={18} />
              </button>
            </div>

            <div className="p-4 space-y-2.5">
              {difficultyDetails.map(item => (
                <button
                  key={item.diff}
                  type="button"
                  onClick={() => {
                    if (item.locked) {
                      setIsClassicModalOpen(false);
                      onOpenTopUp('kids');
                      return;
                    }
                    setIsClassicModalOpen(false);
                    onStartClassic(item.diff);
                  }}
                  className={`w-full p-3.5 rounded-2xl border-2 flex items-center justify-between transition active:scale-97 cursor-pointer text-left ${
                    item.locked
                      ? 'border-stone-200 bg-stone-50 opacity-75'
                      : 'border-amber-200/90 hover:border-amber-400 bg-amber-50/40 hover:bg-amber-100/60'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className="font-mono font-extrabold text-sm sm:text-base px-2.5 py-1 rounded-xl bg-white border border-amber-200 text-amber-950 shadow-2xs">
                      {item.size}
                    </span>
                    <div>
                      <h4 className="font-bold text-stone-900 text-xs sm:text-sm flex items-center gap-1.5">
                        <span>{language === 'te' ? item.nameTe : item.nameEn}</span>
                        {item.locked && <Lock size={13} className="text-amber-600" />}
                      </h4>
                      <p className="text-[11px] text-stone-500">{item.time}</p>
                    </div>
                  </div>
                  <ChevronRight size={16} className="text-stone-400" />
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
