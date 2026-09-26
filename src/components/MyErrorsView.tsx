import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { Question, SubjectId } from '../types';
import { AiExplainerModal } from './AiExplainerModal';
import {
  RotateCcw,
  CheckCircle2,
  XCircle,
  HelpCircle,
  Sparkles,
  BookOpen,
  Filter,
  Search,
  Check,
  Award,
  ArrowRight,
  Flame,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import confetti from 'canvas-confetti';

export interface ErrorRecord {
  id: string;
  questionId: string;
  subjectId: SubjectId;
  topic: { ky: string; ru: string };
  questionText: { ky: string; ru: string };
  options: { ky: string[]; ru: string[] };
  correctOptionIndex: number;
  studentAnswerIndex: number;
  whyWrong: { ky: string; ru: string };
  stepByStepSolution: { ky: string; ru: string };
  similarQuestion: {
    text: { ky: string; ru: string };
    options: { ky: string[]; ru: string[] };
    correctIndex: number;
    explanation: { ky: string; ru: string };
  };
  isMastered: boolean;
  dateAdded: string;
}

export const initialDemoErrors: ErrorRecord[] = [
  {
    id: 'err-1',
    questionId: 'm-1',
    subjectId: 'math',
    topic: { ky: 'Проценттер жана арзандатуулар', ru: 'Проценты и скидки' },
    questionText: {
      ky: 'Дүкөндө китептин баасы 500 сомдон 400 сомго чейин арзандатылды. Китептин баасы канча пайызга арзандаган?',
      ru: 'В магазине цена книги снизилась с 500 сомов до 400 сомов. На сколько процентов снизилась цена книги?'
    },
    options: {
      ky: ['15%', '20%', '25%', '10%'],
      ru: ['15%', '20%', '25%', '10%']
    },
    correctOptionIndex: 1,
    studentAnswerIndex: 2, // 25% (typical trap: dividing by 400 instead of 500)
    whyWrong: {
      ky: 'Сиз 100 сомдук арзандатууну соңку баага (400 сомго) бөлүп алгансыз (100 / 400 = 25%). Бул ОРТдагы эң кеңири таралган тузак! Арзандатуу пайызы ар дайым БАШТАПКЫ баага карата эсептелиши керек.',
      ru: 'Вы разделили скидку в 100 сомов на конечную цену 400 сомов (100 / 400 = 25%). Это классическая ловушка ОРТ! Процент скидки ВСЕГДА вычисляется от первоначальной цены.'
    },
    stepByStepSolution: {
      ky: '1. Арзандатылган сумманы табабыз: 500 - 400 = 100 сом.\n2. Бул сумманы баштапкы баага (500 сомго) бөлөбүз: 100 / 500 = 0.20.\n3. 100%га көбөйтөбүз: 0.20 × 100% = 20%.\nТуура жооп: 20%.',
      ru: '1. Находим сумму скидки: 500 - 400 = 100 сомов.\n2. Делим эту разницу на исходную цену: 100 / 500 = 0.20.\n3. Переводим в проценты: 0.20 × 100% = 20%.\nПравильный ответ: 20%.'
    },
    similarQuestion: {
      text: {
        ky: 'Окшош суроо: Бут кийимдин баасы 2000 сомдон 1500 сомго түштү. Арзандатуу канча пайыз болду?',
        ru: 'Похожая задача: Обувь стоила 2000 сомов, цену снизили до 1500 сомов. Каков процент скидки?'
      },
      options: {
        ky: ['20%', '25%', '30%', '15%'],
        ru: ['20%', '25%', '30%', '15%']
      },
      correctIndex: 1, // 25%
      explanation: {
        ky: '(2000 - 1500) / 2000 = 500 / 2000 = 25%.',
        ru: '(2000 - 1500) / 2000 = 500 / 2000 = 25%.'
      }
    },
    isMastered: false,
    dateAdded: '2026-09-21'
  },
  {
    id: 'err-2',
    questionId: 'a-2',
    subjectId: 'analogies',
    topic: { ky: 'Бөлүк жана бүтүн', ru: 'Часть и целое' },
    questionText: {
      ky: 'Жалбырак : Бак катышына дал келген жуп кайсы?',
      ru: 'Какая пара соответствует отношению: Лист : Дерево?'
    },
    options: {
      ky: ['Суу : Деңиз', 'Кирпич : Үй', 'Алма : Табак', 'Булут : Жамгыр'],
      ru: ['Вода : Море', 'Кирпич : Дом', 'Яблоко : Тарелка', 'Облако : Дождь']
    },
    correctOptionIndex: 1,
    studentAnswerIndex: 0, // Суу : Деңиз
    whyWrong: {
      ky: '«Суу : Деңиз» жубунда суу — деңиздин заты (материалы), ал эми жалбырак — бактын өз алдынча түзүмдүк бөлүгү. Кирпич үй үчүн так эле ошондой ажырагыс түзүүчү бирдик.',
      ru: '«Вода : Море» выражает отношение «вещество : резервуар». А лист является дискретной структурной частью дерева, так же как кирпич — часть конструкции дома.'
    },
    stepByStepSolution: {
      ky: '1. Баштапкы жуптун логикалык модели: Бөлүк : Бүтүн (бир элементи бүтүндү түзөт).\n2. Текшерүү: Кирпичтерден үй куралат, жалбырактардан бак куралат.\nТуура жооп: Кирпич : Үй.',
      ru: '1. Логическая модель: «Часть : Целое».\n2. Кирпичи формируют дом, так же как листья формируют крону дерева.\nПравильный ответ: Кирпич : Дом.'
    },
    similarQuestion: {
      text: {
        ky: 'Окшош суроо: Барак : Китеп катышына дал келген жупту табыңыз:',
        ru: 'Похожая задача: Найдите аналогию к отношению: Страница : Книга'
      },
      options: {
        ky: ['Клавиша : Клавиатура', 'Калем : Дептер', 'Мугалим : Мектеп', 'Жарык : Бөлмө'],
        ru: ['Клавиша : Клавиатура', 'Ручка : Тетрадь', 'Учитель : Школа', 'Свет : Комната']
      },
      correctIndex: 0,
      explanation: {
        ky: 'Барак китептин ажырагыс бөлүгү болгон сыяктуу, клавиша клавиатуранын бөлүгү.',
        ru: 'Клавиша — структурный элемент клавиатуры, как страница — элемент книги.'
      }
    },
    isMastered: false,
    dateAdded: '2026-09-22'
  },
  {
    id: 'err-3',
    questionId: 'q-sentences-err-3',
    subjectId: 'sentences',
    topic: { ky: 'Себеп-натыйжалуу сүйлөмдөр', ru: 'Причинно-следственные конструкции' },
    questionText: {
      ky: 'Эркин ой жүгүртүү менен сынчыл көз карашты ... коомдо жаңы илимий ачылыштарды жана технологиялык секириктерди ... мүмкүн эмес.',
      ru: 'Без ... критического мышления и свободы мысли невозможно ... научные прорывы и технологические скачки в обществе.'
    },
    options: {
      ky: [
        'өнүктүрбөстөн / жасоо',
        'чектебестен / токтотуу',
        'жактабастан / күтүү',
        'сындабастан / алдын алуу'
      ],
      ru: [
        'развития / совершить',
        'ограничения / остановить',
        'поддержки / ожидать',
        'критики / предотвратить'
      ]
    },
    correctOptionIndex: 0,
    studentAnswerIndex: 2,
    whyWrong: {
      ky: '«Жактабастан / күтүү» деген сөздөр грамматикалык жактан бүтпөгөн сезим калтырып, сүйлөмдүн маанилик логикасын бузат.',
      ru: 'Пара «поддержки / ожидать» грамматически не согласуется с конструкцией невозможности «мүмкүн эмес».'
    },
    stepByStepSolution: {
      ky: '1. Сүйлөмдүн соңунда «мүмкүн эмес» деген сөз турат.\n2. Демек, биринчи боштук шарт (өнүктүрбөстөн), экинчиси натыйжа (жасоо).\nТуура вариант: өнүктүрбөстөн / жасоо.',
      ru: 'Конструкция требует: «Без развития... совершить невозможно».'
    },
    similarQuestion: {
      text: {
        ky: 'Окшош суроо: Мээнетти ... максатка жетүүнү ... мүмкүн эмес.',
        ru: 'Похожая задача: Нельзя ... успеха, не ... достаточных усилий.'
      },
      options: {
        ky: ['аябастан / күтүү',
            'тартпастан / ойлоо',
            'көрбөстөн / каалоо',
            'жумшабастан / элестетүү'],
        ru: ['приложив / ожидать',
            'прилагая / надеяться',
            'рассчитывать / проявив',
            'достичь / приложив']
      },
      correctIndex: 3,
      explanation: {
        ky: 'Мээнетти жумшабастан максатка жетүүнү элестетүү мүмкүн эмес.',
        ru: 'Нельзя достичь успеха, не приложив достаточных усилий.'
      }
    },
    isMastered: true,
    dateAdded: '2026-09-19'
  }
];

export const MyErrorsView: React.FC = () => {
  const { language, t, navigate, user, questions } = useApp();

  // Saved errors in localStorage
  const [errorsList, setErrorsList] = useState<ErrorRecord[]>(() => {
    try {
      const saved = localStorage.getItem('bilim_student_error_records');
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.warn('Failed to parse saved errors');
    }
    return initialDemoErrors;
  });

  // Filters
  const [statusFilter, setStatusFilter] = useState<'all' | 'unmastered' | 'mastered'>('unmastered');
  const [selectedSubject, setSelectedSubject] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Re-solving state
  const [resolvingErrorId, setResolvingErrorId] = useState<string | null>(null);
  const [selectedAnswerIdx, setSelectedAnswerIdx] = useState<number | null>(null);
  const [resolveFeedback, setResolveFeedback] = useState<{ isCorrect: boolean; message: string } | null>(null);

  // Similar question interactive test state
  const [solvingSimilarId, setSolvingSimilarId] = useState<string | null>(null);
  const [similarSelectedIdx, setSimilarSelectedIdx] = useState<number | null>(null);
  const [similarFeedback, setSimilarFeedback] = useState<boolean | null>(null);

  // AI Explainer modal state
  const [aiModalQuestion, setAiModalQuestion] = useState<Question | null>(null);
  const [aiStudentIndex, setAiStudentIndex] = useState<number | null>(null);

  const isKy = language === 'ky';
  const optLetters = ['А', 'Б', 'В', 'Г'];

  // Save to localStorage whenever errorsList updates
  useEffect(() => {
    localStorage.setItem('bilim_student_error_records', JSON.stringify(errorsList));
  }, [errorsList]);

  // Filtered errors
  const filteredErrors = errorsList.filter((err) => {
    if (statusFilter === 'unmastered' && err.isMastered) return false;
    if (statusFilter === 'mastered' && !err.isMastered) return false;
    if (selectedSubject !== 'all' && err.subjectId !== selectedSubject) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchTopic = err.topic[language]?.toLowerCase().includes(q);
      const matchText = err.questionText[language]?.toLowerCase().includes(q);
      if (!matchTopic && !matchText) return false;
    }
    return true;
  });

  const unmasteredCount = errorsList.filter((e) => !e.isMastered).length;
  const masteredCount = errorsList.filter((e) => e.isMastered).length;

  // Handle checking re-solve answer
  const handleVerifyReSolve = (err: ErrorRecord) => {
    if (selectedAnswerIdx === null) return;

    if (selectedAnswerIdx === err.correctOptionIndex) {
      // Correct! Mark as Mastered (Өздөштүрүлдү)
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.7 }
      });

      setResolveFeedback({
        isCorrect: true,
        message: isKy
          ? 'Азаматсыз! Суроо толугу менен туура чыгарылды жана «Өздөштүрүлдү» деп белгиленди.'
          : 'Отлично! Задание решено абсолютно верно и отмечено как «Усвоено».'
      });

      // Update state
      setErrorsList((prev) =>
        prev.map((item) => (item.id === err.id ? { ...item, isMastered: true } : item))
      );
    } else {
      setResolveFeedback({
        isCorrect: false,
        message: isKy
          ? 'Тилекке каршы, дагы ката кетти. Төмөндөгү «Түшүндүрмө алуу» же «Кадам-кадам чыгарылышы» блогун карап көрүңүз!'
          : 'Ответ пока неверный. Посмотрите разбор решения ниже или нажмите «Спросить у онлайн-репетитора»!'
      });
    }
  };

  const handleVerifySimilar = (err: ErrorRecord) => {
    if (similarSelectedIdx === null) return;
    const isCorrect = similarSelectedIdx === err.similarQuestion.correctIndex;
    setSimilarFeedback(isCorrect);
    if (isCorrect) {
      confetti({
        particleCount: 40,
        spread: 50,
        origin: { y: 0.7 }
      });
    }
  };

  const handleOpenAiExplainer = (err: ErrorRecord) => {
    // Create Question object for modal
    const qObj: Question = {
      id: err.questionId,
      subjectId: err.subjectId,
      topic: err.topic,
      difficulty: 'medium',
      text: err.questionText,
      options: err.options,
      correctOptionIndex: err.correctOptionIndex,
      explanation: err.stepByStepSolution
    };
    setAiModalQuestion(qObj);
    setAiStudentIndex(err.studentAnswerIndex);
  };

  return (
    <div className="min-h-screen bg-slate-50/70 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto space-y-6 sm:space-y-8">
        {/* Top Header Banner */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/90 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-2xl bg-rose-50 border border-rose-200 text-rose-600 flex items-center justify-center font-bold shadow-xs">
                <RotateCcw className="w-5 h-5" />
              </div>
              <h1 className="text-xl sm:text-2xl font-black text-slate-900">
                {isKy ? 'Менин каталарым' : 'Мои ошибки'}
              </h1>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-rose-100 text-rose-800 border border-rose-200">
                {unmasteredCount} {isKy ? 'ката иштеле элек' : 'не отработано'}
              </span>
            </div>
            <p className="text-xs sm:text-sm text-slate-500 max-w-2xl leading-relaxed">
              {isKy
                ? 'Тесттерде кетирилген ар бир ката автоматтык түрдө ушул жерге сакталат. Каталарды кайра чечип, эрежени өздөштүргөндө гана балл туруктуу өсөт!'
                : 'Каждая допущенная ошибка автоматически фиксируется здесь с объяснением ловушек. Перерешивайте задания, чтобы надежно повысить результат на ОРТ!'}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 shrink-0">
            {/* Mastered Counter Pill */}
            <div className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900 font-bold text-xs sm:text-sm">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>
                {masteredCount} {isKy ? 'өздөштүрүлдү' : 'усвоено'}
              </span>
            </div>

            <button
              onClick={() => navigate('student-cabinet')}
              className="px-4 py-2.5 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs sm:text-sm transition-colors cursor-pointer"
            >
              {isKy ? 'Кабинетке кайтуу' : 'В кабинет'}
            </button>
          </div>
        </div>

        {/* Filters & Search Toolbar */}
        <div className="bg-white rounded-2xl p-4 border border-slate-200/90 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-4">
          {/* Status Tabs */}
          <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-xl overflow-x-auto">
            <button
              onClick={() => setStatusFilter('unmastered')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                statusFilter === 'unmastered'
                  ? 'bg-white text-rose-700 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {isKy ? 'Кайталоо керек' : 'Требуют работы'} ({unmasteredCount})
            </button>
            <button
              onClick={() => setStatusFilter('mastered')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                statusFilter === 'mastered'
                  ? 'bg-white text-emerald-700 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {isKy ? 'Өздөштүрүлдү' : 'Усвоенные'} ({masteredCount})
            </button>
            <button
              onClick={() => setStatusFilter('all')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                statusFilter === 'all'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {isKy ? 'Бардыгы' : 'Все'} ({errorsList.length})
            </button>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            {/* Subject Selector */}
            <select
              value={selectedSubject}
              onChange={(e) => setSelectedSubject(e.target.value)}
              className="px-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 bg-slate-50/50 focus:outline-none focus:border-blue-600 cursor-pointer"
            >
              <option value="all">{isKy ? 'Бардык предметтер' : 'Все предметы'}</option>
              <option value="math">{isKy ? 'Математика' : 'Математика'}</option>
              <option value="analogies">{isKy ? 'Аналогиялар' : 'Аналогии'}</option>
              <option value="sentences">{isKy ? 'Сүйлөмдөрдү толуктоо' : 'Сүйлөмдөр'}</option>
              <option value="reading">{isKy ? 'Окуп түшүнүү' : 'Чтение текста'}</option>
              <option value="grammar">{isKy ? 'Практикалык грамматика' : 'Грамматика'}</option>
            </select>

            {/* Search Input */}
            <div className="relative flex-1 sm:w-60">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={isKy ? 'Тема же сөз боюнча издөө...' : 'Поиск по теме или слову...'}
                className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:border-blue-600 bg-slate-50/50"
              />
            </div>
          </div>
        </div>

        {/* Errors List */}
        {filteredErrors.length === 0 ? (
          <div className="bg-white rounded-3xl p-10 text-center border border-slate-200/90 shadow-xs space-y-4">
            <div className="w-16 h-16 rounded-3xl bg-emerald-50 text-emerald-600 mx-auto flex items-center justify-center">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <div className="space-y-1">
              <h3 className="text-base sm:text-lg font-bold text-slate-900">
                {statusFilter === 'unmastered'
                  ? (isKy ? 'Оңдоло элек каталар калган жок!' : 'Все ошибки в этой категории отработаны!')
                  : (isKy ? 'Ката табылган жок' : 'Ошибок не найдено')}
              </h3>
              <p className="text-xs sm:text-sm text-slate-500 max-w-md mx-auto">
                {isKy
                  ? 'Сиз бардык каталарды ийгиликтүү чечтиңиз же издөө талабына дал келген суроо жок.'
                  : 'Вы успешно разобрали материал или по данному запросу нет записей.'}
              </p>
            </div>
            <button
              onClick={() => navigate('training-topic')}
              className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs sm:text-sm shadow-md shadow-blue-600/20 cursor-pointer"
            >
              {isKy ? 'Жаңы сабактарды өтүү' : 'Перейти к новым урокам'}
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            {filteredErrors.map((err) => {
              const isResolving = resolvingErrorId === err.id;
              const isSolvingSimilar = solvingSimilarId === err.id;

              return (
                <div
                  key={err.id}
                  className={`bg-white rounded-3xl border transition-all duration-200 overflow-hidden shadow-xs ${
                    err.isMastered
                      ? 'border-emerald-200/80'
                      : 'border-rose-200/90 hover:border-rose-300'
                  }`}
                >
                  {/* Card Header */}
                  <div className="p-5 sm:p-6 border-b border-slate-100 flex flex-wrap items-center justify-between gap-3 bg-slate-50/50">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="px-2.5 py-1 rounded-lg text-xs font-bold bg-white border border-slate-200 text-slate-800">
                        {err.subjectId === 'math'
                          ? 'Математика'
                          : err.subjectId === 'analogies'
                          ? 'Аналогиялар'
                          : err.subjectId === 'sentences'
                          ? 'Сүйлөмдөр'
                          : err.subjectId === 'reading'
                          ? 'Окуп түшүнүү'
                          : 'Грамматика'}
                      </span>
                      <span className="text-xs font-bold text-slate-700">
                        {err.topic[language]}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      {err.isMastered ? (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                          <span>{isKy ? 'Өздөштүрүлдү' : 'Усвоено'}</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-rose-100 text-rose-800 border border-rose-200">
                          <RotateCcw className="w-3.5 h-3.5 text-rose-600" />
                          <span>{isKy ? 'Кайра чечүү керек' : 'Нужно перерешать'}</span>
                        </span>
                      )}

                      {/* Online tutor explainer button on each card */}
                      <button
                        onClick={() => handleOpenAiExplainer(err)}
                        className="px-3 py-1.5 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                        title={isKy ? 'Бул суроону онлайн-репетитор менен талдоо' : 'Разобрать с онлайн-репетитором'}
                      >
                        <Sparkles className="w-3.5 h-3.5 text-blue-600" />
                        <span>{isKy ? 'Түшүндүрмө алуу' : 'Помощь репетитора'}</span>
                      </button>
                    </div>
                  </div>

                  {/* Question & Comparison Content */}
                  <div className="p-5 sm:p-6 space-y-5">
                    {/* The Question Text */}
                    <div className="space-y-1">
                      <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                        {isKy ? 'Суроо:' : 'Задание:'}
                      </div>
                      <p className="text-sm sm:text-base font-bold text-slate-900 leading-relaxed">
                        {err.questionText[language]}
                      </p>
                    </div>

                    {/* Side-by-Side: Student Answer vs Correct Answer */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {/* Student's Wrong Answer */}
                      <div className="p-4 rounded-2xl bg-rose-50/70 border border-rose-200 space-y-1">
                        <div className="flex items-center gap-1.5 text-rose-800 text-xs font-bold">
                          <XCircle className="w-4 h-4 text-rose-600" />
                          <span>{isKy ? 'Сиз белгилеген жооп:' : 'Ваш ответ (с ошибкой):'}</span>
                        </div>
                        <div className="font-bold text-rose-950 text-sm">
                          {optLetters[err.studentAnswerIndex]}) {err.options[language][err.studentAnswerIndex]}
                        </div>
                      </div>

                      {/* Correct Answer */}
                      <div className="p-4 rounded-2xl bg-emerald-50/70 border border-emerald-200 space-y-1">
                        <div className="flex items-center gap-1.5 text-emerald-800 text-xs font-bold">
                          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                          <span>{isKy ? 'Чыныгы туура жооп:' : 'Правильный ответ:'}</span>
                        </div>
                        <div className="font-bold text-emerald-950 text-sm">
                          {optLetters[err.correctOptionIndex]}) {err.options[language][err.correctOptionIndex]}
                        </div>
                      </div>
                    </div>

                    {/* Why was it wrong? */}
                    <div className="p-4 rounded-2xl bg-amber-50/60 border border-amber-200 space-y-1">
                      <div className="flex items-center gap-1.5 text-amber-900 text-xs font-bold">
                        <HelpCircle className="w-4 h-4 text-amber-700" />
                        <span>{isKy ? 'Эмне үчүн туура эмес?' : 'Почему этот ответ неверный?'}</span>
                      </div>
                      <p className="text-xs sm:text-sm text-amber-950 leading-relaxed">
                        {err.whyWrong[language]}
                      </p>
                    </div>

                    {/* Step-by-Step Correct Solution */}
                    <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-1.5">
                      <div className="flex items-center gap-1.5 text-slate-800 text-xs font-bold">
                        <BookOpen className="w-4 h-4 text-blue-600" />
                        <span>{isKy ? 'Туура чыгаруу жолу:' : 'Пошаговое верное решение:'}</span>
                      </div>
                      <p className="text-xs sm:text-sm text-slate-700 whitespace-pre-line leading-relaxed">
                        {err.stepByStepSolution[language]}
                      </p>
                    </div>

                    {/* Interactive Re-solve Area (Катаны кайра иштөө) */}
                    <div className="pt-2 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3">
                      <button
                        onClick={() => {
                          setResolvingErrorId(isResolving ? null : err.id);
                          setSelectedAnswerIdx(null);
                          setResolveFeedback(null);
                        }}
                        className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-colors cursor-pointer ${
                          isResolving
                            ? 'bg-slate-200 text-slate-800'
                            : 'bg-rose-600 hover:bg-rose-700 text-white shadow-xs shadow-rose-600/20'
                        }`}
                      >
                        <RotateCcw className="w-3.5 h-3.5" />
                        <span>
                          {isResolving
                            ? (isKy ? 'Кайра чечүүнү жабуу' : 'Скрыть блок')
                            : (isKy ? 'Катаны кайра иштөө' : 'Перерешать задание')}
                        </span>
                      </button>

                      {/* Similar Question Toggle Button */}
                      <button
                        onClick={() => {
                          setSolvingSimilarId(isSolvingSimilar ? null : err.id);
                          setSimilarSelectedIdx(null);
                          setSimilarFeedback(null);
                        }}
                        className="px-4 py-2 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-800 border border-blue-200 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                      >
                        <Award className="w-3.5 h-3.5 text-blue-600" />
                        <span>
                          {isSolvingSimilar
                            ? (isKy ? 'Окшош суроону жабуу' : 'Скрыть аналог')
                            : (isKy ? 'Окшош жаңы суроону чыгаруу' : 'Решить аналогичный вопрос')}
                        </span>
                      </button>
                    </div>

                    {/* Expanded Re-solve Box */}
                    {isResolving && (
                      <div className="p-5 rounded-2xl bg-rose-50/40 border border-rose-200 space-y-4 animate-in fade-in">
                        <div className="text-xs font-bold text-slate-900 flex items-center justify-between">
                          <span>{isKy ? 'Туура вариантты кайра тандаңыз:' : 'Выберите верный вариант заново:'}</span>
                          <span className="text-[11px] text-slate-500">
                            {isKy ? 'Туура чыгарганда ката өздөштүрүлдү деп белгиленет' : 'При правильном ответе ошибка будет закрыта'}
                          </span>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                          {err.options[language].map((optText, oIdx) => (
                            <button
                              key={oIdx}
                              onClick={() => setSelectedAnswerIdx(oIdx)}
                              className={`p-3 rounded-xl border text-left text-xs font-semibold flex items-center justify-between transition-all cursor-pointer ${
                                selectedAnswerIdx === oIdx
                                  ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                                  : 'bg-white hover:bg-slate-50 text-slate-800 border-slate-200'
                              }`}
                            >
                              <div className="flex items-center gap-2">
                                <span className={`w-5 h-5 rounded-md flex items-center justify-center text-[10px] font-bold ${
                                  selectedAnswerIdx === oIdx ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-600'
                                }`}>
                                  {optLetters[oIdx]}
                                </span>
                                <span>{optText}</span>
                              </div>
                              {selectedAnswerIdx === oIdx && <Check className="w-4 h-4 text-white" />}
                            </button>
                          ))}
                        </div>

                        {resolveFeedback && (
                          <div
                            className={`p-3.5 rounded-xl text-xs font-bold flex items-center gap-2 ${
                              resolveFeedback.isCorrect
                                ? 'bg-emerald-100 text-emerald-950 border border-emerald-300'
                                : 'bg-rose-100 text-rose-950 border border-rose-300'
                            }`}
                          >
                            {resolveFeedback.isCorrect ? (
                              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                            ) : (
                              <XCircle className="w-4 h-4 text-rose-600 shrink-0" />
                            )}
                            <span>{resolveFeedback.message}</span>
                          </div>
                        )}

                        <div className="flex justify-end gap-2 pt-1">
                          <button
                            disabled={selectedAnswerIdx === null}
                            onClick={() => handleVerifyReSolve(err)}
                            className="px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 disabled:opacity-40 text-white font-bold text-xs transition-colors cursor-pointer"
                          >
                            {isKy ? 'Жоопту текшерүү' : 'Проверить ответ'}
                          </button>
                        </div>
                      </div>
                    )}

                    {/* Expanded Similar Question Box (Requirement 4: окшош жаңы суроо) */}
                    {isSolvingSimilar && (
                      <div className="p-5 rounded-2xl bg-blue-50/40 border border-blue-200 space-y-4 animate-in fade-in">
                        <div className="space-y-1">
                          <div className="text-[11px] font-bold uppercase tracking-wider text-blue-800 flex items-center gap-1.5">
                            <Sparkles className="w-3.5 h-3.5 text-blue-600" />
                            <span>{isKy ? 'Түшүнүктү бекемдөө үчүн окшош тапшырма:' : 'Аналогичное задание для закрепления:'}</span>
                          </div>
                          <p className="text-xs sm:text-sm font-bold text-slate-900">
                            {err.similarQuestion.text[language]}
                          </p>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                          {err.similarQuestion.options[language].map((simOpt, sIdx) => (
                            <button
                              key={sIdx}
                              onClick={() => setSimilarSelectedIdx(sIdx)}
                              className={`p-3 rounded-xl border text-left text-xs font-semibold flex items-center justify-between transition-all cursor-pointer ${
                                similarSelectedIdx === sIdx
                                  ? 'bg-blue-600 text-white border-blue-600'
                                  : 'bg-white hover:bg-slate-50 text-slate-800 border-slate-200'
                              }`}
                            >
                              <div className="flex items-center gap-2">
                                <span className={`w-5 h-5 rounded-md flex items-center justify-center text-[10px] font-bold ${
                                  similarSelectedIdx === sIdx ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-600'
                                }`}>
                                  {optLetters[sIdx]}
                                </span>
                                <span>{simOpt}</span>
                              </div>
                            </button>
                          ))}
                        </div>

                        {similarFeedback !== null && (
                          <div
                            className={`p-3.5 rounded-xl text-xs font-bold flex items-start gap-2 ${
                              similarFeedback
                                ? 'bg-emerald-100 text-emerald-950 border border-emerald-300'
                                : 'bg-rose-100 text-rose-950 border border-rose-300'
                            }`}
                          >
                            {similarFeedback ? (
                              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                            ) : (
                              <XCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                            )}
                            <div>
                              <p>{similarFeedback
                                ? (isKy ? 'Мыкты! Окшош суроону да туура чечтиңиз. Тема бекем өздөштүрүлдү!' : 'Отлично! Вы верно решили аналогичную задачу. Тема успешно усвоена!')
                                : (isKy ? 'Туура эмес, чыгарылышты карап көрүңүз:' : 'Неверно, обратите внимание на логику решения:')}</p>
                              <p className="mt-1 font-normal opacity-90">{err.similarQuestion.explanation[language]}</p>
                            </div>
                          </div>
                        )}

                        <div className="flex justify-end pt-1">
                          <button
                            disabled={similarSelectedIdx === null}
                            onClick={() => handleVerifySimilar(err)}
                            className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:opacity-40 text-white font-bold text-xs transition-colors cursor-pointer"
                          >
                            {isKy ? 'Текшерүү' : 'Проверить аналог'}
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Global AI Explainer Modal */}
        {aiModalQuestion && (
          <AiExplainerModal
            isOpen={Boolean(aiModalQuestion)}
            onClose={() => setAiModalQuestion(null)}
            question={aiModalQuestion}
            studentAnswerIndex={aiStudentIndex}
          />
        )}
      </div>
    </div>
  );
};
