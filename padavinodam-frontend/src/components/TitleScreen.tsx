import React, { useState, useEffect } from 'react';
import type { Language } from '../utils/translations';
import { templeAudio } from '../utils/templeAudio';
import { Play, Sparkles, Volume2, VolumeX, Globe } from 'lucide-react';

interface TitleScreenProps {
  language: Language;
  onToggleLanguage: () => void;
  onPlay: () => void;
}

// Representative Telugu characters that float gently in the royal backdrop
const BACKGROUND_TELUGU_LETTERS = [
  'అ', 'ఆ', 'క', 'గ', 'చ', 'జ', 'త', 'ద', 'న', 'ప', 'భ', 'మ', 'య', 'ర', 'ల', 'వ', 'శ', 'స', 'హ'
];

export const TitleScreen: React.FC<TitleScreenProps> = ({
  language,
  onToggleLanguage,
  onPlay
}) => {
  const [progress, setProgress] = useState(12);
  const [isLoaded, setIsLoaded] = useState(false);
  const [isExiting, setIsExiting] = useState(false);
  const [isMuted, setIsMuted] = useState(templeAudio.isMuted());

  // Fixed randomized floating letter positions for stable rendering
  const [floatingParticles] = useState(() =>
    BACKGROUND_TELUGU_LETTERS.map((char, i) => ({
      char,
      left: 5 + ((i * 19) % 90), // Spread horizontally 5% to 95%
      top: 10 + ((i * 23) % 80),
      size: 18 + (i % 4) * 8, // 18px to 42px
      duration: 12 + (i % 6) * 3, // 12s to 27s
      delay: (i % 5) * 1.5,
      opacity: 0.08 + (i % 3) * 0.06 // 0.08 to 0.20 subtle watermark
    }))
  );

  // Candy Crush-style asset boot simulation (0% -> 100%)
  useEffect(() => {
    const startTime = Date.now();
    const duration = 1600; // ms

    const interval = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const ratio = Math.min(elapsed / duration, 1);
      const nextProgress = Math.min(100, Math.round(ratio * 100));
      setProgress(nextProgress);

      if (nextProgress >= 100) {
        clearInterval(interval);
        setIsLoaded(true);
      }
    }, 35);

    return () => clearInterval(interval);
  }, []);

  const handleToggleSound = (e: React.MouseEvent) => {
    e.stopPropagation();
    const next = templeAudio.toggleMute();
    setIsMuted(next);
  };

  const handleStartGame = () => {
    if (isExiting) return;
    // Essential for mobile browsers to unlock AudioContext
    templeAudio.unlockContext();
    if (!templeAudio.isMuted()) {
      templeAudio.playTempleBell();
    }
    setIsExiting(true);
    setTimeout(() => {
      onPlay();
    }, 450);
  };

  const getStatusText = () => {
    if (progress < 35) {
      return language === 'te'
        ? 'రాజాస్థానాన్ని సిద్ధం చేస్తోంది...'
        : 'Entering Vijayanagara Court...';
    }
    if (progress < 75) {
      return language === 'te'
        ? 'తెలుగు పద సంపదను సమకూరుస్తోంది...'
        : 'Loading Telugu Lexicon...';
    }
    if (progress < 100) {
      return language === 'te'
        ? 'రోజువారీ సవాళ్లను సిద్ధం చేస్తోంది...'
        : 'Crafting Crossword Puzzles...';
    }
    return language === 'te' ? 'ఆట సిద్ధమైంది!' : 'Ready to Play!';
  };

  return (
    <div
      className={`fixed inset-0 z-50 flex flex-col justify-between items-center p-4 sm:p-6 md:p-10 select-none overflow-hidden font-telugu transition-all duration-500 ease-out ${
        isExiting
          ? 'opacity-0 scale-110 blur-xs pointer-events-none'
          : 'opacity-100 scale-100'
      }`}
      style={{
        background:
          'radial-gradient(circle at 50% 35%, #FFF7ED 0%, #FDF2E2 40%, #F7E4C8 75%, #ECD0A7 100%)'
      }}
    >
      {/* Dynamic Keyframes for Title Animations & Button Glow */}
      <style>{`
        @keyframes letterDrift {
          0% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-18px) rotate(4deg); }
          100% { transform: translateY(0px) rotate(0deg); }
        }
        @keyframes logoSheen {
          0% { transform: translateX(-150%) skewX(-25deg); opacity: 0; }
          20% { opacity: 0.85; }
          40%, 100% { transform: translateX(250%) skewX(-25deg); opacity: 0; }
        }
        @keyframes candyPlayPulse {
          0%, 100% {
            transform: scale(1);
            box-shadow: 0 0 0 0 rgba(16, 185, 129, 0.6), 0 10px 25px -5px rgba(5, 150, 105, 0.5);
          }
          50% {
            transform: scale(1.05);
            box-shadow: 0 0 0 16px rgba(16, 185, 129, 0), 0 15px 35px -5px rgba(5, 150, 105, 0.7);
          }
        }
        @keyframes haloRadiate {
          0%, 100% { transform: scale(0.95); opacity: 0.25; }
          50% { transform: scale(1.2); opacity: 0.55; }
        }
        @keyframes slowMandala {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        @keyframes tenaliFloat {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-7px) rotate(0.6deg); }
        }
        .animate-letter-drift {
          animation: letterDrift ease-in-out infinite;
        }
        .animate-logo-sheen {
          animation: logoSheen 3.8s ease-in-out infinite;
        }
        .animate-candy-play {
          animation: candyPlayPulse 1.8s cubic-bezier(0.4, 0, 0.2, 1) infinite;
        }
        .animate-halo-radiate {
          animation: haloRadiate 3s ease-in-out infinite;
        }
        .animate-slow-mandala {
          animation: slowMandala 90s linear infinite;
        }
        .animate-tenali-float {
          animation: tenaliFloat 4s ease-in-out infinite;
        }
      `}</style>

      {/* Background Watermark Mandala */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[520px] h-[520px] sm:w-[700px] sm:h-[700px] md:w-[850px] md:h-[850px] pointer-events-none opacity-[0.05] text-amber-900 animate-slow-mandala z-0">
        <svg viewBox="0 0 200 200" fill="currentColor">
          <circle cx="100" cy="100" r="90" stroke="currentColor" strokeWidth="2" fill="none" />
          <circle cx="100" cy="100" r="70" stroke="currentColor" strokeWidth="1.5" fill="none" />
          <path d="M100 10 L110 50 L150 60 L120 90 L130 130 L100 110 L70 130 L80 90 L50 60 L90 50 Z" />
          <path d="M100 190 L110 150 L150 140 L120 110 L130 70 L100 90 L70 70 L80 110 L50 140 L90 150 Z" />
        </svg>
      </div>

      {/* Floating Telugu Alphabet Watermark Characters */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
        {floatingParticles.map((p, idx) => (
          <span
            key={idx}
            className="absolute font-bold text-amber-900 animate-letter-drift"
            style={{
              left: `${p.left}%`,
              top: `${p.top}%`,
              fontSize: `${p.size}px`,
              opacity: p.opacity,
              animationDuration: `${p.duration}s`,
              animationDelay: `${p.delay}s`
            }}
          >
            {p.char}
          </span>
        ))}
      </div>

      {/* 1. Top Controls Bar: Sound & Language Switch */}
      <header className="relative z-10 w-full max-w-md md:max-w-xl mx-auto flex items-center justify-between pt-1">
        <div className="flex items-center gap-2">
          <span className="px-3 py-1 rounded-full bg-amber-100/90 border border-amber-300 text-amber-900 text-[11px] md:text-xs font-bold shadow-2xs flex items-center gap-1.5">
            <Sparkles size={13} className="text-amber-600 animate-spin" />
            <span>{language === 'te' ? 'ఆస్థాన ప్రహేళిక' : 'Vijayanagara Crossword'}</span>
          </span>
        </div>

        <div className="flex items-center gap-2">
          {/* Sound Toggle */}
          <button
            type="button"
            onClick={handleToggleSound}
            className={`p-2 md:p-2.5 rounded-full border shadow-xs transition active:scale-95 cursor-pointer ${
              !isMuted
                ? 'bg-amber-100 text-amber-900 border-amber-300 hover:bg-amber-200'
                : 'bg-white/80 text-stone-400 border-stone-200 hover:bg-stone-100'
            }`}
            title={!isMuted ? 'ధ్వని ఆన్ (Sound On)' : 'ధ్వని మ్యూట్ (Muted)'}
          >
            {!isMuted ? <Volume2 size={16} className="text-amber-700" /> : <VolumeX size={16} />}
          </button>

          {/* Language Switch */}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onToggleLanguage();
            }}
            className="px-3 py-1.5 bg-white/95 hover:bg-amber-50 border border-amber-300 text-amber-950 rounded-full text-xs font-bold shadow-xs transition active:scale-95 cursor-pointer flex items-center gap-1.5"
            title="Switch Language"
          >
            <Globe size={13} className="text-amber-700" />
            <span>{language === 'te' ? 'English' : 'తెలుగు'}</span>
          </button>
        </div>
      </header>

      {/* 2. Center Branding: Grand 3D Royal Logo & Tenali Rama Medallion with Floating 3D Crossword Letter Tiles */}
      <main className="relative z-10 w-full max-w-sm sm:max-w-md md:max-w-xl mx-auto flex flex-col items-center text-center my-auto py-2">
        {/* Golden Sunburst Aura Glow */}
        <div className="absolute inset-0 -m-8 flex items-center justify-center pointer-events-none">
          <div className="w-72 h-72 sm:w-96 sm:h-96 md:w-[500px] md:h-[500px] rounded-full bg-gradient-to-tr from-amber-400/30 via-orange-300/25 to-yellow-300/20 blur-3xl animate-halo-radiate" />
        </div>

        {/* Grand Royal Vijayanagara Crown Crest */}
        <div className="relative z-10 flex flex-col items-center mb-1 animate-in zoom-in-95 duration-700">
          <div className="text-amber-500 drop-shadow-md mb-1 animate-pulse">
            <svg
              className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12"
              viewBox="0 0 48 48"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              {/* Royal Crown / Crest SVG with jewels */}
              <path
                d="M24 4L29 16L42 12L36 32H12L6 12L19 16L24 4Z"
                fill="url(#goldCrownGrad)"
                stroke="#B45309"
                strokeWidth="2"
                strokeLinejoin="round"
              />
              <path
                d="M10 32C10 35 14 38 24 38C34 38 38 35 38 32V36C38 39 34 42 24 42C14 42 10 39 10 36V32Z"
                fill="url(#goldBaseGrad)"
                stroke="#B45309"
                strokeWidth="1.5"
              />
              {/* Jewel Accents */}
              <circle cx="24" cy="18" r="3" fill="#DC2626" stroke="#FEF08A" strokeWidth="1" />
              <circle cx="16" cy="24" r="2.5" fill="#2563EB" stroke="#FEF08A" strokeWidth="1" />
              <circle cx="32" cy="24" r="2.5" fill="#059669" stroke="#FEF08A" strokeWidth="1" />
              <circle cx="24" cy="7" r="2" fill="#FEF08A" />
              <defs>
                <linearGradient id="goldCrownGrad" x1="6" y1="4" x2="42" y2="32" gradientUnits="userSpaceOnUse">
                  <stop stopColor="#FEF08A" />
                  <stop offset="0.4" stopColor="#F59E0B" />
                  <stop offset="0.8" stopColor="#D97706" />
                  <stop offset="1" stopColor="#92400E" />
                </linearGradient>
                <linearGradient id="goldBaseGrad" x1="10" y1="32" x2="38" y2="42" gradientUnits="userSpaceOnUse">
                  <stop stopColor="#F59E0B" />
                  <stop offset="1" stopColor="#78350F" />
                </linearGradient>
              </defs>
            </svg>
          </div>

          {/* Standalone 3D Game Title: పదవినోదం */}
          <div className="relative inline-block">
            <h1
              className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black tracking-wider select-none relative"
              style={{
                background: 'linear-gradient(180deg, #FFFBEB 0%, #FEF08A 25%, #F59E0B 60%, #B45309 85%, #78350F 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                filter: 'drop-shadow(0 4px 0 #78350F) drop-shadow(0 8px 18px rgba(180, 83, 9, 0.45))'
              }}
            >
              {language === 'te' ? 'పదవినోదం' : 'PADAVINODAM'}
            </h1>
            {/* Sparkle Twinkles */}
            <Sparkles className="absolute -top-2 -right-4 sm:-right-6 text-amber-300 w-5 h-5 sm:w-6 sm:h-6 animate-pulse" />
            <Sparkles className="absolute -bottom-1 -left-3 sm:-left-5 text-yellow-400 w-4 h-4 sm:w-5 sm:h-5 animate-bounce" />
            {/* Logo Sheen Sweep */}
            <div className="absolute inset-0 w-1/2 h-full bg-gradient-to-r from-transparent via-white/40 to-transparent pointer-events-none animate-logo-sheen" />
          </div>

          {/* Imperial Subtitle Ribbon Banner */}
          <div className="relative inline-flex items-center px-4 py-1 sm:px-6 sm:py-1.5 rounded-full bg-gradient-to-r from-amber-900 via-amber-800 to-amber-900 text-amber-100 border-2 border-amber-400/90 shadow-lg text-xs sm:text-sm font-bold tracking-wide mt-1 animate-in fade-in duration-500">
            <span className="text-amber-300 mr-1.5">✦</span>
            <span>
              {language === 'te'
                ? 'శ్రీకృష్ణదేవరాయల ఆస్థాన ప్రహేళిక'
                : 'The Royal Vijayanagara Crossword'}
            </span>
            <span className="text-amber-300 ml-1.5">✦</span>
          </div>
        </div>

        {/* Center Mascot Presentation: Tenali Rama in Royal Ornate Medallion with Floating 3D Crossword Letter Tiles */}
        <div className="relative my-3 sm:my-4 md:my-5 flex items-center justify-center animate-in zoom-in-95 duration-700">
          {/* Floating 3D Golden Crossword Letter Tiles around Tenali (Spelling ప - ద - వి - నో - దం) */}
          {/* Tile 1: ప */}
          <div
            className="absolute -left-6 sm:-left-10 md:-left-12 top-2 sm:top-4 z-20 w-10 h-10 sm:w-12 sm:h-12 md:w-14 md:h-14 rounded-2xl bg-gradient-to-br from-amber-100 via-yellow-200 to-amber-400 border-2 border-amber-300 shadow-xl flex items-center justify-center font-black text-amber-950 text-sm sm:text-base md:text-lg animate-bounce select-none -rotate-12 cursor-default"
            style={{ animationDuration: '3.2s' }}
            title="ప"
          >
            ప
          </div>

          {/* Tile 2: ద */}
          <div
            className="absolute -right-6 sm:-right-10 md:-right-12 top-3 sm:top-5 z-20 w-10 h-10 sm:w-12 sm:h-12 md:w-14 md:h-14 rounded-2xl bg-gradient-to-br from-amber-100 via-yellow-200 to-amber-400 border-2 border-amber-300 shadow-xl flex items-center justify-center font-black text-amber-950 text-sm sm:text-base md:text-lg animate-bounce select-none rotate-12 cursor-default"
            style={{ animationDuration: '3.6s', animationDelay: '0.4s' }}
            title="ద"
          >
            ద
          </div>

          {/* Tile 3: వి */}
          <div
            className="absolute -left-5 sm:-left-9 md:-left-11 bottom-6 sm:bottom-8 z-20 w-10 h-10 sm:w-12 sm:h-12 md:w-14 md:h-14 rounded-2xl bg-gradient-to-br from-amber-100 via-yellow-200 to-amber-400 border-2 border-amber-300 shadow-xl flex items-center justify-center font-black text-amber-950 text-sm sm:text-base md:text-lg animate-bounce select-none rotate-6 cursor-default"
            style={{ animationDuration: '3.4s', animationDelay: '0.8s' }}
            title="వి"
          >
            వి
          </div>

          {/* Tile 4: నో */}
          <div
            className="absolute -right-5 sm:-right-9 md:-right-11 bottom-5 sm:bottom-7 z-20 w-10 h-10 sm:w-12 sm:h-12 md:w-14 md:h-14 rounded-2xl bg-gradient-to-br from-amber-100 via-yellow-200 to-amber-400 border-2 border-amber-300 shadow-xl flex items-center justify-center font-black text-amber-950 text-sm sm:text-base md:text-lg animate-bounce select-none -rotate-6 cursor-default"
            style={{ animationDuration: '3.8s', animationDelay: '1.2s' }}
            title="నో"
          >
            నో
          </div>

          {/* Tile 5: దం */}
          <div
            className="absolute -bottom-3.5 z-20 px-3 py-1 sm:px-4 sm:py-1.5 rounded-xl bg-gradient-to-r from-amber-500 via-yellow-300 to-amber-500 border-2 border-amber-100 shadow-xl flex items-center justify-center font-black text-amber-950 text-xs sm:text-sm md:text-base animate-pulse select-none"
            title="దం"
          >
            దం
          </div>

          {/* The Royal Medallion Housing Tenali Rama */}
          <div className="relative w-36 h-36 sm:w-44 sm:h-44 md:w-56 md:h-56 rounded-full p-1.5 md:p-2 bg-gradient-to-b from-amber-300 via-yellow-200 to-amber-500 shadow-[0_15px_45px_rgba(217,119,6,0.35)] ring-4 sm:ring-6 ring-amber-300/35 animate-tenali-float">
            <div className="w-full h-full rounded-full overflow-hidden border-2 border-amber-400/90 bg-gradient-to-b from-amber-100 to-amber-200 shadow-inner relative">
              <img
                src="/assets/tenali_portrait_clean.png"
                alt="పదవినోదం - తెనాలి రామ"
                className="w-full h-full object-cover object-center pointer-events-none"
              />
              {/* Medallion Light Sheen Sweep */}
              <div className="absolute inset-0 w-1/2 h-full bg-gradient-to-r from-transparent via-white/40 to-transparent pointer-events-none animate-logo-sheen" />
            </div>
          </div>
        </div>

        {/* Heritage Tagline */}
        <p className="text-xs sm:text-sm font-semibold text-amber-900/90 max-w-xs sm:max-w-md mx-auto pt-1 animate-in fade-in duration-700">
          {language === 'te'
            ? 'స్వచ్ఛమైన తెలుగు పద ప్రహేళిక • ప్రతిరోజూ కొత్త సవాలు'
            : 'Pure Telugu Crossword Puzzle • Fresh Everyday'}
        </p>
      </main>

      {/* 3. Bottom Action Section: Loading Progress Bar OR Big Bouncing "PLAY" Button */}
      <footer className="relative z-10 w-full max-w-sm sm:max-w-md md:max-w-lg mx-auto pb-4 sm:pb-6 md:pb-8 flex flex-col items-center">
        {!isLoaded ? (
          /* Loading Track (0% -> 100%) */
          <div className="w-full max-w-xs sm:max-w-sm space-y-2.5 animate-in fade-in duration-300">
            <div className="flex items-center justify-between text-xs sm:text-sm font-bold text-stone-800 px-1">
              <span className="flex items-center gap-1.5 text-amber-950">
                <span className="inline-block w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                <span>{getStatusText()}</span>
              </span>
              <span className="font-mono text-emerald-800 bg-emerald-100 border border-emerald-300 px-2 py-0.5 rounded-full text-xs font-extrabold">
                {progress}%
              </span>
            </div>

            {/* Candy-style striped progress track */}
            <div className="w-full h-5 sm:h-6 bg-stone-200/90 rounded-full p-1 border-2 border-amber-300 shadow-inner overflow-hidden relative">
              <div
                className="h-full rounded-full bg-gradient-to-r from-emerald-500 via-teal-600 to-emerald-600 transition-all duration-150 ease-out shadow-sm relative overflow-hidden"
                style={{ width: `${progress}%` }}
              >
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/35 to-transparent animate-logo-sheen" />
              </div>
            </div>
            <p className="text-center text-[11px] text-stone-500 font-medium">
              {language === 'te' ? 'ఆట సిద్ధమవుతోంది...' : 'Initializing game assets...'}
            </p>
          </div>
        ) : (
          /* Candy Crush-style Grand Bouncing "PLAY" Button */
          <div className="w-full max-w-xs sm:max-w-sm flex flex-col items-center space-y-3 animate-in zoom-in-95 duration-400">
            <button
              type="button"
              onClick={handleStartGame}
              className="w-full py-4 sm:py-5 px-8 md:px-10 rounded-3xl bg-gradient-to-r from-emerald-500 via-emerald-600 to-teal-700 hover:from-emerald-600 hover:to-teal-800 text-white font-extrabold text-xl sm:text-2xl md:text-3xl border-3 border-emerald-300 shadow-2xl active:scale-95 transition-all cursor-pointer flex items-center justify-center gap-3 animate-candy-play relative overflow-hidden group"
            >
              {/* Internal Sheen Sweep */}
              <div className="absolute inset-0 w-1/2 h-full bg-gradient-to-r from-transparent via-white/40 to-transparent pointer-events-none animate-logo-sheen" />

              <div className="p-2 rounded-full bg-white/20 group-hover:scale-110 transition shadow-inner">
                <Play size={24} className="fill-white translate-x-0.5" />
              </div>
              <span className="tracking-wider drop-shadow-md">
                {language === 'te' ? 'ఆడండి' : 'PLAY'}
              </span>
              <Sparkles size={22} className="text-emerald-200 animate-pulse" />
            </button>

            <p className="text-xs sm:text-sm font-bold text-amber-900/90 tracking-wide animate-pulse">
              {language === 'te'
                ? '👆 ప్రారంభించడానికి తాకండి'
                : '👆 Tap to Enter Game'}
            </p>
          </div>
        )}
      </footer>
    </div>
  );
};
