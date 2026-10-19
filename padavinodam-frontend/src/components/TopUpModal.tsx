import React, { useState } from 'react';
import { X, Zap, ShieldCheck, CheckCircle2, Sparkles, Baby, Edit2, ExternalLink, Check, Copy, AlertCircle } from 'lucide-react';
import type { Language } from '../utils/translations';
import { getSavedUpiId, saveUpiId, buildUpiPaymentUrl, buildUpiQrUrl } from '../config/paymentConfig';
import { verifyPaymentUtr, type UtrVerifyResult } from '../services/api';
import { templeAudio } from '../utils/templeAudio';

interface TopUpModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentPoints: number;
  currentCoins?: number;
  isKidsUnlocked: boolean;
  language: Language;
  onAddPoints: (points: number, coins: number) => void;
  onUnlockKids: () => void;
  initialMode?: 'points' | 'kids';
}

export const TopUpModal: React.FC<TopUpModalProps> = ({
  isOpen,
  onClose,
  currentPoints,
  currentCoins = 0,
  isKidsUnlocked,
  language,
  onAddPoints,
  onUnlockKids,
  initialMode = 'points'
}) => {
  const [selectedPack, setSelectedPack] = useState<'p150' | 'p500' | 'kids'>(
    initialMode === 'kids' && !isKidsUnlocked ? 'kids' : 'p500'
  );
  const [utrInput, setUtrInput] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successResult, setSuccessResult] = useState<UtrVerifyResult | null>(null);

  // Dynamic UPI configuration
  const [upiId, setUpiId] = useState<string>(() => getSavedUpiId());
  const [isEditingUpi, setIsEditingUpi] = useState(false);
  const [tempUpiInput, setTempUpiInput] = useState(upiId);
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const packAmount = selectedPack === 'p150' ? 19 : 49;
  const packTitle = selectedPack === 'kids' ? 'Kids Mode Lifetime' : (selectedPack === 'p500' ? '500 Points & Coins' : '150 Points & Coins');
  const upiUrl = buildUpiPaymentUrl(packAmount, packTitle, upiId);
  const qrUrl = buildUpiQrUrl(upiUrl);

  const handleSaveUpi = () => {
    if (tempUpiInput.trim()) {
      saveUpiId(tempUpiInput.trim());
      setUpiId(tempUpiInput.trim());
      setIsEditingUpi(false);
    }
  };

  const handleCopyUpi = () => {
    navigator.clipboard.writeText(upiId);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleVerifyAndUnlock = async () => {
    const cleanUtr = utrInput.trim();
    setErrorMsg(null);

    if (!cleanUtr) {
      setErrorMsg(language === 'te' 
        ? 'దయచేసి మీ Google Pay / PhonePe పేమెంట్ రసీదులోని 12 అంకెల UTR నంబర్‌ను నమోదు చేయండి.' 
        : 'Please enter the 12-digit UPI Reference / UTR Number from your payment receipt.');
      return;
    }

    if (cleanUtr.length !== 12 || !/^\d{12}$/.test(cleanUtr)) {
      setErrorMsg(language === 'te' 
        ? 'UTR నంబర్ ఖచ్చితంగా 12 అంకెలు ఉండాలి (ఉదా: 429810394821).' 
        : 'UTR Number must be exactly 12 numeric digits (e.g., 429810394821).');
      return;
    }

    setIsProcessing(true);
    try {
      const res = await verifyPaymentUtr(cleanUtr, packAmount, selectedPack, upiId);
      setIsProcessing(false);
      setSuccessResult(res);
      templeAudio.playSuccessFanfare();

      // Apply unlock rewards directly
      if (selectedPack === 'kids') {
        onUnlockKids();
      } else if (selectedPack === 'p500') {
        onAddPoints(500, 500);
      } else if (selectedPack === 'p150') {
        onAddPoints(150, 150);
      }

      setTimeout(() => {
        setSuccessResult(null);
        setUtrInput('');
        onClose();
      }, 2500);
    } catch (err: any) {
      setIsProcessing(false);
      setErrorMsg(err.message || (language === 'te' ? 'చెల్లింపు ధృవీకరణ విఫలమైంది.' : 'Payment verification failed.'));
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-200 print:hidden overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full border border-stone-200 overflow-hidden relative my-auto">
        {/* Header */}
        <div className="bg-gradient-to-r from-amber-600 via-orange-600 to-rose-600 text-white p-4 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-white/20 rounded-xl backdrop-blur-xs">
              <Zap size={22} className="text-yellow-300 fill-yellow-300" />
            </div>
            <div>
              <h3 className="text-lg font-bold font-telugu">
                {language === 'te' ? 'పాయింట్లు & విభాగాల టాప్-అప్' : 'Points & Modes Top-Up'}
              </h3>
              <p className="text-xs text-white/90">
                {language === 'te' ? 'UPI ద్వారా నేరుగా సురక్షిత చెల్లింపు' : 'Direct zero-fee UPI payment'}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 hover:bg-white/20 rounded-full transition text-white/90 hover:text-white"
          >
            <X size={20} />
          </button>
        </div>

        {/* Current Balance */}
        <div className="px-4 py-3 bg-amber-50/70 border-b border-amber-200/60 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div>
              <span className="text-[10px] text-stone-600 block">
                {language === 'te' ? 'శక్తి నిల్వ:' : 'Energy:'}
              </span>
              <div className="flex items-center gap-1 font-bold text-sm text-amber-950 font-mono">
                <Zap size={14} className="text-amber-500 fill-amber-500" />
                <span>{currentPoints}</span>
                {currentPoints <= 100 ? (
                  <span className="text-stone-400 text-[10px] font-normal">/ 100</span>
                ) : (
                  <span className="text-amber-700 text-[10px] font-bold">⚡BOOST</span>
                )}
              </div>
            </div>
            <div className="border-l border-amber-200/80 pl-3">
              <span className="text-[10px] text-stone-600 block">
                {language === 'te' ? 'క్లూ నాణాలు:' : 'Clue Coins:'}
              </span>
              <div className="flex items-center gap-1 font-bold text-sm text-amber-950 font-mono">
                <span className="text-amber-600">🪙</span>
                <span>{currentCoins}</span>
              </div>
            </div>
          </div>
          <div className="text-right bg-white px-2.5 py-1 rounded-lg border border-amber-200 shadow-2xs">
            <span className="text-[11px] text-amber-800 font-medium block">
              ⏰ {language === 'te' ? 'ఉచిత రీఛార్జ్' : 'Free Auto-Regen'}
            </span>
            <span className="text-[10px] text-stone-500">
              {language === 'te' ? 'ప్రతి 2 గంటలకు 1 పాయింట్' : '1 point every 2 hours'}
            </span>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-4 space-y-3.5">
          {successResult ? (
            <div className="p-6 bg-emerald-50 border border-emerald-300 rounded-xl text-center text-emerald-800 flex flex-col items-center gap-2 animate-in zoom-in-95">
              <CheckCircle2 size={44} className="text-emerald-600 animate-bounce" />
              <h4 className="text-base font-bold font-telugu">{successResult.message}</h4>
              <div className="text-xs text-stone-600 bg-white px-3 py-2 rounded-lg border border-emerald-200 w-full mt-2 font-mono">
                <div>రసీదు ID: <span className="font-bold text-emerald-700">{successResult.receipt_id}</span></div>
                <div>UTR: <span className="font-bold">{successResult.utr}</span></div>
                <div>మొత్తం: <span className="font-bold">₹{successResult.amount}</span></div>
              </div>
            </div>
          ) : (
            <>
              {/* Package Selector */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-stone-700 block">
                  {language === 'te' ? 'ప్యాకేజీని ఎంచుకోండి:' : 'Select Package:'}
                </label>

                {/* Kids Mode Option */}
                {!isKidsUnlocked && (
                  <button
                    type="button"
                    onClick={() => { setSelectedPack('kids'); setErrorMsg(null); }}
                    className={`w-full p-2.5 rounded-xl border text-left flex items-center justify-between transition-all cursor-pointer ${
                      selectedPack === 'kids'
                        ? 'border-purple-500 bg-purple-50/80 ring-2 ring-purple-300 shadow-xs'
                        : 'border-stone-200 bg-white hover:border-purple-300'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="p-2 bg-purple-100 text-purple-700 rounded-lg">
                        <Baby size={20} />
                      </div>
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span className="font-bold text-sm text-stone-900 font-telugu">
                            {language === 'te' ? 'బాలల విభాగం (5x5)' : 'Kids Mode (5x5)'}
                          </span>
                          <span className="bg-purple-600 text-white text-[9px] font-bold px-1.5 py-0.2 rounded-full">
                            లైఫ్‌టైమ్
                          </span>
                        </div>
                        <p className="text-[11px] text-stone-500">
                          {language === 'te' ? 'పిల్లల కోసం ప్రత్యేక 5x5 పజిల్స్ శాశ్వతంగా అన్‌లాక్' : 'Special 5x5 puzzles for kids permanently unlocked'}
                        </p>
                      </div>
                    </div>
                    <span className="font-bold text-purple-700 text-base font-mono">₹49</span>
                  </button>
                )}

                {/* 500 Points & Coins Pack */}
                <button
                  type="button"
                  onClick={() => { setSelectedPack('p500'); setErrorMsg(null); }}
                  className={`w-full p-2.5 rounded-xl border text-left flex items-center justify-between transition-all cursor-pointer ${
                    selectedPack === 'p500'
                      ? 'border-amber-500 bg-amber-50/80 ring-2 ring-amber-300 shadow-xs'
                      : 'border-stone-200 bg-white hover:border-amber-300'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <div className="p-2 bg-amber-100 text-amber-700 rounded-lg">
                      <Sparkles size={20} />
                    </div>
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="font-bold text-sm text-stone-900 font-telugu">
                          {language === 'te' ? '500 నాణాలు + 500 శక్తి పాయింట్లు' : '500 Coins + 500 Energy'}
                        </span>
                        <span className="bg-rose-500 text-white text-[9px] font-bold px-1.5 py-0.2 rounded-full">
                          సూపర్ ప్యాక్
                        </span>
                      </div>
                      <p className="text-[11px] text-stone-500">
                        {language === 'te' ? 'అదనపు క్లూలు, అక్షర వెల్లడి & పజిల్ మార్పిడులు' : 'Extra clues, reveals & puzzle skips'}
                      </p>
                    </div>
                  </div>
                  <span className="font-bold text-amber-700 text-base font-mono">₹49</span>
                </button>

                {/* 150 Points & Coins Pack */}
                <button
                  type="button"
                  onClick={() => { setSelectedPack('p150'); setErrorMsg(null); }}
                  className={`w-full p-2.5 rounded-xl border text-left flex items-center justify-between transition-all cursor-pointer ${
                    selectedPack === 'p150'
                      ? 'border-amber-500 bg-amber-50/80 ring-2 ring-amber-300 shadow-xs'
                      : 'border-stone-200 bg-white hover:border-amber-300'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <div className="p-2 bg-stone-100 text-stone-700 rounded-lg">
                      <Zap size={20} />
                    </div>
                    <div>
                      <span className="font-bold text-sm text-stone-900 font-telugu">
                        {language === 'te' ? '150 నాణాలు + 150 శక్తి పాయింట్లు' : '150 Coins + 150 Energy'}
                      </span>
                      <p className="text-[11px] text-stone-500">
                        {language === 'te' ? 'అదనపు క్లూలు & తక్షణ సూచనల స్టార్టర్ ప్యాక్' : 'Extra clues & instant hints starter pack'}
                      </p>
                    </div>
                  </div>
                  <span className="font-bold text-stone-800 text-base font-mono">₹19</span>
                </button>
              </div>

              {/* Dynamic Live UPI Payment Box */}
              <div className="p-3 bg-gradient-to-br from-stone-50 to-amber-50/40 rounded-xl border border-stone-300 space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-stone-700 uppercase tracking-wider flex items-center gap-1.5">
                    <span>📱</span>
                    <span>దశ 1: Google Pay / PhonePe ద్వారా ₹{packAmount} చెల్లించండి</span>
                  </span>
                  <span className="text-xs font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full font-mono">
                    ₹{packAmount}
                  </span>
                </div>

                <div className="flex flex-col sm:flex-row items-center gap-3 bg-white p-2.5 rounded-lg border border-stone-200">
                  {/* Real Live Dynamic QR Code */}
                  <div className="shrink-0 flex flex-col items-center">
                    <img
                      src={qrUrl}
                      alt="UPI QR Code"
                      className="w-24 h-24 rounded border border-stone-200 shadow-2xs"
                    />
                    <span className="text-[9px] font-bold text-stone-500 mt-1">స్కాన్ చేసి చెల్లించండి</span>
                  </div>

                  {/* UPI Details & Custom UPI Config */}
                  <div className="flex-1 min-w-0 text-left space-y-1.5 w-full">
                    <div className="flex items-center justify-between gap-1">
                      <span className="text-[11px] text-stone-500">స్వీకర్త UPI ID:</span>
                      <button
                        type="button"
                        onClick={() => {
                          setTempUpiInput(upiId);
                          setIsEditingUpi(!isEditingUpi);
                        }}
                        className="text-[11px] text-blue-600 hover:text-blue-800 font-bold flex items-center gap-1"
                        title="మీ UPI IDని మార్చుకోండి"
                      >
                        <Edit2 size={12} />
                        <span>{isEditingUpi ? 'రద్దు' : 'UPI మార్చు'}</span>
                      </button>
                    </div>

                    {isEditingUpi ? (
                      <div className="flex items-center gap-1.5 mt-1">
                        <input
                          type="text"
                          value={tempUpiInput}
                          onChange={(e) => setTempUpiInput(e.target.value)}
                          placeholder="ఉదా: yourname@okaxis"
                          className="flex-1 px-2 py-1 text-xs border rounded font-mono border-blue-400 focus:outline-hidden"
                        />
                        <button
                          type="button"
                          onClick={handleSaveUpi}
                          className="px-2 py-1 bg-blue-600 text-white rounded text-xs font-bold hover:bg-blue-700"
                        >
                          సేవ్
                        </button>
                      </div>
                    ) : (
                      <div className="flex items-center justify-between bg-stone-50 px-2 py-1 rounded border border-stone-200 font-mono text-xs font-bold text-stone-800">
                        <span className="truncate">{upiId}</span>
                        <button
                          type="button"
                          onClick={handleCopyUpi}
                          className="text-stone-500 hover:text-stone-800 ml-1 shrink-0"
                          title="Copy UPI ID"
                        >
                          {copied ? <Check size={14} className="text-emerald-600" /> : <Copy size={14} />}
                        </button>
                      </div>
                    )}

                    {/* Direct UPI Mobile Intent Link */}
                    <a
                      href={upiUrl}
                      className="block w-full text-center py-1.5 px-2 bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 rounded-lg text-xs font-bold transition flex items-center justify-center gap-1.5"
                    >
                      <ExternalLink size={13} />
                      <span>{language === 'te' ? 'ఫోన్‌లో GPay / PhonePe తో చెల్లించు' : 'Pay via Mobile UPI App'}</span>
                    </a>
                  </div>
                </div>
              </div>

              {/* Mandatory Step 2: 12-Digit UTR Verification Input */}
              <div className="p-3 bg-amber-50/60 rounded-xl border border-amber-300 space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-stone-800 flex items-center gap-1.5">
                    <span className="w-5 h-5 rounded-full bg-amber-600 text-white text-[11px] font-bold flex items-center justify-center">2</span>
                    <span>{language === 'te' ? 'పేమెంట్ రసీదులోని 12 అంకెల UTR నంబర్:' : 'Enter 12-Digit UPI Ref / UTR Number:'}</span>
                  </label>
                  <span className={`text-[10px] font-mono font-bold ${utrInput.length === 12 ? 'text-emerald-700' : 'text-stone-500'}`}>
                    {utrInput.length}/12 అంకెలు
                  </span>
                </div>

                <div className="relative">
                  <input
                    type="text"
                    maxLength={12}
                    value={utrInput}
                    onChange={(e) => {
                      const val = e.target.value.replace(/\D/g, '');
                      setUtrInput(val);
                      setErrorMsg(null);
                    }}
                    placeholder="ఉదా: 429810394821"
                    className="w-full px-3 py-2 bg-white border-2 border-amber-300 focus:border-amber-600 rounded-xl font-mono text-base tracking-widest text-center text-stone-900 focus:outline-hidden shadow-inner font-bold placeholder:text-stone-400 placeholder:tracking-normal placeholder:font-normal placeholder:text-xs"
                  />
                  {utrInput.length === 12 && (
                    <span className="absolute right-3 top-2.5 text-emerald-600 font-bold">✓</span>
                  )}
                </div>

                <p className="text-[10px] text-stone-500 leading-tight">
                  {language === 'te' 
                    ? 'చెల్లింపు పూర్తయిన తర్వాత Google Pay లేదా PhonePe రసీదులో "UPI Ref No" లేదా "UTR" అని ఉన్న 12 అంకెల నంబర్‌ను ఇక్కడ నమోదు చేయండి.'
                    : 'After payment, find the 12-digit number labeled "UPI Ref No" or "UTR" in your GPay/PhonePe receipt and enter it above.'}
                </p>

                {errorMsg && (
                  <div className="p-2 bg-rose-50 border border-rose-300 rounded-lg text-rose-800 text-xs font-bold flex items-center gap-1.5 animate-in shake">
                    <AlertCircle size={15} className="shrink-0 text-rose-600" />
                    <span>{errorMsg}</span>
                  </div>
                )}
              </div>

              {/* Strict UTR Verification & Unlock Button */}
              <button
                type="button"
                onClick={handleVerifyAndUnlock}
                disabled={isProcessing}
                className={`w-full py-3 text-white font-bold rounded-xl shadow-md transition-all active:scale-98 flex items-center justify-center gap-2 text-sm cursor-pointer ${
                  utrInput.trim().length === 12
                    ? 'bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700'
                    : 'bg-stone-400 hover:bg-stone-500'
                }`}
              >
                {isProcessing ? (
                  <span className="animate-spin text-lg">⏳ ధృవీకరిస్తున్నాము...</span>
                ) : (
                  <>
                    <ShieldCheck size={18} />
                    <span>
                      {language === 'te'
                        ? `UTR ధృవీకరించి ₹${packAmount} ప్యాక్ అన్‌లాక్ చేయి`
                        : `Verify UTR & Unlock (₹${packAmount})`}
                    </span>
                  </>
                )}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
