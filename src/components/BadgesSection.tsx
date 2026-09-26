import React, { useState, useMemo } from 'react';
import { Badge, BadgeCategory, BadgeTier, SubjectId, UserProfile } from '../types';
import {
  Award,
  Flame,
  Sparkles,
  CheckCircle2,
  Lock,
  ArrowRight,
  Target,
  Zap,
  Gift,
  Check,
  X,
  BookOpen,
  ChevronRight,
  TrendingUp,
  Shield,
  Crown
} from 'lucide-react';
import { calculateStudentLevel, StudentLevelInfo } from '../data/badgesData';

interface BadgesSectionProps {
  badges: Badge[];
  student: UserProfile;
  language: 'ky' | 'ru';
  t: any;
  onClaimBadge: (badgeId: string) => void;
  onIncrementStreak?: () => void;
  onNavigateToTopic?: (subjectId?: SubjectId, topicName?: string) => void;
}

export const BadgesSection: React.FC<BadgesSectionProps> = ({
  badges,
  student,
  language,
  t,
  onClaimBadge,
  onIncrementStreak,
  onNavigateToTopic
}) => {
  const [selectedCategory, setSelectedCategory] = useState<'all' | BadgeCategory | 'unlocked' | 'locked'>('all');
  const [activeBadgeModal, setActiveBadgeModal] = useState<Badge | null>(null);
  const [celebratingBadge, setCelebratingBadge] = useState<Badge | null>(null);

  // Calculate total XP and level
  const totalXp = useMemo(() => {
    return badges
      .filter((b) => b.isClaimed)
      .reduce((sum, b) => sum + b.rewardXp, 0);
  }, [badges]);

  const levelInfo: StudentLevelInfo = useMemo(() => {
    return calculateStudentLevel(totalXp);
  }, [totalXp]);

  const unclaimedCount = useMemo(() => {
    return badges.filter((b) => b.isUnlocked && !b.isClaimed).length;
  }, [badges]);

  const unlockedCount = useMemo(() => {
    return badges.filter((b) => b.isUnlocked).length;
  }, [badges]);

  // Filtered badges
  const filteredBadges = useMemo(() => {
    return badges.filter((b) => {
      if (selectedCategory === 'all') return true;
      if (selectedCategory === 'unlocked') return b.isUnlocked;
      if (selectedCategory === 'locked') return !b.isUnlocked;
      return b.category === selectedCategory;
    });
  }, [badges, selectedCategory]);

  const handleClaim = (badge: Badge, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (!badge.isUnlocked || badge.isClaimed) return;
    onClaimBadge(badge.id);
    setCelebratingBadge(badge);
  };

  const getTierStyles = (tier: BadgeTier, isUnlocked: boolean) => {
    if (!isUnlocked) {
      return {
        badgeBg: 'bg-slate-100 text-slate-400 border-slate-200',
        cardBorder: 'border-slate-200/90 hover:border-slate-300',
        cardBg: 'bg-white/80 opacity-90',
        pill: 'bg-slate-100 text-slate-500 border-slate-200',
        accentText: 'text-slate-400',
        glow: ''
      };
    }

    switch (tier) {
      case 'diamond':
        return {
          badgeBg: 'bg-gradient-to-br from-cyan-400 via-blue-500 to-indigo-600 text-white shadow-md shadow-cyan-500/30',
          cardBorder: 'border-cyan-300 shadow-md shadow-cyan-500/10',
          cardBg: 'bg-gradient-to-b from-cyan-50/60 via-white to-white',
          pill: 'bg-cyan-100 text-cyan-900 border-cyan-300 font-bold',
          accentText: 'text-cyan-700',
          glow: 'ring-2 ring-cyan-400/40'
        };
      case 'gold':
        return {
          badgeBg: 'bg-gradient-to-br from-amber-300 via-amber-400 to-yellow-600 text-amber-950 shadow-md shadow-amber-400/30',
          cardBorder: 'border-amber-300 shadow-md shadow-amber-500/10',
          cardBg: 'bg-gradient-to-b from-amber-50/50 via-white to-white',
          pill: 'bg-amber-100 text-amber-900 border-amber-300 font-bold',
          accentText: 'text-amber-700',
          glow: 'ring-2 ring-amber-400/40'
        };
      case 'silver':
        return {
          badgeBg: 'bg-gradient-to-br from-slate-200 via-slate-300 to-slate-400 text-slate-800 shadow-sm shadow-slate-400/20',
          cardBorder: 'border-slate-300 shadow-sm',
          cardBg: 'bg-gradient-to-b from-slate-50/70 via-white to-white',
          pill: 'bg-slate-100 text-slate-800 border-slate-300 font-bold',
          accentText: 'text-slate-700',
          glow: ''
        };
      case 'bronze':
      default:
        return {
          badgeBg: 'bg-gradient-to-br from-orange-200 via-amber-300 to-orange-400 text-orange-950 shadow-sm',
          cardBorder: 'border-orange-200/90 shadow-sm',
          cardBg: 'bg-gradient-to-b from-orange-50/40 via-white to-white',
          pill: 'bg-orange-100 text-orange-900 border-orange-200 font-bold',
          accentText: 'text-orange-700',
          glow: ''
        };
    }
  };

  const getTierName = (tier: BadgeTier) => {
    switch (tier) {
      case 'diamond':
        return language === 'ky' ? 'Алмаз' : 'Алмаз';
      case 'gold':
        return language === 'ky' ? 'Алтын' : 'Золото';
      case 'silver':
        return language === 'ky' ? 'Күмүш' : 'Серебро';
      case 'bronze':
      default:
        return language === 'ky' ? 'Коло' : 'Бронза';
    }
  };

  return (
    <div id="student-badges-system" className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/90 shadow-sm space-y-6">
      {/* Header with Level Progression Bar and Badges Overview */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 pb-6 border-b border-slate-100">
        <div className="space-y-2">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/10 border border-amber-300 flex items-center justify-center text-amber-600 shadow-xs">
              <Award className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg sm:text-xl font-black text-slate-900">
                  {language === 'ky' ? 'Санариптик сыйлыктар жана бейджиктер' : 'Цифровые награды и значки ОРТ'}
                </h2>
                {unclaimedCount > 0 && (
                  <span className="animate-pulse px-2.5 py-0.5 rounded-full text-xs font-black bg-emerald-500 text-white shadow-xs">
                    +{unclaimedCount} {language === 'ky' ? 'сыйлык!' : 'награды!'}
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-500 font-medium">
                {language === 'ky'
                  ? 'Күнүмдүк окуу серияларын жана ОРТ темаларын багындырып, сыйлыктарды топтоңуз'
                  : 'Занимайтесь каждый день и осваивайте темы ОРТ, чтобы получать награды и повышать ранг'}
              </p>
            </div>
          </div>
        </div>

        {/* Level and XP progress card */}
        <div className="bg-slate-50 border border-slate-200/90 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center gap-4 min-w-[310px]">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 text-white flex flex-col items-center justify-center font-black shadow-sm shrink-0">
              <span className="text-[10px] uppercase font-bold text-blue-100 leading-none">LVL</span>
              <span className="text-base leading-none">{levelInfo.level}</span>
            </div>
            <div className="space-y-0.5">
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-black text-slate-900">{levelInfo.title[language]}</span>
                <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              </div>
              <div className="text-[11px] text-slate-500 font-medium">
                {totalXp} / {levelInfo.nextLevelXp} XP ({levelInfo.progressPercent}%)
              </div>
            </div>
          </div>

          <div className="flex-1 sm:w-28 space-y-1.5">
            <div className="h-2 bg-slate-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-blue-600 to-emerald-500 rounded-full transition-all duration-500"
                style={{ width: `${levelInfo.progressPercent}%` }}
              />
            </div>
            <div className="flex justify-between items-center text-[10px] font-bold text-slate-500">
              <span>{unlockedCount} / {badges.length} {language === 'ky' ? 'ачылды' : 'открыто'}</span>
              <span className="text-emerald-700">+{badges.filter(b => b.isClaimed).length * 10}% буст</span>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Action & Streak Booster Row */}
      <div className="p-4 rounded-2xl bg-gradient-to-r from-amber-500/10 via-amber-100/40 to-orange-50 border border-amber-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-500 text-white flex items-center justify-center shrink-0 shadow-sm shadow-amber-500/20">
            <Flame className="w-6 h-6 animate-bounce" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h4 className="text-xs sm:text-sm font-bold text-amber-950">
                {language === 'ky' ? 'Ударный режим:' : 'Ударный режим подготовки:'}{' '}
                <span className="text-amber-800 font-black">{student.streakDays || 4} {t.cabinetDays}</span>
              </h4>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-amber-200/80 text-amber-900">
                {language === 'ky' ? 'Кийинки бейджге 3 күн калды' : 'До значка «Огонь ОРТ» осталось 3 дня'}
              </span>
            </div>
            <p className="text-[11px] text-amber-800/80 mt-0.5">
              {language === 'ky'
                ? 'Күн сайын жок дегенде 1 тест чыгарып турсаңыз, окуу сериясы бузулбайт жана жаңы бейджиктер ачылат.'
                : 'Занимайтесь ежедневно без пропусков, чтобы прокачивать дисциплину и активировать редкие значки.'}
            </p>
          </div>
        </div>

        {onIncrementStreak && (
          <button
            id="btn-simulate-streak-boost"
            onClick={onIncrementStreak}
            className="px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold shadow-sm transition-all shrink-0 flex items-center gap-1.5 cursor-pointer"
          >
            <Zap className="w-3.5 h-3.5 fill-white" />
            <span>{language === 'ky' ? 'Бүгүнкү күндү бүтүрүү (+1)' : 'Завершить день (+1 к серии)'}</span>
          </button>
        )}
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-wrap items-center gap-2">
        <button
          onClick={() => setSelectedCategory('all')}
          className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            selectedCategory === 'all'
              ? 'bg-slate-900 text-white shadow-xs'
              : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
          }`}
        >
          {language === 'ky' ? 'Баары' : 'Все'} ({badges.length})
        </button>

        <button
          onClick={() => setSelectedCategory('streak')}
          className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
            selectedCategory === 'streak'
              ? 'bg-amber-600 text-white shadow-xs'
              : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
          }`}
        >
          <Flame className="w-3.5 h-3.5" />
          <span>{language === 'ky' ? 'Күнүмдүк сериялар' : 'Серии занятий'}</span>
        </button>

        <button
          onClick={() => setSelectedCategory('topic_mastery')}
          className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
            selectedCategory === 'topic_mastery'
              ? 'bg-blue-600 text-white shadow-xs'
              : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
          }`}
        >
          <BookOpen className="w-3.5 h-3.5" />
          <span>{language === 'ky' ? 'ОРТ темалары' : 'Темы ОРТ'}</span>
        </button>

        <button
          onClick={() => setSelectedCategory('unlocked')}
          className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
            selectedCategory === 'unlocked'
              ? 'bg-emerald-600 text-white shadow-xs'
              : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
          }`}
        >
          <CheckCircle2 className="w-3.5 h-3.5" />
          <span>{language === 'ky' ? 'Ачылгандар' : 'Полученные'}</span> ({unlockedCount})
        </button>

        <button
          onClick={() => setSelectedCategory('locked')}
          className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
            selectedCategory === 'locked'
              ? 'bg-slate-700 text-white shadow-xs'
              : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
          }`}
        >
          <Lock className="w-3.5 h-3.5" />
          <span>{language === 'ky' ? 'Ачыла электер' : 'В процессе'}</span> ({badges.length - unlockedCount})
        </button>
      </div>

      {/* Badges Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredBadges.map((badge) => {
          const styles = getTierStyles(badge.tier, badge.isUnlocked);
          const progressPercent = Math.min(100, Math.round((badge.currentProgress / badge.maxProgress) * 100));
          const canClaim = badge.isUnlocked && !badge.isClaimed;

          return (
            <div
              key={badge.id}
              onClick={() => setActiveBadgeModal(badge)}
              className={`p-5 rounded-2xl border transition-all cursor-pointer relative flex flex-col justify-between ${styles.cardBorder} ${styles.cardBg} ${styles.glow} hover:shadow-md hover:-translate-y-0.5`}
            >
              <div>
                {/* Top Bar: Icon + Tier Pill + XP */}
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-12 h-12 rounded-2xl flex items-center justify-center text-2xl shrink-0 transition-transform ${styles.badgeBg}`}
                    >
                      {badge.isUnlocked ? (
                        <span>{badge.icon}</span>
                      ) : (
                        <span className="relative">
                          <span className="grayscale opacity-50">{badge.icon}</span>
                          <Lock className="w-3.5 h-3.5 text-slate-500 absolute -bottom-1 -right-1 bg-white rounded-full p-0.5" />
                        </span>
                      )}
                    </div>
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className={`text-[10px] uppercase font-black px-2 py-0.5 rounded-md border ${styles.pill}`}>
                          {getTierName(badge.tier)}
                        </span>
                        {badge.category === 'streak' && (
                          <span className="text-[10px] font-bold text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200">
                            {language === 'ky' ? 'Серия' : 'Стрик'}
                          </span>
                        )}
                        {badge.category === 'topic_mastery' && badge.relatedSubjectId && (
                          <span className="text-[10px] font-bold text-blue-700 bg-blue-50 px-1.5 py-0.5 rounded border border-blue-200">
                            {badge.relatedSubjectId === 'math'
                              ? (language === 'ky' ? 'Математика' : 'Математика')
                              : badge.relatedSubjectId === 'analogies'
                              ? (language === 'ky' ? 'Аналогия' : 'Аналогии')
                              : (language === 'ky' ? 'Окуп түшүнүү' : 'Чтение')}
                          </span>
                        )}
                      </div>
                      <h3 className="text-sm font-bold text-slate-900 mt-1 leading-snug">
                        {badge.title[language]}
                      </h3>
                    </div>
                  </div>

                  <span className="text-xs font-black text-amber-800 bg-amber-100/90 border border-amber-300 px-2 py-0.5 rounded-lg shrink-0">
                    +{badge.rewardXp} XP
                  </span>
                </div>

                {/* Description */}
                <p className="text-xs text-slate-600 leading-relaxed mb-3">
                  {badge.description[language]}
                </p>
              </div>

              {/* Progress and CTA Footer */}
              <div className="pt-3 border-t border-slate-100/80 space-y-2.5">
                <div className="space-y-1">
                  <div className="flex justify-between text-[11px] font-bold text-slate-600">
                    <span>
                      {badge.currentProgress} / {badge.maxProgress} {badge.progressUnit[language]}
                    </span>
                    <span className={badge.isUnlocked ? 'text-emerald-600 font-extrabold' : 'text-slate-500'}>
                      {badge.isUnlocked ? (language === 'ky' ? 'Аткарылды 100%' : 'Выполнено 100%') : `${progressPercent}%`}
                    </span>
                  </div>
                  <div className="h-1.5 bg-slate-200 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        badge.isUnlocked
                          ? 'bg-emerald-500'
                          : badge.category === 'streak'
                          ? 'bg-amber-500'
                          : 'bg-blue-600'
                      }`}
                      style={{ width: `${progressPercent}%` }}
                    />
                  </div>
                </div>

                {/* Status or Claim Button */}
                <div className="pt-1">
                  {canClaim ? (
                    <button
                      type="button"
                      onClick={(e) => handleClaim(badge, e)}
                      className="w-full py-2 px-3 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white text-xs font-black shadow-sm shadow-emerald-600/30 flex items-center justify-center gap-1.5 transition-all animate-bounce cursor-pointer"
                    >
                      <Gift className="w-3.5 h-3.5" />
                      <span>{language === 'ky' ? `Сыйлыкты алуу (+${badge.rewardXp} XP)!` : `Забрать награду (+${badge.rewardXp} XP)!`}</span>
                    </button>
                  ) : badge.isClaimed ? (
                    <div className="flex items-center justify-between text-[11px] font-bold text-emerald-800 bg-emerald-50 border border-emerald-200 px-3 py-1.5 rounded-xl">
                      <span className="flex items-center gap-1.5">
                        <Check className="w-3.5 h-3.5 text-emerald-600" />
                        <span>{language === 'ky' ? 'Сыйлык алынды' : 'Награда получена'}</span>
                      </span>
                      {badge.unlockedAt && (
                        <span className="text-[10px] text-emerald-600 font-medium">
                          {badge.unlockedAt}
                        </span>
                      )}
                    </div>
                  ) : badge.category === 'topic_mastery' && onNavigateToTopic ? (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onNavigateToTopic(badge.relatedSubjectId, badge.relatedTopicName);
                      }}
                      className="w-full py-1.5 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                    >
                      <BookOpen className="w-3.5 h-3.5 text-blue-600" />
                      <span>{language === 'ky' ? 'Теманы машыгуу' : 'Тренировать тему'}</span>
                      <ChevronRight className="w-3 h-3 text-slate-400" />
                    </button>
                  ) : (
                    <div className="text-[11px] text-slate-500 font-medium flex items-center justify-between px-1">
                      <span>{language === 'ky' ? 'Жолдо...' : 'В процессе выполнения'}</span>
                      <span className="text-slate-400">
                        {badge.maxProgress - badge.currentProgress} {badge.progressUnit[language]} {language === 'ky' ? 'калды' : 'осталось'}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Badge Inspect Modal */}
      {activeBadgeModal && (
        <div
          className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4"
          onClick={() => setActiveBadgeModal(null)}
        >
          <div
            className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-7 shadow-2xl border border-slate-100 space-y-5 animate-in fade-in zoom-in-95"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3.5">
                <div
                  className={`w-16 h-16 rounded-3xl flex items-center justify-center text-3xl shrink-0 ${
                    getTierStyles(activeBadgeModal.tier, activeBadgeModal.isUnlocked).badgeBg
                  }`}
                >
                  {activeBadgeModal.icon}
                </div>
                <div>
                  <span className={`text-[10px] uppercase font-black px-2 py-0.5 rounded-md border ${
                    getTierStyles(activeBadgeModal.tier, activeBadgeModal.isUnlocked).pill
                  }`}>
                    {getTierName(activeBadgeModal.tier)} • {activeBadgeModal.category === 'streak' ? (language === 'ky' ? 'Серия' : 'Стрик') : (language === 'ky' ? 'ОРТ темасы' : 'Тема ОРТ')}
                  </span>
                  <h3 className="text-lg font-black text-slate-900 mt-1">
                    {activeBadgeModal.title[language]}
                  </h3>
                  <p className="text-xs text-amber-700 font-bold">
                    +{activeBadgeModal.rewardXp} XP тажрыйба упайы
                  </p>
                </div>
              </div>

              <button
                onClick={() => setActiveBadgeModal(null)}
                className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Description & Pedagogical requirement */}
            <div className="space-y-3 bg-slate-50 p-4 rounded-2xl border border-slate-200/80 text-xs">
              <div>
                <span className="font-bold text-slate-800 block mb-1">
                  {language === 'ky' ? 'Бейджиктин мааниси:' : 'Описание достижения:'}
                </span>
                <p className="text-slate-600 leading-relaxed">
                  {activeBadgeModal.description[language]}
                </p>
              </div>

              <div className="pt-2 border-t border-slate-200">
                <span className="font-bold text-slate-800 block mb-1">
                  {language === 'ky' ? 'Талап кылынган шарт:' : 'Условие для разблокировки:'}
                </span>
                <p className="text-slate-600 leading-relaxed font-medium">
                  {activeBadgeModal.requirementText[language]}
                </p>
              </div>
            </div>

            {/* Live Progress Bar */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs font-bold text-slate-700">
                <span>{language === 'ky' ? 'Сиздин прогрессиңиз:' : 'Текущий прогресс:'}</span>
                <span>
                  {activeBadgeModal.currentProgress} / {activeBadgeModal.maxProgress} {activeBadgeModal.progressUnit[language]}
                </span>
              </div>
              <div className="h-2.5 bg-slate-100 rounded-full overflow-hidden border border-slate-200">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${
                    activeBadgeModal.isUnlocked ? 'bg-emerald-500' : 'bg-blue-600'
                  }`}
                  style={{
                    width: `${Math.min(100, Math.round((activeBadgeModal.currentProgress / activeBadgeModal.maxProgress) * 100))}%`
                  }}
                />
              </div>
            </div>

            {/* Action buttons */}
            <div className="pt-2 flex flex-col gap-2">
              {activeBadgeModal.isUnlocked && !activeBadgeModal.isClaimed ? (
                <button
                  type="button"
                  onClick={() => {
                    handleClaim(activeBadgeModal);
                    setActiveBadgeModal(null);
                  }}
                  className="w-full py-3 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-black text-sm shadow-md shadow-emerald-600/20 flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Gift className="w-4 h-4" />
                  <span>{language === 'ky' ? `Сыйлыкты алуу (+${activeBadgeModal.rewardXp} XP)` : `Забрать награду (+${activeBadgeModal.rewardXp} XP)`}</span>
                </button>
              ) : activeBadgeModal.category === 'topic_mastery' && onNavigateToTopic ? (
                <button
                  type="button"
                  onClick={() => {
                    setActiveBadgeModal(null);
                    onNavigateToTopic(activeBadgeModal.relatedSubjectId, activeBadgeModal.relatedTopicName);
                  }}
                  className="w-full py-3 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs sm:text-sm shadow-md shadow-blue-600/20 flex items-center justify-center gap-2 cursor-pointer"
                >
                  <BookOpen className="w-4 h-4" />
                  <span>{language === 'ky' ? 'Бул тема боюнча тест чыгар' : 'Тренировать задания по этой теме'}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              ) : activeBadgeModal.category === 'streak' && onIncrementStreak && !activeBadgeModal.isUnlocked ? (
                <button
                  type="button"
                  onClick={() => {
                    onIncrementStreak();
                    setActiveBadgeModal(null);
                  }}
                  className="w-full py-3 rounded-2xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs sm:text-sm shadow-md shadow-amber-600/20 flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Zap className="w-4 h-4" />
                  <span>{language === 'ky' ? 'Бүгүнкү күндү бүтүрүп, серияны сактоо' : 'Завершить день и продолжить серию'}</span>
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => setActiveBadgeModal(null)}
                  className="w-full py-2.5 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs transition-colors cursor-pointer"
                >
                  {language === 'ky' ? 'Жабуу' : 'Закрыть'}
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Celebrating Claim Modal */}
      {celebratingBadge && (
        <div
          className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-4"
          onClick={() => setCelebratingBadge(null)}
        >
          <div
            className="bg-white rounded-3xl max-w-sm w-full p-7 text-center shadow-2xl border border-amber-200 space-y-4 animate-in zoom-in-95 duration-300"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="w-20 h-20 mx-auto rounded-3xl bg-gradient-to-br from-amber-300 via-yellow-400 to-amber-500 text-4xl flex items-center justify-center shadow-xl shadow-amber-500/30 animate-bounce">
              {celebratingBadge.icon}
            </div>

            <div className="space-y-1">
              <span className="text-[11px] font-black uppercase text-amber-600 tracking-wider">
                {language === 'ky' ? 'Сыйлык ийгиликтүү алынды!' : 'Награда успешно получена!'}
              </span>
              <h3 className="text-xl font-black text-slate-900">
                {celebratingBadge.title[language]}
              </h3>
              <p className="text-xs text-slate-500">
                {celebratingBadge.description[language]}
              </p>
            </div>

            <div className="p-3 bg-amber-50 rounded-2xl border border-amber-200 inline-flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-amber-500" />
              <span className="text-sm font-black text-amber-900">
                +{celebratingBadge.rewardXp} XP тажрыйба кошулду!
              </span>
            </div>

            <button
              onClick={() => setCelebratingBadge(null)}
              className="w-full py-3 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs transition-colors cursor-pointer"
            >
              {language === 'ky' ? 'Сонун! Улантуу' : 'Отлично! Продолжить подготовку'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
