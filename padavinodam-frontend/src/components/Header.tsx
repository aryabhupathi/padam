import React, { useState } from 'react';
import type { GameDifficulty } from '../types/puzzle';
import { TRANSLATIONS, type Language } from '../utils/translations';
import { RefreshCw, Calendar, CheckCircle, Eye, Trophy, Zap, Lock, Clock, Bell, BellOff, ShieldCheck } from 'lucide-react';
import { templeAudio } from '../utils/templeAudio';

interface HeaderProps {
  onNewPuzzle: () => void;
  onDailyPuzzle: () => void;
  onVerify: () => void;
  onReveal: () => void;
  loading: boolean;
  difficulty: GameDifficulty;
  onDifficultyChange: (diff: GameDifficulty) => void;
  timerSeconds: number;
  isTimerRunning?: boolean;
  hasPaused?: boolean;
  onToggleTimer?: () => void;
  score: number;
  bonusTimeAlert?: string | null;
  language: Language;
  onToggleLanguage: () => void;
  energyPoints: number;
  coins: number;
  onOpenTopUp: (mode?: 'points' | 'kids') => void;
  isKidsUnlocked: boolean;
  targetTimeSeconds: number;
  isSolved?: boolean;
  onOpenPrivacy?: () => void;
  onOpenHints?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  onNewPuzzle,
  onDailyPuzzle,
  onVerify,
  onReveal,
  loading,
  difficulty,
  onDifficultyChange,
  timerSeconds,
  isTimerRunning = false,
  hasPaused = false,
  onToggleTimer,
  score,
  bonusTimeAlert: _bonusTimeAlert,
  language,
  onToggleLanguage,
  energyPoints,
  coins,
  onOpenTopUp,
  isKidsUnlocked,
  targetTimeSeconds,
  isSolved,
  onOpenPrivacy
}) => {
  const t = TRANSLATIONS[language];
  const [isMuted, setIsMuted] = useState(templeAudio.isMuted());

  const handleToggleSound = () => {
    const next = templeAudio.toggleMute();
    setIsMuted(next);
    if (!next) {
      templeAudio.playTempleBell();
    }
  };

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const isSpeedBonusEligible = !hasPaused && timerSeconds <= targetTimeSeconds;
  const isTimeUp = timerSeconds >= targetTimeSeconds;

  return (
    <header className="pb-2 mb-2 select-none print:hidden">
      {/* 1. Top Header Row: Just Padavinodam on left & Language (EN/TEL) + Controls on right */}
      <div className="flex items-center justify-between gap-2 pb-2 border-b border-stone-200">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-stone-900 tracking-tight font-telugu">
          {language === 'te' ? 'పదవినోదం' : 'Padavinodam'}
        </h1>

        <div className="flex items-center gap-1.5">
          {/* Language Switch Button with just EN / TEL */}
          <button
            type="button"
            onClick={onToggleLanguage}
            className="px-2.5 py-1 bg-amber-50 hover:bg-amber-100 border border-amber-300 text-amber-950 rounded-lg text-xs font-bold font-sans shadow-2xs transition active:scale-95 cursor-pointer"
            title="Switch Language (భాష మార్చు)"
          >
            {language === 'te' ? 'EN' : 'TEL'}
          </button>

          {/* Temple Sound Toggle */}
          <button
            type="button"
            onClick={handleToggleSound}
            className={`p-1.5 border rounded-lg text-xs font-bold shadow-2xs transition active:scale-95 cursor-pointer ${
              !isMuted
                ? 'bg-amber-50 hover:bg-amber-100 text-amber-900 border-amber-300'
                : 'bg-stone-100 hover:bg-stone-200 text-stone-500 border-stone-300'
            }`}
            title={!isMuted ? 'ధ్వని ఆన్ (Sound On)' : 'ధ్వని మ్యూట్ (Muted)'}
          >
            {!isMuted ? <Bell size={15} className="text-amber-600" /> : <BellOff size={15} className="text-stone-400" />}
          </button>

          {/* Privacy Policy Quick Access Button */}
          {onOpenPrivacy && (
            <button
              type="button"
              onClick={onOpenPrivacy}
              className="p-1.5 bg-white hover:bg-amber-50 border border-stone-300 text-stone-700 rounded-lg text-xs font-bold shadow-2xs transition active:scale-95 cursor-pointer"
              title="Privacy Policy (గోప్యతా విధానం)"
            >
              <ShieldCheck size={15} className="text-emerald-700" />
            </button>
          )}
        </div>
      </div>

      {/* 2. Next Part: Coins | Score | Time | Energy */}
      <div className="grid grid-cols-4 gap-1.5 sm:gap-2 mt-2">
        {/* Coins */}
        <button
          type="button"
          onClick={() => onOpenTopUp('points')}
          className="flex items-center justify-center gap-1 bg-amber-50 hover:bg-amber-100/90 border border-amber-300 px-1.5 py-1.5 rounded-xl text-xs font-bold text-amber-950 font-mono shadow-2xs transition active:scale-95 cursor-pointer"
          title={language === 'te' ? 'నాణాలు (Coins)' : 'Coins'}
        >
          <span>🪙</span>
          <span className="truncate">{coins}</span>
        </button>

        {/* Score */}
        <div 
          className="flex items-center justify-center gap-1 bg-amber-50/80 border border-amber-200 px-1.5 py-1.5 rounded-xl text-xs font-bold font-mono text-amber-900 shadow-2xs"
          title={language === 'te' ? 'స్కోరు (Score)' : 'Score'}
        >
          <Trophy size={13} className="text-amber-600 shrink-0" />
          <span className="truncate">{score}</span>
        </div>

        {/* Time with Play / Pause / Start Toggle */}
        <button
          type="button"
          onClick={onToggleTimer}
          className={`flex items-center justify-center gap-1 border px-1.5 py-1.5 rounded-xl text-xs font-bold font-mono shadow-2xs transition active:scale-95 cursor-pointer ${
            !isTimerRunning && timerSeconds === 0
              ? 'bg-emerald-50 hover:bg-emerald-100 border-emerald-300 text-emerald-800'
              : !isTimerRunning && timerSeconds > 0
              ? 'bg-amber-100 hover:bg-amber-200 border-amber-400 text-amber-900 animate-pulse'
              : 'bg-stone-100 hover:bg-stone-200 border-stone-300 text-stone-700'
          }`}
          title={
            !isTimerRunning && timerSeconds === 0
              ? (language === 'te' ? 'సమయం ప్రారంభించండి (Start Timer)' : 'Start Timer')
              : !isTimerRunning
              ? (language === 'te' ? 'కొనసాగించండి (Resume Timer)' : 'Resume Timer')
              : (language === 'te' ? 'విరామం (Pause Timer)' : 'Pause Timer')
          }
        >
          <Clock
            size={13}
            className={
              !isTimerRunning && timerSeconds === 0
                ? 'text-emerald-600 shrink-0'
                : isSpeedBonusEligible
                ? 'text-emerald-700 shrink-0'
                : 'text-stone-500 shrink-0'
            }
          />
          <span className="truncate">
            {!isTimerRunning && timerSeconds === 0
              ? `▶ 00:00`
              : !isTimerRunning
              ? `⏸ ${formatTime(timerSeconds)}`
              : formatTime(timerSeconds)}
          </span>
        </button>

        {/* Energy */}
        <button
          type="button"
          onClick={() => onOpenTopUp('points')}
          className="flex items-center justify-center gap-1 bg-amber-50 hover:bg-amber-100/90 border border-amber-300 px-1.5 py-1.5 rounded-xl text-xs font-bold text-amber-950 font-mono shadow-2xs transition active:scale-95 cursor-pointer"
          title={language === 'te' ? 'శక్తి (Energy)' : 'Energy'}
        >
          <Zap size={13} className="text-amber-500 fill-amber-500 shrink-0" />
          <span className="truncate">{energyPoints}</span>
        </button>
      </div>

      {/* 3 & 4. Modes & Actions: Responsive Layout (Stacked on mobile, side-by-side on tablets & desktops) */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-2 mt-2">
        {/* Modes: Easy, Medium, Hard, Kids (No counts) */}
        <div className="grid grid-cols-4 gap-1 bg-stone-200/70 p-1 rounded-xl flex-1 md:max-w-md">
          {(['easy', 'medium', 'hard', 'kids'] as GameDifficulty[]).map((d) => {
            const active = difficulty === d;
            const isKidsLocked = d === 'kids' && !isKidsUnlocked;
            const labels: Record<GameDifficulty, string> = {
              easy: t.easyMode,
              medium: t.mediumMode,
              hard: t.hardMode,
              kids: t.kidsMode
            };
            return (
              <button
                key={d}
                type="button"
                onClick={() => {
                  if (isKidsLocked) {
                    onOpenTopUp('kids');
                  } else {
                    onDifficultyChange(d);
                  }
                }}
                className={`py-1.5 px-1 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1 cursor-pointer text-center truncate ${
                  active
                    ? 'bg-white text-stone-900 shadow-xs'
                    : 'text-stone-600 hover:text-stone-900 hover:bg-stone-300/40'
                } ${isKidsLocked ? 'text-purple-900' : ''}`}
              >
                {isKidsLocked && <Lock size={11} className="text-purple-600 shrink-0" />}
                <span className="truncate">{labels[d]}</span>
              </button>
            );
          })}
        </div>

        {/* Action Toolbar: New Puzzle | Daily Challenge | Check Answers */}
        <div className="grid grid-cols-3 gap-1.5 flex-1 md:max-w-sm">
          <button
            type="button"
            onClick={onNewPuzzle}
            disabled={loading}
            className="flex items-center justify-center gap-1 py-1.5 px-2 bg-stone-900 hover:bg-stone-800 text-white rounded-xl font-medium text-xs shadow-xs transition active:scale-95 disabled:opacity-50 cursor-pointer"
          >
            <RefreshCw size={13} className={loading ? 'animate-spin shrink-0' : 'shrink-0'} />
            <span className="truncate">{t.newPuzzle}</span>
          </button>

          <button
            type="button"
            onClick={onDailyPuzzle}
            disabled={loading}
            className="flex items-center justify-center gap-1 py-1.5 px-2 bg-amber-700 hover:bg-amber-800 text-white rounded-xl font-medium text-xs shadow-xs transition active:scale-95 disabled:opacity-50 cursor-pointer"
          >
            <Calendar size={13} className="shrink-0" />
            <span className="truncate">{t.dailyChallenge}</span>
          </button>

          <button
            type="button"
            onClick={onVerify}
            className="flex items-center justify-center gap-1 py-1.5 px-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold shadow-xs transition active:scale-95 cursor-pointer"
          >
            <CheckCircle size={13} className="shrink-0" />
            <span className="truncate">{t.verify}</span>
          </button>
        </div>
      </div>

      {/* Reveal All: ONLY appears when time is up for that mode */}
      {isTimeUp && !isSolved && (
        <div className="mt-2">
          <button
            type="button"
            onClick={onReveal}
            className="w-full flex items-center justify-center gap-1.5 py-1.5 px-3 bg-rose-700 hover:bg-rose-800 text-white rounded-xl text-xs font-bold shadow-xs transition active:scale-95 cursor-pointer animate-pulse"
          >
            <Eye size={14} className="text-white shrink-0" />
            <span>{t.reveal}</span>
            <span className="text-[10px] bg-black/30 text-rose-100 px-1.5 py-0.2 rounded-full font-sans">
              {language === 'te' ? 'సమయం ముగిసింది' : 'Time Up'}
            </span>
          </button>
        </div>
      )}
    </header>
  );
};
