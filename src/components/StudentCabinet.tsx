import React, { useState, useEffect, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { tariffPlans } from '../data/initialData';
import { initialBadges, syncBadgesWithProgress } from '../data/badgesData';
import { api } from '../services/api';
import { Question, SavedPaymentMethod, FinikPaymentOrder, Badge, SubjectId } from '../types';
import { BadgesSection } from './BadgesSection';
import { StudentLeaderboard } from './StudentLeaderboard';
import { AiExplainerModal } from './AiExplainerModal';
import { CourseCurriculumSection } from './CourseCurriculumSection';
import {
  Sparkles,
  Flame,
  Target,
  Clock,
  Calendar,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  TrendingUp,
  Award,
  Play,
  RotateCcw,
  CheckSquare,
  Square,
  BookOpen,
  HelpCircle,
  BarChart3,
  XCircle,
  Check,
  CreditCard,
  Trash2,
  ShieldCheck,
  RefreshCw,
  Lock,
  Plus,
  AlertTriangle,
  Copy,
  ExternalLink,
  ChevronRight
} from 'lucide-react';

export const StudentCabinet: React.FC = () => {
  const {
    user,
    setUser,
    language,
    t,
    navigate,
    toggleTaskCompletion,
    questions,
    showToast,
    deleteSavedPaymentMethod,
    toggleAutoRenew,
    openPayment,
    subscriptionAlert,
    selectedPlan,
    setSelectedSubject
  } = useApp();

  const [cabinetData, setCabinetData] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [paymentOrders, setPaymentOrders] = useState<FinikPaymentOrder[]>([]);
  const [copiedOrderId, setCopiedOrderId] = useState<string | null>(null);

  // Badges System State
  const [badges, setBadges] = useState<Badge[]>(() => {
    try {
      const saved = localStorage.getItem('bilim_student_badges');
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.warn('Failed to parse saved badges', e);
    }
    return initialBadges;
  });

  // Re-solving mistakes state
  const [activeMistakeQuestion, setActiveMistakeQuestion] = useState<Question | null>(null);
  const [resolvingSelectedOption, setResolvingSelectedOption] = useState<number | null>(null);
  const [resolveFeedback, setResolveFeedback] = useState<{ isCorrect: boolean; text: string } | null>(null);
  const [repairedMistakeIds, setRepairedMistakeIds] = useState<string[]>([]);

  // Payment methods & Auto-renew state
  const [deletingMethodId, setDeletingMethodId] = useState<string | null>(null);
  const [isTogglingRenew, setIsTogglingRenew] = useState<boolean>(false);
  const [showDeleteConfirmModal, setShowDeleteConfirmModal] = useState<SavedPaymentMethod | null>(null);

  // Daily study plan duration (Requirement 2: 30, 45, 60, 90, 120 мин)
  const [dailyStudyDuration, setDailyStudyDuration] = useState<30 | 45 | 60 | 90 | 120>(60);
  const [aiModalQuestion, setAiModalQuestion] = useState<Question | null>(null);

  useEffect(() => {
    const fetchCabinet = async () => {
      setLoading(true);
      try {
        const studentId = user?.id || 'user-demo-student';
        const res = await api.getStudentCabinet(studentId);
        if (res && res.profile) {
          setCabinetData(res);
        }
        // Fetch payment history orders
        const orders = await api.getPaymentOrders();
        setPaymentOrders(orders);
      } catch (err) {
        console.warn('Using local student cabinet fallback', err);
      } finally {
        setLoading(false);
      }
    };
    fetchCabinet();
  }, [user]);

  const student = cabinetData?.profile || user || {
    id: 'user-demo',
    fullName: 'Азамат Султанов',
    phone: '+996 700 891 234',
    role: 'student',
    grade: '11-класс',
    targetScore: 195,
    predictedScore: 145,
    streakDays: 4,
    completedTestsCount: 3,
    correctAnswersCount: 22,
    totalAnsweredCount: 30,
    weeklyStudyMinutes: 145,
    weakTopics: [
      language === 'ky' ? 'Даражалар жана тамырлар' : 'Степени и корни',
      language === 'ky' ? 'Ылдамдык жана убакыт' : 'Скорость и время',
      language === 'ky' ? 'Белгинин күчөшү аналогиялары' : 'Аналогии степени признака'
    ],
    strongTopics: [
      language === 'ky' ? 'Проценттер жана арзандатуулар' : 'Проценты и скидки',
      language === 'ky' ? 'Тексттин негизги ою' : 'Главная мысль текста'
    ],
    todayTasksCompleted: ['t-1']
  };

  // Days left to ORT (Typically end of May 2026)
  const ortExamDate = new Date('2026-05-24T09:00:00');
  const now = new Date();
  const diffDays = Math.max(1, Math.ceil((ortExamDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)));

  // Dynamic AI study plan according to dailyStudyDuration (Requirement 2: 30, 45, 60, 90, 120 мин)
  const todayTasks = useMemo(() => {
    if (dailyStudyDuration === 30) {
      return [
        {
          id: 't-1',
          title: language === 'ky' ? 'Математика: Проценттер (Алсыз тема)' : 'Математика: Проценты (Зона роста)',
          duration: language === 'ky' ? '15 мүнөт' : '15 минут',
          subject: 'math'
        },
        {
          id: 't-2',
          title: language === 'ky' ? 'Каталарды кайталоо («Менин каталарым»)' : 'Повторение ошибок («Мои ошибки»)',
          duration: language === 'ky' ? '10 мүнөт' : '10 минут',
          subject: 'errors'
        },
        {
          id: 't-3',
          title: language === 'ky' ? 'Флеш-карталар жана эрежелер' : 'Флеш-карточки и правила',
          duration: language === 'ky' ? '5 мүнөт' : '5 минут',
          subject: 'analogies'
        }
      ];
    } else if (dailyStudyDuration === 45) {
      return [
        {
          id: 't-1',
          title: language === 'ky' ? 'Математика: Проценттер жана сандар' : 'Математика: Проценты и дроби',
          duration: language === 'ky' ? '20 мүнөт' : '20 минут',
          subject: 'math'
        },
        {
          id: 't-2',
          title: language === 'ky' ? 'Аналогиялар: Курал жана кесип' : 'Аналогии: Инструмент и мастер',
          duration: language === 'ky' ? '15 мүнөт' : '15 минут',
          subject: 'analogies'
        },
        {
          id: 't-3',
          title: language === 'ky' ? 'Каталарды кайталоо' : 'Отработка ошибок',
          duration: language === 'ky' ? '10 мүнөт' : '10 минут',
          subject: 'errors'
        }
      ];
    } else if (dailyStudyDuration === 60) {
      return [
        {
          id: 't-1',
          title: language === 'ky' ? 'Математика: Проценттер (Эң алсыз тема)' : 'Математика: Проценты (Приоритет)',
          duration: language === 'ky' ? '20 мүнөт' : '20 минут',
          subject: 'math'
        },
        {
          id: 't-2',
          title: language === 'ky' ? 'Сүйлөмдөрдү толуктоо (Логикалык байланыш)' : 'Дополнение предложений',
          duration: language === 'ky' ? '15 мүнөт' : '15 минут',
          subject: 'sentences'
        },
        {
          id: 't-3',
          title: language === 'ky' ? 'Окуп түшүнүү: Текстти талдоо' : 'Чтение текста: Анализ тезисов',
          duration: language === 'ky' ? '15 мүнөт' : '15 минут',
          subject: 'reading'
        },
        {
          id: 't-4',
          title: language === 'ky' ? 'Каталарды кайталоо жана чечүү' : 'Разбор неверных заданий',
          duration: language === 'ky' ? '10 мүнөт' : '10 минут',
          subject: 'errors'
        }
      ];
    } else if (dailyStudyDuration === 90) {
      return [
        {
          id: 't-1',
          title: language === 'ky' ? 'Математика: Проценттер жана теңдемелер' : 'Математика: Проценты и уравнения',
          duration: language === 'ky' ? '30 мүнөт' : '30 минут',
          subject: 'math'
        },
        {
          id: 't-2',
          title: language === 'ky' ? 'Аналогиялар: Себеп жана натыйжа' : 'Аналогии: Причинно-следственные связи',
          duration: language === 'ky' ? '25 мүнөт' : '25 минут',
          subject: 'analogies'
        },
        {
          id: 't-3',
          title: language === 'ky' ? 'Окуп түшүнүү: Илимий тексттер' : 'Чтение текста: Научные статьи',
          duration: language === 'ky' ? '20 мүнөт' : '20 минут',
          subject: 'reading'
        },
        {
          id: 't-4',
          title: language === 'ky' ? 'Каталарды кайталоо' : 'Работа над ошибками',
          duration: language === 'ky' ? '15 мүнөт' : '15 минут',
          subject: 'errors'
        }
      ];
    } else {
      // 120 mins
      return [
        {
          id: 't-1',
          title: language === 'ky' ? 'Математика: Проценттер жана геометрия' : 'Математика: Проценты и геометрия',
          duration: language === 'ky' ? '40 мүнөт' : '40 минут',
          subject: 'math'
        },
        {
          id: 't-2',
          title: language === 'ky' ? 'Сүйлөмдөрдү толуктоо жана синтаксис' : 'Синтаксис и дополнение предложений',
          duration: language === 'ky' ? '30 мүнөт' : '30 минут',
          subject: 'sentences'
        },
        {
          id: 't-3',
          title: language === 'ky' ? 'Практикалык грамматика жана эрежелер' : 'Практическая грамматика',
          duration: language === 'ky' ? '25 мүнөт' : '25 минут',
          subject: 'grammar'
        },
        {
          id: 't-4',
          title: language === 'ky' ? 'Каталарды кайра чечүү' : 'Перерешивание ошибок',
          duration: language === 'ky' ? '15 мүнөт' : '15 минут',
          subject: 'errors'
        },
        {
          id: 't-5',
          title: language === 'ky' ? 'Мини-тест жана контролдук срез' : 'Мини-тест и контроль',
          duration: language === 'ky' ? '10 мүнөт' : '10 минут',
          subject: 'math'
        }
      ];
    }
  }, [dailyStudyDuration, language]);

  const weeklyProgress = [
    { day: language === 'ky' ? 'Дүй' : 'Пн', tasks: 15, completed: true },
    { day: language === 'ky' ? 'Шей' : 'Вт', tasks: 15, completed: true },
    { day: language === 'ky' ? 'Шар' : 'Ср', tasks: 12, completed: true },
    { day: language === 'ky' ? 'Бей' : 'Чт', tasks: 18, completed: true },
    { day: language === 'ky' ? 'Жум' : 'Пт', tasks: 20, completed: false },
    { day: language === 'ky' ? 'Ише' : 'Сб', tasks: 25, completed: false },
    { day: language === 'ky' ? 'Жек' : 'Вс', tasks: 30, completed: false }
  ];

  // Subject Dynamics
  const subjectDynamics = [
    {
      id: 'math',
      title: language === 'ky' ? 'Математика' : 'Математика',
      current: 68,
      initial: 52,
      progress: '+16%'
    },
    {
      id: 'analogies',
      title: language === 'ky' ? 'Аналогиялар' : 'Аналогии',
      current: 72,
      initial: 60,
      progress: '+12%'
    },
    {
      id: 'reading',
      title: language === 'ky' ? 'Окуп түшүнүү' : 'Чтение текста',
      current: 75,
      initial: 65,
      progress: '+10%'
    }
  ];

  // Questions for "Мои ошибки" (Requirement 9)
  // Default sample mistakes from pool
  const initialMistakeQuestions = questions.filter(
    (q) => q.subjectId === 'math' || q.subjectId === 'analogies'
  ).slice(0, 3);

  const activeMistakesList = initialMistakeQuestions.filter((q) => !repairedMistakeIds.includes(q.id));

  // Handler for re-solving mistakes
  const handleCheckMistake = (q: Question) => {
    if (resolvingSelectedOption === null) return;
    const isCorrect = resolvingSelectedOption === q.correctOptionIndex;

    if (isCorrect) {
      setResolveFeedback({
        isCorrect: true,
        text:
          language === 'ky'
            ? 'Азаматсыз! Туура жооп табылды жана каталардан өчүрүлдү.'
            : 'Отлично! Задание решено правильно и удалено из списка ошибок.'
      });
      showToast(language === 'ky' ? 'Ката оңдолду! +10 балл' : 'Ошибка исправлена! +10 баллов', 'success');
      setTimeout(() => {
        setRepairedMistakeIds((prev) => [...prev, q.id]);
        setActiveMistakeQuestion(null);
        setResolvingSelectedOption(null);
        setResolveFeedback(null);
      }, 1800);
    } else {
      setResolveFeedback({
        isCorrect: false,
        text:
          language === 'ky'
            ? 'Тилекке каршы, жооп туура эмес. Түшүндүрмөнү окуп кайра байкап көрүңүз.'
            : 'Неверно. Прочитайте подсказку и попробуйте еще раз.'
      });
    }
  };

  // Sync badges with current student stats and mistakes fixed
  useEffect(() => {
    setBadges((prevBadges) => {
      const synced = syncBadgesWithProgress(prevBadges, student, repairedMistakeIds.length);
      try {
        localStorage.setItem('bilim_student_badges', JSON.stringify(synced));
      } catch (e) {
        // ignore
      }
      return synced;
    });
  }, [student.streakDays, student.predictedScore, student.strongTopics, repairedMistakeIds.length]);

  // Claim digital reward
  const handleClaimBadge = (badgeId: string) => {
    setBadges((prev) => {
      const updated = prev.map((b) => (b.id === badgeId ? { ...b, isClaimed: true } : b));
      try {
        localStorage.setItem('bilim_student_badges', JSON.stringify(updated));
      } catch (e) {
        // ignore
      }
      return updated;
    });
    showToast(
      language === 'ky' ? 'Санариптик сыйлык ийгиликтүү алынды!' : 'Цифровая награда успешно получена!',
      'success'
    );
  };

  // Increment daily study streak
  const handleIncrementStreak = () => {
    const nextStreak = (student.streakDays || 4) + 1;
    if (user) {
      setUser({ ...user, streakDays: nextStreak });
    }
    if (cabinetData && cabinetData.profile) {
      setCabinetData({
        ...cabinetData,
        profile: { ...cabinetData.profile, streakDays: nextStreak }
      });
    }
    showToast(
      language === 'ky'
        ? `Күндүк тапшырма аткарылды! Серия: ${nextStreak} күн 🔥`
        : `День завершен! Ударный режим: ${nextStreak} дней 🔥`,
      'success'
    );
  };

  // Navigate to training topic mode
  const handleNavigateToTopic = (subjectId?: SubjectId, topicName?: string) => {
    if (subjectId && setSelectedSubject) {
      setSelectedSubject(subjectId);
    }
    navigate('training-topic', { topicName });
  };

  const unlockedBadgesCount = badges.filter((b) => b.isUnlocked).length;

  const totalMasteryPoints = useMemo(() => {
    return badges
      .filter((b) => b.isClaimed)
      .reduce((sum, b) => sum + b.rewardXp, 0);
  }, [badges]);

  return (
    <div className="min-h-screen bg-slate-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Top Header & Greeting Bar */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/90 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-xl sm:text-2xl font-black text-slate-900">
                {t.cabinetGreeting}, {student.fullName}!
              </span>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-100 text-blue-800">
                {student.grade || '11-класс'}
              </span>
            </div>
            <p className="text-xs sm:text-sm text-slate-500">
              {language === 'ky'
                ? 'Жеке даярдык планы жана ОРТ көрсөткүчтөрүңүз'
                : 'Ваш персональный образовательный трек и статистика подготовки к ОРТ'}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* Badges count pill */}
            <div className="flex items-center gap-2 px-3.5 py-2 rounded-2xl bg-indigo-50 border border-indigo-200 text-indigo-900 font-bold text-xs sm:text-sm">
              <Award className="w-4 h-4 text-indigo-600" />
              <span>
                {unlockedBadgesCount} / {badges.length} {language === 'ky' ? 'сыйлык' : 'наград'}
              </span>
            </div>

            {/* Streak count (Ударный режим - Requirement 9) */}
            <div className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 font-bold text-xs sm:text-sm">
              <Flame className="w-5 h-5 text-amber-500 fill-amber-500 animate-bounce" />
              <span>
                {student.streakDays || 4} {t.cabinetDays} {language === 'ky' ? 'катары менен (Ударный режим)' : 'подряд (Ударный режим)'}
              </span>
            </div>

            {/* Quick Continue Learning Action */}
            <button
              id="btn-cabinet-continue-study"
              onClick={() => navigate('training-topic')}
              className="px-5 py-3 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs sm:text-sm shadow-md shadow-blue-600/20 transition-all flex items-center gap-2 cursor-pointer"
            >
              <Play className="w-4 h-4 fill-white" />
              <span>{t.btnContinueLearning}</span>
            </button>
          </div>
        </div>

        {/* Subscription Expiry Warning Alert (Requirement 12: 3 дня, 1 день, истекла) */}
        {subscriptionAlert && subscriptionAlert.type && (
          <div
            id="subscription-expiry-alert-banner"
            className={`p-5 rounded-3xl border flex flex-col sm:flex-row sm:items-center justify-between gap-4 animate-in fade-in ${
              subscriptionAlert.type === 'expired'
                ? 'bg-rose-50/90 border-rose-300 text-rose-950'
                : subscriptionAlert.type === 'expiring_1_day'
                ? 'bg-amber-50/90 border-amber-300 text-amber-950'
                : 'bg-blue-50/90 border-blue-200 text-blue-950'
            }`}
          >
            <div className="flex items-start gap-3.5">
              <div
                className={`w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 ${
                  subscriptionAlert.type === 'expired'
                    ? 'bg-rose-200 text-rose-700'
                    : subscriptionAlert.type === 'expiring_1_day'
                    ? 'bg-amber-200 text-amber-700'
                    : 'bg-blue-200 text-blue-700'
                }`}
              >
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div className="space-y-0.5">
                <h4 className="font-bold text-sm sm:text-base">
                  {subscriptionAlert.type === 'expired'
                    ? (t.subAlertExpiredTitle || 'Ваша подписка завершена')
                    : subscriptionAlert.type === 'expiring_1_day'
                    ? (t.subAlert1DayTitle || 'Подписка заканчивается завтра!')
                    : (t.subAlert3DaysTitle || 'Ваша подписка скоро заканчивается')}
                </h4>
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                  {subscriptionAlert.type === 'expired'
                    ? (t.subAlertExpiredDesc || 'Продлите доступ прямо сейчас, чтобы продолжить подготовку и не потерять результат!')
                    : subscriptionAlert.type === 'expiring_1_day'
                    ? (t.subAlert1DayDesc || 'Не теряйте ударный режим и доступ к банку заданий ОРТ.')
                    : (t.subAlert3DaysDesc || 'Продлите доступ, чтобы сохранить непрерывную подготовку и персональные рекомендации онлайн-репетитора.')}
                </p>
              </div>
            </div>

            <button
              id="btn-alert-renew-subscription"
              onClick={() => openPayment(selectedPlan || tariffPlans[1] || tariffPlans[0])}
              className={`px-5 py-2.5 rounded-xl font-bold text-xs sm:text-sm text-white shadow-md transition-all shrink-0 cursor-pointer ${
                subscriptionAlert.type === 'expired'
                  ? 'bg-rose-600 hover:bg-rose-700'
                  : subscriptionAlert.type === 'expiring_1_day'
                  ? 'bg-amber-600 hover:bg-amber-700'
                  : 'bg-blue-600 hover:bg-blue-700'
              }`}
            >
              {t.subRenewBtn || 'Продлить подписку'}
            </button>
          </div>
        )}

        {/* 4 Essential Metric Cards (Requirement 9: цель по баллам, текущий ориентировочный балл, статистика) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {/* 1. Target Score */}
          <div className="p-5 bg-white rounded-2xl border border-slate-200/80 shadow-2xs">
            <div className="flex items-center justify-between text-xs text-slate-500 font-medium mb-1">
              <span>{t.cabinetTargetScore}</span>
              <Target className="w-4 h-4 text-emerald-600" />
            </div>
            <div className="flex items-baseline gap-1.5 mt-1">
              <span className="text-3xl font-black text-emerald-700">{student.targetScore || 195}</span>
              <span className="text-xs font-semibold text-slate-400">/ 245</span>
            </div>
            <div className="mt-3 text-[11px] text-slate-500">
              {language === 'ky' ? 'Бюджетке өтүү үчүн максат' : 'Цель на грантовое место'}
            </div>
          </div>

          {/* 2. Current Estimated Score */}
          <div className="p-5 bg-white rounded-2xl border-2 border-blue-600 shadow-md shadow-blue-600/10">
            <div className="flex items-center justify-between text-xs text-blue-700 font-bold mb-1">
              <span>{t.resPredictedScore || (language === 'ky' ? 'Болжолдуу балл' : 'Ориентировочный балл')}</span>
              <TrendingUp className="w-4 h-4 text-blue-600" />
            </div>
            <div className="flex items-baseline gap-1.5 mt-1">
              <span className="text-3xl font-black text-slate-900">{student.predictedScore || 145}</span>
              <span className="text-xs font-bold text-emerald-600">+17 балл өстү</span>
            </div>
            <div className="mt-3 text-[11px] text-slate-500">
              {language === 'ky' ? 'Ички диагностика боюнча' : 'По результатам диагностики'}
            </div>
          </div>

          {/* 3. Weekly Activity & Time */}
          <div className="p-5 bg-white rounded-2xl border border-slate-200/80 shadow-2xs">
            <div className="flex items-center justify-between text-xs text-slate-500 font-medium mb-1">
              <span>{language === 'ky' ? 'Жумалык убакыт' : 'Время за неделю'}</span>
              <Clock className="w-4 h-4 text-purple-600" />
            </div>
            <div className="flex items-baseline gap-1.5 mt-1">
              <span className="text-3xl font-black text-slate-900">{student.weeklyStudyMinutes || 145}</span>
              <span className="text-xs font-semibold text-slate-500">{language === 'ky' ? 'мүнөт' : 'минут'}</span>
            </div>
            <div className="mt-3 text-[11px] text-purple-700 font-medium">
              ~25 {language === 'ky' ? 'мүн/күн орточо' : 'мин/день в среднем'}
            </div>
          </div>

          {/* 4. Accuracy & Solved Tasks */}
          <div className="p-5 bg-white rounded-2xl border border-slate-200/80 shadow-2xs">
            <div className="flex items-center justify-between text-xs text-slate-500 font-medium mb-1">
              <span>{language === 'ky' ? 'Туура чечилген' : 'Точность ответов'}</span>
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            </div>
            <div className="flex items-baseline gap-1.5 mt-1">
              <span className="text-3xl font-black text-slate-900">
                {student.totalAnsweredCount
                  ? Math.round((student.correctAnswersCount / student.totalAnsweredCount) * 100)
                  : 73}%
              </span>
              <span className="text-xs font-semibold text-slate-500">
                ({student.correctAnswersCount || 22}/{student.totalAnsweredCount || 30})
              </span>
            </div>
            <div className="mt-3 text-[11px] text-slate-500">
              {student.completedTestsCount || 3} {language === 'ky' ? 'тест аяктады' : 'теста пройдено'}
            </div>
          </div>
        </div>

        {/* Dynamics by Subjects (Requirement 9: динамика по предметам) */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/90 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2 font-bold text-slate-900 text-base">
              <BarChart3 className="w-5 h-5 text-blue-600" />
              <h2>{language === 'ky' ? 'Предметтер боюнча динамика' : 'Динамика по предметам'}</h2>
            </div>
            <span className="text-xs text-slate-500 font-medium">
              {language === 'ky' ? 'Акыркы 30 күндө' : 'За последние 30 дней'}
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {subjectDynamics.map((sub) => (
              <div key={sub.id} className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2.5">
                <div className="flex justify-between items-center text-xs font-bold text-slate-800">
                  <span>{sub.title}</span>
                  <span className="text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-md font-bold">
                    {sub.progress}
                  </span>
                </div>
                <div className="w-full h-2.5 bg-slate-200 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-blue-600 rounded-full transition-all duration-500"
                    style={{ width: `${sub.current}%` }}
                  />
                </div>
                <div className="flex justify-between text-[11px] text-slate-500">
                  <span>{language === 'ky' ? 'Баштапкы:' : 'Было:'} {sub.initial}%</span>
                  <span className="font-bold text-slate-800">{language === 'ky' ? 'Азыр:' : 'Сейчас:'} {sub.current}%</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* BLOCK: «Мои ошибки» with interactive re-solve (Requirement 9) */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-rose-200/80 shadow-sm space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-4">
            <div className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center">
                <RotateCcw className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-base sm:text-lg font-bold text-slate-900">
                  {language === 'ky' ? '«Менин каталарым» (Кайра чечүү)' : 'Раздел «Мои ошибки» (Работа над ошибками)'}
                </h2>
                <p className="text-xs text-slate-500">
                  {language === 'ky'
                    ? 'Тесттерде ката кетирилген суроолор. Туура чыгарып, ката тизмесинен өчүрүңүз.'
                    : 'Задания, где вы допустили неточность. Перерешайте их, чтобы закрепить материал.'}
                </p>
              </div>
            </div>
            <span className="text-xs font-bold text-rose-700 bg-rose-50 px-3 py-1.5 rounded-xl border border-rose-200">
              {activeMistakesList.length} {language === 'ky' ? 'ката тапшырма' : 'заданий на повторение'}
            </span>
          </div>

          {activeMistakesList.length === 0 ? (
            <div className="p-6 rounded-2xl bg-emerald-50 border border-emerald-200 text-center space-y-2">
              <CheckCircle2 className="w-8 h-8 text-emerald-600 mx-auto" />
              <p className="font-bold text-emerald-950 text-sm">
                {language === 'ky' ? 'Бардык каталар ийгиликтүү оңдолду!' : 'Все ошибки успешно отработаны!'}
              </p>
              <p className="text-xs text-emerald-800">
                {language === 'ky' ? 'Мыкты жыйынтык! Кийинки тесттерге өтүңүз.' : 'Отличный результат! Продолжайте в том же духе.'}
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {activeMistakesList.map((q, idx) => {
                const isSelectedForSolve = activeMistakeQuestion?.id === q.id;

                return (
                  <div
                    key={q.id}
                    className="p-5 rounded-2xl border border-slate-200 hover:border-slate-300 transition-all bg-slate-50/40 space-y-3"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className="px-2.5 py-0.5 rounded-md text-[11px] font-bold bg-rose-50 text-rose-700 border border-rose-200">
                          {q.subjectId === 'math' ? 'Математика' : 'Аналогии'}
                        </span>
                        <span className="text-xs font-semibold text-slate-700">{q.topic[language]}</span>
                      </div>

                      <button
                        onClick={() => {
                          setActiveMistakeQuestion(isSelectedForSolve ? null : q);
                          setResolvingSelectedOption(null);
                          setResolveFeedback(null);
                        }}
                        className="px-4 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-xs transition-colors"
                      >
                        <RotateCcw className="w-3.5 h-3.5" />
                        <span>
                          {isSelectedForSolve
                            ? language === 'ky' ? 'Жабуу' : 'Скрыть'
                            : language === 'ky' ? 'Кайра чечүү' : 'Перерешать'}
                        </span>
                      </button>
                    </div>

                    <p className="text-xs sm:text-sm font-semibold text-slate-900 leading-relaxed whitespace-pre-line">
                      {q.text[language]}
                    </p>

                    {/* Interactive Re-solve Area */}
                    {isSelectedForSolve && (
                      <div className="pt-3 border-t border-slate-200 space-y-3 animate-in fade-in">
                        <div className="text-xs font-bold text-slate-700">
                          {language === 'ky' ? 'Туура вариантты тандаңыз:' : 'Выберите правильный вариант:'}
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                          {q.options[language].map((optText, optIdx) => (
                            <button
                              key={optIdx}
                              onClick={() => setResolvingSelectedOption(optIdx)}
                              className={`p-3 rounded-xl border text-left text-xs font-medium transition-all flex items-center justify-between ${
                                resolvingSelectedOption === optIdx
                                  ? 'border-blue-600 bg-blue-50/80 font-bold text-blue-900'
                                  : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-800'
                              }`}
                            >
                              <span>{optText}</span>
                              {resolvingSelectedOption === optIdx && (
                                <Check className="w-4 h-4 text-blue-600 shrink-0" />
                              )}
                            </button>
                          ))}
                        </div>

                        {/* Socratic Hint */}
                        {q.socraticHints?.[language]?.[0] && (
                          <div className="p-2.5 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-900 flex items-start gap-2">
                            <HelpCircle className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
                            <span>
                              <strong>{language === 'ky' ? 'Кыйытма:' : 'Подсказка:'}</strong>{' '}
                              {q.socraticHints[language][0]}
                            </span>
                          </div>
                        )}

                        {/* Feedback Banner */}
                        {resolveFeedback && (
                          <div
                            className={`p-3 rounded-xl text-xs font-bold flex items-center gap-2 ${
                              resolveFeedback.isCorrect
                                ? 'bg-emerald-100 text-emerald-900 border border-emerald-300'
                                : 'bg-rose-100 text-rose-900 border border-rose-300'
                            }`}
                          >
                            {resolveFeedback.isCorrect ? (
                              <CheckCircle2 className="w-4 h-4 text-emerald-700" />
                            ) : (
                              <XCircle className="w-4 h-4 text-rose-700" />
                            )}
                            <span>{resolveFeedback.text}</span>
                          </div>
                        )}

                        <div className="flex justify-end pt-1">
                          <button
                            onClick={() => handleCheckMistake(q)}
                            disabled={resolvingSelectedOption === null}
                            className="px-5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs disabled:opacity-40 transition-colors"
                          >
                            {language === 'ky' ? 'Текшерүү' : 'Проверить ответ'}
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* 2-Columns: Today's Tasks (7 cols) + Weekly Progress (5 cols) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Today Tasks List (7 cols) */}
          <div className="lg:col-span-7 bg-white rounded-3xl p-6 sm:p-7 border border-slate-200/90 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-blue-600" />
                <h2 className="text-base sm:text-lg font-bold text-slate-900">
                  {language === 'ky' ? 'Күндүк план жана тапшырмалар' : 'План и цели на сегодня'}
                </h2>
              </div>
              <span className="text-xs font-semibold text-slate-500">
                {student.todayTasksCompleted?.length || 1} / {todayTasks.length} {language === 'ky' ? 'бүттү' : 'выполнено'}
              </span>
            </div>

            <div className="space-y-3">
              {todayTasks.map((task) => {
                const isCompleted = student.todayTasksCompleted?.includes(task.id);
                return (
                  <div
                    key={task.id}
                    className={`p-4 rounded-2xl border transition-all flex items-center justify-between gap-3 ${
                      isCompleted
                        ? 'bg-emerald-50/50 border-emerald-200'
                        : 'bg-slate-50/60 border-slate-200/80 hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => toggleTaskCompletion(task.id)}
                        className="text-slate-400 hover:text-blue-600 transition-colors cursor-pointer"
                      >
                        {isCompleted ? (
                          <CheckSquare className="w-5 h-5 text-emerald-600 fill-emerald-100" />
                        ) : (
                          <Square className="w-5 h-5 text-slate-300" />
                        )}
                      </button>
                      <div>
                        <p
                          className={`text-xs sm:text-sm font-bold ${
                            isCompleted ? 'line-through text-slate-400' : 'text-slate-900'
                          }`}
                        >
                          {task.title}
                        </p>
                        <span className="text-[11px] text-slate-500 font-medium">⏱ {task.duration}</span>
                      </div>
                    </div>

                    <button
                      onClick={() => navigate('training-topic')}
                      className="px-3.5 py-1.5 rounded-xl bg-white border border-slate-200 hover:bg-slate-100 text-xs font-bold text-slate-700 transition-colors shrink-0"
                    >
                      {language === 'ky' ? 'Баштоо' : 'Решать'}
                    </button>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Weekly Progress Bar Graph (5 cols) */}
          <div className="lg:col-span-5 bg-white rounded-3xl p-6 sm:p-7 border border-slate-200/90 shadow-sm space-y-4 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
                <div className="flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-emerald-600" />
                  <h2 className="text-base sm:text-lg font-bold text-slate-900">
                    {t.cabinetWeeklyActivity}
                  </h2>
                </div>
                <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-lg">
                  {student.weeklyStudyMinutes || 145} {language === 'ky' ? 'мүнөт' : 'минут'}
                </span>
              </div>

              {/* Day Bars */}
              <div className="grid grid-cols-7 gap-2 items-end h-36 pt-4 px-2">
                {weeklyProgress.map((p, idx) => (
                  <div key={idx} className="flex flex-col items-center gap-1.5 h-full justify-end">
                    <div
                      className={`w-full max-w-[28px] rounded-t-lg transition-all ${
                        p.completed ? 'bg-blue-600' : 'bg-slate-200'
                      }`}
                      style={{ height: `${p.tasks * 3.5}px` }}
                    />
                    <span className="text-[10px] font-semibold text-slate-500">{p.day}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100 text-xs text-slate-500 flex items-center justify-between">
              <span>{language === 'ky' ? 'Орточо күнүмдүк көлөм:' : 'В среднем:'} 16 {language === 'ky' ? 'суроо' : 'заданий'}</span>
              <button
                onClick={() => navigate('practice-mock')}
                className="font-bold text-blue-600 hover:underline flex items-center gap-1"
              >
                <span>{t.btnTakeFullMock}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>

        {/* Weak & Strong Topics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white rounded-3xl p-6 border border-slate-200/90 shadow-sm">
            <h3 className="text-sm font-bold text-slate-900 mb-3 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-500" />
              <span>{t.resWeakTopicsTitle}</span>
            </h3>
            <div className="space-y-2">
              {(student.weakTopics || []).map((item: string, idx: number) => (
                <div
                  key={idx}
                  className="p-3 rounded-xl bg-rose-50/70 border border-rose-200 text-xs font-medium text-rose-900 flex items-center justify-between"
                >
                  <span>{item}</span>
                  <button
                    onClick={() => navigate('training-topic')}
                    className="text-[10px] font-bold text-rose-700 bg-white px-2 py-0.5 rounded-md border border-rose-200 hover:bg-rose-100 transition-colors cursor-pointer"
                  >
                    {language === 'ky' ? 'Машыгуу' : 'Тренировать'}
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-3xl p-6 border border-slate-200/90 shadow-sm">
            <h3 className="text-sm font-bold text-slate-900 mb-3 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-500" />
              <span>{t.resStrongTopicsTitle}</span>
            </h3>
            <div className="space-y-2">
              {(student.strongTopics || []).map((item: string, idx: number) => (
                <div
                  key={idx}
                  className="p-3 rounded-xl bg-emerald-50/70 border border-emerald-200 text-xs font-medium text-emerald-900 flex items-center justify-between"
                >
                  <span>{item}</span>
                  <span className="text-[10px] font-bold text-emerald-700 bg-white px-2 py-0.5 rounded-md border border-emerald-200">
                    {language === 'ky' ? 'Туруктуу' : 'Стабильно'}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Badges & Digital Rewards Section (Daily Streaks and ORT Topic Mastery) */}
        <BadgesSection
          badges={badges}
          student={student}
          language={language}
          t={t}
          onClaimBadge={handleClaimBadge}
          onIncrementStreak={handleIncrementStreak}
          onNavigateToTopic={handleNavigateToTopic}
        />

        {/* Student Leaderboard Section */}
        <StudentLeaderboard
          currentUser={student}
          currentUserPoints={totalMasteryPoints}
          currentUserStreak={student.streakDays || 4}
          currentUserBadgesCount={unlockedBadgesCount}
          language={language}
          onStartTraining={() => navigate('training-topic')}
        />

        {/* 8-MONTH COURSE & SEQUENTIAL PROGRESS + ELECTRONIC CONTRACT (Requirements 2, 4 & 10) */}
        <CourseCurriculumSection />

        {/* SECTION 8: «Моя подписка» (Requirement 8) */}
        {(() => {
          const isSubActive = Boolean(user?.hasPaidSubscription);
          const currentPlanTitle = isSubActive
            ? (user?.activePlanName || tariffPlans[1]?.name[language] || 'Стандарт')
            : (language === 'ky' ? 'Баштапкы (Акысыз)' : 'Базовый (Бесплатный)');
          
          const startedDateStr = user?.subscriptionStartedAt
            ? new Date(user.subscriptionStartedAt).toLocaleDateString(language === 'ky' ? 'ky-KG' : 'ru-RU', { day: 'numeric', month: 'long', year: 'numeric' })
            : new Date(Date.now() - 12 * 86400000).toLocaleDateString(language === 'ky' ? 'ky-KG' : 'ru-RU', { day: 'numeric', month: 'long', year: 'numeric' });

          const expiresDate = user?.subscriptionExpires
            ? new Date(user.subscriptionExpires)
            : new Date(Date.now() + 18 * 86400000);
          
          const expiresDateStr = expiresDate.toLocaleDateString(language === 'ky' ? 'ky-KG' : 'ru-RU', { day: 'numeric', month: 'long', year: 'numeric' });
          const remainingDays = isSubActive
            ? Math.max(0, Math.ceil((expiresDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24)))
            : 0;
          const cyclePercent = Math.min(100, Math.max(0, Math.round((remainingDays / 30) * 100)));

          return (
            <div id="cabinet-my-subscription-section" className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/90 shadow-sm space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2.5">
                    <Sparkles className="w-5 h-5 text-blue-600" />
                    <h2 className="text-base sm:text-lg font-bold text-slate-900">
                      {t.finikMySubSectionTitle || 'Моя подписка'}
                    </h2>
                  </div>
                  <p className="text-xs text-slate-500">
                    {t.finikMySubSectionDesc || 'Информация о текущем тарифном плане, сроках действия и способах оплаты'}
                  </p>
                </div>

                {/* Status Badge */}
                <span
                  className={`px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1.5 self-start sm:self-auto ${
                    isSubActive
                      ? 'bg-emerald-100 text-emerald-800'
                      : 'bg-rose-100 text-rose-800'
                  }`}
                >
                  {isSubActive ? (
                    <>
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                      <span>{t.subStatusActive || 'Активна'}</span>
                    </>
                  ) : (
                    <>
                      <XCircle className="w-3.5 h-3.5 text-rose-600" />
                      <span>{t.subStatusExpired || 'Истекла'}</span>
                    </>
                  )}
                </span>
              </div>

              {/* Sub Info Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
                  <span className="text-[11px] font-semibold text-slate-500 block mb-1">
                    {t.subCurrentPlanLabel || 'Учурдагы тариф / Тариф'}
                  </span>
                  <p className="text-base font-extrabold text-slate-900">{currentPlanTitle}</p>
                  <span className="text-[10px] text-slate-400 block mt-1">
                    {isSubActive ? '490 сом / 30 күн' : 'Чектелген мүмкүнчүлүк'}
                  </span>
                </div>

                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
                  <span className="text-[11px] font-semibold text-slate-500 block mb-1">
                    {t.subStartedAtLabel || 'Башталган датасы'}
                  </span>
                  <p className="text-sm font-bold text-slate-800">{isSubActive ? startedDateStr : '—'}</p>
                  <span className="text-[10px] text-slate-400 block mt-1">Транзакция катталган күн</span>
                </div>

                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
                  <span className="text-[11px] font-semibold text-slate-500 block mb-1">
                    {t.subExpiresAtLabel || 'Аяктоо датасы'}
                  </span>
                  <p className="text-sm font-bold text-blue-700">{isSubActive ? expiresDateStr : '—'}</p>
                  <span className="text-[10px] text-slate-400 block mt-1">30 күндүк период</span>
                </div>

                <div className="p-4 rounded-2xl bg-blue-50/70 border border-blue-200">
                  <span className="text-[11px] font-semibold text-blue-900 block mb-1">
                    {t.subRemainingDaysLabel || 'Калган күндөр'}
                  </span>
                  <div className="flex items-baseline gap-1">
                    <span className="text-2xl font-black text-blue-700">{remainingDays}</span>
                    <span className="text-xs font-bold text-blue-900">{t.cabinetDays || 'күн'}</span>
                  </div>
                  <div className="w-full bg-blue-200/70 h-1.5 rounded-full overflow-hidden mt-2">
                    <div className="bg-blue-600 h-full rounded-full transition-all" style={{ width: `${cyclePercent}%` }} />
                  </div>
                </div>
              </div>

              {/* Action Buttons: Renew, Change Plan, History */}
              <div className="flex flex-wrap items-center gap-3 pt-2">
                <button
                  id="btn-sub-renew-now"
                  onClick={() => openPayment(selectedPlan || tariffPlans[1] || tariffPlans[0])}
                  className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs sm:text-sm shadow-sm transition-all flex items-center gap-2 cursor-pointer"
                >
                  <RefreshCw className="w-4 h-4" />
                  <span>{t.subRenewBtn || 'Продлить подписку (Finik)'}</span>
                </button>

                <button
                  id="btn-sub-change-plan"
                  onClick={() => navigate('pricing')}
                  className="px-4 py-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold text-xs sm:text-sm transition-colors cursor-pointer"
                >
                  {t.subChangePlanBtn || 'Изменить тариф'}
                </button>

                <button
                  id="btn-sub-view-history"
                  onClick={() => {
                    const el = document.getElementById('cabinet-payment-history-section');
                    if (el) el.scrollIntoView({ behavior: 'smooth' });
                  }}
                  className="px-4 py-2.5 rounded-xl text-slate-600 hover:text-blue-600 font-semibold text-xs sm:text-sm transition-colors cursor-pointer ml-auto"
                >
                  {t.subPaymentHistoryBtn || 'История платежей ↓'}
                </button>
              </div>
            </div>
          );
        })()}

        {/* SECTION: «Способы оплаты» (Requirement 3: Payment methods & Auto-renewal management) */}
        <div id="cabinet-payment-methods-section" className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/90 shadow-sm space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2.5">
                <CreditCard className="w-5 h-5 text-blue-600" />
                <h2 className="text-base sm:text-lg font-bold text-slate-900">
                  {t.paymentMethodsSectionTitle}
                </h2>
              </div>
              <p className="text-xs text-slate-500 max-w-xl">
                {t.paymentMethodsSectionDesc}
              </p>
            </div>

            {/* PCI DSS Compliance Badge */}
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold shrink-0 self-start sm:self-auto">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>PCI DSS Level 1 Certified</span>
            </div>
          </div>

          {/* Saved Payment Methods List */}
          {user?.savedPaymentMethods && user.savedPaymentMethods.length > 0 ? (
            <div className="space-y-4">
              {user.savedPaymentMethods.map((method) => {
                const isAutoRenewActive = method.autoRenewEnabled ?? user.autoRenewSubscription ?? true;
                const nextBillingDate = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toLocaleDateString(
                  language === 'ky' ? 'ky-KG' : 'ru-RU',
                  { day: 'numeric', month: 'long', year: 'numeric' }
                );

                return (
                  <div
                    key={method.id}
                    className="p-5 rounded-2xl border border-slate-200 bg-slate-50/50 hover:bg-slate-50 transition-all space-y-5"
                  >
                    {/* Card Overview Row */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div className="flex items-center gap-3.5">
                        {/* Visual Card Icon */}
                        <div className="w-14 h-9 rounded-xl bg-gradient-to-tr from-slate-900 via-slate-800 to-blue-950 text-white p-2 flex flex-col justify-between shadow-xs">
                          <span className="text-[9px] font-mono font-black tracking-widest text-slate-200">
                            {method.cardBrandName || 'CARD'}
                          </span>
                          <span className="text-[10px] font-mono tracking-wider font-bold">
                            •••• {method.last4}
                          </span>
                        </div>

                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-bold text-slate-900">
                              {method.cardBrandName} •••• {method.last4}
                            </span>
                            {method.isDefault && (
                              <span className="text-[10px] bg-blue-100 text-blue-800 font-bold px-2 py-0.5 rounded-md">
                                {t.paymentCardDefaultBadge}
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-slate-500 mt-0.5 flex items-center gap-2">
                            <span>{language === 'ky' ? 'Мөөнөтү:' : 'Срок действия:'} {method.expiryMonth}/{method.expiryYear}</span>
                            <span>•</span>
                            <span className="font-mono text-[10px] text-slate-400">Token: {method.token.substring(0, 14)}...</span>
                          </p>
                        </div>
                      </div>

                      {/* Delete Card Button */}
                      <button
                        type="button"
                        onClick={() => setShowDeleteConfirmModal(method)}
                        className="self-start sm:self-auto px-3.5 py-2 rounded-xl text-rose-600 hover:bg-rose-50 border border-rose-200 hover:border-rose-300 font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer"
                      >
                        <Trash2 className="w-4 h-4" />
                        <span>{t.paymentDeleteCardBtn}</span>
                      </button>
                    </div>

                    {/* Auto-Renewal Management Panel (Requirements: Clear sum, period, next date + user can disable anytime) */}
                    <div className="p-4 rounded-xl bg-white border border-slate-200 space-y-3.5">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <div className="space-y-0.5">
                          <div className="flex items-center gap-2">
                            <h4 className="text-xs sm:text-sm font-bold text-slate-900">
                              {t.paymentAutoRenewSwitchLabel}
                            </h4>
                            <span
                              className={`text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 ${
                                isAutoRenewActive
                                  ? 'bg-emerald-100 text-emerald-800'
                                  : 'bg-slate-100 text-slate-600'
                              }`}
                            >
                              <RefreshCw className={`w-3 h-3 ${isAutoRenewActive ? 'animate-spin-slow' : ''}`} />
                              <span>
                                {isAutoRenewActive
                                  ? (language === 'ky' ? 'Иштетилди' : 'Активно')
                                  : (language === 'ky' ? 'Өчүрүлдү' : 'Отключено')}
                              </span>
                            </span>
                          </div>
                          <p className="text-[11px] text-slate-500">
                            {isAutoRenewActive
                              ? t.paymentAutoRenewActiveStatus
                              : t.paymentAutoRenewDisabledStatus}
                          </p>
                        </div>

                        {/* Interactive Toggle Switch */}
                        <div className="flex items-center gap-3">
                          <label className="relative inline-flex items-center cursor-pointer">
                            <input
                              type="checkbox"
                              checked={isAutoRenewActive}
                              disabled={isTogglingRenew}
                              onChange={async (e) => {
                                setIsTogglingRenew(true);
                                try {
                                  await toggleAutoRenew(e.target.checked);
                                } finally {
                                  setIsTogglingRenew(false);
                                }
                              }}
                              className="sr-only peer"
                            />
                            <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                          </label>
                          <span className="text-xs font-semibold text-slate-700">
                            {isAutoRenewActive
                              ? (language === 'ky' ? 'Өчүрүү' : 'Отключить')
                              : (language === 'ky' ? 'Күйгүзүү' : 'Включить')}
                          </span>
                        </div>
                      </div>

                      {/* Explicit Breakdown: Sum, Period, Next Billing Date */}
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 border-t border-slate-100">
                        <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-100">
                          <span className="text-[10px] text-slate-500 block font-medium">
                            {t.paymentAutoRenewInfoSum}
                          </span>
                          <span className="text-sm font-black text-slate-900">490 сом</span>
                        </div>

                        <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-100">
                          <span className="text-[10px] text-slate-500 block font-medium">
                            {t.paymentAutoRenewInfoPeriod}
                          </span>
                          <span className="text-xs font-bold text-slate-800">
                            {language === 'ky' ? '30 күн (1 ай)' : '30 дней (1 месяц)'}
                          </span>
                        </div>

                        <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-100">
                          <span className="text-[10px] text-slate-500 block font-medium">
                            {t.paymentAutoRenewInfoNextDate}
                          </span>
                          <span className="text-xs font-bold text-blue-700">
                            {isAutoRenewActive ? nextBillingDate : (language === 'ky' ? 'Списание жок' : 'Списаний нет')}
                          </span>
                        </div>
                      </div>

                      {/* Notice */}
                      <p className="text-[11px] text-slate-500 leading-relaxed italic">
                        {t.paymentAutoRenewNoticeCabinet}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="p-8 rounded-2xl border border-dashed border-slate-300 text-center space-y-3 bg-slate-50/50">
              <div className="w-12 h-12 rounded-2xl bg-white border border-slate-200 text-slate-400 flex items-center justify-center mx-auto shadow-2xs">
                <CreditCard className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <h4 className="text-sm font-bold text-slate-800">{t.paymentNoSavedCards}</h4>
                <p className="text-xs text-slate-500 max-w-sm mx-auto">
                  {t.paymentNoSavedCardsDesc}
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  if (tariffPlans && tariffPlans.length > 0) {
                    openPayment(tariffPlans[1] || tariffPlans[0]);
                  }
                }}
                className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-xs transition-colors cursor-pointer inline-flex items-center gap-1.5"
              >
                <Plus className="w-4 h-4" />
                <span>{language === 'ky' ? 'Подписканы активдештирүү' : 'Оформить подписку'}</span>
              </button>
            </div>
          )}

          {/* PCI DSS Security Explanation */}
          <div className="p-4 rounded-2xl bg-blue-50/60 border border-blue-100 text-xs text-slate-700 space-y-1.5">
            <div className="flex items-center gap-2 font-bold text-blue-950">
              <Lock className="w-4 h-4 text-blue-700" />
              <span>{language === 'ky' ? 'Банктык деңгээлдеги коопсуздук (PCI DSS)' : 'Безопасность банковского уровня (PCI DSS)'}</span>
            </div>
            <p className="text-[11px] text-slate-600 leading-relaxed">
              {t.paymentPciDssBadge}
            </p>
          </div>
        </div>

        {/* SECTION 9: «История платежей» (Requirement 9) */}
        <div id="cabinet-payment-history-section" className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/90 shadow-sm space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2.5">
                <Clock className="w-5 h-5 text-blue-600" />
                <h2 className="text-base sm:text-lg font-bold text-slate-900">
                  {t.finikPaymentHistoryTitle || 'История платежей'}
                </h2>
              </div>
              <p className="text-xs text-slate-500">
                {t.finikPaymentHistoryDesc || 'Все сформированные счета, чеки и статусы оплат через шлюз Finik'}
              </p>
            </div>

            <button
              onClick={async () => {
                const orders = await api.getPaymentOrders();
                setPaymentOrders(orders);
              }}
              className="px-3 py-1.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-50 flex items-center gap-1.5 self-start sm:self-auto cursor-pointer"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>{language === 'ky' ? 'Жаңылоо' : 'Обновить'}</span>
            </button>
          </div>

          {/* Payment Orders List */}
          {paymentOrders.length === 0 ? (
            <div className="p-8 text-center text-slate-400 text-xs bg-slate-50/50 rounded-2xl border border-dashed border-slate-200">
              {language === 'ky' ? 'Төлөмдөрдүн тарыхы азырынча жок' : 'История платежей пока пуста'}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-600">
                <thead className="bg-slate-50 text-[11px] font-bold text-slate-500 uppercase border-b border-slate-200">
                  <tr>
                    <th className="py-3 px-4">{t.finikColDateTime || 'Дата'}</th>
                    <th className="py-3 px-4">{t.finikColPlan || 'Тариф'}</th>
                    <th className="py-3 px-4">{t.finikColAmount || 'Сумма'}</th>
                    <th className="py-3 px-4">{t.finikColGateway || 'Способ оплаты'}</th>
                    <th className="py-3 px-4">{t.finikColStatus || 'Статус'}</th>
                    <th className="py-3 px-4">Payment ID</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {paymentOrders.map((ord) => {
                    const dateStr = new Date(ord.createdAt).toLocaleDateString(
                      language === 'ky' ? 'ky-KG' : 'ru-RU',
                      { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' }
                    );
                    const isCopied = copiedOrderId === ord.paymentId;

                    return (
                      <tr key={ord.paymentId} className="hover:bg-slate-50/60 transition-colors">
                        <td className="py-3.5 px-4 whitespace-nowrap font-medium text-slate-700">
                          {dateStr}
                        </td>
                        <td className="py-3.5 px-4 font-bold text-slate-900 whitespace-nowrap">
                          {ord.tariffName}
                        </td>
                        <td className="py-3.5 px-4 whitespace-nowrap font-black text-slate-900">
                          {ord.amount} {ord.currency}
                        </td>
                        <td className="py-3.5 px-4 whitespace-nowrap">
                          <span className="px-2 py-0.5 rounded-md bg-blue-50 text-blue-800 text-[10px] font-bold">
                            Finik SDK / QR
                          </span>
                        </td>
                        <td className="py-3.5 px-4 whitespace-nowrap">
                          {ord.paymentStatus === 'PAID' && (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold text-[11px]">
                              <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                              {t.finikStatusPaid || 'Оплачено'}
                            </span>
                          )}
                          {ord.paymentStatus === 'PENDING' && (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-800 font-bold text-[11px]">
                              <Clock className="w-3 h-3 text-amber-600" />
                              {t.finikStatusPending || 'В ожидании'}
                            </span>
                          )}
                          {(ord.paymentStatus === 'FAILED' || ord.paymentStatus === 'CANCELLED') && (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-rose-100 text-rose-800 font-bold text-[11px]">
                              <XCircle className="w-3 h-3 text-rose-600" />
                              {t.finikStatusFailed || 'Ошибка'}
                            </span>
                          )}
                        </td>
                        <td className="py-3.5 px-4 font-mono text-[11px] whitespace-nowrap">
                          <div className="flex items-center gap-1.5">
                            <span className="text-slate-500 truncate max-w-[120px]">{ord.paymentId}</span>
                            <button
                              onClick={() => {
                                navigator.clipboard.writeText(ord.paymentId);
                                setCopiedOrderId(ord.paymentId);
                                setTimeout(() => setCopiedOrderId(null), 2000);
                              }}
                              className="p-1 hover:bg-slate-200 rounded text-slate-400 hover:text-slate-700 cursor-pointer"
                              title={t.finikCopyPaymentId || 'Скопировать'}
                            >
                              {isCopied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Confirmation Modal for deleting saved card */}
        {showDeleteConfirmModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 p-4 backdrop-blur-xs animate-in fade-in">
            <div className="bg-white rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl border border-slate-100">
              <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center mx-auto border border-rose-100">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <div className="text-center space-y-1.5">
                <h3 className="text-base font-bold text-slate-900">
                  {t.paymentDeleteCardConfirmTitle}
                </h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  {t.paymentDeleteCardConfirmDesc} ({showDeleteConfirmModal.cardBrandName} •••• {showDeleteConfirmModal.last4})
                </p>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowDeleteConfirmModal(null)}
                  className="flex-1 py-2.5 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50 font-bold text-xs transition-colors cursor-pointer"
                >
                  {t.btnCancel}
                </button>
                <button
                  type="button"
                  onClick={async () => {
                    const id = showDeleteConfirmModal.id;
                    setShowDeleteConfirmModal(null);
                    await deleteSavedPaymentMethod(id);
                  }}
                  className="flex-1 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs shadow-xs transition-colors cursor-pointer"
                >
                  {t.paymentDeleteCardBtn}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
