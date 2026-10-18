/**
 * Telugu Phonetic Transliteration Engine
 * Converts Romanized phonetic typing (ITRANS / English) into Telugu Aksharas.
 * Example: 'ra' -> 'రా', 'ksha' -> 'క్ష', 'vi' -> 'వి', 'dam' -> 'దం'.
 */

const VOWEL_MAP: Record<string, string> = {
  'a': 'అ', 'aa': 'ఆ', 'A': 'ఆ',
  'i': 'ఇ', 'ee': 'ఈ', 'I': 'ఈ',
  'u': 'ఉ', 'oo': 'ఊ', 'U': 'ఊ',
  'e': 'ఎ', 'E': 'ఏ', 'ae': 'ఏ',
  'ai': 'ఐ', 'o': 'ఒ', 'O': 'ఓ',
  'au': 'ఔ', 'ou': 'ఔ', 'am': 'అం'
};

const CONSONANT_BASE: Record<string, string> = {
  'k': 'క', 'kh': 'ఖ', 'g': 'గ', 'gh': 'ఘ',
  'ch': 'చ', 'chh': 'ఛ', 'j': 'జ', 'jh': 'ఝ',
  't': 'ట', 'th': 'ఠ', 'd': 'డ', 'dh': 'ఢ', 'N': 'ణ',
  'thh': 'థ', 'dhh': 'ధ', 'n': 'న',
  'p': 'ప', 'ph': 'ఫ', 'f': 'ఫ', 'b': 'బ', 'bh': 'భ', 'm': 'మ',
  'y': 'య', 'r': 'ర', 'l': 'ల', 'v': 'వ', 'w': 'వ',
  'sh': 'శ', 'shh': 'ష', 's': 'స', 'h': 'హ', 'L': 'ళ', 'ksh': 'క్ష'
};

const MATRA_MAP: Record<string, string> = {
  '': '',
  'a': '',
  'aa': 'ా', 'A': 'ా',
  'i': 'ి',
  'ee': 'ీ', 'I': 'ీ',
  'u': 'ు',
  'oo': 'ూ', 'U': 'ూ',
  'e': 'ె',
  'E': 'ే', 'ae': 'ే',
  'ai': 'ై',
  'o': 'ొ',
  'O': 'ో',
  'au': 'ౌ', 'ou': 'ౌ',
  'am': 'ం', 'um': 'ుం', 'im': 'ిం', 'eem': 'ీం', 'om': 'ొం'
};

export function transliterateToTelugu(input: string): string {
  if (!input) return '';
  const clean = input.trim().toLowerCase();

  // Direct vowel match
  if (VOWEL_MAP[clean]) {
    return VOWEL_MAP[clean];
  }

  // Check consonant + vowel combo
  // Try longest consonant match first
  for (const cKey of ['ksh', 'chh', 'thh', 'dhh', 'shh', 'kh', 'gh', 'ch', 'jh', 'th', 'dh', 'ph', 'bh', 'sh', 'k', 'g', 'j', 't', 'd', 'n', 'p', 'f', 'b', 'm', 'y', 'r', 'l', 'v', 'w', 's', 'h']) {
    if (clean.startsWith(cKey)) {
      const base = CONSONANT_BASE[cKey];
      const remainder = clean.slice(cKey.length);
      const matra = MATRA_MAP[remainder] !== undefined ? MATRA_MAP[remainder] : (remainder === '' ? '' : remainder);
      return base + matra;
    }
  }

  return input;
}
