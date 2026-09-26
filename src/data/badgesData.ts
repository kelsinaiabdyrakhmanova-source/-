import { Badge, LocalizedString, UserProfile } from '../types';

export interface StudentLevelInfo {
  level: number;
  title: LocalizedString;
  currentXp: number;
  nextLevelXp: number;
  progressPercent: number;
}

export const initialBadges: Badge[] = [
  // --- DAILY STUDY STREAKS ---
  {
    id: 'streak-1',
    category: 'streak',
    tier: 'bronze',
    icon: '⚡',
    title: { ky: 'Биринчи учкун', ru: 'Первая искра' },
    description: {
      ky: 'ОРТга даярдыкты баштоо үчүн 1 күн толук тапшырма аткардыңыз',
      ru: 'Выполнили все запланированные задания за 1 день'
    },
    requirementText: {
      ky: '1 күн катары менен окуп, тапшырмаларды аткарыңыз',
      ru: 'Занимайтесь хотя бы 1 день подряд'
    },
    rewardXp: 25,
    isUnlocked: true,
    isClaimed: true,
    unlockedAt: '2026-09-18',
    currentProgress: 1,
    maxProgress: 1,
    progressUnit: { ky: 'күн', ru: 'дн.' }
  },
  {
    id: 'streak-3',
    category: 'streak',
    tier: 'bronze',
    icon: '🔥',
    title: { ky: 'Үзгүлтүксүз адат', ru: 'Привычка учиться' },
    description: {
      ky: '3 күн тынымсыз машыгуу сериясын кармадыңыз',
      ru: 'Успешная серия занятий в течение 3 дней подряд'
    },
    requirementText: {
      ky: '3 күн катары менен окуп, ударный режимди сактаңыз',
      ru: 'Занимайтесь 3 дня подряд без перерывов'
    },
    rewardXp: 60,
    isUnlocked: true,
    isClaimed: true,
    unlockedAt: '2026-09-20',
    currentProgress: 3,
    maxProgress: 3,
    progressUnit: { ky: 'күн', ru: 'дн.' }
  },
  {
    id: 'streak-7',
    category: 'streak',
    tier: 'silver',
    icon: '⚡️',
    title: { ky: 'ОРТ Жалыны', ru: 'Огонь ОРТ' },
    description: {
      ky: 'Бир жума (7 күн) толук үзгүлтүксүз даярдык режиминдесиз!',
      ru: 'Целая неделя (7 дней подряд) непрерывной подготовки к ОРТ!'
    },
    requirementText: {
      ky: '7 күн катары менен даярданыңыз',
      ru: 'Достигните 7 дней ударного режима подряд'
    },
    rewardXp: 120,
    isUnlocked: false,
    isClaimed: false,
    currentProgress: 4,
    maxProgress: 7,
    progressUnit: { ky: 'күн', ru: 'дн.' }
  },
  {
    id: 'streak-14',
    category: 'streak',
    tier: 'gold',
    icon: '🛡️',
    title: { ky: 'Темирдей тартип', ru: 'Стальная дисциплина' },
    description: {
      ky: '2 жума бою күн сайын туруктуу машыктыңыз',
      ru: '14 дней ежедневных практических тренировок без единого пропуска'
    },
    requirementText: {
      ky: '14 күн катары менен окуу графигин бузбаңыз',
      ru: 'Удерживайте серию занятий 14 дней подряд'
    },
    rewardXp: 250,
    isUnlocked: false,
    isClaimed: false,
    currentProgress: 4,
    maxProgress: 14,
    progressUnit: { ky: 'күн', ru: 'дн.' }
  },
  {
    id: 'streak-30',
    category: 'streak',
    tier: 'diamond',
    icon: '👑',
    title: { ky: 'ОРТ Легендасы', ru: 'Легенда ОРТ' },
    description: {
      ky: '1 ай (30 күн) катары менен туруктуу билим алган лидер!',
      ru: 'Месяц непрерывной дисциплины — признак будущего обладателя гранта!'
    },
    requirementText: {
      ky: '30 күндүк максималдуу окуу сериясына жетиңиз',
      ru: 'Занимайтесь 30 дней подряд'
    },
    rewardXp: 500,
    isUnlocked: false,
    isClaimed: false,
    currentProgress: 4,
    maxProgress: 30,
    progressUnit: { ky: 'күн', ru: 'дн.' }
  },

  // --- ORT TOPIC MASTERY ---
  {
    id: 'topic-math-powers',
    category: 'topic_mastery',
    tier: 'bronze',
    icon: '📐',
    title: { ky: 'Даражалар чебери', ru: 'Мастер степеней и корней' },
    description: {
      ky: 'Математикадан даражалар жана сандардын касиеттери боюнча теманы өздөштүрдүңүз',
      ru: 'Успешно освоена тема степеней, корней и свойств чисел'
    },
    requirementText: {
      ky: '«Даражалар жана тамырлар» темасынан 10+ суроону так чыгарыңыз',
      ru: 'Правильно решите 10+ задач по теме «Степени и корни»'
    },
    rewardXp: 90,
    isUnlocked: false,
    isClaimed: false,
    currentProgress: 7,
    maxProgress: 10,
    progressUnit: { ky: 'суроо', ru: 'задач' },
    relatedSubjectId: 'math',
    relatedTopicName: 'Даражалар жана тамырлар'
  },
  {
    id: 'topic-math-fractions',
    category: 'topic_mastery',
    tier: 'silver',
    icon: '📊',
    title: { ky: 'Проценттер туусу', ru: 'Знаток процентов и скидок' },
    description: {
      ky: 'Проценттер, катыштар жана тексттик экономикалык маселелерди толук багындырдыңыз',
      ru: 'Безошибочное решение задач на проценты, скидки и пропорции'
    },
    requirementText: {
      ky: '«Проценттер жана арзандатуулар» темасынан 15 суроого туура жооп бериңиз',
      ru: 'Решите 15 задач по теме «Проценты и скидки» с точностью 85%+'
    },
    rewardXp: 140,
    isUnlocked: true,
    isClaimed: true,
    unlockedAt: '2026-09-19',
    currentProgress: 15,
    maxProgress: 15,
    progressUnit: { ky: 'суроо', ru: 'задач' },
    relatedSubjectId: 'math',
    relatedTopicName: 'Проценттер жана арзандатуулар'
  },
  {
    id: 'topic-math-geometry',
    category: 'topic_mastery',
    tier: 'gold',
    icon: '📏',
    title: { ky: 'Геометрия рыцары', ru: 'Рыцарь геометрии ОРТ' },
    description: {
      ky: 'Аянттар, бурчтар жана чоңдуктарды салыштыруу (колонкалар) темасын өздөштүрдүңүз',
      ru: 'Освоены сравнения величин (колонки) и планиметрия ОРТ'
    },
    requirementText: {
      ky: 'Колонкаларды салыштыруу жана фигуралардан 20 тапшырманы чыгарыңыз',
      ru: 'Решите 20 задач на геометрию и сравнение колонок'
    },
    rewardXp: 200,
    isUnlocked: false,
    isClaimed: false,
    currentProgress: 12,
    maxProgress: 20,
    progressUnit: { ky: 'суроо', ru: 'задач' },
    relatedSubjectId: 'math',
    relatedTopicName: 'Чоңдуктарды салыштыруу'
  },
  {
    id: 'topic-analogies-part-whole',
    category: 'topic_mastery',
    tier: 'silver',
    icon: '🧩',
    title: { ky: 'Бөлүк жана бүтүн', ru: 'Мастер: Часть и целое' },
    description: {
      ky: 'Окшоштуктар бөлүмүндө элемент жана бүтүн логикалык байланышын кемчиликсиз табасыз',
      ru: 'Идеальное определение отношений «элемент / часть : целое» в аналогиях'
    },
    requirementText: {
      ky: '«Бөлүк жана бүтүн» тибиндеги 15 аналогияны туура белгилеңиз',
      ru: 'Правильно решите 15 пар аналогий типа «Часть и целое»'
    },
    rewardXp: 130,
    isUnlocked: true,
    isClaimed: false, // Ready to claim!
    unlockedAt: '2026-09-21',
    currentProgress: 15,
    maxProgress: 15,
    progressUnit: { ky: 'жуп', ru: 'пар' },
    relatedSubjectId: 'analogies',
    relatedTopicName: 'Бөлүк жана бүтүн'
  },
  {
    id: 'topic-analogies-cause-effect',
    category: 'topic_mastery',
    tier: 'gold',
    icon: '🎯',
    title: { ky: 'Себеп жана натыйжа', ru: 'Причина и следствие' },
    description: {
      ky: 'Аналогиялардагы татаал себептик байланыштарды жаңылбай чечүү чеберчилиги',
      ru: 'Уверенное нахождение причинно-следственных цепочек в аналогиях'
    },
    requirementText: {
      ky: '«Себеп жана натыйжа» байланышы боюнча 15 аналогия чыгарыңыз',
      ru: 'Решите 15 заданий на причинно-следственные связи'
    },
    rewardXp: 180,
    isUnlocked: false,
    isClaimed: false,
    currentProgress: 9,
    maxProgress: 15,
    progressUnit: { ky: 'жуп', ru: 'пар' },
    relatedSubjectId: 'analogies',
    relatedTopicName: 'Себеп жана натыйжа'
  },
  {
    id: 'topic-reading-main-idea',
    category: 'topic_mastery',
    tier: 'silver',
    icon: '📖',
    title: { ky: 'Тексттин өзөгү', ru: 'Смысловой аналитик' },
    description: {
      ky: 'Окуп түшүнүү бөлүмүндө тексттин башкы тезисин жана автордук аргументти табуу',
      ru: 'Умение быстро выделять главную мысль и авторский тезис в сложных текстах'
    },
    requirementText: {
      ky: 'Окуп түшүнүүдөн 10 илимий жана публицистикалык текстти талдаңыз',
      ru: 'Успешно разберите 10 фрагментов на понимание сути текста'
    },
    rewardXp: 150,
    isUnlocked: true,
    isClaimed: true,
    unlockedAt: '2026-09-20',
    currentProgress: 10,
    maxProgress: 10,
    progressUnit: { ky: 'текст', ru: 'текстов' },
    relatedSubjectId: 'reading',
    relatedTopicName: 'Негизги ойду табуу'
  },
  {
    id: 'exam-mistake-slayer',
    category: 'exam_milestone',
    tier: 'silver',
    icon: '🔄',
    title: { ky: 'Катасыз сапар', ru: 'Победитель ошибок' },
    description: {
      ky: 'Каталар менен иштөө бөлүмүндөгү суроолорду кайра ийгиликтүү чечтиңиз',
      ru: 'Разобрали и повторно решили допущенные ошибки в тестах'
    },
    requirementText: {
      ky: 'Каталар тизмесинен 3 катаны кайра туура чыгарыңыз',
      ru: 'Исправьте 3 свои ошибки через режим работы над ошибками'
    },
    rewardXp: 110,
    isUnlocked: false,
    isClaimed: false,
    currentProgress: 1,
    maxProgress: 3,
    progressUnit: { ky: 'ката', ru: 'ошибок' }
  },
  {
    id: 'exam-gold-candidate',
    category: 'exam_milestone',
    tier: 'diamond',
    icon: '💎',
    title: { ky: 'Алтын Сертификат', ru: 'Золотой претендент' },
    description: {
      ky: 'Болжолдуу ОРТ баллыңыз 200дөн ашып, республикалык грант деңгээлине жетти',
      ru: 'Прогнозируемый балл ОРТ превысил планку в 200 баллов'
    },
    requirementText: {
      ky: 'Пробный тесттердин орточо жыйынтыгын 200+ баллга чыгарыңыз',
      ru: 'Достигните ориентировочного балла 200+'
    },
    rewardXp: 500,
    isUnlocked: false,
    isClaimed: false,
    currentProgress: 145,
    maxProgress: 200,
    progressUnit: { ky: 'балл', ru: 'баллов' }
  }
];

