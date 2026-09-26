import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { SubjectId, Question } from '../types';
import { AiExplainerModal } from './AiExplainerModal';
import {
  Calculator,
  BrainCircuit,
  BookOpen,
  FileText,
  Languages,
  CheckCircle2,
  XCircle,
  Sparkles,
  HelpCircle,
  ArrowRight,
  ArrowLeft,
  RotateCcw,
  Play,
  Pause,
  Award,
  BookMarked,
  Check,
  Video,
  Lightbulb,
  CheckSquare
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface TopicLessonData {
  id: string;
  subjectId: SubjectId;
  topicTitle: { ky: string; ru: string };
  // Step 1: Кыска теория
  shortTheory: { ky: string; ru: string };
  ruleOrFormula: { ky: string; ru: string };
  // Step 2: Жөнөкөй мисал
  simpleExample: {
    problem: { ky: string; ru: string };
    answer: { ky: string; ru: string };
  };
  // Step 3: Кадам-кадам түшүндүрмө
  stepByStep: {
    steps: { ky: string[]; ru: string[] };
    takeaway: { ky: string; ru: string };
  };
  // Re-explain alternative
  simplerExplanation: {
    story: { ky: string; ru: string };
    analogy: { ky: string; ru: string };
  };
  // Step 4: Видео сабак
  videoData: {
    title: { ky: string; ru: string };
    duration: string;
    teacher: { ky: string; ru: string };
    keyPoints: { ky: string[]; ru: string[] };
  };
  // Steps 5, 6, 7 Questions
  easyQuestion: Question;
  mediumQuestion: Question;
  hardQuestion: Question;
  // Step 8: Мини-тест
  miniTest: Question[];
}

export const topicLessonsCatalog: Record<string, TopicLessonData> = {
  'math-percents': {
    id: 'math-percents',
    subjectId: 'math',
    topicTitle: {
      ky: 'Проценттер жана арзандатуулар',
      ru: 'Проценты и скидки'
    },
    shortTheory: {
      ky: 'Процент (%) — сандын жүздөн бир бөлүгү. 1% = 0.01 = 1/100.\nОРТда проценттер боюнча эң көп кездешкен үч маселе бар: сандан пайызды табуу, эки сандын пайыздык катышы жана баанын өсүшү/арзандашы.',
      ru: 'Процент (%) — это одна сотая часть числа. 1% = 0.01 = 1/100.\nВ ОРТ ключевыми являются три типа задач: нахождение процента от числа, процентное соотношение величин и изменение цены (скидки/надбавки).'
    },
    ruleOrFormula: {
      ky: 'Арзандатуу пайызы = ((Баштапкы баа - Соңку баа) / Баштапкы баа) × 100%',
      ru: 'Процент скидки = ((Исходная цена - Конечная цена) / Исходная цена) × 100%'
    },
    simpleExample: {
      problem: {
        ky: 'Дүкөндө 1000 сомдук курткага 20% арзандатуу жарыяланды. Арзандатуу канча сом болот?',
        ru: 'В магазине на куртку за 1000 сомов объявлена скидка 20%. Сколько сомов составляет скидка?'
      },
      answer: {
        ky: '1000 × 0.20 = 200 сом. Куртканын жаңы баасы: 1000 - 200 = 800 сом.',
        ru: '1000 × 0.20 = 200 сомов. Новая цена: 1000 - 200 = 800 сомов.'
      }
    },
    stepByStep: {
      steps: {
        ky: [
          '1-кадам: Баштапкы баа менен соңку бааны так аныктаңыз.',
          '2-кадам: Айырмасын (арзандатылган абсолюттук сумманы) табыңыз.',
          '3-кадам: Айырманы СОҢКУ эмес, БАШТАПКЫ санга бөлүңүз!',
          '4-кадам: Чыккан ондук бөлчөктү 100%га көбөйтүңүз.'
        ],
        ru: [
          'Шаг 1: Четко зафиксируйте первоначальную цену (100%).',
          'Шаг 2: Вычтите из нее новую цену и найдите разницу в сомах.',
          'Шаг 3: Разделите разницу ИМЕННО на начальную, а не на конечную цену!',
          'Шаг 4: Умножьте полученное значение на 100%.'
        ]
      },
      takeaway: {
        ky: 'ОРТдагы башкы тузак: көпчүлүк окуучулар айырманы жаңы арзан баага бөлүп алышат. Дайыма баштапкы баага бөлүү керек!',
        ru: 'Главная ловушка ОРТ: деление разницы на новую цену вместо исходной. Делите строго на первоначальное число!'
      }
    },
    simplerExplanation: {
      story: {
        ky: 'Элестетиңиз: Сизде 5 бирдей алма бар (бул 100%). 1 алмасын досуңузга берсеңиз, бештен бирин, башкача айтканда 20%ын бердиңиз. Арзандатуу да так ушундай: 500 сомдон 100 сому кемсе, бештен бири (20%) кемүүдө.',
        ru: 'Представьте: у вас есть 5 одинаковых яблок (100%). Если вы отдали 1 яблоко другу, вы отдали ровно одну пятую часть, то есть 20%. Скидка работает абсолютно так же.'
      },
      analogy: {
        ky: 'Жөнөкөй эсеп: 100 сомдон 10 сом — 10%. 200 сомдон 20 сом — 10%. 500 сомдон 100 сом — 20%.',
        ru: 'Быстрый ориентир: 10 сом от 100 сом — это 10%. 100 сом от 500 сом — это 20%.'
      }
    },
    videoData: {
      title: {
        ky: 'ОРТ Математика: Проценттерди 30 секундда чечүү ыкмасы',
        ru: 'ОРТ Математика: Решение задач на проценты за 30 секунд'
      },
      duration: '4:15 мин',
      teacher: {
        ky: 'Билимбек агай (ОРТ 234 балл)',
        ru: 'Преподаватель высшей категории'
      },
      keyPoints: {
        ky: [
          'Процентти бөлчөккө тез айлантуу (20% = 1/5, 25% = 1/4, 50% = 1/2)',
          'Сандарды салыштыруудагы ОРТнын классикалык суроолору',
          'Тестте убакытты үнөмдөө лайфхактары'
        ],
        ru: [
          'Быстрый перевод процентов в дроби (20% = 1/5, 25% = 1/4, 50% = 1/2)',
          'Типичные ошибки в формулировках ЦООМО',
          'Лайфхаки экономии времени на экзамене'
        ]
      }
    },
    easyQuestion: {
      id: 'm-easy-1',
      subjectId: 'math',
      topic: { ky: 'Проценттер жана арзандатуулар', ru: 'Проценты и скидки' },
      difficulty: 'easy',
      text: {
        ky: '200 санынын 15 пайызы канчага барабар?',
        ru: 'Чему равны 15 процентов от числа 200?'
      },
      options: {
        ky: ['20', '30', '15', '25'],
        ru: ['20', '30', '15', '25']
      },
      correctOptionIndex: 1,
      explanation: {
        ky: '200 × 0.15 = 30. Же 200дүн 10%ы 20 болот, дагы 5%ы 10 болот. Жалпы: 20 + 10 = 30.',
        ru: '200 × 0.15 = 30. Либо устно: 10% от 200 = 20, еще 5% = 10. Всего 30.'
      }
    },
    mediumQuestion: {
      id: 'm-1',
      subjectId: 'math',
      topic: { ky: 'Проценттер жана арзандатуулар', ru: 'Проценты и скидки' },
      difficulty: 'medium',
      text: {
        ky: 'Дүкөндө китептин баасы 500 сомдон 400 сомго чейин арзандатылды. Китептин баасы канча пайызга арзандаган?',
        ru: 'В магазине цена книги снизилась с 500 сомов до 400 сомов. На сколько процентов снизилась цена книги?'
      },
      options: {
        ky: ['15%', '20%', '25%', '10%'],
        ru: ['15%', '20%', '25%', '10%']
      },
      correctOptionIndex: 1,
      explanation: {
        ky: 'Айырма: 500 - 400 = 100 сом. (100 / 500) × 100% = 20%.',
        ru: 'Разница: 500 - 400 = 100 сомов. (100 / 500) × 100% = 20%.'
      }
    },
    hardQuestion: {
      id: 'm-hard-1',
      subjectId: 'math',
      topic: { ky: 'Проценттер жана арзандатуулар', ru: 'Проценты и скидки' },
      difficulty: 'hard',
      text: {
        ky: 'Товардын баасы алгач 20%га кымбаттап, андан кийин жаңы баасы 20%га арзандатылды. Баштапкы баага салыштырмалуу жыйынтык кандай болду?',
        ru: 'Цену товара сначала повысили на 20%, а затем новую цену снизили на 20%. Как изменилась цена по сравнению с первоначальной?'
      },
      options: {
        ky: [
          'Өзгөргөн жок',
          '4%га арзандады',
          '4%га кымбаттады',
          '2%га арзандады'
        ],
        ru: [
          'Не изменилась',
          'Снизилась на 4%',
          'Повысилась на 4%',
          'Снизилась на 2%'
        ]
      },
      correctOptionIndex: 1,
      explanation: {
        ky: 'Баштапкы бааны 100 сом деп алабыз. 20%га кымбаттаганда 120 сом болду. 120 сомдун 20%ы: 120 × 0.20 = 24 сом. Арзандаганда: 120 - 24 = 96 сом. Демек, баштапкы 100дөн 96га түштү (4%га арзандады).',
        ru: 'Примем цену за 100 сом. После повышения на 20% стало 120 сом. 20% от 120 сом = 24 сом. Новая цена: 120 - 24 = 96 сом. Итог: снижение на 4%.'
      }
    },
    miniTest: [
      {
        id: 'mt-1',
        subjectId: 'math',
        topic: { ky: 'Проценттер', ru: 'Проценты' },
        difficulty: 'easy',
        text: {
          ky: 'Класстагы 40 окуучунун 25%ы спорт секциясына катышат. Спортко канча окуучу барат?',
          ru: 'Из 40 учеников класса 25% посещают спортивную секцию. Сколько учеников ходит на спорт?'
        },
        options: {
          ky: ['8', '10', '12', '15'],
          ru: ['8', '10', '12', '15']
        },
        correctOptionIndex: 1,
        explanation: {
          ky: '40тын 25%ы (төрттөн бири): 40 / 4 = 10 окуучу.',
          ru: '25% — это четверть числа: 40 / 4 = 10 учеников.'
        }
      },
      {
        id: 'mt-2',
        subjectId: 'math',
        topic: { ky: 'Проценттер', ru: 'Проценты' },
        difficulty: 'medium',
        text: {
          ky: 'Банктагы депозит жыл сайын 10% пайда кошот. 50 000 сом бир жылдан кийин канча болот?',
          ru: 'Депозит в банке дает 10% годовых. Какой станет сумма 50 000 сомов через один год?'
        },
        options: {
          ky: ['52 000 сом', '55 000 сом', '60 000 сом', '51 500 сом'],
          ru: ['52 000 сомов', '55 000 сомов', '60 000 сомов', '51 500 сомов']
        },
        correctOptionIndex: 1,
        explanation: {
          ky: '50 000 × 0.10 = 5 000 сом кошулат. Бардыгы: 50 000 + 5 000 = 55 000 сом.',
          ru: 'Прибыль 10%: 50 000 * 0.10 = 5 000. Итоговая сумма: 55 000 сомов.'
        }
      }
    ]
  },
  'analogies-tool': {
    id: 'analogies-tool',
    subjectId: 'analogies',
    topicTitle: {
      ky: 'Курал жана кесип аналогиялары',
      ru: 'Аналогии: Инструмент и профессия'
    },
    shortTheory: {
      ky: 'Окшоштуктар бөлүмүндө сөздөрдүн ортосундагы так логикалык байланышты аныктоо маанилүү. «Курал : Кесип» байланышында биринчи сөз эмгек куралы, экинчиси аны пайдаланган адам же адис болот.',
      ru: 'В разделе «Аналогии» критически важно выявить точный тип связи. В модели «Инструмент : Профессия» первое слово указывает на рабочий предмет, а второе — на специалиста.'
    },
    ruleOrFormula: {
      ky: 'Модель: [Иштөө куралы] пайдаланат -> [Кесип ээси]. Ирээти бузулбашы шарт!',
      ru: 'Модель: [Орудие труда] -> [Мастер/Специалист]. Порядок слов строго обязателен!'
    },
    simpleExample: {
      problem: {
        ky: 'Скалпель : Хирург катышына окшош жупту табыңыз:',
        ru: 'Какая пара соответствует отношению: Скальпель : Хирург?'
      },
      answer: {
        ky: 'Кыл калем : Сүрөтчү (Кисть : Художник).',
        ru: 'Кисть : Художник (Специальный инструмент : Мастер).'
      }
    },
    stepByStep: {
      steps: {
        ky: [
          '1-кадам: Берилген сөздөрдүн ортосуна сүйлөм түзүңүз: «Скалпель — хирургдун негизги куралы».',
          '2-кадам: Варианттардагы сөздөрдү ошол эле сүйлөмгө салып көрүңүз.',
          '3-кадам: Сөздөрдүн орун тартибин (сол-оң) катуу текшериңиз!'
        ],
        ru: [
          'Шаг 1: Сформулируйте предложение-связку: «Скальпель — инструмент хирурга».',
          'Шаг 2: Подставьте слова из каждого варианта в эту же связку.',
          'Шаг 3: Проверьте порядок следования (инструмент слева, человек справа).'
        ]
      },
      takeaway: {
        ky: 'ОРТдагы тузак: «Сүрөтчү : Кыл калем» деп орун алмашып берилиши мүмкүн. Бул туура эмес!',
        ru: 'Ловушка ОРТ: перевернутый порядок «Художник : Кисть» неверен, если в условии «Инструмент : Человек».'
      }
    },
    simplerExplanation: {
      story: {
        ky: 'Жөнөкөй мисал: Уста колуна балка кармап иштейт. Айдоочу руль кармап айдайт. Сүрөтчү кыл калем кармайт. Демек курал жана адис!',
        ru: 'Простой жизненный образ: кузнец держит молоток, водитель держит руль, художник держит кисть.'
      },
      analogy: {
        ky: 'Адам жок болсо курал өзү иштебейт — куралды адам башкарат.',
        ru: 'Инструмент сам по себе не работает — им управляет мастер.'
      }
    },
    videoData: {
      title: {
        ky: 'Аналогиялардын 7 негизги түрү жана тузактарды айланып өтүү',
        ru: '7 основных типов аналогий и обход ловушек'
      },
      duration: '3:50 мин',
      teacher: {
        ky: 'Айнура эжей (ОРТ тил адиси)',
        ru: 'Эксперт по подготовке к ОРТ'
      },
      keyPoints: {
        ky: [
          'Бөлүк жана бүтүн катышы',
          'Себеп жана натыйжа катышы',
          'Сөздөрдүн ырааттуулук тартиби'
        ],
        ru: [
          'Отношение «Часть и целое»',
          'Причинно-следственные пары',
          'Порядок слов в паре'
        ]
      }
    },
    easyQuestion: {
      id: 'a-easy-1',
      subjectId: 'analogies',
      topic: { ky: 'Курал жана кесип', ru: 'Инструмент и профессия' },
      difficulty: 'easy',
      text: {
        ky: 'Руль : Айдоочу катышына окшош байланышты табыңыз:',
        ru: 'Найдите пару с аналогичной связью: Руль : Водитель'
      },
      options: {
        ky: ['Калем : Жазуучу', 'Жол : Машина', 'Жүргүнчү : Автобус', 'Дөңгөлөк : Жол'],
        ru: ['Перо : Писатель', 'Дорога : Машина', 'Пассажир : Автобус', 'Колесо : Дорога']
      },
      correctOptionIndex: 0,
      explanation: {
        ky: 'Руль айдоочунун негизги башкаруу куралы болгондой, калем жазуучунун негизги жазуу куралы.',
        ru: 'Руль — инструмент водителя, перо/ручка — инструмент писателя.'
      }
    },
    mediumQuestion: {
      id: 'a-1',
      subjectId: 'analogies',
      topic: { ky: 'Курал жана кесип', ru: 'Инструмент и профессия' },
      difficulty: 'medium',
      text: {
        ky: 'Скалпель : Хирург катышына окшош жупту табыңыз:',
        ru: 'Найдите аналогичную пару к соотношению: Скальпель : Хирург'
      },
      options: {
        ky: ['Кыл калем : Сүрөтчү', 'Китеп : Китепкана', 'Автомобиль : Жол', 'Окуучу : Мугалим'],
        ru: ['Кисть : Художник', 'Книга : Библиотека', 'Автомобиль : Дорога', 'Ученик : Учитель']
      },
      correctOptionIndex: 0,
      explanation: {
        ky: 'Скалпель — хирургдун куралы, кыл калем — сүрөтчүнүн куралы.',
        ru: 'Скальпель — орудие хирурга, кисть — орудие художника.'
      }
    },
    hardQuestion: {
      id: 'a-hard-1',
      subjectId: 'analogies',
      topic: { ky: 'Курал жана кесип', ru: 'Инструмент и профессия' },
      difficulty: 'hard',
      text: {
        ky: 'Телескоп : Астроном байланышына эң жакын катышты табыңыз:',
        ru: 'Какая пара наиболее точно соответствует связи: Телескоп : Астроном?'
      },
      options: {
        ky: ['Микроскоп : Биолог', 'Жылдыз : Асман', 'Көз айнек : Окурмандар', 'Компьютер : Бөлмө'],
        ru: ['Микроскоп : Биолог', 'Звезда : Небо', 'Очки : Читатель', 'Компьютер : Кабинет']
      },
      correctOptionIndex: 0,
      explanation: {
        ky: 'Телескоп астрономдун атайын илимий байкоо куралы, ал эми микроскоп биологдун илимий изилдөө куралы (илимий оптикалык курал : илимпоз).',
        ru: 'Телескоп — специальный научный прибор астронома, микроскоп — прибор биолога.'
      }
    },
    miniTest: [
      {
        id: 'mt-a-1',
        subjectId: 'analogies',
        topic: { ky: 'Аналогиялар', ru: 'Аналогии' },
        difficulty: 'medium',
        text: {
          ky: 'Ийне : Тигүүчү жупуна кайсы вариант дал келет?',
          ru: 'Какая пара соответствует отношению: Игла : Портной?'
        },
        options: {
          ky: ['Балка : Уста', 'Жип : Кездеме', 'Кийим : Дүкөн', 'Үтүк : Шым'],
          ru: ['Молоток : Кузнец', 'Нить : Ткань', 'Одежда : Магазин', 'Утюг : Брюки']
        },
        correctOptionIndex: 0,
        explanation: {
          ky: 'Ийне тигүүчүнүн куралы, балка устанын куралы.',
          ru: 'Игла — орудие портного, молоток — орудие кузнеца.'
        }
      }
    ]
  }
};

export const TrainingTopicMode: React.FC = () => {
  const { language, t, navigate, addToRepetition } = useApp();

  const [selectedTopicKey, setSelectedTopicKey] = useState<string>('math-percents');
  const activeLesson = topicLessonsCatalog[selectedTopicKey] || topicLessonsCatalog['math-percents'];

  // Current step 1..9
  const [currentStep, setCurrentStep] = useState<number>(1);

  // Re-explain alternative toggle
  const [showSimplerExplanation, setShowSimplerExplanation] = useState<boolean>(false);

  // Video playback simulation state
  const [isVideoPlaying, setIsVideoPlaying] = useState<boolean>(false);

  // Practice answering state (steps 5, 6, 7)
  const [userSelectedAnswers, setUserSelectedAnswers] = useState<Record<string, number>>({});
  const [submittedAnswers, setSubmittedAnswers] = useState<Record<string, boolean>>({});

  // Mini-test state (step 8)
  const [miniTestAnswers, setMiniTestAnswers] = useState<Record<string, number>>({});
  const [miniTestSubmitted, setMiniTestSubmitted] = useState<boolean>(false);

  // AI Explainer Modal
  const [aiModalQuestion, setAiModalQuestion] = useState<Question | null>(null);
  const [aiStudentIndex, setAiStudentIndex] = useState<number | null>(null);

  const isKy = language === 'ky';
  const optLetters = ['А', 'Б', 'В', 'Г'];

  const stepsList = [
    { num: 1, title: isKy ? 'Кыска теория' : 'Теория' },
    { num: 2, title: isKy ? 'Жөнөкөй мисал' : 'Пример' },
    { num: 3, title: isKy ? 'Кадам-кадам' : 'Пошагово' },
    { num: 4, title: isKy ? 'Видео сабак' : 'Видеоурок' },
    { num: 5, title: isKy ? 'Жеңил тапшырма' : 'Легкий уровень' },
    { num: 6, title: isKy ? 'Орточо тапшырма' : 'Средний уровень' },
    { num: 7, title: isKy ? 'ОРТ деңгээли' : 'Уровень ОРТ' },
    { num: 8, title: isKy ? 'Мини-тест' : 'Мини-тест' },
    { num: 9, title: isKy ? 'Жыйынтык' : 'Итоги' }
  ];

  // Helper to record error if user gets question wrong
  const recordMistakeIfNeeded = (q: Question, selectedIdx: number) => {
    if (selectedIdx !== q.correctOptionIndex) {
      try {
        const raw = localStorage.getItem('bilim_student_error_records');
        const list = raw ? JSON.parse(raw) : [];
        const exists = list.some((e: any) => e.questionId === q.id);
        if (!exists) {
          list.unshift({
            id: 'err-' + Date.now(),
            questionId: q.id,
            subjectId: q.subjectId,
            topic: q.topic,
            questionText: q.text,
            options: q.options,
            correctOptionIndex: q.correctOptionIndex,
            studentAnswerIndex: selectedIdx,
            whyWrong: {
              ky: `Сиз ${optLetters[selectedIdx]} вариантын тандадыңыз. Бул суроодогу туура вариант: ${optLetters[q.correctOptionIndex]}.`,
              ru: `Вы выбрали вариант ${optLetters[selectedIdx]}. Правильный ответ: ${optLetters[q.correctOptionIndex]}.`
            },
            stepByStepSolution: q.explanation,
            similarQuestion: {
              text: q.text,
              options: q.options,
              correctIndex: q.correctOptionIndex,
              explanation: q.explanation
            },
            isMastered: false,
            dateAdded: new Date().toISOString().split('T')[0]
          });
          localStorage.setItem('bilim_student_error_records', JSON.stringify(list));
        }
      } catch (e) {
        console.warn('Failed to auto-save error');
      }
    }
  };

  const handlePracticeAnswer = (q: Question, idx: number) => {
    setUserSelectedAnswers((prev) => ({ ...prev, [q.id]: idx }));
    setSubmittedAnswers((prev) => ({ ...prev, [q.id]: true }));
    recordMistakeIfNeeded(q, idx);

    if (idx === q.correctOptionIndex) {
      confetti({
        particleCount: 30,
        spread: 45,
        origin: { y: 0.8 }
      });
    }
  };

  const handleFinishMiniTest = () => {
    setMiniTestSubmitted(true);
    let correct = 0;
    activeLesson.miniTest.forEach((mq) => {
      const ans = miniTestAnswers[mq.id];
      if (ans === mq.correctOptionIndex) {
        correct++;
      } else if (ans !== undefined) {
        recordMistakeIfNeeded(mq, ans);
      }
    });

    confetti({
      particleCount: 60,
      spread: 70,
      origin: { y: 0.6 }
    });
  };

  // Render question card
  const renderQuestionBlock = (q: Question, levelBadge: string) => {
    const selected = userSelectedAnswers[q.id];
    const isSubmitted = submittedAnswers[q.id];
    const isCorrect = selected === q.correctOptionIndex;

    return (
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/90 shadow-xs space-y-6">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 rounded-full text-xs font-bold bg-blue-100 text-blue-800">
              {levelBadge}
            </span>
            <span className="text-xs text-slate-500 font-semibold">
              {q.topic[language]}
            </span>
          </div>

          <button
            onClick={() => {
              setAiModalQuestion(q);
              setAiStudentIndex(selected !== undefined ? selected : null);
            }}
            className="px-3 py-1.5 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5 text-blue-600" />
            <span>{isKy ? 'Түшүндүрмө алуу' : 'Помощь репетитора'}</span>
          </button>
        </div>

        <p className="text-base sm:text-lg font-bold text-slate-900 leading-relaxed">
          {q.text[language]}
        </p>

        {/* Options */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          {q.options[language].map((optText, optIdx) => {
            const isOptSelected = selected === optIdx;
            const isOptCorrect = optIdx === q.correctOptionIndex;

            let btnStyle = 'border-slate-200 bg-white hover:bg-slate-50 text-slate-800';

            if (isSubmitted) {
              if (isOptCorrect) {
                btnStyle = 'border-emerald-500 bg-emerald-50 text-emerald-950 font-bold';
              } else if (isOptSelected && !isOptCorrect) {
                btnStyle = 'border-rose-400 bg-rose-50 text-rose-950 font-bold';
              } else {
                btnStyle = 'border-slate-200 opacity-60 text-slate-500';
              }
            } else if (isOptSelected) {
              btnStyle = 'border-blue-600 bg-blue-50 text-blue-900 font-bold';
            }

            return (
              <button
                key={optIdx}
                disabled={isSubmitted}
                onClick={() => handlePracticeAnswer(q, optIdx)}
                className={`p-3.5 rounded-2xl border text-left text-xs sm:text-sm transition-all flex items-center justify-between cursor-pointer ${btnStyle}`}
              >
                <div className="flex items-center gap-2.5">
                  <span className={`w-6 h-6 rounded-lg flex items-center justify-center text-xs font-bold ${
                    isSubmitted && isOptCorrect
                      ? 'bg-emerald-600 text-white'
                      : isSubmitted && isOptSelected && !isOptCorrect
                      ? 'bg-rose-600 text-white'
                      : 'bg-slate-100 text-slate-700'
                  }`}>
                    {optLetters[optIdx]}
                  </span>
                  <span>{optText}</span>
                </div>
                {isSubmitted && isOptCorrect && (
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                )}
                {isSubmitted && isOptSelected && !isOptCorrect && (
                  <XCircle className="w-5 h-5 text-rose-600 shrink-0" />
                )}
              </button>
            );
          })}
        </div>

        {/* Feedback & Explanation */}
        {isSubmitted && (
          <div className="pt-4 border-t border-slate-100 space-y-4 animate-in fade-in">
            <div
              className={`p-4 rounded-2xl font-bold text-xs sm:text-sm flex items-center gap-2.5 ${
                isCorrect
                  ? 'bg-emerald-50 text-emerald-950 border border-emerald-200'
                  : 'bg-rose-50 text-rose-950 border border-rose-200'
              }`}
            >
              {isCorrect ? (
                <>
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                  <span>{isKy ? 'Туура жооп! Азаматсыз.' : 'Правильный ответ! Отлично.'}</span>
                </>
              ) : (
                <>
                  <XCircle className="w-5 h-5 text-rose-600 shrink-0" />
                  <span>
                    {isKy ? 'Ката! Туура жообу:' : 'Неверно! Правильный ответ:'} {optLetters[q.correctOptionIndex]}
                  </span>
                </>
              )}
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-1">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                {isKy ? 'Түшүндүрмө:' : 'Пояснение:'}
              </span>
              <p className="text-xs sm:text-sm text-slate-700 leading-relaxed whitespace-pre-line">
                {q.explanation[language]}
              </p>
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-slate-50/70 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Topic Selector Bar */}
        <div className="bg-white rounded-2xl p-3 border border-slate-200 shadow-2xs flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                setSelectedTopicKey('math-percents');
                setCurrentStep(1);
                setShowSimplerExplanation(false);
              }}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                selectedTopicKey === 'math-percents'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              <Calculator className="w-3.5 h-3.5" />
              <span>{isKy ? 'Математика: Проценттер' : 'Математика: Проценты'}</span>
            </button>

            <button
              onClick={() => {
                setSelectedTopicKey('analogies-tool');
                setCurrentStep(1);
                setShowSimplerExplanation(false);
              }}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                selectedTopicKey === 'analogies-tool'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              <BrainCircuit className="w-3.5 h-3.5" />
              <span>{isKy ? 'Аналогия: Курал жана кесип' : 'Аналогии: Инструмент'}</span>
            </button>
          </div>

          <button
            onClick={() => navigate('my-errors')}
            className="px-3.5 py-2 rounded-xl border border-rose-200 bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>{isKy ? 'Менин каталарым' : 'Мои ошибки'}</span>
          </button>
        </div>

        {/* 9-Step Pedagogical Stepper Header (Requirement 3: 9 кадамдуу структура) */}
        <div className="bg-white rounded-3xl p-5 border border-slate-200/90 shadow-xs space-y-3">
          <div className="flex items-center justify-between text-xs">
            <span className="font-bold text-slate-800">
              {isKy ? 'Сабактын кадамдары:' : 'Этапы урока:'}
            </span>
            <span className="font-semibold text-blue-600">
              {currentStep} / {stepsList.length} • {stepsList[currentStep - 1]?.title}
            </span>
          </div>

          {/* Stepper Progress Badges */}
          <div className="grid grid-cols-3 sm:grid-cols-9 gap-1.5">
            {stepsList.map((step) => {
              const isActive = currentStep === step.num;
              const isPassed = currentStep > step.num;

              return (
                <button
                  key={step.num}
                  onClick={() => setCurrentStep(step.num)}
                  className={`p-2 rounded-xl text-center text-[10px] sm:text-[11px] font-bold transition-all cursor-pointer ${
                    isActive
                      ? 'bg-blue-600 text-white shadow-xs'
                      : isPassed
                      ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                      : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                  }`}
                >
                  <div className="font-black">{step.num}</div>
                  <div className="truncate hidden sm:block">{step.title}</div>
                </button>
              );
            })}
          </div>
        </div>

        {/* STEP CONTENT CONTAINER */}
        <div className="space-y-6">
          {/* STEP 1: КЫСКА ТЕОРИЯ */}
          {currentStep === 1 && (
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/90 shadow-xs space-y-6 animate-in fade-in">
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-blue-600">
                <BookOpen className="w-4 h-4" />
                <span>1-кадам • {isKy ? 'Кыска теория' : 'Краткая теория'}</span>
              </div>

              <h2 className="text-xl sm:text-2xl font-black text-slate-900">
                {activeLesson.topicTitle[language]}
              </h2>

              <p className="text-sm sm:text-base text-slate-700 leading-relaxed whitespace-pre-line">
                {activeLesson.shortTheory[language]}
              </p>

              {/* Key Formula / Rule Banner */}
              <div className="p-5 rounded-2xl bg-blue-50/80 border-2 border-blue-200/90 text-blue-950 space-y-1.5 shadow-xs">
                <div className="flex items-center gap-2 font-black text-xs sm:text-sm text-blue-900">
                  <Lightbulb className="w-4 h-4 text-blue-600" />
                  <span>{isKy ? 'Башкы эреже / Формула:' : 'Главное правило / Формула:'}</span>
                </div>
                <p className="text-xs sm:text-sm font-semibold leading-relaxed">
                  {activeLesson.ruleOrFormula[language]}
                </p>
              </div>

              {/* Alternative Simpler Explanation (If user clicks «Кайра түшүндүр») */}
              {showSimplerExplanation && (
                <div className="p-5 rounded-2xl bg-purple-50 border border-purple-200 text-purple-950 space-y-2 animate-in fade-in">
                  <div className="flex items-center gap-2 font-black text-xs text-purple-900">
                    <Sparkles className="w-4 h-4 text-purple-600" />
                    <span>{isKy ? 'Жөнөкөй тил менен кайра түшүндүрүү:' : 'Повторное объяснение простыми словами:'}</span>
                  </div>
                  <p className="text-xs sm:text-sm leading-relaxed">
                    {activeLesson.simplerExplanation.story[language]}
                  </p>
                  <p className="text-xs font-bold text-purple-800">
                    💡 {activeLesson.simplerExplanation.analogy[language]}
                  </p>
                </div>
              )}

              {/* 3 Required Action Buttons (Requirement 3: “Түшүндүм”, “Кайра түшүндүр”, “Практикага өтүү”) */}
              <div className="pt-4 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3">
                <button
                  id="btn-lesson-reexplain"
                  onClick={() => setShowSimplerExplanation(!showSimplerExplanation)}
                  className="px-4 py-2.5 rounded-xl border border-purple-200 bg-purple-50 hover:bg-purple-100 text-purple-800 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <RotateCcw className="w-4 h-4" />
                  <span>{isKy ? 'Кайра түшүндүр' : 'Объяснить иначе'}</span>
                </button>

                <div className="flex items-center gap-2">
                  <button
                    id="btn-lesson-go-practice"
                    onClick={() => setCurrentStep(5)}
                    className="px-4 py-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-100 text-slate-800 text-xs font-bold transition-colors cursor-pointer"
                  >
                    <span>{isKy ? 'Практикага өтүү' : 'Сразу к практике'}</span>
                  </button>

                  <button
                    id="btn-lesson-understood"
                    onClick={() => setCurrentStep(2)}
                    className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold flex items-center gap-1.5 shadow-md shadow-blue-600/20 transition-all cursor-pointer"
                  >
                    <span>{isKy ? 'Түшүндүм' : 'Понятно (Далее)'}</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* STEP 2: ЖӨНӨКӨЙ МИСАЛ */}
          {currentStep === 2 && (
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/90 shadow-xs space-y-6 animate-in fade-in">
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-emerald-600">
                <CheckSquare className="w-4 h-4" />
                <span>2-кадам • {isKy ? 'Жөнөкөй мисал' : 'Простой пример'}</span>
              </div>

              <div className="space-y-2">
                <h3 className="text-lg font-black text-slate-900">
                  {isKy ? 'Баштапкы түшүнүү үчүн мисал:' : 'Базовый вводный пример:'}
                </h3>
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 font-bold text-slate-800 text-sm sm:text-base">
                  {activeLesson.simpleExample.problem[language]}
                </div>
              </div>

              <div className="p-5 rounded-2xl bg-emerald-50/80 border border-emerald-200 text-emerald-950 space-y-1.5">
                <div className="text-xs font-bold uppercase tracking-wider text-emerald-800">
                  {isKy ? 'Жообу жана чыгарылышы:' : 'Решение и ответ:'}
                </div>
                <p className="text-sm font-semibold leading-relaxed">
                  {activeLesson.simpleExample.answer[language]}
                </p>
              </div>

              {/* 3 Required Action Buttons */}
              <div className="pt-4 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3">
                <button
                  onClick={() => setShowSimplerExplanation(!showSimplerExplanation)}
                  className="px-4 py-2.5 rounded-xl border border-purple-200 bg-purple-50 hover:bg-purple-100 text-purple-800 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <RotateCcw className="w-4 h-4" />
                  <span>{isKy ? 'Кайра түшүндүр' : 'Объяснить иначе'}</span>
                </button>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setCurrentStep(5)}
                    className="px-4 py-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-100 text-slate-800 text-xs font-bold transition-colors cursor-pointer"
                  >
                    <span>{isKy ? 'Практикага өтүү' : 'К практике'}</span>
                  </button>

                  <button
                    onClick={() => setCurrentStep(3)}
                    className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold flex items-center gap-1.5 shadow-md shadow-blue-600/20 transition-all cursor-pointer"
                  >
                    <span>{isKy ? 'Түшүндүм' : 'Понятно (Далее)'}</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* STEP 3: КАДАМ-КАДАМ ТҮШҮНДҮРМӨ */}
          {currentStep === 3 && (
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/90 shadow-xs space-y-6 animate-in fade-in">
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-purple-600">
                <Sparkles className="w-4 h-4" />
                <span>3-кадам • {isKy ? 'Кадам-кадам түшүндүрмө' : 'Пошаговое объяснение'}</span>
              </div>

              <h3 className="text-lg font-black text-slate-900">
                {isKy ? 'Чыгаруунун алгоритми:' : 'Алгоритм решения:'}
              </h3>

              <div className="space-y-3">
                {activeLesson.stepByStep.steps[language].map((stepText, idx) => (
                  <div
                    key={idx}
                    className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-xs sm:text-sm font-semibold text-slate-800 flex items-start gap-3"
                  >
                    <span className="w-6 h-6 rounded-lg bg-blue-600 text-white font-bold text-xs flex items-center justify-center shrink-0">
                      {idx + 1}
                    </span>
                    <span className="leading-relaxed">{stepText}</span>
                  </div>
                ))}
              </div>

              <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-950 space-y-1">
                <span className="text-xs font-bold text-amber-900">⚠️ {isKy ? 'Маанилүү эскертүү:' : 'Внимание:'}</span>
                <p className="text-xs sm:text-sm leading-relaxed">{activeLesson.stepByStep.takeaway[language]}</p>
              </div>

              {/* 3 Buttons */}
              <div className="pt-4 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3">
                <button
                  onClick={() => setShowSimplerExplanation(!showSimplerExplanation)}
                  className="px-4 py-2.5 rounded-xl border border-purple-200 bg-purple-50 hover:bg-purple-100 text-purple-800 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <RotateCcw className="w-4 h-4" />
                  <span>{isKy ? 'Кайра түшүндүр' : 'Объяснить иначе'}</span>
                </button>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setCurrentStep(5)}
                    className="px-4 py-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-100 text-slate-800 text-xs font-bold transition-colors cursor-pointer"
                  >
                    <span>{isKy ? 'Практикага өтүү' : 'К практике'}</span>
                  </button>

                  <button
                    onClick={() => setCurrentStep(4)}
                    className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold flex items-center gap-1.5 shadow-md shadow-blue-600/20 transition-all cursor-pointer"
                  >
                    <span>{isKy ? 'Түшүндүм' : 'Понятно (Далее)'}</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* STEP 4: ВИДЕО САБАК */}
          {currentStep === 4 && (
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/90 shadow-xs space-y-6 animate-in fade-in">
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-rose-600">
                <Video className="w-4 h-4" />
                <span>4-кадам • {isKy ? 'Видео сабак' : 'Видеоурок'}</span>
              </div>

              <div className="space-y-1">
                <h3 className="text-lg sm:text-xl font-black text-slate-900">
                  {activeLesson.videoData.title[language]}
                </h3>
                <p className="text-xs text-slate-500">
                  {activeLesson.videoData.teacher[language]} • ⏱ {activeLesson.videoData.duration}
                </p>
              </div>

              {/* Interactive Video Player Canvas Preview */}
              <div className="relative rounded-2xl overflow-hidden bg-slate-900 text-white aspect-video flex flex-col justify-between p-6 shadow-xl border border-slate-800">
                <div className="flex justify-between items-center text-xs opacity-80">
                  <span>ОРТ Онлайн Video HD</span>
                  <span>{activeLesson.videoData.duration}</span>
                </div>

                <div className="text-center space-y-3">
                  <button
                    onClick={() => setIsVideoPlaying(!isVideoPlaying)}
                    className="w-16 h-16 rounded-full bg-blue-600 hover:bg-blue-500 text-white mx-auto flex items-center justify-center shadow-lg shadow-blue-600/40 transition-transform hover:scale-105 cursor-pointer"
                  >
                    {isVideoPlaying ? <Pause className="w-7 h-7" /> : <Play className="w-7 h-7 fill-white ml-1" />}
                  </button>
                  <p className="text-xs sm:text-sm font-semibold opacity-90">
                    {isVideoPlaying
                      ? (isKy ? 'Видео сабак ойнотулууда...' : 'Видеоурок воспроизводится...')
                      : (isKy ? 'Видео сабакты көрүү үчүн басыңыз' : 'Нажмите для просмотра видеоурока')}
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <div className="flex-1 h-1.5 bg-white/20 rounded-full overflow-hidden">
                    <div className={`h-full bg-blue-500 rounded-full transition-all duration-300 ${isVideoPlaying ? 'w-2/3' : 'w-1/4'}`} />
                  </div>
                  <span className="text-[11px] font-mono opacity-70">1:45 / {activeLesson.videoData.duration}</span>
                </div>
              </div>

              {/* Key Takeaways */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                <span className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                  {isKy ? 'Видеодон негизги тезистер:' : 'Ключевые тезисы из видео:'}
                </span>
                <ul className="space-y-1.5 text-xs sm:text-sm text-slate-700">
                  {activeLesson.videoData.keyPoints[language].map((pt, idx) => (
                    <li key={idx} className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span>{pt}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Action Buttons */}
              <div className="pt-4 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3">
                <button
                  onClick={() => setCurrentStep(3)}
                  className="px-4 py-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-100 text-slate-700 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>{isKy ? 'Артка' : 'Назад'}</span>
                </button>

                <button
                  onClick={() => setCurrentStep(5)}
                  className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold flex items-center gap-1.5 shadow-md shadow-blue-600/20 transition-all cursor-pointer"
                >
                  <span>{isKy ? 'Практикага өтүү' : 'Перейти к практике'}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* STEP 5: ЖЕҢИЛ ТАПШЫРМАЛАР (EASY) */}
          {currentStep === 5 && (
            <div className="space-y-4">
              {renderQuestionBlock(activeLesson.easyQuestion, isKy ? '5-кадам • Жеңил деңгээл' : 'Шаг 5 • Легкий уровень')}

              <div className="flex justify-between items-center bg-white p-4 rounded-2xl border border-slate-200">
                <button
                  onClick={() => setCurrentStep(4)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 flex items-center gap-1"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>{isKy ? 'Теорияга кайтуу' : 'К теории'}</span>
                </button>

                <button
                  onClick={() => setCurrentStep(6)}
                  className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold flex items-center gap-1.5 shadow-md shadow-blue-600/20 cursor-pointer"
                >
                  <span>{isKy ? 'Орточо деңгээлге өтүү' : 'К среднему уровню'}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* STEP 6: ОРТОЧО ТАПШЫРМАЛАР (MEDIUM) */}
          {currentStep === 6 && (
            <div className="space-y-4">
              {renderQuestionBlock(activeLesson.mediumQuestion, isKy ? '6-кадам • Орточо деңгээл' : 'Шаг 6 • Средний уровень')}

              <div className="flex justify-between items-center bg-white p-4 rounded-2xl border border-slate-200">
                <button
                  onClick={() => setCurrentStep(5)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 flex items-center gap-1"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>{isKy ? 'Жеңил тапшырма' : 'Назад'}</span>
                </button>

                <button
                  onClick={() => setCurrentStep(7)}
                  className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold flex items-center gap-1.5 shadow-md shadow-blue-600/20 cursor-pointer"
                >
                  <span>{isKy ? 'ОРТ деңгээлине өтүү' : 'К уровню ОРТ'}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* STEP 7: ОРТ ДЕҢГЭЭЛИНДЕГИ ТАПШЫРМА (HARD / ORT LEVEL) */}
          {currentStep === 7 && (
            <div className="space-y-4">
              {renderQuestionBlock(activeLesson.hardQuestion, isKy ? '7-кадам • ОРТ деңгээлиндеги суроо' : 'Шаг 7 • Уровень реального ОРТ')}

              <div className="flex justify-between items-center bg-white p-4 rounded-2xl border border-slate-200">
                <button
                  onClick={() => setCurrentStep(6)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 flex items-center gap-1"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>{isKy ? 'Артка' : 'Назад'}</span>
                </button>

                <button
                  onClick={() => setCurrentStep(8)}
                  className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold flex items-center gap-1.5 shadow-md shadow-blue-600/20 cursor-pointer"
                >
                  <span>{isKy ? 'Мини-тестке өтүү' : 'К мини-тесту'}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* STEP 8: МИНИ-ТЕСТ */}
          {currentStep === 8 && (
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/90 shadow-xs space-y-6 animate-in fade-in">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-amber-600">
                  <Award className="w-4 h-4" />
                  <span>8-кадам • {isKy ? 'Мини-тест (Тез текшерүү)' : 'Мини-тест (Быстрая проверка)'}</span>
                </div>
                <span className="text-xs font-semibold text-slate-400">
                  {activeLesson.miniTest.length} {isKy ? 'суроо' : 'вопроса'}
                </span>
              </div>

              <div className="space-y-6">
                {activeLesson.miniTest.map((mq, idx) => {
                  const selected = miniTestAnswers[mq.id];

                  return (
                    <div key={mq.id} className="p-5 rounded-2xl bg-slate-50/70 border border-slate-200 space-y-3">
                      <div className="text-xs font-bold text-slate-500">
                        {isKy ? 'Суроо' : 'Вопрос'} #{idx + 1}
                      </div>
                      <p className="text-xs sm:text-sm font-bold text-slate-900 leading-relaxed">
                        {mq.text[language]}
                      </p>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {mq.options[language].map((optText, oIdx) => {
                          const isOptSelected = selected === oIdx;
                          const isCorrectOpt = oIdx === mq.correctOptionIndex;

                          let style = 'bg-white border-slate-200 text-slate-800';
                          if (miniTestSubmitted) {
                            if (isCorrectOpt) {
                              style = 'bg-emerald-100 border-emerald-500 font-bold text-emerald-950';
                            } else if (isOptSelected && !isCorrectOpt) {
                              style = 'bg-rose-100 border-rose-400 font-bold text-rose-950';
                            }
                          } else if (isOptSelected) {
                            style = 'bg-blue-50 border-blue-600 text-blue-900 font-bold';
                          }

                          return (
                            <button
                              key={oIdx}
                              disabled={miniTestSubmitted}
                              onClick={() => setMiniTestAnswers((prev) => ({ ...prev, [mq.id]: oIdx }))}
                              className={`p-3 rounded-xl border text-left text-xs transition-all flex items-center justify-between cursor-pointer ${style}`}
                            >
                              <div className="flex items-center gap-2">
                                <span className="w-5 h-5 rounded-md bg-slate-100 text-slate-700 flex items-center justify-center text-[10px] font-bold">
                                  {optLetters[oIdx]}
                                </span>
                                <span>{optText}</span>
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                <button
                  onClick={() => setCurrentStep(7)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 flex items-center gap-1 cursor-pointer"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>{isKy ? 'Артка' : 'Назад'}</span>
                </button>

                {!miniTestSubmitted ? (
                  <button
                    disabled={Object.keys(miniTestAnswers).length === 0}
                    onClick={handleFinishMiniTest}
                    className="px-6 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 disabled:opacity-40 text-white font-bold text-xs sm:text-sm cursor-pointer"
                  >
                    {isKy ? 'Тестти аяктоо' : 'Завершить мини-тест'}
                  </button>
                ) : (
                  <button
                    onClick={() => setCurrentStep(9)}
                    className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs sm:text-sm shadow-md shadow-blue-600/20 cursor-pointer"
                  >
                    <span>{isKy ? 'Жыйынтыкка өтүү' : 'К результатам'}</span>
                    <ArrowRight className="w-4 h-4 ml-1" />
                  </button>
                )}
              </div>
            </div>
          )}

          {/* STEP 9: ЖЫЙЫНТЫК ЖАНА КАТАЛАРДЫ ТАЛДОО */}
          {currentStep === 9 && (
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/90 shadow-xs space-y-6 text-center animate-in fade-in">
              <div className="w-16 h-16 rounded-3xl bg-emerald-50 text-emerald-600 mx-auto flex items-center justify-center">
                <CheckCircle2 className="w-8 h-8" />
              </div>

              <div className="space-y-2">
                <h3 className="text-xl sm:text-2xl font-black text-slate-900">
                  {isKy ? 'Тема ийгиликтүү өздөштүрүлдү!' : 'Тема успешно усвоена!'}
                </h3>
                <p className="text-xs sm:text-sm text-slate-600 max-w-md mx-auto leading-relaxed">
                  {isKy
                    ? 'Сиз теорияны окуп, видео сабакты көрүп жана практикалык тапшырмаларды аткардыңыз. Эгер ката кеткен болсо, алар автоматтык түрдө «Менин каталарым» бөлүмүнө кошулду.'
                    : 'Вы изучили теорию, видеоурок и выполнили разноуровневые задания. Ошибки зафиксированы в разделе «Мои ошибки» для повторения.'}
                </p>
              </div>

              <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
                <button
                  onClick={() => navigate('my-errors')}
                  className="px-5 py-2.5 rounded-xl border border-rose-200 bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold text-xs sm:text-sm transition-colors cursor-pointer"
                >
                  <RotateCcw className="w-4 h-4 inline mr-1.5" />
                  <span>{isKy ? 'Каталарды көрүү' : 'Мои ошибки'}</span>
                </button>

                <button
                  onClick={() => navigate('practice-mock')}
                  className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs sm:text-sm shadow-md shadow-blue-600/20 transition-all cursor-pointer"
                >
                  <span>{isKy ? 'Сынак тест тапшыруу' : 'Пройти пробный тест'}</span>
                  <ArrowRight className="w-4 h-4 inline ml-1.5" />
                </button>
              </div>
            </div>
          )}
        </div>

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
