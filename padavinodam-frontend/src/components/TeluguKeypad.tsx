import React, { useState } from 'react';
import { transliterateToTelugu } from '../utils/transliteration';
import { TRANSLATIONS, type Language } from '../utils/translations';
import { Delete, Keyboard, Sparkles, X, Mic } from 'lucide-react';

interface TeluguKeypadProps {
  onInsertSyllable: (syl: string) => void;
  onBackspace: () => void;
  language: Language;
  solutionGrid?: (string | null)[][] | null;
  onVoiceInput?: () => void;
  isListening?: boolean;
}

// Common High-Frequency Crossword Syllables
const COMMON_SYLLABLES = [
  'క', 'కా', 'కి', 'కు', 'కం', 'గ', 'గా', 'గి', 'గు', 'గం',
  'చ', 'చా', 'చి', 'చు', 'చం', 'జ', 'జా', 'జి', 'జు', 'జం',
  'ట', 'టా', 'టి', 'టు', 'టం', 'డ', 'డా', 'డి', 'డు', 'డం',
  'త', 'తా', 'తి', 'తు', 'తం', 'ద', 'దా', 'ది', 'దు', 'దం',
  'న', 'నా', 'ని', 'ను', 'నం', 'ప', 'పా', 'పి', 'పు', 'పం',
  'బ', 'బా', 'బి', 'బు', 'బం', 'మ', 'మా', 'మి', 'ము', 'మం',
  'య', 'యా', 'యి', 'యు', 'యం', 'ర', 'రా', 'రి', 'రు', 'రం',
  'ల', 'లా', 'లి', 'లు', 'లం', 'వ', 'వా', 'వి', 'వు', 'వం',
  'స', 'సా', 'సి', 'సు', 'సం', 'హ', 'హా', 'హి', 'హు', 'హం',
  'క్ష', 'ల్యా', 'శ్రీ', 'ధా', 'భీ', 'త్యం', 'త్నం', 'స్త'
];

// All Telugu Consonants (హల్లులు)
const TELUGU_HALLULU = [
  'క', 'ఖ', 'గ', 'ఘ', 'ఙ',
  'చ', 'ఛ', 'జ', 'ఝ', 'ఞ',
  'ట', 'ఠ', 'డ', 'ఢ', 'ణ',
  'త', 'థ', 'ద', 'ధ', 'న',
  'ప', 'ఫ', 'బ', 'భ', 'మ',
  'య', 'ర', 'ల', 'వ', 'శ',
  'ష', 'స', 'హ', 'ళ', 'క్ష', 'ఱ'
];

// Vowel Signs & Modifiers (గుణింతాలు & చిహ్నాలు)
const TELUGU_GUNINTHALU = [
  'ా', 'ి', 'ీ', 'ు', 'ూ', 'ృ', 'ె', 'ే', 'ై', 'ొ', 'ో', 'ౌ', 'ం', 'ః', '్'
];

// Independent Vowels (అచ్చులు)
const TELUGU_ACHCHULU = [
  'అ', 'ఆ', 'ఇ', 'ఈ', 'ఉ', 'ఊ', 'ఋ', 'ఎ', 'ఏ', 'ఐ', 'ఒ', 'ఓ', 'ఔ', 'అం'
];

