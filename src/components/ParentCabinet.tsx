import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  Users,
  TrendingUp,
  AlertTriangle,
  CalendarCheck,
  CreditCard,
  HeartHandshake,
  CheckCircle2,
  Phone,
  Link2,
  ArrowUpRight
} from 'lucide-react';

export const ParentCabinet: React.FC = () => {
  const { language, t, openPayment } = useApp();
  const [studentPhoneLink, setStudentPhoneLink] = useState('+996 700 891 234');
  const [isLinked, setIsLinked] = useState(true);

  return (
    <div className="min-h-screen bg-slate-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header Bar */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/90 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center border border-rose-100 shrink-0">
              <Users className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-black text-slate-900">
                {t.parentCabinetTitle}
              </h1>
              <p className="text-xs sm:text-sm text-slate-500">
                {t.parentCabinetSubtitle}
              </p>
            </div>
          </div>

          {/* Child account binding badge / control */}
          <div className="flex items-center gap-3 bg-slate-50 p-2.5 rounded-2xl border border-slate-200">
            <div className="flex items-center gap-2 text-xs font-semibold text-slate-700">
              <Link2 className="w-4 h-4 text-blue-600" />
              <span>{t.parentLinkedChild}:</span>
              <span className="font-bold text-slate-900">Азамат (+996 700 891 234)</span>
            </div>
            <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
              {language === 'ky' ? 'Байланган' : 'Привязан'}
            </span>
          </div>
        </div>

        {/* 4 Core Parent Overview Metrics */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {/* Predicted score jump */}
          <div className="p-5 bg-white rounded-2xl border border-slate-200/80 shadow-2xs">
            <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
              <span>{t.parentScoreDynamics}</span>
              <TrendingUp className="w-4 h-4 text-emerald-600" />
            </div>
            <div className="flex items-baseline gap-1.5 mt-1">
              <span className="text-3xl font-black text-slate-900">138</span>
              <span className="text-xs font-bold text-emerald-600">+16 балл</span>
            </div>
            <span className="text-[11px] text-slate-500 block mt-1">
              {language === 'ky' ? 'Башталышы: 122 балл' : 'Старт: 122 балла'}
            </span>
          </div>

          {/* Plan completion rate */}
          <div className="p-5 bg-white rounded-2xl border border-slate-200/80 shadow-2xs">
            <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
              <span>{t.parentPlanCompletionRate}</span>
              <CalendarCheck className="w-4 h-4 text-blue-600" />
            </div>
            <div className="flex items-baseline gap-1.5 mt-1">
              <span className="text-3xl font-black text-blue-700">84%</span>
            </div>
            <span className="text-[11px] text-emerald-600 font-medium block mt-1">
              {language === 'ky' ? 'Бул жумада 6 күн аткарды' : '6 из 7 дней выполнены'}
            </span>
          </div>

          {/* Time spent studying */}
          <div className="p-5 bg-white rounded-2xl border border-slate-200/80 shadow-2xs">
            <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
              <span>{t.parentWeeklyActivity}</span>
              <CheckCircle2 className="w-4 h-4 text-purple-600" />
            </div>
            <div className="flex items-baseline gap-1.5 mt-1">
              <span className="text-3xl font-black text-slate-900">2 ч 25 м</span>
            </div>
            <span className="text-[11px] text-slate-500 block mt-1">
              {language === 'ky' ? 'Күнүнө орточо 20 мүнөт' : 'В среднем 20 мин/день'}
            </span>
          </div>

          {/* Subscription Status */}
          <div className="p-5 bg-white rounded-2xl border border-slate-200/80 shadow-2xs">
            <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
              <span>{t.parentSubscriptionStatus}</span>
              <CreditCard className="w-4 h-4 text-emerald-600" />
            </div>
            <div className="mt-1">
              <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 inline-block">
                Стандарт (Активдүү)
              </span>
            </div>
            <span className="text-[11px] text-slate-500 block mt-2">
              {language === 'ky' ? 'Кийинки төлөм: 24-октябрь' : 'Продление: 24 октября'}
            </span>
          </div>
        </div>

        {/* Difficult Topics Report */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/90 shadow-sm space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
            <AlertTriangle className="w-5 h-5 text-amber-500" />
            <h2 className="text-base sm:text-lg font-bold text-slate-900">
              {t.parentDifficultTopicsTitle}
            </h2>
          </div>
          <p className="text-xs sm:text-sm text-slate-600">
            {language === 'ky'
              ? 'Бул темалар боюнча окуучу бир нече ката кетирген. Система автоматтык түрдө бул суроолорду кайталоо бөлүмүнө кошкон:'
              : 'По этим темам школьник чаще всего совершает ошибки. Алгоритм уже добавил их в приоритетное повторение:'}
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
            <div className="p-4 rounded-2xl bg-amber-50/50 border border-amber-200/80 text-xs">
              <div className="flex justify-between font-bold text-slate-900 mb-1">
                <span>{language === 'ky' ? 'Математика: Планиметрия жана фигуралар' : 'Математика: Планиметрия и свойства фигур'}</span>
                <span className="text-amber-700">40% туура</span>
              </div>
              <p className="text-slate-500">
                {language === 'ky' ? 'Формулаларды жаттоо жана сызгычсыз чиймелерди элестетүү сунушталат.' : 'Рекомендуется уделить внимание визуализации без линейки.'}
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-amber-50/50 border border-amber-200/80 text-xs">
              <div className="flex justify-between font-bold text-slate-900 mb-1">
                <span>{language === 'ky' ? 'Аналогиялар: Себеп-натыйжа катыштары' : 'Аналогии: Причинно-следственные связи'}</span>
                <span className="text-amber-700">50% туура</span>
              </div>
              <p className="text-slate-500">
                {language === 'ky' ? 'Сөздөрдүн ортосундагы байланышты сүйлөмгө салып текшерүү керек.' : 'Помогает проверка связи через подстановку в короткое предложение.'}
              </p>
            </div>
          </div>
        </div>

        {/* Useful Advice & Psychology Tips for Parents */}
        <div className="bg-gradient-to-br from-blue-50 to-indigo-50/50 rounded-3xl p-6 sm:p-8 border border-blue-100 shadow-sm space-y-4">
          <div className="flex items-center gap-2 border-b border-blue-200/60 pb-3">
            <HeartHandshake className="w-5 h-5 text-blue-600" />
            <h2 className="text-base sm:text-lg font-bold text-slate-900">
              {t.parentAdviceTitle}
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 pt-2">
            <div className="p-4 bg-white rounded-2xl border border-blue-100 text-xs space-y-1.5 shadow-2xs">
              <span className="w-6 h-6 rounded-full bg-blue-100 text-blue-700 font-bold flex items-center justify-center text-xs mb-2">1</span>
              <h4 className="font-bold text-slate-900">{t.parentTip1Title}</h4>
              <p className="text-slate-600 leading-relaxed">{t.parentTip1Desc}</p>
            </div>

            <div className="p-4 bg-white rounded-2xl border border-blue-100 text-xs space-y-1.5 shadow-2xs">
              <span className="w-6 h-6 rounded-full bg-blue-100 text-blue-700 font-bold flex items-center justify-center text-xs mb-2">2</span>
              <h4 className="font-bold text-slate-900">{t.parentTip2Title}</h4>
              <p className="text-slate-600 leading-relaxed">{t.parentTip2Desc}</p>
            </div>

            <div className="p-4 bg-white rounded-2xl border border-blue-100 text-xs space-y-1.5 shadow-2xs">
              <span className="w-6 h-6 rounded-full bg-blue-100 text-blue-700 font-bold flex items-center justify-center text-xs mb-2">3</span>
              <h4 className="font-bold text-slate-900">{t.parentTip3Title}</h4>
              <p className="text-slate-600 leading-relaxed">{t.parentTip3Desc}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
