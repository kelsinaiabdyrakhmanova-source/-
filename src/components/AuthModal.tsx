import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { UserProfile, UserRole } from '../types';
import {
  X,
  Phone,
  User,
  GraduationCap,
  MapPin,
  Target,
  ShieldCheck,
  CheckCircle2,
  Users,
  Sparkles,
  Lock
} from 'lucide-react';

export const AuthModal: React.FC = () => {
  const {
    isAuthModalOpen,
    setIsAuthModalOpen,
    language,
    t,
    registerUser,
    loginDemo,
    navigate
  } = useApp();

  const [mode, setMode] = useState<'register' | 'login'>('register');

  // Form Fields
  const [phone, setPhone] = useState('');
  const [fullName, setFullName] = useState('');
  const [grade, setGrade] = useState('11-класс');
  const [instructionLanguage, setInstructionLanguage] = useState<'ky' | 'ru'>('ky');
  const [region, setRegion] = useState('Бишкек');
  const [targetScore, setTargetScore] = useState(190);
  const [role, setRole] = useState<UserRole>('student');
  const [isMinor, setIsMinor] = useState(true);
  const [parentPhone, setParentPhone] = useState('');
  const [agreePrivacy, setAgreePrivacy] = useState(true);

  if (!isAuthModalOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (mode === 'login') {
      loginDemo('student');
      setIsAuthModalOpen(false);
      navigate('student-cabinet');
      return;
    }

    const newUser: UserProfile = {
      id: 'user-' + Date.now(),
      phone: phone.trim() || '+996 700 000 000',
      fullName: fullName.trim() || (language === 'ky' ? 'Окуучу' : 'Ученик'),
      role,
      grade: role === 'student' ? grade : undefined,
      instructionLanguage,
      region,
      targetScore: role === 'student' ? Number(targetScore) : undefined,
      selectedSubjects: ['math', 'analogies', 'reading'],
      isMinor: role === 'student' ? isMinor : false,
      parentPhone: isMinor ? parentPhone : undefined,
      subscriptionTier: 'free',
      streakDays: 1,
      predictedScore: 130,
      completedTestsCount: 0,
      correctAnswersCount: 0,
      totalAnsweredCount: 0,
      weeklyStudyMinutes: 0,
      weakTopics: [],
      strongTopics: [],
      todayTasksCompleted: [],
      repetitionQuestionIds: []
    };

    registerUser(newUser);
    setIsAuthModalOpen(false);

    if (role === 'admin') {
      navigate('admin-panel');
    } else if (role === 'parent') {
      navigate('parent-cabinet');
    } else {
      navigate('student-cabinet');
    }
  };

  const handleQuickDemo = (roleSelect: UserRole) => {
    loginDemo(roleSelect);
    setIsAuthModalOpen(false);
    if (roleSelect === 'admin') {
      navigate('admin-panel');
    } else if (roleSelect === 'parent') {
      navigate('parent-cabinet');
    } else {
      navigate('student-cabinet');
    }
  };

  const regionsList = [
    'Бишкек',
    'Ош ш.',
    'Чүй облусу',
    'Жалал-Абад облусу',
    'Ысык-Көл облусу',
    'Нарын облусу',
    'Талас облусу',
    'Баткен облусу'
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/65 p-4 backdrop-blur-xs overflow-y-auto animate-in fade-in">
      <div className="bg-white rounded-3xl max-w-lg w-full shadow-2xl border border-slate-100 my-6 p-6 sm:p-8 space-y-6 max-h-[92vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center font-bold">
              <GraduationCap className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900">
                {mode === 'register' ? t.authRegisterTitle : t.authLoginTitle}
              </h2>
              <p className="text-xs text-slate-500">
                {language === 'ky' ? 'ОРТ Онлайн — заманбап билим берүү платформасы' : 'ОРТ Онлайн — образовательная платформа'}
              </p>
            </div>
          </div>

          <button
            onClick={() => setIsAuthModalOpen(false)}
            className="w-8 h-8 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-700 flex items-center justify-center font-bold"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Quick Demo Role Selector (Essential for easy reviewer navigation) */}
        <div className="p-3.5 rounded-2xl bg-blue-50/70 border border-blue-200/80 space-y-2">
          <p className="text-[11px] font-bold text-blue-900 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-blue-600" />
            <span>{t.authQuickDemoAccount}:</span>
          </p>
          <div className="grid grid-cols-3 gap-2">
            <button
              type="button"
              id="demo-login-student"
              onClick={() => handleQuickDemo('student')}
              className="py-1.5 px-2 rounded-xl bg-white border border-blue-200 hover:border-blue-400 text-[11px] font-bold text-blue-700 shadow-2xs transition-colors"
            >
              {language === 'ky' ? 'Окуучу' : 'Ученик'}
            </button>
            <button
              type="button"
              id="demo-login-parent"
              onClick={() => handleQuickDemo('parent')}
              className="py-1.5 px-2 rounded-xl bg-white border border-blue-200 hover:border-blue-400 text-[11px] font-bold text-rose-700 shadow-2xs transition-colors"
            >
              {language === 'ky' ? 'Ата-эне' : 'Родитель'}
            </button>
            <button
              type="button"
              id="demo-login-admin"
              onClick={() => handleQuickDemo('admin')}
              className="py-1.5 px-2 rounded-xl bg-white border border-blue-200 hover:border-blue-400 text-[11px] font-bold text-slate-800 shadow-2xs transition-colors"
            >
              {language === 'ky' ? 'Админ' : 'Админ'}
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          {/* Role selector in registration form */}
          {mode === 'register' && (
            <div>
              <label className="block font-bold text-slate-700 mb-1.5">{t.authRoleLabel}</label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { r: 'student', label: language === 'ky' ? 'Окуучу' : 'Ученик' },
                  { r: 'parent', label: language === 'ky' ? 'Ата-эне' : 'Родитель' },
                  { r: 'admin', label: language === 'ky' ? 'Админ' : 'Администратор' }
                ].map((item) => (
                  <button
                    key={item.r}
                    type="button"
                    onClick={() => setRole(item.r as UserRole)}
                    className={`py-2 rounded-xl border text-xs font-bold transition-all ${
                      role === item.r
                        ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                        : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Full Name */}
          {mode === 'register' && (
            <div>
              <label className="block font-bold text-slate-700 mb-1">{t.authFullNameLabel}</label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder={language === 'ky' ? 'Аскар Асанов' : 'Азамат Султанов'}
                  className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-slate-200 text-xs focus:outline-none focus:border-blue-600"
                />
              </div>
            </div>
          )}

          {/* Phone Number */}
          <div>
            <label className="block font-bold text-slate-700 mb-1">{t.authPhoneLabel}</label>
            <div className="relative">
              <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="tel"
                required
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+996 700 123 456"
                className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-slate-200 text-xs focus:outline-none focus:border-blue-600 font-mono"
              />
            </div>
          </div>

          {mode === 'register' && role === 'student' && (
            <>
              {/* Grade and Language of instruction */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">{t.authGradeLabel}</label>
                  <select
                    value={grade}
                    onChange={(e) => setGrade(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-slate-200 font-medium"
                  >
                    <option value="9-класс">9-класс</option>
                    <option value="10-класс">10-класс</option>
                    <option value="11-класс">11-класс</option>
                    <option value="Выпускник">
                      {language === 'ky' ? 'Бүтүрүүчү (Колледж/Мектеп)' : 'Выпускник прошлых лет'}
                    </option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">{t.authInstructionLangLabel}</label>
                  <select
                    value={instructionLanguage}
                    onChange={(e) => setInstructionLanguage(e.target.value as 'ky' | 'ru')}
                    className="w-full p-2.5 rounded-xl border border-slate-200 font-medium"
                  >
                    <option value="ky">Кыргызча</option>
                    <option value="ru">Русский</option>
                  </select>
                </div>
              </div>

              {/* Region and Target Score */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">{t.authRegionLabel}</label>
                  <select
                    value={region}
                    onChange={(e) => setRegion(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-slate-200 font-medium"
                  >
                    {regionsList.map((r) => (
                      <option key={r} value={r}>
                        {r}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">{t.authTargetScoreLabel}</label>
                  <div className="relative">
                    <Target className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="number"
                      min={110}
                      max={245}
                      value={targetScore}
                      onChange={(e) => setTargetScore(Number(e.target.value))}
                      className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-200 font-semibold"
                    />
                  </div>
                </div>
              </div>

              {/* Minor Consent and Parent phone */}
              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 space-y-2.5">
                <label className="flex items-start gap-2.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isMinor}
                    onChange={(e) => setIsMinor(e.target.checked)}
                    className="mt-0.5 rounded text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-[11px] text-slate-700 leading-snug">
                    {t.authMinorConsentText}
                  </span>
                </label>

                {isMinor && (
                  <div className="pt-1">
                    <label className="block font-bold text-slate-600 text-[11px] mb-1">
                      {t.authParentPhoneLabel}
                    </label>
                    <input
                      type="tel"
                      value={parentPhone}
                      onChange={(e) => setParentPhone(e.target.value)}
                      placeholder="+996 700 891 234"
                      className="w-full p-2 rounded-lg border border-slate-200 bg-white font-mono text-xs"
                    />
                  </div>
                )}
              </div>
            </>
          )}

          {/* Privacy & Public Offer Consent Checkbox */}
          <label className="flex items-start gap-2.5 cursor-pointer pt-1">
            <input
              type="checkbox"
              required
              checked={agreePrivacy}
              onChange={(e) => setAgreePrivacy(e.target.checked)}
              className="mt-0.5 rounded text-blue-600 focus:ring-blue-500"
            />
            <span className="text-[11px] text-slate-600 leading-snug">
              {language === 'ky' ? (
                <>
                  Мен ОсОО «Билет Центр» компаниясынын{' '}
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setIsAuthModalOpen(false);
                      navigate('terms');
                    }}
                    className="text-blue-600 underline font-semibold hover:text-blue-700"
                  >
                    Публичная офертасын
                  </button>{' '}
                  жана{' '}
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setIsAuthModalOpen(false);
                      navigate('privacy');
                    }}
                    className="text-blue-600 underline font-semibold hover:text-blue-700"
                  >
                    Купуялуулук саясатын
                  </button>{' '}
                  толук кабыл алам.
                </>
              ) : (
                <>
                  Я принимаю условия{' '}
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setIsAuthModalOpen(false);
                      navigate('terms');
                    }}
                    className="text-blue-600 underline font-semibold hover:text-blue-700"
                  >
                    Публичной оферты
                  </button>{' '}
                  и{' '}
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setIsAuthModalOpen(false);
                      navigate('privacy');
                    }}
                    className="text-blue-600 underline font-semibold hover:text-blue-700"
                  >
                    Политики конфиденциальности
                  </button>{' '}
                  ОсОО «Билет Центр».
                </>
              )}
            </span>
          </label>

          {/* Submit Button */}
          <button
            type="submit"
            className="w-full py-3.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm shadow-md shadow-blue-600/25 transition-colors cursor-pointer"
          >
            {mode === 'register' ? t.authBtnSubmitRegister : t.authBtnSubmitLogin}
          </button>
        </form>

        {/* Toggle between register and login */}
        <div className="text-center pt-2 border-t border-slate-100">
          {mode === 'register' ? (
            <p className="text-xs text-slate-600">
              {t.authHaveAccount}{' '}
              <button
                type="button"
                onClick={() => setMode('login')}
                className="font-bold text-blue-600 hover:underline"
              >
                {t.authBtnSubmitLogin}
              </button>
            </p>
          ) : (
            <p className="text-xs text-slate-600">
              {t.authNoAccount}{' '}
              <button
                type="button"
                onClick={() => setMode('register')}
                className="font-bold text-blue-600 hover:underline"
              >
                {t.authBtnSubmitRegister}
              </button>
            </p>
          )}
        </div>
      </div>
    </div>
  );
};
