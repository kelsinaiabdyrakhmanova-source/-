import React, { useEffect, useState } from 'react';
import { useApp } from '../context/AppContext';
import { CheckCircle2, Clock, XCircle, ArrowRight, RefreshCw, MessageSquare, Copy, Check, ExternalLink } from 'lucide-react';
import { FinikPaymentOrder } from '../types';

interface PaymentResultViewProps {
  status: 'pending' | 'success' | 'failed';
  paymentId?: string;
}

export const PaymentResultView: React.FC<PaymentResultViewProps> = ({ status: initialStatus, paymentId: initialPaymentId }) => {
  const { t, language, activeFinikOrder, checkFinikStatus, simulateFinikWebhookSuccess, navigate, openPayment, selectedPlan } = useApp();
  
  const paymentId = initialPaymentId || activeFinikOrder?.paymentId || '';
  const [currentStatus, setCurrentStatus] = useState<'pending' | 'success' | 'failed'>(initialStatus);
  const [order, setOrder] = useState<FinikPaymentOrder | null>(activeFinikOrder);
  const [isChecking, setIsChecking] = useState<boolean>(false);
  const [copied, setCopied] = useState<boolean>(false);

  // Auto-polling when in pending state (every 3 seconds)
  useEffect(() => {
    if (currentStatus !== 'pending' || !paymentId) return;

    let isMounted = true;
    const interval = setInterval(async () => {
      try {
        const updated = await checkFinikStatus(paymentId);
        if (!isMounted) return;
        if (updated) {
          setOrder(updated);
          if (updated.paymentStatus === 'PAID') {
            setCurrentStatus('success');
            clearInterval(interval);
          } else if (updated.paymentStatus === 'FAILED' || updated.paymentStatus === 'CANCELLED' || updated.paymentStatus === 'EXPIRED') {
            setCurrentStatus('failed');
            clearInterval(interval);
          }
        }
      } catch (err) {
        console.error('Polling error:', err);
      }
    }, 3000);

    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, [currentStatus, paymentId, checkFinikStatus]);

  const handleManualCheck = async () => {
    if (!paymentId) return;
    setIsChecking(true);
    try {
      const updated = await checkFinikStatus(paymentId);
      if (updated) {
        setOrder(updated);
        if (updated.paymentStatus === 'PAID') {
          setCurrentStatus('success');
        } else if (updated.paymentStatus === 'FAILED' || updated.paymentStatus === 'CANCELLED') {
          setCurrentStatus('failed');
        }
      }
    } finally {
      setIsChecking(false);
    }
  };

  const handleCopyId = () => {
    if (!paymentId) return;
    navigator.clipboard.writeText(paymentId);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const whatsappPhone = '+996700000001';
  const whatsappText = encodeURIComponent(
    `${t.finikWhatsAppSupportText || 'Здравствуйте. У меня проблема с оплатой подписки. Payment ID: '}${paymentId}`
  );
  const whatsappUrl = `https://wa.me/${whatsappPhone.replace(/[^0-9]/g, '')}?text=${whatsappText}`;

  return (
    <div id="payment-result-container" className="min-h-[75vh] flex items-center justify-center py-12 px-4">
      <div className="w-full max-w-xl bg-white dark:bg-slate-900 rounded-3xl p-8 shadow-xl border border-slate-200 dark:border-slate-800">
        
        {/* PENDING VIEW */}
        {currentStatus === 'pending' && (
          <div id="payment-status-pending" className="text-center space-y-6">
            <div className="w-20 h-20 mx-auto rounded-full bg-amber-100 dark:bg-amber-950/60 border border-amber-300 dark:border-amber-800 flex items-center justify-center">
              <Clock className="w-10 h-10 text-amber-600 dark:text-amber-400 animate-pulse" />
            </div>

            <div className="space-y-2">
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
                {t.paymentPendingTitle || 'Проверка статуса оплаты...'}
              </h2>
              <p className="text-slate-600 dark:text-slate-300 text-sm max-w-md mx-auto leading-relaxed">
                {language === 'ky'
                  ? 'Төлөмдүн тастыкталышы күтүлүүдө. Чек текшерилгенден кийин подписка автоматтык түрдө активдешет.'
                  : 'Ожидаем подтверждения платежа. Подписка активируется сразу после успешной проверки чека.'}
              </p>
            </div>

            {/* Order Mini Info */}
            {paymentId && (
              <div className="bg-slate-50 dark:bg-slate-800/60 rounded-2xl p-4 border border-slate-200 dark:border-slate-700 text-left space-y-2 text-sm">
                <div className="flex justify-between items-center text-slate-600 dark:text-slate-400">
                  <span>Payment ID:</span>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-semibold text-slate-800 dark:text-slate-200 truncate max-w-[180px]">
                      {paymentId}
                    </span>
                    <button
                      onClick={handleCopyId}
                      className="p-1 hover:bg-slate-200 dark:hover:bg-slate-700 rounded text-slate-500"
                      title={t.finikCopyPaymentId}
                    >
                      {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>
                {order && (
                  <>
                    <div className="flex justify-between text-slate-600 dark:text-slate-400">
                      <span>{t.paymentSuccessPlanLabel || 'Тариф:'}</span>
                      <span className="font-semibold text-slate-900 dark:text-white">{order.tariffName}</span>
                    </div>
                    <div className="flex justify-between text-slate-600 dark:text-slate-400">
                      <span>{t.paymentSuccessAmountLabel || 'Сумма:'}</span>
                      <span className="font-bold text-emerald-600 dark:text-emerald-400">{order.amount} {order.currency}</span>
                    </div>
                  </>
                )}
              </div>
            )}

            {/* Actions */}
            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <button
                id="btn-check-payment-status"
                onClick={handleManualCheck}
                disabled={isChecking}
                className="flex-1 py-3 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm flex items-center justify-center gap-2 shadow-md hover:shadow-lg transition-all disabled:opacity-50"
              >
                <RefreshCw className={`w-4 h-4 ${isChecking ? 'animate-spin' : ''}`} />
                {t.paymentPendingBtnCheck || 'Проверить статус сейчас'}
              </button>

              {/* Developer Sandbox Simulation Button */}
              {order?.environment !== 'production' && paymentId && (
                <button
                  id="btn-simulate-webhook-success"
                  onClick={async () => {
                    const res = await simulateFinikWebhookSuccess(paymentId);
                    if (res) {
                      setOrder(res);
                      setCurrentStatus('success');
                    }
                  }}
                  className="py-3 px-4 rounded-xl border border-emerald-500/50 bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-300 font-medium text-xs hover:bg-emerald-100 transition-colors"
                >
                  ⚡ Симулировать PAID Webhook
                </button>
              )}
            </div>

            {/* Support link */}
            <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-xs font-medium text-slate-500 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors"
              >
                <MessageSquare className="w-3.5 h-3.5 text-emerald-500" />
                Служба заботы ОРТ Онлайн (WhatsApp)
              </a>
            </div>
          </div>
        )}

        {/* SUCCESS VIEW */}
        {currentStatus === 'success' && (
          <div id="payment-status-success" className="text-center space-y-6">
            <div className="w-20 h-20 mx-auto rounded-full bg-emerald-100 dark:bg-emerald-950/60 border border-emerald-300 dark:border-emerald-700 flex items-center justify-center shadow-lg shadow-emerald-500/10">
              <CheckCircle2 className="w-10 h-10 text-emerald-600 dark:text-emerald-400" />
            </div>

            <div className="space-y-2">
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
                {t.paymentSuccessTitle || 'Оплата успешно получена! 🎉'}
              </h2>
              <p className="text-slate-600 dark:text-slate-300 text-sm">
                {t.paymentSuccessSubtitle || 'Ваша подписка успешно активирована.'}
              </p>
            </div>

            {/* Details Box */}
            <div className="bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800/40 rounded-2xl p-5 text-left space-y-3">
              <div className="flex justify-between items-center text-sm">
                <span className="text-slate-600 dark:text-slate-400">{t.paymentSuccessPlanLabel || 'Тариф:'}</span>
                <span className="font-bold text-slate-900 dark:text-white">
                  {order?.tariffName || selectedPlan?.name[language] || 'Стандарт'}
                </span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-slate-600 dark:text-slate-400">{t.paymentSuccessAmountLabel || 'Сумма:'}</span>
                <span className="font-bold text-emerald-600 dark:text-emerald-400">
                  {order?.amount || selectedPlan?.price || 490} сом
                </span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-slate-600 dark:text-slate-400">{t.paymentSuccessValidUntilLabel || 'Действует до:'}</span>
                <span className="font-semibold text-slate-800 dark:text-slate-200">
                  {order?.expiresAt
                    ? new Date(order.expiresAt).toLocaleDateString()
                    : new Date(Date.now() + 30 * 86400000).toLocaleDateString()}
                </span>
              </div>
              {paymentId && (
                <div className="pt-2 border-t border-emerald-200/50 dark:border-emerald-800/30 flex justify-between items-center text-xs text-slate-500">
                  <span>Payment ID:</span>
                  <span className="font-mono">{paymentId}</span>
                </div>
              )}
            </div>

            {/* Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <button
                id="btn-start-learning-success"
                onClick={() => navigate('prep')}
                className="flex-1 py-3 px-5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm flex items-center justify-center gap-2 shadow-md hover:shadow-lg transition-all"
              >
                {t.paymentSuccessBtnStart || 'Начать обучение'}
                <ArrowRight className="w-4 h-4" />
              </button>
              <button
                id="btn-goto-cabinet-success"
                onClick={() => navigate('student-cabinet')}
                className="py-3 px-5 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 font-semibold text-sm transition-colors"
              >
                {t.paymentSuccessBtnCabinet || 'Перейти в личный кабинет'}
              </button>
            </div>
          </div>
        )}

        {/* FAILED VIEW */}
        {currentStatus === 'failed' && (
          <div id="payment-status-failed" className="text-center space-y-6">
            <div className="w-20 h-20 mx-auto rounded-full bg-rose-100 dark:bg-rose-950/60 border border-rose-300 dark:border-rose-700 flex items-center justify-center">
              <XCircle className="w-10 h-10 text-rose-600 dark:text-rose-400" />
            </div>

            <div className="space-y-2">
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
                {t.paymentFailedTitle || 'Оплата не завершена'}
              </h2>
              <p className="text-slate-600 dark:text-slate-300 text-sm max-w-md mx-auto leading-relaxed">
                {t.paymentFailedDesc || 'Деньги не были подтверждены платежной системой. Попробуйте снова или выберите другой способ оплаты.'}
              </p>
            </div>

            {paymentId && (
              <div className="bg-slate-50 dark:bg-slate-800/60 rounded-xl p-3 border border-slate-200 dark:border-slate-700 text-xs text-slate-500 font-mono">
                Payment ID: {paymentId}
              </div>
            )}

            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <button
                id="btn-retry-payment-failed"
                onClick={() => {
                  if (selectedPlan) {
                    openPayment(selectedPlan);
                  } else {
                    navigate('pricing');
                  }
                }}
                className="flex-1 py-3 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm flex items-center justify-center gap-2 shadow-md transition-all"
              >
                <RefreshCw className="w-4 h-4" />
                {t.paymentFailedBtnRetry || 'Повторить оплату'}
              </button>
              <button
                id="btn-other-payment-method"
                onClick={() => navigate('pricing')}
                className="py-3 px-4 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 font-semibold text-sm transition-colors"
              >
                {t.paymentFailedBtnOther || 'Выбрать другой способ'}
              </button>
            </div>

            {/* WhatsApp Support Help */}
            <div className="pt-3 border-t border-slate-100 dark:border-slate-800">
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-xs font-medium text-emerald-600 dark:text-emerald-400 hover:underline"
              >
                <MessageSquare className="w-4 h-4" />
                Связаться с поддержкой в WhatsApp: Payment ID {paymentId || '—'}
              </a>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
