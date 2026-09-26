import React from 'react';
import { useApp } from '../context/AppContext';
import { demoTestimonials } from '../data/initialData';
import { Star, AlertCircle } from 'lucide-react';

export const TestimonialsSection: React.FC = () => {
  const { language, t } = useApp();

  return (
    <section className="py-16 sm:py-20 bg-slate-50 border-t border-slate-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-10">
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 mb-3">
            {t.testimonialsTitle}
          </h2>
          <p className="text-base text-slate-600">
            {t.testimonialsSubtitle}
          </p>
        </div>

        {/* Explicit Required Disclaimer Banner */}
        <div className="max-w-3xl mx-auto mb-10 p-3.5 rounded-2xl bg-amber-50/90 border border-amber-200 text-amber-900 text-xs flex items-start sm:items-center gap-3">
          <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5 sm:mt-0" />
          <p className="leading-relaxed">
            {t.demoTestimonialsNotice}
          </p>
        </div>

        {/* Testimonials Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {demoTestimonials.map((item) => (
            <div
              key={item.id}
              className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl p-2 rounded-xl bg-slate-100">{item.avatar}</span>
                    <div>
                      <h3 className="text-sm font-bold text-slate-900">{item.author[language]}</h3>
                      <p className="text-[11px] text-slate-500">{item.role[language]}</p>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-1 mb-3">
                  {[...Array(item.rating)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
                  ))}
                </div>

                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed italic mb-4">
                  "{item.text[language]}"
                </p>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                <span className="text-[10px] text-slate-400">
                  {language === 'ky' ? 'Динамика' : 'Динамика'}:
                </span>
                <span className="text-xs font-extrabold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md">
                  {item.scoreJump}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
