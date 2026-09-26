import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { api } from '../services/api';
import { PromoCode, PromoCodeUsage } from '../types';
import {
  Tag,
  Plus,
  Percent,
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
  Edit2,
  Trash2,
  Calendar,
  AlertCircle,
  X,
  Sparkles,
  ShieldCheck,
  Layers,
  ArrowUpRight
} from 'lucide-react';

export const AdminPromocodesTab: React.FC = () => {
  const { language, t, showToast } = useApp();

  const [promos, setPromos] = useState<PromoCode[]>([]);
  const [usages, setUsages] = useState<PromoCodeUsage[]>([]);
  const [stats, setStats] = useState<{
    totalPromos: number;
    activePromos: number;
    totalUses: number;
    totalDiscountSom: number;
    totalRevenueSom: number;
  }>({
    totalPromos: 0,
    activePromos: 0,
    totalUses: 0,
    totalDiscountSom: 0,
    totalRevenueSom: 0
  });

  const [loading, setLoading] = useState(false);
  const [activeSubTab, setActiveSubTab] = useState<'promos' | 'usages'>('promos');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive' | 'expired'>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPromo, setEditingPromo] = useState<PromoCode | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  // Form State
  const [formCode, setFormCode] = useState('');
  const [formDiscountType, setFormDiscountType] = useState<'percentage' | 'fixed'>('percentage');
  const [formDiscountValue, setFormDiscountValue] = useState<number>(20);
  const [formValidUntil, setFormValidUntil] = useState('');
  const [formMaxUses, setFormMaxUses] = useState<string>('');
  const [formMinOrderAmount, setFormMinOrderAmount] = useState<string>('0');
  const [formIsActive, setFormIsActive] = useState(true);
  const [formDescription, setFormDescription] = useState('');
  const [formOwnerName, setFormOwnerName] = useState('');
  const [formPartnerPhone, setFormPartnerPhone] = useState('');
  const [formInternalNote, setFormInternalNote] = useState('');
  const [formTariffStandard, setFormTariffStandard] = useState(true);
  const [formTariffIntensive, setFormTariffIntensive] = useState(true);
  const [formError, setFormError] = useState('');
  const [selectedMonthlyPromo, setSelectedMonthlyPromo] = useState<PromoCode | null>(null);

  const fetchPromosAndStats = async () => {
    setLoading(true);
    try {
      const [promosRes, usagesRes, statsRes] = await Promise.all([
        api.getPromoCodes(),
        api.getPromoCodeUsages(),
        api.getPromoStats()
      ]);

      if (promosRes.promoCodes) {
        setPromos(promosRes.promoCodes);
      }
      if (usagesRes.usages) {
        setUsages(usagesRes.usages);
      }
      if (statsRes.stats) {
        setStats(statsRes.stats);
      }
    } catch (err: any) {
      console.error('Failed to load promocodes:', err);
      showToast(err.message || 'Промокоддорду жүктөөдө ката кетти', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPromosAndStats();
  }, []);

  const handleCopy = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const handleToggleActive = async (promo: PromoCode) => {
    try {
      const res = await api.togglePromoCodeActive(promo.id, !promo.isActive);
      if (res.success) {
        setPromos((prev) =>
          prev.map((p) => (p.id === promo.id ? { ...p, isActive: !promo.isActive } : p))
        );
        showToast(
          !promo.isActive
            ? (language === 'ky' ? `Промокод «${promo.code}» активдештирилди` : `Промокод «${promo.code}» активирован`)
            : (language === 'ky' ? `Промокод «${promo.code}» токтотулду` : `Промокод «${promo.code}» приостановлен`),
          'success'
        );
        fetchPromosAndStats();
      }
    } catch (err: any) {
      showToast(err.message || 'Ката кетти', 'error');
    }
  };

  const handleDelete = async (promo: PromoCode) => {
    const confirmText = language === 'ky'
      ? `Чын эле «${promo.code}» промокодун өчүрөсүзбү?`
      : `Вы уверены, что хотите удалить промокод «${promo.code}»?`;
    if (!window.confirm(confirmText)) return;

    try {
      const res = await api.deletePromoCode(promo.id);
      if (res.success) {
        setPromos((prev) => prev.filter((p) => p.id !== promo.id));
        showToast(
          language === 'ky' ? 'Промокод өчүрүлдү' : 'Промокод успешно удален',
          'info'
        );
        fetchPromosAndStats();
      }
    } catch (err: any) {
      showToast(err.message || 'Ката кетти', 'error');
    }
  };

  const openCreateModal = () => {
    setEditingPromo(null);
    setFormCode('');
    setFormDiscountType('percentage');
    setFormDiscountValue(20);
    // Default valid until: 60 days from now
    const defaultDate = new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    setFormValidUntil(defaultDate);
    setFormMaxUses('');
    setFormMinOrderAmount('0');
    setFormIsActive(true);
    setFormDescription('');
    setFormOwnerName('');
    setFormPartnerPhone('');
    setFormInternalNote('');
    setFormTariffStandard(true);
    setFormTariffIntensive(true);
    setFormError('');
    setIsModalOpen(true);
  };

  const openEditModal = (promo: PromoCode) => {
    setEditingPromo(promo);
    setFormCode(promo.code);
    setFormDiscountType(promo.discountType);
    setFormDiscountValue(promo.discountValue);
    setFormValidUntil(promo.validUntil ? promo.validUntil.split('T')[0] : '');
    setFormMaxUses(promo.maxUses !== null && promo.maxUses !== undefined ? String(promo.maxUses) : '');
    setFormMinOrderAmount(promo.minOrderAmount ? String(promo.minOrderAmount) : '0');
    setFormIsActive(promo.isActive);
    setFormDescription(promo.description || '');
    setFormOwnerName(promo.ownerName || '');
    setFormPartnerPhone(promo.partnerPhone || '');
    setFormInternalNote(promo.internalNote || '');

    const tariffs = promo.applicableTariffs || [];
    setFormTariffStandard(tariffs.length === 0 || tariffs.includes('standard'));
    setFormTariffIntensive(tariffs.length === 0 || tariffs.includes('intensive'));
    setFormError('');
    setIsModalOpen(true);
  };

  const handleSavePromo = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    const cleanCode = formCode.trim().toUpperCase();
    if (!cleanCode) {
      setFormError(language === 'ky' ? 'Промокоддун атын жазыңыз' : 'Введите код промокода');
      return;
    }

    if (!formDiscountValue || formDiscountValue <= 0) {
      setFormError(language === 'ky' ? 'Жеңилдиктин өлчөмүн туура көрсөтүңүз' : 'Укажите корректный размер скидки');
      return;
    }

    if (formDiscountType === 'percentage' && formDiscountValue > 100) {
      setFormError(language === 'ky' ? 'Процент 100дөн ашпашы керек' : 'Скидка в процентах не может превышать 100%');
      return;
    }

    if (!formValidUntil) {
      setFormError(language === 'ky' ? 'Жарактуулук мөөнөтүн тандаңыз' : 'Укажите срок действия');
      return;
    }

    const selectedTariffs: ('standard' | 'intensive')[] = [];
    if (formTariffStandard) selectedTariffs.push('standard');
    if (formTariffIntensive) selectedTariffs.push('intensive');
    if (selectedTariffs.length === 0) {
      setFormError(language === 'ky' ? 'Жок дегенде бир тарифти тандаңыз' : 'Выберите хотя бы один тариф');
      return;
    }

    setIsSaving(true);
    try {
      const payload = {
        code: cleanCode,
        discountType: formDiscountType,
        discountValue: Number(formDiscountValue),
        validUntil: formValidUntil,
        maxUses: formMaxUses ? Number(formMaxUses) : null,
        minOrderAmount: Number(formMinOrderAmount) || 0,
        isActive: formIsActive,
        description: formDescription.trim(),
        applicableTariffs: selectedTariffs,
        ownerName: formOwnerName.trim(),
        partnerPhone: formPartnerPhone.trim(),
        internalNote: formInternalNote.trim(),
        createdBy: 'Администратор'
      };

      if (editingPromo) {
        await api.updatePromoCode(editingPromo.id, payload);
        showToast(
          language === 'ky' ? 'Промокод ийгиликтүү жаңыланды' : 'Промокод успешно обновлен',
          'success'
        );
      } else {
        await api.createPromoCode(payload);
        showToast(
          language === 'ky' ? `Промокод «${cleanCode}» ийгиликтүү түзүлдү!` : `Промокод «${cleanCode}» успешно создан!`,
          'success'
        );
      }

      setIsModalOpen(false);
      fetchPromosAndStats();
    } catch (err: any) {
      setFormError(err.message || 'Ката кетти');
    } finally {
      setIsSaving(false);
    }
  };

  const generateRandomCode = () => {
    const prefixes = ['BILIM', 'ORT', 'STUDENT', 'GRANT', 'TOP'];
    const prefix = prefixes[Math.floor(Math.random() * prefixes.length)];
    const randomNum = Math.floor(100 + Math.random() * 900);
    setFormCode(`${prefix}${randomNum}`);
  };

  // Filter promocodes
  const now = new Date();
  const filteredPromos = promos.filter((p) => {
    const isExpired = p.validUntil ? new Date(p.validUntil) < now : false;
    const isExhausted = p.maxUses !== null && p.maxUses !== undefined && p.usesCount >= p.maxUses;

    if (statusFilter === 'active' && (!p.isActive || isExpired || isExhausted)) return false;
    if (statusFilter === 'inactive' && p.isActive) return false;
    if (statusFilter === 'expired' && !isExpired && !isExhausted) return false;

    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      const matchesCode = p.code.toLowerCase().includes(term);
      const matchesDesc = (p.description || '').toLowerCase().includes(term);
      if (!matchesCode && !matchesDesc) return false;
    }

    return true;
  });

  // Filter usages
  const filteredUsages = usages.filter((u) => {
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      return (
        u.code.toLowerCase().includes(term) ||
        (u.userName || '').toLowerCase().includes(term) ||
        (u.userPhone || '').toLowerCase().includes(term) ||
        (u.orderId || '').toLowerCase().includes(term)
      );
    }
    return true;
  });

  return (
    <div id="admin-promocodes-section" className="space-y-6">
      {/* 1. Stats KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-3xl p-5 border border-slate-200/90 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              {t.adminStatActivePromos || 'Активдүү промокоддор'}
            </span>
            <div className="text-2xl font-black text-slate-900 mt-1 flex items-baseline gap-2">
              <span>{stats.activePromos}</span>
              <span className="text-xs font-medium text-slate-400">/ {stats.totalPromos} жалпы</span>
            </div>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
            <Tag className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white rounded-3xl p-5 border border-slate-200/90 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              {t.adminStatTotalActivations || 'Жалпы колдонуулар'}
            </span>
            <div className="text-2xl font-black text-slate-900 mt-1">
              {stats.totalUses} <span className="text-xs font-normal text-slate-500">жолу</span>
            </div>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
            <TrendingUp className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white rounded-3xl p-5 border border-slate-200/90 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              {t.adminStatDiscountGranted || 'Берилген жеңилдиктер'}
            </span>
            <div className="text-2xl font-black text-amber-600 mt-1">
              {stats.totalDiscountSom.toLocaleString()} <span className="text-xs font-normal text-slate-500">сом</span>
            </div>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold">
            <Percent className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white rounded-3xl p-5 border border-slate-200/90 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              {t.adminStatPromoRevenue || 'Промокоддуу киреше'}
            </span>
            <div className="text-2xl font-black text-slate-900 mt-1">
              {stats.totalRevenueSom.toLocaleString()} <span className="text-xs font-normal text-slate-500">сом</span>
            </div>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold">
            <ArrowUpRight className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* 2. Sub-tab Navigation and Actions */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200/90 shadow-xs space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-5">
          <div className="flex items-center gap-2">
            <button
              id="tab-promos-list"
              type="button"
              onClick={() => setActiveSubTab('promos')}
              className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center gap-2 cursor-pointer ${
                activeSubTab === 'promos'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              <Tag className="w-4 h-4" />
              <span>{t.adminPromoTabCodes || 'Промокоддор тизмеси'}</span>
              <span className={`px-1.5 py-0.2 rounded-full text-[11px] ${activeSubTab === 'promos' ? 'bg-blue-700 text-white' : 'bg-slate-200 text-slate-700'}`}>
                {promos.length}
              </span>
            </button>

            <button
              id="tab-promos-usages"
              type="button"
              onClick={() => setActiveSubTab('usages')}
              className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center gap-2 cursor-pointer ${
                activeSubTab === 'usages'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              <Clock className="w-4 h-4" />
              <span>{t.adminPromoTabUsages || 'Колдонуу журналы'}</span>
              <span className={`px-1.5 py-0.2 rounded-full text-[11px] ${activeSubTab === 'usages' ? 'bg-blue-700 text-white' : 'bg-slate-200 text-slate-700'}`}>
                {usages.length}
              </span>
            </button>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={fetchPromosAndStats}
              disabled={loading}
              className="p-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-600 transition-colors cursor-pointer"
              title="Жаңылоо"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>

            <button
              id="btn-create-promocode"
              type="button"
              onClick={openCreateModal}
              className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs sm:text-sm font-bold flex items-center gap-2 shadow-xs transition-colors cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>{t.adminBtnCreatePromo || 'Жаңы промокод'}</span>
            </button>
          </div>
        </div>

        {/* 3. Search & Filter Bar */}
        <div className="flex flex-col md:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder={activeSubTab === 'promos' ? 'Промокодду же сыпаттаманы издөө...' : 'Код, кардар же телефон издөө...'}
              className="w-full pl-10 pr-4 py-2.5 text-xs sm:text-sm rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all"
            />
          </div>

          {activeSubTab === 'promos' && (
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
              <button
                type="button"
                onClick={() => setStatusFilter('all')}
                className={`px-3 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${
                  statusFilter === 'all'
                    ? 'bg-slate-900 text-white'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                Бардыгы ({promos.length})
              </button>
              <button
                type="button"
                onClick={() => setStatusFilter('active')}
                className={`px-3 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${
                  statusFilter === 'active'
                    ? 'bg-emerald-600 text-white'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                Активдүүлөр ({promos.filter((p) => p.isActive && (!p.validUntil || new Date(p.validUntil) >= now)).length})
              </button>
              <button
                type="button"
                onClick={() => setStatusFilter('inactive')}
                className={`px-3 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${
                  statusFilter === 'inactive'
                    ? 'bg-slate-600 text-white'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                Токтотулгандар ({promos.filter((p) => !p.isActive).length})
              </button>
              <button
                type="button"
                onClick={() => setStatusFilter('expired')}
                className={`px-3 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${
                  statusFilter === 'expired'
                    ? 'bg-amber-600 text-white'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                Мөөнөтү өткөндөр
              </button>
            </div>
          )}
        </div>

        {/* 4. Table 1: Promocodes List */}
        {activeSubTab === 'promos' && (
          <div className="overflow-x-auto rounded-2xl border border-slate-200">
            <table id="admin-promocodes-table" className="w-full text-left text-xs sm:text-sm">
              <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
                <tr>
                  <th className="py-3.5 px-4">{t.adminPromoColCode || 'Промокод / Жооптуу'}</th>
                  <th className="py-3.5 px-4">{t.adminPromoColDiscount || 'Арзандатуу'}</th>
                  <th className="py-3.5 px-4">Катталган / Төлөгөн</th>
                  <th className="py-3.5 px-4">Түшкөн сумма</th>
                  <th className="py-3.5 px-4">{t.adminPromoColValidity || 'Мөөнөтү'}</th>
                  <th className="py-3.5 px-4">{t.adminPromoColTariffs || 'Тарифтер'}</th>
                  <th className="py-3.5 px-4">{t.adminPromoColStatus || 'Абалы'}</th>
                  <th className="py-3.5 px-4 text-right">{t.adminPromoColActions || 'Аракеттер'}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredPromos.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="py-12 text-center text-slate-400">
                      <Tag className="w-8 h-8 mx-auto mb-2 text-slate-300" />
                      <p className="font-medium">Промокоддор табылган жок</p>
                      <button
                        type="button"
                        onClick={openCreateModal}
                        className="mt-2 text-xs text-blue-600 hover:underline font-bold cursor-pointer"
                      >
                        Биринчи промокодду түзүү →
                      </button>
                    </td>
                  </tr>
                ) : (
                  filteredPromos.map((promo) => {
                    const isExpired = promo.validUntil ? new Date(promo.validUntil) < now : false;
                    const isExhausted = promo.maxUses !== null && promo.maxUses !== undefined && promo.usesCount >= promo.maxUses;
                    const registeredCount = promo.registeredStudentsCount ?? promo.usesCount ?? 0;
                    const paidCount = promo.paidStudentsCount ?? 0;
                    const revenueSom = promo.totalRevenueSom ?? 0;

                    return (
                      <tr key={promo.id} className="hover:bg-slate-50/70 transition-colors">
                        {/* Code & Owner */}
                        <td className="py-3.5 px-4">
                          <div className="flex items-center gap-2">
                            <span className="font-mono font-bold text-sm text-slate-900 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                              {promo.code}
                            </span>
                            <button
                              type="button"
                              onClick={() => handleCopy(promo.code)}
                              className="p-1 hover:bg-slate-200 rounded text-slate-400 hover:text-slate-700 transition-colors cursor-pointer"
                              title="Көчүрүү"
                            >
                              {copiedCode === promo.code ? (
                                <Check className="w-3.5 h-3.5 text-emerald-600" />
                              ) : (
                                <Copy className="w-3.5 h-3.5" />
                              )}
                            </button>
                          </div>
                          {promo.ownerName && (
                            <div className="flex items-center gap-1.5 mt-1 text-xs font-semibold text-blue-700">
                              <span>👤 {promo.ownerName}</span>
                              {promo.partnerPhone && (
                                <span className="text-[11px] text-slate-400 font-normal">({promo.partnerPhone})</span>
                              )}
                            </div>
                          )}
                          {promo.description && (
                            <p className="text-[11px] text-slate-500 mt-0.5 line-clamp-1">
                              {promo.description}
                            </p>
                          )}
                          {promo.internalNote && (
                            <p className="text-[10px] text-amber-700 italic mt-0.5">
                              Ички: {promo.internalNote}
                            </p>
                          )}
                        </td>

                        {/* Discount */}
                        <td className="py-3.5 px-4">
                          <span className="inline-flex items-center gap-1 font-bold text-slate-900">
                            {promo.discountType === 'percentage' ? (
                              <span className="text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                                -{promo.discountValue}%
                              </span>
                            ) : (
                              <span className="text-blue-700 bg-blue-50 px-2 py-0.5 rounded-md border border-blue-200">
                                -{promo.discountValue} сом
                              </span>
                            )}
                          </span>
                        </td>

                        {/* Registered / Paid */}
                        <td className="py-3.5 px-4">
                          <div className="flex flex-col text-xs">
                            <span className="font-semibold text-slate-800">
                              Катталган: <span className="font-bold text-blue-600">{registeredCount}</span>
                            </span>
                            <span className="text-emerald-700 font-semibold mt-0.5">
                              Төлөгөн: <span className="font-bold">{paidCount}</span>
                            </span>
                            {promo.maxUses ? (
                              <span className="text-[10px] text-slate-400 mt-0.5">
                                Лимит: {registeredCount}/{promo.maxUses}
                              </span>
                            ) : null}
                          </div>
                        </td>

                        {/* Total Revenue & Monthly stats button */}
                        <td className="py-3.5 px-4">
                          <div className="flex flex-col">
                            <span className="font-bold text-slate-900 text-sm">
                              {revenueSom.toLocaleString()} сом
                            </span>
                            <button
                              type="button"
                              onClick={() => setSelectedMonthlyPromo(promo)}
                              className="text-[11px] text-blue-600 hover:text-blue-800 font-bold hover:underline inline-flex items-center gap-1 mt-1 cursor-pointer"
                              title="Ай сайын статистика"
                            >
                              <span>Ай сайын көрүү →</span>
                            </button>
                          </div>
                        </td>

                        {/* Validity */}
                        <td className="py-3.5 px-4">
                          <div className="flex items-center gap-1.5">
                            <Calendar className="w-3.5 h-3.5 text-slate-400" />
                            <span className={`text-xs ${isExpired ? 'text-rose-600 font-semibold' : 'text-slate-700'}`}>
                              {promo.validUntil ? new Date(promo.validUntil).toLocaleDateString(language === 'ky' ? 'ky-KG' : 'ru-RU') : 'Мөөнөтсүз'}
                            </span>
                          </div>
                          {isExpired && (
                            <span className="text-[10px] text-rose-500 font-medium">Мөөнөтү өткөн</span>
                          )}
                        </td>

                        {/* Applicable Tariffs */}
                        <td className="py-3.5 px-4">
                          <div className="flex gap-1 flex-wrap">
                            {(!promo.applicableTariffs || promo.applicableTariffs.length === 0 || promo.applicableTariffs.length === 2) ? (
                              <span className="px-2 py-0.5 rounded-md text-[11px] font-medium bg-slate-100 text-slate-700">
                                Бардык тарифтер
                              </span>
                            ) : (
                              promo.applicableTariffs.map((tName: string) => (
                                <span
                                  key={tName}
                                  className="px-2 py-0.5 rounded-md text-[11px] font-medium bg-blue-50 text-blue-700 border border-blue-100"
                                >
                                  {tName === 'intensive' ? 'Интенсив' : 'Стандарт'}
                                </span>
                              ))
                            )}
                          </div>
                        </td>

                        {/* Status */}
                        <td className="py-3.5 px-4">
                          {isExpired ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-800">
                              <Clock className="w-3 h-3" />
                              Истек
                            </span>
                          ) : isExhausted ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-800">
                              Лимит бүттү
                            </span>
                          ) : promo.isActive ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800">
                              <CheckCircle2 className="w-3 h-3" />
                              Активен
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-slate-200 text-slate-700">
                              <XCircle className="w-3 h-3" />
                              Токтотулган
                            </span>
                          )}
                        </td>

                        {/* Actions */}
                        <td className="py-3.5 px-4 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            {/* Toggle Active Button */}
                            <button
                              type="button"
                              onClick={() => handleToggleActive(promo)}
                              className={`px-2 py-1 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                                promo.isActive
                                  ? 'hover:bg-amber-50 text-amber-700'
                                  : 'hover:bg-emerald-50 text-emerald-700'
                              }`}
                              title={promo.isActive ? 'Токтотуу' : 'Активдештирүү'}
                            >
                              {promo.isActive ? 'Токтотуу' : 'Иштетүү'}
                            </button>

                            {/* Edit Button */}
                            <button
                              type="button"
                              onClick={() => openEditModal(promo)}
                              className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-500 hover:text-slate-800 transition-colors cursor-pointer"
                              title="Өзгөртүү"
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>

                            {/* Delete Button */}
                            <button
                              type="button"
                              onClick={() => handleDelete(promo)}
                              className="p-1.5 rounded-lg hover:bg-rose-50 text-slate-400 hover:text-rose-600 transition-colors cursor-pointer"
                              title="Өчүрүү"
                            >
                              <Trash2 className="w-4 h-4" />
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
        )}

        {/* 5. Table 2: Promo Code Usage Log (Audit Trail) */}
        {activeSubTab === 'usages' && (
          <div className="overflow-x-auto rounded-2xl border border-slate-200">
            <table id="admin-promocodes-usages-table" className="w-full text-left text-xs sm:text-sm">
              <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
                <tr>
                  <th className="py-3.5 px-4">Дата жана убакыт</th>
                  <th className="py-3.5 px-4">Промокод</th>
                  <th className="py-3.5 px-4">Колдонуучу</th>
                  <th className="py-3.5 px-4">Тариф</th>
                  <th className="py-3.5 px-4">Жеңилдик</th>
                  <th className="py-3.5 px-4">Төлөнгөн сумма</th>
                  <th className="py-3.5 px-4">Order ID</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredUsages.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-12 text-center text-slate-400">
                      <Clock className="w-8 h-8 mx-auto mb-2 text-slate-300" />
                      <p className="font-medium">Колдонуу тарыхы азырынча бош</p>
                      <p className="text-xs text-slate-400 mt-1">
                        Колдонуучулар төлөм учурунда промокод жазып төлөгөндө бул жерде автоматтык түрдө чыгат.
                      </p>
                    </td>
                  </tr>
                ) : (
                  filteredUsages.map((usage) => (
                    <tr key={usage.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-3.5 px-4 whitespace-nowrap text-slate-600 text-xs">
                        {new Date(usage.usedAt).toLocaleDateString(language === 'ky' ? 'ky-KG' : 'ru-RU')}
                        {' '}
                        <span className="text-slate-400">
                          {new Date(usage.usedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </td>

                      <td className="py-3.5 px-4">
                        <span className="font-mono font-bold text-xs bg-emerald-50 text-emerald-800 border border-emerald-200 px-2 py-0.5 rounded">
                          {usage.code}
                        </span>
                      </td>

                      <td className="py-3.5 px-4">
                        <div className="font-semibold text-slate-900">{usage.userName || 'Студент'}</div>
                        <div className="text-[11px] text-slate-400">{usage.userPhone || '—'}</div>
                      </td>

                      <td className="py-3.5 px-4 font-medium text-slate-700">
                        {usage.tariffId === 'intensive' ? 'Интенсив ОРТ' : 'Стандарт'}
                      </td>

                      <td className="py-3.5 px-4 font-bold text-emerald-600">
                        -{usage.discountAmount} сом
                      </td>

                      <td className="py-3.5 px-4 font-black text-slate-900">
                        {usage.finalAmount} сом
                      </td>

                      <td className="py-3.5 px-4 font-mono text-[11px] text-slate-500">
                        {usage.orderId ? `${usage.orderId.slice(0, 10)}...` : '—'}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* 6. Modal: Create / Edit Promo Code */}
      {isModalOpen && (
        <div
          id="modal-promocode-backdrop"
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 p-4 backdrop-blur-xs overflow-y-auto animate-in fade-in"
        >
          <div
            id="modal-promocode-card"
            className="bg-white rounded-3xl max-w-lg w-full shadow-2xl border border-slate-100 my-6 p-6 sm:p-8 space-y-5"
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
                  <Tag className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-900">
                    {editingPromo ? (language === 'ky' ? 'Промокодду өзгөртүү' : 'Редактирование промокода') : (t.adminPromoCreateTitle || 'Жаңы промокод түзүү')}
                  </h3>
                  <p className="text-xs text-slate-500">
                    {editingPromo ? editingPromo.code : 'Жеңилдик пайызын жана шарттарын аныктаңыз'}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="w-8 h-8 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-700 flex items-center justify-center font-bold cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {formError && (
              <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{formError}</span>
              </div>
            )}

            <form onSubmit={handleSavePromo} className="space-y-4">
              {/* Promo Code Input & Generator */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  {t.adminPromoInputCode || 'Промокоддун аты (мис. ORT2026)'} *
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    required
                    value={formCode}
                    onChange={(e) => setFormCode(e.target.value.toUpperCase())}
                    placeholder="ORT2026"
                    className="flex-1 px-3.5 py-2.5 rounded-xl border border-slate-200 uppercase font-mono font-bold text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none"
                  />
                  <button
                    type="button"
                    onClick={generateRandomCode}
                    className="px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                    title="Кокус код түзүү"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-blue-600" />
                    <span>Генерировать</span>
                  </button>
                </div>
              </div>

              {/* Discount Type & Value */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    {t.adminPromoDiscountType || 'Жеңилдик түрү'}
                  </label>
                  <select
                    value={formDiscountType}
                    onChange={(e) => setFormDiscountType(e.target.value as any)}
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm font-semibold focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none bg-white"
                  >
                    <option value="percentage">Процент менен (%)</option>
                    <option value="fixed">Туруктуу сумма (сом)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    {t.adminPromoDiscountValue || 'Жеңилдиктин өлчөмү'} *
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      required
                      min={1}
                      max={formDiscountType === 'percentage' ? 100 : 5000}
                      value={formDiscountValue}
                      onChange={(e) => setFormDiscountValue(Number(e.target.value))}
                      className="w-full pl-3.5 pr-10 py-2.5 rounded-xl border border-slate-200 text-sm font-bold focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none"
                    />
                    <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">
                      {formDiscountType === 'percentage' ? '%' : 'сом'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Validity, Limit & Minimum Order Amount */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    {t.adminPromoValidUntil || 'Жарактуулук мөөнөтү'} *
                  </label>
                  <input
                    type="date"
                    required
                    value={formValidUntil}
                    onChange={(e) => setFormValidUntil(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm font-semibold focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none bg-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    {t.adminPromoMaxUses || 'Лимит (колдонуу)'}
                  </label>
                  <input
                    type="number"
                    min={1}
                    placeholder="Чексиз"
                    value={formMaxUses}
                    onChange={(e) => setFormMaxUses(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    {language === 'ky' ? 'Мин. заказ суммасы' : 'Мин. сумма заказа'}
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      min={0}
                      placeholder="0"
                      value={formMinOrderAmount}
                      onChange={(e) => setFormMinOrderAmount(e.target.value)}
                      className="w-full pl-3.5 pr-8 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none"
                    />
                    <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[11px] font-bold text-slate-400">
                      сом
                    </span>
                  </div>
                </div>
              </div>

              {/* Applicable Tariffs */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  {t.adminPromoApplicableTariffs || 'Колдонулуучу тарифтер'}
                </label>
                <div className="flex gap-4 p-3 bg-slate-50 rounded-xl border border-slate-200">
                  <label className="flex items-center gap-2 text-xs font-medium text-slate-800 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formTariffStandard}
                      onChange={(e) => setFormTariffStandard(e.target.checked)}
                      className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500"
                    />
                    <span>Стандарт (490 сом)</span>
                  </label>

                  <label className="flex items-center gap-2 text-xs font-medium text-slate-800 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formTariffIntensive}
                      onChange={(e) => setFormTariffIntensive(e.target.checked)}
                      className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500"
                    />
                    <span>Интенсив ОРТ (890 сом)</span>
                  </label>
                </div>
              </div>

              {/* Responsible Person / Partner & Phone */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    {language === 'ky' ? 'Жооптуу адам же өнөктөш' : 'Ответственное лицо / Партнер'}
                  </label>
                  <input
                    type="text"
                    value={formOwnerName}
                    onChange={(e) => setFormOwnerName(e.target.value)}
                    placeholder="Мис.: Айбек Мугалим же @ort_blogger"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    {language === 'ky' ? 'Байланыш телефону' : 'Контактный телефон'}
                  </label>
                  <input
                    type="tel"
                    value={formPartnerPhone}
                    onChange={(e) => setFormPartnerPhone(e.target.value)}
                    placeholder="+996 (___) __-__-__"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none"
                  />
                </div>
              </div>

              {/* Description & Internal Note */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    {t.adminPromoDescription || 'Сыпаттама / Эскертүү'}
                  </label>
                  <textarea
                    rows={2}
                    value={formDescription}
                    onChange={(e) => setFormDescription(e.target.value)}
                    placeholder="Мис.: Instagram блогердин каналы үчүн 20% арзандатуу"
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs sm:text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    {language === 'ky' ? 'Ички админ эскертүүсү' : 'Внутренняя заметка админа'}
                  </label>
                  <textarea
                    rows={2}
                    value={formInternalNote}
                    onChange={(e) => setFormInternalNote(e.target.value)}
                    placeholder="Мис.: 10% комиссия ай сайын эсептелет"
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs sm:text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none"
                  />
                </div>
              </div>

              {/* Active Toggle Switch */}
              <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-200">
                <div>
                  <span className="text-xs font-bold text-slate-800">Промокодду дароо активдештирүү</span>
                  <p className="text-[11px] text-slate-500">Студенттер төлөм учурунда киргизе алышат</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formIsActive}
                    onChange={(e) => setFormIsActive(e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>
                </label>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 font-semibold text-xs sm:text-sm transition-colors cursor-pointer"
                >
                  Жокко чыгаруу
                </button>
                <button
                  id="btn-submit-promocode-form"
                  type="submit"
                  disabled={isSaving}
                  className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-bold text-xs sm:text-sm shadow-xs transition-colors flex items-center gap-2 cursor-pointer"
                >
                  {isSaving ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>Сакталууда...</span>
                    </>
                  ) : (
                    <span>{editingPromo ? 'Өзгөртүүлөрдү сактоо' : 'Промокодду түзүү'}</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 7. Modal: Monthly Breakdown by Promo Code */}
      {selectedMonthlyPromo && (
        <div
          id="modal-monthly-promo-backdrop"
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 p-4 backdrop-blur-xs overflow-y-auto animate-in fade-in"
        >
          <div
            id="modal-monthly-promo-card"
            className="bg-white rounded-3xl max-w-2xl w-full shadow-2xl border border-slate-100 my-6 p-6 sm:p-8 space-y-5"
          >
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
                  <Calendar className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-900">
                    Промокод «{selectedMonthlyPromo.code}» — Ай сайын статистика
                  </h3>
                  <p className="text-xs text-slate-500">
                    {selectedMonthlyPromo.ownerName ? `Жооптуу: ${selectedMonthlyPromo.ownerName}` : 'Бул промокод боюнча ай сайын катталгандар жана төлөмдөр'}
                    {selectedMonthlyPromo.partnerPhone ? ` (${selectedMonthlyPromo.partnerPhone})` : ''}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSelectedMonthlyPromo(null)}
                className="w-8 h-8 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-700 flex items-center justify-center font-bold cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Summary cards */}
            <div className="grid grid-cols-3 gap-3">
              <div className="p-3.5 rounded-2xl bg-blue-50 border border-blue-100 text-center">
                <div className="text-xs text-blue-700 font-semibold">Бардык катталгандар</div>
                <div className="text-xl font-black text-blue-900 mt-0.5">
                  {selectedMonthlyPromo.registeredStudentsCount ?? selectedMonthlyPromo.usesCount ?? 0}
                </div>
              </div>
              <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-100 text-center">
                <div className="text-xs text-emerald-700 font-semibold">Төлөм кылгандар</div>
                <div className="text-xl font-black text-emerald-900 mt-0.5">
                  {selectedMonthlyPromo.paidStudentsCount ?? 0}
                </div>
              </div>
              <div className="p-3.5 rounded-2xl bg-purple-50 border border-purple-100 text-center">
                <div className="text-xs text-purple-700 font-semibold">Жалпы түшкөн сумма</div>
                <div className="text-xl font-black text-purple-900 mt-0.5">
                  {(selectedMonthlyPromo.totalRevenueSom ?? 0).toLocaleString()} с
                </div>
              </div>
            </div>

            {/* Monthly Table */}
            <div className="overflow-x-auto rounded-2xl border border-slate-200">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
                  <tr>
                    <th className="py-2.5 px-3">Ай (Мезгил)</th>
                    <th className="py-2.5 px-3">Катталган / Колдонгондор</th>
                    <th className="py-2.5 px-3">Төлөгөндөр саны</th>
                    <th className="py-2.5 px-3">Түшкөн сумма (сом)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {(!selectedMonthlyPromo.monthlyBreakdown || Object.keys(selectedMonthlyPromo.monthlyBreakdown).length === 0) ? (
                    <tr>
                      <td colSpan={4} className="py-8 text-center text-slate-400">
                        Бул промокод боюнча айлык төлөмдөр каттала элек
                      </td>
                    </tr>
                  ) : (
                    Object.entries(selectedMonthlyPromo.monthlyBreakdown)
                      .sort(([a], [b]) => b.localeCompare(a))
                      .map(([monthKey, row]) => (
                        <tr key={monthKey} className="hover:bg-slate-50/70">
                          <td className="py-2.5 px-3 font-mono font-bold text-slate-800">
                            {monthKey}
                          </td>
                          <td className="py-2.5 px-3 font-semibold text-blue-700">
                            {row.usesCount} окуучу
                          </td>
                          <td className="py-2.5 px-3 font-bold text-emerald-700">
                            {row.paidCount} төлөм
                          </td>
                          <td className="py-2.5 px-3 font-black text-slate-900">
                            {row.revenueSom.toLocaleString()} сом
                          </td>
                        </tr>
                      ))
                  )}
                </tbody>
              </table>
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="button"
                onClick={() => setSelectedMonthlyPromo(null)}
                className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs cursor-pointer"
              >
                Жабуу
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
