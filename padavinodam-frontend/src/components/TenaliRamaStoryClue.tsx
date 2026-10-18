import React, { useEffect, useState } from 'react';
import type { ClueItem, CluesGroup } from '../types/puzzle';
import { TRANSLATIONS, type Language } from '../utils/translations';
import { TenaliRamaMascot, type MascotMood } from './TenaliRamaMascot';
import { Volume2, VolumeX, RotateCcw, ListFilter, Sparkles, ChevronRight } from 'lucide-react';
import { speakTeluguText } from '../utils/speech';
import { templeAudio } from '../utils/templeAudio';

interface TenaliRamaStoryClueProps {
  activeClue: ClueItem | null;
  direction: 'across' | 'down';
  selectedCell: { r: number; c: number };
  userGrid: (string | null)[][];
  allClues?: CluesGroup;
  language: Language;
  mascotMoodOverride?: MascotMood | null;
  onToggleDirection: () => void;
  onSelectAlternateClue?: (clue: ClueItem, dir: 'across' | 'down') => void;
  onOpenFullClues: () => void;
  onUseHint?: () => void;
}

const TENALI_QUOTES = [
  "చమత్కారం ఉంటే చాలు, ఎంతటి చిక్కు పదాలైనా ఇట్టే విడిపోతాయి మహారాజా!",
  "రాయలవారి ఆస్థానంలో పద సంపదకు కొదవే లేదు! సరైన అక్షరాన్ని ఆలోచించండి!",
  "శభాష్! అక్షరజ్ఞానం ప్రకాశిస్తోంది! కొనసాగించండి!",
  "తెలుగు లెస్స అని చాటిన విజయనగరం ఇది! ఈ పదం మీదే!",
  "కష్టంగా ఉంటే దివ్య దృష్టి సూచనను ఉపయోగించండి మిత్రమా!",
  "గడి ఖాళీగా ఉంచకండి, ఏదో ఒక అక్షరం ప్రయత్నించండి!"
];

