import React from 'react';
import { useApp } from '../context/AppContext';
import { tariffPlans } from '../data/initialData';
import { Check, Sparkles, ArrowRight } from 'lucide-react';
import { TariffPlan } from '../types';

export const TariffsSection: React.FC = () => {
  const { language, t, openPayment, navigate } = useApp();

  const handlePlanAction = (plan: TariffPlan) => {
    if (plan.id === 'free') {
      navigate('diagnostic');
    } else {
      openPayment(plan);
    }
  };

  return (
    <section id="tariffs-section" className="py-16 sm:py-24 bg-gradient-to-b from-slate-50 to-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-14">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 text-xs font-semibold mb-3 border border-emerald-200">
            <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
            <span>{language === 'ky' ? 'Ачык баалар сом менен' : 'Прозрачные цены в сомах'}</span>
          </div>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight text-slate-900 mb-3">
            {t.pricingTitle}
          </h2>
          <p className="text-base text-slate-600">
            {t.pricingSubtitle}
          </p>
        </div>

        {/* Tariffs 3-Card Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-stretch max-w-6xl mx-auto">
          {tariffPlans.map((plan) => {
            const isStandard = plan.id === 'standard';
            const isPremium = plan.id === 'premium' || plan.id === 'intensive';

            return (
              <div
                key={plan.id}
                className={`relative rounded-3xl p-7 flex flex-col justify-between transition-all duration-200 ${
                  isStandard
                    ? 'bg-white border-2 border-blue-600 shadow-xl shadow-blue-500/10 lg:-translate-y-2'
                    : isPremium
                    ? 'bg-gradient-to-b from-slate-900 via-slate-900 to-slate-800 text-white border-2 border-amber-500/40 shadow-xl shadow-amber-500/5'
                    : 'bg-white border border-slate-200/90 shadow-sm'
                }`}
              >
                {/* Popular / Premium Badge */}
                {plan.badge && (
                  <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 whitespace-nowrap">
                    <span
                      className={`px-3.5 py-1 rounded-full text-xs font-bold shadow-xs ${
                        isStandard
                          ? 'bg-blue-600 text-white'
                          : 'bg-gradient-to-r from-amber-400 to-amber-500 text-slate-950 font-extrabold'
                      }`}
                    >
                      {plan.badge[language]}
                    </span>
                  </div>
                )}

                <div>
                  <div className="mb-4">
                    <h3
                      className={`text-xl font-bold ${
                        isPremium ? 'text-white' : 'text-slate-900'
                      }`}
                    >
                      {plan.name[language]}
                    </h3>
                    <p
                      className={`text-xs mt-1 leading-relaxed ${
                        isPremium ? 'text-slate-300' : 'text-slate-500'
                      }`}
                    >
                      {plan.description[language]}
                    </p>
                  </div>

                  {/* Price Block: Formatted per specification */}
                  {plan.id === 'standard' ? (
                    <div className="py-4 my-3 border-y border-slate-100">
                      <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                        <span className="text-base line-through text-slate-400 font-semibold">2 000 сом</span>
                        <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-amber-100 text-amber-800 border border-amber-200">
                          {language === 'ky' ? '50% арзандатуу промокод менен' : '50% скидка по промокоду'}
                        </span>
                      </div>
                      <div className="flex items-baseline gap-1.5">
                        <span className="text-xs font-bold text-blue-600 uppercase tracking-wider">
                          {language === 'ky' ? 'Итого:' : 'Итого:'}
                        </span>
                        <span className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900">
                          1 000
                        </span>
                        <span className="text-sm font-semibold text-slate-600">
                          сом / {language === 'ky' ? 'ай (1 айлык модуль)' : 'месяц'}
                        </span>
                      </div>
                    </div>
                  ) : plan.id === 'premium' || plan.id === 'intensive' ? (
                    <div className="py-4 my-3 border-y border-slate-800">
                      <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                        <span className="text-base line-through text-slate-400 font-semibold">16 000 сом</span>
                        <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-rose-500/20 text-rose-300 border border-rose-400/30">
                          {language === 'ky' ? '70% эксклюзив арзандатуу' : '70% эксклюзивная скидка'}
                        </span>
                        <span className="text-[11px] text-amber-300 font-medium">
                          {language === 'ky' ? 'Только по промокоду' : 'Только по промокоду'}
                        </span>
                      </div>
                      <div className="flex items-baseline gap-1.5">
                        <span className="text-xs font-bold text-amber-400 uppercase tracking-wider">
                          {language === 'ky' ? 'Итого:' : 'Итого:'}
                        </span>
                        <span className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white">
                          4 800
                        </span>
                        <span className="text-sm font-semibold text-slate-300">
                          сом {language === 'ky' ? 'толук курс үчүн (8 ай)' : 'за полный курс (8 месяцев)'}
                        </span>
                      </div>
                    </div>
                  ) : (
                    <div className="py-4 my-3 border-y border-slate-100 flex items-baseline gap-1.5">
                      <span className="text-4xl font-extrabold tracking-tight text-slate-900">
                        0
                      </span>
                      <span className="text-sm font-semibold text-slate-600">
                        сом {plan.period[language]}
                      </span>
                    </div>
                  )}

                  {/* Features List */}
                  <ul className="space-y-3 my-6">
                    {plan.features[language].map((feature, fIdx) => (
                      <li key={fIdx} className="flex items-start gap-3 text-xs sm:text-sm">
                        <div
                          className={`mt-0.5 rounded-full p-0.5 shrink-0 ${
                            isPremium
                              ? 'bg-emerald-500/20 text-emerald-400'
                              : 'bg-emerald-100 text-emerald-700'
                          }`}
                        >
                          <Check className="w-3.5 h-3.5" />
                        </div>
                        <span className={isPremium ? 'text-slate-200' : 'text-slate-700'}>
                          {feature}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Big Action Button */}
                <div className="pt-4">
                  <button
                    id={`tariff-btn-${plan.id}`}
                    onClick={() => handlePlanAction(plan)}
                    className={`w-full py-3.5 px-5 rounded-xl font-bold text-sm transition-all flex items-center justify-center gap-2 cursor-pointer ${
                      isStandard
                        ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-md shadow-blue-600/30'
                        : isPremium
                        ? 'bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-500 hover:to-amber-600 text-slate-950 shadow-md shadow-amber-400/20'
                        : 'bg-slate-100 hover:bg-slate-200 text-slate-800'
                    }`}
                  >
                    <span>{plan.id === 'free' ? t.btnStartFreeTest : t.btnStartPlan}</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                  <p
                    className={`text-[11px] text-center mt-2 ${
                      isPremium ? 'text-slate-400' : 'text-slate-500'
                    }`}
                  >
                    {plan.id === 'free'
                      ? (language === 'ky' ? 'Банк картасы талап кылынбайт (1 жолу)' : 'Без привязки карты (1 раз)')
                      : (language === 'ky' ? 'Каалаган убакта токтотууга болот' : 'Отмена в любой момент')}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
