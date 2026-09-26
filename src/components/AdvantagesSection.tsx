import React from 'react';
import { useApp } from '../context/AppContext';
import {
  FileText,
  Languages,
  Lightbulb,
  Compass,
  Timer,
  BarChart3,
  Users,
  Smartphone
} from 'lucide-react';

export const AdvantagesSection: React.FC = () => {
  const { t } = useApp();

  const advantages = [
    {
      icon: FileText,
      title: t.adv1Title,
      desc: t.adv1Desc,
      iconColor: 'text-blue-600',
      bgColor: 'bg-blue-50 border-blue-100'
    },
    {
      icon: Languages,
      title: t.adv2Title,
      desc: t.adv2Desc,
      iconColor: 'text-cyan-600',
      bgColor: 'bg-cyan-50 border-cyan-100'
    },
    {
      icon: Lightbulb,
      title: t.adv3Title,
      desc: t.adv3Desc,
      iconColor: 'text-amber-600',
      bgColor: 'bg-amber-50 border-amber-100'
    },
    {
      icon: Compass,
      title: t.adv4Title,
      desc: t.adv4Desc,
      iconColor: 'text-emerald-600',
      bgColor: 'bg-emerald-50 border-emerald-100'
    },
    {
      icon: Timer,
      title: t.adv5Title,
      desc: t.adv5Desc,
      iconColor: 'text-indigo-600',
      bgColor: 'bg-indigo-50 border-indigo-100'
    },
    {
      icon: BarChart3,
      title: t.adv6Title,
      desc: t.adv6Desc,
      iconColor: 'text-purple-600',
      bgColor: 'bg-purple-50 border-purple-100'
    },
    {
      icon: Users,
      title: t.adv7Title,
      desc: t.adv7Desc,
      iconColor: 'text-rose-600',
      bgColor: 'bg-rose-50 border-rose-100'
    },
    {
      icon: Smartphone,
      title: t.adv8Title,
      desc: t.adv8Desc,
      iconColor: 'text-sky-600',
      bgColor: 'bg-sky-50 border-sky-100'
    }
  ];

  return (
    <section className="py-16 sm:py-20 bg-slate-50/70">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-14">
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 mb-3">
            {t.advantagesTitle}
          </h2>
          <p className="text-base text-slate-600">
            {t.advantagesSubtitle}
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {advantages.map((adv, index) => {
            const Icon = adv.icon;
            return (
              <div
                key={index}
                className="p-5 bg-white rounded-2xl border border-slate-200/80 shadow-2xs hover:shadow-md hover:-translate-y-0.5 transition-all duration-200"
              >
                <div className={`w-11 h-11 rounded-xl flex items-center justify-center mb-4 border ${adv.bgColor}`}>
                  <Icon className={`w-5 h-5 ${adv.iconColor}`} />
                </div>
                <h3 className="text-base font-bold text-slate-900 mb-1.5 leading-snug">
                  {adv.title}
                </h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  {adv.desc}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
