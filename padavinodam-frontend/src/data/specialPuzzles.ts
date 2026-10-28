import type { PuzzleData } from '../types/puzzle';

export const SPECIAL_CINEMA_PUZZLE: PuzzleData = {
  puzzle_id: 'padam_special_cinema_tollywood',
  size: 7,
  mask: [
    [true, true, true, false, true, true, true],
    [true, false, true, false, true, false, true],
    [true, true, true, true, true, true, true],
    [false, false, true, false, true, false, false],
    [true, true, true, true, true, true, true],
    [true, false, true, false, true, false, true],
    [true, true, true, false, true, true, true]
  ],
  numbers: {
    '0,0': 1,
    '0,4': 2,
    '1,2': 3,
    '1,6': 4,
    '2,0': 5,
    '4,0': 6,
    '5,2': 7,
    '5,6': 8,
    '6,0': 9,
    '6,4': 10
  },
  solution: [
    ['బా', 'హు', 'బ', null, 'రా', 'జం', 'కి'],
    ['లు', null, 'సా', null, 'జా', null, 'ల'],
    ['క', 'వి', 'వి', 'శ్వ', 'మౌ', 'ళీ', 'క'],
    [null, null, 'త్రి', null, 'ళి', null, null],
    ['శ్రీ', 'రా', 'రా', 'జు', 'దే', 'వు', 'డు'],
    ['రా', null, 'ము', null, 'శ్రీ', null, 'సి'],
    ['ము', 'డు', 'డు', null, 'సి', 'ని', 'మా']
  ],
  clues: {
    across: [
      {
        id: 'cinema_a1',
        number: 1,
        row: 0,
        col: 0,
        length: 3,
        word: 'బాహుబ',
        category: 'సినిమా',
        clue: 'రాజమౌళి సృష్టించిన అంతర్జాతీయ రికార్డు చిత్రం మొదటి పదం'
      },
      {
        id: 'cinema_a2',
        number: 2,
        row: 0,
        col: 4,
        length: 3,
        word: 'రాజంకి',
        category: 'సినిమా',
        clue: 'రాజసంతో కూడిన వినోదం'
      },
      {
        id: 'cinema_a5',
        number: 5,
        row: 2,
        col: 0,
        length: 7,
        word: 'కవివిశ్వమౌళీక',
        category: 'సినిమా',
        clue: 'కళాతపస్వి కె.విశ్వనాథ్ మరియు రాజమౌళి సినీ కళావైభవం'
      },
      {
        id: 'cinema_a6',
        number: 6,
        row: 4,
        col: 0,
        length: 7,
        word: 'శ్రీరారాజుదేవుడు',
        category: 'సినిమా',
        clue: 'తెలుగు తెరపై దైవ స్వరూపంగా వెలిగిన ఎన్టీఆర్ పాత్రల కీర్తి'
      },
      {
        id: 'cinema_a9',
        number: 9,
        row: 6,
        col: 0,
        length: 3,
        word: 'ముడుడు',
        category: 'సినిమా',
        clue: 'ముగింపు సన్నివేశం'
      },
      {
        id: 'cinema_a10',
        number: 10,
        row: 6,
        col: 4,
        length: 3,
        word: 'సినిమా',
        category: 'సినిమా',
        clue: 'తెలుగువారికి అత్యంత ప్రియమైన దృశ్య మాధ్యమం'
      }
    ],
    down: [
      {
        id: 'cinema_d1',
        number: 1,
        row: 0,
        col: 0,
        length: 3,
        word: 'బాలు',
        category: 'సినిమా',
        clue: 'గాన గంధర్వుడు ఎస్పీ బాలసుబ్రహ్మణ్యం ముద్దుపేరు'
      },
      {
        id: 'cinema_d3',
        number: 3,
        row: 1,
        col: 2,
        length: 6,
        word: 'సావిత్రిరాముడు',
        category: 'సినిమా',
        clue: 'మహానటి సావిత్రి మరియు ఎన్టీఆర్ అడవిరాముడు స్మరణ'
      },
      {
        id: 'cinema_d2',
        number: 2,
        row: 0,
        col: 4,
        length: 7,
        word: 'రాజమౌళిశ్రీసి',
        category: 'సినిమా',
        clue: 'ఆస్కార్ విజేత ఎస్.ఎస్. రాజమౌళి దర్శకత్వ వైభవం'
      },
      {
        id: 'cinema_d4',
        number: 4,
        row: 1,
        col: 6,
        length: 6,
        word: 'కలకలసినిమా',
        category: 'సినిమా',
        clue: 'చిత్ర పరిశ్రమలో వెండితెర వెలుగులు'
      }
    ]
  },
  meta: {
    difficulty: 'medium',
    total_words: 10,
    generated_at: Date.now()
  }
};

