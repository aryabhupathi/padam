import { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import type { PuzzleData, ClueItem, GameDifficulty, HintOption, HintType } from './types/puzzle';
import { fetchGeneratedPuzzle, fetchDailyPuzzle, verifyPuzzleOnline } from './services/api';
import { Header } from './components/Header';
import { CrosswordGrid } from './components/CrosswordGrid';
import { ClueList } from './components/ClueList';
import type { MascotMood } from './components/TenaliRamaMascot';
import { ClueListDrawer } from './components/ClueListDrawer';
import { TeluguKeypad } from './components/TeluguKeypad';
import { GamifiedHints } from './components/GamifiedHints';
import { TopUpModal } from './components/TopUpModal';
import { TRANSLATIONS, type Language } from './utils/translations';
import { speakTeluguText, startTeluguListening, splitIntoTeluguSyllables } from './utils/speech';
import { templeAudio } from './utils/templeAudio';
import { Volume2, Mic, Eye, X, ShieldCheck, Lightbulb, ListFilter, Play, Share2, Users } from 'lucide-react';
import { PrivacyPolicyModal } from './components/PrivacyPolicyModal';
import { HomeScreen } from './components/HomeScreen';
import { LoadingScreen } from './components/LoadingScreen';
import { SplashScreen } from './components/SplashScreen';
import { SPECIAL_CINEMA_PUZZLE, SPECIAL_PROVERBS_PUZZLE } from './data/specialPuzzles';
import { speakTenaliWin, speakTenaliSpeedBonus, speakTenaliWrong, speakTenaliHint } from './utils/speech';

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
  const [isTimerRunning, setIsTimerRunning] = useState<boolean>(false);
  const [hasPaused, setHasPaused] = useState<boolean>(false);
  const [isSolved, setIsSolved] = useState<boolean>(false);

  // Screen Routing: 'home' | 'loading' | 'game'
  const [currentScreen, setCurrentScreen] = useState<'home' | 'loading' | 'game'>('home');
  const [loadingSubTitle, setLoadingSubTitle] = useState<string>('');
  const [showSplash, setShowSplash] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      return !sessionStorage.getItem('padam_splash_shown');
    }
    return true;
  });
  const [activeSessionInfo, setActiveSessionInfo] = useState<{
    difficulty: GameDifficulty;
    timerSeconds: number;
  } | null>(null);

  // 2-Player Pass-and-Play Mode (Idea 5)
  const [isTwoPlayerMode, setIsTwoPlayerMode] = useState<boolean>(false);
  const [twoPlayerScores, setTwoPlayerScores] = useState<{ p1: number; p2: number }>({ p1: 0, p2: 0 });

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

  // Kids Mode Lifetime Unlock (One-time ₹49)
  const [isKidsUnlocked, setIsKidsUnlocked] = useState<boolean>(() => {
    return localStorage.getItem('padam_kids_unlocked') === 'true';
  });

  // Top-Up Modal State
  const [isTopUpOpen, setIsTopUpOpen] = useState(false);
  const [topUpInitialMode, setTopUpInitialMode] = useState<'points' | 'kids'>('points');

  // Reveal All Drain Modal State
  const [isRevealModalOpen, setIsRevealModalOpen] = useState(false);

  // In-App Privacy Policy Modal State
  const [isPrivacyModalOpen, setIsPrivacyModalOpen] = useState(false);

  // On-Demand Hints Modal State (Declutters main screen)
  const [isHintsModalOpen, setIsHintsModalOpen] = useState(false);

  // Vocal Feature: Voice Input Listening State
  const [isListening, setIsListening] = useState(false);
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

  // Session Restore & Initial Puzzle Pre-cache on Mount
  useEffect(() => {
    // Check if player opened a friend's challenge link
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      if (params.get('challenge')) {
        const challengeDiff = (params.get('diff') as GameDifficulty) || 'medium';
        setDifficulty(challengeDiff);
        setLoadingSubTitle(language === 'te' ? 'స్నేహితుని ఛాలెంజ్ (Friend Challenge)' : 'Friend Challenge');
        setCurrentScreen('loading');
        loadPuzzle(challengeDiff);
        return;
      }
    }

    const savedSessionStr = localStorage.getItem('padam_active_session');
    if (savedSessionStr) {
      try {
        const saved = JSON.parse(savedSessionStr);
        if (saved && saved.puzzle && saved.userGrid) {
          setActiveSessionInfo({
            difficulty: saved.difficulty || difficulty,
            timerSeconds: saved.timerSeconds || 0
          });
          setPuzzle(saved.puzzle);
          setUserGrid(saved.userGrid);
          setTimerSeconds(saved.timerSeconds || 0);
          const restoredDiff = saved.difficulty || difficulty;
          setDifficulty(restoredDiff);
          if (saved.selectedCell) setSelectedCell(saved.selectedCell);
          if (saved.direction) setDirection(saved.direction);
          setLoading(false);
          return;
        }
      } catch (e) {
        localStorage.removeItem('padam_active_session');
      }
    }
    const initialDiff = (localStorage.getItem('padam_difficulty') as GameDifficulty) || difficulty;
    fetchGeneratedPuzzle(initialDiff).then(data => {
      initializePuzzleState(data);
      setLoading(false);
    });
  }, []);

  // Timer loop: Only runs when active, not paused, not loading, and not solved
  useEffect(() => {
    if (!isTimerRunning || isSolved || loading) return;
    const interval = setInterval(() => {
      setTimerSeconds(s => s + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [isTimerRunning, isSolved, loading]);

  // Anti-cheat: Auto-pause when user leaves tab / minimizes app to search answers
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden && isTimerRunning && !isSolved && !loading) {
        setIsTimerRunning(false);
        setHasPaused(true);
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [isTimerRunning, isSolved, loading]);

  const ensureTimerRunning = () => {
    if (!isTimerRunning && !isSolved && !loading) {
      setIsTimerRunning(true);
    }
  };

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
    setActiveSessionInfo(null);
    setLoading(true);
    setStatusMessage(t.loadingNew);
    setIncorrectCells([]);
    setIsSolved(false);
    setIsTimerRunning(false);
    setHasPaused(false);
    setTimerSeconds(0);

    const data = await fetchGeneratedPuzzle(diff);
    initializePuzzleState(data);
    setLoading(false);
    setStatusMessage('');
  };

  const loadDailyPuzzle = async () => {
    localStorage.removeItem('padam_active_session');
    setActiveSessionInfo(null);
    setLoading(true);
    setStatusMessage(t.loadingDaily);
    setIncorrectCells([]);
    setIsSolved(false);
    setIsTimerRunning(false);
    setHasPaused(false);
    setTimerSeconds(0);

    const data = await fetchDailyPuzzle();
    setDifficulty('hard');
    localStorage.setItem('padam_difficulty', 'hard');
    initializePuzzleState(data);
    setLoading(false);
    setStatusMessage(t.dailyStarted);
  };

  const handleStartDaily = () => {
    setLoadingSubTitle(language === 'te' ? 'నేటి అధికారిక ఛాలెంజ్' : 'Daily Challenge');
    setCurrentScreen('loading');
    loadDailyPuzzle();
  };

  const handleStartClassic = (diff: GameDifficulty) => {
    setDifficulty(diff);
    localStorage.setItem('padam_difficulty', diff);
    const sizeName = diff === 'kids' ? '5x5' : diff === 'easy' ? '7x7' : diff === 'medium' ? '9x9' : '12x12';
    setLoadingSubTitle(`${language === 'te' ? 'క్లాసిక్ ఆట' : 'Classic Mode'} (${sizeName})`);
    setCurrentScreen('loading');
    loadPuzzle(diff);
  };

  const handleStartStory = () => {
    setIsTwoPlayerMode(false);
    setLoadingSubTitle(language === 'te' ? 'తెనాలి కథల పజిల్' : 'Tenali Story Mode');
    setCurrentScreen('loading');
    loadDailyPuzzle().then(() => {
      setIsClueListDrawerOpen(true);
    });
  };

  const handleDeductCoins = (amount: number): boolean => {
    if (coins < amount) return false;
    setCoins((prev) => {
      const updated = Math.max(0, prev - amount);
      localStorage.setItem('padam_coins', String(updated));
      return updated;
    });
    return true;
  };

  const handleStartThemed = (theme: 'cinema' | 'proverbs') => {
    setIsTwoPlayerMode(false);
    setLoadingSubTitle(
      theme === 'cinema'
        ? (language === 'te' ? 'ఆదివారం సినీ వినోదం' : 'Tollywood Cinema')
        : (language === 'te' ? 'సామెతలు & జాతీయాలు' : 'Telugu Proverbs')
    );
    setCurrentScreen('loading');
    localStorage.removeItem('padam_active_session');
    setActiveSessionInfo(null);
    setLoading(true);
    setIncorrectCells([]);
    setIsSolved(false);
    setIsTimerRunning(false);
    setHasPaused(false);
    setTimerSeconds(0);
    const data = theme === 'cinema' ? SPECIAL_CINEMA_PUZZLE : SPECIAL_PROVERBS_PUZZLE;
    initializePuzzleState(data);
    setLoading(false);
  };

  const handleStartTwoPlayer = () => {
    setIsTwoPlayerMode(true);
    setTwoPlayerScores({ p1: 0, p2: 0 });
    setLoadingSubTitle(language === 'te' ? 'పాస్ & ప్లే (2-Player)' : 'Pass & Play');
    setCurrentScreen('loading');
    loadPuzzle('easy');
  };

  const handleShareWhatsAppVictory = () => {
    const m = Math.floor(timerSeconds / 60);
    const s = timerSeconds % 60;
    const timeFormatted = `${m}:${s.toString().padStart(2, '0')}`;
    const streak = localStorage.getItem('padam_streak_count') || '3';
    const baseUrl = window.location.origin + window.location.pathname;
    const shareUrl = `${baseUrl}?challenge=win&time=${timerSeconds}`;

    const text =
      language === 'te'
        ? `🎉 నేను 'పదవినోదం' తెలుగు క్రాస్‌వర్డ్ పూర్తి చేశాను!\n⏱️ సమయం: ${timeFormatted} నిమిషాలు\n🪙 స్కోర్: ${score} పాయింట్లు\n🔥 స్ట్రీక్: ${streak} రోజులు\n\nమీరు నన్ను ఓడించగలరా? ఇప్పుడే ఆడండి:\n👉 ${shareUrl}`
        : `🎉 I solved the Telugu crossword on Padavinodam!\n⏱️ Time: ${timeFormatted}\n🪙 Score: ${score} points\n🔥 Streak: ${streak} days\n\nCan you beat my time? Play now:\n👉 ${shareUrl}`;

    if (navigator.clipboard) {
      navigator.clipboard.writeText(text).catch(() => {});
    }
    const waUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`;
    window.open(waUrl, '_blank');
  };

  const handleResumeGame = () => {
    const savedSessionStr = localStorage.getItem('padam_active_session');
    if (savedSessionStr) {
      try {
        const saved = JSON.parse(savedSessionStr);
        if (saved && saved.puzzle && saved.userGrid) {
          setPuzzle(saved.puzzle);
          setUserGrid(saved.userGrid);
          setTimerSeconds(saved.timerSeconds || 0);
          setDifficulty(saved.difficulty || difficulty);
          if (saved.selectedCell) setSelectedCell(saved.selectedCell);
          if (saved.direction) setDirection(saved.direction);
          setLoading(false);
          setCurrentScreen('game');
          setStatusMessage(language === 'te' ? 'గత ఆట పునరుద్ధరించబడింది!' : 'Game progress restored!');
          return;
        }
      } catch (e) {
        // fallback
      }
    }
    handleStartDaily();
  };

  const handleBackToHome = () => {
    setIsTimerRunning(false);
    if (puzzle && userGrid.length > 0 && !isSolved) {
      const hasAnyInput = userGrid.some(row => row.some(cell => cell && cell.trim() !== ''));
      if (hasAnyInput) {
        setActiveSessionInfo({
          difficulty,
          timerSeconds
        });
      }
    }
    setCurrentScreen('home');
  };

  const initializePuzzleState = (data: PuzzleData) => {
    setPuzzle(data);
    const newGrid = data.mask.map(row => row.map(isPlayable => (isPlayable ? '' : null)));
    setUserGrid(newGrid);
    setIsTimerRunning(false);
    setHasPaused(false);
    setTimerSeconds(0);

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
    ensureTimerRunning();
    if (selectedCell.r === r && selectedCell.c === c) {
      setDirection(d => (d === 'across' ? 'down' : 'across'));
    } else {
      setSelectedCell({ r, c });
    }
  };

  const handleSelectClue = (clue: ClueItem, dir: 'across' | 'down') => {
    ensureTimerRunning();
    setDirection(dir);
    setSelectedCell({ r: clue.row, c: clue.col });
  };

  const handleInsertSyllable = (syl: string) => {
    if (!puzzle) return;
    ensureTimerRunning();
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
    ensureTimerRunning();
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

  // New puzzle / Mode Switch: Enforces Kids Mode payment lock & 15-point incomplete skip penalty
  const handleRequestNewPuzzle = (targetDiff?: GameDifficulty) => {
    const nextDiff = targetDiff || difficulty;

    // 1. Kids Mode Payment Gate (₹49 one-time unlock)
    if (nextDiff === 'kids' && !isKidsUnlocked) {
      setTopUpInitialMode('kids');
      setIsTopUpOpen(true);
      setStatusMessage(
        language === 'te'
          ? '🔒 బాలల విభాగం (5x5) లాక్ చేయబడింది. అన్‌లాక్ చేయడానికి ₹49 చెల్లించండి.'
          : '🔒 Kids Mode (5x5) is locked. Unlock lifetime access for ₹49.'
      );
      return;
    }

    // 2. Incomplete Puzzle Skip Energy Penalty (15 Points)
    if (puzzle && userGrid.length > 0 && !isSolved) {
      const hasAnyInput = userGrid.some(row => row.some(cell => cell && cell.trim() !== ''));
      if (hasAnyInput) {
        if (energyPoints < 15) {
          setTopUpInitialMode('points');
          setIsTopUpOpen(true);
          setStatusMessage(
            language === 'te'
              ? '⚠️ అసంపూర్తి పజిల్ మార్చడానికి కనీసం 15 శక్తి పాయింట్లు అవసరం! దయచేసి టాప్-అప్ చేసుకోండి.'
              : '⚠️ Skipping an incomplete puzzle costs 15 Energy Points! Please top up.'
          );
          return;
        }
        setEnergyPoints(prev => {
          const updated = Math.max(0, prev - 15);
          localStorage.setItem('padam_energy_points', String(updated));
          return updated;
        });
      }
    }

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
      speakTenaliWin();
      const targetTime = TARGET_TIMES[difficulty];
      const isUnderTime = !hasPaused && timerSeconds <= targetTime;
      const speedBonusCoins = isUnderTime ? 5 : 0;

      if (isUnderTime) {
        setTimeout(() => speakTenaliSpeedBonus(), 2400);
      }

      if (isTwoPlayerMode) {
        if (direction === 'across') {
          setTwoPlayerScores(prev => ({ ...prev, p1: prev.p1 + 50 }));
        } else {
          setTwoPlayerScores(prev => ({ ...prev, p2: prev.p2 + 50 }));
        }
      }

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

      let message = isUnderTime
        ? (language === 'te'
            ? `🎉 అభినందనలు! నిర్ణీత సమయంలో పూర్తి చేశారు! +${earnedCoins} నాణేలు (+5 వేగ బోనస్ 🪙) గెలుచుకున్నారు!`
            : `🎉 Solved within time! +${earnedCoins} Coins (+5 Speed Bonus 🪙) awarded!`)
        : t.solvedMsg;

      if (!isUnderTime && hasPaused) {
        message += language === 'te'
          ? ' (ఆటలో విరామం తీసుకున్నందున స్పీడ్ బోనస్ రద్దు అయింది)'
          : ' (Speed bonus forfeited due to pause)';
      }

      setStatusMessage(message);
    } else {
      setMascotMoodOverride('facepalm');
      templeAudio.playWrongChime();
      speakTenaliWrong();
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
    ensureTimerRunning();
    const hint = hintOptions.find(h => h.id === hintType);
    if (!hint || coins < hint.coinCost) {
      setStatusMessage(
        language === 'te'
          ? `⚠️ అదనపు క్లూ కోసం నాణాలు సరిపోవు (${hint?.coinCost || 0} నాణాలు అవసరం). దయచేసి టాప్-అప్ చేసుకోండి.`
          : `⚠️ Not enough coins for hint (${hint?.coinCost || 0} coins required). Please top up.`
      );
      setTopUpInitialMode('points');
      setIsTopUpOpen(true);
      return;
    }

    setCoins(c => c - hint.coinCost);
    setMascotMoodOverride('hint_casting');
    templeAudio.playTempleBell();
    speakTenaliHint();
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

  // Vocal Feature: Start listening to Telugu voice dictation with multi-syllable auto-fill
  const handleStartVoiceInput = () => {
    if (isListening) return;
    ensureTimerRunning();
    setIsListening(true);
    setStatusMessage(
      language === 'te' 
        ? '🎙️ వింటున్నాము... పదాన్ని స్పష్టంగా పలకండి (Listening... speak clearly)' 
        : '🎙️ Listening... speak clearly in Telugu'
    );

    startTeluguListening(
      (transcript) => {
        setIsListening(false);
        if (!transcript) return;
        const clean = transcript.trim();
        const syls = splitIntoTeluguSyllables(clean);

        if (syls.length === 0) {
          setStatusMessage(language === 'te' ? `⚠️ మాట స్పష్టంగా లేదు: '${clean}'` : `⚠️ Unclear speech: '${clean}'`);
          return;
        }

        if (syls.length === 1) {
          // Single syllable: insert into selected cell and auto-advance cursor
          handleInsertSyllable(syls[0]);
          setStatusMessage(
            language === 'te'
              ? `🎙️ వాయిస్ అక్షరం: '${syls[0]}' నమోదు చేయబడింది`
              : `🎙️ Syllable '${syls[0]}' inserted`
          );
        } else {
          // Multi-syllable word (e.g. 'భారతం' -> ['భా', 'ర', 'తం']):
          // Auto-fill sequentially into the active clue's consecutive cells!
          if (!puzzle) return;
          templeAudio.playTileTap();
          const nextGrid = userGrid.map(row => [...row]);

          // Start from active clue's origin if cursor is at origin or empty
          let startR = selectedCell.r;
          let startC = selectedCell.c;
          if (activeClue && (startR === activeClue.row && startC === activeClue.col)) {
            startR = activeClue.row;
            startC = activeClue.col;
          }

          let lastR = startR;
          let lastC = startC;
          for (let i = 0; i < syls.length; i++) {
            const currR = direction === 'across' ? startR : startR + i;
            const currC = direction === 'across' ? startC + i : startC;

            if (currR < puzzle.size && currC < puzzle.size && puzzle.mask[currR][currC]) {
              nextGrid[currR][currC] = syls[i];
              lastR = currR;
              lastC = currC;
            }
          }

          setUserGrid(nextGrid);
          setSelectedCell({ r: lastR, c: lastC });
          setStatusMessage(
            language === 'te'
              ? `🎙️ వాయిస్ పదం: '${clean}' (${syls.join('-')}) నమోదు చేయబడింది!`
              : `🎙️ Word '${clean}' (${syls.join('-')}) filled across cells!`
          );
        }
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
    localStorage.setItem('padam_difficulty', 'kids');
    loadPuzzle('kids');
    setStatusMessage(
      language === 'te'
        ? '👶 అభినందనలు! బాలల విభాగం (5x5) శాశ్వతంగా విజయవంతంగా అన్‌లాక్ చేయబడింది!'
        : '👶 Congratulations! Kids Mode (5x5) permanently unlocked!'
    );
  };



  const targetTime = TARGET_TIMES[difficulty];

  if (currentScreen === 'home') {
    return (
      <>
        {showSplash && (
          <SplashScreen
            language={language}
            onFinish={() => {
              setShowSplash(false);
              sessionStorage.setItem("padam_splash_shown", "true");
            }}
          />
        )}

        <HomeScreen
          language={language}
          onToggleLanguage={() => setLanguage((l) => (l === "te" ? "en" : "te"))}
          coins={coins}
          energyPoints={energyPoints}
          onOpenTopUp={(mode) => {
            setTopUpInitialMode(mode || "points");
            setIsTopUpOpen(true);
          }}
          onOpenPrivacy={() => setIsPrivacyModalOpen(true)}
          onStartDaily={handleStartDaily}
          onStartClassic={handleStartClassic}
          onStartStory={handleStartStory}
          onStartTwoPlayer={handleStartTwoPlayer}
          onStartThemed={handleStartThemed}
          onDeductCoins={handleDeductCoins}
          hasActiveSession={!!activeSessionInfo}
          activeSessionInfo={activeSessionInfo}
          onResumeGame={handleResumeGame}
          isKidsUnlocked={isKidsUnlocked}
        />

        {/* Instant Top-Up Modal accessible from Home */}
        <TopUpModal
          isOpen={isTopUpOpen}
          onClose={() => setIsTopUpOpen(false)}
          currentPoints={energyPoints}
          currentCoins={coins}
          isKidsUnlocked={isKidsUnlocked}
          language={language}
          onAddPoints={(energyAmt, coinsAmt) => {
            setEnergyPoints((prev) => {
              const updated = prev + energyAmt;
              localStorage.setItem("padam_energy_points", String(updated));
              return updated;
            });
            setCoins((prev) => {
              const updated = prev + coinsAmt;
              localStorage.setItem("padam_coins", String(updated));
              return updated;
            });
          }}
          onUnlockKids={handleUnlockKidsPermanent}
          initialMode={topUpInitialMode}
        />

        {/* Privacy Policy Modal accessible from Home */}
        <PrivacyPolicyModal
          isOpen={isPrivacyModalOpen}
          onClose={() => setIsPrivacyModalOpen(false)}
          language={language}
        />
      </>
    );
  }

  if (currentScreen === 'loading') {
    return (
      <LoadingScreen
        language={language}
        isLoaded={!loading && !!puzzle}
        onFinished={() => setCurrentScreen('game')}
        subTitle={loadingSubTitle}
      />
    );
  }

  return (
    <div className="min-h-screen bg-[#faf6ee] text-stone-900 font-telugu p-2 sm:p-3 md:p-4 lg:p-6 flex flex-col items-center print:bg-white print:p-0 print:m-0 print:min-h-0">
      {/* Expanded Main Card Container - Generous Desktop & Tablet Width */}
      <div className="max-w-7xl w-full bg-[#fffdf9] border-2 border-stone-300 rounded-2xl shadow-lg p-2.5 sm:p-3.5 md:p-4 lg:p-5 print:border-none print:shadow-none print:p-0 print:m-0 print:bg-white print:max-w-full">
        <Header
          onNewPuzzle={() => {
            setLoadingSubTitle(language === 'te' ? 'కొత్త పజిల్' : 'New Puzzle');
            setCurrentScreen('loading');
            handleRequestNewPuzzle();
          }}
          onDailyPuzzle={() => {
            setLoadingSubTitle(language === 'te' ? 'నేటి ఛాలెంజ్' : 'Daily Challenge');
            setCurrentScreen('loading');
            loadDailyPuzzle();
          }}
          onVerify={handleVerify}
          onReveal={handleRevealAll}
          loading={loading}
          difficulty={difficulty}
          onDifficultyChange={(d) => {
            setLoadingSubTitle(language === 'te' ? 'మోడ్ మార్పు' : 'Switching Mode');
            setCurrentScreen('loading');
            handleRequestNewPuzzle(d);
          }}
          timerSeconds={timerSeconds}
          isTimerRunning={isTimerRunning}
          hasPaused={hasPaused}
          onToggleTimer={() => {
            if (!isSolved && !loading) {
              if (isTimerRunning) {
                setIsTimerRunning(false);
                setHasPaused(true);
              } else {
                setIsTimerRunning(true);
              }
            }
          }}
          score={score}
          bonusTimeAlert={bonusTimeAlert}
          language={language}
          onToggleLanguage={() =>
            setLanguage((l) => (l === "te" ? "en" : "te"))
          }
          energyPoints={energyPoints}
          coins={coins}
          onOpenTopUp={(mode) => {
            setTopUpInitialMode(mode || "points");
            setIsTopUpOpen(true);
          }}
          isKidsUnlocked={isKidsUnlocked}
          targetTimeSeconds={targetTime}
          isSolved={isSolved}
          onOpenPrivacy={() => setIsPrivacyModalOpen(true)}
          onOpenHints={() => setIsHintsModalOpen(true)}
          onBackToHome={handleBackToHome}
        />

        {/* 2-Player Pass & Play Turn Indicator Banner */}
        {isTwoPlayerMode && !isSolved && (
          <div className="flex items-center justify-between bg-purple-100/90 border border-purple-300 text-purple-950 px-3.5 py-2 rounded-xl text-xs font-bold mb-3 shadow-2xs">
            <div className="flex items-center gap-2">
              <Users size={16} className="text-purple-700" />
              <span>
                {direction === 'across' ? t.player1Turn : t.player2Turn}
              </span>
            </div>
            <div className="flex items-center gap-2 font-mono text-[11px]">
              <span className="bg-white px-2 py-0.5 rounded border border-purple-200 text-purple-900">
                P1 (అడ్డం): {twoPlayerScores.p1}
              </span>
              <span className="bg-white px-2 py-0.5 rounded border border-purple-200 text-purple-900">
                P2 (నిలువు): {twoPlayerScores.p2}
              </span>
            </div>
          </div>
        )}

        {/* Live Status Banner with WhatsApp Victory Share (Hidden on Print) */}
        {statusMessage && (
          <div
            className={`text-center py-2 px-4 mb-3 rounded-lg font-bold text-xs md:text-sm transition-all print:hidden ${
              isSolved
                ? "bg-emerald-100 text-emerald-900 border border-emerald-300 shadow-md"
                : "bg-amber-100 text-amber-900 border border-amber-300"
            }`}
          >
            <p>{statusMessage}</p>
            {isSolved && (
              <button
                type="button"
                onClick={handleShareWhatsAppVictory}
                className="mt-2.5 px-4 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl font-bold text-xs shadow-md transition active:scale-95 inline-flex items-center gap-1.5 cursor-pointer mx-auto"
                title="వాట్సాప్‌లో పంచుకోండి"
              >
                <Share2 size={14} />
                <span>{t.shareWhatsApp}</span>
              </button>
            )}
          </div>
        )}

        {/* Play & Clues Interactive Zone wrapped in relative container for blind-pause protection */}
        <div className="relative w-full">
          {/* Frosted Blind-Pause Curtain Overlay (NYT Crossword Anti-Cheat Standard) */}
          {puzzle && !isSolved && !loading && !isTimerRunning && (
            <div className="absolute inset-0 z-30 backdrop-blur-md bg-stone-900/60 rounded-2xl flex flex-col items-center justify-center p-4 sm:p-6 text-center select-none shadow-2xl animate-in fade-in duration-200">
              <div className="bg-[#fffdf9] border-2 border-amber-300 rounded-2xl p-5 sm:p-7 max-w-md w-full shadow-2xl flex flex-col items-center gap-3">
                {/* Icon Badge */}
                <div
                  className={`w-14 h-14 rounded-2xl flex items-center justify-center text-2xl shadow-inner ${
                    timerSeconds === 0
                      ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                      : 'bg-amber-100 text-amber-800 border border-amber-300'
                  }`}
                >
                  {timerSeconds === 0 ? '🎮' : '⏸️'}
                </div>

                {/* Title */}
                <h3 className="text-xl sm:text-2xl font-extrabold text-stone-900 font-telugu">
                  {timerSeconds === 0
                    ? (language === 'te' ? 'పదవినోదం సిద్ధంగా ఉంది' : 'Ready to Play')
                    : (language === 'te' ? 'ఆట విరామంలో ఉంది' : 'Game Paused')}
                </h3>

                {/* Description */}
                <p className="text-xs sm:text-sm text-stone-600 font-telugu leading-relaxed">
                  {timerSeconds === 0
                    ? (language === 'te'
                        ? 'ఆధారాలు మరియు గడులను చూసి పరిష్కరించడానికి ఆటను ప్రారంభించండి.'
                        : 'Start the game to reveal the clues and crossword grid.')
                    : (language === 'te'
                        ? 'సమయం ఆపినప్పుడు ఆధారాలు మరియు గడులు దాచబడతాయి. కొనసాగించడానికి క్రింది బటన్ నొక్కండి.'
                        : 'Clues and grid are hidden while the timer is paused. Tap resume to continue.')}
                </p>

                {/* Anti-Cheat Speed Bonus Alert */}
                {timerSeconds > 0 && hasPaused && (
                  <div className="bg-amber-50 border border-amber-300 text-amber-900 text-[11px] sm:text-xs py-1.5 px-3 rounded-lg font-medium">
                    {language === 'te'
                      ? '⚠️ విరామం తీసుకున్నందున స్పీడ్ బోనస్ నాణాలు (+5 🪙) రద్దు చేయబడ్డాయి'
                      : '⚠️ Speed bonus (+5 🪙) is forfeited for this paused run'}
                  </div>
                )}

                {/* Target time info on initial start */}
                {timerSeconds === 0 && (
                  <div className="bg-stone-100 border border-stone-200 text-stone-700 text-[11px] sm:text-xs py-1 px-3 rounded-lg font-mono">
                    {language === 'te'
                      ? `లక్ష్య సమయం: ${Math.floor(targetTime / 60)} నిమిషాలు • స్పీడ్ బోనస్: +5 🪙`
                      : `Target: ${Math.floor(targetTime / 60)} mins • Speed Bonus: +5 🪙`}
                  </div>
                )}

                {/* Resume / Start Button */}
                <button
                  type="button"
                  onClick={() => {
                    setIsTimerRunning(true);
                  }}
                  className={`w-full py-2.5 sm:py-3 px-6 rounded-xl font-bold text-sm sm:text-base text-white shadow-md transition active:scale-95 cursor-pointer flex items-center justify-center gap-2 ${
                    timerSeconds === 0
                      ? 'bg-emerald-700 hover:bg-emerald-800'
                      : 'bg-amber-700 hover:bg-amber-800'
                  }`}
                >
                  <Play size={18} className="fill-white" />
                  <span>
                    {timerSeconds === 0
                      ? (language === 'te' ? 'ఆటను ప్రారంభించండి' : 'Start Puzzle')
                      : (language === 'te' ? 'కొనసాగించండి' : 'Resume Puzzle')}
                  </span>
                </button>
              </div>
            </div>
          )}

          {/* 4. Clue Section (Line 1: Across/Down on top, Line 2: Complete Clue, Line 3: Symmetric Action Buttons) */}
          {activeClue && (
          <div className="mb-2.5 sm:mb-3 p-2.5 sm:p-3 bg-gradient-to-r from-amber-50/90 via-white to-amber-50/90 border-2 border-amber-300 rounded-2xl shadow-xs flex flex-col gap-1.5 sm:gap-2 print:hidden">
            {/* Line 1: Across & Down on Top + Syllable Count */}
            <div className="flex items-center justify-between border-b border-amber-200/70 pb-1.5 sm:pb-2">
              <div className="inline-flex rounded-lg bg-stone-100 p-0.5 border border-stone-200">
                <button
                  type="button"
                  onClick={() => {
                    ensureTimerRunning();
                    setDirection("across");
                  }}
                  className={`px-3 py-1 rounded-md text-xs font-bold transition flex items-center gap-1 cursor-pointer ${
                    direction === "across"
                      ? "bg-red-600 text-white shadow-xs"
                      : "text-stone-600 hover:text-stone-900"
                  }`}
                >
                  <span>{language === "te" ? "అడ్డం" : "Across"}</span>
                  {direction === "across" && <span className="font-mono">#{activeClue.number}</span>}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    ensureTimerRunning();
                    setDirection("down");
                  }}
                  className={`px-3 py-1 rounded-md text-xs font-bold transition flex items-center gap-1 cursor-pointer ${
                    direction === "down"
                      ? "bg-blue-600 text-white shadow-xs"
                      : "text-stone-600 hover:text-stone-900"
                  }`}
                >
                  <span>{language === "te" ? "నిలువు" : "Down"}</span>
                  {direction === "down" && <span className="font-mono">#{activeClue.number}</span>}
                </button>
              </div>

              <span className="text-xs text-amber-900 bg-amber-100 border border-amber-300 px-2.5 py-0.5 rounded-md font-mono font-bold shrink-0">
                {activeClue.length} {t.cells}
              </span>
            </div>

            {/* Line 2: Complete Clue Text (Never truncated) */}
            <div className="py-0.5 sm:py-1 px-1">
              <p className="font-telugu font-bold text-sm sm:text-base md:text-lg text-stone-900 leading-snug">
                <span className="text-amber-800 font-mono font-bold mr-1.5">
                  {activeClue.number}.
                </span>
                {activeClue.clue}
              </p>
            </div>

            {/* Line 3: Symmetric & Neat Action Buttons (Listen, Voice, Hint, All Clues & Story) */}
            <div className="grid grid-cols-4 gap-1.5 pt-1.5 border-t border-amber-200/70">
              <button
                type="button"
                onClick={() => {
                  ensureTimerRunning();
                  speakTeluguText(activeClue.clue, (msg) => setStatusMessage(msg));
                }}
                className="flex items-center justify-center gap-1 py-1.5 px-1 sm:px-2 bg-amber-50 hover:bg-amber-100 text-amber-900 rounded-xl border border-amber-300 text-xs font-bold shadow-2xs transition active:scale-95 cursor-pointer"
                title={language === "te" ? "క్లూను చదివి వినిపించు (Listen)" : "Read Clue Aloud"}
              >
                <Volume2 size={14} className="text-amber-700 shrink-0" />
                <span className="text-[11px] truncate">{language === "te" ? "చదువు" : "Listen"}</span>
              </button>

              <button
                type="button"
                onClick={handleStartVoiceInput}
                className={`flex items-center justify-center gap-1 py-1.5 px-1 sm:px-2 rounded-xl border text-xs font-bold shadow-2xs transition active:scale-95 cursor-pointer ${
                  isListening
                    ? "bg-red-600 text-white animate-pulse border-red-500"
                    : "bg-white hover:bg-stone-50 text-red-600 border-stone-300"
                }`}
                title={language === "te" ? "వాయిస్ ద్వారా సమాధానం చెప్పండి" : "Speak Answer"}
              >
                <Mic size={14} className="shrink-0" />
                <span className="text-[11px] truncate">{language === "te" ? "వాయిస్" : "Speak"}</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  ensureTimerRunning();
                  setIsHintsModalOpen(true);
                }}
                className="flex items-center justify-center gap-1 py-1.5 px-1 sm:px-2 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-bold shadow-2xs transition active:scale-95 cursor-pointer"
                title={language === "te" ? "సూచన తీసుకోండి (Hints)" : "Use Hint"}
              >
                <Lightbulb size={14} className="shrink-0" />
                <span className="text-[11px] truncate">{language === "te" ? "సూచన" : "Hints"}</span>
              </button>

              <button
                type="button"
                onClick={() => setIsClueListDrawerOpen(true)}
                className="flex items-center justify-center gap-1 py-1.5 px-1 sm:px-2 bg-stone-800 hover:bg-stone-900 text-white rounded-xl text-xs font-bold shadow-2xs transition active:scale-95 cursor-pointer"
                title={language === "te" ? "అన్ని ఆధారాలు & తెనాలి కథ" : "All Clues & Story"}
              >
                <ListFilter size={14} className="shrink-0" />
                <span className="text-[11px] truncate">{language === "te" ? "ఆధారాలు" : "All Clues"}</span>
              </button>
            </div>
          </div>
        )}

        {puzzle && (
          <>
            {/* Screen Interactive Game Play Area (Hidden when printing) */}
            <div className="flex flex-col gap-4 w-full print:hidden">
              {/* Play Area: Centered Grid & Flexible Desktop Clues Table */}
              <div className="flex flex-col lg:flex-row gap-5 lg:gap-6 items-center lg:items-start justify-center w-full">
                {/* Crossword Grid */}
                <div className="flex flex-col items-center shrink-0 w-full lg:w-auto">
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
                    onToggleDirection={() =>
                      setDirection((d) => (d === "across" ? "down" : "across"))
                    }
                  />
                </div>

                {/* Desktop-only Side Clues Table (Takes all available space so clues are never trimmed) */}
                <div className="hidden lg:flex flex-col flex-1 min-w-0 w-full self-stretch">
                  <ClueList
                    clues={puzzle.clues}
                    activeClue={activeClue}
                    direction={direction}
                    language={language}
                    onSelectClue={handleSelectClue}
                  />
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

          </>
        )}
        </div>

        {/* App Footer: In-App Privacy Policy & Developer Links */}
        <footer className="mt-8 pt-4 border-t border-stone-200 text-stone-500 font-telugu select-none print:hidden flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-1.5 text-stone-600">
            <span>© {new Date().getFullYear()}</span>
            <span className="font-bold text-stone-800">పదవినోదం (Padavinodam)</span>
            <span>•</span>
            <span className="text-stone-500">Arya Bhupathi</span>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setIsPrivacyModalOpen(true)}
              className="text-amber-800 hover:text-amber-950 font-bold underline underline-offset-4 cursor-pointer transition flex items-center gap-1.5 py-1 px-2.5 rounded-lg hover:bg-amber-50 border border-transparent hover:border-amber-300"
            >
              <ShieldCheck size={14} className="text-emerald-700" />
              <span>{language === 'te' ? 'గోప్యతా విధానం (Privacy Policy)' : 'Privacy Policy'}</span>
            </button>

            <a
              href="https://padam.onrender.com/privacy.html"
              target="_blank"
              rel="noreferrer"
              className="text-stone-500 hover:text-amber-900 text-[11px] underline underline-offset-2 transition"
            >
              Web Link
            </a>
          </div>
        </footer>
      </div>

      {/* Instant Top-Up Modal (Direct UPI & Auto-Regen notice) */}
      <TopUpModal
        isOpen={isTopUpOpen}
        onClose={() => setIsTopUpOpen(false)}
        currentPoints={energyPoints}
        currentCoins={coins}
        isKidsUnlocked={isKidsUnlocked}
        language={language}
        onAddPoints={(energyAmt, coinsAmt) => {
          setEnergyPoints((prev) => {
            const updated = prev + energyAmt;
            localStorage.setItem("padam_energy_points", String(updated));
            return updated;
          });
          setCoins((prev) => {
            const updated = prev + coinsAmt;
            localStorage.setItem("padam_coins", String(updated));
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
            <div className="bg-linear-to-r from-rose-700 via-red-600 to-rose-800 text-white p-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-white/20 rounded-xl">
                  <Eye size={22} className="text-white" />
                </div>
                <div>
                  <h3 className="text-base md:text-lg font-bold">
                    {t.revealModalTitle}
                  </h3>
                  <p className="text-xs text-rose-100">{t.revealModalDesc}</p>
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
                    {language === "te"
                      ? "మిగిలిన ఖాళీ/తప్పు గడులు:"
                      : "Remaining unsolved cells:"}
                  </span>
                  <span className="font-bold font-mono text-stone-900 bg-white px-2 py-0.5 rounded border border-rose-200">
                    {remainingCount} {t.cells}
                  </span>
                </div>

                <div className="flex items-center justify-between text-xs">
                  <span className="text-stone-600">
                    {language === "te"
                      ? "అవసరమైన కనీస మొత్తం:"
                      : "Minimum required cost:"}
                  </span>
                  <span className="font-bold font-mono text-rose-700 bg-white px-2 py-0.5 rounded border border-rose-200">
                    {minDrainCost} 🪙
                  </span>
                </div>

                <div className="flex items-center justify-between text-xs">
                  <span className="text-stone-600">
                    {language === "te"
                      ? "మీ ప్రస్తుత నాణేల బ్యాలెన్స్:"
                      : "Your current coin balance:"}
                  </span>
                  <span
                    className={`font-bold font-mono px-2 py-0.5 rounded border ${
                      canAffordReveal
                        ? "text-emerald-700 bg-emerald-50 border-emerald-300"
                        : "text-rose-700 bg-rose-100 border-rose-300"
                    }`}
                  >
                    {coins} 🪙
                  </span>
                </div>
              </div>

              {/* Warning description */}
              {canAffordReveal ? (
                <div className="p-3 bg-amber-50 border border-amber-300 rounded-xl text-xs text-amber-950 space-y-1">
                  <p className="font-bold text-amber-900 flex items-center gap-1">
                    <span>⚠️</span>
                    <span>
                      {language === "te"
                        ? "పూర్తి బ్యాలెన్స్ ఖాళీ అవుతుంది!"
                        : "Complete Balance Will Be Emptied!"}
                    </span>
                  </p>
                  <p className="leading-relaxed">
                    {t.revealDrainNotice.replace("{coins}", String(coins))}
                  </p>
                  <p className="text-[11px] text-stone-500 pt-1">
                    {t.revealCostExplain
                      .replace("{remaining}", String(remainingCount))
                      .replace("{cost}", String(minDrainCost))}
                  </p>
                </div>
              ) : (
                <div className="p-3 bg-red-50 border border-red-300 rounded-xl text-xs text-red-950 space-y-1">
                  <p className="font-bold text-red-900">
                    {t.revealNotEnoughCoins.replace(
                      "{cost}",
                      String(minDrainCost),
                    )}
                  </p>
                  <p className="text-[11px] text-stone-600">
                    {language === "te"
                      ? "మరిన్ని నాణాలు కొనుగోలు చేయడానికి లేదా పజిల్స్ పూర్తి చేయడానికి కింద బటన్ నొక్కండి."
                      : "Purchase more coins or solve clues to earn coins."}
                  </p>
                </div>
              )}

              {/* Action buttons */}
              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsRevealModalOpen(false)}
                  className="px-4 py-2 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-xl font-medium text-xs transition cursor-pointer"
                >
                  {t.cancelBtn}
                </button>

                {canAffordReveal ? (
                  <button
                    type="button"
                    onClick={handleConfirmDrainReveal}
                    className="px-4 py-2 bg-rose-700 hover:bg-rose-800 text-white rounded-xl font-bold text-xs shadow-md transition active:scale-95 flex items-center gap-1.5 cursor-pointer"
                  >
                    <Eye size={14} />
                    <span>{t.confirmDrainBtn}</span>
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => {
                      setIsRevealModalOpen(false);
                      setTopUpInitialMode("points");
                      setIsTopUpOpen(true);
                    }}
                    className="px-4 py-2 bg-linear-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 text-white rounded-xl font-bold text-xs shadow-md transition active:scale-95 cursor-pointer flex items-center gap-1.5"
                  >
                    <span>
                      {language === "te"
                        ? "నాణాలు కొనండి (Top-Up)"
                        : "Buy Coins (Top-Up)"}
                    </span>
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Full Clue List Drawer with Story Mode (Tenali Rama) */}
      {puzzle && (
        <ClueListDrawer
          isOpen={isClueListDrawerOpen}
          onClose={() => setIsClueListDrawerOpen(false)}
          clues={puzzle.clues}
          activeClue={activeClue}
          direction={direction}
          language={language}
          selectedCell={selectedCell}
          userGrid={userGrid}
          mascotMoodOverride={mascotMoodOverride}
          onToggleDirection={() => setDirection((d) => (d === "across" ? "down" : "across"))}
          onUseHint={() => handleUseHint("reveal_syllable")}
          onSelectClue={handleSelectClue}
        />
      )}

      {/* In-App Privacy Policy Modal (PhonePe Indus & Google Play Compliant) */}
      <PrivacyPolicyModal
        isOpen={isPrivacyModalOpen}
        onClose={() => setIsPrivacyModalOpen(false)}
        language={language}
      />

      {/* On-Demand Hints Modal (Declutters main gameplay screen) */}
      {isHintsModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-150 print:hidden">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full border-2 border-amber-300 overflow-hidden font-telugu">
            <div className="bg-gradient-to-r from-amber-700 via-amber-800 to-amber-900 text-white p-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="p-1.5 bg-amber-500/20 border border-amber-400/30 rounded-xl">
                  <Lightbulb size={20} className="text-amber-300" />
                </div>
                <div>
                  <h3 className="text-base font-bold">
                    {language === 'te' ? 'పజిల్ సహాయ సూచనలు (Hints)' : 'Puzzle Hints & Power-ups'}
                  </h3>
                  <p className="text-xs text-amber-200">
                    {language === 'te' ? 'చిక్కు పదాలను సులభంగా పరిష్కరించడానికి ఎంచుకోండి' : 'Choose a hint to help solve difficult clues'}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsHintsModalOpen(false)}
                className="p-1.5 hover:bg-white/20 rounded-full text-white cursor-pointer transition"
              >
                <X size={20} />
              </button>
            </div>

            <div className="p-4 sm:p-5">
              <GamifiedHints
                hints={hintOptions}
                coins={coins}
                language={language}
                onUseHint={(hintType) => {
                  handleUseHint(hintType);
                  setIsHintsModalOpen(false);
                }}
                onOpenTopUp={() => {
                  setIsHintsModalOpen(false);
                  setTopUpInitialMode('points');
                  setIsTopUpOpen(true);
                }}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
