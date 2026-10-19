import React, { useState } from 'react';
import type { GameDifficulty } from '../types/puzzle';
import { TRANSLATIONS, type Language } from '../utils/translations';
import { RefreshCw, Calendar, CheckCircle, Eye, Trophy, Zap, Languages, Lock, Clock, Bell, BellOff } from 'lucide-react';
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
  score,
  bonusTimeAlert,
  language,
  onToggleLanguage,
  energyPoints,
  coins,
  onOpenTopUp,
  isKidsUnlocked,
  targetTimeSeconds,
  isSolved
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

  const getDifficultyBadge = (d: GameDifficulty) => {
    switch (d) {
      case 'kids':
        return { label: t.kidsMode, mult: '0.8x', color: 'bg-purple-100 text-purple-800 border-purple-300' };
      case 'easy':
        return { label: t.easyMode, mult: '1.0x', color: 'bg-emerald-100 text-emerald-800 border-emerald-300' };
      case 'medium':
        return { label: t.mediumMode, mult: '1.5x', color: 'bg-amber-100 text-amber-800 border-amber-300' };
      case 'hard':
        return { label: t.hardMode, mult: '2.0x', color: 'bg-rose-100 text-rose-800 border-rose-300' };
    }
  };

  const badge = getDifficultyBadge(difficulty);
  const isSpeedBonusEligible = timerSeconds <= targetTimeSeconds;
  const isTimeUp = timerSeconds >= targetTimeSeconds;

  return (
    <header className="border-b-2 border-stone-200 pb-4 mb-3 select-none print:hidden">
      {/* Masthead */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-3">
        <div>
          <div className="text-[11px] uppercase tracking-widest text-amber-800 font-serif font-bold">
            {t.platformBadge}
          </div>
          <h1 className="text-3xl md:text-4xl font-extrabold text-stone-900 tracking-tight font-telugu">
            {t.appName}
          </h1>
        </div>

        {/* Live Game Stats & Language Switch */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* Language Switch Button */}
          <button
            type="button"
            onClick={onToggleLanguage}
            className="inline-flex items-center gap-1 px-2.5 py-1.5 bg-white hover:bg-stone-50 border border-stone-300 text-stone-800 rounded-lg text-xs font-bold shadow-2xs transition active:scale-95"
            title="భాష మార్చండి / Switch Language"
          >
            <Languages size={14} className="text-amber-700" />
            <span className="font-sans">{language === 'te' ? 'English' : 'తెలుగు'}</span>
          </button>

          {/* Temple Sound Toggle Button */}
          <button
            type="button"
            onClick={handleToggleSound}
            className={`inline-flex items-center gap-1 px-2.5 py-1.5 border rounded-lg text-xs font-bold shadow-2xs transition active:scale-95 ${
              !isMuted
                ? 'bg-amber-50 hover:bg-amber-100 text-amber-900 border-amber-300'
                : 'bg-stone-100 hover:bg-stone-200 text-stone-500 border-stone-300'
            }`}
            title={!isMuted ? 'ధ్వని ఆన్ (Temple Chimes On)' : 'ధ్వని మ్యూట్ (Muted)'}
          >
            {!isMuted ? <Bell size={14} className="text-amber-600" /> : <BellOff size={14} className="text-stone-400" />}
            <span className="hidden sm:inline font-sans">{!isMuted ? 'ధ్వని' : 'మ్యూట్'}</span>
          </button>

          {/* Clue Coins Wallet Button */}
          <button
            type="button"
            onClick={() => onOpenTopUp('points')}
            className="flex items-center gap-1.5 bg-amber-50 hover:bg-amber-100/90 border border-amber-300 px-2.5 py-1.5 rounded-lg shadow-2xs transition active:scale-95"
            title={language === 'te' ? 'క్లూ నాణాలు టాప్-అప్ చేయండి' : 'Top-Up Clue Coins'}
          >
            <span className="text-base leading-none">🪙</span>
            <div className="text-left">
              <div className="text-[9px] text-amber-900/80 uppercase font-sans font-semibold leading-none">
                {language === 'te' ? 'నాణాలు' : 'Coins'}
              </div>
              <div className="text-xs md:text-sm font-bold text-amber-950 font-mono leading-none mt-0.5">
                {coins}
              </div>
            </div>
            <span className="text-[10px] bg-amber-600 text-white font-bold px-1 py-0.2 rounded-full ml-0.5">
              +
            </span>
          </button>

          {/* Energy Points Wallet Button */}
          <button
            type="button"
            onClick={() => onOpenTopUp('points')}
            className="flex items-center gap-1.5 bg-amber-50 hover:bg-amber-100/90 border border-amber-300 px-2.5 py-1.5 rounded-lg shadow-2xs transition active:scale-95"
            title={language === 'te' ? 'శక్తి పాయింట్లు టాప్-అప్ చేయండి' : 'Top-Up Energy Points'}
          >
            <Zap size={16} className="text-amber-500 fill-amber-500" />
            <div className="text-left">
              <div className="text-[9px] text-amber-900/80 uppercase font-sans font-semibold leading-none">
                {t.energy}
              </div>
              <div className="text-xs md:text-sm font-bold text-amber-950 font-mono leading-none mt-0.5">
                {energyPoints}
                {energyPoints <= 100 ? (
                  <span className="text-[9px] text-stone-400 font-normal">/100</span>
                ) : (
                  <span className="text-[8px] text-amber-800 font-bold ml-0.5 bg-amber-200/90 px-1 rounded-sm">⚡BOOST</span>
                )}
              </div>
            </div>
            <span className="text-[10px] bg-amber-600 text-white font-bold px-1 py-0.2 rounded-full ml-0.5">
              +
            </span>
          </button>

          {/* Score Card */}
          <div className="flex items-center gap-1.5 bg-gradient-to-br from-amber-50 to-amber-100/70 border border-amber-200 px-2.5 py-1.5 rounded-lg shadow-2xs">
            <Trophy size={16} className="text-amber-600" />
            <div>
              <div className="text-[9px] text-amber-900/70 uppercase font-sans font-semibold leading-none">{t.score}</div>
              <div className="text-xs md:text-sm font-bold text-amber-950 font-mono leading-none mt-0.5">
                {score} <span className="text-[9px] text-amber-700 font-sans font-normal">({badge.mult})</span>
              </div>
            </div>
          </div>

          {/* Timer Card with Speed Bonus Tracker */}
          <div className="relative flex items-center gap-1.5 bg-stone-100 border border-stone-300 px-2.5 py-1.5 rounded-lg shadow-2xs">
            <Clock size={16} className={isSpeedBonusEligible ? 'text-emerald-700' : 'text-stone-500'} />
            <div>
              <div className="text-[9px] text-stone-500 uppercase font-sans font-semibold flex items-center gap-1 leading-none">
                <span>{t.time}</span>
                {isSpeedBonusEligible && (
                  <span className="text-[8px] text-amber-800 bg-amber-100/90 border border-amber-300 px-1 rounded font-bold font-mono">
                    +5🪙 బోనస్
                  </span>
                )}
              </div>
              <div className="text-xs md:text-sm font-bold text-stone-800 font-mono leading-none mt-0.5">
                {formatTime(timerSeconds)}
                <span className="text-[9px] text-stone-400 font-normal ml-0.5">/{formatTime(targetTimeSeconds)}</span>
              </div>
            </div>
            {bonusTimeAlert && (
              <span className="absolute -top-3 right-0 bg-emerald-600 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full shadow animate-bounce">
                {bonusTimeAlert}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Mode Selector & Action Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-2 mt-3 bg-stone-100 p-2 rounded-xl border border-stone-200">
        {/* Game Modes: Kids (5x5), Easy (7x7), Medium (9x9), Hard (11x11/12x12) */}
        <div className="flex items-center gap-1 bg-stone-200/80 p-1 rounded-lg flex-wrap">
          {(['kids', 'easy', 'medium', 'hard'] as GameDifficulty[]).map((d) => {
            const active = difficulty === d;
            const isKidsLocked = d === 'kids' && !isKidsUnlocked;
            const labels: Record<GameDifficulty, string> = {
              kids: t.kidsMode,
              easy: t.easyMode,
              medium: t.mediumMode,
              hard: t.hardMode
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
                className={`px-2.5 py-1 rounded-md text-xs md:text-sm font-bold transition-all flex items-center gap-1 ${
                  active
                    ? 'bg-white text-stone-900 shadow-xs'
                    : 'text-stone-600 hover:text-stone-900 hover:bg-stone-300/40'
                } ${isKidsLocked ? 'opacity-85 text-purple-900' : ''}`}
              >
                {isKidsLocked && <Lock size={12} className="text-purple-600" />}
                <span>{labels[d]}</span>
              </button>
            );
          })}
        </div>

        {/* Actions */}
        <div className="flex items-center gap-1.5 flex-wrap">
          <button
            type="button"
            onClick={onNewPuzzle}
            disabled={loading}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-stone-900 hover:bg-stone-800 text-white rounded-lg font-medium text-xs md:text-sm shadow-xs transition active:scale-95 disabled:opacity-50"
          >
            <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
            {t.newPuzzle}
          </button>

          <button
            type="button"
            onClick={onDailyPuzzle}
            disabled={loading}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-amber-700 hover:bg-amber-800 text-white rounded-lg font-medium text-xs md:text-sm shadow-xs transition active:scale-95 disabled:opacity-50"
          >
            <Calendar size={14} />
            {t.dailyChallenge}
          </button>

          <button
            type="button"
            onClick={onVerify}
            className="inline-flex items-center gap-1 px-3 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg text-xs md:text-sm font-bold shadow-xs transition active:scale-95"
          >
            <CheckCircle size={14} />
            {t.verify}
          </button>

          {/* Reveal All: ONLY appears when time is up for that mode */}
          {isTimeUp && !isSolved && (
            <button
              type="button"
              onClick={onReveal}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-rose-700 hover:bg-rose-800 text-white rounded-lg text-xs md:text-sm font-bold shadow-xs transition active:scale-95 animate-pulse"
              title={
                language === 'te'
                  ? 'సమయం ముగిసింది! అన్ని నాణేలను ఖాళీ చేసి సమాధానాలు చూడండి'
                  : 'Time is up! Reveal all answers (Empties your wallet)'
              }
            >
              <Eye size={14} className="text-white" />
              <span>{t.reveal}</span>
              <span className="text-[10px] bg-black/30 text-rose-100 px-1.5 py-0.2 rounded-full font-sans">
                {language === 'te' ? 'సమయం ముగిసింది' : 'Time Up'}
              </span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
