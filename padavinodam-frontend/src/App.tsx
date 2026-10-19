import { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import type { PuzzleData, ClueItem, GameDifficulty, HintOption, HintType } from './types/puzzle';
import { fetchGeneratedPuzzle, fetchDailyPuzzle, verifyPuzzleOnline } from './services/api';
import { Header } from './components/Header';
import { CrosswordGrid } from './components/CrosswordGrid';
import { ClueList } from './components/ClueList';
import { TenaliRamaStoryClue } from './components/TenaliRamaStoryClue';
import type { MascotMood } from './components/TenaliRamaMascot';
import { ClueListDrawer } from './components/ClueListDrawer';
import { TeluguKeypad } from './components/TeluguKeypad';
import { GamifiedHints } from './components/GamifiedHints';
import { TopUpModal } from './components/TopUpModal';
import { TRANSLATIONS, type Language } from './utils/translations';
import { speakTeluguText, startTeluguListening } from './utils/speech';
import { templeAudio } from './utils/templeAudio';
import { Volume2, Mic, Eye, X } from 'lucide-react';

const INITIAL_HINTS: HintOption[] = [
  {
    id: 'reveal_syllable',
    name: 'Reveal Syllable',
    teluguName: 'అక్షర దర్శనం',
    coinCost: 15,
    iconName: 'Eye',
    description: 'ఎంచుకున్న గడిని పూరించు',
    usedCount: 5
  },
  {
    id: 'extra_time',
    name: 'Extra Time',
    teluguName: 'కాల బూస్ట్ (+60s)',
    coinCost: 20,
    iconName: 'Clock',
    description: '+60 సెకన్ల అదనపు సమయం',
    usedCount: 8
  },
  {
    id: 'reveal_word',
    name: 'Reveal Word',
    teluguName: 'పూర్తి పద దర్శనం',
    coinCost: 35,
    iconName: 'Wand2',
    description: 'ప్రస్తుత పదాన్ని పరిష్కరించు',
    usedCount: 2
  },
  {
    id: 'first_letter_clue',
    name: 'First Letter Peek',
    teluguName: 'మొదటి అక్షర క్లూ',
    coinCost: 5,
    iconName: 'HelpCircle',
    description: 'పదం ప్రారంభ అక్షరం చూపు',
    usedCount: 1
  }
];

const TARGET_TIMES: Record<GameDifficulty, number> = {
  kids: 120,   // 2:00 mins
  easy: 210,   // 3:30 mins
  medium: 360, // 6:00 mins
  hard: 600    // 10:00 mins
};

export function App() {
  const [puzzle, setPuzzle] = useState<PuzzleData | null>(null);
  const [userGrid, setUserGrid] = useState<(string | null)[][]>([]);
  const [selectedCell, setSelectedCell] = useState<{ r: number; c: number }>({ r: 0, c: 0 });
  const [direction, setDirection] = useState<'across' | 'down'>('across');
  const [loading, setLoading] = useState<boolean>(true);
  const [difficulty, setDifficulty] = useState<GameDifficulty>(() => {
    const saved = localStorage.getItem('padam_difficulty');
    if (saved === 'kids' || saved === 'easy' || saved === 'medium' || saved === 'hard') {
      return saved;
    }
    return 'easy';
  });
  const [statusMessage, setStatusMessage] = useState<string>('');
  const [incorrectCells, setIncorrectCells] = useState<[number, number][]>([]);
  const [timerSeconds, setTimerSeconds] = useState<number>(0);
  const [isSolved, setIsSolved] = useState<boolean>(false);

  // Language switch: 'te' (Telugu) | 'en' (English UI)
  const [language, setLanguage] = useState<Language>('te');
  const t = TRANSLATIONS[language];

  // Gamification & Wallet States with Persistence
  const [coins, setCoins] = useState<number>(() => {
    const saved = localStorage.getItem('padam_coins');
    return saved !== null ? parseInt(saved, 10) : 120;
  });
  const [score, setScore] = useState<number>(() => {
    const saved = localStorage.getItem('padam_score');
    return saved !== null ? parseInt(saved, 10) : 0;
  });
  const [bonusTimeAlert, setBonusTimeAlert] = useState<string | null>(null);
  const [hintOptions, setHintOptions] = useState<HintOption[]>(INITIAL_HINTS);

  // Mascot Game-Driven Mood Override (celebrate on win, facepalm on error, spellcast on hint)
  const [mascotMoodOverride, setMascotMoodOverride] = useState<MascotMood | null>(null);

  // 100 Points Energy System with 2-Hour Auto-Regen
  const [energyPoints, setEnergyPoints] = useState<number>(() => {
    const saved = localStorage.getItem('padam_energy_points');
    return saved !== null ? parseInt(saved, 10) : 100;
  });

  // Kids Mode Lifetime Unlock (One-time ₹49) - Unlocked for testing
  const [isKidsUnlocked, setIsKidsUnlocked] = useState<boolean>(true);

  // Top-Up Modal State
  const [isTopUpOpen, setIsTopUpOpen] = useState(false);
  const [topUpInitialMode, setTopUpInitialMode] = useState<'points' | 'kids'>('points');

  // Reveal All Drain Modal State
  const [isRevealModalOpen, setIsRevealModalOpen] = useState(false);

  // Vocal Feature: Voice Input Listening State
  const [isListening, setIsListening] = useState(false);

  // Clue Presentation Modes: 'narrator' (Tenali Rama Mascot Clue Speaker) vs 'list' (Full Classical Table)
  const [clueViewMode, setClueViewMode] = useState<'narrator' | 'list'>('narrator');
  const [isClueListDrawerOpen, setIsClueListDrawerOpen] = useState(false);

  // Persist Coins & Score
  useEffect(() => {
    localStorage.setItem('padam_coins', String(coins));
  }, [coins]);

  useEffect(() => {
    localStorage.setItem('padam_score', String(score));
  }, [score]);

  // Persist Difficulty Choice Across Refreshes
  useEffect(() => {
    localStorage.setItem('padam_difficulty', difficulty);
  }, [difficulty]);

  // Session Auto-Save: Automatically saves active crossword progress on every move or timer tick
  useEffect(() => {
    if (puzzle && userGrid.length > 0 && !isSolved) {
      const hasAnyInput = userGrid.some(row => row.some(cell => cell && cell.trim() !== ''));
      if (hasAnyInput) {
        const sessionData = {
          puzzle,
          userGrid,
          timerSeconds,
          difficulty,
          selectedCell,
          direction
        };
        localStorage.setItem('padam_active_session', JSON.stringify(sessionData));
      }
    }
  }, [puzzle, userGrid, timerSeconds, difficulty, selectedCell, direction, isSolved]);

  // Session Restore on Initial Mount
  useEffect(() => {
    const savedSessionStr = localStorage.getItem('padam_active_session');
    if (savedSessionStr) {
      try {
        const saved = JSON.parse(savedSessionStr);
        if (saved && saved.puzzle && saved.userGrid) {
          setPuzzle(saved.puzzle);
          setUserGrid(saved.userGrid);
          setTimerSeconds(saved.timerSeconds || 0);
          const restoredDiff = saved.difficulty || difficulty;
          setDifficulty(restoredDiff);
          if (saved.selectedCell) setSelectedCell(saved.selectedCell);
          if (saved.direction) setDirection(saved.direction);
          setStatusMessage(language === 'te' ? 'గత ఆట పునరుద్ధరించబడింది! (Progress Restored)' : 'Game progress restored!');
          return;
        }
      } catch (e) {
        localStorage.removeItem('padam_active_session');
      }
    }
    const initialDiff = (localStorage.getItem('padam_difficulty') as GameDifficulty) || difficulty;
    loadPuzzle(initialDiff);
  }, []);

  // Timer loop
  useEffect(() => {
    if (isSolved) return;
    const interval = setInterval(() => {
      setTimerSeconds(s => s + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [isSolved]);

  // Passive auto-regen: 1 point every 2 hours
  useEffect(() => {
    const checkRegen = () => {
      const now = Date.now();
      const lastRegenStr = localStorage.getItem('padam_last_regen_time');
      if (!lastRegenStr) {
        localStorage.setItem('padam_last_regen_time', String(now));
        return;
      }
      const lastRegen = parseInt(lastRegenStr, 10);
      const TWO_HOURS_MS = 2 * 60 * 60 * 1000;
      const diff = now - lastRegen;
      if (diff >= TWO_HOURS_MS) {
        const pointsToAdd = Math.floor(diff / TWO_HOURS_MS);
        if (pointsToAdd > 0) {
          setEnergyPoints(prev => {
            const updated = Math.min(100, prev + pointsToAdd);
            localStorage.setItem('padam_energy_points', String(updated));
            return updated;
          });
          localStorage.setItem('padam_last_regen_time', String(lastRegen + pointsToAdd * TWO_HOURS_MS));
        }
      }
    };

    checkRegen();
    const regenInterval = setInterval(checkRegen, 60000);
    return () => clearInterval(regenInterval);
  }, []);

  // Save energy points to localStorage
  useEffect(() => {
    localStorage.setItem('padam_energy_points', String(energyPoints));
  }, [energyPoints]);

  const loadPuzzle = async (diff: GameDifficulty) => {
    localStorage.removeItem('padam_active_session');
    setLoading(true);
    setStatusMessage(t.loadingNew);
    setIncorrectCells([]);
    setIsSolved(false);
    setTimerSeconds(0);

    const data = await fetchGeneratedPuzzle(diff);
    initializePuzzleState(data);
    setLoading(false);
    setStatusMessage('');
  };

  const loadDailyPuzzle = async () => {
    localStorage.removeItem('padam_active_session');
    setLoading(true);
    setStatusMessage(t.loadingDaily);
    setIncorrectCells([]);
    setIsSolved(false);
    setTimerSeconds(0);

    const data = await fetchDailyPuzzle();
    setDifficulty('hard');
    localStorage.setItem('padam_difficulty', 'hard');
    initializePuzzleState(data);
    setLoading(false);
    setStatusMessage(t.dailyStarted);
  };

  const initializePuzzleState = (data: PuzzleData) => {
    setPuzzle(data);
    const newGrid = data.mask.map(row => row.map(isPlayable => (isPlayable ? '' : null)));
    setUserGrid(newGrid);

    for (let r = 0; r < data.size; r++) {
      for (let c = 0; c < data.size; c++) {
        if (data.mask[r][c]) {
          setSelectedCell({ r, c });
          return;
        }
      }
    }
  };

  const getActiveClue = (): ClueItem | null => {
    if (!puzzle) return null;
    const list = puzzle.clues[direction];
    return (
      list.find(c => {
        if (direction === 'across') {
          return selectedCell.r === c.row && selectedCell.c >= c.col && selectedCell.c < c.col + c.length;
        } else {
          return selectedCell.c === c.col && selectedCell.r >= c.row && selectedCell.r < c.row + c.length;
        }
      }) || list[0] || null
    );
  };

  const activeClue = getActiveClue();

  const handleSelectCell = (r: number, c: number) => {
    if (selectedCell.r === r && selectedCell.c === c) {
      setDirection(d => (d === 'across' ? 'down' : 'across'));
    } else {
      setSelectedCell({ r, c });
    }
  };

  const handleSelectClue = (clue: ClueItem, dir: 'across' | 'down') => {
    setDirection(dir);
    setSelectedCell({ r: clue.row, c: clue.col });
  };

  const handleInsertSyllable = (syl: string) => {
    if (!puzzle) return;
    templeAudio.playTileTap();
    const { r, c } = selectedCell;
    const nextGrid = userGrid.map(row => [...row]);
    nextGrid[r][c] = syl;
    setUserGrid(nextGrid);

    // Auto-advance cursor
    if (direction === 'across') {
      const nextC = c + 1;
      if (nextC < puzzle.size && puzzle.mask[r][nextC]) {
        setSelectedCell({ r, c: nextC });
      }
    } else {
      const nextR = r + 1;
      if (nextR < puzzle.size && puzzle.mask[nextR][c]) {
        setSelectedCell({ r: nextR, c });
      }
    }
  };

  const handleBackspace = () => {
    if (!puzzle) return;
    templeAudio.playTileTap();
    const { r, c } = selectedCell;
    const nextGrid = userGrid.map(row => [...row]);

    if (nextGrid[r][c] !== '') {
      nextGrid[r][c] = '';
      setUserGrid(nextGrid);
    } else {
      if (direction === 'across' && activeClue && c > activeClue.col) {
        setSelectedCell({ r, c: c - 1 });
        nextGrid[r][c - 1] = '';
        setUserGrid(nextGrid);
      } else if (direction === 'down' && activeClue && r > activeClue.row) {
        setSelectedCell({ r: r - 1, c });
        nextGrid[r - 1][c] = '';
        setUserGrid(nextGrid);
      }
    }
  };

  // New puzzle / Mode Switch: Points deductions and payment gates are paused for testing
  const handleRequestNewPuzzle = (targetDiff?: GameDifficulty) => {
    const nextDiff = targetDiff || difficulty;

    if (nextDiff !== difficulty) {
      setDifficulty(nextDiff);
    }
    localStorage.setItem('padam_difficulty', nextDiff);
    loadPuzzle(nextDiff);
  };

  // Rule 2: Verify & award +5 Speed Coins if within target time
  const handleVerify = async () => {
    if (!puzzle || !puzzle.solution) {
      setStatusMessage(t.cannotVerify);
      return;
    }

    const result = await verifyPuzzleOnline(puzzle.solution, userGrid);
    setIncorrectCells(result.incorrect_cells);

    if (result.is_complete) {
      setIsSolved(true);
      localStorage.removeItem('padam_active_session');
      setMascotMoodOverride('celebrating');
      templeAudio.playSuccessFanfare();
      const targetTime = TARGET_TIMES[difficulty];
      const isUnderTime = timerSeconds <= targetTime;
      const speedBonusCoins = isUnderTime ? 5 : 0;

      const mult = difficulty === 'kids' ? 0.8 : (difficulty === 'easy' ? 1 : (difficulty === 'medium' ? 1.5 : 2));
      const baseCoins = difficulty === 'kids' ? 25 : (difficulty === 'easy' ? 40 : (difficulty === 'medium' ? 60 : 100));
      const earnedCoins = baseCoins + speedBonusCoins;
      const earnedScore = Math.round(200 * mult);

      setCoins(c => c + earnedCoins);
      setScore(s => s + earnedScore);

      confetti({
        particleCount: isUnderTime ? 220 : 160,
        spread: 100,
        origin: { y: 0.6 }
      });

      const message = isUnderTime
        ? (language === 'te'
            ? `🎉 అభినందనలు! నిర్ణీత సమయంలో పూర్తి చేశారు! +${earnedCoins} నాణేలు (+5 వేగ బోనస్ 🪙) గెలుచుకున్నారు!`
            : `🎉 Solved within time! +${earnedCoins} Coins (+5 Speed Bonus 🪙) awarded!`)
        : t.solvedMsg;

      setStatusMessage(message);
    } else {
      setMascotMoodOverride('facepalm');
      templeAudio.playWrongChime();
      const message = result.correct_cells > 0
        ? t.tryAgainMsg.replace('{total}', String(result.total_cells)).replace('{correct}', String(result.correct_cells))
        : t.incorrectMsg;
      setStatusMessage(message);
    }
  };

  // Count remaining unfilled or incorrect playable cells
  const calculateRemainingCells = () => {
    if (!puzzle || !puzzle.solution) return 0;
    let count = 0;
    for (let r = 0; r < puzzle.size; r++) {
      for (let c = 0; c < puzzle.size; c++) {
        if (puzzle.mask[r][c]) {
          if (userGrid[r]?.[c] !== puzzle.solution[r][c]) {
            count++;
          }
        }
      }
    }
    return count;
  };

  const remainingCount = calculateRemainingCells();
  // Reveal All is NOT free: costs more than all remaining hints combined (at 25 coins/cell, min 100)
  const minDrainCost = Math.max(100, remainingCount * 25);
  const canAffordReveal = coins >= minDrainCost;

  const handleRevealAll = () => {
    const targetTime = TARGET_TIMES[difficulty];
    if (timerSeconds < targetTime) {
      setStatusMessage(
        language === 'te'
          ? 'సమయం ముగిసినప్పుడు మాత్రమే ఈ ఆప్షన్ పనిచేస్తుంది.'
          : 'Reveal All is only available when time is up.'
      );
      return;
    }
    setIsRevealModalOpen(true);
  };

  const handleConfirmDrainReveal = () => {
    if (!puzzle || !puzzle.solution) return;
    if (!canAffordReveal) {
      setStatusMessage(
        language === 'te'
          ? `నాణేలు సరిపోవు! పూర్తి సమాధానాలు చూడటానికి కనీసం ${minDrainCost} నాణేలు అవసరం.`
          : `Not enough coins! You need at least ${minDrainCost} coins to reveal all.`
      );
      setIsRevealModalOpen(false);
      return;
    }

    // High price that completely empties the balance!
    setCoins(0);
    setScore(0);
    const filled = puzzle.solution.map(row => [...row]);
    setUserGrid(filled);
    setIncorrectCells([]);
    setIsSolved(true);
    setIsRevealModalOpen(false);
    setStatusMessage(
      language === 'te'
        ? '⚠️ పూర్తి సమాధానాలు ప్రదర్శించబడ్డాయి. మీ నాణేల బ్యాలెన్స్ మొత్తం ఖాళీ అయింది (0 🪙).'
        : '⚠️ All answers revealed. Your coin balance has been completely emptied (0 🪙).'
    );
  };

  // Gamified Hint Handler
  const handleUseHint = (hintType: HintType) => {
    const hint = hintOptions.find(h => h.id === hintType);
    if (!hint || coins < hint.coinCost) {
      setStatusMessage(t.notEnoughCoins);
      return;
    }

    setCoins(c => c - hint.coinCost);
    setMascotMoodOverride('hint_casting');
    templeAudio.playTempleBell();
    setHintOptions(prev =>
      prev.map(h => (h.id === hintType ? { ...h, usedCount: h.usedCount + 1 } : h))
    );

    if (hintType === 'reveal_syllable') {
      if (!puzzle || !puzzle.solution) return;
      const { r, c } = selectedCell;
      const sol = puzzle.solution[r]?.[c];
      if (sol) {
        const nextGrid = userGrid.map(row => [...row]);
        nextGrid[r][c] = sol;
        setUserGrid(nextGrid);
        setStatusMessage(
          t.revealSylMsg
            .replace('{r}', String(r + 1))
            .replace('{c}', String(c + 1))
            .replace('{syl}', sol) + ` (-${hint.coinCost})`
        );
      }
    } else if (hintType === 'extra_time') {
      setTimerSeconds(s => Math.max(0, s - 60));
      setBonusTimeAlert(t.bonusTime);
      setTimeout(() => setBonusTimeAlert(null), 3500);
      setStatusMessage(t.bonusTimeMsg + ` (-${hint.coinCost})`);
    } else if (hintType === 'reveal_word') {
      if (!puzzle || !puzzle.solution || !activeClue) return;
      const nextGrid = userGrid.map(row => [...row]);
      for (let i = 0; i < activeClue.length; i++) {
        const cr = direction === 'across' ? activeClue.row : activeClue.row + i;
        const cc = direction === 'across' ? activeClue.col + i : activeClue.col;
        const correctSyllable = puzzle.solution[cr]?.[cc];
        if (correctSyllable) {
          nextGrid[cr][cc] = correctSyllable;
        }
      }
      setUserGrid(nextGrid);
      setStatusMessage(
        t.revealWordMsg.replace('{word}', activeClue.word || '') + ` (-${hint.coinCost})`
      );
    } else if (hintType === 'first_letter_clue') {
      if (!activeClue) return;
      const first = activeClue.first_syllable || activeClue.syllables?.[0] || '';
      setStatusMessage(
        first
          ? t.firstLetterMsg.replace('{syl}', first) + ` (-${hint.coinCost})`
          : 'క్లూ సమాచారం అందుబాటులో లేదు.'
      );
    }
  };

  // Vocal Feature: Start listening to Telugu voice dictation
  const handleStartVoiceInput = () => {
    if (isListening) return;
    setIsListening(true);
    setStatusMessage(language === 'te' ? '🎙️ వింటున్నాము... మాట్లాడండి (Listening... speak now)' : '🎙️ Listening... speak in Telugu');

    startTeluguListening(
      (transcript) => {
        setIsListening(false);
        if (!transcript) return;
        const clean = transcript.trim();
        handleInsertSyllable(clean);
        setStatusMessage(
          language === 'te'
            ? `🎙️ వాయిస్ ఇన్‌పుట్: '${clean}' గుర్తించబడింది`
            : `🎙️ Voice Input: '${clean}' recognized`
        );
      },
      (errMsg) => {
        setIsListening(false);
        setStatusMessage(errMsg);
      },
      () => {
        setIsListening(false);
      }
    );
  };

  const handleUnlockKidsPermanent = () => {
    setIsKidsUnlocked(true);
    localStorage.setItem('padam_kids_unlocked', 'true');
    setDifficulty('kids');
    loadPuzzle('kids');
  };

  const targetTime = TARGET_TIMES[difficulty];

  return (
    <div className="min-h-screen bg-[#faf6ee] text-stone-900 font-telugu p-2 sm:p-4 md:p-6 flex flex-col items-center print:bg-white print:p-0 print:m-0 print:min-h-0">
      {/* Expanded Main Card Container */}
      <div className="max-w-6xl w-full bg-[#fffdf9] border-2 border-stone-300 rounded-2xl shadow-lg p-3 sm:p-5 md:p-6 print:border-none print:shadow-none print:p-0 print:m-0 print:bg-white print:max-w-full">
        <Header
          onNewPuzzle={() => handleRequestNewPuzzle()}
          onDailyPuzzle={loadDailyPuzzle}
          onVerify={handleVerify}
          onReveal={handleRevealAll}
          onPrint={() => window.print()}
          loading={loading}
          difficulty={difficulty}
          onDifficultyChange={(d) => handleRequestNewPuzzle(d)}
          timerSeconds={timerSeconds}
          score={score}
          bonusTimeAlert={bonusTimeAlert}
          language={language}
          onToggleLanguage={() => setLanguage(l => (l === 'te' ? 'en' : 'te'))}
          energyPoints={energyPoints}
          onOpenTopUp={(mode) => {
            setTopUpInitialMode(mode || 'points');
            setIsTopUpOpen(true);
          }}
          isKidsUnlocked={isKidsUnlocked}
          targetTimeSeconds={targetTime}
          isSolved={isSolved}
        />

        {/* Gamified Hints & Power-ups Section (Hidden on Print) */}
        <div className="print:hidden">
          <GamifiedHints
            hints={hintOptions}
            coins={coins}
            language={language}
            onUseHint={handleUseHint}
            onAddFreeCoins={() => {
              setCoins(c => c + 50);
              setStatusMessage(t.freeCoinsClaimed);
            }}
          />
        </div>

        {/* Live Status Banner (Hidden on Print) */}
        {statusMessage && (
          <div
            className={`text-center py-2 px-4 mb-3 rounded-lg font-bold text-xs md:text-sm transition-all print:hidden ${
              isSolved
                ? 'bg-emerald-100 text-emerald-900 border border-emerald-300'
                : 'bg-amber-100 text-amber-900 border border-amber-300'
            }`}
          >
            {statusMessage}
          </div>
        )}

        {/* Active Clue Bar with Voice Features (Hidden on Print) */}
        {activeClue && (
          <div className="mb-3 p-2.5 bg-gradient-to-r from-amber-100/90 via-orange-50 to-amber-100/90 border border-amber-300 rounded-xl shadow-xs flex items-center justify-between gap-2 print:hidden">
            <div className="flex items-center gap-2 min-w-0">
              <span className="bg-red-600 text-white text-xs font-bold px-2 py-0.5 rounded font-sans shrink-0">
                {direction === 'across' ? t.across : t.down} {activeClue.number}
              </span>
              <span className="font-telugu font-semibold text-xs md:text-sm text-stone-900 truncate">
                {activeClue.clue}
              </span>
              <span className="text-[11px] text-stone-500 font-mono font-bold shrink-0">
                ({activeClue.length} {t.cells})
              </span>
            </div>

            {/* Vocal Action Buttons: Speaker (TTS) & Mic (STT) */}
            <div className="flex items-center gap-1.5 shrink-0">
              <button
                type="button"
                onClick={() => speakTeluguText(activeClue.clue)}
                className="p-1.5 bg-white hover:bg-amber-200/90 text-amber-800 rounded-lg border border-amber-300 shadow-2xs transition active:scale-95"
                title={language === 'te' ? 'క్లూను చదివి వినిపించు (Read Aloud)' : 'Read Clue Aloud'}
              >
                <Volume2 size={16} />
              </button>
              <button
                type="button"
                onClick={handleStartVoiceInput}
                className={`p-1.5 rounded-lg border shadow-2xs transition active:scale-95 ${
                  isListening
                    ? 'bg-red-600 text-white animate-pulse border-red-500'
                    : 'bg-white hover:bg-stone-50 text-red-600 border-stone-300'
                }`}
                title={language === 'te' ? 'వాయిస్ ద్వారా సమాధానం చెప్పండి' : 'Speak Answer'}
              >
                <Mic size={16} />
              </button>
            </div>
          </div>
        )}

        {puzzle && (
          <>
            {/* Screen Interactive Game Play Area (Hidden when printing) */}
            <div className="flex flex-col gap-5 w-full print:hidden">
              {/* Top Play Area: Grid on Left + Across/Down on Right */}
              <div className="flex flex-col lg:flex-row gap-5 lg:gap-6 items-center lg:items-stretch justify-center w-full">
                {/* Grid Column */}
                <div className="flex flex-col items-center shrink-0">
                  <CrosswordGrid
                    puzzle={puzzle}
                    userGrid={userGrid}
                    selectedCell={selectedCell}
                    direction={direction}
                    activeClue={activeClue}
                    incorrectCells={incorrectCells}
                    language={language}
                    onSelectCell={handleSelectCell}
                    onBackspace={handleBackspace}
                    onToggleDirection={() => setDirection(d => (d === 'across' ? 'down' : 'across'))}
                  />
                </div>

                {/* Clues & Tenali Story Narrator Column */}
                <div className="flex-1 w-full min-w-0 flex flex-col gap-2.5">
                  {/* View Mode Toggle: Tenali Rama Story Narrator vs Full Clues List */}
                  <div className="flex items-center justify-between bg-stone-100 p-1 rounded-xl border border-stone-200">
                    <button
                      type="button"
                      onClick={() => setClueViewMode('narrator')}
                      className={`flex-1 py-1 px-2.5 rounded-lg text-xs md:text-sm font-bold transition flex items-center justify-center gap-1.5 ${
                        clueViewMode === 'narrator'
                          ? 'bg-amber-600 text-white shadow-xs'
                          : 'text-stone-600 hover:text-stone-900 hover:bg-stone-200/70'
                      }`}
                    >
                      <span>🎭</span>
                      <span>{language === 'te' ? 'తెనాలి రామకృష్ణుడు (ఆస్థాన నిరూపణ)' : 'Tenali Narrator'}</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setClueViewMode('list')}
                      className={`flex-1 py-1 px-2.5 rounded-lg text-xs md:text-sm font-bold transition flex items-center justify-center gap-1.5 ${
                        clueViewMode === 'list'
                          ? 'bg-amber-600 text-white shadow-xs'
                          : 'text-stone-600 hover:text-stone-900 hover:bg-stone-200/70'
                      }`}
                    >
                      <span>📜</span>
                      <span>{language === 'te' ? 'పూర్తి జాబితా (Full Clues)' : 'Full Clue Table'}</span>
                    </button>
                  </div>

                  {clueViewMode === 'narrator' ? (
                    <TenaliRamaStoryClue
                      activeClue={activeClue}
                      direction={direction}
                      selectedCell={selectedCell}
                      userGrid={userGrid}
                      allClues={puzzle.clues}
                      language={language}
                      mascotMoodOverride={mascotMoodOverride}
                      onToggleDirection={() => setDirection(d => (d === 'across' ? 'down' : 'across'))}
                      onSelectAlternateClue={(clue, dir) => handleSelectClue(clue, dir)}
                      onOpenFullClues={() => setIsClueListDrawerOpen(true)}
                      onUseHint={() => handleUseHint('reveal_syllable')}
                    />
                  ) : (
                    <ClueList
                      clues={puzzle.clues}
                      activeClue={activeClue}
                      direction={direction}
                      language={language}
                      onSelectClue={handleSelectClue}
                    />
                  )}
                </div>
              </div>

              {/* Extended Full-Card Telugu Keyboard with Voice Typing */}
              <div className="w-full">
                <TeluguKeypad
                  onInsertSyllable={handleInsertSyllable}
                  onBackspace={handleBackspace}
                  language={language}
                  solutionGrid={puzzle.solution}
                  onVoiceInput={handleStartVoiceInput}
                  isListening={isListening}
                />
              </div>
            </div>

            {/* Dedicated Printable Clues Sheet - Rendered ONLY on print (all clues across & down) */}
            <div className="hidden print:block w-full text-black font-telugu bg-white p-4">
              <div className="border-b-2 border-black pb-2 mb-4 flex items-center justify-between">
                <div>
                  <h1 className="text-2xl font-bold text-black font-telugu">
                    {t.appName} • {t.printCluesOnlyHeader}
                  </h1>
                  <p className="text-xs text-stone-800 font-semibold mt-0.5">
                    {difficulty === 'kids' ? (language === 'te' ? 'బాలల విభాగం (Kids 5x5)' : 'Kids Mode (5x5)') :
                     difficulty === 'easy' ? (language === 'te' ? 'సులభం (Easy 7x7)' : 'Easy Mode (7x7)') :
                     difficulty === 'medium' ? (language === 'te' ? 'మధ్యమం (Medium 9x9)' : 'Medium Mode (9x9)') :
                     (language === 'te' ? 'కఠినం (Hard 12x12)' : 'Hard Mode (12x12)')}
                  </p>
                </div>
                <div className="text-right text-xs text-stone-800 space-y-0.5 font-sans">
                  <div>{t.printDate}: {new Date().toLocaleDateString(language === 'te' ? 'te-IN' : 'en-US')}</div>
                  <div className="font-bold">{t.printTotalClues}: {puzzle.clues.across.length + puzzle.clues.down.length}</div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-8 text-xs leading-normal">
                {/* Across Clues Column */}
                <div>
                  <div className="border-b-2 border-black pb-1 mb-2 font-bold text-sm text-black flex items-center justify-between">
                    <span>{t.across}</span>
                    <span className="text-xs font-normal">({puzzle.clues.across.length})</span>
                  </div>
                  <div className="space-y-1.5">
                    {puzzle.clues.across.map((c) => (
                      <div key={c.id} className="flex items-start gap-1">
                        <span className="font-bold min-w-[22px] font-sans text-black">{c.number}.</span>
                        <span className="flex-1 text-black font-telugu">{c.clue}</span>
                        <span className="font-bold ml-1 font-mono text-[11px] text-stone-800 shrink-0">({c.length})</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Down Clues Column */}
                <div>
                  <div className="border-b-2 border-black pb-1 mb-2 font-bold text-sm text-black flex items-center justify-between">
                    <span>{t.down}</span>
                    <span className="text-xs font-normal">({puzzle.clues.down.length})</span>
                  </div>
                  <div className="space-y-1.5">
                    {puzzle.clues.down.map((c) => (
                      <div key={c.id} className="flex items-start gap-1">
                        <span className="font-bold min-w-[22px] font-sans text-black">{c.number}.</span>
                        <span className="flex-1 text-black font-telugu">{c.clue}</span>
                        <span className="font-bold ml-1 font-mono text-[11px] text-stone-800 shrink-0">({c.length})</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Instant Top-Up Modal (Dummy GPay QR Code & Auto-Regen notice) */}
      <TopUpModal
        isOpen={isTopUpOpen}
        onClose={() => setIsTopUpOpen(false)}
        currentPoints={energyPoints}
        isKidsUnlocked={isKidsUnlocked}
        language={language}
        onAddPoints={(amt) => {
          setEnergyPoints(prev => {
            const updated = Math.min(100, prev + amt);
            localStorage.setItem('padam_energy_points', String(updated));
            return updated;
          });
        }}
        onUnlockKids={handleUnlockKidsPermanent}
        initialMode={topUpInitialMode}
      />

      {/* Reveal All Drain Warning Modal */}
      {isRevealModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150 print:hidden">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full border-2 border-rose-300 overflow-hidden relative font-telugu">
            <div className="bg-gradient-to-r from-rose-700 via-red-600 to-rose-800 text-white p-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-white/20 rounded-xl">
                  <Eye size={22} className="text-white" />
                </div>
                <div>
                  <h3 className="text-base md:text-lg font-bold">
                    {t.revealModalTitle}
                  </h3>
                  <p className="text-xs text-rose-100">
                    {t.revealModalDesc}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsRevealModalOpen(false)}
                className="p-1 hover:bg-white/20 rounded-full transition text-white"
              >
                <X size={20} />
              </button>
            </div>

            <div className="p-5 space-y-4">
              {/* Cost & Penalty Details */}
              <div className="bg-rose-50 border border-rose-200 rounded-xl p-3.5 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-stone-600">
                    {language === 'te' ? 'మిగిలిన ఖాళీ/తప్పు గడులు:' : 'Remaining unsolved cells:'}
                  </span>
                  <span className="font-bold font-mono text-stone-900 bg-white px-2 py-0.5 rounded border border-rose-200">
                    {remainingCount} {t.cells}
                  </span>
                </div>

                <div className="flex items-center justify-between text-xs">
                  <span className="text-stone-600">
                    {language === 'te' ? 'అవసరమైన కనీస మొత్తం:' : 'Minimum required cost:'}
                  </span>
                  <span className="font-bold font-mono text-rose-700 bg-white px-2 py-0.5 rounded border border-rose-200">
                    {minDrainCost} 🪙
                  </span>
                </div>

                <div className="flex items-center justify-between text-xs">
                  <span className="text-stone-600">
                    {language === 'te' ? 'మీ ప్రస్తుత నాణేల బ్యాలెన్స్:' : 'Your current coin balance:'}
                  </span>
                  <span className={`font-bold font-mono px-2 py-0.5 rounded border ${
                    canAffordReveal ? 'text-emerald-700 bg-emerald-50 border-emerald-300' : 'text-rose-700 bg-rose-100 border-rose-300'
                  }`}>
                    {coins} 🪙
                  </span>
                </div>
              </div>

              {/* Warning description */}
              {canAffordReveal ? (
                <div className="p-3 bg-amber-50 border border-amber-300 rounded-xl text-xs text-amber-950 space-y-1">
                  <p className="font-bold text-amber-900 flex items-center gap-1">
                    <span>⚠️</span>
                    <span>{language === 'te' ? 'పూర్తి బ్యాలెన్స్ ఖాళీ అవుతుంది!' : 'Complete Balance Will Be Emptied!'}</span>
                  </p>
                  <p className="leading-relaxed">
                    {t.revealDrainNotice.replace('{coins}', String(coins))}
                  </p>
                  <p className="text-[11px] text-stone-500 pt-1">
                    {t.revealCostExplain.replace('{remaining}', String(remainingCount)).replace('{cost}', String(minDrainCost))}
                  </p>
                </div>
              ) : (
                <div className="p-3 bg-red-50 border border-red-300 rounded-xl text-xs text-red-950 space-y-1">
                  <p className="font-bold text-red-900">
                    {t.revealNotEnoughCoins.replace('{cost}', String(minDrainCost))}
                  </p>
                  <p className="text-[11px] text-stone-600">
                    {language === 'te'
                      ? 'సహాయాల బార్ నుండి +50 ఉచిత నాణేలను పొందండి లేదా మరిన్ని పజిల్స్ పూర్తి చేసి నాణేలు సంపాదించండి.'
                      : 'Claim +50 free coins or solve more clues to earn coins.'}
                  </p>
                </div>
              )}

              {/* Action buttons */}
              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsRevealModalOpen(false)}
                  className="px-4 py-2 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-xl font-medium text-xs transition"
                >
                  {t.cancelBtn}
                </button>

                {canAffordReveal ? (
                  <button
                    type="button"
                    onClick={handleConfirmDrainReveal}
                    className="px-4 py-2 bg-rose-700 hover:bg-rose-800 text-white rounded-xl font-bold text-xs shadow-md transition active:scale-95 flex items-center gap-1.5"
                  >
                    <Eye size={14} />
                    <span>{t.confirmDrainBtn}</span>
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => {
                      setCoins(c => c + 50);
                      setStatusMessage(t.freeCoinsClaimed);
                    }}
                    className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-xl font-bold text-xs shadow-md transition active:scale-95"
                  >
                    {t.freeCoinsBtn}
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Full Clue List Drawer (Quick Modal Access from Tenali Clue Box) */}
      {puzzle && (
        <ClueListDrawer
          isOpen={isClueListDrawerOpen}
          onClose={() => setIsClueListDrawerOpen(false)}
          clues={puzzle.clues}
          activeClue={activeClue}
          direction={direction}
          language={language}
          onSelectClue={handleSelectClue}
        />
      )}

      <footer className="mt-5 text-center text-xs text-stone-500 font-sans print:hidden">
        {t.footer}
      </footer>
    </div>
  );
}

export default App;
