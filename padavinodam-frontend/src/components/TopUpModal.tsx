import React, { useState } from 'react';
import { X, Zap, QrCode, ShieldCheck, CheckCircle2, Sparkles, Baby } from 'lucide-react';
import type { Language } from '../utils/translations';

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

  if (!isOpen) return null;

  const handleSimulatePayment = () => {
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
    }, 1000);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200 print:hidden">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full border border-stone-200 overflow-hidden relative">
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
                {language === 'te' ? 'అసంపూర్తి పజిల్‌ను వదిలేందుకు 15 పాయింట్లు అవసరం' : 'Costs 15 points to skip an incomplete puzzle'}
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

        {/* Current Balance & Auto-Restore Banner */}
        <div className="p-4 bg-amber-50/70 border-b border-amber-200/60 flex items-center justify-between">
          <div>
            <span className="text-xs text-stone-600 block">
              {language === 'te' ? 'ప్రస్తుత శక్తి నిల్వ:' : 'Current Energy:'}
            </span>
            <div className="flex items-center gap-1.5 font-bold text-lg text-amber-950 font-mono">
              <Zap size={18} className="text-amber-500 fill-amber-500" />
              <span>{currentPoints}</span>
              <span className="text-stone-400 text-xs font-normal">/ 100 గరిష్టం</span>
            </div>
          </div>
          <div className="text-right bg-white px-2.5 py-1.5 rounded-lg border border-amber-200 shadow-2xs">
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
            <div className="p-4 bg-emerald-50 border border-emerald-300 rounded-xl text-center text-emerald-800 font-bold flex flex-col items-center gap-2 animate-in zoom-in-95">
              <CheckCircle2 size={36} className="text-emerald-600" />
              <span>{successMsg}</span>
            </div>
          ) : (
            <>
              {/* Package Selector */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-stone-700 block">
                  {language === 'te' ? 'ప్యాకేజీని ఎంచుకోండి:' : 'Select Package:'}
                </label>

                {/* Kids Mode Unlock Option */}
                {!isKidsUnlocked && (
                  <button
                    type="button"
                    onClick={() => setSelectedPack('kids')}
                    className={`w-full p-3 rounded-xl border text-left flex items-center justify-between transition-all ${
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
                            ఒక్కసారి మాత్రమే
                          </span>
                        </div>
                        <p className="text-[11px] text-stone-500">
                          {language === 'te'
                            ? 'పిల్లల కోసం జంతువులు, ప్రకృతి, నీతి కథలు (జీవితాంతం ఉచితం)'
                            : 'Animals, nature & moral literature for kids (Free forever)'}
                        </p>
                      </div>
                    </div>
                    <span className="font-bold text-purple-700 text-base font-mono">₹49</span>
                  </button>
                )}

                {/* 500 Points Pack (Value) */}
                <button
                  type="button"
                  onClick={() => setSelectedPack('p500')}
                  className={`w-full p-3 rounded-xl border text-left flex items-center justify-between transition-all ${
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
                        {language === 'te' ? '~33 సార్లు అసంపూర్తి పజిల్ మార్పిడులు' : '~33 incomplete puzzle skips'}
                      </p>
                    </div>
                  </div>
                  <span className="font-bold text-amber-700 text-base font-mono">₹49</span>
                </button>

                {/* 150 Points Pack */}
                <button
                  type="button"
                  onClick={() => setSelectedPack('p150')}
                  className={`w-full p-3 rounded-xl border text-left flex items-center justify-between transition-all ${
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
                        {language === 'te' ? '10 సార్లు అసంపూర్తి పజిల్ మార్పిడులు' : '10 incomplete puzzle skips'}
                      </p>
                    </div>
                  </div>
                  <span className="font-bold text-stone-800 text-base font-mono">₹19</span>
                </button>
              </div>

              {/* GPay QR Section */}
              <div className="p-3 bg-stone-50 rounded-xl border border-stone-200 flex items-center gap-3">
                <div className="w-16 h-16 bg-white p-1 rounded-lg border border-stone-300 shadow-2xs flex flex-col items-center justify-center shrink-0">
                  <QrCode size={36} className="text-stone-800" />
                  <span className="text-[8px] font-bold text-blue-600 font-mono">GPay / UPI</span>
                </div>
                <div className="flex-1 text-left">
                  <span className="text-[10px] text-stone-500 uppercase font-bold tracking-wider block">
                    Google Pay / PhonePe QR
                  </span>
                  <span className="text-xs font-mono font-bold text-stone-800 block">
                    padam@okaxis
                  </span>
                  <p className="text-[10px] text-stone-500 mt-0.5">
                    {language === 'te'
                      ? 'డెమో కోసం క్రింది బటన్ నొక్కి వెంటనే యాక్టివేట్ చేసుకోండి'
                      : 'Simulate instant UPI payment with one click below'}
                  </p>
                </div>
              </div>

              {/* Instant Simulated Payment Button */}
              <button
                type="button"
                onClick={handleSimulatePayment}
                disabled={isProcessing}
                className="w-full py-3 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-bold rounded-xl shadow-md transition-all active:scale-98 flex items-center justify-center gap-2 text-sm"
              >
                {isProcessing ? (
                  <span className="animate-spin text-lg">⏳</span>
                ) : (
                  <>
                    <ShieldCheck size={18} />
                    <span>
                      {selectedPack === 'kids'
                        ? (language === 'te' ? 'GPay ద్వారా ₹49 చెల్లించి అన్‌లాక్ చేయి' : 'Pay ₹49 with GPay to Unlock')
                        : (language === 'te' ? `GPay ద్వారా ₹${selectedPack === 'p150' ? 19 : 49} చెల్లించి రీఛార్జ్ చేయి` : `Pay ₹${selectedPack === 'p150' ? 19 : 49} with GPay`)}
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
