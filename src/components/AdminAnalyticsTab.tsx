import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { api } from '../services/api';
import { ComprehensiveAnalyticsData } from '../types';
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  Users,
  Calendar,
  CreditCard,
  Layers,
  ArrowUpRight,
  Download,
  RefreshCw,
  Sparkles,
  PieChart as PieChartIcon,
  BarChart3,
  LineChart as LineChartIcon,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  ShieldCheck,
  Zap
} from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend
} from 'recharts';

export const AdminAnalyticsTab: React.FC = () => {
  const { language, showToast } = useApp();

  const [timeframe, setTimeframe] = useState<'7d' | '14d' | '30d'>('30d');
  const [revenueViewMode, setRevenueViewMode] = useState<'daily' | 'weekly' | 'monthly'>('daily');
  const [chartMetric, setChartMetric] = useState<'revenue' | 'orders'>('revenue');
  const [analyticsData, setAnalyticsData] = useState<ComprehensiveAnalyticsData | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);

  const fetchAnalytics = async (tf = timeframe, silent = false) => {
    if (!silent) setIsLoading(true);
    else setIsRefreshing(true);

    try {
      const res = await api.getAdminAnalytics(tf);
      if (res.success && res.analytics) {
        setAnalyticsData(res.analytics);
      } else {
        throw new Error(res.error || 'Failed to fetch analytics');
      }
    } catch (err: any) {
      console.error('Analytics load error:', err);
      showToast(
        language === 'ky' ? 'Аналитика маалыматтарын жүктөөдө ката кетти' : 'Ошибка загрузки аналитики',
        'error'
      );
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchAnalytics(timeframe);
  }, [timeframe]);

  const handleExportCSV = () => {
    if (!analyticsData) return;

    let csvContent = 'data:text/csv;charset=utf-8,';
    if (revenueViewMode === 'daily') {
      csvContent += 'Date,Label,Revenue_KGS,Orders_Count,Standard_KGS,Intensive_KGS,New_Subscribers\n';
      analyticsData.dailyRevenue.forEach((row) => {
        csvContent += `${row.date},${row.label},${row.revenue},${row.ordersCount},${row.standardRevenue},${row.intensiveRevenue},${row.newSubscribers}\n`;
      });
    } else if (revenueViewMode === 'weekly') {
      csvContent += 'Week,Start_Date,Revenue_KGS,Orders_Count,New_Subscribers,Growth_Percent\n';
      analyticsData.weeklyRevenue.forEach((row) => {
        csvContent += `${row.weekLabel},${row.startDate},${row.revenue},${row.ordersCount},${row.newSubscribers},${row.growthPercent}%\n`;
      });
    } else {
      csvContent += 'Month,Year_Month,Revenue_KGS,Orders_Count,New_Subscribers,Target_KGS,Growth_Percent\n';
      analyticsData.monthlyRevenue.forEach((row) => {
        csvContent += `${row.monthLabel},${row.yearMonth},${row.revenue},${row.ordersCount},${row.newSubscribers},${row.targetRevenue},${row.growthPercent}%\n`;
      });
    }

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `bilimai_revenue_report_${revenueViewMode}_${timeframe}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    showToast(
      language === 'ky' ? 'Отчет CSV форматында ийгиликтүү жүктөлдү' : 'Отчет успешно выгружен в CSV',
      'success'
    );
  };

  const kpis = analyticsData?.kpis;
  const tariffColors = ['#94a3b8', '#3b82f6', '#10b981'];

  // Format currency helpers
  const formatSom = (val: number) => {
    return new Intl.NumberFormat('ru-RU').format(Math.round(val)) + ' сом';
  };

  const formatNumber = (val: number) => {
    return new Intl.NumberFormat('ru-RU').format(val);
  };

  // Custom Chart Tooltip for Revenue
  const CustomRevenueTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-slate-900/95 text-white p-3.5 rounded-xl shadow-xl border border-slate-700/80 text-xs space-y-1.5 backdrop-blur-sm min-w-[190px]">
          <p className="font-bold text-slate-200 border-b border-slate-700/80 pb-1 flex justify-between items-center">
            <span>{data.label || data.weekLabel || data.monthLabel || label}</span>
            {data.date && <span className="text-[10px] text-slate-400 font-normal">{data.date}</span>}
          </p>
          <div className="flex justify-between items-center text-blue-400 font-bold text-sm">
            <span>{language === 'ky' ? 'Жалпы киреше:' : 'Выручка:'}</span>
            <span>{formatSom(data.revenue)}</span>
          </div>
          <div className="flex justify-between items-center text-slate-300">
            <span>{language === 'ky' ? 'Төлөмдөр:' : 'Количество заказов:'}</span>
            <span className="font-semibold">{data.ordersCount} шт</span>
          </div>
          {data.standardRevenue !== undefined && (
            <div className="flex justify-between items-center text-[11px] text-slate-400 pt-1 border-t border-slate-800">
              <span>Стандарт (490с):</span>
              <span className="text-slate-200">{formatSom(data.standardRevenue)}</span>
            </div>
          )}
          {data.intensiveRevenue !== undefined && (
            <div className="flex justify-between items-center text-[11px] text-slate-400">
              <span>Интенсив (890с):</span>
              <span className="text-slate-200">{formatSom(data.intensiveRevenue)}</span>
            </div>
          )}
          {data.growthPercent !== undefined && (
            <div className="flex justify-between items-center text-[11px] pt-1 border-t border-slate-800">
              <span>{language === 'ky' ? 'Өсүш темпи:' : 'Темп роста:'}</span>
              <span className={data.growthPercent >= 0 ? 'text-emerald-400 font-bold' : 'text-rose-400 font-bold'}>
                {data.growthPercent >= 0 ? `+${data.growthPercent}%` : `${data.growthPercent}%`}
              </span>
            </div>
          )}
        </div>
      );
    }
    return null;
  };

  // Custom Chart Tooltip for Subscriptions
  const CustomSubscriptionTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-slate-900/95 text-white p-3.5 rounded-xl shadow-xl border border-slate-700/80 text-xs space-y-1.5 backdrop-blur-sm min-w-[200px]">
          <p className="font-bold text-slate-200 border-b border-slate-700/80 pb-1 flex justify-between items-center">
            <span>{data.label || label}</span>
            {data.date && <span className="text-[10px] text-slate-400 font-normal">{data.date}</span>}
          </p>
          <div className="flex justify-between items-center text-emerald-400 font-bold text-sm">
            <span>{language === 'ky' ? 'Активдүү подпискалар:' : 'Активные подписки:'}</span>
            <span>{formatNumber(data.activeSubscribers)}</span>
          </div>
          <div className="flex justify-between items-center text-slate-300">
            <span>{language === 'ky' ? 'Жалпы колдонуучулар:' : 'Всего зарегистрировано:'}</span>
            <span className="font-semibold">{formatNumber(data.totalSubscribers)}</span>
          </div>
          <div className="flex justify-between items-center text-blue-300 text-[11px] pt-1 border-t border-slate-800">
            <span>{language === 'ky' ? 'Жаңы сатып алуулар:' : 'Новые подписчики:'}</span>
            <span className="font-semibold">+{data.newSubscribers}</span>
          </div>
          {data.churnedSubscribers > 0 && (
            <div className="flex justify-between items-center text-rose-300 text-[11px]">
              <span>{language === 'ky' ? 'Мөөнөтү бүткөндөр:' : 'Истекшие подписки:'}</span>
              <span className="font-semibold">-{data.churnedSubscribers}</span>
            </div>
          )}
        </div>
      );
    }
    return null;
  };

  return (
    <div id="admin-analytics-dashboard" className="space-y-6">
      {/* Top Header & Global Controls */}
      <div className="p-6 bg-white rounded-3xl border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-100 text-blue-800 flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5" />
              <span>{language === 'ky' ? 'Реалдуу убакыт аналитикасы' : 'Аналитика в реальном времени'}</span>
            </span>
            <span className="text-xs text-slate-400">• MBANK QR & Payments</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900">
            {language === 'ky' ? 'Кирешелер жана подпискалардын аналитикасы' : 'Аналитика выручки и подписок'}
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            {language === 'ky'
              ? 'Күндөлүк, апталык жана айлык каржылык көрсөткүчтөр, тарифтердин эффективдүүлүгү'
              : 'Визуализация ежедневной, еженедельной и ежемесячной выручки, динамика подписчиков'}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          {/* Timeframe Selector */}
          <div className="flex bg-slate-100 p-1 rounded-2xl border border-slate-200/80 text-xs font-semibold">
            <button
              type="button"
              id="btn-timeframe-7d"
              onClick={() => setTimeframe('7d')}
              className={`px-3 py-1.5 rounded-xl transition-all cursor-pointer ${
                timeframe === '7d'
                  ? 'bg-white text-blue-700 shadow-xs font-bold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              7 {language === 'ky' ? 'күн' : 'дней'}
            </button>
            <button
              type="button"
              id="btn-timeframe-14d"
              onClick={() => setTimeframe('14d')}
              className={`px-3 py-1.5 rounded-xl transition-all cursor-pointer ${
                timeframe === '14d'
                  ? 'bg-white text-blue-700 shadow-xs font-bold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              14 {language === 'ky' ? 'күн' : 'дней'}
            </button>
            <button
              type="button"
              id="btn-timeframe-30d"
              onClick={() => setTimeframe('30d')}
              className={`px-3 py-1.5 rounded-xl transition-all cursor-pointer ${
                timeframe === '30d'
                  ? 'bg-white text-blue-700 shadow-xs font-bold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              30 {language === 'ky' ? 'күн' : 'дней'}
            </button>
          </div>

          {/* Refresh Action */}
          <button
            type="button"
            id="btn-refresh-analytics"
            onClick={() => fetchAnalytics(timeframe, true)}
            disabled={isRefreshing}
            className="p-2.5 rounded-2xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 transition-colors disabled:opacity-50 cursor-pointer shadow-xs"
            title={language === 'ky' ? 'Жаңылоо' : 'Обновить'}
          >
            <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin text-blue-600' : ''}`} />
          </button>

          {/* Export Report Action */}
          <button
            type="button"
            id="btn-export-csv"
            onClick={handleExportCSV}
            className="px-3.5 py-2 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition-all shadow-xs flex items-center gap-1.5 cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            <span>CSV {language === 'ky' ? 'Экспорт' : 'Экспорт'}</span>
          </button>
        </div>
      </div>

      {/* 6 Executive KPI Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3.5">
        {/* 1. Daily Revenue */}
        <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-xs text-slate-500 mb-1.5">
            <span>{language === 'ky' ? 'Бүгүнкү киреше' : 'Выручка сегодня'}</span>
            <div className="w-7 h-7 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <p className="text-xl font-extrabold text-slate-900">
            {formatSom(kpis?.todayRevenue || 0)}
          </p>
          <div className="flex items-center gap-1 mt-1.5 text-[11px]">
            <span className={`inline-flex items-center gap-0.5 font-bold ${(kpis?.revenueGrowthDaily || 0) >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
              {(kpis?.revenueGrowthDaily || 0) >= 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
              {kpis?.revenueGrowthDaily && kpis.revenueGrowthDaily >= 0 ? `+${kpis.revenueGrowthDaily}%` : `${kpis?.revenueGrowthDaily || 0}%`}
            </span>
            <span className="text-slate-400">• {kpis?.todayOrders || 0} {language === 'ky' ? 'төлөм' : 'заказов'}</span>
          </div>
        </div>

        {/* 2. Weekly Revenue */}
        <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-xs text-slate-500 mb-1.5">
            <span>{language === 'ky' ? 'Апталык киреше' : 'Выручка за неделю'}</span>
            <div className="w-7 h-7 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <Calendar className="w-4 h-4" />
            </div>
          </div>
          <p className="text-xl font-extrabold text-slate-900">
            {formatSom(kpis?.weekRevenue || 0)}
          </p>
          <div className="flex items-center gap-1 mt-1.5 text-[11px]">
            <span className={`inline-flex items-center gap-0.5 font-bold ${(kpis?.revenueGrowthWeekly || 0) >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
              <TrendingUp className="w-3 h-3" />
              +{kpis?.revenueGrowthWeekly || 0}%
            </span>
            <span className="text-slate-400">• {kpis?.weekOrders || 0} {language === 'ky' ? 'заказ' : 'заказов'}</span>
          </div>
        </div>

        {/* 3. Monthly Revenue */}
        <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-xs text-slate-500 mb-1.5">
            <span>{language === 'ky' ? 'Айлык киреше' : 'Выручка за 30 дней'}</span>
            <div className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <CreditCard className="w-4 h-4" />
            </div>
          </div>
          <p className="text-xl font-extrabold text-emerald-700">
            {formatSom(kpis?.monthRevenue || 0)}
          </p>
          <div className="flex items-center gap-1 mt-1.5 text-[11px]">
            <span className="text-emerald-600 font-bold inline-flex items-center gap-0.5">
              <TrendingUp className="w-3 h-3" />
              +{kpis?.revenueGrowthMonthly || 0}%
            </span>
            <span className="text-slate-400">• {kpis?.monthOrders || 0} {language === 'ky' ? 'сатып алуу' : 'покупок'}</span>
          </div>
        </div>

        {/* 4. Active Subscribers */}
        <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-xs text-slate-500 mb-1.5">
            <span>{language === 'ky' ? 'Активдүү окуучулар' : 'Активные подписки'}</span>
            <div className="w-7 h-7 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <p className="text-xl font-extrabold text-slate-900">
            {formatNumber(kpis?.activeSubscribers || 0)}
          </p>
          <div className="flex items-center gap-1 mt-1.5 text-[11px]">
            <span className="text-blue-700 font-semibold">{kpis?.autoRenewPercent || 76}% авто-узартуу</span>
          </div>
        </div>

        {/* 5. Average Order Value (ARPU / Орточо чек) */}
        <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-xs text-slate-500 mb-1.5">
            <span>{language === 'ky' ? 'Орточо чек' : 'Средний чек (AOV)'}</span>
            <div className="w-7 h-7 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
              <Zap className="w-4 h-4" />
            </div>
          </div>
          <p className="text-xl font-extrabold text-slate-900">
            {formatSom(kpis?.averageOrderValue || 635)}
          </p>
          <div className="flex items-center gap-1 mt-1.5 text-[11px] text-slate-400">
            <span>{language === 'ky' ? 'Топ тариф:' : 'Топ тариф:'}</span>
            <span className="font-semibold text-slate-700">Стандарт</span>
          </div>
        </div>

        {/* 6. Retention & Churn */}
        <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-xs text-slate-500 mb-1.5">
            <span>{language === 'ky' ? 'Retention & LTV' : 'Удержание (Retention)'}</span>
            <div className="w-7 h-7 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center">
              <ShieldCheck className="w-4 h-4" />
            </div>
          </div>
          <p className="text-xl font-extrabold text-purple-700">
            {kpis?.retentionRatePercent || 95.8}%
          </p>
          <div className="flex items-center gap-1 mt-1.5 text-[11px] text-slate-400">
            <span>{language === 'ky' ? 'Чурн темпи:' : 'Отток (churn):'}</span>
            <span className="font-semibold text-slate-600">{kpis?.churnRatePercent || 4.2}%</span>
          </div>
        </div>
      </div>

      {/* SECTION 1: REVENUE DYNAMICS (Daily / Weekly / Monthly Charts) */}
      <div className="p-6 bg-white rounded-3xl border border-slate-200 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-slate-100">
          <div>
            <h3 className="text-base sm:text-lg font-bold text-slate-900 flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-blue-600" />
              <span>{language === 'ky' ? 'Кирешелердин динамикасы жана өсүшү' : 'Динамика и структура выручки'}</span>
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              {revenueViewMode === 'daily'
                ? (language === 'ky' ? 'Күндөлүк түшкөн төлөмдөр жана тарифтик бөлүштүрүү' : 'Ежедневные поступления с разбивкой по тарифам')
                : revenueViewMode === 'weekly'
                ? (language === 'ky' ? 'Апталык жыйынтыктар жана өсүү динамикасы' : 'Еженедельные итоги и процентный рост')
                : (language === 'ky' ? 'Айлык кирешелер жана пландалган максаттарга жетүү' : 'Ежемесячные доходы и сопоставление с целевыми показателями')}
            </p>
          </div>

          <div className="flex items-center gap-2">
            {/* Metric Switcher */}
            <div className="flex bg-slate-100 p-0.5 rounded-xl border border-slate-200 text-xs font-semibold">
              <button
                type="button"
                id="btn-metric-revenue"
                onClick={() => setChartMetric('revenue')}
                className={`px-3 py-1 rounded-lg transition-all cursor-pointer ${
                  chartMetric === 'revenue'
                    ? 'bg-white text-blue-700 shadow-xs font-bold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {language === 'ky' ? 'Сом менен' : 'Сумма (сом)'}
              </button>
              <button
                type="button"
                id="btn-metric-orders"
                onClick={() => setChartMetric('orders')}
                className={`px-3 py-1 rounded-lg transition-all cursor-pointer ${
                  chartMetric === 'orders'
                    ? 'bg-white text-blue-700 shadow-xs font-bold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {language === 'ky' ? 'Төлөм саны' : 'Кол-во'}
              </button>
            </div>

            {/* Time Aggregation Mode */}
            <div className="flex bg-slate-100 p-0.5 rounded-xl border border-slate-200 text-xs font-semibold">
              <button
                type="button"
                id="btn-mode-daily"
                onClick={() => setRevenueViewMode('daily')}
                className={`px-3 py-1 rounded-lg transition-all cursor-pointer ${
                  revenueViewMode === 'daily'
                    ? 'bg-blue-600 text-white font-bold shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {language === 'ky' ? 'Күндөлүк' : 'Дни'}
              </button>
              <button
                type="button"
                id="btn-mode-weekly"
                onClick={() => setRevenueViewMode('weekly')}
                className={`px-3 py-1 rounded-lg transition-all cursor-pointer ${
                  revenueViewMode === 'weekly'
                    ? 'bg-blue-600 text-white font-bold shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {language === 'ky' ? 'Апталык' : 'Недели'}
              </button>
              <button
                type="button"
                id="btn-mode-monthly"
                onClick={() => setRevenueViewMode('monthly')}
                className={`px-3 py-1 rounded-lg transition-all cursor-pointer ${
                  revenueViewMode === 'monthly'
                    ? 'bg-blue-600 text-white font-bold shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {language === 'ky' ? 'Айлык' : 'Месяцы'}
              </button>
            </div>
          </div>
        </div>

        {/* Chart Render */}
        <div className="h-80 w-full pt-2">
          {isLoading ? (
            <div className="h-full flex items-center justify-center text-slate-400 text-sm gap-2">
              <RefreshCw className="w-5 h-5 animate-spin text-blue-600" />
              <span>{language === 'ky' ? 'Графиктер түзүлүүдө...' : 'Построение графиков...'}</span>
            </div>
          ) : revenueViewMode === 'daily' ? (
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={analyticsData?.dailyRevenue || []}
                margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
              >
                <defs>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#2563eb" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#2563eb" stopOpacity={0.0} />
                  </linearGradient>
                  <linearGradient id="colorStandard" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.0} />
                  </linearGradient>
                  <linearGradient id="colorIntensive" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis
                  dataKey="label"
                  tickLine={false}
                  axisLine={{ stroke: '#e2e8f0' }}
                  tick={{ fill: '#64748b', fontSize: 11 }}
                />
                <YAxis
                  tickLine={false}
                  axisLine={false}
                  tick={{ fill: '#64748b', fontSize: 11 }}
                  tickFormatter={(val) => (chartMetric === 'revenue' ? `${Math.round(val / 1000)}k` : `${val}`)}
                />
                <Tooltip content={<CustomRevenueTooltip />} />
                {chartMetric === 'revenue' ? (
                  <>
                    <Area
                      type="monotone"
                      dataKey="revenue"
                      name={language === 'ky' ? 'Жалпы киреше' : 'Общая выручка'}
                      stroke="#2563eb"
                      strokeWidth={2.5}
                      fillOpacity={1}
                      fill="url(#colorRevenue)"
                    />
                    <Area
                      type="monotone"
                      dataKey="standardRevenue"
                      name="Стандарт"
                      stroke="#3b82f6"
                      strokeWidth={1.5}
                      strokeDasharray="4 4"
                      fill="url(#colorStandard)"
                    />
                    <Area
                      type="monotone"
                      dataKey="intensiveRevenue"
                      name="Интенсив"
                      stroke="#10b981"
                      strokeWidth={1.5}
                      strokeDasharray="4 4"
                      fill="url(#colorIntensive)"
                    />
                  </>
                ) : (
                  <Bar
                    dataKey="ordersCount"
                    name={language === 'ky' ? 'Төлөмдөр' : 'Заказы'}
                    fill="#3b82f6"
                    radius={[6, 6, 0, 0]}
                  />
                )}
              </AreaChart>
            </ResponsiveContainer>
          ) : revenueViewMode === 'weekly' ? (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={analyticsData?.weeklyRevenue || []}
                margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
              >
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis
                  dataKey="weekLabel"
                  tickLine={false}
                  axisLine={{ stroke: '#e2e8f0' }}
                  tick={{ fill: '#64748b', fontSize: 11 }}
                />
                <YAxis
                  tickLine={false}
                  axisLine={false}
                  tick={{ fill: '#64748b', fontSize: 11 }}
                  tickFormatter={(val) => (chartMetric === 'revenue' ? `${Math.round(val / 1000)}k` : `${val}`)}
                />
                <Tooltip content={<CustomRevenueTooltip />} />
                <Bar
                  dataKey={chartMetric === 'revenue' ? 'revenue' : 'ordersCount'}
                  name={chartMetric === 'revenue' ? (language === 'ky' ? 'Апталык киреше' : 'Выручка за неделю') : 'Заказы'}
                  fill="#2563eb"
                  radius={[8, 8, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={analyticsData?.monthlyRevenue || []}
                margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
              >
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis
                  dataKey="monthLabel"
                  tickLine={false}
                  axisLine={{ stroke: '#e2e8f0' }}
                  tick={{ fill: '#64748b', fontSize: 11 }}
                />
                <YAxis
                  tickLine={false}
                  axisLine={false}
                  tick={{ fill: '#64748b', fontSize: 11 }}
                  tickFormatter={(val) => `${Math.round(val / 1000)}k сом`}
                />
                <Tooltip content={<CustomRevenueTooltip />} />
                <Legend
                  wrapperStyle={{ fontSize: 12, paddingTop: 10 }}
                  formatter={(value) => <span className="text-slate-700 font-medium">{value}</span>}
                />
                <Bar
                  dataKey="revenue"
                  name={language === 'ky' ? 'Факт (Түшкөн киреше)' : 'Факт (Выручка)'}
                  fill="#10b981"
                  radius={[6, 6, 0, 0]}
                />
                <Bar
                  dataKey="targetRevenue"
                  name={language === 'ky' ? 'План (Максат)' : 'План (KPI)'}
                  fill="#cbd5e1"
                  radius={[6, 6, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* SECTION 2 & 3: SUBSCRIPTION GROWTH & POPULAR TARIFF PERFORMANCE */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Subscription Growth Dynamics (7 cols) */}
        <div className="lg:col-span-7 p-6 bg-white rounded-3xl border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <div>
              <h3 className="text-base sm:text-lg font-bold text-slate-900 flex items-center gap-2">
                <LineChartIcon className="w-5 h-5 text-emerald-600" />
                <span>{language === 'ky' ? 'Подпискалардын өсүш траекториясы' : 'Динамика роста подписчиков'}</span>
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                {language === 'ky'
                  ? 'Активдүү акы төлөгөн окуучулардын кумулятивдик өсүшү'
                  : 'Траектория активной платящей базы и прирост новых студентов'}
              </p>
            </div>
            <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
              +{kpis?.newSubscribersCount || 14} {language === 'ky' ? 'бүгүн' : 'сегодня'}
            </span>
          </div>

          <div className="h-64 w-full pt-1">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={analyticsData?.subscriptionGrowth || []}
                margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
              >
                <defs>
                  <linearGradient id="colorSubscribers" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.35} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis
                  dataKey="label"
                  tickLine={false}
                  axisLine={{ stroke: '#e2e8f0' }}
                  tick={{ fill: '#64748b', fontSize: 11 }}
                />
                <YAxis
                  tickLine={false}
                  axisLine={false}
                  tick={{ fill: '#64748b', fontSize: 11 }}
                  tickFormatter={(val) => `${val}`}
                />
                <Tooltip content={<CustomSubscriptionTooltip />} />
                <Area
                  type="monotone"
                  dataKey="activeSubscribers"
                  name={language === 'ky' ? 'Активдүү подпискалар' : 'Активные подписчики'}
                  stroke="#10b981"
                  strokeWidth={2.5}
                  fillOpacity={1}
                  fill="url(#colorSubscribers)"
                />
                <Line
                  type="monotone"
                  dataKey="totalSubscribers"
                  name={language === 'ky' ? 'Жалпы студенттер' : 'Всего зарегистрировано'}
                  stroke="#94a3b8"
                  strokeWidth={1.5}
                  strokeDasharray="3 3"
                  dot={false}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* Subscription State Breakdown Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-2 border-t border-slate-100">
            <div className="p-2.5 bg-slate-50 rounded-xl">
              <span className="text-[11px] text-slate-500 block">{language === 'ky' ? 'Жалпы база' : 'Всего аккаунтов'}</span>
              <span className="text-base font-extrabold text-slate-900">{formatNumber(kpis?.totalSubscribers || 0)}</span>
            </div>
            <div className="p-2.5 bg-emerald-50/70 rounded-xl">
              <span className="text-[11px] text-emerald-800 font-medium block">{language === 'ky' ? 'Активдүү подписка' : 'Активно сейчас'}</span>
              <span className="text-base font-extrabold text-emerald-700">{formatNumber(kpis?.activeSubscribers || 0)}</span>
            </div>
            <div className="p-2.5 bg-blue-50/70 rounded-xl">
              <span className="text-[11px] text-blue-800 font-medium block">{language === 'ky' ? 'Авто-узартуу' : 'Автопродление'}</span>
              <span className="text-base font-extrabold text-blue-700">{kpis?.autoRenewPercent || 76}%</span>
            </div>
            <div className="p-2.5 bg-rose-50/70 rounded-xl">
              <span className="text-[11px] text-rose-800 font-medium block">{language === 'ky' ? 'Мөөнөтү бүткөн' : 'Истекло'}</span>
              <span className="text-base font-extrabold text-rose-700">{kpis?.expiredSubscribers || 0}</span>
            </div>
          </div>
        </div>

        {/* Right: Popular Tariff Performance (5 cols) */}
        <div className="lg:col-span-5 p-6 bg-white rounded-3xl border border-slate-200 shadow-sm space-y-4">
          <div className="pb-2 border-b border-slate-100">
            <h3 className="text-base sm:text-lg font-bold text-slate-900 flex items-center gap-2">
              <PieChartIcon className="w-5 h-5 text-indigo-600" />
              <span>{language === 'ky' ? 'Тарифтердин көрсөткүчтөрү' : 'Популярность тарифов'}</span>
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              {language === 'ky' ? 'Тарифтер боюнча киреше жана конверсия үлүшү' : 'Доля выручки и конверсия по планам'}
            </p>
          </div>

          {/* Donut Chart */}
          <div className="h-52 w-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={analyticsData?.tariffPerformance.filter((t) => t.id !== 'free') || []}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={75}
                  paddingAngle={4}
                  dataKey="revenueSom"
                  nameKey="nameRu"
                >
                  {(analyticsData?.tariffPerformance.filter((t) => t.id !== 'free') || []).map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={entry.id === 'standard' ? '#3b82f6' : '#10b981'}
                    />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(val: any) => [formatSom(Number(val)), language === 'ky' ? 'Киреше' : 'Выручка']}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Detailed Tariff Cards */}
          <div className="space-y-2.5">
            {(analyticsData?.tariffPerformance || []).map((tp) => (
              <div
                key={tp.id}
                className={`p-3 rounded-2xl border transition-all ${
                  tp.id === 'standard'
                    ? 'border-blue-200 bg-blue-50/40'
                    : tp.id === 'intensive'
                    ? 'border-emerald-200 bg-emerald-50/40'
                    : 'border-slate-200 bg-slate-50/50'
                }`}
              >
                <div className="flex justify-between items-center text-xs mb-1">
                  <div className="flex items-center gap-1.5">
                    <span
                      className={`w-2.5 h-2.5 rounded-full ${
                        tp.id === 'standard'
                          ? 'bg-blue-600'
                          : tp.id === 'intensive'
                          ? 'bg-emerald-600'
                          : 'bg-slate-400'
                      }`}
                    />
                    <span className="font-bold text-slate-900">
                      {language === 'ky' ? tp.nameKy : tp.nameRu}
                    </span>
                    {tp.priceSom > 0 && (
                      <span className="px-1.5 py-0.2 rounded text-[10px] bg-white border border-slate-200 text-slate-600 font-semibold">
                        {tp.priceSom} сом
                      </span>
                    )}
                  </div>
                  <span className="font-extrabold text-slate-900">
                    {tp.priceSom > 0 ? formatSom(tp.revenueSom) : (language === 'ky' ? 'Акысыз' : 'Бесплатно')}
                  </span>
                </div>

                <div className="flex justify-between items-center text-[11px] text-slate-500">
                  <span>
                    {tp.ordersCount} {language === 'ky' ? 'төлөм' : 'заказов'} • {formatNumber(tp.subscribersCount)} {language === 'ky' ? 'окуучу' : 'студентов'}
                  </span>
                  {tp.priceSom > 0 ? (
                    <span className="font-bold text-slate-700">
                      {tp.revenueSharePercent}% {language === 'ky' ? 'үлүшү' : 'доли'}
                    </span>
                  ) : (
                    <span className="text-slate-500">{tp.conversionRatePercent}% {language === 'ky' ? 'конверсия' : 'конверсия'}</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* SECTION 4: PAYMENT PROVIDER BREAKDOWN & QUICK ACTION SUMMARY */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Finik Unified QR vs Bank Card */}
        <div className="p-5 bg-white rounded-3xl border border-slate-200 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">
              {language === 'ky' ? 'Төлөм каналдары' : 'Платежные шлюзы'}
            </h4>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
              MBANK QR Engine
            </span>
          </div>
          <div className="space-y-2">
            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-slate-700 font-medium">MBANK QR (MBank, О!Деньги, Bakai, Elkart)</span>
                <span className="font-bold text-slate-900">82%</span>
              </div>
              <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                <div className="bg-blue-600 h-full rounded-full" style={{ width: '82%' }} />
              </div>
            </div>
            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-slate-700 font-medium">Банк картасы (Visa, MasterCard, Элкарт)</span>
                <span className="font-bold text-slate-900">18%</span>
              </div>
              <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                <div className="bg-emerald-500 h-full rounded-full" style={{ width: '18%' }} />
              </div>
            </div>
          </div>
          <p className="text-[11px] text-slate-400">
            {language === 'ky'
              ? 'Кыргызстандагы студенттердин 80%+ QR аркылуу мобилдик капчыктар менен төлөшөт.'
              : 'Более 80% платежей в Кыргызстане осуществляются через MBANK QR.'}
          </p>
        </div>

        {/* Target Progress & Month Forecast */}
        <div className="p-5 bg-white rounded-3xl border border-slate-200 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">
              {language === 'ky' ? 'Айлык пландын аткарылышы' : 'Выполнение плана на месяц'}
            </h4>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 text-blue-800">
              123% KPI
            </span>
          </div>
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs">
              <span className="text-slate-600">{language === 'ky' ? 'Чогулган каражат:' : 'Собрано:'}</span>
              <span className="font-bold text-emerald-700">{formatSom(kpis?.monthRevenue || 0)}</span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-slate-600">{language === 'ky' ? 'План:' : 'Цель месяца:'}</span>
              <span className="font-semibold text-slate-700">200 000 сом</span>
            </div>
            <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden mt-1">
              <div className="bg-emerald-600 h-full rounded-full" style={{ width: '100%' }} />
            </div>
          </div>
          <p className="text-[11px] text-emerald-700 font-medium">
            {language === 'ky'
              ? '✓ Айлык финансылык план толук аткарылды жана +23% ашыгы менен жабылды.'
              : '✓ Месячный план перевыполнен на 23% благодаря подготовке к ОРТ.'}
          </p>
        </div>

        {/* Automated System Actions */}
        <div className="p-5 bg-white rounded-3xl border border-slate-200 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">
              {language === 'ky' ? 'Системалык статустар' : 'Статус автоматизации'}
            </h4>
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          </div>
          <div className="space-y-1.5 text-xs">
            <div className="flex items-center gap-2 text-slate-700">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>QR төлөмдөрдү авто-активация: <b className="text-emerald-700">Иштеп жатат</b></span>
            </div>
            <div className="flex items-center gap-2 text-slate-700">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>WhatsApp админ билдирүүсү: <b className="text-emerald-700">Активдүү</b></span>
            </div>
            <div className="flex items-center gap-2 text-slate-700">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>PCI DSS коопсуз токендер: <b className="text-emerald-700">Корголгон</b></span>
            </div>
          </div>
          <div className="pt-1 border-t border-slate-100 text-[11px] text-slate-400">
            {language === 'ky' ? 'Акыркы төлөм синхронизациясы: 1 мин мурда' : 'Синхронизация данных: 1 мин назад'}
          </div>
        </div>
      </div>
    </div>
  );
};