export function calculateStudentLevel(totalXp: number): StudentLevelInfo {
  if (totalXp < 100) {
    return {
      level: 1,
      title: { ky: 'Жаңы баштоочу', ru: 'Новичок ОРТ' },
      currentXp: totalXp,
      nextLevelXp: 100,
      progressPercent: Math.min(100, Math.round((totalXp / 100) * 100))
    };
  } else if (totalXp < 300) {
    return {
      level: 2,
      title: { ky: 'Аракетчил абитуриент', ru: 'Целеустремленный абитуриент' },
      currentXp: totalXp,
      nextLevelXp: 300,
      progressPercent: Math.min(100, Math.round(((totalXp - 100) / 200) * 100))
    };
  } else if (totalXp < 600) {
    return {
      level: 3,
      title: { ky: 'Билимдүү студент', ru: 'Уверенный практик' },
      currentXp: totalXp,
      nextLevelXp: 600,
      progressPercent: Math.min(100, Math.round(((totalXp - 300) / 300) * 100))
    };
  } else if (totalXp < 1000) {
    return {
      level: 4,
      title: { ky: 'ОРТ Эксперти', ru: 'Знаток заданий ОРТ' },
      currentXp: totalXp,
      nextLevelXp: 1000,
      progressPercent: Math.min(100, Math.round(((totalXp - 600) / 400) * 100))
    };
  } else if (totalXp < 2000) {
    return {
      level: 5,
      title: { ky: 'Алтын сертификат талапкери', ru: 'Претендент на Золотой сертификат' },
      currentXp: totalXp,
      nextLevelXp: 2000,
      progressPercent: Math.min(100, Math.round(((totalXp - 1000) / 1000) * 100))
    };
  } else {
    return {
      level: 6,
      title: { ky: 'ОРТ Гроссмейстери', ru: 'Гроссмейстер ОРТ' },
      currentXp: totalXp,
      nextLevelXp: totalXp,
      progressPercent: 100
    };
  }
}