export const TeluguKeypad: React.FC<TeluguKeypadProps> = ({
  onInsertSyllable,
  onBackspace,
  language,
  solutionGrid,
  onVoiceInput,
  isListening
}) => {
  const t = TRANSLATIONS[language];
  const [phoneticInput, setPhoneticInput] = useState('');
  const [activeCategory, setActiveCategory] = useState<'puzzle' | 'common' | 'hallulu' | 'achchulu' | 'guninthalu'>('puzzle');

  // Extract distinct syllables present in current puzzle solution
  const puzzleSyllables = React.useMemo(() => {
    if (!solutionGrid) return [];
    const set = new Set<string>();
    solutionGrid.forEach(row => {
      row.forEach(cell => {
        if (cell && cell.trim()) set.add(cell.trim());
      });
    });
    return Array.from(set).sort();
  }, [solutionGrid]);

  const handlePhoneticChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value;
    setPhoneticInput(raw);
    const converted = transliterateToTelugu(raw);
    if (converted && converted !== raw) {
      onInsertSyllable(converted);
      setPhoneticInput('');
    }
  };

  const handlePhoneticKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && phoneticInput) {
      e.preventDefault();
      const converted = transliterateToTelugu(phoneticInput);
      onInsertSyllable(converted);
      setPhoneticInput('');
    }
  };

  return (
    <div className="bg-stone-100/90 border-2 border-stone-300 rounded-xl p-3 md:p-4 shadow-sm w-full select-none">
      {/* Top Bar: Full-width Phonetic Input & Action Buttons */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 mb-3">
        {/* Phonetic Input Box */}
        <div className="flex-1 flex items-center gap-2 bg-white px-3 py-2 rounded-lg border border-stone-300 shadow-2xs focus-within:ring-2 focus-within:ring-amber-500">
          <Keyboard size={18} className="text-amber-800 shrink-0" />
          <input
            type="text"
            value={phoneticInput}
            onChange={handlePhoneticChange}
            onKeyDown={handlePhoneticKeyDown}
            placeholder={t.phoneticPlaceholder}
            className="flex-1 bg-transparent text-xs md:text-sm font-sans focus:outline-none text-stone-900 placeholder-stone-400"
          />
          {phoneticInput && (
            <div className="flex items-center gap-1.5 shrink-0">
              <span className="bg-amber-100 text-amber-950 px-2 py-0.5 rounded font-bold font-telugu text-sm">
                {transliterateToTelugu(phoneticInput)}
              </span>
              <button
                type="button"
                onClick={() => setPhoneticInput('')}
                className="text-stone-400 hover:text-stone-700"
              >
                <X size={15} />
              </button>
            </div>
          )}
        </div>

        {/* Action Controls: Voice, Space & Backspace */}
        <div className="flex items-center gap-1.5 shrink-0 flex-wrap sm:flex-nowrap">
          {onVoiceInput && (
            <button
              type="button"
              onClick={onVoiceInput}
              className={`px-3 py-2 rounded-lg font-bold text-xs md:text-sm shadow-2xs transition active:scale-95 flex items-center gap-1.5 ${
                isListening
                  ? 'bg-red-600 text-white animate-pulse ring-2 ring-red-400'
                  : 'bg-white hover:bg-stone-50 border border-stone-300 text-stone-700'
              }`}
              title="వాయిస్ ద్వారా టైప్ చేయండి / Voice Typing"
            >
              <Mic size={15} className={isListening ? 'text-white' : 'text-red-600'} />
              <span>{isListening ? (language === 'te' ? 'వింటున్నా...' : 'Listening...') : (language === 'te' ? 'వాయిస్' : 'Voice')}</span>
            </button>
          )}

          <button
            type="button"
            onClick={() => onInsertSyllable('')}
            className="flex-1 sm:flex-none px-2.5 py-2 bg-white hover:bg-stone-50 border border-stone-300 rounded-lg text-xs md:text-sm font-medium text-stone-700 shadow-2xs transition active:scale-95"
            title="ఖాళీ (Empty Space)"
          >
            స్పేస్ (Space)
          </button>
          <button
            type="button"
            onClick={onBackspace}
            className="flex-1 sm:flex-none inline-flex items-center justify-center gap-1 px-3 py-2 bg-red-700 hover:bg-red-800 text-white rounded-lg text-xs md:text-sm font-bold shadow-2xs transition active:scale-95"
          >
            <Delete size={15} />
            <span>{t.backspace}</span>
          </button>
        </div>
      </div>

      {/* Category Tabs across the whole card */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 mb-2.5 border-b border-stone-200 text-xs font-semibold scrollbar-none">
        {puzzleSyllables.length > 0 && (
          <button
            type="button"
            onClick={() => setActiveCategory('puzzle')}
            className={`px-3 py-1.5 rounded-lg whitespace-nowrap transition-all flex items-center gap-1 ${
              activeCategory === 'puzzle'
                ? 'bg-amber-600 text-white shadow-xs font-bold'
                : 'bg-white text-stone-600 hover:bg-stone-200'
            }`}
          >
            <Sparkles size={13} />
            <span>{language === 'te' ? 'ఈ పజిల్ అక్షరాలు (Quick Access)' : 'Puzzle Letters (Quick Access)'}</span>
            <span className="ml-1 px-1.5 py-0.2 bg-black/20 rounded-full text-[10px]">
              {puzzleSyllables.length}
            </span>
          </button>
        )}

        <button
          type="button"
          onClick={() => setActiveCategory('common')}
          className={`px-3 py-1.5 rounded-lg whitespace-nowrap transition-all ${
            activeCategory === 'common'
              ? 'bg-amber-600 text-white shadow-xs font-bold'
              : 'bg-white text-stone-600 hover:bg-stone-200'
          }`}
        >
          {t.allLettersTab}
        </button>

        <button
          type="button"
          onClick={() => setActiveCategory('hallulu')}
          className={`px-3 py-1.5 rounded-lg whitespace-nowrap transition-all ${
            activeCategory === 'hallulu'
              ? 'bg-amber-600 text-white shadow-xs font-bold'
              : 'bg-white text-stone-600 hover:bg-stone-200'
          }`}
        >
          {t.consonantsTab}
        </button>

        <button
          type="button"
          onClick={() => setActiveCategory('achchulu')}
          className={`px-3 py-1.5 rounded-lg whitespace-nowrap transition-all ${
            activeCategory === 'achchulu'
              ? 'bg-amber-600 text-white shadow-xs font-bold'
              : 'bg-white text-stone-600 hover:bg-stone-200'
          }`}
        >
          {t.vowelsTab}
        </button>

        <button
          type="button"
          onClick={() => setActiveCategory('guninthalu')}
          className={`px-3 py-1.5 rounded-lg whitespace-nowrap transition-all ${
            activeCategory === 'guninthalu'
              ? 'bg-amber-600 text-white shadow-xs font-bold'
              : 'bg-white text-stone-600 hover:bg-stone-200'
          }`}
        >
          {t.matrasTab}
        </button>
      </div>

      {/* Spacious Full-Card Keyboard Grid */}
      <div className="bg-white border border-stone-200 rounded-lg p-2.5 min-h-[120px] max-h-[190px] overflow-y-auto shadow-inner">
        {/* Active: Puzzle Syllables (Immediate 1-click solving) */}
        {activeCategory === 'puzzle' && (
          <div className="flex flex-wrap gap-1.5 md:gap-2">
            {puzzleSyllables.map((syl) => (
              <button
                key={syl}
                type="button"
                onClick={() => onInsertSyllable(syl)}
                className="min-w-[42px] h-[40px] md:min-w-[48px] md:h-[44px] bg-amber-50 hover:bg-amber-200 border border-amber-300 text-amber-950 font-bold rounded-lg flex items-center justify-center text-base md:text-lg font-telugu transition active:scale-95 shadow-2xs hover:shadow-xs"
              >
                {syl}
              </button>
            ))}
          </div>
        )}

        {/* Active: Common Syllables */}
        {activeCategory === 'common' && (
          <div className="flex flex-wrap gap-1.5 md:gap-2">
            {COMMON_SYLLABLES.map((syl) => (
              <button
                key={syl}
                type="button"
                onClick={() => onInsertSyllable(syl)}
                className="min-w-[40px] h-[38px] md:min-w-[46px] md:h-[42px] bg-stone-50 hover:bg-stone-200 border border-stone-200 text-stone-900 font-bold rounded-lg flex items-center justify-center text-sm md:text-base font-telugu transition active:scale-95"
              >
                {syl}
              </button>
            ))}
          </div>
        )}

        {/* Active: Hallulu (Consonants) */}
        {activeCategory === 'hallulu' && (
          <div className="flex flex-wrap gap-1.5 md:gap-2">
            {TELUGU_HALLULU.map((syl) => (
              <button
                key={syl}
                type="button"
                onClick={() => onInsertSyllable(syl)}
                className="min-w-[42px] h-[40px] md:min-w-[48px] md:h-[44px] bg-stone-50 hover:bg-stone-200 border border-stone-200 text-stone-900 font-bold rounded-lg flex items-center justify-center text-base md:text-lg font-telugu transition active:scale-95 shadow-2xs"
              >
                {syl}
              </button>
            ))}
          </div>
        )}

        {/* Active: Achchulu (Vowels) */}
        {activeCategory === 'achchulu' && (
          <div className="flex flex-wrap gap-1.5 md:gap-2">
            {TELUGU_ACHCHULU.map((syl) => (
              <button
                key={syl}
                type="button"
                onClick={() => onInsertSyllable(syl)}
                className="min-w-[42px] h-[40px] md:min-w-[48px] md:h-[44px] bg-stone-50 hover:bg-stone-200 border border-stone-200 text-stone-900 font-bold rounded-lg flex items-center justify-center text-base md:text-lg font-telugu transition active:scale-95 shadow-2xs"
              >
                {syl}
              </button>
            ))}
          </div>
        )}

        {/* Active: Guninthalu & Signs */}
        {activeCategory === 'guninthalu' && (
          <div className="flex flex-wrap gap-1.5 md:gap-2">
            {TELUGU_GUNINTHALU.map((syl) => (
              <button
                key={syl}
                type="button"
                onClick={() => onInsertSyllable(syl)}
                className="min-w-[42px] h-[40px] md:min-w-[48px] md:h-[44px] bg-stone-50 hover:bg-stone-200 border border-stone-200 text-stone-900 font-bold rounded-lg flex items-center justify-center text-base md:text-lg font-telugu transition active:scale-95 shadow-2xs"
              >
                {syl}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
