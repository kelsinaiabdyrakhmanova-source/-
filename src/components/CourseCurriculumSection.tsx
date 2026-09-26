import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { eightMonthsCurriculum, CourseMonth, CourseLesson } from '../data/courseCurriculum';
import { tariffPlans } from '../data/initialData';
import { api } from '../services/api';
import {
  Calendar,
  Clock,
  CheckCircle2,
  Lock,
  Play,
  BookOpen,
  HelpCircle,
  Award,
  ChevronDown,
  ChevronUp,
  ArrowRight,
  Sparkles,
  FileText,
  ShieldCheck,
  Copy,
  Printer,
  Check,
  Building2,
  AlertCircle,
  X,
  RefreshCw
} from 'lucide-react';

export const CourseCurriculumSection: React.FC = () => {
  const { language, user, openPayment, showToast, navigate } = useApp();
  const isKy = language === 'ky';

  // Current active / completed months tracking
  // Month 1 is always unlocked by default. If user has completed month 1, month 2 is unlocked, etc.
  const [completedMonths, setCompletedMonths] = useState<number[]>(() => {
    try {
      const saved = localStorage.getItem(`ort_completed_months_${user?.id || 'demo'}`);
      return saved ? JSON.parse(saved) : (user?.completedCourseMonths || []);
    } catch (e) {
      return user?.completedCourseMonths || [];
    }
  });

  const [expandedMonth, setExpandedMonth] = useState<number>(() => {
    // Expand the current working month
    return completedMonths.length > 0 ? Math.min(8, Math.max(...completedMonths) + 1) : 1;
  });

  // Track completed lessons inside months
  const [completedLessons, setCompletedLessons] = useState<Record<string, boolean>>(() => {
    try {
      const saved = localStorage.getItem(`ort_completed_lessons_${user?.id || 'demo'}`);
      return saved ? JSON.parse(saved) : { 'm1-l1': true, 'm1-l2': true };
    } catch (e) {
      return { 'm1-l1': true, 'm1-l2': true };
    }
  });

  // Modal for month final exam
  const [takingExamMonth, setTakingExamMonth] = useState<CourseMonth | null>(null);
  const [examQuestions, setExamQuestions] = useState<any[]>([]);
  const [examLoading, setExamLoading] = useState(false);
  const [examAnswers, setExamAnswers] = useState<Record<string, number>>({});
  const [examSubmitting, setExamSubmitting] = useState(false);
  const [examError, setExamError] = useState<string | null>(null);
  const [examScoreResult, setExamScoreResult] = useState<{
    passed: boolean;
    scorePercent: number;
    correctCount: number;
    totalQuestions: number;
  } | null>(null);

  const [examPassedNotice, setExamPassedNotice] = useState<number | null>(null);
  const [copiedContract, setCopiedContract] = useState(false);

  // Highest unlocked month: 1 + number of completed months (or if Premium, up to sequential completed)
  const isPremiumUser = user?.subscriptionTier === 'premium';
  const maxUnlockedMonth = Math.min(8, completedMonths.length + 1);

  const toggleLesson = (lessonId: string) => {
    const updated = { ...completedLessons, [lessonId]: !completedLessons[lessonId] };
    setCompletedLessons(updated);
    try {
      localStorage.setItem(`ort_completed_lessons_${user?.id || 'demo'}`, JSON.stringify(updated));
    } catch (e) {}
  };

  const handleStartExam = async (month: CourseMonth) => {
    const monthLessons = month.lessons;
    const completedInMonth = monthLessons.filter((l) => completedLessons[l.id]).length;
    const progressPercent = monthLessons.length > 0 ? Math.round((completedInMonth / monthLessons.length) * 100) : 100;

    // Requirement 4: module completion rule: at least 90% of lessons completed
    if (progressPercent < 90) {
      showToast(
        isKy
          ? `Модулдук тестке кирүү үчүн бул айдагы сабактардын кеминде 90%-ын өтүү керек (азыр: ${progressPercent}%, ${completedInMonth}/${monthLessons.length} сабак). Алгач калган сабактарды аяктаңыз.`
          : `Для сдачи итогового теста необходимо завершить минимум 90% уроков модуля (сейчас: ${progressPercent}%, ${completedInMonth}/${monthLessons.length} уроков). Завершите оставшиеся уроки.`,
        'error'
      );
      return;
    }

    setTakingExamMonth(month);
    setExamLoading(true);
    setExamError(null);
    setExamAnswers({});
    setExamScoreResult(null);

    try {
      const data = await api.getMonthExamQuestions(month.monthNumber);
      if (data.questions && data.questions.length > 0) {
        setExamQuestions(data.questions);
      } else {
        setExamQuestions([
          {
            id: 'fe-1',
            question: isKy ? 'Эки сандын катышы 3:5 болсо, алардын суммасы 64кө барабар. Чоң санды тапкыла.' : 'Отношение двух чисел 3:5, их сумма равна 64. Найдите большее число.',
            options: ['24', '40', '32', '45']
          },
          {
            id: 'fe-2',
            question: isKy ? 'Төмөнкү сөздөрдүн кайсынысы туура жазылган?' : 'Укажите правильное соответствие аналогии: Книга : Страница :: ?',
            options: ['Дом : Кирпич', 'Река : Озеро', 'Школа : Учитель', 'Часы : Время']
          }
        ]);
      }
    } catch (err: any) {
      setExamError(err.message || 'Суроолорду жүктөөдө ката кетти');
    } finally {
      setExamLoading(false);
    }
  };

  const handleSubmitExam = async () => {
    if (!takingExamMonth) return;

    const unansweredCount = examQuestions.filter((q) => examAnswers[q.id] === undefined).length;
    if (unansweredCount > 0) {
      const confirmSubmit = window.confirm(
        isKy
          ? `Сиз ${unansweredCount} суроого жооп бере элексиз. Баары бир тестти бүтүрүп текшерүүгө жөнөтөсүзбү?`
          : `У вас осталось ${unansweredCount} неотвеченных вопросов. Всё равно отправить тест на проверку?`
      );
      if (!confirmSubmit) return;
    }

    setExamSubmitting(true);
    setExamError(null);

    try {
      const monthLessons = takingExamMonth.lessons;
      const completedCount = monthLessons.filter((l) => completedLessons[l.id]).length;

      const res = await api.submitMonthExam({
        userId: user?.id || 'demo-user',
        monthNumber: takingExamMonth.monthNumber,
        completedLessonsCount: completedCount,
        totalLessonsCount: monthLessons.length,
        answers: examAnswers,
        timeSpentSeconds: 600
      });

      if (res.passed) {
        const updated = res.completedMonths || [...completedMonths, takingExamMonth.monthNumber];
        setCompletedMonths(updated);
        try {
          localStorage.setItem(`ort_completed_months_${user?.id || 'demo'}`, JSON.stringify(updated));
        } catch (e) {}

        setTakingExamMonth(null);
        setExamPassedNotice(takingExamMonth.monthNumber);
        showToast(
          isKy ? `Экзамен ийгиликтүү тапшырылды! Жыйынтык: ${res.scorePercent}%` : `Экзамен успешно сдан! Результат: ${res.scorePercent}%`,
          'success'
        );
      } else {
        setExamError(res.error || `Сиздин жыйынтык: ${res.scorePercent}%. Өтүү босогосу 50%. Кайра тапшырып көрүңүз.`);
        setExamScoreResult({
          passed: false,
          scorePercent: res.scorePercent,
          correctCount: res.correctCount,
          totalQuestions: res.totalQuestions
        });
      }
    } catch (err: any) {
      setExamError(err.message || 'Тестти текшерүүдө ката кетти');
    } finally {
      setExamSubmitting(false);
    }
  };

  const handleNextMonthAction = (nextMonthNum: number) => {
    setExamPassedNotice(null);
    if (isPremiumUser || nextMonthNum <= maxUnlockedMonth) {
      setExpandedMonth(nextMonthNum);
      showToast(isKy ? `${nextMonthNum}-ай ачылды!` : `Открыт ${nextMonthNum}-й месяц!`, 'success');
    } else {
      // User is on Standard and needs renewal for next month
      const standardPlan = tariffPlans.find((p) => p.id === 'standard') || tariffPlans[1];
      openPayment(standardPlan);
    }
  };

  // Electronic contract data
  const contractTimestamp = user?.subscriptionStartedAt
    ? new Date(user.subscriptionStartedAt).toLocaleString(isKy ? 'ky-KG' : 'ru-RU')
    : new Date().toLocaleString(isKy ? 'ky-KG' : 'ru-RU');

  const contractFullText = `ОРТ ОНЛАЙН KG — БИЛИМ БЕРҮҮ КЫЗМАТТАРЫН КӨРСӨТҮҮ КЕЛИШИМИ (ПУБЛИЧНАЯ ОФЕРТА)
Версия: v1.0-2026
Дата жана убакыт: ${contractTimestamp}

1. ТАРАПТАР:
Аткаруучу: ОсОО «Билет Центр» (ОРТ ОНЛАЙН KG бренди)
Тапшырыкчы (Колдонуучу): ${user?.fullName || 'Окуучу'}
Телефон номери: ${user?.phone || '+996 ...'}
Колдонуучу ID: ${user?.id || 'user-student'}

2. КЫЗМАТТЫН ПРЕДМЕТИ:
Жалпы республикалык тестирлөөгө (ОРТ) онлайн даярдоо курсуна жеткилик берүү.
Тариф: ${user?.activePlanName || (isPremiumUser ? 'Premium (Толук 8 айлык курс)' : 'Standard (1 айлык модуль)')}
Окуу форматы: 8 айлык ырааттуу программа (200+ академиялык саат), видеолекциялар, практика жана жеке онлайн-репетитор.

3. ШАРТТАР ЖАНА ЭРЕЖЕЛЕР:
- Модулдар ырааттуу ачылат: 1-ай аяктагандан кийин гана 2-ай ачылат.
- Аккаунтту башка адамдарга берүүгө жана материалдарды көчүрүүгө тыюу салынат.
- Төлөм алуучу: ОсОО «Билет Центр».

Электрондук акцепт катталды. IP / Техникалык кол тамга: 127.0.0.1 (АКЦЕПТ ОО-2026)`;

  const handleCopyContract = () => {
    navigator.clipboard.writeText(contractFullText);
    setCopiedContract(true);
    setTimeout(() => setCopiedContract(false), 2000);
    showToast(isKy ? 'Келишим текст катары көчүрүлдү!' : 'Текст договора скопирован!', 'info');
  };

  const handlePrintContract = () => {
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(`
        <html>
          <head>
            <title>Келишим ОРТ ОНЛАЙН KG — ${user?.fullName || 'Окуучу'}</title>
            <style>
              body { font-family: sans-serif; padding: 40px; line-height: 1.6; color: #1e293b; max-width: 800px; margin: 0 auto; }
              h1 { color: #1d4ed8; font-size: 20px; border-bottom: 2px solid #e2e8f0; padding-bottom: 10px; }
              pre { background: #f8fafc; padding: 20px; border: 1px solid #cbd5e1; border-radius: 8px; white-space: pre-wrap; font-size: 13px; }
              .stamp { margin-top: 30px; border: 2px solid #10b981; padding: 15px; border-radius: 8px; display: inline-block; color: #047857; font-weight: bold; }
            </style>
          </head>
          <body>
            <h1>ОРТ ОНЛАЙН KG — Расмий электрондук келишим</h1>
            <pre>${contractFullText}</pre>
            <div class="stamp">
              ✓ ЭЛЕКТРОНДУК ТҮРДӨ КАБЫЛ АЛЫНГАН<br>
              Аткаруучу: ОсОО «Билет Центр»<br>
              Датасы: ${contractTimestamp}
            </div>
            <script>window.print();</script>
          </body>
        </html>
      `);
      printWindow.document.close();
    }
  };

  return (
    <div className="space-y-8">
      {/* 8-MONTH COURSE HEADER & PROGRAM OVERVIEW */}
      <div id="course-8-months-section" className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/90 shadow-sm space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-5">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 text-blue-800 text-xs font-bold border border-blue-200 mb-1">
              <Sparkles className="w-3.5 h-3.5 text-blue-600" />
              <span>{isKy ? '8 айлык расмий ОРТ программасы' : 'Официальная 8-месячная программа ОРТ'}</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
              {isKy ? '8 айлык окуу курсу жана этап-этабы менен ачуу' : '8-месячный курс и пошаговый прогресс'}
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 max-w-2xl leading-relaxed">
              {isKy
                ? 'ЦООМО стандарты боюнча түзүлгөн 200+ академиялык саат. Педагогикалык ырааттуулук: 1-ай толук бүткөндөн кийин гана 2-ай ачылат.'
                : '200+ часов подготовки по стандарту ЦООМО. Строгая педагогическая последовательность: переход к следующему месяцу открывается только после завершения предыдущего.'}
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-2xl text-center min-w-[110px]">
              <span className="text-[10px] uppercase font-bold text-slate-500 block">
                {isKy ? 'Аяктаган' : 'Завершено'}
              </span>
              <span className="text-xl font-black text-blue-700">
                {completedMonths.length} / 8
              </span>
              <span className="text-[10px] text-slate-400 block">{isKy ? 'модуль' : 'модулей'}</span>
            </div>

            {isPremiumUser ? (
              <span className="px-3.5 py-2 rounded-2xl bg-amber-100 text-amber-900 font-extrabold text-xs border border-amber-300 flex items-center gap-1.5 shadow-2xs">
                <Award className="w-4 h-4 text-amber-700" />
                <span>Premium (8 ай ачык)</span>
              </span>
            ) : (
              <span className="px-3 py-1.5 rounded-2xl bg-blue-50 text-blue-900 font-bold text-xs border border-blue-200">
                Standard (1 айлык модуль)
              </span>
            )}
          </div>
        </div>

        {/* Sequential Rule Notification */}
        <div className="p-4 rounded-2xl bg-blue-50/70 border border-blue-200/80 text-xs text-blue-950 space-y-1">
          <div className="font-bold flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-blue-700" />
            <span>{isKy ? 'Педагогикалык эреже:' : 'Педагогическое правило:'}</span>
          </div>
          <p className="text-[11px] text-blue-900 leading-relaxed">
            {isKy
              ? 'Ай аяктады деп эсептелиши үчүн: милдеттүү сабактар өтүлүшү, негизги видеолор көрүлүшү, практика аткарылышы жана айдын финалдык тести тапшырылышы керек. Ай толук бүткөндө кийинки айды улантуу автоматтык сунушталат.'
              : 'Для завершения модуля необходимо изучить обязательную теорию, просмотреть видеолекции, выполнить практические задания и сдать итоговый тест месяца.'}
          </p>
        </div>

        {/* 8-MONTH ACCORDION LIST */}
        <div className="space-y-4">
          {eightMonthsCurriculum.map((month) => {
            const isCompleted = completedMonths.includes(month.monthNumber);
            const isUnlocked = month.monthNumber <= maxUnlockedMonth;
            const isExpanded = expandedMonth === month.monthNumber;

            // Count lessons completed in this month
            const monthLessons = month.lessons;
            const completedInMonth = monthLessons.filter((l) => completedLessons[l.id]).length;
            const progressPercent = Math.round((completedInMonth / monthLessons.length) * 100);

            return (
              <div
                key={month.monthNumber}
                className={`rounded-2xl border transition-all duration-200 overflow-hidden ${
                  isCompleted
                    ? 'border-emerald-300 bg-emerald-50/20 shadow-2xs'
                    : isUnlocked
                    ? 'border-blue-300 bg-white shadow-sm ring-1 ring-blue-500/10'
                    : 'border-slate-200 bg-slate-50/60 opacity-80'
                }`}
              >
                {/* Month Card Header */}
                <div
                  onClick={() => {
                    if (isUnlocked) {
                      setExpandedMonth(isExpanded ? 0 : month.monthNumber);
                    } else {
                      showToast(
                        isKy
                          ? `Алгач ${month.monthNumber - 1}-айды толук бүтүрүңүз!`
                          : `Сначала завершите ${month.monthNumber - 1}-й месяц!`,
                        'info'
                      );
                    }
                  }}
                  className={`p-4 sm:p-5 flex items-center justify-between gap-4 cursor-pointer select-none transition-colors ${
                    isUnlocked ? 'hover:bg-slate-50/80' : 'cursor-not-allowed'
                  }`}
                >
                  <div className="flex items-center gap-3.5">
                    <div
                      className={`w-10 h-10 rounded-xl flex items-center justify-center font-black text-sm shrink-0 shadow-2xs ${
                        isCompleted
                          ? 'bg-emerald-600 text-white'
                          : isUnlocked
                          ? 'bg-blue-600 text-white'
                          : 'bg-slate-200 text-slate-500'
                      }`}
                    >
                      {isCompleted ? (
                        <Check className="w-5 h-5" />
                      ) : isUnlocked ? (
                        month.monthNumber
                      ) : (
                        <Lock className="w-4 h-4" />
                      )}
                    </div>

                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="font-extrabold text-sm sm:text-base text-slate-900">
                          {month.title[language]}
                        </h3>
                        <span className="text-[11px] px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 font-semibold border border-slate-200">
                          ⏱ {month.estimatedHours}
                        </span>
                        {isCompleted && (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300">
                            ✓ {isKy ? 'Аяктады' : 'Завершен'}
                          </span>
                        )}
                        {!isUnlocked && (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-200 text-slate-600 flex items-center gap-1">
                            <Lock className="w-3 h-3" />
                            {isKy ? 'Бөгөттөлгөн' : 'Заблокирован'}
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-500 mt-0.5 max-w-xl">
                        {month.subtitle[language]}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    {isUnlocked && (
                      <div className="hidden sm:flex flex-col items-end text-right">
                        <span className="text-xs font-bold text-slate-700">
                          {completedInMonth} / {monthLessons.length} {isKy ? 'сабак' : 'уроков'}
                        </span>
                        <div className="w-24 bg-slate-200 h-1.5 rounded-full overflow-hidden mt-1">
                          <div
                            className={`h-full rounded-full transition-all ${
                              isCompleted ? 'bg-emerald-600' : 'bg-blue-600'
                            }`}
                            style={{ width: `${progressPercent}%` }}
                          />
                        </div>
                      </div>
                    )}

                    {isUnlocked && (
                      <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center text-slate-500 hover:text-slate-900 transition-colors">
                        {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                      </div>
                    )}
                  </div>
                </div>

                {/* Expanded Month Lessons & Activities */}
                {isExpanded && isUnlocked && (
                  <div className="p-4 sm:p-5 pt-0 border-t border-slate-100 space-y-4 animate-in slide-in-from-top-2">
                    {/* Goal & Key Topics */}
                    <div className="p-3.5 bg-slate-50 rounded-xl text-xs space-y-2 border border-slate-200/70">
                      <div>
                        <strong className="text-slate-900">{isKy ? 'Айдын башкы максаты:' : 'Главная цель модуля:'}</strong>{' '}
                        <span className="text-slate-600">{month.goal[language]}</span>
                      </div>
                      <div>
                        <strong className="text-slate-900">{isKy ? 'Камтылган негизги темалар:' : 'Ключевые темы:'}</strong>
                        <div className="flex flex-wrap gap-1.5 pt-1">
                          {month.topics[language].map((top, tIdx) => (
                            <span key={tIdx} className="px-2 py-0.5 rounded-md bg-white border border-slate-200 text-slate-700 text-[11px]">
                              • {top}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Lessons Checklist */}
                    <div className="space-y-2">
                      <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                        {isKy ? 'Милдеттүү сабактар жана практика:' : 'Обязательные уроки и практика:'}
                      </h4>
                      <div className="grid grid-cols-1 gap-2">
                        {monthLessons.map((lesson) => {
                          const isDone = Boolean(completedLessons[lesson.id]);
                          return (
                            <div
                              key={lesson.id}
                              className={`p-3 rounded-xl border flex items-center justify-between gap-3 text-xs transition-colors ${
                                isDone
                                  ? 'bg-emerald-50/40 border-emerald-200 text-slate-700'
                                  : 'bg-white border-slate-200 hover:border-slate-300'
                              }`}
                            >
                              <div className="flex items-center gap-3">
                                <button
                                  type="button"
                                  onClick={() => toggleLesson(lesson.id)}
                                  className={`w-5 h-5 rounded-md border flex items-center justify-center transition-colors cursor-pointer ${
                                    isDone
                                      ? 'bg-emerald-600 border-emerald-600 text-white'
                                      : 'border-slate-300 hover:border-blue-500 bg-white'
                                  }`}
                                >
                                  {isDone && <Check className="w-3.5 h-3.5" />}
                                </button>
                                <div>
                                  <div className="flex items-center gap-2">
                                    <span className={`font-bold ${isDone ? 'line-through text-slate-400' : 'text-slate-900'}`}>
                                      {lesson.number}. {lesson.title[language]}
                                    </span>
                                    <span className="text-[10px] px-1.5 py-0.2 rounded bg-slate-100 text-slate-500 font-mono">
                                      {lesson.hours} саат
                                    </span>
                                    {lesson.isMandatory && (
                                      <span className="text-[10px] text-amber-700 font-bold">
                                        *милдеттүү
                                      </span>
                                    )}
                                  </div>
                                  <p className="text-[11px] text-slate-500 mt-0.5">
                                    {lesson.description[language]}
                                  </p>
                                </div>
                              </div>

                              <button
                                type="button"
                                onClick={() => navigate('training-topic')}
                                className="px-3 py-1 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-700 font-bold text-[11px] transition-colors shrink-0"
                              >
                                {isKy ? 'Өтүү' : 'Перейти'}
                              </button>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* Final Exam of the Month Button */}
                    <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-3 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl border border-blue-200">
                      <div className="space-y-0.5 text-center sm:text-left">
                        <div className="font-bold text-slate-900 text-xs sm:text-sm flex items-center justify-center sm:justify-start gap-1.5">
                          <Award className="w-4 h-4 text-blue-600" />
                          <span>{month.title[language]} — {isKy ? 'Финалдык экзамен' : 'Итоговый экзамен'}</span>
                        </div>
                        <p className="text-[11px] text-slate-600">
                          {isKy
                            ? `Шарты: сабактардын кеминде 90% көрүлүшү жана тесттен кеминде 50% балл алуу.`
                            : `Условие: не менее 90% пройденных уроков модуля и от 50% правильных ответов на тесте.`}
                        </p>
                      </div>

                      {isCompleted ? (
                        <span className="px-4 py-2 rounded-xl bg-emerald-600 text-white font-bold text-xs flex items-center gap-1.5 shadow-xs">
                          <CheckCircle2 className="w-4 h-4" />
                          <span>{isKy ? 'Экзамен тапшырылды' : 'Экзамен успешно сдан'}</span>
                        </span>
                      ) : (
                        <button
                          type="button"
                          onClick={() => handleStartExam(month)}
                          className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md transition-all flex items-center gap-2 cursor-pointer shrink-0"
                        >
                          <Play className="w-4 h-4" />
                          <span>{isKy ? 'Финалдык тестти баштоо' : 'Сдать итоговый тест'}</span>
                        </button>
                      )}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* INTERACTIVE MONTH EXAM MODAL (Server-verified with >= 50% score threshold) */}
      {takingExamMonth && (
        <div
          id="modal-taking-month-exam"
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/75 p-4 backdrop-blur-xs overflow-y-auto animate-in fade-in"
        >
          <div className="bg-white rounded-3xl max-w-2xl w-full shadow-2xl border border-slate-100 my-6 p-6 sm:p-8 space-y-6 animate-in zoom-in-95 max-h-[90vh] flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-slate-100 pb-4 shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-blue-100 text-blue-700 flex items-center justify-center font-bold">
                  <Award className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base sm:text-lg font-black text-slate-900">
                    {takingExamMonth.title[language]} — {isKy ? 'Финалдык экзамен' : 'Итоговый экзамен'}
                  </h3>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                      {isKy ? 'Өтүү босогосу: 50%' : 'Проходной балл: 50%'}
                    </span>
                    <span className="text-[11px] text-slate-500">
                      {Object.keys(examAnswers).length} / {examQuestions.length} {isKy ? 'жооп берилди' : 'отвечено'}
                    </span>
                  </div>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setTakingExamMonth(null)}
                className="w-8 h-8 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-700 flex items-center justify-center font-bold cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Error / Result Banner */}
            {examError && (
              <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs sm:text-sm flex items-start gap-2.5 shrink-0">
                <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <p className="font-bold">{examError}</p>
                  {examScoreResult && (
                    <p className="text-xs text-rose-600">
                      {isKy
                        ? `Сиз ${examScoreResult.totalQuestions} суроодон ${examScoreResult.correctCount} туура жооп бердиңиз (${examScoreResult.scorePercent}%). Кеминде 50% талап кылынат.`
                        : `Вы правильно ответили на ${examScoreResult.correctCount} из ${examScoreResult.totalQuestions} вопросов (${examScoreResult.scorePercent}%). Требуется минимум 50%.`}
                    </p>
                  )}
                </div>
              </div>
            )}

            {/* Questions List */}
            <div className="overflow-y-auto space-y-5 pr-1 flex-1">
              {examLoading ? (
                <div className="py-16 text-center text-slate-500 space-y-2">
                  <RefreshCw className="w-8 h-8 mx-auto animate-spin text-blue-600" />
                  <p className="font-semibold text-xs">{isKy ? 'Суроолор жүктөлүүдө...' : 'Загрузка вопросов...'}</p>
                </div>
              ) : (
                examQuestions.map((q, idx) => {
                  const selected = examAnswers[q.id];
                  return (
                    <div key={q.id || idx} className="p-4 rounded-2xl border border-slate-200 bg-slate-50/50 space-y-3 text-xs sm:text-sm">
                      <div className="flex items-start gap-2 font-bold text-slate-900">
                        <span className="w-6 h-6 rounded-lg bg-blue-600 text-white flex items-center justify-center text-xs shrink-0 mt-0.5 font-mono">
                          {idx + 1}
                        </span>
                        <p className="leading-relaxed">{q.question}</p>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                        {q.options?.map((opt: string, optIdx: number) => {
                          const isChosen = selected === optIdx;
                          return (
                            <button
                              key={optIdx}
                              type="button"
                              onClick={() => setExamAnswers((prev) => ({ ...prev, [q.id]: optIdx }))}
                              className={`p-3 rounded-xl border text-left text-xs font-medium transition-all flex items-center gap-2.5 cursor-pointer ${
                                isChosen
                                  ? 'bg-blue-600 border-blue-600 text-white shadow-xs font-bold'
                                  : 'bg-white border-slate-200 hover:border-slate-300 text-slate-800'
                              }`}
                            >
                              <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[11px] font-mono shrink-0 border ${
                                isChosen ? 'bg-white text-blue-700 border-white' : 'border-slate-300 text-slate-500'
                              }`}>
                                {String.fromCharCode(65 + optIdx)}
                              </span>
                              <span className="leading-snug">{opt}</span>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Footer Buttons */}
            <div className="flex items-center justify-between border-t border-slate-100 pt-4 shrink-0">
              <button
                type="button"
                onClick={() => setTakingExamMonth(null)}
                className="px-4 py-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold text-xs cursor-pointer"
              >
                {isKy ? 'Артка' : 'Отмена'}
              </button>

              <button
                type="button"
                disabled={examSubmitting || examLoading}
                onClick={handleSubmitExam}
                className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-bold text-xs sm:text-sm shadow-md transition-all flex items-center gap-2 cursor-pointer"
              >
                {examSubmitting ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>{isKy ? 'Текшерилүүдө...' : 'Проверка...'}</span>
                  </>
                ) : (
                  <span>{isKy ? 'Тестти бүтүрүү жана текшерүү' : 'Завершить и проверить'}</span>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* CONGRATULATION & NEXT MONTH MODAL (Prompt requirement 2) */}
      {examPassedNotice && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 p-4 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-7 space-y-4 shadow-2xl border border-slate-100 text-center animate-in zoom-in-95">
            <div className="w-16 h-16 rounded-3xl bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto shadow-md">
              <Award className="w-10 h-10" />
            </div>

            <div className="space-y-1.5">
              <h3 className="text-xl font-black text-slate-900">
                {isKy ? 'Куттуктайбыз! Ай ийгиликтүү бүттү! 🎉' : 'Поздравляем! Модуль успешно завершен! 🎉'}
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                {isKy
                  ? `Сиз ${examPassedNotice}-айдын бардык милдеттүү тапшырмаларын жана финалдык тестин ийгиликтүү тапшырдыңыз.`
                  : `Вы успешно сдали контрольный тест и завершили программу ${examPassedNotice}-го месяца.`}
              </p>
            </div>

            <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 text-xs text-left space-y-1">
              <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block">
                {isKy ? 'Кийинки кадам:' : 'Следующий шаг:'}
              </span>
              <p className="font-bold text-slate-900">
                {examPassedNotice < 8
                  ? (isKy ? `${examPassedNotice + 1}-ай: ОРТ даярдыгын улантуу` : `${examPassedNotice + 1}-й модуль: продолжение курса`)
                  : (isKy ? 'Бардык 8 ай толук бүттү! Сиз ОРТга 100% даярсыз!' : 'Все 8 модулей пройдены! Вы полностью готовы к ОРТ!')}
              </p>
            </div>

            <div className="pt-2 space-y-2">
              {examPassedNotice < 8 ? (
                <button
                  type="button"
                  onClick={() => handleNextMonthAction(examPassedNotice + 1)}
                  className="w-full py-3.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-extrabold text-sm shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <span>{isKy ? 'Кийинки айды улантуу' : 'Продолжить следующий месяц'}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => setExamPassedNotice(null)}
                  className="w-full py-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm shadow-md transition-all cursor-pointer"
                >
                  {isKy ? 'Жабуу' : 'Отлично'}
                </button>
              )}

              <button
                type="button"
                onClick={() => setExamPassedNotice(null)}
                className="w-full py-2 text-xs font-semibold text-slate-500 hover:text-slate-800 transition-colors"
              >
                {isKy ? 'Кабинетке кайтуу' : 'Вернуться в кабинет'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* SECTION: «МЕНИН КЕЛИШИМИМ» / «ОФЕРТА ШАРТТАРЫ» (Requirement 10) */}
      <div id="cabinet-my-contract-section" className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/90 shadow-sm space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2.5">
              <FileText className="w-5 h-5 text-blue-600" />
              <h2 className="text-base sm:text-lg font-bold text-slate-900">
                {isKy ? 'Менин келишимим (Публичная оферта)' : 'Мой договор (Публичная оферта)'}
              </h2>
            </div>
            <p className="text-xs text-slate-500">
              {isKy
                ? 'Сиз кабыл алган расмий электрондук келишим жана юридикалык реквизиттер'
                : 'Официальный электронный договор и юридические реквизиты, принятые вами при регистрации'}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleCopyContract}
              className="px-3 py-1.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-bold transition-colors inline-flex items-center gap-1.5 cursor-pointer shadow-2xs"
            >
              {copiedContract ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{isKy ? 'Текстти көчүрүү' : 'Скопировать'}</span>
            </button>

            <button
              type="button"
              onClick={handlePrintContract}
              className="px-3 py-1.5 rounded-xl bg-blue-50 hover:bg-blue-100 border border-blue-200 text-blue-700 text-xs font-bold transition-colors inline-flex items-center gap-1.5 cursor-pointer shadow-2xs"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>{isKy ? 'Басып чыгаруу / PDF' : 'Печать / PDF'}</span>
            </button>
          </div>
        </div>

        {/* Contract Card Details */}
        <div className="p-5 bg-slate-50 rounded-2xl border border-slate-200 space-y-4 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">
                {isKy ? 'Төлөм алуучу / Аткаруучу:' : 'Получатель / Исполнитель:'}
              </span>
              <p className="font-extrabold text-slate-900 mt-0.5">ОсОО «Билет Центр»</p>
              <span className="text-[10px] text-blue-600 font-medium">ОРТ ОНЛАЙН KG</span>
            </div>

            <div>
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">
                {isKy ? 'Тапшырыкчы (Окуучу):' : 'Заказчик (Учащийся):'}
              </span>
              <p className="font-bold text-slate-900 mt-0.5">{user?.fullName || 'Окуучу'}</p>
              <span className="text-[10px] text-slate-500 font-mono">{user?.phone || '+996 ...'}</span>
            </div>

            <div>
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">
                {isKy ? 'Тариф жана статус:' : 'Тариф и статус:'}
              </span>
              <p className="font-bold text-slate-900 mt-0.5">
                {user?.subscriptionTier === 'premium' ? 'Premium (Толук 8 ай)' : 'Standard (1 ай)'}
              </p>
              <span className="text-[10px] text-emerald-600 font-bold">✓ Акцепт күчүндө</span>
            </div>

            <div>
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">
                {isKy ? 'Кабыл алынган убакыт:' : 'Дата акцепта:'}
              </span>
              <p className="font-mono text-slate-800 mt-0.5">{contractTimestamp}</p>
              <span className="text-[10px] text-slate-400">Версия: v1.0-2026</span>
            </div>
          </div>

          <div className="pt-3 border-t border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-[11px] text-slate-500">
            <div className="flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>
                {isKy
                  ? 'Бул келишим КР Жарандык кодексинин 398-беренеси боюнча мыйзамдуу күчкө ээ.'
                  : 'Настоящий договор имеет полную юридическую силу согласно ст. 398 ГК КР.'}
              </span>
            </div>

            <button
              type="button"
              onClick={() => navigate('terms')}
              className="text-blue-600 hover:underline font-semibold self-start sm:self-auto"
            >
              {isKy ? 'Толук офертаны окуу →' : 'Читать полную оферту →'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