export function syncBadgesWithProgress(
  badges: Badge[],
  student: UserProfile,
  repairedMistakesCount: number = 0
): Badge[] {
  return badges.map((badge) => {
    let currentProgress = badge.currentProgress;
    let isUnlocked = badge.isUnlocked;

    // Streaks
    if (badge.category === 'streak') {
      currentProgress = Math.max(badge.currentProgress, student.streakDays || 0);
      if (currentProgress >= badge.maxProgress) {
        isUnlocked = true;
      }
    }

    // Repaired mistakes
    if (badge.id === 'exam-mistake-slayer') {
      currentProgress = Math.max(badge.currentProgress, repairedMistakesCount);
      if (currentProgress >= badge.maxProgress) {
        isUnlocked = true;
      }
    }

    // Gold Certificate
    if (badge.id === 'exam-gold-candidate') {
      currentProgress = Math.max(badge.currentProgress, student.predictedScore || 145);
      if (currentProgress >= badge.maxProgress) {
        isUnlocked = true;
      }
    }

    // Strong topics matching
    if (badge.relatedTopicName) {
      const isMastered = student.strongTopics?.some((st) =>
        st.toLowerCase().includes(badge.relatedTopicName!.toLowerCase())
      );
      if (isMastered) {
        currentProgress = badge.maxProgress;
        isUnlocked = true;
      }
    }

    return {
      ...badge,
      currentProgress: Math.min(currentProgress, badge.maxProgress),
      isUnlocked,
      unlockedAt: isUnlocked && !badge.unlockedAt ? new Date().toISOString().split('T')[0] : badge.unlockedAt
    };
  });
}
