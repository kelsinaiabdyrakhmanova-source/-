import { LeaderboardEntry, UserProfile } from '../types';

export const initialLeaderboardStudents: LeaderboardEntry[] = [
  {
    id: 'lead-1',
    name: 'Адинай Бакасова',
    region: 'Бишкек ш.',
    school: '№61 физика-математикалык лицейи',
    grade: '11-класс',
    masteryPoints: 1840,
    streakDays: 26,
    badgesCount: 11,
    predictedScore: 218
  },
  {
    id: 'lead-2',
    name: 'Элмирбек Жумалиев',
    region: 'Ош ш.',
    school: '«Сапат» балдар лицейи',
    grade: '11-класс',
    masteryPoints: 1620,
    streakDays: 21,
    badgesCount: 9,
    predictedScore: 212
  },
  {
    id: 'lead-3',
    name: 'Нурсултан Касымов',
    region: 'Жалал-Абад',
    school: 'Курманбек баатыр лицейи',
    grade: '11-класс',
    masteryPoints: 1450,
    streakDays: 18,
    badgesCount: 8,
    predictedScore: 205
  },
  {
    id: 'lead-4',
    name: 'Айпери Темирбекова',
    region: 'Бишкек ш.',
    school: '№70 мектеп-гимназия',
    grade: '11-класс',
    masteryPoints: 1290,
    streakDays: 15,
    badgesCount: 7,
    predictedScore: 198
  },
  {
    id: 'lead-5',
    name: 'Бектур Исмаилов',
    region: 'Ысык-Көл',
    school: 'Каракол ш. Х.Карасаев лицейи',
    grade: '11-класс',
    masteryPoints: 980,
    streakDays: 12,
    badgesCount: 6,
    predictedScore: 192
  },
  {
    id: 'lead-6',
    name: 'Бегимай Садыкова',
    region: 'Нарын ш.',
    school: '№1 Токтогул гимназиясы',
    grade: '11-класс',
    masteryPoints: 860,
    streakDays: 10,
    badgesCount: 5,
    predictedScore: 188
  },
  {
    id: 'lead-7',
    name: 'Дастан Мамытов',
    region: 'Талас ш.',
    school: '«Манас-Ата» балдар лицейи',
    grade: '11-класс',
    masteryPoints: 740,
    streakDays: 9,
    badgesCount: 5,
    predictedScore: 182
  },
  {
    id: 'lead-8',
    name: 'Салтанат Асанова',
    region: 'Баткен ш.',
    school: 'Кызыл-Кыя инновациялык лицейи',
    grade: '11-класс',
    masteryPoints: 620,
    streakDays: 7,
    badgesCount: 4,
    predictedScore: 176
  },
  {
    id: 'lead-9',
    name: 'Арсен Эркинов',
    region: 'Бишкек ш.',
    school: '№29 экологиялык гимназия',
    grade: '11-класс',
    masteryPoints: 480,
    streakDays: 6,
    badgesCount: 4,
    predictedScore: 168
  },
  {
    id: 'lead-10',
    name: 'Каныкей Осмонова',
    region: 'Ош ш.',
    school: 'Ага Хан мектеп-лицейи',
    grade: '11-класс',
    masteryPoints: 390,
    streakDays: 5,
    badgesCount: 3,
    predictedScore: 162
  }
];

export function getMergedLeaderboard(
  currentUser: UserProfile,
  currentUserPoints: number,
  currentUserStreak: number,
  currentUserBadgesCount: number,
  sortBy: 'points' | 'streak' = 'points'
): { list: (LeaderboardEntry & { rank: number })[]; currentUserRank: number } {
  // Current student entry
  const currentEntry: LeaderboardEntry = {
    id: currentUser.id || 'current-student',
    name: currentUser.fullName || 'Азамат Султанов',
    region: 'Бишкек ш.',
    school: '№13 мектеп-гимназия',
    grade: currentUser.grade || '11-класс',
    masteryPoints: Math.max(currentUserPoints, 420),
    streakDays: currentUserStreak || currentUser.streakDays || 4,
    badgesCount: currentUserBadgesCount || 4,
    predictedScore: currentUser.predictedScore || 145,
    isCurrentUser: true
  };

  const pool = [...initialLeaderboardStudents, currentEntry];

  // Sort by selected metric
  pool.sort((a, b) => {
    if (sortBy === 'streak') {
      if (b.streakDays !== a.streakDays) {
        return b.streakDays - a.streakDays;
      }
      return b.masteryPoints - a.masteryPoints;
    } else {
      if (b.masteryPoints !== a.masteryPoints) {
        return b.masteryPoints - a.masteryPoints;
      }
      return b.streakDays - a.streakDays;
    }
  });

  // Assign ranks
  const rankedList = pool.map((item, idx) => ({
    ...item,
    rank: idx + 1
  }));

  const userRankObj = rankedList.find((item) => item.isCurrentUser);
  const currentUserRank = userRankObj ? userRankObj.rank : rankedList.length;

  return {
    list: rankedList,
    currentUserRank
  };
}
