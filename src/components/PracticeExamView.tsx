import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { Question, TestResult } from '../types';
import {
  Clock,
  Maximize2,
  Minimize2,
  Bookmark,
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  AlertTriangle,
  FileText,
  Sparkles,
  ArrowRight
} from 'lucide-react';
import confetti from 'canvas-confetti';

export const PracticeExamView: React.FC = () => {
  const { questions, language, t, saveDiagnosticScore, navigate } = useApp();

  const [isFullscreen, setIsFullscreen] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState<Record<string, number>>({});
  const [flaggedQuestions, setFlaggedQuestions] = useState<Record<string, boolean>>({});
  const [timeLeftSeconds, setTimeLeftSeconds] = useState(1800); // 30 minutes practice exam
  const [hasShown5MinWarning, setHasShown5MinWarning] = useState(false);
  const [showWarningModal, setShowWarningModal] = useState(false);
  const [isExamCompleted, setIsExamCompleted] = useState(false);
  const [examResult, setExamResult] = useState<TestResult | null>(null);

  // We can use questions for the mock exam
  const examQuestions: Question[] = questions;
  const currentQ: Question = examQuestions[currentIndex] || examQuestions[0];

  // Fullscreen handler
  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
      setIsFullscreen(true);
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen().catch(() => {});
        setIsFullscreen(false);
      }
    }
  };

  // Timer
  useEffect(() => {
    if (isExamCompleted) return;
    const timer = setInterval(() => {
      setTimeLeftSeconds((prev) => {
        if (prev === 300 && !hasShown5MinWarning) {
          setShowWarningModal(true);
          setHasShown5MinWarning(true);
        }
        if (prev <= 1) {
          clearInterval(timer);
          finishExam();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isExamCompleted, hasShown5MinWarning]);

  const formatTime = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const s = secs % 60;
    return `${mins.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const handleSelectOption = (optIndex: number) => {
    setUserAnswers((prev) => ({ ...prev, [currentQ.id]: optIndex }));
  };

  const toggleFlag = (qId: string) => {
    setFlaggedQuestions((prev) => ({ ...prev, [qId]: !prev[qId] }));
  };

  const finishExam = () => {
    let correctCount = 0;
    const weakTopicsSet = new Set<string>();
    const strongTopicsSet = new Set<string>();
    const answersRecord: TestResult['answers'] = [];

    examQuestions.forEach((q) => {
      const selected = userAnswers[q.id];
      const isCorrect = selected === q.correctOptionIndex;
      if (isCorrect) {
        correctCount += 1;
        strongTopicsSet.add(q.topic[language]);
      } else {
        weakTopicsSet.add(q.topic[language]);
      }
      answersRecord.push({
        questionId: q.id,
        selectedIndex: selected !== undefined ? selected : -1,
        isCorrect: Boolean(isCorrect)
      });
    });

    const ratio = correctCount / examQuestions.length;
    const calculatedScore = Math.round(110 + ratio * 105);

    const result: TestResult = {
      id: 'mock-' + Date.now(),
      testType: 'practice',
      date: new Date().toISOString().split('T')[0],
      score: calculatedScore,
      predictedScore: calculatedScore,
      totalQuestions: examQuestions.length,
      correctCount,
      timeSpentSeconds: 1800 - timeLeftSeconds,
      weakTopics: Array.from(weakTopicsSet),
      strongTopics: Array.from(strongTopicsSet),
      answers: answersRecord
    };

    saveDiagnosticScore(result);
    setExamResult(result);
    setIsExamCompleted(true);

    try {
      confetti({ particleCount: 70, spread: 60 });
    } catch (e) {}
  };

  // If completed, show detailed report
  if (isExamCompleted && examResult) {
    return (
      <div className="min-h-screen bg-slate-50 py-10 px-4 sm:px-6 max-w-4xl mx-auto space-y-6">
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/90 shadow-sm text-center space-y-4">
          <div className="w-14 h-14 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto border border-emerald-200">
            <CheckCircle2 className="w-8 h-8" />
          </div>

          <h2 className="text-2xl font-bold text-slate-900">
            {language === 'ky' ? 'Сынак ОРТ аяктады!' : 'Пробный ОРТ успешно завершен!'}
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 max-w-lg mx-auto">
            {language === 'ky'
              ? 'Сиз убакыт чектөөсүндөгү толук форматтагы сынактан өттүңүз. Төмөндө деталдуу аналитика келтирилген.'
              : 'Вы прошли симуляцию экзамена в реальном формате с таймером. Ниже представлен подробный отчёт.'}
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 max-w-2xl mx-auto">
            <div className="p-4 rounded-2xl bg-blue-50 border border-blue-100">
              <span className="text-xs text-blue-700 font-semibold">{t.cabinetCurrentScore}</span>
              <p className="text-3xl font-black text-blue-900 mt-1">{examResult.score} балл</p>
            </div>
            <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-100">
              <span className="text-xs text-emerald-700 font-semibold">{t.resCorrectCount}</span>
              <p className="text-3xl font-black text-emerald-900 mt-1">
                {examResult.correctCount} / {examResult.totalQuestions}
              </p>
            </div>
            <div className="p-4 rounded-2xl bg-purple-50 border border-purple-100">
              <span className="text-xs text-purple-700 font-semibold">
                {language === 'ky' ? 'Сарпталган убакыт' : 'Затрачено времени'}
              </span>
              <p className="text-3xl font-black text-purple-900 mt-1">
                {Math.round(examResult.timeSpentSeconds / 60)} мүнөт
              </p>
            </div>
          </div>

          <div className="pt-6 flex flex-wrap items-center justify-center gap-3">
            <button
              onClick={() => navigate('student-cabinet')}
              className="px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition-colors"
            >
              {t.btnGoToCabinet}
            </button>
            <button
              onClick={() => {
                setIsExamCompleted(false);
                setTimeLeftSeconds(1800);
                setUserAnswers({});
                setFlaggedQuestions({});
                setCurrentIndex(0);
              }}
              className="px-6 py-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-colors"
            >
              {t.btnTryAgain}
            </button>
          </div>
        </div>
      </div>
    );
  }

  const optionLetters = ['А', 'Б', 'В', 'Г'];
  const currentSelectedOpt = userAnswers[currentQ.id];
  const isFlagged = flaggedQuestions[currentQ.id];

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 py-6 px-4 sm:px-6 flex flex-col justify-between">
      <div className="max-w-5xl mx-auto w-full space-y-6">
        {/* Exam Header */}
        <div className="bg-slate-800/90 rounded-2xl p-4 border border-slate-700 flex items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping"></span>
            <div>
              <h1 className="text-sm sm:text-base font-bold text-white">
                {t.mockTitle}
              </h1>
              <p className="text-[11px] text-emerald-400">{t.mockAutoSaved}</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Timer */}
            <div className={`px-3 py-1.5 rounded-xl font-mono text-xs font-bold flex items-center gap-1.5 border ${
              timeLeftSeconds < 300
                ? 'bg-rose-900/50 text-rose-300 border-rose-600 animate-pulse'
                : 'bg-slate-900 text-slate-200 border-slate-700'
            }`}>
              <Clock className="w-4 h-4 text-slate-400" />
              <span>{formatTime(timeLeftSeconds)}</span>
            </div>

            {/* Fullscreen toggle */}
            <button
              onClick={toggleFullscreen}
              className="p-2 rounded-xl bg-slate-700 hover:bg-slate-600 text-slate-200 transition-colors cursor-pointer"
              title={isFullscreen ? t.mockExitFullscreen : t.mockFullscreen}
            >
              {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
            </button>

            {/* Finish button */}
            <button
              id="btn-finish-mock-exam"
              onClick={finishExam}
              className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs transition-colors cursor-pointer"
            >
              {t.btnFinish}
            </button>
          </div>
        </div>

        {/* Question Matrix Navigation Palette */}
        <div className="bg-slate-800/60 rounded-2xl p-3 border border-slate-700 flex flex-wrap items-center gap-2">
          <span className="text-xs text-slate-400 mr-2 font-medium">
            {language === 'ky' ? 'Суроолор картасы:' : 'Навигация:'}
          </span>
          {examQuestions.map((q, idx) => {
            const answered = userAnswers[q.id] !== undefined;
            const flagged = flaggedQuestions[q.id];
            const isCur = idx === currentIndex;

            let badgeClass = 'bg-slate-700 text-slate-300 border-slate-600';
            if (isCur) badgeClass = 'ring-2 ring-blue-500 font-bold bg-blue-600 text-white';
            else if (flagged) badgeClass = 'bg-amber-600/60 text-amber-200 border-amber-500';
            else if (answered) badgeClass = 'bg-emerald-600/60 text-emerald-200 border-emerald-500';

            return (
              <button
                key={q.id}
                onClick={() => setCurrentIndex(idx)}
                className={`w-7 h-7 rounded-lg text-xs font-semibold border flex items-center justify-center transition-all cursor-pointer ${badgeClass}`}
              >
                {idx + 1}
              </button>
            );
          })}
        </div>

        {/* Main Question Panel */}
        <div className="bg-slate-800 rounded-3xl p-6 sm:p-8 border border-slate-700 shadow-xl space-y-6">
          <div className="flex items-center justify-between border-b border-slate-700 pb-3">
            <span className="text-xs font-bold text-blue-400 bg-blue-950/60 px-3 py-1 rounded-full border border-blue-800">
              {currentQ.topic[language]}
            </span>

            {/* Flag for review button */}
            <button
              onClick={() => toggleFlag(currentQ.id)}
              className={`px-3 py-1.5 rounded-xl border text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer ${
                isFlagged
                  ? 'bg-amber-500/20 text-amber-300 border-amber-500'
                  : 'bg-slate-700/60 hover:bg-slate-700 text-slate-300 border-slate-600'
              }`}
            >
              <Bookmark className={`w-3.5 h-3.5 ${isFlagged ? 'fill-amber-400 text-amber-400' : ''}`} />
              <span>{isFlagged ? t.mockQuestionFlagged : t.mockFlagQuestion}</span>
            </button>
          </div>

          {currentQ.passage && (
            <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-700 text-xs sm:text-sm text-slate-300 leading-relaxed max-h-48 overflow-y-auto">
              <p className="font-bold text-slate-200 mb-1">{language === 'ky' ? 'Текст:' : 'Текст:'}</p>
              {currentQ.passage[language]}
            </div>
          )}

          <div className="text-base sm:text-lg font-bold text-white leading-relaxed">
            {currentQ.text[language]}
          </div>

          {/* 4 Options */}
          <div className="space-y-3 pt-2">
            {currentQ.options[language].map((optText, optIdx) => {
              const isSelected = currentSelectedOpt === optIdx;

              return (
                <button
                  key={optIdx}
                  onClick={() => handleSelectOption(optIdx)}
                  className={`w-full text-left p-4 rounded-2xl border transition-all flex items-center justify-between cursor-pointer ${
                    isSelected
                      ? 'border-blue-500 bg-blue-900/40 text-white font-semibold'
                      : 'border-slate-700 bg-slate-900/40 hover:bg-slate-700/50 text-slate-200'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span
                      className={`w-7 h-7 rounded-xl flex items-center justify-center text-xs font-bold border ${
                        isSelected
                          ? 'bg-blue-600 text-white border-blue-500'
                          : 'bg-slate-700 text-slate-300 border-slate-600'
                      }`}
                    >
                      {optionLetters[optIdx]}
                    </span>
                    <span className="text-sm">{optText}</span>
                  </div>

                  <div
                    className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                      isSelected ? 'border-blue-400 bg-blue-500' : 'border-slate-600'
                    }`}
                  >
                    {isSelected && <div className="w-1.5 h-1.5 rounded-full bg-white"></div>}
                  </div>
                </button>
              );
            })}
          </div>

          {/* Nav buttons */}
          <div className="pt-4 border-t border-slate-700 flex items-center justify-between">
            <button
              onClick={() => currentIndex > 0 && setCurrentIndex(currentIndex - 1)}
              disabled={currentIndex === 0}
              className="px-4 py-2 rounded-xl bg-slate-700 disabled:opacity-40 text-xs font-semibold text-slate-300 hover:bg-slate-600 flex items-center gap-1 cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4" />
              <span>{t.btnBack}</span>
            </button>

            <button
              onClick={() =>
                currentIndex < examQuestions.length - 1
                  ? setCurrentIndex(currentIndex + 1)
                  : finishExam()
              }
              className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold flex items-center gap-1 cursor-pointer"
            >
              <span>{currentIndex === examQuestions.length - 1 ? t.btnFinish : t.btnNext}</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* 5-Minute Warning Modal */}
      {showWarningModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-xs">
          <div className="bg-slate-800 rounded-3xl p-6 max-w-sm w-full border border-amber-500 text-center space-y-4">
            <AlertTriangle className="w-10 h-10 text-amber-400 mx-auto" />
            <h3 className="text-base font-bold text-white">{t.mockTimeWarning}</h3>
            <button
              onClick={() => setShowWarningModal(false)}
              className="w-full py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs"
            >
              {t.btnClose}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
