export interface TeluguRiddle {
  id: number;
  questionTe: string;
  questionEn: string;
  answerTe: string;
  answerEn: string;
  category: string;
}

export const TELUGU_RIDDLES: TeluguRiddle[] = [
  {
    id: 1,
    questionTe: "అడవిలో పుట్టింది, వంటింటికి వచ్చి గంతులు వేస్తుంది... ఏమిటది?",
    questionEn: "Born in the woods, dances in the kitchen... What is it?",
    answerTe: "కవ్వం",
    answerEn: "Churning Stick (Kavvam)",
    category: "సాంప్రదాయం"
  },
  {
    id: 2,
    questionTe: "మూడు కన్నులుంటాయి శివుడు కాదు, నీళ్ళుంటాయి బావి కాదు... ఏమిటది?",
    questionEn: "Has three eyes but not Shiva, has water inside but not a well... What is it?",
    answerTe: "కొబ్బరికాయ",
    answerEn: "Coconut (Kobbari)",
    category: "ప్రకృతి"
  },
  {
    id: 3,
    questionTe: "తెల్లని పొలంలో నల్లని విత్తనాలు, చేత్తో చల్లుతారు నోటితో ఏరుతారు... ఏమిటది?",
    questionEn: "Black seeds on a white field, sown by hand, picked by mouth... What is it?",
    answerTe: "పుస్తకం & అక్షరాలు",
    answerEn: "Book & Letters (Pusthakam)",
    category: "జ్ఞానం"
  },
  {
    id: 4,
    questionTe: "తోక లేని పిట్ట తొంబై ఆమడలు పోతుంది... ఏమిటది?",
    questionEn: "A tailless bird that travels ninety leagues... What is it?",
    answerTe: "ఉత్తరం (జాబు)",
    answerEn: "Letter / Postcard (Uttaram)",
    category: "జీవనం"
  },
  {
    id: 5,
    questionTe: "నడిచేటప్పుడు నిలబడుతుంది, నిలబడేటప్పుడు పడుకుంటుంది... ఏమిటది?",
    questionEn: "Stands when you walk, lies flat when you stand... What is it?",
    answerTe: "కాలి చెప్పులు",
    answerEn: "Footwear / Slippers (Cheppulu)",
    category: "నిత్యజీవితం"
  },
  {
    id: 6,
    questionTe: "పచ్చని గూట్లో ఎర్రని ముత్యాల రాసులు... ఏమిటది?",
    questionEn: "Heaps of red pearls inside a tight green nest... What is it?",
    answerTe: "దానిమ్మ పండు",
    answerEn: "Pomegranate (Danimma)",
    category: "ప్రకృతి"
  },
  {
    id: 7,
    questionTe: "ముళ్ళ కంచె నడుమ ముద్దుగుమ్మ... ఏమిటది?",
    questionEn: "A charming beauty surrounded by thorny fencing... What is it?",
    answerTe: "గులాబీ పువ్వు",
    answerEn: "Rose Flower (Gulabi)",
    category: "ప్రకృతి"
  },
  {
    id: 8,
    questionTe: "కొమ్మలుంటాయి కానీ చెట్టు కాదు, రెక్కలుంటాయి కానీ పక్షి కాదు... ఏమిటది?",
    questionEn: "Has frame and wings but not a bird, flies high in the sky... What is it?",
    answerTe: "గాలిపటం",
    answerEn: "Kite (Gaalipatam)",
    category: "వినోదం"
  }
];

export function getRandomRiddle(): TeluguRiddle {
  const randomIndex = Math.floor(Math.random() * TELUGU_RIDDLES.length);
  return TELUGU_RIDDLES[randomIndex];
}
