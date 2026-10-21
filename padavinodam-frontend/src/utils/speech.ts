// Web Speech API for Telugu Voice Features (TTS & STT)

// Declare webkitSpeechRecognition type for TypeScript
declare global {
  interface Window {
    SpeechRecognition?: any;
    webkitSpeechRecognition?: any;
  }
}

/**
 * Standard Telugu Grapheme Cluster / Akshara RegEx
 * Accurately segments words into syllables without splitting conjunct consonants (వత్తులు) or matras (గుణింతాలు).
 */
const TELUGU_AKSHARA_REGEX = /(?:[\u0C05-\u0C14][\u0C01-\u0C03]?|[\u0C15-\u0C39\u0C58-\u0C5A](?:\u0C4D[\u0C15-\u0C39\u0C58-\u0C5A])*[\u0C3E-\u0C4C\u0C55\u0C56]?[\u0C01-\u0C03]?(?:\u0C4D)?)/g;

/**
 * Splits any spoken or typed Telugu text into authentic crossword syllables.
 * Example: 'భారతం' -> ['భా', 'ర', 'తం']
 *          'శ్రీకృష్ణుడు' -> ['శ్రీ', 'కృ', 'ష్ణు', 'డు']
 */
export const splitIntoTeluguSyllables = (text: string): string[] => {
  if (!text) return [];
  const matches = text.match(TELUGU_AKSHARA_REGEX);
  return matches ? matches.filter(m => m.trim().length > 0) : [];
};

// Cache for detected Telugu voice
let cachedTeluguVoice: SpeechSynthesisVoice | null = null;

const initVoices = () => {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;
  try {
    const voices = window.speechSynthesis.getVoices();
    if (voices.length > 0) {
      cachedTeluguVoice = voices.find(v => v.lang === 'te-IN' || v.lang.startsWith('te')) || null;
    }
  } catch {
    // Ignore error
  }
};

if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
  initVoices();
  window.speechSynthesis.onvoiceschanged = initVoices;
}

/**
 * Reads any Telugu clue aloud strictly if a native Telugu voice is available on device.
 * Prevents robotic, garbled English fallback that confuses players.
 */
export const speakTeluguText = (
  text: string, 
  onNotice?: (message: string) => void
): boolean => {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
    if (onNotice) onNotice('మీ బ్రౌజర్‌లో స్పీచ్ సింథసిస్ సదుపాయం లేదు.');
    return false;
  }

  try {
    window.speechSynthesis.cancel();

    // Strip emoji characters and special symbols for clean vocalization
    const cleanText = text
      .replace(/[\u{1F300}-\u{1F9FF}]/gu, '')
      .replace(/[\u{2600}-\u{26FF}]/gu, '')
      .replace(/[\u{2700}-\u{27BF}]/gu, '')
      .trim();

    if (!cleanText) return false;

    const voices = window.speechSynthesis.getVoices();
    const teluguVoice = cachedTeluguVoice || voices.find(v => v.lang === 'te-IN' || v.lang.startsWith('te'));

    // Critical: If Android does not have Telugu TTS voice installed, do NOT fallback to English!
    // English TTS reading Telugu Unicode sounds like broken gibberish ("T-E-L-U-G-U...").
    if (!teluguVoice) {
      if (onNotice) {
        onNotice('మొబైల్‌లో తెలుగు స్పీచ్ వాయిస్ అందుబాటులో లేదు (Settings -> Text-to-speech -> Telugu).');
      }
      return false;
    }

    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.voice = teluguVoice;
    utterance.lang = 'te-IN';
    utterance.rate = 0.88;
    utterance.pitch = 1.0;

    window.speechSynthesis.speak(utterance);
    return true;
  } catch (err) {
    console.warn('Speech synthesis error:', err);
    return false;
  }
};

/**
 * Stops any active speech.
 */
export const stopSpeaking = () => {
  if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
    window.speechSynthesis.cancel();
  }
};

/**
 * Initializes Telugu Speech-to-Text Dictation.
 */
export const startTeluguListening = (
  onResult: (spokenText: string) => void,
  onError: (errorMsg: string) => void,
  onEnd: () => void
): (() => void) | null => {
  if (typeof window === 'undefined') return null;

  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  if (!SpeechRecognition) {
    onError('మీ బ్రౌజర్‌లో వాయిస్ రికగ్నిషన్ అందుబాటులో లేదు (Chrome/Edge ఉపయోగించండి).');
    return null;
  }

  try {
    const recognition = new SpeechRecognition();
    recognition.lang = 'te-IN';
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    recognition.onresult = (event: any) => {
      if (event.results && event.results[0] && event.results[0][0]) {
        const transcript = event.results[0][0].transcript.trim();
        onResult(transcript);
      }
    };

    recognition.onerror = (event: any) => {
      console.warn('Voice recognition error:', event.error);
      if (event.error === 'no-speech') {
        onError('ఎటువంటి మాట రికార్డ్ కాలేదు. దయచేసి మళ్లీ మాట్లాడండి.');
      } else if (event.error === 'not-allowed') {
        onError('మైక్రోఫోన్ అనుమతి నిరాకరించబడింది (దయచేసి అనుమతించండి).');
      } else {
        onError('వాయిస్ నమోదులో లోపం ఏర్పడింది. మళ్లీ ప్రయత్నించండి.');
      }
    };

    recognition.onend = () => {
      onEnd();
    };

    recognition.start();

    // Return abort function
    return () => {
      try {
        recognition.abort();
      } catch {
        // ignore
      }
    };
  } catch (err) {
    console.warn('Could not start recognition:', err);
    onError('వాయిస్ రికార్డర్ ప్రారంభం కాలేదు.');
    return null;
  }
};
