import React from 'react';
import { useApp } from '../context/AppContext';
import { subjectsList } from '../data/initialData';
import {
  Calculator,
  BrainCircuit,
  BookOpen,
  FileText,
  Languages,
  BookA,
  Globe,
  Landmark,
  Atom,
  FlaskConical,
  Dna,
  ArrowRight,
  Lock
} from 'lucide-react';
import { SubjectId } from '../types';

const iconMap: Record<string, React.FC<{ className?: string }>> = {
  Calculator,
  BrainCircuit,
  BookOpen,
  FileText,
  Languages,
  BookA,
  Globe,
  Landmark,
  Atom,
  FlaskConical,
  Dna
};

export const SubjectsSection: React.FC = () => {
  const { language, t, navigate, setSelectedSubject } = useApp();

  const handleSubjectClick = (subjectId: SubjectId, isActive: boolean) => {
    if (isActive) {
      setSelectedSubject(subjectId);
      navigate('training-topic');
    }
  };

  return (
    <section className="py-16 sm:py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-14">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-semibold mb-3 border border-blue-100">
            <span>{language === 'ky' ? 'ОРТ Базасы' : 'База ОРТ'}</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 mb-3">
            {t.subjectsTitle}
          </h2>
          <p className="text-base text-slate-600">
            {t.subjectsSubtitle}
          </p>
        </div>

        {/* Subjects Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {subjectsList.map((subject) => {
            const IconComponent = iconMap[subject.iconName] || BookOpen;
            const isActive = subject.isActive;

            return (
              <div
                key={subject.id}
                onClick={() => handleSubjectClick(subject.id, isActive)}
                className={`p-6 rounded-2xl border transition-all duration-200 flex flex-col justify-between ${
                  isActive
                    ? 'bg-white border-slate-200/90 hover:border-blue-500 hover:shadow-lg hover:-translate-y-1 cursor-pointer group'
                    : 'bg-slate-50/70 border-slate-200/50 opacity-75 cursor-not-allowed'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div
                      className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                        isActive
                          ? 'bg-blue-50 text-blue-600 border border-blue-100 group-hover:bg-blue-600 group-hover:text-white transition-colors'
                          : 'bg-slate-200/60 text-slate-500'
                      }`}
                    >
                      <IconComponent className="w-6 h-6" />
                    </div>

                    <span
                      className={`text-[11px] font-bold px-2.5 py-1 rounded-full ${
                        isActive
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : 'bg-slate-200/60 text-slate-600'
                      }`}
                    >
                      {isActive ? t.badgeActive : t.badgeSoon}
                    </span>
                  </div>

                  <h3 className="text-lg font-bold text-slate-900 mb-2 group-hover:text-blue-600 transition-colors">
                    {subject.name[language]}
                  </h3>
                  <p className="text-xs text-slate-600 leading-relaxed line-clamp-2">
                    {subject.description[language]}
                  </p>
                </div>

                <div className="pt-5 mt-5 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-[11px] text-slate-500 font-medium">
                    {isActive
                      ? `${subject.totalQuestions} ${language === 'ky' ? 'суроо' : 'заданий'}`
                      : (language === 'ky' ? 'Даярдалууда' : 'В разработке')}
                  </span>

                  {isActive ? (
                    <span className="text-xs font-bold text-blue-600 flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                      {t.btnPracticeTopic}
                      <ArrowRight className="w-3.5 h-3.5" />
                    </span>
                  ) : (
                    <span className="text-[11px] font-semibold text-slate-400 flex items-center gap-1">
                      <Lock className="w-3 h-3" />
                      {t.badgeSoon}
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
