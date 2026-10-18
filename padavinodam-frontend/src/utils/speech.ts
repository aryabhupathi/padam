// Web Speech API for Telugu Voice Features (TTS & STT)

// Declare webkitSpeechRecognition type for TypeScript
declare global {
  interface Window {
    SpeechRecognition?: any;
    webkitSpeechRecognition?: any;
  }
}

/**
 * Reads any Telugu clue aloud with native Indian Telugu speech synthesis.
 */
export const speakTeluguText = (text: string) => {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
    return;
  }

  try {
    window.speechSynthesis.cancel();

    // Strip emoji characters and special symbols for clean vocalization
    const cleanText = text
      .replace(/[\u{1F300}-\u{1F9FF}]/gu, '')
      .replace(/[\u{2600}-\u{26FF}]/gu, '')
      .replace(/[\u{2700}-\u{27BF}]/gu, '')
      .trim();

    if (!cleanText) return;

    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.lang = 'te-IN';
    utterance.rate = 0.88;
    utterance.pitch = 1.0;

    // Pick Telugu voice if installed in browser
    const voices = window.speechSynthesis.getVoices();
    const teluguVoice = voices.find(v => v.lang === 'te-IN' || v.lang.startsWith('te'));
    if (teluguVoice) {
      utterance.voice = teluguVoice;
    }

    window.speechSynthesis.speak(utterance);
  } catch (err) {
    console.warn('Speech synthesis error:', err);
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
      onError(event.error === 'no-speech' ? 'ఎటువంటి మాట రికార్డ్ కాలేదు. మళ్లీ మాట్లాడండి.' : 'వాయిస్ లోపం ఏర్పడింది.');
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
    onError('మైక్రోఫోన్ అనుమతి అవసరం.');
    return null;
  }
};
