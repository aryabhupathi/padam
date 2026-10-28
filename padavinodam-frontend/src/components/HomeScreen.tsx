import React, { useState, useEffect } from 'react';
import type { GameDifficulty } from '../types/puzzle';
import type { Language } from '../utils/translations';
import { TRANSLATIONS } from '../utils/translations';
import {
  Bell,
  BellOff,
  Music,
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
  ChevronRight,
  Users,
  Share2,
  Film,
  BookOpen,
  Volume2
} from 'lucide-react';
import { templeAudio } from '../utils/templeAudio';
import { speakTenaliGreeting, getRandomTenaliQuote } from '../utils/speech';

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
  onStartTwoPlayer?: () => void;
  onStartThemed?: (theme: 'cinema' | 'proverbs') => void;
  onDeductCoins?: (amount: number) => boolean;
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
  onStartTwoPlayer,
  onStartThemed,
  onDeductCoins,
  hasActiveSession,
  activeSessionInfo,
  onResumeGame,
  isKidsUnlocked
}) => {
  const t = TRANSLATIONS[language];
  const [isMuted, setIsMuted] = useState(templeAudio.isMuted());
  const [isAmbientPlaying, setIsAmbientPlaying] = useState(templeAudio.isAmbientPlaying());
  const [isClassicModalOpen, setIsClassicModalOpen] = useState(false);
  const [pendingUnlockTheme, setPendingUnlockTheme] = useState<'cinema' | 'proverbs' | null>(null);
  const [speechBubbleText, setSpeechBubbleText] = useState<string | null>(null);
  const [isMascotBouncing, setIsMascotBouncing] = useState(false);
  const [copiedToast, setCopiedToast] = useState(false);
  const [isEntered, setIsEntered] = useState(false);

  const SPECIAL_COIN_COST = 30;
  const isSunday = new Date().getDay() === 0;

  const getWeekKey = () => {
    const d = new Date();
    const year = d.getFullYear();
    const oneJan = new Date(year, 0, 1);
    const numberOfDays = Math.floor((d.getTime() - oneJan.getTime()) / (24 * 60 * 60 * 1000));
    const weekNumber = Math.ceil((numberOfDays + oneJan.getDay() + 1) / 7);
    return `${year}_W${weekNumber}`;
  };

  const isSpecialUnlocked = (theme: 'cinema' | 'proverbs') => {
    if (isSunday) return true;
    return localStorage.getItem(`padam_special_unlocked_${theme}_${getWeekKey()}`) === 'true';
  };

  const handleSelectTheme = (theme: 'cinema' | 'proverbs') => {
    if (isSpecialUnlocked(theme)) {
      setIsClassicModalOpen(false);
      if (onStartThemed) onStartThemed(theme);
    } else {
      setPendingUnlockTheme(theme);
    }
  };

  const handleConfirmUnlock = () => {
    if (!pendingUnlockTheme) return;
    if (onDeductCoins && onDeductCoins(SPECIAL_COIN_COST)) {
      localStorage.setItem(`padam_special_unlocked_${pendingUnlockTheme}_${getWeekKey()}`, 'true');
      templeAudio.playTempleBell();
      const chosen = pendingUnlockTheme;
      setPendingUnlockTheme(null);
      setIsClassicModalOpen(false);
      if (onStartThemed) onStartThemed(chosen);
    } else {
      setPendingUnlockTheme(null);
      setIsClassicModalOpen(false);
      onOpenTopUp('points');
    }
  };

  useEffect(() => {
    // Staggered cascade entrance trigger on mount
    const timer = setTimeout(() => {
      setIsEntered(true);
    }, 40);
    return () => clearTimeout(timer);
  }, []);

  // Read or calculate streak count from localStorage
  const [streakCount] = useState<number>(() => {
    const saved = localStorage.getItem('padam_streak_count');
    return saved !== null ? parseInt(saved, 10) : 3;
  });

  const handleToggleSound = () => {
    const next = templeAudio.toggleMute();
    setIsMuted(next);
    setIsAmbientPlaying(templeAudio.isAmbientPlaying());
    if (!next) {
      templeAudio.playTempleBell();
    }
  };

  const handleToggleAmbient = () => {
    const next = templeAudio.toggleAmbientMusic();
    setIsAmbientPlaying(next);
  };

  const handleTenaliTap = () => {
    setIsMascotBouncing(true);
    const quote = getRandomTenaliQuote();
    setSpeechBubbleText(language === 'te' ? quote.te : quote.en);
    if (!isMuted) {
      speakTenaliGreeting();
    }
    setTimeout(() => setIsMascotBouncing(false), 700);
    setTimeout(() => setSpeechBubbleText(null), 7000);
  };

  const handleStartDailyWithSound = () => {
    if (!isMuted) {
      templeAudio.playTempleBell();
    }
    onStartDaily();
  };

  const handleChallengeFriend = () => {
    const baseUrl = window.location.origin + window.location.pathname;
    const challengeUrl = `${baseUrl}?challenge=friend&diff=medium`;
    const shareText =
      language === 'te'
        ? `🧩 మిత్రమా! నేను 'పదవినోదం' తెలుగు క్రాస్‌వర్డ్‌లో 9x9 పజిల్‌ని పూర్తి చేశాను. మీరు నన్ను ఓడించగలరా? ఇప్పుడే ఆడండి:\n👉 ${challengeUrl}`
        : `🧩 Friend! I completed today's 9x9 Telugu crossword in Padavinodam. Can you beat my time? Play now:\n👉 ${challengeUrl}`;

    if (navigator.clipboard) {
      navigator.clipboard.writeText(shareText).catch(() => {});
      setCopiedToast(true);
      setTimeout(() => setCopiedToast(false), 3000);
    }
    const whatsappUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(shareText)}`;
    window.open(whatsappUrl, '_blank');
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
    <div className="min-h-screen bg-gradient-to-b from-[#F7EFE1] via-[#FBF7EE] to-[#F5ECE0] text-stone-900 flex flex-col justify-between selection:bg-amber-200 select-none font-telugu p-3 sm:p-5 md:p-8 relative overflow-x-hidden">
      {/* Dynamic Keyframe Styles for High-End Game Aesthetics */}
      <style>{`
        @keyframes tenaliFloat {
          0%, 100% { transform: translateY(0px) scale(1); }
          50% { transform: translateY(-7px) scale(1.01); }
        }
        @keyframes goldSheenSweep {
          0% { transform: translateX(-150%) skewX(-20deg); }
          30%, 100% { transform: translateX(250%) skewX(-20deg); }
        }
        @keyframes slowMandalaRotate {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        @keyframes emberHalo {
          0%, 100% { box-shadow: 0 0 10px rgba(249, 115, 22, 0.25); }
          50% { box-shadow: 0 0 20px rgba(249, 115, 22, 0.6); }
        }
        .animate-tenali-float {
          animation: tenaliFloat 4s ease-in-out infinite;
        }
        .animate-gold-sheen {
          animation: goldSheenSweep 3.6s ease-in-out infinite;
        }
        .animate-slow-mandala {
          animation: slowMandalaRotate 100s linear infinite;
        }
        .animate-ember-halo {
          animation: emberHalo 2.5s ease-in-out infinite;
        }
      `}</style>

      {/* Background Ornate Slow Rotating Mandala Watermark */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[480px] h-[480px] sm:w-[650px] sm:h-[650px] md:w-[850px] md:h-[850px] pointer-events-none opacity-[0.04] text-amber-900 animate-slow-mandala z-0">
        <svg viewBox="0 0 200 200" fill="currentColor">
          <circle cx="100" cy="100" r="90" stroke="currentColor" strokeWidth="2" fill="none" />
          <circle cx="100" cy="100" r="70" stroke="currentColor" strokeWidth="1.5" fill="none" />
          <path d="M100 10 L110 50 L150 60 L120 90 L130 130 L100 110 L70 130 L80 90 L50 60 L90 50 Z" />
          <path d="M100 190 L110 150 L150 140 L120 110 L130 70 L100 90 L70 70 L80 110 L50 140 L90 150 Z" />
        </svg>
      </div>

      {/* Copied Toast Banner */}
      {copiedToast && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 bg-emerald-800 text-white text-xs md:text-sm font-bold px-4 py-2 md:px-5 md:py-2.5 rounded-full shadow-xl border border-emerald-400 animate-in fade-in duration-200">
          {t.challengeCopied}
        </div>
      )}

      {/* 1. Top Status & Wallet Bar */}
      <header
        className={`relative z-10 w-full max-w-md md:max-w-xl lg:max-w-2xl mx-auto flex items-center justify-between gap-1.5 md:gap-3 pt-1 md:pt-2 pb-3 md:pb-4 transition-all duration-600 ease-out ${
          isEntered ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-6'
        }`}
        style={{ transitionDelay: '80ms' }}
      >
        {/* Left: Coins Pill */}
        <button
          type="button"
          onClick={() => onOpenTopUp('points')}
          className="flex items-center gap-1.5 md:gap-2 px-3 py-1.5 md:px-4 md:py-2 rounded-full bg-white/90 backdrop-blur-xs border border-amber-300/80 shadow-xs hover:bg-amber-50 active:scale-95 transition cursor-pointer"
          title="నాణేల వివరాలు (Coins)"
        >
          <span className="text-amber-500 text-sm md:text-base">🪙</span>
          <span className="font-mono font-bold text-xs sm:text-sm md:text-base text-stone-800">{coins}</span>
        </button>

        {/* Center: Energy Pill */}
        <button
          type="button"
          onClick={() => onOpenTopUp('points')}
          className="flex items-center gap-1.5 md:gap-2 px-3 py-1.5 md:px-4 md:py-2 rounded-full bg-white/90 backdrop-blur-xs border border-amber-300/80 shadow-xs hover:bg-amber-50 active:scale-95 transition cursor-pointer"
          title="శక్తి పాయింట్లు (Energy)"
        >
          <span className="text-amber-500 text-sm md:text-base">⚡</span>
          <span className="font-mono font-bold text-xs sm:text-sm md:text-base text-stone-800">{energyPoints}</span>
        </button>

        {/* Right Controls: Ambient Veena BGM, Sound, Language, Privacy */}
        <div className="flex items-center gap-1.5 md:gap-2.5">
          {/* Ambient Temple BGM Music Toggle (Idea 6) */}
          <button
            type="button"
            onClick={handleToggleAmbient}
            className={`p-2 md:p-2.5 rounded-full border shadow-xs transition active:scale-95 cursor-pointer relative ${
              isAmbientPlaying
                ? 'bg-amber-200 text-amber-950 border-amber-400 animate-pulse'
                : 'bg-white/80 text-stone-400 border-stone-200 hover:bg-stone-100'
            }`}
            title={isAmbientPlaying ? 'శాంత వీణా ధ్వని ఆన్ (Temple BGM On)' : 'శాంత వీణా ధ్వని ఆఫ్ (BGM Off)'}
          >
            <Music size={14} className={`size-3.5 md:size-4 ${isAmbientPlaying ? 'text-amber-800' : ''}`} />
            {isAmbientPlaying && (
              <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
            )}
          </button>

          {/* Master Sound Toggle */}
          <button
            type="button"
            onClick={handleToggleSound}
            className={`p-2 md:p-2.5 rounded-full border shadow-xs transition active:scale-95 cursor-pointer ${
              !isMuted
                ? 'bg-amber-100/90 text-amber-900 border-amber-300 hover:bg-amber-200'
                : 'bg-white/80 text-stone-400 border-stone-200 hover:bg-stone-100'
            }`}
            title={!isMuted ? 'ధ్వని ఆన్ (Sound On)' : 'ధ్వని మ్యూట్ (Muted)'}
          >
            {!isMuted ? <Bell size={14} className="size-3.5 md:size-4 text-amber-700" /> : <BellOff size={14} className="size-3.5 md:size-4" />}
          </button>

          {/* Language Switch */}
          <button
            type="button"
            onClick={onToggleLanguage}
            className="px-2.5 py-1.5 md:px-3.5 md:py-2 bg-white/90 hover:bg-amber-50 border border-amber-300/80 text-amber-950 rounded-full text-xs md:text-sm font-bold font-sans shadow-xs transition active:scale-95 cursor-pointer"
            title="Switch Language (భాష మార్చు)"
          >
            {language === 'te' ? 'EN' : 'TEL'}
          </button>

          {/* Privacy Policy */}
          <button
            type="button"
            onClick={onOpenPrivacy}
            className="p-2 md:p-2.5 bg-white/90 hover:bg-amber-50 border border-stone-300/80 text-stone-700 rounded-full shadow-xs transition active:scale-95 cursor-pointer"
            title="Privacy Policy"
          >
            <ShieldCheck size={14} className="size-3.5 md:size-4 text-emerald-700" />
          </button>
        </div>
      </header>

      {/* 2. Main Content Container */}
      <main className="relative z-10 w-full max-w-md md:max-w-xl lg:max-w-2xl mx-auto flex-1 flex flex-col items-center justify-center space-y-3.5 md:space-y-5 lg:space-y-6 py-1 md:py-3">
        {/* Animated Tenali Rama Hero with Interactive Tap Reaction & Speech Bubble */}
        <div className="relative w-full flex flex-col items-center text-center">
          {/* Dynamic Floating Speech Bubble when Tenali is Tapped */}
          {speechBubbleText && (
            <div className="absolute -top-12 md:-top-14 z-30 bg-amber-900 text-amber-50 text-xs md:text-sm font-bold px-3.5 py-2 md:px-5 md:py-3 rounded-2xl shadow-2xl border-2 border-amber-300 max-w-[280px] md:max-w-[360px] animate-in zoom-in-95 duration-200">
              <p className="leading-snug">{speechBubbleText}</p>
              <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-0 h-0 border-x-8 border-x-transparent border-t-8 border-t-amber-900" />
            </div>
          )}

          {/* Breathing Animated Mascot Card with Elastic Staggered Drop-In */}
          <div
            onClick={handleTenaliTap}
            className={`relative max-w-[260px] sm:max-w-[310px] md:max-w-[380px] lg:max-w-[420px] w-full aspect-[4/3] rounded-3xl md:rounded-[2rem] overflow-hidden shadow-2xl border-2 md:border-3 border-amber-300/85 bg-amber-50/50 cursor-pointer transition-all duration-700 ${
              isEntered ? 'opacity-100 scale-100 translate-y-0' : 'opacity-0 scale-90 translate-y-6'
            } ${
              isMascotBouncing ? 'scale-105 rotate-1 animate-bounce' : 'animate-tenali-float hover:scale-102'
            }`}
            style={{
              transitionDelay: '220ms',
              transitionTimingFunction: 'cubic-bezier(0.34, 1.56, 0.64, 1)'
            }}
            title="తెనాలి రామకృష్ణుడిని తాకండి! (Tap Tenali to speak)"
          >
            <img
              src="/assets/tenali_home_hero.png"
              alt="పదవినోదం - తెనాలి రామ"
              className="w-full h-full object-cover object-top pointer-events-none"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-stone-900/30 via-transparent to-transparent pointer-events-none" />

            {/* Tap Me Hint Pill */}
            <div className="absolute bottom-2 md:bottom-3 left-1/2 -translate-x-1/2 px-2.5 py-0.5 md:px-3.5 md:py-1 rounded-full bg-stone-900/60 backdrop-blur-xs border border-white/30 text-white text-[10px] md:text-xs flex items-center gap-1 md:gap-1.5">
              <Volume2 size={11} className="size-2.5 md:size-3.5 text-amber-300 animate-pulse" />
              <span>నన్ను తాకండి (Tap Me)</span>
            </div>
          </div>

          <p
            className={`mt-2 md:mt-3 text-xs md:text-sm font-bold text-amber-900 tracking-wide bg-amber-100/70 border border-amber-200/80 px-3 py-0.5 md:px-4 md:py-1 rounded-full shadow-2xs transition-all duration-600 ${
              isEntered ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-3'
            }`}
            style={{ transitionDelay: '360ms' }}
          >
            {t.welcomeGreeting}
          </p>
        </div>

        {/* 3. Resume Active Game Banner (If session exists) */}
        {hasActiveSession && activeSessionInfo && (
          <div
            className={`w-full bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 rounded-2xl md:rounded-3xl p-3.5 md:p-4 text-white shadow-lg flex items-center justify-between border border-amber-300 transition-all duration-600 ${
              isEntered ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
            }`}
            style={{ transitionDelay: '420ms' }}
          >
            <div className="flex items-center gap-2.5 md:gap-3.5">
              <div className="p-2 md:p-2.5 rounded-xl md:rounded-2xl bg-white/20 backdrop-blur-xs">
                <RotateCcw size={18} className="size-4.5 md:size-5.5 text-amber-100" />
              </div>
              <div className="text-left">
                <p className="text-xs md:text-sm font-bold text-amber-100">{t.resumeActiveGame}</p>
                <p className="text-[11px] md:text-xs text-amber-50">
                  {activeSessionInfo.difficulty.toUpperCase()} • {formatTimer(activeSessionInfo.timerSeconds)}
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={onResumeGame}
              className="px-3.5 py-1.5 md:px-4.5 md:py-2 bg-white text-amber-950 font-bold rounded-xl md:rounded-2xl text-xs md:text-sm shadow-md hover:bg-amber-50 active:scale-95 transition cursor-pointer flex items-center gap-1"
            >
              <span>కొనసాగించు</span>
              <ChevronRight size={14} className="size-3.5 md:size-4" />
            </button>
          </div>
        )}

        {/* 4. Center Floating Hero Card: Streak & Play Daily Challenge */}
        <div
          className={`w-full bg-white/90 backdrop-blur-md rounded-3xl md:rounded-[2rem] p-4 sm:p-5 md:p-6 border-2 md:border-3 border-amber-300/85 shadow-xl text-center space-y-3 md:space-y-4 relative overflow-hidden transition-all duration-700 ease-out ${
            isEntered ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-8 scale-95'
          }`}
          style={{ transitionDelay: '500ms' }}
        >
          {/* Streak & Difficulty Badges with Flickering Ember Halo */}
          <div className="flex items-center justify-center gap-2 md:gap-3">
            <div className="inline-flex items-center gap-1.5 md:gap-2 px-3 py-1 md:px-4 md:py-1.5 rounded-full bg-orange-100/90 border border-orange-300 text-orange-800 text-xs md:text-sm font-extrabold shadow-2xs animate-ember-halo">
              <Flame size={15} className="size-3.5 md:size-4 text-orange-500 fill-orange-500 animate-pulse" />
              <span>{streakCount} {t.streakDays}</span>
            </div>
            <div className="inline-flex items-center gap-1 md:gap-1.5 px-2.5 py-1 md:px-3.5 md:py-1.5 rounded-full bg-amber-50 border border-amber-200 text-amber-900 text-[11px] md:text-xs font-bold">
              <Clock size={12} className="size-3 md:size-3.5 text-amber-700" />
              <span>{language === 'te' ? 'మధ్యమం 9x9 • 10 నిమి' : 'Medium 9x9 • 10m'}</span>
            </div>
          </div>

          {/* Primary Action Button: Large Emerald-Gold CTA with Periodic Shimmer Sweep */}
          <button
            type="button"
            onClick={handleStartDailyWithSound}
            className="w-full py-4 px-6 md:py-5 md:px-8 rounded-2xl md:rounded-3xl bg-gradient-to-r from-emerald-600 via-emerald-700 to-teal-800 hover:from-emerald-700 hover:to-teal-900 border-2 md:border-3 border-emerald-400 text-white font-extrabold text-base sm:text-lg md:text-xl shadow-xl shadow-emerald-950/20 active:scale-97 transition duration-150 flex items-center justify-center gap-2.5 md:gap-3 cursor-pointer relative overflow-hidden group"
          >
            {/* Automatic Diagonal Golden Light Sheen Sweep every 3.6s */}
            <div className="absolute inset-0 w-1/2 h-full bg-gradient-to-r from-transparent via-white/35 to-transparent pointer-events-none animate-gold-sheen" />

            <div className="p-1 md:p-1.5 rounded-full bg-white/20 group-hover:scale-110 transition relative z-10">
              <Play size={18} className="size-4.5 md:size-5.5 fill-white translate-x-0.5" />
            </div>
            <span className="tracking-wide relative z-10">{t.playDailyBtn}</span>
            <Sparkles size={16} className="size-4 md:size-5 text-emerald-200 animate-pulse relative z-10" />
          </button>
        </div>

        {/* 5. Game Mode Tiles (2-Column Grid) */}
        <div
          className={`w-full grid grid-cols-2 gap-2.5 md:gap-4 transition-all duration-700 ease-out ${
            isEntered ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-7'
          }`}
          style={{ transitionDelay: '650ms' }}
        >
          {/* Tile 1: Classic Game (Opens Size & Specials Modal) */}
          <button
            type="button"
            onClick={() => setIsClassicModalOpen(true)}
            className="bg-white/85 hover:bg-white backdrop-blur-xs rounded-2xl md:rounded-3xl p-3.5 md:p-5 border-2 md:border-3 border-amber-200/90 hover:border-amber-400 shadow-md text-left transition active:scale-95 cursor-pointer flex flex-col justify-between group"
          >
            <div className="flex items-center justify-between mb-2 md:mb-3">
              <div className="p-2 md:p-2.5 rounded-xl md:rounded-2xl bg-amber-100/80 border border-amber-300 text-amber-800 group-hover:scale-110 transition">
                <Grid3X3 size={19} className="size-4.5 md:size-6" />
              </div>
              <ChevronRight size={15} className="size-3.5 md:size-4 text-stone-400 group-hover:translate-x-0.5 transition" />
            </div>
            <div>
              <h3 className="font-bold text-sm md:text-base text-stone-900">{t.classicGame}</h3>
              <p className="text-[11px] md:text-xs text-stone-500 leading-tight mt-0.5 md:mt-1">{t.classicGameDesc}</p>
            </div>
          </button>

          {/* Tile 2: Tenali Story Mode */}
          <button
            type="button"
            onClick={onStartStory}
            className="bg-white/85 hover:bg-white backdrop-blur-xs rounded-2xl md:rounded-3xl p-3.5 md:p-5 border-2 md:border-3 border-amber-200/90 hover:border-amber-400 shadow-md text-left transition active:scale-95 cursor-pointer flex flex-col justify-between group"
          >
            <div className="flex items-center justify-between mb-2 md:mb-3">
              <div className="p-2 md:p-2.5 rounded-xl md:rounded-2xl bg-amber-100/80 border border-amber-300 text-amber-800 group-hover:scale-110 transition">
                <Scroll size={19} className="size-4.5 md:size-6" />
              </div>
              <ChevronRight size={15} className="size-3.5 md:size-4 text-stone-400 group-hover:translate-x-0.5 transition" />
            </div>
            <div>
              <h3 className="font-bold text-sm md:text-base text-stone-900">{t.storyGame}</h3>
              <p className="text-[11px] md:text-xs text-stone-500 leading-tight mt-0.5 md:mt-1">{t.storyGameDesc}</p>
            </div>
          </button>
        </div>

        {/* 6. Quick Action Row: Challenge a Friend & 2-Player Pass-and-Play (Ideas 5 & Social) */}
        <div
          className={`w-full grid grid-cols-2 gap-2.5 md:gap-4 transition-all duration-700 ease-out ${
            isEntered ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-7'
          }`}
          style={{ transitionDelay: '780ms' }}
        >
          {/* Challenge a Friend via WhatsApp */}
          <button
            type="button"
            onClick={handleChallengeFriend}
            className="bg-emerald-50 hover:bg-emerald-100/90 border border-emerald-300/90 rounded-2xl md:rounded-3xl p-2.5 md:p-3.5 shadow-2xs flex items-center justify-center gap-2 md:gap-2.5 text-emerald-950 font-bold text-xs md:text-sm transition active:scale-95 cursor-pointer"
            title="స్నేహితులకు సవాలు విసరండి (Challenge on WhatsApp)"
          >
            <Share2 size={15} className="size-3.5 md:size-4.5 text-emerald-700" />
            <span>{t.challengeFriend}</span>
          </button>

          {/* 2-Player Pass and Play Mode */}
          <button
            type="button"
            onClick={onStartTwoPlayer}
            className="bg-purple-50 hover:bg-purple-100/90 border border-purple-300/90 rounded-2xl md:rounded-3xl p-2.5 md:p-3.5 shadow-2xs flex items-center justify-center gap-2 md:gap-2.5 text-purple-950 font-bold text-xs md:text-sm transition active:scale-95 cursor-pointer"
            title="ఇద్దరు ఆడే ఆట (Pass & Play 2-Player)"
          >
            <Users size={15} className="size-3.5 md:size-4.5 text-purple-700" />
            <span>{t.twoPlayerMode}</span>
          </button>
        </div>
      </main>

      {/* 7. Footer */}
      <footer
        className={`relative z-10 w-full max-w-md md:max-w-xl lg:max-w-2xl mx-auto text-center pt-2 md:pt-4 pb-1 md:pb-3 text-[11px] md:text-xs text-stone-500 transition-all duration-600 ${
          isEntered ? 'opacity-100' : 'opacity-0'
        }`}
        style={{ transitionDelay: '900ms' }}
      >
        <p className="font-medium">
          {t.appName} • {language === 'te' ? 'స్వచ్ఛమైన తెలుగు క్రాస్‌వర్డ్ ప్లాట్‌ఫామ్' : 'Pure Telugu Crossword Platform'}
        </p>
      </footer>

      {/* 8. Classic Mode & Themed Specials Selection Modal (Idea 4) */}
      {isClassicModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl md:rounded-[2rem] shadow-2xl max-w-sm md:max-w-md w-full border-2 md:border-3 border-amber-300 overflow-hidden font-telugu max-h-[90vh] flex flex-col">
            <div className="bg-gradient-to-r from-amber-700 via-amber-800 to-amber-900 text-white p-4 md:p-5 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2 md:gap-3">
                <div className="p-1.5 md:p-2 bg-amber-500/20 border border-amber-400/30 rounded-xl md:rounded-2xl">
                  <Grid3X3 size={20} className="size-5 md:size-6 text-amber-300" />
                </div>
                <div>
                  <h3 className="text-sm sm:text-base md:text-lg font-bold">{t.selectSizeTitle}</h3>
                  <p className="text-[11px] md:text-xs text-amber-200">
                    {language === 'te' ? 'గ్రిడ్ పరిమాణం లేదా ప్రత్యేక థీమ్‌ను ఎంచుకోండి' : 'Choose a grid size or special theme'}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsClassicModalOpen(false)}
                className="p-1.5 md:p-2 hover:bg-white/20 rounded-full text-white cursor-pointer transition"
              >
                <X size={18} className="size-4.5 md:size-5.5" />
              </button>
            </div>

            <div className="p-4 md:p-5 space-y-2.5 md:space-y-3 overflow-y-auto">
              {/* Standard Sizes */}
              <div className="space-y-2 md:space-y-2.5">
                <p className="text-[11px] md:text-xs font-bold text-stone-500 uppercase tracking-wider px-1">
                  {language === 'te' ? 'గ్రిడ్ పరిమాణాలు (Sizes)' : 'Grid Sizes'}
                </p>
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
                    className={`w-full p-3 md:p-4 rounded-2xl md:rounded-3xl border-2 flex items-center justify-between transition active:scale-97 cursor-pointer text-left ${
                      item.locked
                        ? 'border-stone-200 bg-stone-50 opacity-75'
                        : 'border-amber-200/90 hover:border-amber-400 bg-amber-50/40 hover:bg-amber-100/60'
                    }`}
                  >
                    <div className="flex items-center gap-3 md:gap-4">
                      <span className="font-mono font-extrabold text-sm md:text-base px-2.5 py-1 md:px-3 md:py-1.5 rounded-xl md:rounded-2xl bg-white border border-amber-200 text-amber-950 shadow-2xs">
                        {item.size}
                      </span>
                      <div>
                        <h4 className="font-bold text-stone-900 text-xs sm:text-sm md:text-base flex items-center gap-1.5">
                          <span>{language === 'te' ? item.nameTe : item.nameEn}</span>
                          {item.locked && <Lock size={13} className="size-3.5 md:size-4 text-amber-600" />}
                        </h4>
                        <p className="text-[11px] md:text-xs text-stone-500">{item.time}</p>
                      </div>
                    </div>
                    <ChevronRight size={16} className="size-4 md:size-5 text-stone-400" />
                  </button>
                ))}
              </div>

              {/* Weekly Themed Specials (Sunday Free + Weekday Coin Unlock) */}
              <div className="pt-2 md:pt-3 border-t border-amber-200 space-y-2 md:space-y-2.5">
                <div className="flex items-center justify-between px-1">
                  <p className="text-[11px] md:text-xs font-bold text-amber-800 uppercase tracking-wider flex items-center gap-1">
                    <Sparkles size={12} className="size-3 md:size-3.5 text-amber-600" />
                    <span>{language === 'te' ? 'విశేష థీమ్ పజిల్స్' : 'Themed Specials'}</span>
                  </p>
                  {isSunday ? (
                    <span className="text-[10px] md:text-[11px] font-extrabold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300 animate-pulse">
                      {t.sundayFreeToday}
                    </span>
                  ) : (
                    <span className="text-[10px] md:text-[11px] font-bold px-2 py-0.5 rounded-full bg-amber-100/90 text-amber-900 border border-amber-300">
                      {language === 'te' ? 'ఆదివారం ఉచితం • నేడు 30 🪙' : 'Free on Sun • Today 30 🪙'}
                    </span>
                  )}
                </div>

                {/* 1. Tollywood Cinema Special */}
                <button
                  type="button"
                  onClick={() => handleSelectTheme('cinema')}
                  className="w-full p-3 md:p-4 rounded-2xl md:rounded-3xl border-2 border-rose-300 bg-rose-50/60 hover:bg-rose-100/70 flex items-center justify-between transition active:scale-97 cursor-pointer text-left group"
                >
                  <div className="flex items-center gap-3 md:gap-4">
                    <div className="p-2 md:p-2.5 rounded-xl md:rounded-2xl bg-white border border-rose-200 text-rose-700 shadow-2xs group-hover:scale-105 transition">
                      <Film size={18} className="size-4.5 md:size-5.5" />
                    </div>
                    <div>
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <h4 className="font-bold text-stone-900 text-xs sm:text-sm md:text-base">
                          {t.cinemaSpecial}
                        </h4>
                        {isSunday ? (
                          <span className="px-1.5 py-0.5 rounded-md bg-emerald-600 text-white text-[9px] md:text-[10px] font-extrabold tracking-wide">
                            FREE
                          </span>
                        ) : isSpecialUnlocked('cinema') ? (
                          <span className="px-1.5 py-0.5 rounded-md bg-emerald-100 text-emerald-800 border border-emerald-300 text-[9px] md:text-[10px] font-bold">
                            ✓ {t.unlockedBadge}
                          </span>
                        ) : (
                          <span className="px-1.5 py-0.5 rounded-md bg-amber-200/90 text-amber-950 border border-amber-300 text-[9px] md:text-[10px] font-bold flex items-center gap-0.5">
                            <Lock size={10} /> 30 🪙
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] md:text-xs text-stone-600 mt-0.5">{t.cinemaSpecialDesc}</p>
                    </div>
                  </div>
                  <ChevronRight size={16} className="size-4 md:size-5 text-stone-400 group-hover:translate-x-0.5 transition" />
                </button>

                {/* 2. Telugu Proverbs Special */}
                <button
                  type="button"
                  onClick={() => handleSelectTheme('proverbs')}
                  className="w-full p-3 md:p-4 rounded-2xl md:rounded-3xl border-2 border-indigo-300 bg-indigo-50/60 hover:bg-indigo-100/70 flex items-center justify-between transition active:scale-97 cursor-pointer text-left group"
                >
                  <div className="flex items-center gap-3 md:gap-4">
                    <div className="p-2 md:p-2.5 rounded-xl md:rounded-2xl bg-white border border-indigo-200 text-indigo-700 shadow-2xs group-hover:scale-105 transition">
                      <BookOpen size={18} className="size-4.5 md:size-5.5" />
                    </div>
                    <div>
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <h4 className="font-bold text-stone-900 text-xs sm:text-sm md:text-base">
                          {t.proverbsSpecial}
                        </h4>
                        {isSunday ? (
                          <span className="px-1.5 py-0.5 rounded-md bg-emerald-600 text-white text-[9px] md:text-[10px] font-extrabold tracking-wide">
                            FREE
                          </span>
                        ) : isSpecialUnlocked('proverbs') ? (
                          <span className="px-1.5 py-0.5 rounded-md bg-emerald-100 text-emerald-800 border border-emerald-300 text-[9px] md:text-[10px] font-bold">
                            ✓ {t.unlockedBadge}
                          </span>
                        ) : (
                          <span className="px-1.5 py-0.5 rounded-md bg-amber-200/90 text-amber-950 border border-amber-300 text-[9px] md:text-[10px] font-bold flex items-center gap-0.5">
                            <Lock size={10} /> 30 🪙
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] md:text-xs text-stone-600 mt-0.5">{t.proverbsSpecialDesc}</p>
                    </div>
                  </div>
                  <ChevronRight size={16} className="size-4 md:size-5 text-stone-400 group-hover:translate-x-0.5 transition" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 9. Sunday Special Weekday Coin Unlock Confirmation Modal */}
      {pendingUnlockTheme && (
        <div className="fixed inset-0 z-60 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl md:rounded-[2rem] shadow-2xl max-w-sm md:max-w-md w-full border-2 md:border-3 border-amber-400 overflow-hidden font-telugu text-center p-5 md:p-6 space-y-4 animate-in zoom-in-95 duration-200">
            {/* Top Emblem */}
            <div className="mx-auto w-14 h-14 md:w-16 md:h-16 rounded-2xl bg-gradient-to-tr from-amber-500 to-amber-300 border-2 border-amber-200 flex items-center justify-center shadow-md">
              {pendingUnlockTheme === 'cinema' ? (
                <Film size={28} className="text-amber-950" />
              ) : (
                <BookOpen size={28} className="text-amber-950" />
              )}
            </div>

            <div>
              <span className="inline-block px-3 py-1 rounded-full text-xs font-extrabold bg-amber-100 text-amber-900 border border-amber-300 mb-1.5">
                {language === 'te' ? 'ఆదివారం ప్రత్యేక ప్రహేళిక' : 'Sunday Special Crossword'}
              </span>
              <h3 className="text-base sm:text-lg md:text-xl font-bold text-stone-900">
                {pendingUnlockTheme === 'cinema' ? t.cinemaSpecial : t.proverbsSpecial}
              </h3>
            </div>

            <p className="text-xs sm:text-sm text-stone-600 leading-relaxed px-1">
              {t.unlockConfirmDesc}
            </p>

            {/* Wallet Balance Box */}
            <div className="bg-amber-50/80 border border-amber-200 rounded-2xl p-3 flex items-center justify-between text-xs sm:text-sm">
              <span className="font-semibold text-stone-700">
                {language === 'te' ? 'మీ ప్రస్తుత నాణేలు:' : 'Your Coins:'}
              </span>
              <span className="font-mono font-bold text-amber-900 flex items-center gap-1 text-sm sm:text-base">
                🪙 {coins}
              </span>
            </div>

            {/* Action Buttons */}
            <div className="space-y-2 pt-1">
              {coins >= SPECIAL_COIN_COST ? (
                <button
                  type="button"
                  onClick={handleConfirmUnlock}
                  className="w-full py-3.5 px-4 rounded-2xl bg-gradient-to-r from-amber-600 via-amber-700 to-orange-700 hover:from-amber-700 hover:to-orange-800 text-white font-extrabold text-sm md:text-base shadow-lg shadow-amber-900/20 active:scale-97 transition cursor-pointer flex items-center justify-center gap-2"
                >
                  <Sparkles size={16} />
                  <span>{t.unlockNowBtn}</span>
                </button>
              ) : (
                <div className="space-y-2">
                  <p className="text-xs font-bold text-rose-600">
                    ⚠️ {t.notEnoughCoinsSpecial}
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      setPendingUnlockTheme(null);
                      setIsClassicModalOpen(false);
                      onOpenTopUp('points');
                    }}
                    className="w-full py-3 px-4 rounded-2xl bg-gradient-to-r from-amber-500 to-orange-500 text-white font-bold text-sm shadow-md active:scale-97 transition cursor-pointer"
                  >
                    {language === 'te' ? 'నాణేలు పొందండి (Get Coins)' : 'Get Coins'}
                  </button>
                </div>
              )}

              <button
                type="button"
                onClick={() => setPendingUnlockTheme(null)}
                className="w-full py-2.5 px-4 rounded-xl text-stone-500 hover:text-stone-800 font-semibold text-xs transition cursor-pointer"
              >
                {language === 'te' ? 'ఆదివారం వరకు వేచి ఉండండి (రద్దు)' : 'Wait until Sunday (Cancel)'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
