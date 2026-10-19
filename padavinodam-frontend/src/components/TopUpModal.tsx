import React, { useState, useEffect } from 'react';
import { X, Zap, CheckCircle2, Sparkles, Baby, Edit2, ExternalLink, Check, Copy } from 'lucide-react';
import type { Language } from '../utils/translations';
import { getSavedUpiId, saveUpiId, buildUpiPaymentUrl, buildUpiQrUrl } from '../config/paymentConfig';
import { createPaymentOrder, checkOrderStatus, type UtrVerifyResult, type OrderSession } from '../services/api';
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
  const [selectedPack, setSelectedPack] = useState<'p150' | 'p500' | 'kids'>(() => {
    return initialMode === 'kids' && !isKidsUnlocked ? 'kids' : 'p500';
  });
  const [successResult, setSuccessResult] = useState<UtrVerifyResult | null>(null);

  // Synchronize selected pack whenever modal opens: If already unlocked, never allow 'kids'
  useEffect(() => {
    if (isOpen) {
      if (initialMode === 'kids' && !isKidsUnlocked) {
        setSelectedPack('kids');
      } else {
        if (selectedPack === 'kids' || isKidsUnlocked) {
          setSelectedPack('p500');
        }
      }
      setSuccessResult(null);
    }
  }, [isOpen, initialMode, isKidsUnlocked]);

  // Dynamic UPI configuration
  const [upiId, setUpiId] = useState<string>(() => getSavedUpiId());
  const [isEditingUpi, setIsEditingUpi] = useState(false);
  const [tempUpiInput, setTempUpiInput] = useState(upiId);
  const [copied, setCopied] = useState(false);

  // Automatic SMS Webhook listener state
  const [activeOrder, setActiveOrder] = useState<OrderSession | null>(null);

  const packAmount = selectedPack === 'p150' ? 19 : 49;
  const packTitle = selectedPack === 'kids' ? 'Kids Mode Lifetime' : (selectedPack === 'p500' ? '500 Points & Coins' : '150 Points & Coins');
  const upiUrl = buildUpiPaymentUrl(packAmount, packTitle, upiId);
  const qrUrl = buildUpiQrUrl(upiUrl);

  // Auto-listen for incoming bank SMS webhook confirmation
  useEffect(() => {
    if (!isOpen) {
      setActiveOrder(null);
      return;
    }
    let isCancelled = false;
    let pollInterval: any = null;

    createPaymentOrder(selectedPack, packAmount, upiId).then(order => {
      if (isCancelled) return;
      setActiveOrder(order);

      pollInterval = setInterval(async () => {
        try {
          const status = await checkOrderStatus(order.order_id);
          if (status.status === 'PAID') {
            clearInterval(pollInterval);
            templeAudio.playSuccessFanfare();
            const effectivePack = status.pack || selectedPack;
            setSuccessResult({
              success: true,
              message: status.message || (effectivePack === 'kids' ? '👶 బాలల విభాగం స్వయంచాలకంగా అన్‌లాక్ చేయబడింది!' : '🎉 పాయింట్లు స్వయంచాలకంగా జమ చేయబడ్డాయి!'),
              utr: status.utr || 'BANK-SMS-VERIFIED',
              receipt_id: status.receipt_id || `REC-${Date.now().toString(36).toUpperCase()}`,
              amount: status.amount,
              pack: effectivePack,
              unlocked_rewards: status.rewards || {},
              timestamp: new Date().toLocaleTimeString()
            });

            if (effectivePack === 'kids' || status.rewards?.kids_unlocked) {
              onUnlockKids();
              if (status.rewards?.coins || status.rewards?.energy) {
                onAddPoints(status.rewards?.energy || 100, status.rewards?.coins || 100);
              }
            } else if (effectivePack === 'p500') {
              onAddPoints(500, 500);
            } else if (effectivePack === 'p150') {
              onAddPoints(150, 150);
            }

            setTimeout(() => {
              setSuccessResult(null);
              onClose();
            }, 2500);
          }
        } catch {
          // ignore network glitch
        }
      }, 1500);
    });

    return () => {
      isCancelled = true;
      if (pollInterval) clearInterval(pollInterval);
    };
  }, [isOpen, selectedPack, packAmount, upiId]);

  if (!isOpen) return null;

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
                {language === 'te' ? 'UPI ద్వారా నేరుగా బ్యాంక్ చెల్లింపు' : 'Direct zero-fee UPI payment'}
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
                    onClick={() => setSelectedPack('kids')}
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
                  onClick={() => setSelectedPack('p500')}
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
                  onClick={() => setSelectedPack('p150')}
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
                    <span>Google Pay / PhonePe ద్వారా ₹{packAmount} చెల్లించండి</span>
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

              {/* Automatic SMS Webhook Live Radar Listener */}
              <div className="p-3 bg-gradient-to-r from-emerald-50 via-teal-50 to-emerald-50 border border-emerald-300 rounded-xl space-y-1.5">
                <div className="flex items-center gap-2">
                  <span className="relative flex h-3 w-3 shrink-0">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
                  </span>
                  <div className="flex-1">
                    <div className="font-bold text-xs text-emerald-950 font-telugu flex items-center justify-between">
                      <span>{language === 'te' ? '⚡ స్వయంచాలక తక్షణ అన్‌లాక్ (Live Detection)' : '⚡ Automatic Instant Unlock'}</span>
                      {activeOrder && (
                        <span className="text-[9px] font-mono text-emerald-700 bg-white px-1.5 py-0.5 rounded border border-emerald-200">
                          {activeOrder.order_id}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                <p className="text-[11px] text-emerald-800 font-telugu leading-tight">
                  {language === 'te'
                    ? 'మీరు UPI లో చెల్లించగానే, మీ బ్యాంక్ SMS ఆధారంగా ఈ గేమ్ ఆటోమేటిక్‌గా అన్‌లాక్ అవుతుంది. మీరు ఎటువంటి నంబర్లు టైప్ చేయాల్సిన అవసరం లేదు!'
                    : 'Once you pay via UPI, your bank SMS will automatically trigger the unlock. Zero typing required!'}
                </p>
              </div>

            </>
          )}
        </div>
      </div>
    </div>
  );
};
