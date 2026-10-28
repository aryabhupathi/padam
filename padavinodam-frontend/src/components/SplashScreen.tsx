import React, { useState, useEffect } from 'react';
import type { Language } from '../utils/translations';
import { templeAudio } from '../utils/templeAudio';
import { Sparkles } from 'lucide-react';

interface SplashScreenProps {
  language: Language;
  onFinish: () => void;
}

export const SplashScreen: React.FC<SplashScreenProps> = ({
  language,
  onFinish
}) => {
  const [isExiting, setIsExiting] = useState(false);

  useEffect(() => {
    // Play warm royal temple chime on opening if sound enabled
    if (!templeAudio.isMuted()) {
      templeAudio.playTempleBell();
    }

    // Auto-transition after 1200ms
    const exitTimer = setTimeout(() => {
      setIsExiting(true);
    }, 1100);

    const finishTimer = setTimeout(() => {
      onFinish();
    }, 1700);

    return () => {
      clearTimeout(exitTimer);
      clearTimeout(finishTimer);
    };
  }, [onFinish]);

  const handleSkip = () => {
    setIsExiting(true);
    setTimeout(onFinish, 200);
  };

  return (
    <div
      onClick={handleSkip}
      className={`fixed inset-0 z-50 flex flex-col justify-between items-center p-6 sm:p-8 bg-gradient-to-b from-[#F7EFE1] via-[#FBF7EE] to-[#F5ECE0] text-stone-900 select-none overflow-hidden cursor-pointer transition-all duration-700 ease-out font-telugu ${
        isExiting
          ? 'opacity-0 scale-105 pointer-events-none blur-xs'
          : 'opacity-100 scale-100'
      }`}
    >
      {/* Dynamic Keyframes for Royal Splash Awakening */}
      <style>{`
        @keyframes emblemBloom {
          0% { transform: scale(0.85); opacity: 0; filter: blur(6px); }
          50% { transform: scale(1.03); opacity: 1; filter: blur(0px); }
          100% { transform: scale(1); opacity: 1; }
        }
        @keyframes goldenHaloPulse {
          0%, 100% { transform: scale(0.95); opacity: 0.35; }
          50% { transform: scale(1.25); opacity: 0.7; }
        }
        @keyframes royalRaysRotate {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .animate-emblem-bloom {
          animation: emblemBloom 0.9s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
        .animate-halo-pulse {
          animation: goldenHaloPulse 2.8s ease-in-out infinite;
        }
        .animate-rays-rotate {
          animation: royalRaysRotate 60s linear infinite;
        }
      `}</style>

      {/* Top Ornate Vijayanagara Palace Arch Outline */}
      <div className="w-full max-w-md md:max-w-xl mx-auto flex flex-col items-center pt-3 md:pt-6 animate-in fade-in duration-500">
        <div className="w-full flex items-center justify-center gap-2 md:gap-3">
          <div className="h-0.5 w-1/3 bg-gradient-to-r from-transparent to-amber-400/80" />
          <div className="p-1 md:p-1.5 rounded-full bg-amber-100/90 border border-amber-300 shadow-2xs">
            <Sparkles size={14} className="size-3.5 md:size-4.5 text-amber-600 animate-spin" />
          </div>
          <div className="h-0.5 w-1/3 bg-gradient-to-l from-transparent to-amber-400/80" />
        </div>
      </div>

      {/* Center Royal Brand Awakening */}
      <div className="relative flex flex-col items-center text-center my-auto px-4 max-w-sm sm:max-w-md md:max-w-lg w-full">
        {/* Expanding Golden Ambient Aura & Rays */}
        <div className="absolute inset-0 -m-8 flex items-center justify-center pointer-events-none">
          <div className="w-64 h-64 sm:w-80 sm:h-80 md:w-[420px] md:h-[420px] rounded-full bg-amber-400/25 blur-3xl animate-halo-pulse" />
        </div>

        {/* Slow Rotating Radial Light Pattern */}
        <div className="absolute w-72 h-72 sm:w-96 sm:h-96 md:w-[500px] md:h-[500px] pointer-events-none opacity-[0.05] text-amber-900 animate-rays-rotate">
          <svg viewBox="0 0 100 100" fill="currentColor">
            <polygon points="50,0 52,40 50,50 48,40" />
            <polygon points="100,50 60,52 50,50 60,48" />
            <polygon points="50,100 48,60 50,50 52,60" />
            <polygon points="0,50 40,48 50,50 40,52" />
            <polygon points="85,15 58,42 50,50 55,38" />
            <polygon points="85,85 58,58 50,50 62,55" />
            <polygon points="15,85 42,58 50,50 45,62" />
            <polygon points="15,15 42,42 50,50 38,45" />
          </svg>
        </div>

        {/* Grand Golden "పదవినోదం" Royal Emblem */}
        <div className="relative z-10 w-full max-w-[280px] sm:max-w-[340px] md:max-w-[420px] drop-shadow-2xl animate-emblem-bloom">
          <img
            src="/assets/royal_logo.png"
            alt="పదవినోదం"
            className="w-full h-auto object-contain mx-auto"
          />
        </div>

        {/* Tagline & Subtitle */}
        <div className="relative z-10 mt-4 md:mt-6 space-y-1.5 md:space-y-2.5 animate-in fade-in slide-in-from-bottom-3 duration-700 delay-300">
          <h2 className="text-sm sm:text-base md:text-xl font-extrabold text-amber-950 tracking-wide">
            {language === 'te'
              ? 'శ్రీకృష్ణదేవరాయల ఆస్థాన పద వినోదం'
              : 'Royal Vijayanagara Telugu Crossword'}
          </h2>
          <p className="text-xs md:text-sm font-semibold text-amber-800/80">
            {language === 'te'
              ? 'స్వచ్ఛమైన తెలుగు పద ప్రహేళికా వేదిక'
              : 'Pure Telugu Crossword Gaming Platform'}
          </p>
        </div>
      </div>

      {/* Bottom Loading Progress Pill & Skip Prompt */}
      <div className="w-full max-w-xs md:max-w-sm mx-auto pb-4 md:pb-8 flex flex-col items-center gap-2 text-center animate-in fade-in duration-700 delay-400">
        <div className="w-full h-1.5 md:h-2 bg-stone-200/80 rounded-full overflow-hidden border border-amber-300/60 p-0.5">
          <div className="h-full rounded-full bg-gradient-to-r from-amber-500 via-emerald-600 to-amber-600 animate-pulse w-full" />
        </div>
        <p className="text-[11px] md:text-xs font-medium text-stone-500">
          {language === 'te' ? 'తాకండి • ప్రారంభమవుతోంది...' : 'Tap to continue...'}
        </p>
      </div>
    </div>
  );
};
