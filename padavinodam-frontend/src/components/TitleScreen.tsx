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

      {/* 2. Center Branding: Grand Unified Royal Hero Showcase (One unbroken card, zero cuts) */}
      <main className="relative z-10 w-full max-w-sm sm:max-w-md md:max-w-lg mx-auto flex flex-col items-center text-center my-auto py-2">
        {/* Golden Aura Glow */}
        <div className="absolute inset-0 -m-8 flex items-center justify-center pointer-events-none">
          <div className="w-72 h-72 sm:w-96 sm:h-96 md:w-[460px] md:h-[460px] rounded-full bg-gradient-to-tr from-amber-400/30 via-orange-300/25 to-yellow-300/20 blur-3xl animate-halo-radiate" />
        </div>

        {/* Grand Unified Royal Hero Showcase Card */}
        <div className="relative z-10 w-full max-w-[280px] sm:max-w-[340px] md:max-w-[400px] mb-3 animate-in zoom-in-95 duration-700">
          <div className="relative w-full aspect-[1.08] rounded-3xl md:rounded-[2.2rem] overflow-hidden shadow-2xl border-3 md:border-4 border-amber-400/90 bg-gradient-to-b from-amber-100/60 to-amber-50/80 animate-tenali-float">
            <img
              src="/assets/tenali_royal_hero_card.png"
              alt="పదవినోదం - తెనాలి రామ"
              className="w-full h-full object-cover object-center pointer-events-none"
            />
            {/* Automatic Diagonal Golden Light Sheen Sweep */}
            <div className="absolute inset-0 w-1/2 h-full bg-gradient-to-r from-transparent via-white/35 to-transparent pointer-events-none animate-logo-sheen" />
          </div>
        </div>

        {/* Royal Subtitle & Tagline */}
        <div className="relative z-10 space-y-1 animate-in fade-in slide-in-from-bottom-2 duration-700">
          <h2 className="text-base sm:text-lg md:text-2xl font-extrabold text-amber-950 tracking-wide">
            {language === 'te'
              ? 'శ్రీకృష్ణదేవరాయల ఆస్థాన పద వినోదం'
              : 'Royal Vijayanagara Crossword'}
          </h2>
          <p className="text-xs md:text-sm font-semibold text-amber-800/90 max-w-xs sm:max-w-md mx-auto">
            {language === 'te'
              ? 'స్వచ్ఛమైన తెలుగు పద ప్రహేళికా వేదిక'
              : 'Pure Telugu Crossword Gaming Experience'}
          </p>
        </div>
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