export const TenaliRamaStoryClue: React.FC<TenaliRamaStoryClueProps> = ({
  activeClue,
  direction,
  selectedCell,
  userGrid,
  allClues,
  language,
  mascotMoodOverride,
  onToggleDirection,
  onSelectAlternateClue,
  onOpenFullClues,
  onUseHint
}) => {
  const t = TRANSLATIONS[language];
  const [mascotMood, setMascotMood] = useState<MascotMood>('idle');
  const [wittyDialogue, setWittyDialogue] = useState(TENALI_QUOTES[0]);
  const [autoSpeak, setAutoSpeak] = useState(false);

  // Sync with game-driven mood override (e.g. win, error, hint)
  useEffect(() => {
    if (mascotMoodOverride) {
      setMascotMood(mascotMoodOverride);
      if (mascotMoodOverride === 'celebrating') {
        setWittyDialogue("శభాష్ మహారాజా! మీ పద ప్రావీణ్యం అమోఘం!");
      } else if (mascotMoodOverride === 'facepalm') {
        setWittyDialogue("అయ్యో! కొద్దిలో తప్పింది రాయలవారూ, మరోసారి ఆలోచించండి!");
      } else if (mascotMoodOverride === 'hint_casting') {
        setWittyDialogue("ఇదిగో నా కలం నుంచి దివ్య అక్షర కాంతి!");
      }
      const resetTimer = setTimeout(() => setMascotMood('idle'), 3500);
      return () => clearTimeout(resetTimer);
    }
  }, [mascotMoodOverride]);

  // Check if current cell is at an intersection with an alternate clue
  const alternateDir = direction === 'across' ? 'down' : 'across';
  const alternateClue = allClues
    ? allClues[alternateDir].find(c => {
        if (alternateDir === 'across') {
          return selectedCell.r === c.row && selectedCell.c >= c.col && selectedCell.c < c.col + c.length;
        } else {
          return selectedCell.c === c.col && selectedCell.r >= c.row && selectedCell.r < c.row + c.length;
        }
      })
    : null;

  // Autonomous character reaction when activeClue or selectedCell changes
  useEffect(() => {
    if (activeClue) {
      // If it's a long clue or 25% chance: bring out magnifying glass!
      const isComplexClue = activeClue.length >= 5 || Math.random() < 0.25;
      if (isComplexClue) {
        setMascotMood('inspecting');
        setWittyDialogue("ఆగండి! నా భూతద్దంతో ఈ చిక్కు పదాన్ని పరిశీలిస్తాను!");
      } else {
        setMascotMood('speaking');
        const nextQuote = TENALI_QUOTES[Math.floor(Math.random() * TENALI_QUOTES.length)];
        setWittyDialogue(nextQuote);
      }

      if (autoSpeak) {
        speakTeluguText(activeClue.clue);
      }

      const timer = setTimeout(() => setMascotMood('idle'), 2500);
      return () => clearTimeout(timer);
    }
  }, [activeClue?.id, direction, selectedCell.r, selectedCell.c, autoSpeak]);

  // Inactivity detection: Automatically chill with coconut water after 12s of user silence
  useEffect(() => {
    const idleTimer = setTimeout(() => {
      setMascotMood('chilling_coconut');
      setWittyDialogue("రాయలవారూ, ఆలోచనలో మునిగారా? నేనీ లోపు తీపి కొబ్బరి నీళ్లు తాగుతాను!");
    }, 12000);

    return () => clearTimeout(idleTimer);
  }, [activeClue?.id, selectedCell.r, selectedCell.c, direction, userGrid]);

  const handleSpeakAloud = () => {
    if (activeClue) {
      setMascotMood('speaking');
      speakTeluguText(activeClue.clue);
      setTimeout(() => setMascotMood('idle'), 2200);
    }
  };

  // Direct poke on Tenali delivers playful chuckles and witty remarks
  const handleMascotClick = () => {
    templeAudio.playTempleBell();
    const responses = [
      { mood: 'celebrating' as MascotMood, quote: "హాహా! కితకితలు పెట్టకండి మహారాజా! పదాన్ని శోధించండి!" },
      { mood: 'inspecting' as MascotMood, quote: "ఈ గడిలో ఏదో గూఢమైన అర్థం దాగి ఉంది, ఆలోచించండి!" },
      { mood: 'chilling_coconut' as MascotMood, quote: "కొబ్బరి నీళ్లు తాగితే బుద్ధికి పదును పెరుగుతుంది!" },
      { mood: 'speaking' as MascotMood, quote: "తెనాలి రామకృష్ణుడు ఎల్లప్పుడూ మీ సేవలో ఉంటాడు!" }
    ];
    const picked = responses[Math.floor(Math.random() * responses.length)];
    setMascotMood(picked.mood);
    setWittyDialogue(picked.quote);
    speakTeluguText(picked.quote);
    setTimeout(() => setMascotMood('idle'), 3000);
  };

  // Build the word preview array from userGrid
  const getWordPreview = () => {
    if (!activeClue) return [];
    const preview: { char: string; isFilled: boolean; isCurrent: boolean }[] = [];
    for (let i = 0; i < activeClue.length; i++) {
      const r = direction === 'across' ? activeClue.row : activeClue.row + i;
      const c = direction === 'across' ? activeClue.col + i : activeClue.col;
      const val = userGrid[r]?.[c] || '';
      const isCurrent = r === selectedCell.r && c === selectedCell.c;
      preview.push({ char: val, isFilled: val !== '', isCurrent });
    }
    return preview;
  };

  const wordPreview = getWordPreview();

  return (
    <div className="w-full bg-gradient-to-br from-[#fefbf6] via-[#faf4e6] to-[#f5ebd2] border-2 border-amber-600/80 rounded-2xl p-3 md:p-4 shadow-md relative overflow-hidden flex flex-col justify-between">
      {/* Decorative Traditional Temple Filigree Header */}
      <div className="flex items-center justify-between border-b border-amber-300/80 pb-2 mb-2.5">
        <div className="flex items-center gap-2">
          <div className="w-2.5 h-2.5 rounded-full bg-amber-600 shadow-sm animate-pulse" />
          <span className="text-xs md:text-sm font-bold text-amber-900 font-telugu uppercase tracking-wider">
            ఆస్థాన వికటకవి పద నిరూపణ
          </span>
          <span className="hidden sm:inline-block text-[11px] bg-amber-200/80 text-amber-900 px-2 py-0.5 rounded-full font-serif border border-amber-400/50">
            Tenali Clue
          </span>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => setAutoSpeak(!autoSpeak)}
            className={`px-2 py-1 rounded-md text-[11px] font-semibold flex items-center gap-1 transition border ${
              autoSpeak
                ? 'bg-amber-600 text-white border-amber-700 shadow-xs'
                : 'bg-white/80 hover:bg-white text-stone-700 border-amber-300'
            }`}
            title="స్వయంచాలక వాయిస్ (Auto-speak clue)"
          >
            {autoSpeak ? <Volume2 size={13} /> : <VolumeX size={13} />}
            <span className="hidden md:inline">{autoSpeak ? 'వాయిస్ ఆన్' : 'వాయిస్'}</span>
          </button>

          <button
            type="button"
            onClick={onOpenFullClues}
            className="px-2.5 py-1 rounded-md text-[11px] font-bold bg-amber-900 text-amber-100 hover:bg-amber-800 border border-amber-700 transition flex items-center gap-1 shadow-xs"
            title="పూర్తి పదాల జాబితా తెరవండి"
          >
            <ListFilter size={13} />
            <span>{language === 'te' ? 'పూర్తి జాబితా' : 'All Clues'}</span>
          </button>
        </div>
      </div>

      {/* Main Content Area: Tenali Mascot on Left + Animated Parchment Speech Bubble */}
      <div className="flex flex-col sm:flex-row items-center sm:items-start gap-3 md:gap-4 my-1">
        {/* Animated Tenali Mascot (Tap directly to hear witty remarks!) */}
        <div className="shrink-0 flex flex-col items-center">
          <TenaliRamaMascot mood={mascotMood} onClick={handleMascotClick} />
          <span className="text-[10px] text-amber-800 font-bold mt-0.5 font-telugu opacity-80">
            తెనాలి రామలింగడు
          </span>
        </div>

        {/* Animated Parchment Speech Scroll */}
        <div className="flex-1 w-full min-w-0 bg-gradient-to-b from-[#fffef8] to-[#fbf1db] border-2 border-amber-500/80 rounded-xl p-3 md:p-3.5 shadow-sm relative">
          {/* Triangular speech bubble arrow pointing to Tenali */}
          <div className="hidden sm:block absolute -left-2.5 top-6 w-3 h-3 bg-[#fffef8] border-b-2 border-l-2 border-amber-500/80 rotate-45" />

          {activeClue ? (
            <div className="flex flex-col gap-2">
              {/* Clue Number, Direction Badge, and Toggle */}
              <div className="flex items-center justify-between flex-wrap gap-1.5 border-b border-amber-200/80 pb-1.5">
                <div className="flex items-center gap-1.5">
                  <span className="px-2 py-0.5 rounded-md bg-amber-600 text-white font-bold text-xs md:text-sm font-sans shadow-xs">
                    {activeClue.number}
                  </span>
                  <span className="text-xs md:text-sm font-extrabold text-amber-950 font-telugu">
                    {direction === 'across' ? t.across : t.down}
                  </span>
                  <span className="text-xs font-mono font-bold text-amber-800 bg-amber-100/80 px-1.5 py-0.5 rounded border border-amber-300/60">
                    {activeClue.length} {language === 'te' ? 'అక్షరాలు' : 'letters'}
                  </span>
                </div>

                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={handleSpeakAloud}
                    className="p-1 rounded-md bg-amber-100 hover:bg-amber-200 text-amber-900 border border-amber-300 transition"
                    title="వినండి (Listen)"
                  >
                    <Volume2 size={15} />
                  </button>
                  <button
                    type="button"
                    onClick={onToggleDirection}
                    className="px-2 py-1 rounded-md text-[11px] font-bold bg-stone-100 hover:bg-amber-100 text-stone-800 border border-stone-300 transition flex items-center gap-1"
                    title="దిశ మార్చండి (స్పేస్‌బార్)"
                  >
                    <RotateCcw size={12} />
                    <span>{direction === 'across' ? 'నిలువుగా' : 'అడ్డంగా'}</span>
                  </button>
                </div>
              </div>

              {/* Spoken Clue Text */}
              <div className="text-stone-900 text-sm md:text-base font-semibold leading-relaxed font-telugu min-h-[44px] flex items-center">
                "{activeClue.clue}"
              </div>

              {/* Word Syllable Slots Preview */}
              <div className="mt-1 pt-1.5 border-t border-amber-200/60">
                <div className="text-[10px] uppercase tracking-wider text-amber-800 font-bold mb-1 flex items-center justify-between">
                  <span>పద రూపం (Word Preview):</span>
                  {alternateClue && (
                    <button
                      type="button"
                      onClick={() => {
                        if (onSelectAlternateClue) {
                          onSelectAlternateClue(alternateClue, alternateDir);
                        } else {
                          onToggleDirection();
                        }
                      }}
                      className="text-amber-700 hover:text-amber-950 underline font-normal flex items-center text-[10px]"
                    >
                      <span>మరో పదం: {alternateClue.number} {alternateDir === 'across' ? 'అడ్డంగా' : 'నిలువుగా'}</span>
                      <ChevronRight size={11} />
                    </button>
                  )}
                </div>

                <div className="flex flex-wrap items-center gap-1">
                  {wordPreview.map((slot, idx) => (
                    <div
                      key={idx}
                      className={`w-7 h-7 md:w-8 md:h-8 rounded-md flex items-center justify-center font-bold font-telugu text-xs md:text-sm border transition-all ${
                        slot.isCurrent
                          ? 'bg-amber-400 text-black border-amber-600 shadow-sm ring-2 ring-amber-500 scale-105'
                          : slot.isFilled
                          ? 'bg-white text-stone-900 border-amber-300 shadow-xs'
                          : 'bg-amber-100/50 text-stone-400 border-dashed border-amber-400'
                      }`}
                    >
                      {slot.isFilled ? slot.char : '_'}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="py-6 text-center text-stone-500 font-telugu text-sm">
              చదరంగం గడిపై క్లిక్ చేయండి, తెనాలి రామలింగడు పదాన్ని వినిపిస్తాడు!
            </div>
          )}
        </div>
      </div>

      {/* Tenali Rama Witty Speech Footer */}
      <div className="mt-2 pt-2 border-t border-amber-300/70 flex items-center justify-between text-xs text-amber-900 font-telugu bg-amber-200/40 px-3 py-1.5 rounded-xl">
        <div className="flex items-center gap-1.5 truncate">
          <Sparkles size={13} className="text-amber-700 shrink-0" />
          <span className="italic truncate">"{wittyDialogue}"</span>
        </div>
        {onUseHint && (
          <button
            type="button"
            onClick={onUseHint}
            className="shrink-0 ml-2 text-[11px] font-bold text-amber-800 hover:text-amber-950 underline"
          >
            సూచన కావాలా?
          </button>
        )}
      </div>
    </div>
  );
};