export const SPECIAL_PROVERBS_PUZZLE: PuzzleData = {
  puzzle_id: 'padam_special_proverbs_saametalu',
  size: 7,
  mask: [
    [true, true, true, false, true, true, true],
    [true, false, true, false, true, false, true],
    [true, true, true, true, true, true, true],
    [false, false, true, false, true, false, false],
    [true, true, true, true, true, true, true],
    [true, false, true, false, true, false, true],
    [true, true, true, false, true, true, true]
  ],
  numbers: {
    '0,0': 1,
    '0,4': 2,
    '1,2': 3,
    '1,6': 4,
    '2,0': 5,
    '4,0': 6,
    '5,2': 7,
    '5,6': 8,
    '6,0': 9,
    '6,4': 10
  },
  solution: [
    ['ఇ', 'ల్లా', 'లు', null, 'మే', 'సి', 'న'],
    ['ల్లు', null, 'వె', null, 'కం', null, 'పె'],
    ['దీ', 'పం', 'న్నె', 'ల', 'చే', 'ను', 'ళ్ళి'],
    [null, null, 'ల', null, 'ను', null, null],
    ['నో', 'రు', 'మ', 'ం', 'చి', 'దై', 'తే'],
    ['రు', null, 'తి', null, 'ఊ', null, 'కు'],
    ['ఊ', 'రు', 'మ', null, 'రు', 'మ', 'లు']
  ],
  clues: {
    across: [
      {
        id: 'proverb_a1',
        number: 1,
        row: 0,
        col: 0,
        length: 3,
        word: 'ఇల్లాలు',
        category: 'సామెతలు',
        clue: 'ఇంటికి వెలుగు నింపే ఇల్లాలి గుణం'
      },
      {
        id: 'proverb_a2',
        number: 2,
        row: 0,
        col: 4,
        length: 3,
        word: 'మేసిన',
        category: 'సామెతలు',
        clue: 'సామెత: కంచె చేను ... నట్లు'
      },
      {
        id: 'proverb_a5',
        number: 5,
        row: 2,
        col: 0,
        length: 7,
        word: 'దీపంవెన్నెలచేను',
        category: 'సామెతలు',
        clue: 'సామెతలు: దీపం ఉండగానే దిద్దుకోవాలి & అడవి కాసిన వెన్నెల'
      },
      {
        id: 'proverb_a6',
        number: 6,
        row: 4,
        col: 0,
        length: 7,
        word: 'నోరుమంచిదైతే',
        category: 'సామెతలు',
        clue: 'సామెత: నోరు మంచిదైతే ఊరు మంచిదవుతుంది'
      },
      {
        id: 'proverb_a9',
        number: 9,
        row: 6,
        col: 0,
        length: 3,
        word: 'ఊరుమ',
        category: 'సామెతలు',
        clue: 'జాతీయాల్లో గ్రామ సమక్షం'
      },
      {
        id: 'proverb_a10',
        number: 10,
        row: 6,
        col: 4,
        length: 3,
        word: 'రుమలు',
        category: 'సామెతలు',
        clue: 'చేతులు కాలాక ఆకులు పట్టుకున్న తీరు'
      }
    ],
    down: [
      {
        id: 'proverb_d1',
        number: 1,
        row: 0,
        col: 0,
        length: 3,
        word: 'ఇల్లు',
        category: 'సామెతలు',
        clue: 'సామెత: దీపం ఉండగానే ... దిద్దుకోవాలి'
      },
      {
        id: 'proverb_d3',
        number: 3,
        row: 1,
        col: 2,
        length: 6,
        word: 'వెన్నెలమతి',
        category: 'సామెతలు',
        clue: 'సామెత: అడవి కాసిన వెన్నెల వృథా కాకూడదు'
      },
      {
        id: 'proverb_d2',
        number: 2,
        row: 0,
        col: 4,
        length: 7,
        word: 'మేకంచేనుఊరు',
        category: 'సామెతలు',
        clue: 'సామెత: కంచె చేను మేయడం & ఊరి మంచి'
      },
      {
        id: 'proverb_d4',
        number: 4,
        row: 1,
        col: 6,
        length: 6,
        word: 'పెళ్ళిఆకులు',
        category: 'సామెతలు',
        clue: 'సామెతలు: తాళి లేని పెళ్ళి & చేతులు కాలాక ఆకులు'
      }
    ]
  },
  meta: {
    difficulty: 'medium',
    total_words: 10,
    generated_at: Date.now()
  }
};
