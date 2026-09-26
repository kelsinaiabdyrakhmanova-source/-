import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  Language,
  UserProfile,
  Question,
  TestResult,
  TariffPlan,
  PromoCode,
  SubjectId,
  PaymentTransaction,
  SavedPaymentMethod,
  FinikPaymentOrder
} from '../types';
import {
  initialQuestions,
  tariffPlans,
  defaultStudentProfile,
  initialPromoCodes
} from '../data/initialData';
import { demoQuestions30 } from '../data/demoQuestions';
import { translations } from '../data/translations';
import { api } from '../services/api';

interface ToastMessage {
  id: string;
  type: 'info' | 'success' | 'warning' | 'error';
  message: string;
}

interface SubscriptionAlert {
  type: 'expired' | 'expiring_1_day' | 'expiring_3_days' | null;
  daysLeft: number;
}

interface AppContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: typeof translations['ky'];
  currentView: string;
  navigate: (view: string, params?: any) => void;
  viewParams: any;
  user: UserProfile | null;
  setUser: (user: UserProfile | null) => void;
  questions: Question[];
  diagnosticResult: any | null;
  setDiagnosticResult: (res: any | null) => void;
  selectedSubject: SubjectId;
  setSelectedSubject: (s: SubjectId) => void;
  isAuthModalOpen: boolean;
  setIsAuthModalOpen: (open: boolean) => void;
  isPaymentModalOpen: boolean;
  setIsPaymentModalOpen: (open: boolean) => void;
  selectedPlan: TariffPlan | null;
  setSelectedPlan: (plan: TariffPlan | null) => void;
  promoCodes: PromoCode[];
  transactions: PaymentTransaction[];
  toasts: ToastMessage[];
  showToast: (msg: string, type?: 'info' | 'success' | 'warning' | 'error') => void;
  dismissToast: (id: string) => void;
  // Finik Web SDK & Subscription
  activeFinikOrder: FinikPaymentOrder | null;
  setActiveFinikOrder: (order: FinikPaymentOrder | null) => void;
  isFinikProcessing: boolean;
  isFinikActive: boolean;
  isFinikEnabled: boolean;
  initiateFinikPayment: (plan: TariffPlan, customAmount?: number, promoCode?: string) => Promise<FinikPaymentOrder>;
  checkFinikStatus: (paymentId: string) => Promise<FinikPaymentOrder | null>;
  simulateFinikWebhookSuccess: (paymentId: string) => Promise<FinikPaymentOrder | undefined>;
  subscriptionAlert: SubscriptionAlert;
  // Actions
  loginDemo: (role: 'student' | 'parent' | 'teacher' | 'admin') => Promise<void>;
  registerUser: (userData: Partial<UserProfile>) => Promise<void>;
  logout: () => void;
  saveDiagnosticScore: (res: any) => void;
  addQuestion: (q: any) => Promise<void>;
  editQuestion: (q: any) => Promise<void>;
  updateQuestion: (q: any) => Promise<void>;
  deleteQuestion: (id: string) => Promise<void>;
  importQuestions: (newQuestions: any[]) => void;
  openPayment: (plan: TariffPlan) => void;
  confirmDemoPayment: (
    method: string,
    promoCode?: string,
    cardDetails?: {
      saveCard?: boolean;
      autoRenew?: boolean;
      cardToken?: string;
      cardBrand?: string;
      last4?: string;
      expiryMonth?: string;
      expiryYear?: string;
      savedMethodId?: string;
      amount?: number;
    }
  ) => Promise<boolean>;
  deleteSavedPaymentMethod: (methodId: string) => Promise<boolean>;
  toggleAutoRenew: (enabled: boolean) => Promise<boolean>;
  applyPromo: (code: string) => number | null;
  toggleTaskCompletion: (taskId: string) => void;
  addToRepetition: (qId: string) => void;
  reloadQuestions: () => Promise<void>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Language from localStorage or default 'ky'
  const [language, setLanguageState] = useState<Language>(() => {
    const saved = localStorage.getItem('bilim_lang');
    return saved === 'ru' || saved === 'ky' || saved === 'en' ? (saved as Language) : 'ky';
  });

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem('bilim_lang', lang);
  };

  const t = translations[language] || translations['ky'];


  // Global Toasts for user feedback (Requirement 1)
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const showToast = (message: string, type: 'info' | 'success' | 'warning' | 'error' = 'info') => {
    const id = 'toast-' + Date.now() + '-' + Math.random().toString(36).substring(2, 5);
    setToasts((prev) => [...prev, { id, type, message }]);
    setTimeout(() => {
      dismissToast(id);
    }, 4000);
  };

  const dismissToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // Current view navigation
  const [currentView, setCurrentView] = useState<string>('home');
  const [viewParams, setViewParams] = useState<any>(null);

  const navigate = (view: string, params: any = null) => {
    // Standardize admin routes
    const target = view === 'admin-cabinet' ? 'admin-panel' : view;
    setCurrentView(target);
    setViewParams(params);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // User Profile
  const [user, setUserState] = useState<UserProfile | null>(() => {
    const saved = localStorage.getItem('bilim_user');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        return defaultStudentProfile;
      }
    }
    return defaultStudentProfile;
  });

  const setUser = (u: UserProfile | null) => {
    setUserState(u);
    if (u) {
      localStorage.setItem('bilim_user', JSON.stringify(u));
    } else {
      localStorage.removeItem('bilim_user');
    }
  };

  // Questions Database: Starts with 30 original demo questions
  const [questions, setQuestions] = useState<Question[]>(() => {
    const saved = localStorage.getItem('bilim_questions');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length >= 30) return parsed;
      } catch (e) {
        // fallback
      }
    }
    return demoQuestions30;
  });

  const reloadQuestions = async () => {
    try {
      const data = await api.getQuestions(user?.role);
      if (data.questions && data.questions.length > 0) {
        setQuestions(data.questions);
        localStorage.setItem('bilim_questions', JSON.stringify(data.questions));
      }
    } catch (e) {
      // Offline fallback
    }
  };

  useEffect(() => {
    reloadQuestions();
  }, [user?.role]);

  // Diagnostic Result
  const [diagnosticResult, setDiagnosticResult] = useState<any | null>(() => {
    const saved = localStorage.getItem('bilim_diag_res');
    return saved ? JSON.parse(saved) : null;
  });

  // Selected Subject for training
  const [selectedSubject, setSelectedSubject] = useState<SubjectId>('math');

  // Modals
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<TariffPlan | null>(null);

  // Promo Codes
  const [promoCodes] = useState<PromoCode[]>(() => {
    const saved = localStorage.getItem('bilim_promos');
    return saved ? JSON.parse(saved) : initialPromoCodes;
  });

  // Transactions History
  const [transactions, setTransactions] = useState<PaymentTransaction[]>([
    {
      id: 'tx-101',
      userName: 'Азамат Султанов',
      userPhone: '+996 700 891 234',
      planId: 'standard',
      planName: 'Стандарт (490 сом)',
      amount: 490,
      date: '2026-09-18 14:20',
      status: 'active',
      method: 'MBank'
    },
    {
      id: 'tx-102',
      userName: 'Айпери Нурбекова',
      userPhone: '+996 555 334 455',
      planId: 'intensive',
      planName: 'ОРТ Интенсив (2 990 сом)',
      amount: 2990,
      date: '2026-09-19 11:05',
      status: 'active',
      method: 'QR (Элкарт)'
    }
  ]);

  const loginDemo = async (role: 'student' | 'parent' | 'teacher' | 'admin') => {
    try {
      const res = await api.login(undefined, role);
      if (res.profile) {
        const u: UserProfile = {
          id: res.profile.id,
          fullName: res.profile.full_name,
          phone: res.profile.phone,
          role: res.profile.role,
          grade: res.profile.grade,
          instructionLanguage: res.profile.instruction_language,
          region: res.profile.region,
          targetScore: res.profile.target_score,
          selectedSubjects: ['math', 'analogies', 'reading'],
          isMinor: res.profile.is_minor,
          parentPhone: res.profile.parent_phone,
          parentConsent: res.profile.parent_consent,
          subscriptionTier: res.profile.subscription_tier,
          streakDays: res.profile.streak_days,
          predictedScore: res.profile.predicted_score,
          completedTestsCount: res.profile.completed_tests_count,
          correctAnswersCount: res.profile.correct_answers_count,
          totalAnsweredCount: res.profile.total_answered_count,
          weeklyStudyMinutes: res.profile.weekly_study_minutes,
          weakTopics: [],
          strongTopics: [],
          todayTasksCompleted: [],
          repetitionQuestionIds: []
        };
        setUser(u);
      }
    } catch (e) {
      // Fallback
      if (role === 'student') setUser(defaultStudentProfile);
      else if (role === 'parent') {
        setUser({
          ...defaultStudentProfile,
          id: 'user-demo-parent',
          fullName: 'Бакыт Токтогулов',
          phone: '+996 555 123 456',
          role: 'parent'
        });
      } else if (role === 'teacher') {
        setUser({
          ...defaultStudentProfile,
          id: 'user-demo-teacher',
          fullName: 'Гүлмира Маматова',
          phone: '+996 772 456 789',
          role: 'teacher'
        });
      } else if (role === 'admin') {
        setUser({
          ...defaultStudentProfile,
          id: 'user-demo-admin',
          fullName: 'Билим Админ',
          phone: '+996 700 000 001',
          role: 'admin'
        });
      }
    }
    setIsAuthModalOpen(false);
  };

  const registerUser = async (userData: Partial<UserProfile>) => {
    try {
      const res = await api.register({
        fullName: userData.fullName,
        phone: userData.phone,
        role: userData.role,
        grade: userData.grade,
        instructionLanguage: userData.instructionLanguage,
        region: userData.region,
        targetScore: userData.targetScore,
        isMinor: userData.isMinor,
        parentPhone: userData.parentPhone
      });

      if (res.profile) {
        const u: UserProfile = {
          id: res.profile.id,
          fullName: res.profile.full_name,
          phone: res.profile.phone,
          role: res.profile.role,
          grade: res.profile.grade,
          instructionLanguage: res.profile.instruction_language,
          region: res.profile.region,
          targetScore: res.profile.target_score,
          selectedSubjects: ['math', 'analogies', 'reading'],
          isMinor: res.profile.is_minor,
          parentPhone: res.profile.parent_phone,
          parentConsent: res.profile.parent_consent,
          subscriptionTier: res.profile.subscription_tier,
          streakDays: res.profile.streak_days,
          predictedScore: res.profile.predicted_score,
          completedTestsCount: 0,
          correctAnswersCount: 0,
          totalAnsweredCount: 0,
          weeklyStudyMinutes: 0,
          weakTopics: [],
          strongTopics: [],
          todayTasksCompleted: [],
          repetitionQuestionIds: []
        };
        setUser(u);
      }
    } catch (e: any) {
      showToast(e.message || 'Каттоодо ката кетти', 'error');
    }
    setIsAuthModalOpen(false);
  };

  const logout = () => {
    setUser(null);
    navigate('home');
  };

  const saveDiagnosticScore = (res: any) => {
    setDiagnosticResult(res);
    localStorage.setItem('bilim_diag_res', JSON.stringify(res));
    if (user) {
      const updatedUser: UserProfile = {
        ...user,
        predictedScore: res.estimatedPredictedScore || res.predictedScore,
        completedTestsCount: (user.completedTestsCount || 0) + 1,
        correctAnswersCount: (user.correctAnswersCount || 0) + (res.correctCount || 0),
        totalAnsweredCount: (user.totalAnsweredCount || 0) + (res.totalQuestions || 0)
      };
      setUser(updatedUser);
    }
  };

  const addQuestion = async (q: any) => {
    try {
      const res = await api.createQuestion(q);
      if (res.question) {
        showToast(
          language === 'ky' ? 'Суроо ийгиликтүү кошулду!' : 'Вопрос успешно добавлен!',
          'success'
        );
        await reloadQuestions();
      }
    } catch (e: any) {
      showToast(e.message || 'Ката кетти', 'error');
    }
  };

  const editQuestion = async (q: any) => {
    try {
      const res = await api.updateQuestion(q.id, q);
      if (res.question) {
        showToast(
          language === 'ky' ? 'Суроо жаңыланды!' : 'Вопрос успешно обновлен!',
          'success'
        );
        await reloadQuestions();
      }
    } catch (e: any) {
      showToast(e.message || 'Ката кетти', 'error');
    }
  };

  const deleteQuestion = async (id: string) => {
    try {
      await api.archiveQuestion(id);
      showToast(
        language === 'ky' ? 'Суроо архивге жылдырылды!' : 'Вопрос перемещен в архив!',
        'info'
      );
      await reloadQuestions();
    } catch (e: any) {
      showToast(e.message || 'Ката кетти', 'error');
    }
  };

  const importQuestions = (newQuestions: Question[]) => {
    setQuestions((prev) => [...newQuestions, ...prev]);
  };

  const openPayment = (plan: TariffPlan) => {
    setSelectedPlan(plan);
    setIsPaymentModalOpen(true);
  };

  const applyPromo = (code: string): number | null => {
    const found = promoCodes.find(
      (p) => p.code.toUpperCase() === code.trim().toUpperCase() && p.isActive
    );
    return found ? found.discountPercent : null;
  };

  const confirmDemoPayment = async (
    method: string,
    promoCode?: string,
    cardDetails?: {
      saveCard?: boolean;
      autoRenew?: boolean;
      cardToken?: string;
      cardBrand?: string;
      last4?: string;
      expiryMonth?: string;
      expiryYear?: string;
      savedMethodId?: string;
      amount?: number;
    }
  ): Promise<boolean> => {
    if (!selectedPlan) return false;
    let finalAmount = cardDetails?.amount !== undefined ? cardDetails.amount : selectedPlan.price;
    if (cardDetails?.amount === undefined && promoCode) {
      const discount = applyPromo(promoCode);
      if (discount) {
        finalAmount = Math.round(finalAmount * (1 - discount / 100));
      }
    }

    try {
      await api.confirmPayment({
        userId: user?.id || 'user-demo-student',
        planTier: selectedPlan.id,
        amount: finalAmount,
        paymentMethod: method,
        promoCode,
        saveCard: cardDetails?.saveCard,
        autoRenew: cardDetails?.autoRenew,
        cardToken: cardDetails?.cardToken,
        cardBrand: cardDetails?.cardBrand,
        last4: cardDetails?.last4,
        expiryMonth: cardDetails?.expiryMonth,
        expiryYear: cardDetails?.expiryYear,
        savedMethodId: cardDetails?.savedMethodId
      });
    } catch (e) {
      // Continue locally
    }

    let methodDisplay = method;
    if (method === 'saved_card' && cardDetails?.cardBrand) {
      methodDisplay = `${cardDetails.cardBrand} •••• ${cardDetails.last4}`;
    } else if (method === 'card' && cardDetails?.cardBrand) {
      methodDisplay = `${cardDetails.cardBrand} •••• ${cardDetails.last4}`;
    }

    const tx: PaymentTransaction = {
      id: 'tx-' + Date.now(),
      userName: user ? user.fullName : 'Конок Колдонуучу',
      userPhone: user ? user.phone : '+996 700 000 000',
      planId: selectedPlan.id,
      planName: `${selectedPlan.name[language]} (${finalAmount} сом)`,
      amount: finalAmount,
      date: new Date().toISOString().replace('T', ' ').substring(0, 16),
      status: 'active',
      method: methodDisplay
    };

    setTransactions((prev) => [tx, ...prev]);

    if (user) {
      const expiryDate = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
        .toISOString()
        .split('T')[0];

      let updatedSavedMethods = user.savedPaymentMethods || [];

      // If user selected "Save payment method"
      if (cardDetails?.saveCard) {
        const brand = cardDetails.cardBrand || 'Visa';
        const brandNorm = brand.toLowerCase();
        const cardType: 'visa' | 'mastercard' | 'elkart' | 'other' =
          brandNorm.includes('elkart') || brandNorm.includes('элкарт')
            ? 'elkart'
            : brandNorm.includes('master')
            ? 'mastercard'
            : brandNorm.includes('visa')
            ? 'visa'
            : 'other';

        const newSaved: SavedPaymentMethod = {
          id: 'spm-' + Date.now(),
          token: cardDetails.cardToken || 'tok_pci_' + Math.random().toString(36).substring(2, 10),
          cardType,
          cardBrandName: brand,
          last4: cardDetails.last4 || '1234',
          expiryMonth: cardDetails.expiryMonth || '12',
          expiryYear: cardDetails.expiryYear || '28',
          savedAt: new Date().toISOString(),
          autoRenewEnabled: Boolean(cardDetails.autoRenew),
          nextBillingDate: expiryDate,
          billingAmount: finalAmount,
          planTier: selectedPlan.id
        };

        updatedSavedMethods = [
          newSaved,
          ...updatedSavedMethods.filter((m) => m.last4 !== newSaved.last4)
        ];
      }

      setUser({
        ...user,
        subscriptionTier: selectedPlan.id,
        subscriptionExpires: expiryDate,
        savedPaymentMethods: updatedSavedMethods,
        autoRenewSubscription:
          cardDetails?.saveCard || method === 'saved_card'
            ? typeof cardDetails?.autoRenew === 'boolean'
              ? cardDetails.autoRenew
              : user.autoRenewSubscription
            : user.autoRenewSubscription
      });
    }

    showToast(
      language === 'ky'
        ? `Төлөм кабыл алынды! «${selectedPlan.name[language]}» тарифи иштетилди.`
        : `Оплата прошла успешно! Тариф «${selectedPlan.name[language]}» активирован.`,
      'success'
    );

    setIsPaymentModalOpen(false);
    return true;
  };

  const deleteSavedPaymentMethod = async (methodId: string): Promise<boolean> => {
    try {
      const userId = user?.id || 'user-demo-student';
      await api.deleteSavedPaymentMethod(userId, methodId);
    } catch (e) {
      // Offline fallback
    }

    if (user) {
      const updated = (user.savedPaymentMethods || []).filter((m) => m.id !== methodId);
      setUser({
        ...user,
        savedPaymentMethods: updated,
        autoRenewSubscription: updated.length > 0 ? user.autoRenewSubscription : false
      });
    }

    showToast(
      language === 'ky' ? 'Төлөм ыкмасы өчүрүлдү' : 'Способ оплаты успешно удален',
      'info'
    );
    return true;
  };

  const toggleAutoRenew = async (enabled: boolean): Promise<boolean> => {
    try {
      const userId = user?.id || 'user-demo-student';
      await api.toggleAutoRenew(userId, enabled);
    } catch (e) {
      // Offline fallback
    }

    if (user) {
      const updatedMethods = (user.savedPaymentMethods || []).map((m) => ({
        ...m,
        autoRenewEnabled: enabled
      }));
      setUser({
        ...user,
        autoRenewSubscription: enabled,
        savedPaymentMethods: updatedMethods
      });
    }

    showToast(
      enabled
        ? language === 'ky'
          ? 'Авто-узартуу күйгүзүлдү'
          : 'Автопродление включено'
        : language === 'ky'
        ? 'Авто-узартуу өчүрүлдү'
        : 'Автопродление отключено',
      enabled ? 'success' : 'info'
    );
    return true;
  };

  const toggleTaskCompletion = (taskId: string) => {
    if (!user) return;
    const exists = user.todayTasksCompleted.includes(taskId);
    const updated = exists
      ? user.todayTasksCompleted.filter((id) => id !== taskId)
      : [...user.todayTasksCompleted, taskId];
    setUser({ ...user, todayTasksCompleted: updated });
  };

  const addToRepetition = (qId: string) => {
    if (!user) return;
    if (!user.repetitionQuestionIds.includes(qId)) {
      setUser({
        ...user,
        repetitionQuestionIds: [...user.repetitionQuestionIds, qId]
      });
      showToast(
        language === 'ky'
          ? 'Тапшырма «Кайталоо» тизмесине кошулду'
          : 'Вопрос добавлен в повторение',
        'info'
      );
    }
  };

  const [activeFinikOrder, setActiveFinikOrder] = useState<FinikPaymentOrder | null>(null);
  const [isFinikProcessing, setIsFinikProcessing] = useState<boolean>(false);
  const [isFinikActive, setIsFinikActive] = useState<boolean>(false);
  const [isFinikEnabled, setIsFinikEnabled] = useState<boolean>(false);

  // Check Finik configuration and status on app load
  useEffect(() => {
    let mounted = true;
    api.getFinikConfigStatus()
      .then((cfg) => {
        if (mounted && cfg) {
          setIsFinikActive(Boolean(cfg.isActive || cfg.isConfigured));
          setIsFinikEnabled(Boolean(cfg.enabled));
        }
      })
      .catch(() => {
        if (mounted) {
          setIsFinikActive(false);
          setIsFinikEnabled(false);
        }
      });
    return () => { mounted = false; };
  }, []);

  const initiateFinikPayment = async (plan: TariffPlan, customAmount?: number, promoCode?: string): Promise<FinikPaymentOrder> => {
    setIsFinikProcessing(true);
    const finalAmount = customAmount !== undefined ? customAmount : plan.price;
    try {
      const res = await api.createFinikPayment({
        userId: user?.id || 'user-demo-student',
        userName: user?.fullName || 'Студент ОРТ Онлайн',
        userEmail: user?.email || `${user?.phone || 'student'}@ort.online`,
        userPhone: user?.phone || '+996700000000',
        tariffId: plan.id,
        tariffName: plan.name[language] || plan.name.ky,
        amount: finalAmount,
        lang: language,
        promoCode
      });

      if (res.success && res.order) {
        setActiveFinikOrder(res.order);
        return res.order as FinikPaymentOrder;
      }
    } catch (err: any) {
      console.warn('Backend payment create fallback notice:', err.message);
    } finally {
      setIsFinikProcessing(false);
    }

    // Graceful reliable MBank QR Order fallback (zero crashes)
    const fallbackPaymentId = `ORT-2026-${Date.now().toString().slice(-6)}`;
    const fallbackOrder: FinikPaymentOrder = {
      paymentId: fallbackPaymentId,
      userId: user?.id || 'user-demo-student',
      userName: user?.fullName || 'Студент',
      userEmail: user?.email || 'student@ort-online.kg',
      userPhone: user?.phone || '+996 700 000 000',
      tariffId: plan.id as any,
      tariffName: plan.name[language] || plan.name.ky,
      amount: finalAmount,
      currency: 'KGS',
      cardType: 'MBANK_QR',
      paymentStatus: 'PENDING',
      createdAt: new Date().toISOString(),
      provider: 'mbank',
      environment: 'beta',
      legalPayee: 'ОсОО «Билет Центр»',
      brandName: 'ОРТ ОНЛАЙН KG',
      qrPayload: `ST00012|Name=ОсОО "Билет Центр"|PersonalAcc=1230000000000000|BankName=MBANK|BIC=103001|Sum=${finalAmount * 100}|Purpose=ОРТ ОНЛАЙН KG: ${plan.name.ky} (${fallbackPaymentId})|PayeeINN=01234567891011`
    };
    setActiveFinikOrder(fallbackOrder);
    return fallbackOrder;
  };

  const checkFinikStatus = async (paymentId: string): Promise<FinikPaymentOrder | null> => {
    try {
      const res = await api.getFinikPaymentStatus(paymentId);
      if (res.success && res.order) {
        const order = res.order as FinikPaymentOrder;
        setActiveFinikOrder(order);

        if (order.paymentStatus === 'PAID') {
          if (user) {
            setUser({
              ...user,
              subscriptionTier: order.tariffId,
              subscriptionExpires: order.expiresAt || new Date(Date.now() + 30 * 86400000).toISOString()
            });
          }
          showToast(
            language === 'ky'
              ? `Төлөм кабыл алынды! «${order.tariffName}» тарифи активдештирилди.`
              : `Оплата успешно подтверждена! Тариф «${order.tariffName}» активирован.`,
            'success'
          );
        }
        return order;
      }
      return null;
    } catch (e: any) {
      console.error('Error polling Finik payment status:', e);
      return null;
    }
  };

  const simulateFinikWebhookSuccess = async (paymentId: string): Promise<FinikPaymentOrder | undefined> => {
    try {
      const res = await api.simulateFinikWebhook(paymentId, 'PAID');
      if (res.success && res.order) {
        const order = res.order as FinikPaymentOrder;
        setActiveFinikOrder(order);
        if (user) {
          setUser({
            ...user,
            subscriptionTier: order.tariffId,
            subscriptionExpires: order.expiresAt || new Date(Date.now() + 30 * 86400000).toISOString()
          });
        }
        showToast(
          language === 'ky'
            ? 'Finik Webhook иштетилди: Төлөм ырасталды жана подписка активдешти!'
            : 'Finik Webhook обработан: Оплата подтверждена и подписка активирована!',
          'success'
        );
        return order;
      }
    } catch (err: any) {
      showToast(err.message || 'Webhook simulation error', 'error');
    }
  };

  const subscriptionAlert = React.useMemo(() => {
    if (!user || user.subscriptionTier === 'free' || !user.subscriptionExpires) {
      return { type: null, daysLeft: 0 };
    }
    const now = Date.now();
    const exp = new Date(user.subscriptionExpires).getTime();
    const diffMs = exp - now;
    const daysLeft = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

    if (daysLeft <= 0) {
      return { type: 'expired' as const, daysLeft: 0 };
    } else if (daysLeft <= 1) {
      return { type: 'expiring_1_day' as const, daysLeft };
    } else if (daysLeft <= 3) {
      return { type: 'expiring_3_days' as const, daysLeft };
    }
    return { type: null, daysLeft };
  }, [user?.subscriptionExpires, user?.subscriptionTier]);

  return (
    <AppContext.Provider
      value={{
        language,
        setLanguage,
        t,
        currentView,
        navigate,
        viewParams,
        user,
        setUser,
        questions,
        diagnosticResult,
        setDiagnosticResult,
        selectedSubject,
        setSelectedSubject,
        isAuthModalOpen,
        setIsAuthModalOpen,
        isPaymentModalOpen,
        setIsPaymentModalOpen,
        selectedPlan,
        setSelectedPlan,
        promoCodes,
        transactions,
        toasts,
        showToast,
        dismissToast,
        activeFinikOrder,
        setActiveFinikOrder,
        isFinikProcessing,
        isFinikActive,
        isFinikEnabled,
        initiateFinikPayment,
        checkFinikStatus,
        simulateFinikWebhookSuccess,
        subscriptionAlert,
        loginDemo,
        registerUser,
        logout,
        saveDiagnosticScore,
        addQuestion,
        editQuestion,
        updateQuestion: editQuestion,
        deleteQuestion,
        importQuestions,
        openPayment,
        confirmDemoPayment,
        deleteSavedPaymentMethod,
        toggleAutoRenew,
        applyPromo,
        toggleTaskCompletion,
        addToRepetition,
        reloadQuestions
      }}
    >
      {children}
      {/* Toast Notification Container */}
      <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2 max-w-sm pointer-events-none">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`pointer-events-auto px-4 py-3 rounded-2xl shadow-xl text-sm font-medium border flex items-center justify-between gap-3 animate-in fade-in slide-in-from-bottom-3 ${
              toast.type === 'success'
                ? 'bg-emerald-900 text-emerald-50 border-emerald-700'
                : toast.type === 'error'
                ? 'bg-rose-900 text-rose-50 border-rose-700'
                : toast.type === 'warning'
                ? 'bg-amber-900 text-amber-50 border-amber-700'
                : 'bg-slate-900 text-white border-slate-800'
            }`}
          >
            <span>{toast.message}</span>
            <button
              onClick={() => dismissToast(toast.id)}
              className="text-white/60 hover:text-white text-xs px-1 font-bold"
            >
              ✕
            </button>
          </div>
        ))}
      </div>
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
