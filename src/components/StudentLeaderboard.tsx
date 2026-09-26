import React, { useState, useMemo } from 'react';
import { LeaderboardEntry, UserProfile } from '../types';
import {
  Trophy,
  Flame,
  Medal,
  Crown,
  Search,
  ArrowUp,
  Sparkles,
  Award,
  ChevronRight,
  TrendingUp,
  MapPin,
  GraduationCap,
  Play
} from 'lucide-react';
import { getMergedLeaderboard } from '../data/leaderboardData';

interface StudentLeaderboardProps {
  currentUser: UserProfile;
  currentUserPoints: number;
  currentUserStreak: number;
  currentUserBadgesCount: number;
  language: 'ky' | 'ru';
  onStartTraining?: () => void;
}

export const StudentLeaderboard: React.FC<StudentLeaderboardProps> = ({
  currentUser,
  currentUserPoints,
  currentUserStreak,
  currentUserBadgesCount,
  language,
  onStartTraining
}) => {
  const [sortBy, setSortBy] = useState<'points' | 'streak'>('points');
  const [selectedRegion, setSelectedRegion] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const { list: allRanked, currentUserRank } = useMemo(() => {
    return getMergedLeaderboard(
      currentUser,
      currentUserPoints,
      currentUserStreak,
      currentUserBadgesCount,
      sortBy
    );
  }, [currentUser, currentUserPoints, currentUserStreak, currentUserBadgesCount, sortBy]);

  // Filter by region and search
  const filteredList = useMemo(() => {
    return allRanked.filter((item) => {
      const matchesRegion = selectedRegion === 'all' || item.region.includes(selectedRegion);
      const matchesSearch =
        !searchQuery.trim() ||
        item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.school?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.region.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesRegion && matchesSearch;
    });
  }, [allRanked, selectedRegion, searchQuery]);

  const topThree = useMemo(() => {
    return allRanked.slice(0, 3);
  }, [allRanked]);

  const currentUserItem = useMemo(() => {
    return allRanked.find((item) => item.isCurrentUser);
  }, [allRanked]);

  const pointsToNextRank = useMemo(() => {
    if (!currentUserItem || currentUserRank <= 1) return 0;
    const aheadStudent = allRanked[currentUserRank - 2];
    if (!aheadStudent) return 0;
    if (sortBy === 'points') {
      return Math.max(10, aheadStudent.masteryPoints - currentUserItem.masteryPoints + 10);
    } else {
      return Math.max(1, aheadStudent.streakDays - currentUserItem.streakDays + 1);
    }
  }, [currentUserItem, currentUserRank, allRanked, sortBy]);

  const regions = [
    { id: 'all', label: language === 'ky' ? 'Бардык Кыргызстан' : 'Весь Кыргызстан' },
    { id: 'Бишкек', label: 'Бишкек' },
    { id: 'Ош', label: 'Ош' },
    { id: 'Жалал-Абад', label: 'Жалал-Абад' },
    { id: 'Ысык-Көл', label: 'Ысык-Көл' },
    { id: 'Нарын', label: 'Нарын' },
    { id: 'Талас', label: 'Талас' },
    { id: 'Баткен', label: 'Баткен' }
  ];

  return (
    <div id="student-leaderboard-section" className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/90 shadow-sm space-y-6">
      {/* Header and Motivation Bar */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 pb-6 border-b border-slate-100">
        <div className="space-y-1.5">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/10 border border-amber-300 flex items-center justify-center text-amber-600 shadow-xs">
              <Trophy className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg sm:text-xl font-black text-slate-900">
                  {language === 'ky' ? 'ОРТ Лидерборду жана Рейтинг' : 'Рейтинг лидеров подготовки к ОРТ'}
                </h2>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-100 text-blue-800">
                  {language === 'ky' ? 'Түз эфир' : 'Live'}
                </span>
              </div>
              <p className="text-xs text-slate-500 font-medium">
                {language === 'ky'
                  ? 'Өлкө боюнча мыкты окуучулардын рейтинги. Туруктуу машыгуу менен жогору көтөрүлүңүз'
                  : 'Сравните свои успехи с другими абитуриентами Кыргызстана и поднимайтесь в топ'}
              </p>
            </div>
          </div>
        </div>

        {/* Current user placement card */}
        <div className="bg-gradient-to-r from-blue-50/80 via-indigo-50/50 to-white border border-blue-200/90 rounded-2xl p-4 flex items-center justify-between gap-4 min-w-[300px]">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-blue-600 text-white flex flex-col items-center justify-center font-black shadow-sm">
              <span className="text-[10px] uppercase font-bold text-blue-200 leading-none">№</span>
              <span className="text-base leading-none">{currentUserRank}</span>
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-black text-slate-900">
                  {language === 'ky' ? 'Сиздин ордуңуз' : 'Ваше место в рейтинге'}
                </span>
                <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              </div>
              <div className="text-[11px] text-slate-600 font-medium mt-0.5">
                {currentUserItem?.masteryPoints} XP • {currentUserItem?.streakDays} {language === 'ky' ? 'күн серия' : 'дн. серия'}
              </div>
            </div>
          </div>

          {pointsToNextRank > 0 && (
            <div className="text-right">
              <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100/90 px-2 py-0.5 rounded-md border border-emerald-300 inline-block">
                +{pointsToNextRank} {sortBy === 'points' ? 'XP' : (language === 'ky' ? 'күн' : 'дн.')}
              </span>
              <p className="text-[10px] text-slate-500 mt-1">
                {language === 'ky' ? '№' + (currentUserRank - 1) + ' ге жетүүгө' : 'до №' + (currentUserRank - 1)}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Top 3 Podium Visual */}
      {topThree.length >= 3 && (
        <div className="bg-gradient-to-b from-slate-50/80 to-slate-100/60 rounded-3xl p-6 border border-slate-200/80">
          <h3 className="text-center text-xs font-black uppercase tracking-wider text-slate-500 mb-6 flex items-center justify-center gap-2">
            <Crown className="w-4 h-4 text-amber-500" />
            <span>{language === 'ky' ? 'ОРТ алдыңкы үчтүгү' : 'Тройка лидеров ОРТ'}</span>
          </h3>

          <div className="grid grid-cols-3 gap-2 sm:gap-4 max-w-2xl mx-auto items-end pt-2">
            {/* 2nd Place */}
            <div className="flex flex-col items-center text-center">
              <div className="relative mb-2">
                <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-gradient-to-br from-slate-200 to-slate-300 border-2 border-slate-300 flex items-center justify-center text-xl sm:text-2xl shadow-sm">
                  🥈
                </div>
                <div className="absolute -top-2 -right-1 bg-slate-700 text-white text-[10px] font-black w-5 h-5 rounded-full flex items-center justify-center border border-white">
                  2
                </div>
              </div>
              <h4 className="font-bold text-xs sm:text-sm text-slate-900 truncate max-w-[100px] sm:max-w-none">
                {topThree[1].name}
              </h4>
              <p className="text-[10px] text-slate-500 truncate max-w-[100px] sm:max-w-none">
                {topThree[1].region}
              </p>
              <div className="mt-1 flex items-center gap-1 text-[11px] font-black text-slate-700">
                {sortBy === 'points' ? `${topThree[1].masteryPoints} XP` : `${topThree[1].streakDays} ${language === 'ky' ? 'күн' : 'дн.'}`}
              </div>
              {/* Podium Base */}
              <div className="w-full h-16 sm:h-20 bg-slate-200/90 rounded-t-2xl mt-3 flex items-center justify-center font-black text-slate-500 text-sm sm:text-base border-t border-x border-slate-300">
                2
              </div>
            </div>

            {/* 1st Place (Winner) */}
            <div className="flex flex-col items-center text-center -mt-4">
              <Crown className="w-6 h-6 text-amber-500 animate-bounce mb-1" />
              <div className="relative mb-2">
                <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-3xl bg-gradient-to-br from-amber-300 via-amber-400 to-yellow-500 border-2 border-amber-300 flex items-center justify-center text-2xl sm:text-3xl shadow-lg shadow-amber-500/20 ring-4 ring-amber-400/20">
                  🥇
                </div>
                <div className="absolute -top-2 -right-1 bg-amber-600 text-white text-xs font-black w-6 h-6 rounded-full flex items-center justify-center border-2 border-white shadow-xs">
                  1
                </div>
              </div>
              <h4 className="font-black text-xs sm:text-sm text-slate-900 truncate max-w-[110px] sm:max-w-none">
                {topThree[0].name}
              </h4>
              <p className="text-[10px] text-slate-500 truncate max-w-[110px] sm:max-w-none">
                {topThree[0].region}
              </p>
              <div className="mt-1 flex items-center gap-1 text-xs font-black text-amber-700 bg-amber-100/90 px-2 py-0.5 rounded-lg border border-amber-300">
                {sortBy === 'points' ? `${topThree[0].masteryPoints} XP` : `${topThree[0].streakDays} ${language === 'ky' ? 'күн' : 'дн.'}`}
              </div>
              {/* Podium Base */}
              <div className="w-full h-24 sm:h-28 bg-gradient-to-b from-amber-200/90 to-amber-100/90 rounded-t-2xl mt-3 flex items-center justify-center font-black text-amber-900 text-lg sm:text-xl border-t border-x border-amber-300 shadow-xs">
                1
              </div>
            </div>

            {/* 3rd Place */}
            <div className="flex flex-col items-center text-center">
              <div className="relative mb-2">
                <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-gradient-to-br from-orange-200 to-amber-300 border-2 border-orange-200 flex items-center justify-center text-xl sm:text-2xl shadow-sm">
                  🥉
                </div>
                <div className="absolute -top-2 -right-1 bg-orange-700 text-white text-[10px] font-black w-5 h-5 rounded-full flex items-center justify-center border border-white">
                  3
                </div>
              </div>
              <h4 className="font-bold text-xs sm:text-sm text-slate-900 truncate max-w-[100px] sm:max-w-none">
                {topThree[2].name}
              </h4>
              <p className="text-[10px] text-slate-500 truncate max-w-[100px] sm:max-w-none">
                {topThree[2].region}
              </p>
              <div className="mt-1 flex items-center gap-1 text-[11px] font-black text-slate-700">
                {sortBy === 'points' ? `${topThree[2].masteryPoints} XP` : `${topThree[2].streakDays} ${language === 'ky' ? 'күн' : 'дн.'}`}
              </div>
              {/* Podium Base */}
              <div className="w-full h-12 sm:h-16 bg-orange-100/90 rounded-t-2xl mt-3 flex items-center justify-center font-black text-orange-900 text-sm sm:text-base border-t border-x border-orange-200">
                3
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Metric Sort and Search Filters */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        {/* Metric selection pills */}
        <div className="flex items-center gap-2 bg-slate-100 p-1 rounded-2xl shrink-0">
          <button
            onClick={() => setSortBy('points')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              sortBy === 'points'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Trophy className="w-3.5 h-3.5 text-amber-500" />
            <span>{language === 'ky' ? 'Мастерство (XP)' : 'Очки мастерства'}</span>
          </button>

          <button
            onClick={() => setSortBy('streak')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              sortBy === 'streak'
                ? 'bg-white text-amber-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Flame className="w-3.5 h-3.5 text-amber-500" />
            <span>{language === 'ky' ? 'Окуу сериясы (Стрик)' : 'Серии занятий'}</span>
          </button>
        </div>

        {/* Search bar & Region dropdown */}
        <div className="flex items-center gap-2.5 flex-1 max-w-md">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={language === 'ky' ? 'Окуучуну же мектепти издөө...' : 'Поиск ученика или школы...'}
              className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 placeholder:text-slate-400 focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
            />
          </div>

          <select
            value={selectedRegion}
            onChange={(e) => setSelectedRegion(e.target.value)}
            className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 focus:outline-hidden focus:border-blue-500 cursor-pointer"
          >
            {regions.map((r) => (
              <option key={r.id} value={r.id}>
                {r.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Leaderboard Table */}
      <div className="overflow-x-auto rounded-2xl border border-slate-200/90">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50/80 border-b border-slate-200 text-[11px] font-black uppercase text-slate-500 tracking-wider">
              <th className="py-3 px-4 w-16 text-center">{language === 'ky' ? 'Орун' : 'Место'}</th>
              <th className="py-3 px-4">{language === 'ky' ? 'Окуучу жана мектеп' : 'Абитуриент и школа'}</th>
              <th className="py-3 px-4 text-center">{language === 'ky' ? 'Серия' : 'Серия'}</th>
              <th className="py-3 px-4 text-center">{language === 'ky' ? 'Бейджиктер' : 'Значки'}</th>
              <th className="py-3 px-4 text-right">
                {sortBy === 'points' ? (language === 'ky' ? 'Мастерство (XP)' : 'Очки мастерства') : (language === 'ky' ? 'Серия (күн)' : 'Серия (дней)')}
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-xs">
            {filteredList.map((entry) => {
              const isTop1 = entry.rank === 1;
              const isTop2 = entry.rank === 2;
              const isTop3 = entry.rank === 3;
              const isCurrent = entry.isCurrentUser;

              return (
                <tr
                  key={entry.id}
                  className={`transition-colors ${
                    isCurrent
                      ? 'bg-blue-50/80 font-semibold ring-1 ring-blue-300'
                      : 'hover:bg-slate-50/60'
                  }`}
                >
                  {/* Rank Column */}
                  <td className="py-3.5 px-4 text-center">
                    {isTop1 ? (
                      <span className="inline-flex items-center justify-center w-7 h-7 rounded-xl bg-amber-400 text-amber-950 font-black text-xs shadow-xs">
                        🥇
                      </span>
                    ) : isTop2 ? (
                      <span className="inline-flex items-center justify-center w-7 h-7 rounded-xl bg-slate-300 text-slate-800 font-black text-xs shadow-xs">
                        🥈
                      </span>
                    ) : isTop3 ? (
                      <span className="inline-flex items-center justify-center w-7 h-7 rounded-xl bg-orange-300 text-orange-950 font-black text-xs shadow-xs">
                        🥉
                      </span>
                    ) : (
                      <span className="inline-flex items-center justify-center w-6 h-6 rounded-lg text-slate-500 font-black text-xs">
                        {entry.rank}
                      </span>
                    )}
                  </td>

                  {/* Student info */}
                  <td className="py-3.5 px-4">
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-9 h-9 rounded-xl flex items-center justify-center font-black text-xs shrink-0 ${
                          isCurrent
                            ? 'bg-blue-600 text-white shadow-xs'
                            : isTop1
                            ? 'bg-amber-100 text-amber-800 border border-amber-300'
                            : 'bg-slate-100 text-slate-700'
                        }`}
                      >
                        {entry.name.slice(0, 1)}
                      </div>

                      <div className="space-y-0.5">
                        <div className="flex items-center gap-2">
                          <span className={`font-bold text-slate-900 ${isCurrent ? 'text-blue-900 font-black' : ''}`}>
                            {entry.name}
                          </span>
                          {isCurrent && (
                            <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-blue-600 text-white">
                              {language === 'ky' ? 'Сиз' : 'Вы'}
                            </span>
                          )}
                          {entry.predictedScore >= 200 && (
                            <span className="text-[10px] font-bold text-amber-700 bg-amber-50 border border-amber-200 px-1.5 py-0.2 rounded">
                              ОРТ 200+
                            </span>
                          )}
                        </div>

                        <div className="flex items-center gap-2 text-[11px] text-slate-500">
                          <span className="flex items-center gap-1">
                            <MapPin className="w-3 h-3 text-slate-400" />
                            <span>{entry.region}</span>
                          </span>
                          {entry.school && (
                            <>
                              <span>•</span>
                              <span className="truncate max-w-[200px] sm:max-w-xs">{entry.school}</span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  </td>

                  {/* Streak */}
                  <td className="py-3.5 px-4 text-center">
                    <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 font-black text-xs">
                      <Flame className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                      <span>{entry.streakDays}</span>
                    </div>
                  </td>

                  {/* Badges Count */}
                  <td className="py-3.5 px-4 text-center">
                    <div className="inline-flex items-center gap-1 text-slate-700 font-bold text-xs">
                      <Award className="w-3.5 h-3.5 text-indigo-500" />
                      <span>{entry.badgesCount}</span>
                    </div>
                  </td>

                  {/* Points / Metric */}
                  <td className="py-3.5 px-4 text-right">
                    <span className="font-black text-sm text-slate-900">
                      {sortBy === 'points' ? `${entry.masteryPoints} XP` : `${entry.streakDays} ${language === 'ky' ? 'күн' : 'дней'}`}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Bottom Motivation and CTA */}
      <div className="p-4 rounded-2xl bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-sm">
        <div className="space-y-0.5">
          <h4 className="font-black text-sm flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-amber-300" />
            <span>
              {language === 'ky'
                ? 'Рейтингди көтөрүп, лидерлер катарына кошулуңуз!'
                : 'Повышайте свой рейтинг и входите в топ абитуриентов!'}
            </span>
          </h4>
          <p className="text-xs text-blue-100">
            {language === 'ky'
              ? 'Ар бир туура чыгарылган ОРТ суроосу жана күнүмдүк машыгуу сизге кошумча XP упайларын алып келет.'
              : 'Каждая решенная задача ОРТ и сохранение серии занятий добавляют вам очки опыта и поднимают в таблице.'}
          </p>
        </div>

        {onStartTraining && (
          <button
            onClick={onStartTraining}
            className="px-5 py-2.5 rounded-xl bg-white text-blue-700 hover:bg-blue-50 font-black text-xs sm:text-sm shadow-md transition-all shrink-0 flex items-center justify-center gap-2 cursor-pointer"
          >
            <Play className="w-4 h-4 fill-blue-700" />
            <span>{language === 'ky' ? 'Тест чыгарууну баштоо' : 'Решать задания'}</span>
          </button>
        )}
      </div>
    </div>
  );
};
