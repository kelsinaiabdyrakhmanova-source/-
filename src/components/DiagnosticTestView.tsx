import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '../context/AppContext';
import { Question } from '../types';
import { api } from '../services/api';
import { AiExplainerModal } from './AiExplainerModal';
import {
  Clock,
  ChevronRight,
  ChevronLeft,
  AlertCircle,
  HelpCircle,
  Globe,
  Sparkles,
  Shuffle,
  CheckCircle2,
  BookOpen,
  Send,
  Target,
  Calendar,
  Layers,
  Check
} from 'lucide-react';
import confetti from 'canvas-confetti';

export const DiagnosticTestView: React.FC = () => {
  const { questions, language, setLanguage, t, saveDiagnosticScore, navigate, user, showToast } = useApp();

  // Onboarding Setup State (Requirement 1: ОРТ тили, максаттуу балл, калган убакыт, предметтик тесттер)
  const [testLanguageSelected, setTestLanguageSelected] = useState<boolean>(false);
  const [testLang, setTestLang] = useState<'ky' | 'ru'>(language);
  const [targetScore, setTargetScore] = useState<number>(user?.targetScore || 190);
  const [monthsUntilOrt, setMonthsUntilOrt] = useState<string>('6'); // 1, 3, 6, 9 ай
  const [selectedElectives, setSelectedElectives] = useState<string[]>(['math-adv']);
  const [shuffleQuestions, setShuffleQuestions] = useState<boolean>(true);

  // Active attempt state
  const [attemptId, setAttemptId] = useState<string>('');
  const [testQuestions, setTestQuestions] = useState<Question[]>([]);
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [userAnswers, setUserAnswers] = useState<Record<string, number>>({});
  const [timeLeftSeconds, setTimeLeftSeconds] = useState<number>(1200); // 20 mins for 20 questions
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // AI Explainer Modal in Test
  const [aiModalQuestion, setAiModalQuestion] = useState<Question | null>(null);

  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const isKy = testLang === 'ky';
  const optLetters = ['А', 'Б', 'В', 'Г'];

  // Elective subjects list
  const electiveOptions = [
    { id: 'math-adv', name: isKy ? 'Математика (тереңдетилген)' : 'Математика (профильная)' },
    { id: 'history', name: isKy ? 'Тарых' : 'История' },
    { id: 'english', name: isKy ? 'Англис тили' : 'Английский язык' },
    { id: 'physics', name: isKy ? 'Физика' : 'Физика' },
    { id: 'chemistry', name: isKy ? 'Химия' : 'Химия' },
    { id: 'biology', name: isKy ? 'Биология' : 'Биология' }
  ];

  const toggleElective = (id: string) => {
    setSelectedElectives((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  // Restore or start test attempt
  const initAttempt = async (selectedLang: 'ky' | 'ru') => {
    try {
      // 1. Get published questions for diagnostic (6 math, 4 analogies, 3 sentences, 4 reading, 3 grammar = 20)
      const math = questions.filter((q) => q.subjectId === 'math' && q.status !== 'archived').slice(0, 6);
      const analogies = questions.filter((q) => q.subjectId === 'analogies' && q.status !== 'archived').slice(0, 4);
      const sentences = questions.filter((q) => q.subjectId === 'sentences' && q.status !== 'archived').slice(0, 3);
      const reading = questions.filter((q) => q.subjectId === 'reading' && q.status !== 'archived').slice(0, 4);
      const grammar = questions.filter((q) => q.subjectId === 'grammar' && q.status !== 'archived').slice(0, 3);

      let pool = [...math, ...analogies, ...sentences, ...reading, ...grammar];

      // If less than 20 due to filtering, fill up
      if (pool.length < 20) {
        const remaining = questions.filter((q) => !pool.some((p) => p.id === q.id)).slice(0, 20 - pool.length);
        pool = [...pool, ...remaining];
      }

      // Shuffle if enabled
      if (shuffleQuestions) {
        pool = [...pool].sort(() => Math.random() - 0.5);
      }

      setTestQuestions(pool);

      // Check local stored attempt
      const savedAttemptStr = localStorage.getItem('bilim_active_diagnostic_attempt');
      if (savedAttemptStr) {
        try {
          const saved = JSON.parse(savedAttemptStr);
          if (saved.attemptId && saved.status === 'in_progress') {
            setAttemptId(saved.attemptId);
            setUserAnswers(saved.userAnswers || {});
            setTimeLeftSeconds(saved.timeLeftSeconds || 1200);
            setCurrentIndex(saved.currentIndex || 0);
            setTestLanguageSelected(true);
            setTestLang(saved.testLang || selectedLang);
            return;
          }
        } catch (e) {}
      }

      // Server attempt
      const res = await api.startDiagnosticAttempt(user?.id || 'user-demo-student', selectedLang);
      const newAttId = res.attemptId || 'attempt-' + Date.now();
      setAttemptId(newAttId);

      const attemptRecord = {
        attemptId: newAttId,
        testLang: selectedLang,
        targetScore,
        monthsUntilOrt,
        selectedElectives,
        status: 'in_progress',
        userAnswers: {},
        timeLeftSeconds: 1200,
        currentIndex: 0
      };
      localStorage.setItem('bilim_active_diagnostic_attempt', JSON.stringify(attemptRecord));
      setTestLanguageSelected(true);
    } catch (e) {
      // Fallback local
      const math = questions.filter((q) => q.subjectId === 'math').slice(0, 6);
      const analogies = questions.filter((q) => q.subjectId === 'analogies').slice(0, 4);
      const sentences = questions.filter((q) => q.subjectId === 'sentences').slice(0, 3);
      const reading = questions.filter((q) => q.subjectId === 'reading').slice(0, 4);
      const grammar = questions.filter((q) => q.subjectId === 'grammar').slice(0, 3);
      setTestQuestions([...math, ...analogies, ...sentences, ...reading, ...grammar]);
      setAttemptId('attempt-local-' + Date.now());
      setTestLanguageSelected(true);
    }
  };

  // Timer Effect
  useEffect(() => {
    if (!testLanguageSelected) return;

    timerRef.current = setInterval(() => {
      setTimeLeftSeconds((prev) => {
        if (prev <= 1) {
          if (timerRef.current) clearInterval(timerRef.current);
          handleFinishTest(true);
          return 0;
        }
        const updated = prev - 1;
        if (updated % 5 === 0) {
          syncToStorage(updated, currentIndex, userAnswers);
        }
        return updated;
      });
    }, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [testLanguageSelected, currentIndex, userAnswers]);

  const syncToStorage = (timeLeft: number, cIdx: number, ans: Record<string, number>) => {
    const savedAttemptStr = localStorage.getItem('bilim_active_diagnostic_attempt');
    if (savedAttemptStr) {
      try {
        const obj = JSON.parse(savedAttemptStr);
        obj.timeLeftSeconds = timeLeft;
        obj.currentIndex = cIdx;
        obj.userAnswers = ans;
        localStorage.setItem('bilim_active_diagnostic_attempt', JSON.stringify(obj));
      } catch (e) {}
    }
  };

  const currentQ = testQuestions[currentIndex];

  const handleSelectOption = (optIndex: number) => {
    if (!currentQ) return;
    const updatedAnswers = {
      ...userAnswers,
      [currentQ.id]: optIndex
    };
    setUserAnswers(updatedAnswers);
    syncToStorage(timeLeftSeconds, currentIndex, updatedAnswers);
    api.saveAttemptAnswer(attemptId, currentQ.id, optIndex, 1200 - timeLeftSeconds).catch(() => {});
  };

  const handleNext = () => {
    if (currentIndex < testQuestions.length - 1) {
      const nextIdx = currentIndex + 1;
      setCurrentIndex(nextIdx);
      syncToStorage(timeLeftSeconds, nextIdx, userAnswers);
    } else {
      setIsConfirmModalOpen(true);
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      const prevIdx = currentIndex - 1;
      setCurrentIndex(prevIdx);
      syncToStorage(timeLeftSeconds, prevIdx, userAnswers);
    }
  };

  // Skipped / Unanswered calculation
  const totalQuestionsCount = testQuestions.length;
  const answeredCount = Object.keys(userAnswers).filter(
    (qId) => userAnswers[qId] !== undefined && userAnswers[qId] !== -1
  ).length;
  const skippedCount = totalQuestionsCount - answeredCount;

  // Finish test & Calculate multi-part ORT breakdown
  const handleFinishTest = async (force = false) => {
    if (isSubmitting) return;
    setIsSubmitting(true);
    setIsConfirmModalOpen(false);

    try {
      const timeSpent = 1200 - timeLeftSeconds;
      const res = await api.finishAttempt(attemptId, userAnswers, timeSpent);
      if (res && res.report) {
        saveDiagnosticScore(res.report);
        localStorage.removeItem('bilim_active_diagnostic_attempt');
        confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });
        navigate('diagnostic-result');
        return;
      }
    } catch (err) {
      console.warn('Server evaluate fallback to local:', err);
    }

    // Local evaluation engine with all 5 core ORT subtests
    let correctCount = 0;
    let incorrectCount = 0;

    const subjectStats: Record<string, { total: number; correct: number; name: { ky: string; ru: string } }> = {
      math: { total: 0, correct: 0, name: { ky: 'Математика', ru: 'Математика' } },
      analogies: { total: 0, correct: 0, name: { ky: 'Аналогиялар (Окшоштуктар)', ru: 'Аналогии' } },
      sentences: { total: 0, correct: 0, name: { ky: 'Сүйлөмдөрдү толуктоо', ru: 'Дополнение предложений' } },
      reading: { total: 0, correct: 0, name: { ky: 'Окуп түшүнүү', ru: 'Чтение текста' } },
      grammar: { total: 0, correct: 0, name: { ky: 'Практикалык грамматика', ru: 'Практическая грамматика' } }
    };
    const topicStats: Record<string, { total: number; correct: number; subjectId: string }> = {};

    testQuestions.forEach((q) => {
      const selected = userAnswers[q.id];
      const isSkipped = selected === undefined || selected === -1;
      const isCorrect = !isSkipped && selected === q.correctOptionIndex;

      const subId = q.subjectId;
      if (subjectStats[subId]) subjectStats[subId].total += 1;

      const topicName = q.topic[testLang];
      if (!topicStats[topicName]) {
        topicStats[topicName] = { total: 0, correct: 0, subjectId: subId };
      }
      topicStats[topicName].total += 1;

      if (isCorrect) {
        correctCount += 1;
        if (subjectStats[subId]) subjectStats[subId].correct += 1;
        topicStats[topicName].correct += 1;
      } else if (!isSkipped) {
        incorrectCount += 1;
      }
    });

    const accuracy = totalQuestionsCount > 0 ? Math.round((correctCount / totalQuestionsCount) * 100) : 0;
    const estimatedPredictedScore = Math.round(110 + (correctCount / totalQuestionsCount) * 115);

    const classifiedTopics = Object.entries(topicStats).map(([topic, st]) => {
      const pct = Math.round((st.correct / st.total) * 100);
      let tierKey: 'needs_basics' | 'needs_practice' | 'good' | 'strong' = 'needs_basics';
      let tierLabel = { ky: 'Негиздерден баштоо керек', ru: 'Нужно начать с основ' };

      if (pct >= 85) {
        tierKey = 'strong';
        tierLabel = { ky: 'Күчтүү тема', ru: 'Сильная тема' };
      } else if (pct >= 70) {
        tierKey = 'good';
        tierLabel = { ky: 'Жакшы деңгээл', ru: 'Хороший уровень' };
      } else if (pct >= 40) {
        tierKey = 'needs_practice';
        tierLabel = { ky: 'Бекемдөө керек', ru: 'Нужно закрепить' };
      }

      return {
        topic,
        subjectId: st.subjectId,
        total: st.total,
        correct: st.correct,
        percentage: pct,
        tierKey,
        tierLabel
      };
    });

    const weakestTopics = [...classifiedTopics]
      .filter((t) => t.percentage < 70)
      .sort((a, b) => a.percentage - b.percentage);

    const strongTopics = [...classifiedTopics]
      .filter((t) => t.percentage >= 70)
      .sort((a, b) => b.percentage - a.percentage);

    // Recommended starting topic (Requirement 1: кайсы темадан баштоо керек)
    const recommendedStartTopic = weakestTopics[0]?.topic || (isKy ? 'Математика: Проценттер жана пропорциялар' : 'Математика: Проценты и скидки');

    const subjectBreakdown = Object.entries(subjectStats).map(([subKey, stat]) => ({
      subjectId: subKey,
      name: stat.name[testLang],
      total: stat.total,
      correct: stat.correct,
      accuracy: stat.total > 0 ? Math.round((stat.correct / stat.total) * 100) : 0
    }));

    // Weekly study plan allocating more time to weakest topics (Requirement 2)
    const localReport = {
      id: 'diag-local-' + Date.now(),
      completedAt: new Date().toISOString().split('T')[0],
      targetScore,
      monthsUntilOrt,
      selectedElectives,
      estimatedPredictedScore,
      predictedScore: estimatedPredictedScore,
      totalQuestions: totalQuestionsCount,
      correctCount,
      incorrectCount,
      skippedCount,
      accuracyPercentage: accuracy,
      recommendedStartTopic,
      subjectBreakdown,
      weakestTopics,
      strongTopics,
      classifiedTopics
    };

    saveDiagnosticScore(localReport);
    localStorage.removeItem('bilim_active_diagnostic_attempt');

    try {
      confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });
    } catch (e) {}

    navigate('diagnostic-result');
  };

  const formatTimer = (totalSeconds: number) => {
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // STEP 0: ONBOARDING SETUP MODAL (Requirement 1)
  if (!testLanguageSelected) {
    return (
      <div className="min-h-screen bg-slate-50/70 py-10 px-4 sm:px-6 lg:px-8 flex items-center justify-center">
        <div className="max-w-2xl w-full bg-white rounded-3xl p-6 sm:p-10 border border-slate-200/90 shadow-xl space-y-8 animate-in fade-in">
          {/* Header */}
          <div className="text-center space-y-2">
            <div className="w-12 h-12 rounded-2xl bg-blue-50 border border-blue-200 text-blue-600 mx-auto flex items-center justify-center font-bold shadow-xs">
              <Sparkles className="w-6 h-6" />
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
              {isKy ? 'ОРТ Диагностикалык Тести' : 'Диагностический тест ОРТ'}
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 max-w-md mx-auto leading-relaxed">
              {isKy
                ? 'Деңгээлиңизди так аныктап, күчтүү жана алсыз жактарыңызды таап, жеке окуу планыңызды түзөбүз.'
                : 'Определим ваш стартовый балл, выявим сильные стороны и зоны роста для составления персонального плана.'}
            </p>
          </div>

          <div className="space-y-6">
            {/* 1. Language Selection */}
            <div className="space-y-2.5">
              <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                <Globe className="w-4 h-4 text-blue-600" />
                <span>1. {isKy ? 'ОРТ тапшыруу тили:' : 'Язык прохождения теста:'}</span>
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setTestLang('ky');
                    setLanguage('ky');
                  }}
                  className={`p-4 rounded-2xl border-2 text-left transition-all cursor-pointer ${
                    testLang === 'ky'
                      ? 'border-blue-600 bg-blue-50/70 shadow-xs'
                      : 'border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <div className="font-black text-sm text-slate-900">Кыргызча</div>
                  <div className="text-[11px] text-slate-500 mt-0.5">Кыргыз тилиндеги ОРТ тести</div>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setTestLang('ru');
                    setLanguage('ru');
                  }}
                  className={`p-4 rounded-2xl border-2 text-left transition-all cursor-pointer ${
                    testLang === 'ru'
                      ? 'border-blue-600 bg-blue-50/70 shadow-xs'
                      : 'border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <div className="font-black text-sm text-slate-900">Русский</div>
                  <div className="text-[11px] text-slate-500 mt-0.5">Тест ОРТ на русском языке</div>
                </button>
              </div>
            </div>

            {/* 2. Target Score */}
            <div className="space-y-2.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                  <Target className="w-4 h-4 text-emerald-600" />
                  <span>2. {isKy ? 'Максаттуу баллыңыз:' : 'Ваш целевой балл:'}</span>
                </label>
                <span className="text-base font-black text-emerald-700 bg-emerald-50 px-3 py-0.5 rounded-full border border-emerald-200">
                  {targetScore} {isKy ? 'балл' : 'баллов'}
                </span>
              </div>

              <div className="grid grid-cols-4 gap-2">
                {[160, 185, 205, 225].map((sc) => (
                  <button
                    key={sc}
                    type="button"
                    onClick={() => setTargetScore(sc)}
                    className={`py-2 rounded-xl text-xs font-bold transition-all border cursor-pointer ${
                      targetScore === sc
                        ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                        : 'bg-white hover:bg-slate-50 text-slate-700 border-slate-200'
                    }`}
                  >
                    {sc}+ {isKy ? 'балл' : 'баллов'}
                  </button>
                ))}
              </div>
            </div>

            {/* 3. Time until ORT */}
            <div className="space-y-2.5">
              <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                <Calendar className="w-4 h-4 text-purple-600" />
                <span>3. {isKy ? 'ОРТга чейин канча убакыт калды?' : 'Сколько времени осталось до ОРТ?'}</span>
              </label>

              <div className="grid grid-cols-4 gap-2">
                {[
                  { key: '1', label: isKy ? '1 ай' : '1 месяц' },
                  { key: '3', label: isKy ? '3 ай' : '3 месяца' },
                  { key: '6', label: isKy ? '6 ай' : '6 месяцев' },
                  { key: '9', label: isKy ? '9 ай' : '9 месяцев' }
                ].map((item) => (
                  <button
                    key={item.key}
                    type="button"
                    onClick={() => setMonthsUntilOrt(item.key)}
                    className={`py-2 rounded-xl text-xs font-bold transition-all border cursor-pointer ${
                      monthsUntilOrt === item.key
                        ? 'bg-purple-600 text-white border-purple-600 shadow-xs'
                        : 'bg-white hover:bg-slate-50 text-slate-700 border-slate-200'
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>

            {/* 4. Elective Subjects Selection */}
            <div className="space-y-2.5">
              <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                <Layers className="w-4 h-4 text-indigo-600" />
                <span>4. {isKy ? 'Кайсы предметтик тесттерди тапшырасыз?' : 'Какие предметные тесты планируете сдавать?'}</span>
              </label>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {electiveOptions.map((el) => {
                  const isSelected = selectedElectives.includes(el.id);
                  return (
                    <button
                      key={el.id}
                      type="button"
                      onClick={() => toggleElective(el.id)}
                      className={`p-2.5 rounded-xl border text-left text-xs font-semibold flex items-center justify-between transition-all cursor-pointer ${
                        isSelected
                          ? 'border-indigo-600 bg-indigo-50/80 text-indigo-950 font-bold'
                          : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-700'
                      }`}
                    >
                      <span className="truncate">{el.name}</span>
                      {isSelected && <Check className="w-3.5 h-3.5 text-indigo-600 shrink-0" />}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Diagnostic Composition Badge */}
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/90 text-xs text-slate-700 space-y-1.5">
              <div className="flex justify-between font-bold text-slate-900">
                <span>{isKy ? 'Диагностикалык тесттин курамы:' : 'Состав диагностического теста:'}</span>
                <span className="text-blue-600">20 {isKy ? 'суроо' : 'вопросов'} (20 мин)</span>
              </div>
              <p className="text-[11px] text-slate-500 leading-relaxed">
                {isKy
                  ? 'Математика (6) • Аналогия (4) • Сүйлөмдөр (3) • Окуп түшүнүү (4) • Практикалык грамматика (3).'
                  : 'Математика (6) • Аналогии (4) • Дополнение предложений (3) • Чтение текста (4) • Грамматика (3).'}
              </p>
            </div>
          </div>

          <button
            id="btn-start-diagnostic-test"
            onClick={() => initAttempt(testLang)}
            className="w-full py-4 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-black text-sm sm:text-base shadow-xl shadow-blue-600/25 transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <span>{isKy ? 'Диагностикалык тестти баштоо' : 'Начать диагностический тест'}</span>
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>
    );
  }

  if (!currentQ) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center">
        <p className="text-slate-500">Суроолор жүктөлүүдө...</p>
      </div>
    );
  }

  const selectedAnswerIndex = userAnswers[currentQ.id];
  const optionsList = testLang === 'ky' ? currentQ.options.ky : currentQ.options.ru;

  return (
    <div className="min-h-screen bg-slate-50/70 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Top Control Bar */}
        <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/90 shadow-sm flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="px-3 py-1 rounded-xl text-xs font-bold bg-blue-50 text-blue-700 border border-blue-200">
              {currentQ.subjectId === 'math'
                ? 'Математика'
                : currentQ.subjectId === 'analogies'
                ? 'Аналогиялар'
                : currentQ.subjectId === 'sentences'
                ? 'Сүйлөмдөр'
                : currentQ.subjectId === 'reading'
                ? 'Окуп түшүнүү'
                : 'Грамматика'}
            </span>
            <span className="text-xs font-semibold text-slate-700 hidden sm:inline">
              {currentQ.topic[testLang]}
            </span>
          </div>

          {/* Timer Display */}
          <div
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl border font-mono font-bold text-sm ${
              timeLeftSeconds < 180
                ? 'bg-rose-50 border-rose-300 text-rose-700 animate-pulse'
                : 'bg-slate-50 border-slate-200 text-slate-800'
            }`}
          >
            <Clock className="w-4 h-4 text-blue-600" />
            <span>{formatTimer(timeLeftSeconds)}</span>
          </div>

          {/* Helper Button & Finish Button */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setAiModalQuestion(currentQ)}
              className="px-3 py-1.5 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5 text-blue-600" />
              <span>{isKy ? 'Түшүндүрмө алуу' : 'Помощь репетитора'}</span>
            </button>

            <button
              id="btn-open-finish-modal"
              onClick={() => setIsConfirmModalOpen(true)}
              className="px-4 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs transition-colors cursor-pointer"
            >
              {isKy ? 'Аяктоо' : 'Завершить'}
            </button>
          </div>
        </div>

        {/* Progress Bar & Question Jump Matrix */}
        <div className="bg-white rounded-2xl p-4 border border-slate-200/90 shadow-2xs space-y-3">
          <div className="flex justify-between items-center text-xs font-semibold text-slate-500">
            <span>
              {isKy ? 'Суроо' : 'Вопрос'} {currentIndex + 1} / {totalQuestionsCount}
            </span>
            <span>
              {answeredCount} {isKy ? 'жооп берилди' : 'отвечено'} ({skippedCount} {isKy ? 'карыз' : 'пропущено'})
            </span>
          </div>

          <div className="flex gap-1.5 overflow-x-auto pb-1">
            {testQuestions.map((q, idx) => {
              const isAns = userAnswers[q.id] !== undefined && userAnswers[q.id] !== -1;
              const isCurrent = idx === currentIndex;

              let style = 'bg-slate-100 text-slate-500 hover:bg-slate-200';
              if (isCurrent) {
                style = 'bg-blue-600 text-white ring-2 ring-blue-600/30 font-bold';
              } else if (isAns) {
                style = 'bg-emerald-100 text-emerald-800 font-bold border border-emerald-200';
              }

              return (
                <button
                  key={q.id}
                  onClick={() => setCurrentIndex(idx)}
                  className={`min-w-[28px] h-7 rounded-lg text-xs flex items-center justify-center transition-all cursor-pointer shrink-0 ${style}`}
                >
                  {idx + 1}
                </button>
              );
            })}
          </div>
        </div>

        {/* Question Card */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/90 shadow-xs space-y-6">
          {/* Passage if reading */}
          {currentQ.passage && (
            <div className="p-4 sm:p-5 rounded-2xl bg-slate-50 border border-slate-200/70 text-xs sm:text-sm text-slate-700 leading-relaxed max-h-56 overflow-y-auto">
              <span className="font-bold uppercase tracking-wider text-[11px] text-slate-500 block mb-1">
                {isKy ? 'Текстти кунт коюп окуңуз:' : 'Прочитайте фрагмент текста:'}
              </span>
              {currentQ.passage[testLang]}
            </div>
          )}

          <p className="text-base sm:text-lg font-bold text-slate-900 leading-relaxed">
            {currentQ.text[testLang]}
          </p>

          {/* Options */}
          <div className="space-y-3">
            {optionsList.map((optText, optIdx) => {
              const isSelected = selectedAnswerIndex === optIdx;

              return (
                <button
                  key={optIdx}
                  onClick={() => handleSelectOption(optIdx)}
                  className={`w-full text-left p-4 rounded-2xl border transition-all flex items-center justify-between cursor-pointer ${
                    isSelected
                      ? 'border-blue-600 bg-blue-50/70 shadow-xs'
                      : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span
                      className={`w-7 h-7 rounded-xl flex items-center justify-center text-xs font-bold border shrink-0 ${
                        isSelected
                          ? 'bg-blue-600 text-white border-blue-600'
                          : 'bg-slate-100 text-slate-600 border-slate-200'
                      }`}
                    >
                      {optLetters[optIdx]}
                    </span>
                    <span className="text-xs sm:text-sm font-medium text-slate-900 leading-snug">
                      {optText}
                    </span>
                  </div>

                  {isSelected && <Check className="w-5 h-5 text-blue-600 shrink-0" />}
                </button>
              );
            })}
          </div>

          {/* Bottom Nav Controls */}
          <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
            <button
              onClick={handlePrev}
              disabled={currentIndex === 0}
              className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-700 text-xs font-bold hover:bg-slate-50 disabled:opacity-40 flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4" />
              <span>{isKy ? 'Артка' : 'Назад'}</span>
            </button>

            <button
              onClick={handleNext}
              className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-md shadow-blue-600/20 flex items-center gap-1.5 transition-all cursor-pointer"
            >
              <span>
                {currentIndex === totalQuestionsCount - 1
                  ? (isKy ? 'Аяктоо' : 'Завершить')
                  : (isKy ? 'Кийинки' : 'Вперед')}
              </span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Finish Confirmation Modal */}
        {isConfirmModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-in fade-in">
            <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 space-y-5 shadow-2xl border border-slate-200 text-center">
              <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 mx-auto flex items-center justify-center font-bold">
                <AlertCircle className="w-6 h-6" />
              </div>

              <div className="space-y-1">
                <h3 className="text-lg font-black text-slate-900">
                  {isKy ? 'Тестти аяктайсызбы?' : 'Завершить тестирование?'}
                </h3>
                <p className="text-xs sm:text-sm text-slate-500">
                  {isKy
                    ? `Жалпы ${totalQuestionsCount} суроодон ${answeredCount} суроого жооп бердиңиз. ${skippedCount} суроо калды.`
                    : `Вы ответили на ${answeredCount} из ${totalQuestionsCount} вопросов. Пропущено: ${skippedCount}.`}
                </p>
              </div>

              <div className="flex gap-2.5 pt-2">
                <button
                  onClick={() => setIsConfirmModalOpen(false)}
                  className="flex-1 py-3 rounded-xl border border-slate-200 text-slate-700 font-bold text-xs hover:bg-slate-50 transition-colors cursor-pointer"
                >
                  {isKy ? 'Улантуу' : 'Продолжить'}
                </button>
                <button
                  disabled={isSubmitting}
                  onClick={() => handleFinishTest(false)}
                  className="flex-1 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-bold text-xs shadow-md shadow-blue-600/20 transition-all cursor-pointer"
                >
                  {isSubmitting
                    ? (isKy ? 'Эсептелүүдө...' : 'Расчет...')
                    : (isKy ? 'Ооба, аяктоо' : 'Да, завершить')}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Global AI Explainer Modal */}
        {aiModalQuestion && (
          <AiExplainerModal
            isOpen={Boolean(aiModalQuestion)}
            onClose={() => setAiModalQuestion(null)}
            question={aiModalQuestion}
            studentAnswerIndex={userAnswers[aiModalQuestion.id]}
          />
        )}
      </div>
    </div>
  );
};
