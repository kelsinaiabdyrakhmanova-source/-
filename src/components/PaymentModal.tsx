import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '../context/AppContext';
import { api } from '../services/api';
import { QRCodeSVG } from 'qrcode.react';
import {
  X,
  CreditCard,
  QrCode,
  CheckCircle2,
  AlertCircle,
  Tag,
  ArrowRight,
  ShieldCheck,
  Sparkles,
  Lock,
  Calendar,
  RefreshCw,
  Copy,
  Check,
  ExternalLink,
  MessageSquare,
  HelpCircle,
  UploadCloud,
  FileText,
  Building2,
  Smartphone,
  ChevronLeft,
  Info
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { FinikPaymentOrder } from '../types';

export const PaymentModal: React.FC = () => {
  const {
    isPaymentModalOpen,
    setIsPaymentModalOpen,
    selectedPlan,
    language,
    t,
    confirmDemoPayment,
    applyPromo,
    navigate,
    user,
    initiateFinikPayment,
    checkFinikStatus,
    simulateFinikWebhookSuccess,
    activeFinikOrder,
    setActiveFinikOrder,
    isFinikActive,
    isFinikEnabled,
    showToast
  } = useApp();

  const savedMethods = user?.savedPaymentMethods || [];
  const hasSavedCards = savedMethods.length > 0;

  // Modal Step: 'qr' (main payment view) | 'receipt_form' (after clicking «Мен төлөдүм») | 'review_submitted' (verification sent) | 'paid_success'
  const [modalStep, setModalStep] = useState<'qr' | 'receipt_form' | 'review_submitted' | 'paid_success'>('qr');

  // Primary payment method is MBank QR; Finik is preserved as an optional structure
  const [paymentMethod, setPaymentMethod] = useState<'mbank_qr' | 'card' | 'finik'>('mbank_qr');
  const [cardMode, setCardMode] = useState<'saved' | 'new'>(hasSavedCards ? 'saved' : 'new');
  const [selectedSavedCardId, setSelectedSavedCardId] = useState<string>(
    hasSavedCards ? savedMethods[0].id : ''
  );

  // New card fields
  const [cardNumber, setCardNumber] = useState('');
  const [cardHolder, setCardHolder] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCvc, setCardCvc] = useState('');
  const [savePaymentMethod, setSavePaymentMethod] = useState(false);

  // Promo code states
  const [promoInput, setPromoInput] = useState('');
  const [promoError, setPromoError] = useState('');
  const [isCheckingPromo, setIsCheckingPromo] = useState(false);
  const [appliedPromo, setAppliedPromo] = useState<{
    code: string;
    discountType: 'percentage' | 'fixed';
    discountValue: number;
    discountAmount: number;
    discountPercent: number;
    finalAmount: number;
  } | null>(null);

  // Processing & UI states
  const [isProcessing, setIsProcessing] = useState(false);
  const [copiedId, setCopiedId] = useState(false);

  // Finik active order
  const [currentOrder, setCurrentOrder] = useState<FinikPaymentOrder | null>(activeFinikOrder);
  const [isFinikInitializing, setIsFinikInitializing] = useState(false);

  // Receipt verification form states
  const [payerName, setPayerName] = useState(user?.fullName || '');
  const [payerPhone, setPayerPhone] = useState(user?.phone || '');
  const [payerAmount, setPayerAmount] = useState<number>(selectedPlan?.price || 1000);
  const [transactionNumber, setTransactionNumber] = useState('');
  const [agreeOffer, setAgreeOffer] = useState(false);
  const [isDuplicateAlert, setIsDuplicateAlert] = useState(false);
  const [receiptImage, setReceiptImage] = useState<string>('');
  const [receiptFileName, setReceiptFileName] = useState<string>('');
  const [isSubmittingReceipt, setIsSubmittingReceipt] = useState(false);
  const [receiptFormError, setReceiptFormError] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const basePrice = selectedPlan?.price || 0;
  const finalPrice = appliedPromo ? appliedPromo.finalAmount : basePrice;

  // Initialize or fetch Finik order when modal opens or plan changes
  useEffect(() => {
    if (!isPaymentModalOpen || !selectedPlan) return;

    // Reset states on fresh open
    setModalStep('qr');
    setPaymentMethod(isFinikActive ? 'finik' : 'mbank_qr');
    setSavePaymentMethod(false);
    setPromoError('');
    setPromoInput('');
    setAppliedPromo(null);
    setReceiptImage('');
    setReceiptFileName('');
    setReceiptFormError('');
    setPayerName(user?.fullName || '');
    setPayerPhone(user?.phone || '');
    setPayerAmount(selectedPlan.price || 490);

    let isCancelled = false;
    const setupPayment = async () => {
      if (isFinikActive) {
        setIsFinikInitializing(true);
      }
      try {
        const order = await initiateFinikPayment(selectedPlan, basePrice);
        if (!isCancelled && order) {
          setCurrentOrder(order);
          setPayerAmount(order.amount);
        }
      } catch (err) {
        console.warn('Payment setup notice:', err);
      } finally {
        if (!isCancelled) {
          setIsFinikInitializing(false);
        }
      }
    };

    setupPayment();

    return () => {
      isCancelled = true;
    };
  }, [isPaymentModalOpen, selectedPlan, isFinikActive]);

  // Keep payerAmount synced with finalPrice
  useEffect(() => {
    setPayerAmount(finalPrice);
  }, [finalPrice]);

  // Polling for automated payment status while modal is open (only when Finik is active)
  useEffect(() => {
    if (!isPaymentModalOpen || !isFinikActive || paymentMethod !== 'finik' || !currentOrder?.paymentId || modalStep === 'paid_success') {
      return;
    }

    const paymentId = currentOrder.paymentId;
    const interval = setInterval(async () => {
      try {
        const updated = await checkFinikStatus(paymentId);
        if (updated) {
          setCurrentOrder(updated);
          if (updated.paymentStatus === 'PAID') {
            setModalStep('paid_success');
            try {
              confetti({ particleCount: 80, spread: 70 });
            } catch (e) {}
            clearInterval(interval);
          }
        }
      } catch (err) {
        console.error('Polling Finik status error:', err);
      }
    }, 3000);

    return () => clearInterval(interval);
  }, [isPaymentModalOpen, paymentMethod, currentOrder?.paymentId, modalStep, checkFinikStatus]);

  if (!isPaymentModalOpen || !selectedPlan) return null;

  // Next renewal date calculated exactly 30 days ahead
  const nextRenewalDate = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
  const formattedNextDate = nextRenewalDate.toLocaleDateString(language === 'ky' ? 'ky-KG' : 'ru-RU', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });

  const detectCardBrand = (num: string): { name: string; type: 'visa' | 'mastercard' | 'elkart' | 'other' } => {
    const clean = num.replace(/\s+/g, '');
    if (clean.startsWith('4')) return { name: 'Visa', type: 'visa' };
    if (/^(5[1-5]|2[2-7])/.test(clean)) return { name: 'Mastercard', type: 'mastercard' };
    if (clean.startsWith('94') || clean.startsWith('96')) return { name: 'Элкарт', type: 'elkart' };
    return { name: 'Банковская карта', type: 'other' };
  };

  const currentBrand = detectCardBrand(cardNumber);

  const handleCardNumberChange = (val: string) => {
    const raw = val.replace(/\D/g, '').slice(0, 16);
    const parts = raw.match(/[\s\S]{1,4}/g) || [];
    setCardNumber(parts.join(' '));
  };

  const handleExpiryChange = (val: string) => {
    const raw = val.replace(/\D/g, '').slice(0, 4);
    if (raw.length >= 3) {
      setCardExpiry(`${raw.slice(0, 2)}/${raw.slice(2)}`);
    } else {
      setCardExpiry(raw);
    }
  };

  const handleApplyPromo = async (codeToApply?: string) => {
    setPromoError('');
    const code = (typeof codeToApply === 'string' ? codeToApply : promoInput).trim();
    if (!code) return;
    setIsCheckingPromo(true);
    try {
      const res = await api.validatePromoCode(code, selectedPlan.id, basePrice);
      if (res.valid) {
        setAppliedPromo({
          code: res.code,
          discountType: res.discountType,
          discountValue: res.discountValue,
          discountAmount: res.discountAmount,
          discountPercent: res.discountPercent,
          finalAmount: res.finalAmount
        });
        setPromoInput(res.code);

        // Re-initialize dynamic QR with promo discount applied
        try {
          if (isFinikActive) setIsFinikInitializing(true);
          const order = await initiateFinikPayment(selectedPlan, basePrice, res.code);
          if (order) {
            setCurrentOrder(order);
            setPayerAmount(order.amount);
          }
        } catch (err) {
          console.warn('Failed to re-initialize with promo:', err);
        } finally {
          setIsFinikInitializing(false);
        }
      } else {
        setPromoError(res.error || (language === 'ky' ? 'Жараксыз промокод' : 'Недействительный промокод'));
      }
    } catch (err: any) {
      setPromoError(err.message || (language === 'ky' ? 'Жараксыз промокод' : 'Недействительный промокод'));
    } finally {
      setIsCheckingPromo(false);
    }
  };

  const handleRemovePromo = async () => {
    setAppliedPromo(null);
    setPromoInput('');
    setPromoError('');

    try {
      setIsFinikInitializing(true);
      const order = await initiateFinikPayment(selectedPlan, basePrice);
      setCurrentOrder(order);
      setPayerAmount(order.amount);
    } catch (err) {
      console.error('Failed to reset without promo:', err);
    } finally {
      setIsFinikInitializing(false);
    }
  };

  const handleCopyPaymentId = () => {
    if (!currentOrder?.paymentId) return;
    navigator.clipboard.writeText(currentOrder.paymentId);
    setCopiedId(true);
    setTimeout(() => setCopiedId(false), 2000);
  };

  // Handle Receipt File Upload
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setReceiptFileName(file.name);
    setReceiptFormError('');

    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        setReceiptImage(reader.result);
      }
    };
    reader.readAsDataURL(file);
  };

  // Submit Receipt Form
  const handleSubmitReceiptForm = async (e: React.FormEvent) => {
    e.preventDefault();
    setReceiptFormError('');

    if (!payerName.trim()) {
      setReceiptFormError(language === 'ky' ? 'Сураныч, аты-жөнүңүздү жазыңыз' : 'Пожалуйста, введите ваше ФИО');
      return;
    }
    if (!payerPhone.trim()) {
      setReceiptFormError(language === 'ky' ? 'Сураныч, телефон номериңизди жазыңыз' : 'Пожалуйста, введите номер телефона');
      return;
    }
    if (!receiptImage) {
      setReceiptFormError(language === 'ky' ? 'Сураныч, төлөм чегинин скриншотун жүктөңүз' : 'Пожалуйста, прикрепите скриншот чека');
      return;
    }
    if (!agreeOffer) {
      setReceiptFormError(language === 'ky' ? 'Публичная оферта жана пайдалануу шарттарын кабыл алуу милдеттүү' : 'Необходимо принять условия публичной оферты');
      return;
    }

    setIsSubmittingReceipt(true);
    try {
      const paymentId = currentOrder?.paymentId || `pay-${Date.now()}`;
      const res = await api.submitPaymentReceipt({
        paymentId,
        payerName: payerName.trim(),
        payerPhone: payerPhone.trim(),
        payerAmount: Number(payerAmount) || finalPrice,
        receiptUrl: receiptImage,
        transactionNumber: transactionNumber.trim(),
        offerAccepted: true,
        offerVersion: 'v1.0-2026'
      });

      if (res.isDuplicate) {
        setIsDuplicateAlert(true);
      } else {
        setIsDuplicateAlert(false);
      }

      setModalStep('review_submitted');
      try {
        confetti({ particleCount: 50, spread: 60 });
      } catch (e) {}
    } catch (err: any) {
      setReceiptFormError(err.message || 'Ката кетти. Кайра аракет кылып көрүңүз.');
    } finally {
      setIsSubmittingReceipt(false);
    }
  };

  const handleCardPay = async () => {
    setIsProcessing(true);
    const promoToPass = appliedPromo ? appliedPromo.code : undefined;
    try {
      if (cardMode === 'saved') {
        const saved = savedMethods.find((m) => m.id === selectedSavedCardId) || savedMethods[0];
        await confirmDemoPayment('saved_card', promoToPass, {
          saveCard: false,
          autoRenew: saved?.autoRenewEnabled ?? true,
          cardBrand: saved?.cardBrandName,
          last4: saved?.last4,
          savedMethodId: saved?.id,
          amount: finalPrice
        });
      } else {
        const cleanNumber = cardNumber.replace(/\s+/g, '');
        const last4 = cleanNumber.length >= 4 ? cleanNumber.slice(-4) : '4242';
        const brand = currentBrand.name;
        const [expMonth = '12', expYear = '28'] = cardExpiry.split('/');
        const pciToken = `tok_pci_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;

        await confirmDemoPayment('card', promoToPass, {
          saveCard: savePaymentMethod,
          autoRenew: savePaymentMethod,
          cardToken: pciToken,
          cardBrand: brand,
          last4,
          expiryMonth: expMonth,
          expiryYear: expYear,
          amount: finalPrice
        });
      }

      setModalStep('paid_success');
      try {
        confetti({ particleCount: 70, spread: 60 });
      } catch (e) {}
    } finally {
      setIsProcessing(false);
    }
  };

  const handleFinish = () => {
    setIsPaymentModalOpen(false);
    setModalStep('qr');
    navigate('student-cabinet');
  };

  const whatsappPhone = '+996700000001';
  const whatsappText = encodeURIComponent(
    `Саламатсызбы! ОРТ Онлайн кызматы боюнча төлөм жүргүздүм. Алуучу: ОсОО «Билет Центр». Payment ID: ${currentOrder?.paymentId || 'N/A'}`
  );
  const whatsappUrl = `https://wa.me/${whatsappPhone.replace(/[^0-9]/g, '')}?text=${whatsappText}`;

  // QR value embedding official payee: ОсОО "Билет Центр" & brand ОРТ Онлайн with full banking structure
  const nationalQrPayload = currentOrder?.qrPayload || `ST00012|Name=ОсОО "Билет Центр"|PersonalAcc=1230000000000000|BankName=MBANK|BIC=103001|Sum=${finalPrice * 100}|Purpose=ОРТ Онлайн: ${selectedPlan.name.ky} (${currentOrder?.paymentId || 'demo'})|PayeeINN=01234567891011`;

  return (
    <div id="payment-modal-backdrop" className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/75 p-3 sm:p-4 backdrop-blur-xs overflow-y-auto animate-in fade-in">
      <div id="payment-modal-card" className="bg-white dark:bg-slate-900 rounded-3xl max-w-lg w-full shadow-2xl border border-slate-100 dark:border-slate-800 my-4 p-5 sm:p-7 space-y-4 max-h-[94vh] overflow-y-auto">
        
        {/* Header with Brand & Close Button */}
        <div className="flex items-start justify-between border-b border-slate-100 dark:border-slate-800 pb-3.5">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-blue-600 to-cyan-500 text-white flex items-center justify-center shadow-md shadow-blue-500/20">
              <QrCode className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-base sm:text-lg font-black tracking-tight text-slate-900 dark:text-white">
                  ОРТ ОНЛАЙН <span className="text-blue-600">KG</span>
                </span>
                <span className="px-1.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 dark:bg-blue-900/60 text-blue-700 dark:text-blue-300">
                  {language === 'ky' ? 'Бренд' : 'Сервис'}
                </span>
              </div>
              <h2 className="text-xs sm:text-sm font-semibold text-slate-600 dark:text-slate-300">
                {language === 'ky' ? 'QR аркылуу төлөө' : 'Оплата через QR'}
              </h2>
            </div>
          </div>
          <button
            id="btn-close-payment-modal"
            onClick={() => {
              setIsPaymentModalOpen(false);
              setModalStep('qr');
            }}
            className="w-8 h-8 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 flex items-center justify-center font-bold transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* STEP 4: ALREADY CONFIRMED / PAID SUCCESS */}
        {modalStep === 'paid_success' && (
          <div id="payment-modal-success" className="text-center py-5 space-y-4 animate-in zoom-in-95">
            <div className="w-16 h-16 rounded-3xl bg-emerald-50 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto border border-emerald-200 dark:border-emerald-800 shadow-lg shadow-emerald-500/10">
              <CheckCircle2 className="w-10 h-10" />
            </div>
            <div className="space-y-1">
              <h3 className="text-xl font-black text-slate-900 dark:text-white">
                {t.paymentSuccessTitle || 'Төлөм ийгиликтүү кабыл алынды! 🎉'}
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-300 max-w-xs mx-auto">
                {language === 'ky' ? 'ОРТ ОНЛАЙН KG кызматы толук активдештирилди.' : 'Подписка ОРТ ОНЛАЙН KG успешно активирована.'}
              </p>
            </div>

            <div className="bg-slate-50 dark:bg-slate-800/60 rounded-2xl p-4 text-left text-xs space-y-2 border border-slate-200 dark:border-slate-700 max-w-sm mx-auto">
              <div className="flex justify-between text-slate-600 dark:text-slate-400">
                <span>Кызмат / Бренд:</span>
                <span className="font-bold text-slate-900 dark:text-white">ОРТ ОНЛАЙН KG</span>
              </div>
              <div className="flex justify-between text-slate-600 dark:text-slate-400">
                <span>Төлөм алуучу:</span>
                <span className="font-bold text-slate-900 dark:text-white">ОсОО «Билет Центр»</span>
              </div>
              <div className="flex justify-between text-slate-600 dark:text-slate-400">
                <span>{t.paymentSuccessPlanLabel || 'Тариф:'}</span>
                <span className="font-bold text-slate-900 dark:text-white">{selectedPlan.name[language]}</span>
              </div>
              <div className="flex justify-between text-slate-600 dark:text-slate-400">
                <span>{t.paymentSuccessAmountLabel || 'Сумма:'}</span>
                <span className="font-extrabold text-emerald-600 dark:text-emerald-400 text-sm">{finalPrice} сом</span>
              </div>
              <div className="flex justify-between text-slate-600 dark:text-slate-400">
                <span>{t.paymentSuccessValidUntilLabel || 'Жарактуу мөөнөтү:'}</span>
                <span className="font-semibold text-slate-800 dark:text-slate-200">{formattedNextDate}</span>
              </div>
            </div>

            <button
              id="btn-payment-success-cabinet"
              onClick={handleFinish}
              className="w-full py-3.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs sm:text-sm transition-colors cursor-pointer shadow-md shadow-blue-600/20"
            >
              {language === 'ky' ? 'Жеке кабинетке өтүү' : 'Перейти в личный кабинет'}
            </button>
          </div>
        )}

        {/* STEP 3: REVIEW SUBMITTED CONFIRMATION */}
        {modalStep === 'review_submitted' && (
          <div id="payment-review-submitted" className="text-center py-4 space-y-4 animate-in zoom-in-95">
            <div className="w-16 h-16 rounded-3xl bg-amber-50 dark:bg-amber-950 text-amber-600 dark:text-amber-400 flex items-center justify-center mx-auto border border-amber-200 dark:border-amber-800 shadow-md">
              <CheckCircle2 className="w-10 h-10 text-emerald-600" />
            </div>
            
            <div className="space-y-2">
              <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white leading-snug px-2">
                «Төлөм текшерүүгө жөнөтүлдү. Тастыкталгандан кийин ОРТ ОНЛАЙН KG кызматы активдештирилет.»
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-300 max-w-sm mx-auto leading-relaxed">
                {language === 'ky'
                  ? 'Чек кабыл алынды. Биздин оператор төлөмдү банктык көчүрмө аркылуу 5–15 мүнөттүн ичинде текшерип, подпискаңызды активдештирет.'
                  : 'Чек принят. Оператор сверит оплату с банковской выпиской в течение 5–15 минут и активирует доступ к сервису.'}
              </p>
            </div>

            {/* Receipt Summary Card */}
            <div className="bg-slate-50 dark:bg-slate-800/60 rounded-2xl p-4 text-left text-xs space-y-2.5 border border-slate-200 dark:border-slate-700">
              <div className="flex justify-between items-center text-slate-600 dark:text-slate-400">
                <span>Кызмат / Бренд:</span>
                <span className="font-bold text-blue-600 dark:text-blue-400">ОРТ ОНЛАЙН KG</span>
              </div>
              <div className="flex justify-between items-center text-slate-600 dark:text-slate-400">
                <span>Төлөм алуучу:</span>
                <span className="font-bold text-slate-900 dark:text-white">ОсОО «Билет Центр»</span>
              </div>
              <div className="flex justify-between items-center text-slate-600 dark:text-slate-400">
                <span>Тариф:</span>
                <span className="font-semibold text-slate-900 dark:text-white">{selectedPlan.name[language]}</span>
              </div>
              <div className="flex justify-between items-center text-slate-600 dark:text-slate-400">
                <span>Төлөөчү (ФИО):</span>
                <span className="font-semibold text-slate-900 dark:text-white">{payerName}</span>
              </div>
              <div className="flex justify-between items-center text-slate-600 dark:text-slate-400">
                <span>Телефон:</span>
                <span className="font-mono text-slate-900 dark:text-white">{payerPhone}</span>
              </div>
              <div className="flex justify-between items-center text-slate-600 dark:text-slate-400 border-t border-slate-200 dark:border-slate-700 pt-2">
                <span>Төлөнгөн сумма:</span>
                <span className="font-extrabold text-emerald-600 text-sm">{payerAmount} сом</span>
              </div>
              <div className="flex justify-between items-center text-slate-600 dark:text-slate-400">
                <span>Чектин скриншоту:</span>
                <span className="font-semibold text-emerald-600 flex items-center gap-1">
                  <Check className="w-3.5 h-3.5" /> Жүктөлдү
                </span>
              </div>
              <div className="flex justify-between items-center text-slate-500 font-mono text-[10px] pt-1">
                <span>Payment ID:</span>
                <span>{currentOrder?.paymentId}</span>
              </div>
            </div>

            <div className="space-y-2 pt-1">
              <button
                type="button"
                onClick={handleFinish}
                className="w-full py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs sm:text-sm shadow-md transition-all cursor-pointer"
              >
                {language === 'ky' ? 'Жеке кабинетке өтүү' : 'Перейти в личный кабинет'}
              </button>

              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-2.5 px-4 rounded-xl border border-emerald-300 dark:border-emerald-800 bg-emerald-50/70 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 text-xs font-semibold flex items-center justify-center gap-2 hover:bg-emerald-100 transition-colors"
              >
                <MessageSquare className="w-4 h-4 text-emerald-600" />
                <span>{language === 'ky' ? 'WhatsApp колдоо кызматына жазуу (+996 507 392 634)' : 'Написать в поддержку WhatsApp (+996 507 392 634)'}</span>
              </a>
            </div>
          </div>
        )}

        {/* STEP 2: RECEIPT UPLOAD FORM (AFTER CLICKING «Мен төлөдүм») */}
        {modalStep === 'receipt_form' && (
          <form onSubmit={handleSubmitReceiptForm} className="space-y-4 animate-in slide-in-from-right-4">
            <div className="flex items-center justify-between pb-1">
              <button
                type="button"
                onClick={() => setModalStep('qr')}
                className="inline-flex items-center gap-1 text-xs text-blue-600 hover:text-blue-700 font-semibold cursor-pointer"
              >
                <ChevronLeft className="w-4 h-4" />
                <span>{language === 'ky' ? 'QR-кодго кайтуу' : 'Назад к QR-коду'}</span>
              </button>
              <span className="text-[11px] text-slate-500 font-medium">Кадам 2 / 2</span>
            </div>

            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                {language === 'ky' ? 'Төлөм чегин жүктөө' : 'Загрузка чека об оплате'}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                {language === 'ky'
                  ? 'Төлөмүңүздү тез тастыктоо үчүн маалыматтарды толтуруп, чектин скриншотун жүктөңүз'
                  : 'Заполните данные и прикрепите скриншот чека для быстрой проверки'}
              </p>
            </div>

            {/* Payee and Order Banner */}
            <div className="p-3 bg-blue-50/70 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-900/50 rounded-2xl flex items-center justify-between text-xs">
              <div>
                <span className="text-[10px] text-slate-500 uppercase tracking-wider block font-semibold">Төлөм алуучу:</span>
                <span className="font-bold text-slate-900 dark:text-white">ОсОО «Билет Центр»</span>
                <span className="text-[11px] text-blue-700 dark:text-blue-300 block font-medium">Кызмат: ОРТ ОНЛАЙН KG ({selectedPlan.name[language]})</span>
              </div>
              <div className="text-right">
                <span className="text-[10px] text-slate-500 block font-semibold">Суммасы:</span>
                <span className="text-base font-black text-blue-700 dark:text-blue-400">{finalPrice} сом</span>
              </div>
            </div>

            {/* Form Fields */}
            <div className="space-y-3 text-xs">
              {/* 1. Full Name */}
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  {language === 'ky' ? 'Аты-жөнүңүз (ФИО) *' : 'ФИО плательщика *'}
                </label>
                <input
                  type="text"
                  required
                  value={payerName}
                  onChange={(e) => setPayerName(e.target.value)}
                  placeholder={language === 'ky' ? 'Мисалы: Асанов Асан' : 'Например: Иванов Иван'}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 dark:text-white font-medium focus:ring-2 focus:ring-blue-500 outline-none text-xs"
                />
              </div>

              {/* 2. Phone Number */}
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  {language === 'ky' ? 'Телефон номериңиз *' : 'Номер телефона плательщика *'}
                </label>
                <input
                  type="text"
                  required
                  value={payerPhone}
                  onChange={(e) => setPayerPhone(e.target.value)}
                  placeholder="+996 700 123 456"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 dark:text-white font-medium focus:ring-2 focus:ring-blue-500 outline-none text-xs font-mono"
                />
              </div>

              {/* 3. Paid Amount */}
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  {language === 'ky' ? 'Төлөгөн суммасы (сом) *' : 'Оплаченная сумма (сом) *'}
                </label>
                <input
                  type="number"
                  required
                  min={1}
                  value={payerAmount}
                  onChange={(e) => setPayerAmount(Number(e.target.value))}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 dark:text-white font-bold focus:ring-2 focus:ring-blue-500 outline-none text-xs"
                />
              </div>

              {/* 3.1 Transaction Number (Requirement 6: Anti-Duplicate Protection) */}
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  {language === 'ky' ? 'Транзакция / квитанция номери *' : 'Номер транзакции / квитанции *'}
                </label>
                <input
                  type="text"
                  required
                  value={transactionNumber}
                  onChange={(e) => setTransactionNumber(e.target.value)}
                  placeholder={language === 'ky' ? 'Мисалы: 20260924123456 же MBank коду' : 'Например: 20260924123456'}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 dark:text-white font-mono font-medium focus:ring-2 focus:ring-blue-500 outline-none text-xs"
                />
                <span className="text-[10px] text-slate-400 mt-0.5 block">
                  {language === 'ky'
                    ? 'Чектеги транзакциянын же буйрутманын номерин жазыңыз'
                    : 'Укажите номер транзакции из мобильного банка для сверки'}
                </span>
              </div>

              {/* 4. Screenshot Upload */}
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  {language === 'ky' ? 'Төлөм чегинин скриншоту *' : 'Скриншот чека об оплате *'}
                </label>
                
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*,application/pdf"
                  onChange={handleFileChange}
                  className="hidden"
                />

                {receiptImage ? (
                  <div className="p-3 bg-emerald-50/80 dark:bg-emerald-950/40 border-2 border-emerald-300 dark:border-emerald-800 rounded-2xl flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2.5 overflow-hidden">
                      <img
                        src={receiptImage}
                        alt="Receipt Preview"
                        className="w-12 h-12 rounded-lg object-cover border border-emerald-200 dark:border-emerald-700 shrink-0"
                      />
                      <div className="truncate">
                        <span className="font-bold text-slate-900 dark:text-white block truncate text-[11px]">
                          {receiptFileName || 'Чек скриншоту'}
                        </span>
                        <span className="text-[10px] text-emerald-700 dark:text-emerald-400 font-semibold flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3" /> Жүктөлдү
                        </span>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="px-2.5 py-1 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 text-[11px] font-semibold hover:bg-slate-50 transition-colors shrink-0"
                    >
                      {language === 'ky' ? 'Алмаштыруу' : 'Заменить'}
                    </button>
                  </div>
                ) : (
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    className="p-4 border-2 border-dashed border-blue-300 dark:border-blue-800 hover:border-blue-500 rounded-2xl text-center bg-blue-50/40 dark:bg-blue-950/20 cursor-pointer transition-colors space-y-1.5"
                  >
                    <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/60 text-blue-600 dark:text-blue-400 flex items-center justify-center mx-auto">
                      <UploadCloud className="w-5 h-5" />
                    </div>
                    <div>
                      <span className="font-bold text-blue-700 dark:text-blue-400 text-xs block">
                        {language === 'ky' ? 'Скриншот жүктөө үчүн басыңыз' : 'Нажмите для загрузки скриншота'}
                      </span>
                      <span className="text-[10px] text-slate-500">
                        {language === 'ky' ? 'MBANK чеги, квитанция (JPG, PNG же PDF)' : 'Чек из MBANK, квитанция (JPG, PNG или PDF)'}
                      </span>
                    </div>
                  </div>
                )}
              </div>

              {/* 5. Mandatory Public Offer Acceptance Checkbox (Requirements 9 & 10) */}
              <div className="pt-1">
                <label className="flex items-start gap-2.5 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    required
                    checked={agreeOffer}
                    onChange={(e) => setAgreeOffer(e.target.checked)}
                    className="mt-0.5 rounded border-slate-300 text-blue-600 focus:ring-blue-500 h-4 w-4"
                  />
                  <span className="text-[11px] text-slate-600 dark:text-slate-300 leading-snug">
                    {language === 'ky' ? (
                      <>
                        <span className="font-semibold text-slate-900 dark:text-white">ОсОО «Билет Центр»</span> компаниясынын{' '}
                        <button
                          type="button"
                          onClick={() => {
                            setIsPaymentModalOpen(false);
                            navigate('terms');
                          }}
                          className="text-blue-600 underline font-semibold hover:text-blue-700"
                        >
                          Публичная офертасын
                        </button>{' '}
                        жана пайдалануу шарттарын толук кабыл алам.
                      </>
                    ) : (
                      <>
                        Я принимаю условия{' '}
                        <button
                          type="button"
                          onClick={() => {
                            setIsPaymentModalOpen(false);
                            navigate('terms');
                          }}
                          className="text-blue-600 underline font-semibold hover:text-blue-700"
                        >
                          Публичной оферты
                        </button>{' '}
                        и правила оказания услуг ОсОО «Билет Центр».
                      </>
                    )}
                  </span>
                </label>
              </div>
            </div>

            {receiptFormError && (
              <div className="p-2.5 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 rounded-xl text-xs text-rose-700 dark:text-rose-300 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
                <span>{receiptFormError}</span>
              </div>
            )}

            <div className="pt-2 flex items-center gap-2.5">
              <button
                type="button"
                onClick={() => setModalStep('qr')}
                className="w-1/3 py-3 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 font-bold text-xs hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors cursor-pointer"
              >
                {language === 'ky' ? 'Артка' : 'Назад'}
              </button>
              <button
                type="submit"
                disabled={isSubmittingReceipt}
                className="w-2/3 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-bold text-xs sm:text-sm shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                {isSubmittingReceipt ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>{language === 'ky' ? 'Жөнөтүлүүдө...' : 'Отправка...'}</span>
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-4 h-4" />
                    <span>{language === 'ky' ? 'Текшерүүгө жөнөтүү' : 'Отправить на проверку'}</span>
                  </>
                )}
              </button>
            </div>
          </form>
        )}

        {/* STEP 1: MAIN QR PAYMENT PAGE */}
        {modalStep === 'qr' && (
          <div className="space-y-4">

            {/* SEPARATE OFFICIAL LEGAL PAYEE BLOCK */}
            <div id="legal-payee-box" className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-1">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-slate-500 dark:text-slate-400">
                  {language === 'ky' ? 'Төлөм алуучу:' : 'Получатель платежа:'}
                </span>
                <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 dark:text-emerald-400 bg-emerald-100 dark:bg-emerald-950/60 px-2 py-0.5 rounded-full border border-emerald-200 dark:border-emerald-800">
                  <ShieldCheck className="w-3 h-3" />
                  {language === 'ky' ? 'Расмий юридикалык жак' : 'Официальное юр. лицо'}
                </span>
              </div>
              <p className="text-sm sm:text-base font-black text-slate-900 dark:text-white tracking-wide">
                ОсОО «Билет Центр»
              </p>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-snug">
                {language === 'ky'
                  ? '«ОРТ ОНЛАЙН KG» кызматы үчүн бардык төлөмдөр расмий алуучу ОсОО «Билет Центр» эсебине түшөт.'
                  : 'Все платежи за сервис «ОРТ ОНЛАЙН KG» официально принимаются на реквизиты ОсОО «Билет Центр».'}
              </p>
            </div>

            {/* SELECTED TARIFF & SUMMARY BOX */}
            <div id="tariff-details-box" className="p-3.5 rounded-2xl bg-blue-50/80 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900/60 space-y-2 text-xs">
              <div className="flex justify-between items-center">
                <span className="text-slate-600 dark:text-slate-400">{language === 'ky' ? 'Кызмат / Бренд:' : 'Сервис / Бренд:'}</span>
                <span className="font-extrabold text-blue-700 dark:text-blue-400">ОРТ ОНЛАЙН KG</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-600 dark:text-slate-400">{language === 'ky' ? 'Тарифтин аталышы:' : 'Тариф:'}</span>
                <span className="font-bold text-slate-900 dark:text-white">{selectedPlan.name[language]}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-600 dark:text-slate-400">{language === 'ky' ? 'Төлөм алуучу:' : 'Получатель:'}</span>
                <span className="font-bold text-slate-900 dark:text-white">ОсОО «Билет Центр»</span>
              </div>
              
              {appliedPromo && (
                <div className="flex justify-between items-center text-emerald-600 dark:text-emerald-400 font-semibold pt-1 border-t border-blue-200/50 dark:border-blue-800/50">
                  <span>{language === 'ky' ? 'Промокод жеңилдиги:' : 'Скидка по промокоду:'}</span>
                  <span>-{appliedPromo.discountAmount} сом ({appliedPromo.code})</span>
                </div>
              )}

              <div className="flex justify-between items-center pt-1.5 border-t border-blue-200/60 dark:border-blue-800/60">
                <span className="font-bold text-slate-800 dark:text-slate-200">{language === 'ky' ? 'Төлөнө турган сумма:' : 'Сумма к оплате:'}</span>
                <div className="text-right">
                  <span className="text-lg font-black text-blue-700 dark:text-blue-400">{finalPrice} сом</span>
                  {appliedPromo && (
                    <span className="block text-[10px] line-through text-slate-400">{basePrice} сом</span>
                  )}
                </div>
              </div>
            </div>

            {/* SCANNING INSTRUCTION & COMMISSION INFO */}
            <div className="space-y-2 text-xs">
              <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-200 dark:border-slate-700 flex items-start gap-2.5">
                <Smartphone className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <p className="font-bold text-slate-900 dark:text-white text-xs leading-snug">
                    MBANK / MBusiness колдонмосу аркылуу төмөнкү QR-кодду сканерлеп төлөңүз.
                  </p>
                  <div className="flex flex-wrap items-center gap-2 pt-0.5 text-[11px]">
                    <span className="inline-flex items-center px-2 py-0.5 rounded-md font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                      MBANK аркылуу комиссия: 0%
                    </span>
                    <span className="inline-flex items-center px-2 py-0.5 rounded-md font-medium bg-slate-100 text-slate-700 dark:bg-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-600">
                      Башка колдонмолор аркылуу комиссия: 1%
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* QR CODE CARD */}
            <div className="flex flex-col items-center justify-center p-4 bg-white dark:bg-slate-800 rounded-2xl border-2 border-dashed border-blue-300 dark:border-blue-900 shadow-xs space-y-3">
              {isFinikInitializing ? (
                <div className="h-44 w-44 flex flex-col items-center justify-center space-y-2">
                  <RefreshCw className="w-8 h-8 text-blue-600 animate-spin" />
                  <span className="text-xs text-slate-500 font-medium">QR-код түзүлүүдө...</span>
                </div>
              ) : (
                <>
                  <div className="p-3 bg-white rounded-2xl shadow-sm border border-slate-100">
                    <QRCodeSVG
                      value={nationalQrPayload}
                      size={190}
                      level="M"
                      includeMargin={false}
                    />
                  </div>

                  <div className="text-center space-y-1">
                    <div className="flex items-center justify-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 font-mono">
                      <span>Payment ID: {currentOrder?.paymentId ? `${currentOrder.paymentId.slice(0, 14)}...` : 'N/A'}</span>
                      <button
                        type="button"
                        onClick={handleCopyPaymentId}
                        className="p-1 hover:bg-slate-100 dark:hover:bg-slate-700 rounded text-slate-500 hover:text-slate-800 transition-colors"
                        title="ID көчүрүү"
                      >
                        {copiedId ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                    <p className="text-[11px] text-slate-500">
                      {language === 'ky' ? 'MBANK, Optima24, Bakai, Elkart ж.б. сканерлей аласыз' : 'Поддерживаются MBANK, Optima24, Bakai, Элкарт и др.'}
                    </p>
                  </div>
                </>
              )}
            </div>

            {/* MANDATORY PROMPT TEXT UNDER QR */}
            <div className="text-center p-2 rounded-xl bg-amber-50/80 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/60">
              <p className="text-xs font-bold text-amber-950 dark:text-amber-200">
                «Төлөм жүргүзгөндөн кийин “Мен төлөдүм” баскычын басыңыз»
              </p>
            </div>

            {/* «МЕН ТӨЛӨДҮМ» PROMINENT BUTTON */}
            <button
              id="btn-i-paid"
              type="button"
              onClick={() => setModalStep('receipt_form')}
              className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-extrabold text-sm sm:text-base shadow-lg shadow-emerald-600/20 transition-all flex items-center justify-center gap-2 cursor-pointer transform hover:-translate-y-0.5 active:translate-y-0"
            >
              <CheckCircle2 className="w-5 h-5 text-white" />
              <span>{language === 'ky' ? 'Мен төлөдүм' : 'Мен төлөдүм (Я оплатил)'}</span>
            </button>

            {/* PROMOCODE COLLAPSIBLE / INPUT SECTION */}
            <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
              {appliedPromo ? (
                <div className="p-2.5 bg-emerald-50/90 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800 rounded-xl flex items-center justify-between gap-3 text-xs">
                  <div className="flex items-center gap-2">
                    <Tag className="w-4 h-4 text-emerald-600" />
                    <div>
                      <span className="font-mono font-bold text-emerald-900 dark:text-emerald-200">{appliedPromo.code}</span>
                      <span className="text-[11px] text-emerald-700 dark:text-emerald-300 ml-1.5 font-semibold">
                        (-{appliedPromo.discountAmount} сом)
                      </span>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={handleRemovePromo}
                    className="px-2 py-0.5 rounded-md hover:bg-emerald-100 dark:hover:bg-emerald-900 text-emerald-800 dark:text-emerald-300 text-[11px] font-semibold transition-colors"
                  >
                    Алып салуу
                  </button>
                </div>
              ) : (
                <div className="space-y-1.5 text-xs">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={promoInput}
                      onChange={(e) => {
                        setPromoInput(e.target.value.toUpperCase());
                        if (promoError) setPromoError('');
                      }}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          handleApplyPromo();
                        }
                      }}
                      placeholder="Промокод (мисалы: ORT2026)"
                      className="flex-1 px-3 py-1.5 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 dark:text-white uppercase font-mono outline-none"
                    />
                    <button
                      type="button"
                      onClick={() => handleApplyPromo()}
                      disabled={isCheckingPromo || !promoInput.trim()}
                      className="px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-xs font-semibold transition-colors cursor-pointer"
                    >
                      {isCheckingPromo ? <RefreshCw className="w-3 h-3 animate-spin" /> : 'Колдонуу'}
                    </button>
                  </div>

                  {/* Quick promo suggestions */}
                  <div className="flex items-center gap-1.5 pt-1 text-[11px] text-slate-500 flex-wrap">
                    <span>{language === 'ky' ? 'Сунушталган код:' : 'Рекомендуемый промокод:'}</span>
                    {selectedPlan.id === 'standard' ? (
                      <>
                        <button
                          type="button"
                          onClick={() => handleApplyPromo('ORT50')}
                          className="px-2 py-0.5 rounded-md bg-amber-100 text-amber-900 font-bold hover:bg-amber-200 border border-amber-300 cursor-pointer"
                        >
                          ORT50 (-50%)
                        </button>
                        <button
                          type="button"
                          onClick={() => handleApplyPromo('ORT2026')}
                          className="px-2 py-0.5 rounded-md bg-blue-50 text-blue-700 font-bold hover:bg-blue-100 border border-blue-200 cursor-pointer"
                        >
                          ORT2026 (-50%)
                        </button>
                      </>
                    ) : (
                      <>
                        <button
                          type="button"
                          onClick={() => handleApplyPromo('PREMIUM70')}
                          className="px-2 py-0.5 rounded-md bg-rose-100 text-rose-900 font-bold hover:bg-rose-200 border border-rose-300 cursor-pointer"
                        >
                          PREMIUM70 (-70%)
                        </button>
                        <button
                          type="button"
                          onClick={() => handleApplyPromo('FULL2026')}
                          className="px-2 py-0.5 rounded-md bg-amber-100 text-amber-900 font-bold hover:bg-amber-200 border border-amber-300 cursor-pointer"
                        >
                          FULL2026 (-70%)
                        </button>
                      </>
                    )}
                  </div>

                  {promoError && (
                    <p className="text-[11px] text-rose-500 flex items-center gap-1">
                      <AlertCircle className="w-3 h-3 shrink-0" />
                      <span>{promoError}</span>
                    </p>
                  )}
                </div>
              )}
            </div>

            {/* ALTERNATIVE OPTIONS (Card payment & reserve) */}
            <div className="pt-2 text-center">
              <button
                type="button"
                onClick={() => setPaymentMethod(paymentMethod === 'card' ? (isFinikActive ? 'finik' : 'mbank_qr') : 'card')}
                className="text-[11px] text-slate-500 hover:text-blue-600 font-semibold transition-colors cursor-pointer inline-flex items-center gap-1"
              >
                <CreditCard className="w-3.5 h-3.5" />
                <span>{paymentMethod === 'card' ? 'QR-кодго кайтуу' : 'Башка ыкма: Банк картасы аркылуу төлөө'}</span>
              </button>
            </div>

            {/* CARD PAYMENT FORM IF USER CHOOSES ALTERNATIVE */}
            {paymentMethod === 'card' && (
              <div className="p-3 bg-slate-50 dark:bg-slate-800/70 rounded-2xl border border-slate-200 dark:border-slate-700 space-y-3 text-xs animate-in fade-in">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    {t.paymentCardNumber || 'Номер карты'}
                  </label>
                  <input
                    type="text"
                    value={cardNumber}
                    onChange={(e) => handleCardNumberChange(e.target.value)}
                    placeholder="4169 0000 0000 0000"
                    className="w-full px-3 py-2 text-xs font-mono rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 dark:text-white outline-none"
                  />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Мөөнөтү (ММ/ГГ)</label>
                    <input
                      type="text"
                      value={cardExpiry}
                      onChange={(e) => handleExpiryChange(e.target.value)}
                      placeholder="12/28"
                      className="w-full px-3 py-2 text-xs font-mono rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 dark:text-white outline-none"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">CVV / CVC</label>
                    <input
                      type="password"
                      maxLength={4}
                      value={cardCvc}
                      onChange={(e) => setCardCvc(e.target.value.replace(/\D/g, ''))}
                      placeholder="•••"
                      className="w-full px-3 py-2 text-xs font-mono rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 dark:text-white outline-none"
                    />
                  </div>
                </div>
                <button
                  type="button"
                  onClick={handleCardPay}
                  disabled={isProcessing || cardNumber.replace(/\s+/g, '').length < 16}
                  className="w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-bold text-xs shadow-md transition-all cursor-pointer"
                >
                  {isProcessing ? 'Төлөм аткарылууда...' : `Карта менен төлөө: ${finalPrice} сом`}
                </button>
              </div>
            )}

            {/* Sandbox simulation button for development environment */}
            {currentOrder?.environment !== 'production' && (
              <div className="pt-1">
                <button
                  type="button"
                  id="btn-simulate-webhook-modal"
                  onClick={async () => {
                    if (!currentOrder?.paymentId) return;
                    const res = await simulateFinikWebhookSuccess(currentOrder.paymentId);
                    if (res) {
                      setCurrentOrder(res);
                      setModalStep('paid_success');
                      try { confetti({ particleCount: 70, spread: 60 }); } catch (e) {}
                    }
                  }}
                  className="w-full py-2 px-3 rounded-xl border border-emerald-300 dark:border-emerald-800 bg-emerald-50/70 dark:bg-emerald-950/30 text-emerald-800 dark:text-emerald-300 text-[11px] font-semibold hover:bg-emerald-100 transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <span>⚡</span>
                  <span>Тест (Sandbox): МБАНК төлөмүн симуляциялоо (PAID)</span>
                </button>
              </div>
            )}

          </div>
        )}

      </div>
    </div>
  );
};
