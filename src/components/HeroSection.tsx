import React from 'react';
import { useApp } from '../context/AppContext';
import {
  Sparkles,
  ArrowRight,
  TrendingUp,
  Target,
  BrainCircuit,
  CheckCircle2,
  Clock,
  Award
} from 'lucide-react';

export const HeroSection: React.FC = () => {
  const { t, language, navigate } = useApp();

  const scrollToHowItWorks = () => {
    const el = document.getElementById('how-it-works-section');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section className="relative overflow-hidden pt-8 pb-16 lg:pt-14 lg:pb-24 bg-gradient-to-b from-blue-50/60 via-slate-50 to-white">
      {/* Subtle decorative background blur shapes */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-96 pointer-events-none overflow-hidden -z-10">
        <div className="absolute top-10 left-1/4 w-80 h-80 bg-blue-400/10 rounded-full blur-3xl"></div>
        <div className="absolute top-20 right-1/4 w-96 h-96 bg-cyan-400/10 rounded-full blur-3xl"></div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          {/* Left Column: Heading & CTAs */}
          <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-100/80 border border-blue-200/80 text-blue-900 text-xs font-semibold">
              <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></span>
              <Sparkles className="w-3.5 h-3.5 text-blue-700" />
              <span>{language === 'ky' ? 'Жалпы республикалык тестирлөө 2026' : 'Общереспубликанское тестирование 2026'}</span>
            </div>

            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-slate-900 leading-[1.15]">
              {language === 'ky' ? (
                <>
                  Жеке <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-700 via-blue-600 to-cyan-600">онлайн-репетитор</span> менен ОРТга даярдан
                </>
              ) : (
                <>
                  Подготовься к ОРТ вместе с персональным <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-700 via-blue-600 to-cyan-600">онлайн-репетитором</span>
                </>
              )}
            </h1>

            <p className="text-base sm:text-lg text-slate-600 max-w-2xl mx-auto lg:mx-0 leading-relaxed">
              {t.heroSubtitle}
            </p>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 pt-2">
              <button
                id="hero-btn-start-diagnostic"
                onClick={() => navigate('diagnostic')}
                className="w-full sm:w-auto px-7 py-3.5 rounded-xl bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-bold text-base shadow-lg shadow-blue-600/25 hover:shadow-blue-600/35 transition-all flex items-center justify-center gap-2.5 group cursor-pointer"
              >
                <span>{t.btnStartFreeTest}</span>
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </button>

              <button
                id="hero-btn-how-it-works"
                onClick={scrollToHowItWorks}
                className="w-full sm:w-auto px-6 py-3.5 rounded-xl bg-white hover:bg-slate-50 text-slate-700 font-semibold text-base border border-slate-200/90 shadow-xs transition-colors flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>{t.btnHowItWorks}</span>
              </button>
            </div>

            {/* Trust bullet markers */}
            <div className="pt-4 flex flex-wrap items-center justify-center lg:justify-start gap-y-2 gap-x-6 text-xs text-slate-500 font-medium">
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>{language === 'ky' ? 'Акысыз баштапкы тест' : 'Бесплатный входной тест'}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>{language === 'ky' ? 'ОРТнын расмий форматы' : 'Формат заданий ОРТ'}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>{language === 'ky' ? 'Кыргыз жана орус тилинде' : 'На кыргызском и русском'}</span>
              </div>
            </div>
          </div>

          {/* Right Column: Interactive Demonstration Result Card */}
          <div className="lg:col-span-5">
            <div className="relative mx-auto max-w-md lg:max-w-none">
              {/* Outer decorative card container */}
              <div className="bg-white rounded-3xl border border-slate-200/90 p-6 sm:p-7 shadow-xl shadow-slate-200/50 relative overflow-hidden">
                {/* Demo Badge */}
                <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-5">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-sm">
                      <BrainCircuit className="w-4 h-4" />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-slate-900 leading-tight">
                        {language === 'ky' ? 'Диагностикалык отчет' : 'Диагностический отчет'}
                      </h3>
                      <p className="text-[11px] text-slate-500">ОРТ Онлайн Аналитикасы</p>
                    </div>
                  </div>
                  <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-semibold bg-amber-50 text-amber-800 border border-amber-200">
                    {t.sampleResultBadge}
                  </span>
                </div>

                {/* Score Goals Grid */}
                <div className="grid grid-cols-2 gap-3 mb-5">
                  <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100">
                    <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium mb-1">
                      <Clock className="w-3.5 h-3.5 text-slate-400" />
                      <span>{t.sampleCurrentScore}</span>
                    </div>
                    <div className="flex items-baseline gap-1">
                      <span className="text-2xl font-black text-slate-800">128</span>
                      <span className="text-xs text-slate-500">{t.sampleScoreUnit}</span>
                    </div>
                    <span className="text-[10px] text-amber-700 font-semibold mt-0.5 block">
                      {language === 'ky' ? 'Базалык деңгээл' : 'Базовый уровень'}
                    </span>
                  </div>

                  <div className="p-3.5 rounded-2xl bg-blue-50/70 border border-blue-100">
                    <div className="flex items-center gap-1.5 text-xs text-blue-800 font-medium mb-1">
                      <Target className="w-3.5 h-3.5 text-blue-600" />
                      <span>{t.sampleGoalScore}</span>
                    </div>
                    <div className="flex items-baseline gap-1">
                      <span className="text-2xl font-black text-blue-700">180+</span>
                      <span className="text-xs text-blue-600 font-medium">{t.sampleScoreUnit}</span>
                    </div>
                    <span className="text-[10px] text-emerald-700 font-semibold mt-0.5 block">
                      {language === 'ky' ? 'Бюджетке өтүү' : 'Шанс на бюджет'}
                    </span>
                  </div>
                </div>

                {/* Preparation Progress Bar (64%) */}
                <div className="mb-5 p-3.5 rounded-2xl bg-slate-50/80 border border-slate-100">
                  <div className="flex items-center justify-between text-xs font-semibold text-slate-700 mb-2">
                    <span className="flex items-center gap-1.5">
                      <TrendingUp className="w-3.5 h-3.5 text-emerald-600" />
                      {t.samplePrepProgress}
                    </span>
                    <span className="text-blue-700 font-bold">64%</span>
                  </div>
                  <div className="w-full bg-slate-200 rounded-full h-2.5 overflow-hidden">
                    <div
                      className="bg-gradient-to-r from-blue-600 to-emerald-500 h-2.5 rounded-full transition-all duration-1000"
                      style={{ width: '64%' }}
                    ></div>
                  </div>
                  <div className="flex justify-between text-[10px] text-slate-400 mt-1.5">
                    <span>{language === 'ky' ? 'Башталышы: 0%' : 'Старт: 0%'}</span>
                    <span>{language === 'ky' ? 'Максат: 100%' : 'Цель: 100%'}</span>
                  </div>
                </div>

                {/* Weak Topics Card */}
                <div className="p-3.5 rounded-2xl bg-rose-50/60 border border-rose-100/80">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold text-rose-900">
                      {t.sampleWeakTopics}:
                    </span>
                    <span className="text-[10px] font-semibold text-rose-700 bg-rose-100 px-2 py-0.5 rounded-md">
                      {language === 'ky' ? 'Көңүл бур' : 'Требует внимания'}
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    <span className="text-xs font-medium px-2.5 py-1 rounded-lg bg-white border border-rose-200 text-rose-800 shadow-2xs">
                      {language === 'ky' ? 'Математика (Геометрия)' : 'Математика (Геометрия)'}
                    </span>
                    <span className="text-xs font-medium px-2.5 py-1 rounded-lg bg-white border border-rose-200 text-rose-800 shadow-2xs">
                      {language === 'ky' ? 'Аналогиялар (Логика)' : 'Аналогии (Логика)'}
                    </span>
                    <span className="text-xs font-medium px-2.5 py-1 rounded-lg bg-white border border-rose-200 text-rose-800 shadow-2xs">
                      {language === 'ky' ? 'Текстти окуп түшүнүү' : 'Чтение текста'}
                    </span>
                  </div>
                </div>

                {/* Interactive CTA underneath sample card */}
                <button
                  id="hero-card-cta"
                  onClick={() => navigate('diagnostic')}
                  className="w-full mt-4 py-2.5 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-700 font-bold text-xs transition-colors flex items-center justify-center gap-1.5"
                >
                  <Award className="w-3.5 h-3.5" />
                  <span>
                    {language === 'ky'
                      ? 'Өзүңүздүн жыйынтыгыңызды аныктоо'
                      : 'Определить свой реальный результат'}
                  </span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
