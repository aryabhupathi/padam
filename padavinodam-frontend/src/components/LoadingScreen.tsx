import React, { useState, useEffect, useRef } from 'react';
import type { Language } from '../utils/translations';
import { TRANSLATIONS } from '../utils/translations';
import { getRandomRiddle, type TeluguRiddle } from '../data/teluguRiddles';
import { Lightbulb, Sparkles, CheckCircle2 } from 'lucide-react';
import { templeAudio } from '../utils/templeAudio';

interface LoadingScreenProps {
  language: Language;
  isLoaded: boolean;
  onFinished: () => void;
  subTitle?: string;
}

export const LoadingScreen: React.FC<LoadingScreenProps> = ({
  language,
  isLoaded,
  onFinished,
  subTitle
}) => {
  const t = TRANSLATIONS[language];
  const [progress, setProgress] = useState(10);
  const [statusStage, setStatusStage] = useState<'prep' | 'letters' | 'clues' | 'ready'>('prep');
  const [riddle] = useState<TeluguRiddle>(() => getRandomRiddle());
  const [isAnswerRevealed, setIsAnswerRevealed] = useState(false);
  const finishedRef = useRef(false);

  useEffect(() => {
    // Smooth progress simulation with minimum duration ~1.4s
    const startTime = Date.now();
    const minDuration = 1400; // ms

    const interval = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const timeRatio = Math.min(elapsed / minDuration, 1);

      setProgress(prev => {
        let target = timeRatio * 85;
        if (isLoaded && elapsed >= minDuration) {
          target = 100;
        } else if (isLoaded) {
          target = Math.max(prev + 4, timeRatio * 95);
        } else {
          target = Math.min(prev + (target - prev) * 0.3, 85);
        }

        const nextVal = Math.min(100, Math.max(prev, Math.round(target)));

        // Update status text based on progress
        if (nextVal < 35) {
          setStatusStage('prep');
        } else if (nextVal < 70) {
          setStatusStage('letters');
        } else if (nextVal < 98) {
          setStatusStage('clues');
        } else {
          setStatusStage('ready');
        }

        // Auto-reveal riddle answer near completion
        if (nextVal >= 80 && !isAnswerRevealed) {
          setIsAnswerRevealed(true);
        }

        if (nextVal >= 100 && isLoaded && !finishedRef.current) {
          finishedRef.current = true;
          clearInterval(interval);
          if (!templeAudio.isMuted()) {
            templeAudio.playTileTap();
          }
          setTimeout(() => {
            onFinished();
          }, 350);
        }

        return nextVal;
      });
    }, 40);

    return () => clearInterval(interval);
  }, [isLoaded, onFinished]);

  const getStatusText = () => {
    switch (statusStage) {
      case 'prep':
        return t.preparingPuzzle;
      case 'letters':
        return t.arrangingLetters;
      case 'clues':
        return t.checkingClues;
      case 'ready':
        return t.puzzleReady;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex flex-col justify-between items-center px-4 py-6 sm:py-8 bg-gradient-to-b from-[#F7EFE1] via-[#FBF7EE] to-[#F5ECE0] text-stone-900 select-none font-telugu overflow-y-auto">
      {/* Decorative Ornate Arch Frame at Top */}
      <div className="w-full max-w-md mx-auto flex flex-col items-center pt-2">
        <div className="relative w-full flex items-center justify-center">
          <div className="h-0.5 w-1/4 bg-gradient-to-r from-transparent to-amber-400" />
          <div className="px-3 py-1 rounded-full bg-amber-100/80 border border-amber-300 text-amber-900 text-xs font-bold flex items-center gap-1.5 shadow-2xs">
            <Sparkles size={13} className="text-amber-600 animate-spin" />
            <span>{subTitle || t.appName}</span>
          </div>
          <div className="h-0.5 w-1/4 bg-gradient-to-l from-transparent to-amber-400" />
        </div>
      </div>

      {/* Center Hero: Tenali Rama with Quill & Crossword Scroll */}
      <div className="w-full max-w-sm sm:max-w-md mx-auto flex flex-col items-center text-center my-auto py-2">
        <div className="relative group max-w-[280px] sm:max-w-[340px] w-full aspect-[4/5] rounded-3xl overflow-hidden shadow-2xl border-2 border-amber-300/80 bg-amber-50/50">
          <img
            src="/assets/tenali_loading_hero.png"
            alt="Tenali Rama writing crossword puzzle"
            className="w-full h-full object-cover object-center animate-pulse duration-1000"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-stone-900/30 via-transparent to-transparent pointer-events-none" />
        </div>

        {/* Dynamic Status Text & Progress Bar */}
        <div className="w-full max-w-xs sm:max-w-sm mt-5 space-y-2">
          <div className="flex items-center justify-between text-xs sm:text-sm font-bold text-stone-800 px-1">
            <span className="flex items-center gap-1.5 text-amber-950">
              {statusStage === 'ready' ? (
                <CheckCircle2 size={16} className="text-emerald-600 animate-bounce" />
              ) : (
                <span className="inline-block w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
              )}
              <span>{getStatusText()}</span>
            </span>
            <span className="font-mono text-emerald-800 bg-emerald-100/90 border border-emerald-300 px-2 py-0.5 rounded-full text-xs">
              {progress}%
            </span>
          </div>

          {/* Royal Emerald & Gold Progress Track */}
          <div className="w-full h-5 sm:h-6 bg-stone-200/90 rounded-full p-1 border-2 border-amber-300/90 shadow-inner relative overflow-hidden">
            <div
              className="h-full rounded-full bg-gradient-to-r from-emerald-500 via-emerald-600 to-teal-700 shadow-sm transition-all duration-150 ease-out relative"
              style={{ width: `${progress}%` }}
            >
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-shimmer" />
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Floating Card: Daily Telugu Riddle / Podupu Katha */}
      <div className="w-full max-w-sm sm:max-w-md mx-auto pb-2">
        <div className="bg-white/90 backdrop-blur-md rounded-2xl p-4 sm:p-5 border-2 border-amber-300/80 shadow-lg text-left relative overflow-hidden">
          <div className="flex items-center justify-between border-b border-amber-200/80 pb-2 mb-2.5">
            <div className="flex items-center gap-2 text-amber-900 font-bold text-xs sm:text-sm">
              <div className="p-1 rounded-lg bg-amber-100 border border-amber-300 text-amber-700">
                <Lightbulb size={16} />
              </div>
              <span>{t.dailyRiddleTitle}</span>
              <span className="text-[10px] bg-amber-50 text-amber-800 px-1.5 py-0.5 rounded border border-amber-200 font-normal">
                {riddle.category}
              </span>
            </div>
            <button
              type="button"
              onClick={() => setIsAnswerRevealed(!isAnswerRevealed)}
              className="text-[11px] font-bold text-amber-800 hover:text-amber-950 underline underline-offset-2 cursor-pointer transition active:scale-95"
            >
              {isAnswerRevealed ? t.hideAnswer : t.showAnswer}
            </button>
          </div>

          {/* Riddle Question */}
          <p className="text-xs sm:text-sm font-medium text-stone-800 leading-relaxed">
            {language === 'te' ? riddle.questionTe : riddle.questionEn}
          </p>

          {/* Answer Reveal */}
          {isAnswerRevealed && (
            <div className="mt-2.5 pt-2 border-t border-dashed border-amber-200 flex items-center gap-2 animate-in fade-in duration-200">
              <span className="text-[11px] font-bold text-emerald-800 bg-emerald-50 border border-emerald-300 px-2 py-0.5 rounded-md">
                {language === 'te' ? 'జవాబు:' : 'Answer:'}
              </span>
              <span className="text-xs sm:text-sm font-bold text-stone-900">
                {language === 'te' ? riddle.answerTe : riddle.answerEn}
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
