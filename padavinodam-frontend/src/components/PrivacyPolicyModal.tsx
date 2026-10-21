import React, { useState } from 'react';
import { X, ShieldCheck, ExternalLink, CheckCircle2 } from 'lucide-react';
import type { Language } from '../utils/translations';

interface PrivacyPolicyModalProps {
  isOpen: boolean;
  onClose: () => void;
  language: Language;
}

export const PrivacyPolicyModal: React.FC<PrivacyPolicyModalProps> = ({
  isOpen,
  onClose,
  language: initialLanguage,
}) => {
  const [activeTab, setActiveTab] = useState<'te' | 'en'>(initialLanguage === 'te' ? 'te' : 'en');

  if (!isOpen) return null;

  const livePolicyUrl = "https://padam.onrender.com/privacy.html";

  const handleOpenLiveWeb = () => {
    window.open(livePolicyUrl, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5 animate-in fade-in duration-150 select-none print:hidden">
      <div 
        className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] flex flex-col border-2 border-amber-300 overflow-hidden font-telugu text-stone-800"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="bg-gradient-to-r from-amber-800 via-amber-900 to-amber-950 text-white px-5 py-4 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-amber-500/20 border border-amber-400/30 rounded-xl">
              <ShieldCheck size={22} className="text-amber-300" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold leading-tight">
                {activeTab === 'te' ? 'గోప్యతా విధానం' : 'Privacy Policy'}
              </h2>
              <p className="text-xs text-amber-200">
                పదవినోదం (Padavinodam) • Zero Data Collection
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 hover:bg-white/20 rounded-full transition text-stone-300 hover:text-white cursor-pointer"
            aria-label="Close"
          >
            <X size={20} />
          </button>
        </div>

        {/* Tab & External Action Bar */}
        <div className="bg-amber-50/80 border-b border-amber-200/80 px-4 py-2.5 flex items-center justify-between gap-2 flex-wrap shrink-0">
          <div className="inline-flex rounded-lg bg-amber-200/60 p-0.5 border border-amber-300">
            <button
              type="button"
              onClick={() => setActiveTab('te')}
              className={`px-3 py-1 text-xs font-bold rounded-md transition cursor-pointer ${
                activeTab === 'te'
                  ? 'bg-white text-amber-950 shadow-xs'
                  : 'text-amber-900 hover:text-amber-950'
              }`}
            >
              తెలుగు (Telugu)
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('en')}
              className={`px-3 py-1 text-xs font-bold rounded-md transition cursor-pointer font-sans ${
                activeTab === 'en'
                  ? 'bg-white text-amber-950 shadow-xs'
                  : 'text-amber-900 hover:text-amber-950'
              }`}
            >
              English
            </button>
          </div>

          <button
            type="button"
            onClick={handleOpenLiveWeb}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-amber-900 hover:text-amber-950 bg-white hover:bg-amber-100/70 border border-amber-300 px-2.5 py-1 rounded-lg transition shadow-2xs cursor-pointer font-sans"
            title="Open online privacy policy"
          >
            <ExternalLink size={13} className="text-amber-700" />
            <span>{activeTab === 'te' ? 'వెబ్ లింక్ తెరవండి' : 'Open Web Link'}</span>
          </button>
        </div>

        {/* Scrollable Policy Body */}
        <div className="p-5 overflow-y-auto space-y-4 text-xs sm:text-sm leading-relaxed text-stone-700 select-text font-sans">
          {/* Highlights Card */}
          <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3.5 space-y-2">
            <div className="flex items-center gap-1.5 font-bold text-emerald-900 text-xs sm:text-sm font-telugu">
              <CheckCircle2 size={16} className="text-emerald-600 shrink-0" />
              <span>{activeTab === 'te' ? 'కీలక గోప్యతా హామీలు (Highlights)' : 'Key Privacy Commitments'}</span>
            </div>
            <ul className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 text-emerald-950 text-[11px] sm:text-xs">
              <li className="flex items-center gap-1.5">
                <span className="text-emerald-600 font-bold">✓</span>
                <span>{activeTab === 'te' ? 'వ్యక్తిగత వివరాలు సేకరించము' : 'Zero Personal Data Collected'}</span>
              </li>
              <li className="flex items-center gap-1.5">
                <span className="text-emerald-600 font-bold">✓</span>
                <span>{activeTab === 'te' ? 'ఖాతా లేదా లాగిన్ అవసరం లేదు' : 'No Account or Login Required'}</span>
              </li>
              <li className="flex items-center gap-1.5">
                <span className="text-emerald-600 font-bold">✓</span>
                <span>{activeTab === 'te' ? 'స్కోర్లు మొబైల్‌లోనే నిల్వ' : '100% On-Device Progress Storage'}</span>
              </li>
              <li className="flex items-center gap-1.5">
                <span className="text-emerald-600 font-bold">✓</span>
                <span>{activeTab === 'te' ? 'వాయిస్ రికార్డింగ్ జరగదు' : 'Zero Voice Recording Stored'}</span>
              </li>
              <li className="flex items-center gap-1.5">
                <span className="text-emerald-600 font-bold">✓</span>
                <span>{activeTab === 'te' ? 'సురక్షిత NPCI UPI పేమెంట్స్' : 'Secure NPCI UPI In-App Payments'}</span>
              </li>
              <li className="flex items-center gap-1.5">
                <span className="text-emerald-600 font-bold">✓</span>
                <span>{activeTab === 'te' ? 'పిల్లల భద్రత (COPPA Friendly)' : 'Child-Safe (COPPA Compliant)'}</span>
              </li>
            </ul>
          </div>

          {activeTab === 'te' ? (
            <div className="space-y-4 font-telugu text-[13px] leading-relaxed text-stone-800">
              <section>
                <h3 className="font-bold text-amber-950 text-sm mb-1">1. పరిచయం & డెవలపర్ వివరాలు</h3>
                <p>
                  <strong>పదవినోదం (Padavinodam)</strong> తెలుగు సాంస్కృతిక పద ప్రహేళిక (Crossword). ఈ యాప్ <strong>ఆర్య భూపతి (Arya Bhupathi)</strong> ద్వారా రూపొందించబడింది. ఆటగాళ్ల గోప్యతను కాపాడడం మా మొదటి ప్రాధాన్యత.
                </p>
              </section>

              <section>
                <h3 className="font-bold text-amber-950 text-sm mb-1">2. జీరో వ్యక్తిగత డేటా సేకరణ (Zero PII)</h3>
                <p>
                  మేము మీ నుంచి ఎలాంటి వ్యక్తిగత సమాచారాన్ని సేకరించము. మీ పేరు, ఈమెయిల్, ఫోన్ నంబర్, సంప్రదింపుల జాబితా (Contacts), లేదా ఫోటోలు/ఫైళ్లను యాప్ ఎన్నడూ కోరదు మరియు భద్రపరచదు. ఈ గేమ్‌ను ఆడటానికి ఎలాంటి ఖాతా (Account) లేదా రిజిస్ట్రేషన్ అవసరం లేదు.
                </p>
              </section>

              <section>
                <h3 className="font-bold text-amber-950 text-sm mb-1">3. స్థానిక నిల్వ (Device Local Storage)</h3>
                <p>
                  మీరు సాధించిన పజిల్ పురోగతి, టైమర్ రికార్డులు, స్కోర్లు, మరియు నాణాలు పూర్తిగా మీ మొబైల్ ఫోన్ స్థానిక మెమరీ (Local Storage) లోనే భద్రంగా ఉంటాయి. ఈ సమాచారం మా సర్వర్లకు చేరదు. యాప్ అన్‌ఇన్‌స్టాల్ చేస్తే ఈ డేటా తొలగించబడుతుంది.
                </p>
              </section>

              <section>
                <h3 className="font-bold text-amber-950 text-sm mb-1">4. మైక్రోఫోన్ మరియు తెలుగు వాయిస్ టైపింగ్</h3>
                <p>
                  అక్షరాలను సులభంగా పలకడం ద్వారా నమోదు చేయడానికి యాప్‌లో వాయిస్ టైపింగ్ సదుపాయం కలదు. ఇది ఆండ్రాయిడ్ సిస్టమ్ ఆన్-డివైస్ స్పీచ్ రికగ్నైజర్ ద్వారా మాత్రమే ప్రాసెస్ చేయబడుతుంది. మీ స్వరం రికార్డ్ కావడం గానీ, సర్వర్లలో భద్రపరచడం గానీ ఎప్పటికీ జరగదు.
                </p>
              </section>

              <section>
                <h3 className="font-bold text-amber-950 text-sm mb-1">5. సురక్షిత చెల్లింపులు (In-App UPI Purchases)</h3>
                <p>
                  నాణేలు లేదా కిడ్స్ మోడ్ అన్‌లాక్ కొనుగోళ్లు పూర్తిగా అధికారిక UPI యాప్‌ల (Google Pay, PhonePe, Paytm మొదలైనవి) ద్వారా మాత్రమే నిర్వహించబడతాయి. పదవినోదం మీ బ్యాంక్ వివరాలు, కార్డు నంబర్లు, లేదా పిన్ (PIN) లను ఎన్నడూ చూడదు మరియు నిల్వ చేయదు.
                </p>
              </section>

              <section>
                <h3 className="font-bold text-amber-950 text-sm mb-1">6. పిల్లల భద్రత & ప్రకటనల నిరాకరణ</h3>
                <p>
                  మా 5x5 కిడ్స్ విభాగం పిల్లలకు పూర్తి సురక్షితమైనది (COPPA Friendly). ఈ గేమ్‌లో మూడవ పక్ష ప్రకటనల నెట్‌వర్క్‌లు (AdMob, etc.) లేదా డేటా ట్రాకర్లు లేవు.
                </p>
              </section>

              <section className="bg-stone-50 border border-stone-200 rounded-xl p-3">
                <h3 className="font-bold text-amber-950 text-xs mb-1">సంప్రదింపులు (Contact Information)</h3>
                <p className="text-xs text-stone-600">డెవలపర్: Arya Bhupathi (Padavinodam Team)</p>
                <p className="text-xs text-stone-600">ఈమెయిల్: aryabhupathi@gmail.com</p>
                <p className="text-xs text-stone-600">అధికారిక వెబ్‌సైట్: https://padam.onrender.com</p>
              </section>
            </div>
          ) : (
            <div className="space-y-4 font-sans text-xs sm:text-[13px] leading-relaxed text-stone-800">
              <section>
                <h3 className="font-bold text-amber-950 text-sm mb-1">1. Developer Identity & Commitment</h3>
                <p>
                  <strong>Padavinodam (పదవినోదం)</strong> is an authentic Telugu crossword puzzle developed and published by <strong>Arya Bhupathi</strong>. We are committed to a strict zero-data-collection standard and complete user transparency.
                </p>
              </section>

              <section>
                <h3 className="font-bold text-amber-950 text-sm mb-1">2. Zero Personal Identifiable Information (PII)</h3>
                <p>
                  We do <strong>NOT</strong> collect, store, share, or sell any personal data. No user accounts, passwords, email addresses, or phone numbers are required. The app never requests access to your contacts, photos, or GPS location.
                </p>
              </section>

              <section>
                <h3 className="font-bold text-amber-950 text-sm mb-1">3. Local Device Storage</h3>
                <p>
                  All gameplay progress, solved puzzles, coins, and streak statistics are stored strictly on your device using standard HTML5 <code>localStorage</code>. This data never leaves your device.
                </p>
              </section>

              <section>
                <h3 className="font-bold text-amber-950 text-sm mb-1">4. Microphone & Voice Input</h3>
                <p>
                  Optional voice typing is processed locally on your device via Android's SpeechRecognizer API. Zero audio streams are recorded, uploaded, or transmitted to any remote servers.
                </p>
              </section>

              <section>
                <h3 className="font-bold text-amber-950 text-sm mb-1">5. Safe UPI In-App Payments</h3>
                <p>
                  All optional digital purchases (e.g. clue coin top-ups or kids mode unlock) are executed via NPCI-approved UPI deep-links directly on your installed UPI apps. Padavinodam never asks for, views, or stores your bank credentials or card details.
                </p>
              </section>

              <section>
                <h3 className="font-bold text-amber-950 text-sm mb-1">6. COPPA Compliance & Zero Ads</h3>
                <p>
                  Padavinodam is family-safe and compliant with COPPA. Our 5x5 Kids Mode contains clean, educational Telugu vocabulary. The application contains zero third-party advertising SDKs or tracking cookies.
                </p>
              </section>

              <section className="bg-stone-50 border border-stone-200 rounded-xl p-3">
                <h3 className="font-bold text-amber-950 text-xs mb-1 font-mono uppercase">Developer Contact & Support</h3>
                <p className="text-xs text-stone-600">Developer: Arya Bhupathi (Padavinodam Team)</p>
                <p className="text-xs text-stone-600">Email: aryabhupathi@gmail.com</p>
                <p className="text-xs text-stone-600">Website: https://padam.onrender.com</p>
              </section>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="bg-stone-100 border-t border-stone-200 px-5 py-3 flex items-center justify-between shrink-0">
          <span className="text-[11px] text-stone-500 font-sans">
            Effective: Oct 2026 • v1.0.0
          </span>
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 bg-amber-800 hover:bg-amber-900 text-white rounded-xl font-bold text-xs shadow-xs transition active:scale-95 cursor-pointer font-telugu"
          >
            {activeTab === 'te' ? 'మూసివేయి (Close)' : 'Close'}
          </button>
        </div>
      </div>
    </div>
  );
};
