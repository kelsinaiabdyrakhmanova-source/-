import React from 'react';
import { useApp } from '../context/AppContext';
import {
  UserPlus,
  FileCheck2,
  SearchCode,
  CalendarCheck,
  Flame,
  TrendingUp,
  ArrowRight
} from 'lucide-react';

export const HowItWorksSection: React.FC = () => {
  const { t, navigate } = useApp();

  const steps = [
    {
      step: '01',
      icon: UserPlus,
      title: t.step1Title,
      desc: t.step1Desc,
      accent: 'border-blue-500 text-blue-600 bg-blue-50'
    },
    {
      step: '02',
      icon: FileCheck2,
      title: t.step2Title,
      desc: t.step2Desc,
      accent: 'border-cyan-500 text-cyan-600 bg-cyan-50'
    },
    {
      step: '03',
      icon: SearchCode,
      title: t.step3Title,
      desc: t.step3Desc,
      accent: 'border-amber-500 text-amber-600 bg-amber-50'
    },
    {
      step: '04',
      icon: CalendarCheck,
      title: t.step4Title,
      desc: t.step4Desc,
      accent: 'border-indigo-500 text-indigo-600 bg-indigo-50'
    },
    {
      step: '05',
      icon: Flame,
      title: t.step5Title,
      desc: t.step5Desc,
      accent: 'border-emerald-500 text-emerald-600 bg-emerald-50'
    },
    {
      step: '06',
      icon: TrendingUp,
      title: t.step6Title,
      desc: t.step6Desc,
      accent: 'border-purple-500 text-purple-600 bg-purple-50'
    }
  ];

  return (
    <section id="how-it-works-section" className="py-16 sm:py-20 bg-white border-y border-slate-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-14">
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 mb-3">
            {t.howItWorksTitle}
          </h2>
          <p className="text-base text-slate-600">
            {t.howItWorksSubtitle}
          </p>
        </div>

        {/* 6 Steps Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
          {steps.map((item, idx) => {
            const Icon = item.icon;
            return (
              <div
                key={idx}
                className="relative p-6 rounded-2xl bg-slate-50 border border-slate-200/70 hover:border-blue-300 hover:bg-blue-50/20 hover:shadow-md transition-all duration-200 flex flex-col justify-between group"
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${item.accent} border shadow-2xs`}>
                      <Icon className="w-6 h-6" />
                    </div>
                    <span className="text-2xl font-black text-slate-300 group-hover:text-blue-300 transition-colors">
                      {item.step}
                    </span>
                  </div>

                  <h3 className="text-lg font-bold text-slate-900 mb-2">
                    {item.title}
                  </h3>
                  <p className="text-sm text-slate-600 leading-relaxed">
                    {item.desc}
                  </p>
                </div>

                <div className="pt-4 mt-4 border-t border-slate-200/60 flex items-center text-xs font-semibold text-blue-600 opacity-0 group-hover:opacity-100 transition-opacity">
                  <span>Шаг {idx + 1}</span>
                  <ArrowRight className="w-3.5 h-3.5 ml-1" />
                </div>
              </div>
            );
          })}
        </div>

        {/* Quick CTA */}
        <div className="mt-12 text-center">
          <button
            id="btn-how-it-works-start-test"
            onClick={() => navigate('diagnostic')}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm shadow-md transition-all cursor-pointer"
          >
            <span>{t.btnStartFreeTest}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </section>
  );
};
