import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  Award,
  CheckCircle2,
  AlertTriangle,
  Calendar,
  Clock,
  ArrowRight,
  TrendingUp,
  Sparkles,
  Zap,
  BookOpen,
  Info,
  XCircle,
  HelpCircle,
  BarChart3,
  RotateCcw,
  CheckSquare,
  Play,
  Target
} from 'lucide-react';
import { tariffPlans } from '../data/initialData';

export const DiagnosticResultView: React.FC = () => {
  const { diagnosticResult, language, t, navigate, openPayment, setSelectedSubject } = useApp();

  // Daily study time selector (Requirement 2: 30 мин, 45 мин, 60 мин, 90 мин, 120 мин)
  const [dailyMinutes, setDailyMinutes] = useState<30 | 45 | 60 | 90 | 120>(60);

  const isKy = language === 'ky';

  // Fallback if user lands directly without completing test
  const res = diagnosticResult || {
    id: 'demo-res',
    completedAt: '2026-09-24',
    estimatedPredictedScore: 155,
    predictedScore: 155,
    totalQuestions: 20,
    correctCount: 14,
    incorrectCount: 5,
    skippedCount: 1,
    accuracyPercentage: 70,
    targetScore: 195,
    recommendedStartTopic: isKy ? 'Математика: Проценттер жана пропорциялар' : 'Математика: Проценты и скидки',
    disclaimer: {
      ky: 'Бул балл ОРТ Онлайн платформасынын ички диагностикалык тестинин жыйынтыгы боюнча болжолдуу баа болуп саналат жана БББАУнун (ЦООМО) расмий сертификаты эмес. Ал сиздин күчтүү жана алсыз жактарыңызды аныктоо үчүн түзүлгөн.',
      ru: 'Данный балл является ориентировочной оценкой на основе внутреннего диагностического тестирования ОРТ Онлайн и не является официальным сертификатом ЦООМО. Он отражает текущую готовность и зоны роста.'
    },
    subjectBreakdown: [
      { subjectId: 'math', name: isKy ? 'Математика' : 'Математика', total: 6, correct: 4, accuracy: 67 },
      { subjectId: 'analogies', name: isKy ? 'Аналогиялар (Окшоштуктар)' : 'Аналогии', total: 4, correct: 3, accuracy: 75 },
      { subjectId: 'sentences', name: isKy ? 'Сүйлөмдөрдү толуктоо' : 'Дополнение предложений', total: 3, correct: 2, accuracy: 67 },
      { subjectId: 'reading', name: isKy ? 'Окуп түшүнүү' : 'Чтение текста', total: 4, correct: 3, accuracy: 75 },
      { subjectId: 'grammar', name: isKy ? 'Практикалык грамматика' : 'Практическая грамматика', total: 3, correct: 2, accuracy: 67 }
    ],
    weakestTopics: [
      {
        topic: isKy ? 'Математика: Проценттер жана пропорциялар' : 'Математика: Проценты и скидки',
        percentage: 50,
        tierLabel: { ky: 'Бекемдөө керек', ru: 'Нужно закрепить' }
      },
      {
        topic: isKy ? 'Сүйлөмдөр: Себеп-натыйжалуу байланыштар' : 'Синтаксис: Причинно-следственные связи',
        percentage: 50,
        tierLabel: { ky: 'Бекемдөө керек', ru: 'Нужно закрепить' }
      }
    ],
    strongTopics: [
      {
        topic: isKy ? 'Аналогия: Курал жана кесип' : 'Аналогии: Инструмент и профессия',
        percentage: 100,
        tierLabel: { ky: 'Күчтүү тема', ru: 'Сильная тема' }
      },
      {
        topic: isKy ? 'Окуп түшүнүү: Негизги ойду табуу' : 'Чтение: Главная мысль текста',
        percentage: 85,
        tierLabel: { ky: 'Күчтүү тема', ru: 'Сильная тема' }
      }
    ]
  };

  const totalQuestions = res.totalQuestions || 20;
  const correctCount = res.correctCount || 0;
  const incorrectCount = res.incorrectCount !== undefined ? res.incorrectCount : Math.max(0, totalQuestions - correctCount - (res.skippedCount || 0));
  const skippedCount = res.skippedCount || 0;
  const score = res.estimatedPredictedScore || res.predictedScore || 145;
  const target = res.targetScore || 190;

  // Weakest topic to recommend starting from
  const primaryWeakTopic = res.weakestTopics?.[0]?.topic || res.recommendedStartTopic || (isKy ? 'Математика: Проценттер жана пропорциялар' : 'Математика: Проценты и скидки');
  const secondaryWeakTopic = res.weakestTopics?.[1]?.topic || (isKy ? 'Сүйлөмдөрдү толуктоо' : 'Дополнение предложений');

  // Dynamic calculation of AI Personal Study Plan based on dailyMinutes (Requirement 2)
  // System allocates more time to the weakest topics!
  const getDynamicTodayPlan = (mins: 30 | 45 | 60 | 90 | 120) => {
    if (mins === 30) {
      return [
        {
          id: 'p-1',
          title: primaryWeakTopic,
          duration: 15,
          badge: isKy ? 'Эң алсыз тема' : 'Слабая тема',
          badgeColor: 'rose',
          action: 'study'
        },
        {
          id: 'p-2',
          title: isKy ? 'Каталарды кайталоо («Менин каталарым»)' : 'Повторение ошибок («Мои ошибки»)',
          duration: 10,
          badge: isKy ? 'Каталар' : 'Ошибки',
          badgeColor: 'amber',
          action: 'errors'
        },
        {
          id: 'p-3',
          title: isKy ? 'Флеш-карталар жана эрежелер' : 'Флеш-карточки и правила',
          duration: 5,
          badge: isKy ? 'Эрежелер' : 'Правила',
          badgeColor: 'blue',
          action: 'study'
        }
      ];
    } else if (mins === 45) {
      return [
        {
          id: 'p-1',
          title: primaryWeakTopic,
          duration: 20,
          badge: isKy ? 'Эң алсыз тема' : 'Слабая тема',
          badgeColor: 'rose',
          action: 'study'
        },
        {
          id: 'p-2',
          title: secondaryWeakTopic,
          duration: 15,
          badge: isKy ? 'Бекемдөө' : 'Закрепление',
          badgeColor: 'blue',
          action: 'study'
        },
        {
          id: 'p-3',
          title: isKy ? 'Каталарды кайталоо' : 'Отработка ошибок',
          duration: 10,
          badge: isKy ? 'Каталар' : 'Ошибки',
          badgeColor: 'amber',
          action: 'errors'
        }
      ];
    } else if (mins === 60) {
      return [
        {
          id: 'p-1',
          title: primaryWeakTopic,
          duration: 20,
          badge: isKy ? 'Эң алсыз тема' : 'Слабая тема',
          badgeColor: 'rose',
          action: 'study'
        },
        {
          id: 'p-2',
          title: secondaryWeakTopic,
          duration: 15,
          badge: isKy ? 'Алсыз тема' : 'Зона роста',
          badgeColor: 'rose',
          action: 'study'
        },
        {
          id: 'p-3',
          title: isKy ? 'Окуп түшүнүү жана текст менен иштөө' : 'Чтение и понимание текста',
          duration: 15,
          badge: isKy ? 'Практика' : 'Практика',
          badgeColor: 'indigo',
          action: 'study'
        },
        {
          id: 'p-4',
          title: isKy ? 'Каталарды кайталоо жана талдоо' : 'Разбор неверных заданий',
          duration: 10,
          badge: isKy ? 'Каталар' : 'Ошибки',
          badgeColor: 'amber',
          action: 'errors'
        }
      ];
    } else if (mins === 90) {
      return [
        {
          id: 'p-1',
          title: primaryWeakTopic,
          duration: 30,
          badge: isKy ? 'Эң алсыз тема' : 'Слабая тема',
          badgeColor: 'rose',
          action: 'study'
        },
        {
          id: 'p-2',
          title: secondaryWeakTopic,
          duration: 25,
          badge: isKy ? 'Алсыз тема' : 'Зона роста',
          badgeColor: 'rose',
          action: 'study'
        },
        {
          id: 'p-3',
          title: isKy ? 'Аналогиялар жана сүйлөмдөр' : 'Аналогии и предложения',
          duration: 20,
          badge: isKy ? 'Практика' : 'Практика',
          badgeColor: 'blue',
          action: 'study'
        },
        {
          id: 'p-4',
          title: isKy ? 'Каталарды кайталоо' : 'Работа над ошибками',
          duration: 15,
          badge: isKy ? 'Каталар' : 'Ошибки',
          badgeColor: 'amber',
          action: 'errors'
        }
      ];
    } else {
      // 120 mins
      return [
        {
          id: 'p-1',
          title: primaryWeakTopic,
          duration: 40,
          badge: isKy ? 'Эң алсыз тема' : 'Слабая тема',
          badgeColor: 'rose',
          action: 'study'
        },
        {
          id: 'p-2',
          title: secondaryWeakTopic,
          duration: 30,
          badge: isKy ? 'Алсыз тема' : 'Зона роста',
          badgeColor: 'rose',
          action: 'study'
        },
        {
          id: 'p-3',
          title: isKy ? 'Сүйлөмдөрдү толуктоо жана грамматика' : 'Предложения и грамматика',
          duration: 25,
          badge: isKy ? 'Практика' : 'Практика',
          badgeColor: 'indigo',
          action: 'study'
        },
        {
          id: 'p-4',
          title: isKy ? 'Ката кеткен суроолорду кайра чечүү' : 'Перерешивание ошибок',
          duration: 15,
          badge: isKy ? 'Каталар' : 'Ошибки',
          badgeColor: 'amber',
          action: 'errors'
        },
        {
          id: 'p-5',
          title: isKy ? 'Мини-тест жана контролдук срез' : 'Мини-тест и срез',
          duration: 10,
          badge: isKy ? 'Тест' : 'Тест',
          badgeColor: 'emerald',
          action: 'study'
        }
      ];
    }
  };

  const dynamicTasks = getDynamicTodayPlan(dailyMinutes);

  return (
    <div className="min-h-screen bg-slate-50/70 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header Title */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold">
            <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
            <span>{isKy ? 'Диагностикалык отчет жана жеке окуу планы' : 'Диагностический отчет и персональный план'}</span>
          </div>
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-slate-900 tracking-tight">
            {isKy ? 'Сиздин ОРТ боюнча баштапкы жыйынтыгыңыз' : 'Ваш персональный результат диагностики ОРТ'}
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 max-w-xl mx-auto">
            {isKy
              ? 'Тесттин 20 суроосунун негизинде деңгээлиңиз аныкталып, алсыз темаларга көбүрөөк убакыт бөлгөн адаптивдүү окуу планы түзүлдү.'
              : 'На основе 20 заданий система выявила пробелы и выделила приоритетное время на слабые темы.'}
          </p>
        </div>

        {/* Official Disclaimer */}
        <div className="p-4 rounded-2xl bg-amber-50/80 border border-amber-200/90 text-xs text-amber-900 flex items-start gap-3 shadow-2xs">
          <Info className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
          <div>
            <p className="font-bold text-amber-950 mb-0.5">
              {isKy ? 'Маанилүү эскертүү:' : 'Официальное примечание:'}
            </p>
            <p className="leading-relaxed">
              {res.disclaimer?.[language] ||
                (isKy
                  ? 'Бул балл ОРТ Онлайн платформасынын ички диагностикалык тестинин жыйынтыгы боюнча болжолдуу баа болуп саналат жана БББАУнун (ЦООМО) расмий сертификаты эмес. Ал сиздин алсыз темаларыңызды таап, өстүрүү үчүн түзүлгөн.'
                  : 'Данный балл является ориентировочной оценкой на основе внутреннего диагностического тестирования ОРТ Онлайн и не является официальным сертификатом ЦООМО.')}
            </p>
          </div>
        </div>

        {/* 4 Core Summary Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Predicted Score */}
          <div className="p-5 bg-white rounded-3xl border-2 border-blue-600 shadow-md shadow-blue-500/10 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between text-xs font-bold text-blue-700 mb-1">
                <span>{isKy ? 'Болжолдуу балл' : 'Ориентир. балл'}</span>
                <Award className="w-4 h-4 text-blue-600" />
              </div>
              <div className="text-3xl sm:text-4xl font-black text-slate-900">{score}</div>
            </div>
            <div className="mt-3 pt-2 border-t border-slate-100 text-[11px] text-slate-500 font-semibold flex items-center justify-between">
              <span>{isKy ? 'Максат:' : 'Цель:'} {target}</span>
              <span className="text-emerald-600 font-bold">+{target - score} керек</span>
            </div>
          </div>

          {/* Correct Answers */}
          <div className="p-5 bg-white rounded-3xl border border-emerald-200 shadow-xs flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between text-xs font-bold text-emerald-700 mb-1">
                <span>{isKy ? 'Туура жооптор' : 'Правильно'}</span>
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              </div>
              <div className="text-3xl sm:text-4xl font-black text-emerald-700">
                {correctCount}
                <span className="text-xs font-bold text-slate-400 ml-1">/ {totalQuestions}</span>
              </div>
            </div>
            <div className="mt-3 pt-2 border-t border-slate-100 text-[11px] text-emerald-700 font-bold">
              {Math.round((correctCount / totalQuestions) * 100)}% {isKy ? 'тактык' : 'точность'}
            </div>
          </div>

          {/* Mistakes */}
          <div className="p-5 bg-white rounded-3xl border border-rose-200 shadow-xs flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between text-xs font-bold text-rose-700 mb-1">
                <span>{isKy ? 'Каталар' : 'Ошибки'}</span>
                <XCircle className="w-4 h-4 text-rose-600" />
              </div>
              <div className="text-3xl sm:text-4xl font-black text-rose-600">{incorrectCount}</div>
            </div>
            <div className="mt-3 pt-2 border-t border-slate-100 text-[11px] text-rose-700 font-semibold">
              {isKy ? '«Менин каталарымда»' : 'В «Моих ошибках»'}
            </div>
          </div>

          {/* Accuracy */}
          <div className="p-5 bg-white rounded-3xl border border-slate-200 shadow-xs flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between text-xs font-bold text-slate-500 mb-1">
                <span>{isKy ? 'Жалпы деңгээл' : 'Общий уровень'}</span>
                <TrendingUp className="w-4 h-4 text-purple-600" />
              </div>
              <div className="text-3xl sm:text-4xl font-black text-slate-900">
                {res.accuracyPercentage || Math.round((correctCount / totalQuestions) * 100)}%
              </div>
            </div>
            <div className="mt-3 pt-2 border-t border-slate-100 text-[11px] text-purple-700 font-bold">
              {score >= 180 ? (isKy ? 'Жакшы деңгээл' : 'Хороший уровень') : (isKy ? 'Орточо даярдык' : 'Базовый уровень')}
            </div>
          </div>
        </div>

        {/* RECOMMENDED STARTING TOPIC (Requirement 1: Кайсы темадан баштоо керек) */}
        <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 rounded-3xl p-6 sm:p-8 text-white shadow-xl shadow-blue-600/20 space-y-4">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-blue-200">
            <Zap className="w-4 h-4 text-amber-300" />
            <span>{isKy ? 'Сунуш: Кайсы темадан баштоо керек?' : 'Рекомендация: С какой темы начать обучение?'}</span>
          </div>

          <div className="space-y-1">
            <h2 className="text-xl sm:text-2xl font-black">
              {primaryWeakTopic}
            </h2>
            <p className="text-xs sm:text-sm text-blue-100 max-w-2xl leading-relaxed">
              {isKy
                ? 'Диагностика боюнча бул темадан эң көп ката кетти. Дал ушул темадан баштасаңыз, эң кыска убакытта +15..+25 баллдык секирикке жете аласыз!'
                : 'По этой теме зафиксирован наибольший процент ошибок. Начните с нее, чтобы получить максимальный и быстрый прирост баллов!'}
            </p>
          </div>

          <div className="pt-2 flex flex-wrap items-center gap-3">
            <button
              id="btn-start-recommended-topic"
              onClick={() => {
                setSelectedSubject('math');
                navigate('training-topic');
              }}
              className="px-6 py-3 rounded-2xl bg-white hover:bg-slate-100 text-blue-900 font-black text-xs sm:text-sm shadow-lg transition-transform hover:scale-105 flex items-center gap-2 cursor-pointer"
            >
              <Play className="w-4 h-4 fill-blue-900" />
              <span>{isKy ? 'Бул теманы өздөштүрүүнү баштоо' : 'Начать обучение по этой теме'}</span>
            </button>

            <button
              onClick={() => navigate('my-errors')}
              className="px-5 py-3 rounded-2xl bg-white/10 hover:bg-white/20 border border-white/20 text-white font-bold text-xs sm:text-sm transition-colors cursor-pointer"
            >
              <RotateCcw className="w-4 h-4 inline mr-1.5" />
              <span>{isKy ? 'Кеткен каталарды көрүү' : 'Разобрать ошибки'}</span>
            </button>
          </div>
        </div>

        {/* Multi-Section Breakdown (Requirement 1: математика %, аналогия %, сүйлөмдөр %, окуп түшүнүү %, грамматика %) */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/90 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div className="flex items-center gap-2 text-slate-900 font-black text-base sm:text-lg">
              <BarChart3 className="w-5 h-5 text-blue-600" />
              <h2>{isKy ? 'ОРТ бөлүмдөрү боюнча деталдуу жыйынтык' : 'Результаты по разделам ОРТ'}</h2>
            </div>
            <span className="text-xs text-slate-500 font-semibold">
              {res.subjectBreakdown?.length || 5} {isKy ? 'бөлүм' : 'разделов'}
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {res.subjectBreakdown?.map((sub: any, idx: number) => (
              <div
                key={idx}
                className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2.5"
              >
                <div className="flex justify-between items-center text-xs font-bold text-slate-800">
                  <span className="truncate">{sub.name}</span>
                  <span className="text-blue-700 bg-blue-50 px-2 py-0.5 rounded-md font-black">
                    {sub.accuracy}%
                  </span>
                </div>

                <div className="w-full h-2.5 bg-slate-200 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      sub.accuracy >= 70
                        ? 'bg-emerald-500'
                        : sub.accuracy >= 50
                        ? 'bg-blue-600'
                        : 'bg-rose-500'
                    }`}
                    style={{ width: `${sub.accuracy}%` }}
                  />
                </div>

                <div className="flex justify-between text-[11px] text-slate-500 font-medium">
                  <span>{isKy ? 'Туура:' : 'Верно:'} <strong>{sub.correct}</strong>/{sub.total}</span>
                  <span className={`font-bold ${sub.accuracy >= 70 ? 'text-emerald-700' : 'text-rose-700'}`}>
                    {sub.accuracy >= 70
                      ? (isKy ? 'Күчтүү' : 'Хорошо')
                      : (isKy ? 'Алсыз' : 'Слабо')}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* AI ЖЕКЕ ОКУУ ПЛАНЫ (Requirement 2: Автоматтык жеке план + күнүмдүк убакыт 30, 45, 60, 90, 120 мин) */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/90 shadow-sm space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-5">
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-slate-900 font-black text-base sm:text-lg">
                <Sparkles className="w-5 h-5 text-blue-600" />
                <h2>{isKy ? 'Жеке Окуу Планы' : 'Персональный учебный план'}</h2>
              </div>
              <p className="text-xs text-slate-500">
                {isKy
                  ? 'Диагностиканын негизинде эң алсыз темаларга автоматтык түрдө көбүрөөк убакыт бөлүндү.'
                  : 'Сформирован на основе ваших слабых зон: максимальное время выделено на темы с ошибками.'}
              </p>
            </div>

            {/* Daily study time selector (30, 45, 60, 90, 120 мин) */}
            <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-2xl overflow-x-auto">
              {[30, 45, 60, 90, 120].map((mins) => (
                <button
                  key={mins}
                  onClick={() => setDailyMinutes(mins as any)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all cursor-pointer whitespace-nowrap ${
                    dailyMinutes === mins
                      ? 'bg-blue-600 text-white shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {mins} {isKy ? 'мин' : 'мин'}
                </button>
              ))}
            </div>
          </div>

          {/* Today Plan Tasks */}
          <div className="space-y-3">
            <div className="flex items-center justify-between text-xs font-bold text-slate-700">
              <span>{isKy ? 'Бүгүнкү күн тартиби:' : 'План на сегодня:'}</span>
              <span className="text-blue-600 font-bold">
                {isKy ? 'Жалпы убакыт:' : 'Всего:'} {dailyMinutes} {isKy ? 'мүнөт' : 'минут'}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {dynamicTasks.map((t, idx) => (
                <div
                  key={t.id}
                  className="p-4 rounded-2xl bg-slate-50 border border-slate-200/90 flex flex-col justify-between space-y-3 hover:border-slate-300 transition-all"
                >
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span
                        className={`px-2 py-0.5 rounded-md text-[10px] font-black border ${
                          t.badgeColor === 'rose'
                            ? 'bg-rose-50 text-rose-700 border-rose-200'
                            : t.badgeColor === 'amber'
                            ? 'bg-amber-50 text-amber-700 border-amber-200'
                            : 'bg-blue-50 text-blue-700 border-blue-200'
                        }`}
                      >
                        {t.badge}
                      </span>
                      <span className="text-xs font-black text-slate-900">
                        ⏱ {t.duration} {isKy ? 'мүнөт' : 'мин'}
                      </span>
                    </div>

                    <h4 className="text-xs sm:text-sm font-bold text-slate-900 leading-snug">
                      {idx + 1}. {t.title}
                    </h4>
                  </div>

                  <div className="pt-2 border-t border-slate-200/60 flex justify-end">
                    <button
                      onClick={() => {
                        if (t.action === 'errors') {
                          navigate('my-errors');
                        } else {
                          setSelectedSubject('math');
                          navigate('training-topic');
                        }
                      }}
                      className="px-3.5 py-1.5 rounded-xl bg-white hover:bg-slate-100 border border-slate-200 text-xs font-bold text-blue-700 flex items-center gap-1 transition-colors cursor-pointer"
                    >
                      <span>{isKy ? 'Баштоо' : 'Начать'}</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Action buttons */}
          <div className="pt-4 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4">
            <button
              onClick={() => navigate('student-cabinet')}
              className="w-full sm:w-auto px-6 py-3 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs transition-colors flex items-center justify-center gap-2 cursor-pointer"
            >
              <BookOpen className="w-4 h-4" />
              <span>{isKy ? 'Жеке кабинетке өтүү' : 'В личный кабинет'}</span>
            </button>

            <button
              onClick={() => openPayment(tariffPlans[1])}
              className="w-full sm:w-auto px-8 py-3.5 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-black text-xs sm:text-sm shadow-md shadow-blue-600/25 transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>{isKy ? 'Толук даярдыкты активдештирүү' : 'Активировать полную подготовку'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
