import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { api } from '../services/api';
import { FinikPaymentOrder } from '../types';
import {
  CreditCard,
  TrendingUp,
  Users,
  CheckCircle2,
  Clock,
  XCircle,
  RefreshCw,
  Search,
  Filter,
  Copy,
  Check,
  ExternalLink,
  ShieldCheck,
  Zap,
  ArrowUpRight,
  MessageSquare,
  Send,
  X,
  Eye,
  FileText,
  AlertTriangle,
  Building2,
  ThumbsUp,
  ThumbsDown,
  Download,
  AlertCircle
} from 'lucide-react';

export const AdminPaymentsTab: React.FC = () => {
  const { language, t, showToast, simulateFinikWebhookSuccess } = useApp();

  const [orders, setOrders] = useState<FinikPaymentOrder[]>([]);
  const [stats, setStats] = useState<{
    todayPaidCount: number;
    totalRevenueSom: number;
    activeSubscriptionsCount: number;
    totalTransactionsCount: number;
  }>({
    todayPaidCount: 0,
    totalRevenueSom: 0,
    activeSubscriptionsCount: 0,
    totalTransactionsCount: 0
  });

  const [loading, setLoading] = useState(false);
  const [statusFilter, setStatusFilter] = useState<'all' | 'UNDER_REVIEW' | 'PAID' | 'PENDING' | 'REJECTED' | 'FAILED'>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Receipt inspection modal state
  const [selectedReceiptOrder, setSelectedReceiptOrder] = useState<FinikPaymentOrder | null>(null);
  const [isProcessingAction, setIsProcessingAction] = useState(false);

  // Rejection modal prompt state
  const [rejectingOrder, setRejectingOrder] = useState<FinikPaymentOrder | null>(null);
  const [rejectionReasonInput, setRejectionReasonInput] = useState('Чек дал келбейт же так эмес');

  // Telegram notification testing state
  const [isTgModalOpen, setIsTgModalOpen] = useState(false);
  const [tgTesting, setTgTesting] = useState(false);
  const [tgResult, setTgResult] = useState<{ success?: boolean; sent?: boolean; message?: string; warning?: string } | null>(null);

  // WhatsApp reminder testing state
  const [isWaModalOpen, setIsWaModalOpen] = useState(false);
  const [waReminderType, setWaReminderType] = useState<'3_days' | '1_day' | 'expired'>('3_days');
  const [waTestPhone, setWaTestPhone] = useState('+996 700 891 234');
  const [waSending, setWaSending] = useState(false);
  const [waResult, setWaResult] = useState<any>(null);

  const fetchOrdersAndStats = async () => {
    setLoading(true);
    try {
      const [fetchedOrders, fetchedStats] = await Promise.all([
        api.getPaymentOrders(),
        api.getPaymentStats()
      ]);
      setOrders(fetchedOrders);
      setStats(fetchedStats);
    } catch (err) {
      console.error('Failed to load payment admin data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrdersAndStats();
  }, []);

  const handleCopyId = (id: string) => {
    navigator.clipboard.writeText(id);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Confirm / Verify payment action
  const handleConfirmPayment = async (paymentId: string) => {
    setIsProcessingAction(true);
    try {
      const res = await api.adminConfirmPayment(paymentId, 'Администратор');
      showToast(
        language === 'ky'
          ? 'Төлөм ийгиликтүү тастыкталды! ОРТ Онлайн кызматы активдештирилди.'
          : 'Платеж успешно подтвержден! Подписка активирована.',
        'success'
      );
      setSelectedReceiptOrder(null);
      await fetchOrdersAndStats();
    } catch (err: any) {
      showToast(err.message || 'Тастыктоодо ката кетти', 'error');
    } finally {
      setIsProcessingAction(false);
    }
  };

  // Reject payment action
  const handleExecuteReject = async () => {
    if (!rejectingOrder) return;
    setIsProcessingAction(true);
    try {
      await api.adminRejectPayment(rejectingOrder.paymentId, rejectionReasonInput.trim(), 'Администратор');
      showToast(
        language === 'ky' ? 'Төлөм четке кагылды' : 'Платеж отклонен',
        'info'
      );
      setRejectingOrder(null);
      setSelectedReceiptOrder(null);
      await fetchOrdersAndStats();
    } catch (err: any) {
      showToast(err.message || 'Четке кагууда ката кетти', 'error');
    } finally {
      setIsProcessingAction(false);
    }
  };

  const handleSimulateWebhook = async (paymentId: string) => {
    try {
      const updated = await simulateFinikWebhookSuccess(paymentId);
      if (updated) {
        showToast(
          language === 'ky'
            ? `Finik Webhook: Payment ${paymentId.slice(0, 8)}... ийгиликтүү PAID статусуна өттү!`
            : `Finik Webhook: Платеж ${paymentId.slice(0, 8)}... успешно переведен в PAID!`,
          'success'
        );
        await fetchOrdersAndStats();
      }
    } catch (err: any) {
      showToast(err.message || 'Ошибка симуляции вебхука', 'error');
    }
  };

  const underReviewCount = orders.filter((o) => o.paymentStatus === 'UNDER_REVIEW').length;

  const filteredOrders = orders.filter((o) => {
    const matchesStatus = statusFilter === 'all' || o.paymentStatus === statusFilter;
    const term = searchTerm.toLowerCase();
    const matchesSearch =
      o.paymentId.toLowerCase().includes(term) ||
      o.userPhone?.toLowerCase().includes(term) ||
      o.userName?.toLowerCase().includes(term) ||
      (o.payerName && o.payerName.toLowerCase().includes(term)) ||
      (o.payerPhone && o.payerPhone.toLowerCase().includes(term)) ||
      o.tariffName?.toLowerCase().includes(term);
    return matchesStatus && matchesSearch;
  });

  return (
    <div id="admin-payments-tab" className="space-y-6">
      {/* Top 4 Stats Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* 1. Today's Paid Orders */}
        <div className="p-5 bg-white rounded-2xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
            <span>{t.adminStatTodayPaid || 'Бүгүнкү төлөмдөр'}</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          </div>
          <p className="text-3xl font-black text-slate-900">{stats.todayPaidCount}</p>
          <span className="text-[11px] text-emerald-600 font-semibold flex items-center gap-1 mt-1">
            <ArrowUpRight className="w-3.5 h-3.5" />
            ОсОО «Билет Центр»
          </span>
        </div>

        {/* 2. Total Revenue */}
        <div className="p-5 bg-white rounded-2xl border-2 border-blue-600 shadow-md shadow-blue-600/10">
          <div className="flex items-center justify-between text-xs text-blue-700 font-bold mb-1">
            <span>{t.adminStatTotalRevenue || 'Жалпы түшкөн сумма'}</span>
            <TrendingUp className="w-4 h-4 text-blue-600" />
          </div>
          <p className="text-3xl font-black text-slate-900">
            {stats.totalRevenueSom.toLocaleString()} <span className="text-lg font-bold">сом</span>
          </p>
          <span className="text-[11px] text-slate-500 font-medium mt-1 block">
            {language === 'ky' ? 'MBANK QR & Карталар' : 'MBANK QR и Карты'}
          </span>
        </div>

        {/* 3. Under Review Badge Card */}
        <div className="p-5 bg-white rounded-2xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between text-xs text-amber-700 font-bold mb-1">
            <span>{language === 'ky' ? 'Текшерүүдөгү чектер' : 'Чеков на проверке'}</span>
            <Clock className="w-4 h-4 text-amber-600" />
          </div>
          <p className="text-3xl font-black text-amber-600">{underReviewCount}</p>
          <span className="text-[11px] text-amber-700 font-semibold mt-1 block">
            {language === 'ky' ? '«Мен төлөдүм» аркылуу жүктөлгөн' : 'Ожидают подтверждения'}
          </span>
        </div>

        {/* 4. Active Subscriptions */}
        <div className="p-5 bg-white rounded-2xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
            <span>{t.adminStatActiveSubs || 'Активдүү подпискалар'}</span>
            <Users className="w-4 h-4 text-purple-600" />
          </div>
          <p className="text-3xl font-black text-slate-900">{stats.activeSubscriptionsCount}</p>
          <span className="text-[11px] text-purple-700 font-medium mt-1 block">
            {language === 'ky' ? 'Премиум окуучулар' : 'Премиум учеников'}
          </span>
        </div>
      </div>

      {/* Header with Title and WhatsApp Reminder Button */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <span>{language === 'ky' ? 'Төлөмдөрдү башкаруу' : 'Управление платежами'}</span>
            <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-blue-100 text-blue-800">
              ОРТ Онлайн
            </span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            {language === 'ky'
              ? 'Төлөм алуучу: ОсОО «Билет Центр». MBANK жана башка банктар аркылуу түшкөн каражаттар.'
              : 'Получатель: ОсОО «Билет Центр». Платежи через MBANK и единый QR.'}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsTgModalOpen(true)}
            className="px-3.5 py-2 rounded-xl bg-blue-50 hover:bg-blue-100 border border-blue-300 text-blue-800 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <Send className="w-4 h-4 text-blue-600" />
            <span>Telegram тест</span>
          </button>

          <button
            onClick={() => setIsWaModalOpen(true)}
            className="px-3 py-2 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-600 text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <MessageSquare className="w-3.5 h-3.5 text-slate-400" />
            <span>WhatsApp</span>
          </button>

          <button
            onClick={fetchOrdersAndStats}
            disabled={loading}
            className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>{language === 'ky' ? 'Жаңылоо' : 'Обновить'}</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-2xs flex flex-col sm:flex-row gap-3 items-center justify-between">
        <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
          <button
            onClick={() => setStatusFilter('all')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors whitespace-nowrap cursor-pointer ${
              statusFilter === 'all'
                ? 'bg-slate-900 text-white'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            {t.adminFilterAll || 'Бардыгы'} ({orders.length})
          </button>

          {/* Under Review Tab */}
          <button
            onClick={() => setStatusFilter('UNDER_REVIEW')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
              statusFilter === 'UNDER_REVIEW'
                ? 'bg-amber-600 text-white shadow-xs'
                : 'bg-amber-50 text-amber-800 hover:bg-amber-100 border border-amber-200'
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            <span>{language === 'ky' ? 'Текшерүүдө' : 'На проверке'}</span>
            {underReviewCount > 0 && (
              <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-black ${
                statusFilter === 'UNDER_REVIEW' ? 'bg-white text-amber-700' : 'bg-amber-600 text-white'
              }`}>
                {underReviewCount}
              </span>
            )}
          </button>

          {/* Paid Tab */}
          <button
            onClick={() => setStatusFilter('PAID')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
              statusFilter === 'PAID'
                ? 'bg-emerald-600 text-white'
                : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
            }`}
          >
            <CheckCircle2 className="w-3.5 h-3.5" />
            {t.adminFilterPaid || 'Ийгиликтүү'} ({orders.filter((o) => o.paymentStatus === 'PAID').length})
          </button>

          {/* Pending Tab */}
          <button
            onClick={() => setStatusFilter('PENDING')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
              statusFilter === 'PENDING'
                ? 'bg-blue-600 text-white'
                : 'bg-blue-50 text-blue-700 hover:bg-blue-100'
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            {t.adminFilterPending || 'Күтүлүүдө'} ({orders.filter((o) => o.paymentStatus === 'PENDING').length})
          </button>

          {/* Rejected Tab */}
          <button
            onClick={() => setStatusFilter('REJECTED')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
              statusFilter === 'REJECTED'
                ? 'bg-rose-600 text-white'
                : 'bg-rose-50 text-rose-700 hover:bg-rose-100'
            }`}
          >
            <XCircle className="w-3.5 h-3.5" />
            <span>{language === 'ky' ? 'Четке кагылган' : 'Отклонено'}</span> ({orders.filter((o) => o.paymentStatus === 'REJECTED').length})
          </button>
        </div>

        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder={language === 'ky' ? 'Издөө: телефон, Payment ID, ат...' : 'Поиск: телефон, ID, имя...'}
            className="w-full pl-9 pr-3 py-1.5 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-600">
            <thead className="bg-slate-50 text-[11px] font-bold text-slate-500 uppercase tracking-wider border-b border-slate-200">
              <tr>
                <th className="py-3.5 px-4">{t.finikColDateTime || 'Дата / Убакыт'}</th>
                <th className="py-3.5 px-4">{t.finikColUser || 'Колдонуучу'}</th>
                <th className="py-3.5 px-4">{t.finikColPlan || 'Тариф'}</th>
                <th className="py-3.5 px-4">{t.finikColAmount || 'Сумма'}</th>
                <th className="py-3.5 px-4">Төлөм алуучу</th>
                <th className="py-3.5 px-4">{t.finikColStatus || 'Статус'}</th>
                <th className="py-3.5 px-4">Чек (Скриншот)</th>
                <th className="py-3.5 px-4 text-right">{language === 'ky' ? 'Аракеттер' : 'Действия'}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-400">
                    {language === 'ky' ? 'Төлөмдөр табылган жок' : 'Транзакции не найдены'}
                  </td>
                </tr>
              ) : (
                filteredOrders.map((order) => {
                  const dateStr = new Date(order.createdAt).toLocaleString(
                    language === 'ky' ? 'ky-KG' : 'ru-RU',
                    { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' }
                  );

                  return (
                    <tr key={order.paymentId} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3.5 px-4 whitespace-nowrap font-medium text-slate-700">
                        {dateStr}
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="font-bold text-slate-900 flex items-center gap-1.5 flex-wrap">
                          <span>{order.payerName || order.userName || 'Окуучу'}</span>
                          {order.isDuplicateFlag && (
                            <span className="px-2 py-0.5 rounded-md bg-rose-100 text-rose-800 text-[10px] font-black border border-rose-300 flex items-center gap-1 shadow-2xs animate-pulse">
                              <AlertTriangle className="w-3 h-3 text-rose-600" />
                              <span>{language === 'ky' ? 'ДУБЛИКАТ ЧЕК' : 'ДУБЛИКАТ'}</span>
                            </span>
                          )}
                        </div>
                        <div className="text-[11px] text-slate-400 font-mono">
                          {order.payerPhone || order.userPhone || '+996 ...'}
                        </div>
                      </td>
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <span className="font-semibold text-slate-800">{order.tariffName}</span>
                      </td>
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <span className="font-black text-slate-900 text-sm">
                          {order.payerAmount || order.amount}
                        </span> {order.currency}
                      </td>
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-slate-100 text-slate-800 font-medium text-[11px] border border-slate-200">
                          <Building2 className="w-3 h-3 text-slate-500" />
                          ОсОО «Билет Центр»
                        </span>
                      </td>
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        {order.paymentStatus === 'UNDER_REVIEW' && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-900 font-bold text-[11px] border border-amber-300 animate-pulse">
                            <Clock className="w-3 h-3 text-amber-700" />
                            {language === 'ky' ? 'Текшерүүдө' : 'На проверке'}
                          </span>
                        )}
                        {order.paymentStatus === 'PAID' && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold text-[11px]">
                            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                            {language === 'ky' ? 'Тастыкталды' : 'Оплачено'}
                          </span>
                        )}
                        {order.paymentStatus === 'PENDING' && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-800 font-bold text-[11px]">
                            <Clock className="w-3 h-3 text-blue-600" />
                            {t.finikStatusPending || 'Күтүлүүдө'}
                          </span>
                        )}
                        {order.paymentStatus === 'REJECTED' && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-rose-100 text-rose-800 font-bold text-[11px]">
                            <XCircle className="w-3 h-3 text-rose-600" />
                            {language === 'ky' ? 'Четке кагылды' : 'Отклонено'}
                          </span>
                        )}
                        {order.paymentStatus === 'FAILED' && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-rose-50 text-rose-700 font-bold text-[11px]">
                            <XCircle className="w-3 h-3 text-rose-500" />
                            {t.finikStatusFailed || 'Ката'}
                          </span>
                        )}
                      </td>

                      {/* Receipt column */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        {order.receiptUrl ? (
                          <button
                            type="button"
                            onClick={() => setSelectedReceiptOrder(order)}
                            className="px-2.5 py-1 rounded-lg bg-blue-50 hover:bg-blue-100 border border-blue-200 text-blue-700 font-bold text-[11px] inline-flex items-center gap-1 cursor-pointer transition-colors"
                          >
                            <Eye className="w-3.5 h-3.5" />
                            <span>{language === 'ky' ? 'Чекти көрүү' : 'Смотреть чек'}</span>
                          </button>
                        ) : (
                          <span className="text-slate-400 text-[11px] italic">Жүктөлгөн эмес</span>
                        )}
                      </td>

                      {/* Actions column */}
                      <td className="py-3.5 px-4 text-right whitespace-nowrap">
                        <div className="inline-flex items-center gap-1.5 justify-end">
                          {/* Confirm Button */}
                          {order.paymentStatus !== 'PAID' && (
                            <button
                              type="button"
                              onClick={() => handleConfirmPayment(order.paymentId)}
                              className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[11px] transition-colors inline-flex items-center gap-1 shadow-2xs cursor-pointer"
                              title="Тастыктоо (Подтвердить и активировать)"
                            >
                              <ThumbsUp className="w-3 h-3" />
                              <span>{language === 'ky' ? 'Тастыктоо' : 'Подтвердить'}</span>
                            </button>
                          )}

                          {/* Reject Button */}
                          {order.paymentStatus !== 'REJECTED' && (
                            <button
                              type="button"
                              onClick={() => {
                                setRejectingOrder(order);
                                setRejectionReasonInput('Чек дал келбейт же сумма туура эмес');
                              }}
                              className="px-2.5 py-1 rounded-lg bg-rose-50 hover:bg-rose-100 border border-rose-200 text-rose-700 font-bold text-[11px] transition-colors inline-flex items-center gap-1 cursor-pointer"
                              title="Четке кагуу (Отклонить)"
                            >
                              <ThumbsDown className="w-3 h-3" />
                              <span>{language === 'ky' ? 'Четке кагуу' : 'Отклонить'}</span>
                            </button>
                          )}

                          {/* Copy ID button */}
                          <button
                            type="button"
                            onClick={() => handleCopyId(order.paymentId)}
                            className="p-1 hover:bg-slate-200 rounded text-slate-400 hover:text-slate-700 cursor-pointer"
                            title="ID көчүрүү"
                          >
                            {copiedId === order.paymentId ? (
                              <Check className="w-3.5 h-3.5 text-emerald-600" />
                            ) : (
                              <Copy className="w-3.5 h-3.5" />
                            )}
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* FULL RECEIPT INSPECTION MODAL */}
      {selectedReceiptOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/75 p-4 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-lg w-full p-6 space-y-4 shadow-2xl border border-slate-200 dark:border-slate-800 max-h-[92vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center font-bold">
                  <FileText className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-sm sm:text-base text-slate-900 dark:text-white">
                    {language === 'ky' ? 'Төлөм чегин текшерүү' : 'Проверка чека об оплате'}
                  </h3>
                  <span className="text-[11px] text-slate-500 font-mono">
                    ID: {selectedReceiptOrder.paymentId}
                  </span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSelectedReceiptOrder(null)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Receipt Summary Details */}
            <div className="grid grid-cols-2 gap-2 text-xs bg-slate-50 dark:bg-slate-800/60 p-3 rounded-2xl border border-slate-200 dark:border-slate-700">
              <div>
                <span className="text-[10px] text-slate-400 uppercase font-semibold block">Төлөөчү:</span>
                <span className="font-bold text-slate-900 dark:text-white">
                  {selectedReceiptOrder.payerName || selectedReceiptOrder.userName}
                </span>
                <span className="text-[11px] font-mono text-slate-500 block">
                  {selectedReceiptOrder.payerPhone || selectedReceiptOrder.userPhone}
                </span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 uppercase font-semibold block">Тариф жана сумма:</span>
                <span className="font-bold text-slate-900 dark:text-white">
                  {selectedReceiptOrder.tariffName}
                </span>
                <span className="text-sm font-black text-emerald-600 block">
                  {selectedReceiptOrder.payerAmount || selectedReceiptOrder.amount} сом
                </span>
              </div>
              <div className="col-span-2 pt-1 border-t border-slate-200 dark:border-slate-700 flex justify-between items-center text-[11px]">
                <span className="text-slate-500">Төлөм алуучу:</span>
                <span className="font-bold text-slate-800 dark:text-slate-200">ОсОО «Билет Центр»</span>
              </div>
            </div>

            {/* Receipt Image */}
            <div className="border border-slate-200 dark:border-slate-700 rounded-2xl overflow-hidden bg-slate-950 flex items-center justify-center max-h-[350px]">
              {selectedReceiptOrder.receiptUrl ? (
                <img
                  src={selectedReceiptOrder.receiptUrl}
                  alt="Receipt Screenshot"
                  className="max-h-[350px] w-auto object-contain"
                />
              ) : (
                <div className="py-12 text-slate-400 text-xs">Чек скриншоту жүктөлгөн эмес</div>
              )}
            </div>

            {/* Actions inside modal */}
            <div className="flex items-center gap-2 pt-1">
              <button
                type="button"
                onClick={() => {
                  setRejectingOrder(selectedReceiptOrder);
                  setRejectionReasonInput('Чек дал келбейт же сумма туура эмес');
                }}
                disabled={isProcessingAction}
                className="w-1/2 py-2.5 rounded-xl border border-rose-300 bg-rose-50 text-rose-700 font-bold text-xs hover:bg-rose-100 flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
              >
                <ThumbsDown className="w-4 h-4" />
                <span>{language === 'ky' ? 'Четке кагуу' : 'Отклонить'}</span>
              </button>

              <button
                type="button"
                onClick={() => handleConfirmPayment(selectedReceiptOrder.paymentId)}
                disabled={isProcessingAction}
                className="w-1/2 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md flex items-center justify-center gap-1.5 transition-all cursor-pointer"
              >
                <ThumbsUp className="w-4 h-4" />
                <span>{language === 'ky' ? 'Тастыктоо' : 'Подтвердить'}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* REJECTION REASON PROMPT MODAL */}
      {rejectingOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 p-4 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl border border-slate-200 dark:border-slate-800">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <h3 className="font-bold text-sm sm:text-base text-rose-600 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4" />
                <span>{language === 'ky' ? 'Төлөмдү четке кагуу' : 'Отклонение платежа'}</span>
              </h3>
              <button
                type="button"
                onClick={() => setRejectingOrder(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <p className="text-slate-600 dark:text-slate-300">
                {language === 'ky'
                  ? `Payment ID [${rejectingOrder.paymentId.slice(0, 8)}...] боюнча төлөмдү четке кагуу үчүн себепти көрсөтүңүз:`
                  : `Укажите причину отклонения платежа [${rejectingOrder.paymentId.slice(0, 8)}...]:`}
              </p>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  {language === 'ky' ? 'Себеби' : 'Причина'}
                </label>
                <input
                  type="text"
                  value={rejectionReasonInput}
                  onChange={(e) => setRejectionReasonInput(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 font-medium text-xs bg-white dark:bg-slate-800 dark:text-white outline-none"
                  placeholder="Мисалы: Чек дал келбейт же сумма кем"
                />
              </div>

              <div className="flex flex-wrap gap-1.5">
                {[
                  'Чек дал келбейт',
                  'Сумма туура эмес',
                  'Банктан төлөм түшкөн жок',
                  'Чек скриншоту окулбайт'
                ].map((preset) => (
                  <button
                    key={preset}
                    type="button"
                    onClick={() => setRejectionReasonInput(preset)}
                    className="px-2 py-0.5 rounded-md text-[10px] bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium cursor-pointer"
                  >
                    {preset}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setRejectingOrder(null)}
                className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 font-bold text-xs hover:bg-slate-50 cursor-pointer"
              >
                {language === 'ky' ? 'Жокко чыгаруу' : 'Отмена'}
              </button>
              <button
                type="button"
                onClick={handleExecuteReject}
                disabled={isProcessingAction}
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs shadow-md transition-colors cursor-pointer"
              >
                {isProcessingAction ? 'Сакталууда...' : 'Четке кагуу'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Telegram Notification Test Modal */}
      {isTgModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-md w-full shadow-2xl border border-slate-100 p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center">
                  <Send className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-sm">
                    {language === 'ky' ? 'Telegram билдирүүлөрдү текшерүү' : 'Проверка Telegram уведомлений'}
                  </h3>
                  <span className="text-[10px] text-slate-400 block">
                    TELEGRAM_BOT_TOKEN & TELEGRAM_CHAT_ID
                  </span>
                </div>
              </div>
              <button
                onClick={() => {
                  setIsTgModalOpen(false);
                  setTgResult(null);
                }}
                className="w-7 h-7 rounded-lg hover:bg-slate-100 text-slate-400 flex items-center justify-center cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <p className="text-slate-600 leading-relaxed">
                {language === 'ky'
                  ? 'Сайтта жаңы колдонуучу катталганда, MBank QR аркылуу төлөм чеги жүктөлгөндө же төлөм тастыкталганда администратордун Telegram-ботуна заматта билдирүү келет.'
                  : 'При регистрации нового ученика, загрузке чека MBank QR или подтверждении оплаты в админский Telegram-чат мгновенно отправляется отчет.'}
              </p>

              <div className="p-3 rounded-xl bg-blue-50/60 border border-blue-200 space-y-1.5">
                <div className="flex items-center justify-between font-semibold text-blue-900">
                  <span>Статус:</span>
                  <span className="text-[11px] font-mono bg-white px-2 py-0.5 rounded-md border border-blue-200">
                    TELEGRAM_ENABLED=true
                  </span>
                </div>
                <p className="text-[11px] text-blue-800">
                  {language === 'ky'
                    ? 'Боттун токени сервер тарапта гана коопсуз сакталат жана эч качан сыртка чыкпайт.'
                    : 'Токен бота хранится строго на сервере и никогда не попадает в браузер.'}
                </p>
              </div>

              {tgResult && (
                <div className={`p-3 rounded-xl border space-y-1.5 ${
                  tgResult.success
                    ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
                    : 'bg-amber-50 border-amber-200 text-amber-900'
                }`}>
                  <div className="flex items-center gap-1.5 font-bold">
                    {tgResult.success ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    ) : (
                      <AlertCircle className="w-4 h-4 text-amber-600" />
                    )}
                    <span>{tgResult.success ? 'Ийгиликтүү жөнөтүлдү' : 'Эскертүү'}</span>
                  </div>
                  <p className="text-[11px] leading-snug">
                    {tgResult.message || tgResult.warning}
                  </p>
                </div>
              )}
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => {
                  setIsTgModalOpen(false);
                  setTgResult(null);
                }}
                className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 font-bold text-xs hover:bg-slate-50 cursor-pointer"
              >
                {t.btnCancel || 'Жабуу'}
              </button>
              <button
                type="button"
                disabled={tgTesting}
                onClick={async () => {
                  setTgTesting(true);
                  try {
                    const res = await api.testTelegramNotification();
                    setTgResult(res);
                    if (res.success) {
                      showToast(
                        language === 'ky'
                          ? 'Telegram аркылуу тесттик билдирүү жөнөтүлдү!'
                          : 'Тестовое уведомление отправлено в Telegram!',
                        'success'
                      );
                    } else {
                      showToast(res.message || 'Ката', 'warning');
                    }
                  } catch (err: any) {
                    setTgResult({ success: false, message: err.message });
                    showToast(err.message || 'Error', 'error');
                  } finally {
                    setTgTesting(false);
                  }
                }}
                className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-xs flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
              >
                <Send className="w-3.5 h-3.5" />
                <span>{tgTesting ? 'Жөнөтүлүүдө...' : 'Тест билдирүүсүн жөнөтүү'}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* WhatsApp Expiry Reminder Test Modal */}
      {isWaModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 space-y-5 shadow-2xl border border-slate-100">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">
                  <MessageSquare className="w-4 h-4" />
                </div>
                <h3 className="font-bold text-sm sm:text-base text-slate-900">
                  {language === 'ky' ? 'WhatsApp эскертүүсүн симуляциялоо' : 'Тест WhatsApp напоминания'}
                </h3>
              </div>
              <button
                onClick={() => setIsWaModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  {language === 'ky' ? 'Эскертүү түрү' : 'Тип напоминания'}
                </label>
                <select
                  value={waReminderType}
                  onChange={(e) => setWaReminderType(e.target.value as any)}
                  className="w-full p-2.5 rounded-xl border border-slate-200 font-semibold"
                >
                  <option value="3_days">3 күн калды (3 дня до окончания)</option>
                  <option value="1_day">1 күн калды (Завтра заканчивается!)</option>
                  <option value="expired">Подписка аяктады (Истекла)</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  {language === 'ky' ? 'Телефон номери' : 'Номер телефона получателя'}
                </label>
                <input
                  type="text"
                  value={waTestPhone}
                  onChange={(e) => setWaTestPhone(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-200 font-mono"
                  placeholder="+996 700 891 234"
                />
              </div>

              {waResult && (
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                  <span className="font-bold text-slate-700 block">Билдирүү тексти (Текст сообщения):</span>
                  <pre className="text-[11px] text-slate-600 whitespace-pre-wrap font-sans bg-white p-2.5 rounded-lg border border-slate-100">
                    {waResult.previewText}
                  </pre>
                  <div className="text-[10px] text-emerald-700 font-semibold">
                    {waResult.delivered
                      ? '✓ WhatsApp Cloud API аркылуу жөнөтүлдү'
                      : 'ℹ️ Аудит логго жазылды'}
                  </div>
                </div>
              )}
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setIsWaModalOpen(false)}
                className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 font-bold text-xs hover:bg-slate-50 cursor-pointer"
              >
                {t.btnCancel || 'Жабуу'}
              </button>
              <button
                type="button"
                disabled={waSending}
                onClick={async () => {
                  setWaSending(true);
                  try {
                    const res = await api.sendWhatsAppExpiryReminder('user-demo-student', waReminderType, waTestPhone);
                    setWaResult(res);
                    showToast(
                      language === 'ky'
                        ? `WhatsApp эскертүүсү текшерилди (${waReminderType})`
                        : `WhatsApp напоминание проверено (${waReminderType})`
                    );
                  } catch (err: any) {
                    showToast(err.message || 'Error', 'error');
                  } finally {
                    setWaSending(false);
                  }
                }}
                className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-xs flex items-center gap-1.5 cursor-pointer"
              >
                <Send className="w-3.5 h-3.5" />
                <span>{waSending ? 'Жөнөтүлүүдө...' : 'Тестти иштетүү'}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
