import React, { useState } from 'react';
import { X, Zap, ShieldCheck, CheckCircle2, Sparkles, Baby, Edit2, ExternalLink, Check, Copy } from 'lucide-react';
import type { Language } from '../utils/translations';
import { getSavedUpiId, saveUpiId, buildUpiPaymentUrl, buildUpiQrUrl } from '../config/paymentConfig';

interface TopUpModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentPoints: number;
  isKidsUnlocked: boolean;
  language: Language;
  onAddPoints: (amount: number) => void;
  onUnlockKids: () => void;
  initialMode?: 'points' | 'kids';
}

export const TopUpModal: React.FC<TopUpModalProps> = ({
  isOpen,
  onClose,
  currentPoints,
  isKidsUnlocked,
  language,
  onAddPoints,
  onUnlockKids,
  initialMode = 'points'
}) => {
  const [selectedPack, setSelectedPack] = useState<'p150' | 'p500' | 'kids'>(
    initialMode === 'kids' && !isKidsUnlocked ? 'kids' : 'p500'
  );
  const [isProcessing, setIsProcessing] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Dynamic UPI configuration
  const [upiId, setUpiId] = useState<string>(() => getSavedUpiId());
  const [isEditingUpi, setIsEditingUpi] = useState(false);
  const [tempUpiInput, setTempUpiInput] = useState(upiId);
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const packAmount = selectedPack === 'p150' ? 19 : 49;
  const packTitle = selectedPack === 'kids' ? 'Kids Mode' : (selectedPack === 'p500' ? '500 Points' : '150 Points');
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

  const handleConfirmPayment = () => {
    setIsProcessing(true);
    setTimeout(() => {
      setIsProcessing(false);
      if (selectedPack === 'p150') {
        onAddPoints(150);
        setSuccessMsg(language === 'te' ? '🎉 +150 పాయింట్లు విజయవంతంగా జోడించబడ్డాయి!' : '🎉 +150 Points added successfully!');
      } else if (selectedPack === 'p500') {
        onAddPoints(500);
        setSuccessMsg(language === 'te' ? '🎉 +500 పాయింట్లు విజయవంతంగా జోడించబడ్డాయి!' : '🎉 +500 Points added successfully!');
      } else if (selectedPack === 'kids') {
        onUnlockKids();
        setSuccessMsg(language === 'te' ? '👶 బాలల విభాగం శాశ్వతంగా అన్‌లాక్ అయింది!' : '👶 Kids Mode unlocked permanently!');
      }
      setTimeout(() => {
        setSuccessMsg(null);
        onClose();
      }, 1800);
    }, 600);
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
                {language === 'te' ? 'UPI ద్వారా నేరుగా మీ బ్యాంక్ ఖాతాకు చెల్లింపు' : 'Direct zero-fee UPI payment'}
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
          <div>
            <span className="text-[11px] text-stone-600 block">
              {language === 'te' ? 'ప్రస్తుత శక్తి నిల్వ:' : 'Current Energy:'}
            </span>
            <div className="flex items-center gap-1.5 font-bold text-base text-amber-950 font-mono">
              <Zap size={16} className="text-amber-500 fill-amber-500" />
              <span>{currentPoints}</span>
              <span className="text-stone-400 text-xs font-normal">/ 100 గరిష్టం</span>
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
          {successMsg ? (
            <div className="p-6 bg-emerald-50 border border-emerald-300 rounded-xl text-center text-emerald-800 font-bold flex flex-col items-center gap-2 animate-in zoom-in-95">
              <CheckCircle2 size={40} className="text-emerald-600 animate-bounce" />
              <span className="text-base">{successMsg}</span>
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
                    onClick={() => setSelectedPack('kids')}
                    className={`w-full p-2.5 rounded-xl border text-left flex items-center justify-between transition-all ${
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
                          {language === 'te' ? 'పిల్లల కోసం ప్రత్యేక పజిల్స్' : 'Special 5x5 puzzles for kids'}
                        </p>
                      </div>
                    </div>
                    <span className="font-bold text-purple-700 text-base font-mono">₹49</span>
                  </button>
                )}

                {/* 500 Points Pack */}
                <button
                  type="button"
                  onClick={() => setSelectedPack('p500')}
                  className={`w-full p-2.5 rounded-xl border text-left flex items-center justify-between transition-all ${
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
                          {language === 'te' ? '500 పాయింట్లు (సూపర్ ప్యాక్)' : '500 Points (Super Pack)'}
                        </span>
                        <span className="bg-rose-500 text-white text-[9px] font-bold px-1.5 py-0.2 rounded-full">
                          జనాదరణ
                        </span>
                      </div>
                      <p className="text-[11px] text-stone-500">
                        {language === 'te' ? '~33 సార్లు అసంపూర్తి పజిల్ మార్పిడులు' : '~33 puzzle skips'}
                      </p>
                    </div>
                  </div>
                  <span className="font-bold text-amber-700 text-base font-mono">₹49</span>
                </button>

                {/* 150 Points Pack */}
                <button
                  type="button"
                  onClick={() => setSelectedPack('p150')}
                  className={`w-full p-2.5 rounded-xl border text-left flex items-center justify-between transition-all ${
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
                        {language === 'te' ? '150 పాయింట్లు (స్టార్టర్)' : '150 Points (Starter)'}
                      </span>
                      <p className="text-[11px] text-stone-500">
                        {language === 'te' ? '10 సార్లు అసంపూర్తి పజిల్ మార్పిడులు' : '10 puzzle skips'}
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
                    <span>{language === 'te' ? 'UPI చెల్లింపు విధానం (Google Pay / PhonePe)' : 'Direct UPI Payment'}</span>
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

              {/* Instant Activation Button */}
              <button
                type="button"
                onClick={handleConfirmPayment}
                disabled={isProcessing}
                className="w-full py-3 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-bold rounded-xl shadow-md transition-all active:scale-98 flex items-center justify-center gap-2 text-sm cursor-pointer"
              >
                {isProcessing ? (
                  <span className="animate-spin text-lg">⏳</span>
                ) : (
                  <>
                    <ShieldCheck size={18} />
                    <span>
                      {language === 'te'
                        ? `చెల్లింపు పూర్తయింది - ₹${packAmount} ప్యాక్ అన్‌లాక్ చేయి`
                        : `Confirm Payment & Unlock (₹${packAmount})`}
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
