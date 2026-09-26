export type Language = 'ky' | 'ru';

export type UserRole = 'student' | 'parent' | 'teacher' | 'admin';

export interface UserProfile {
  id: string;
  fullName: string;
  phone: string;
  email?: string;
  role: UserRole;
  grade?: string; // '9-класс', '10-класс', '11-класс', 'Бүтүрүүчү'
  instructionLanguage?: Language;
  region?: string; // Бишкек, Ош, Чуй, Жалал-Абад, Ысык-Көл, Нарын, Талас, Баткен
  targetScore?: number;
  selectedSubjects: string[];
  isMinor: boolean;
  parentPhone?: string;
  parentConsent?: boolean;
  subscriptionTier: 'free' | 'standard' | 'premium' | 'intensive';
  subscriptionStarts?: string;
  subscriptionStartedAt?: string;
  subscriptionExpires?: string;
  hasPaidSubscription?: boolean;
  activePlanName?: string;
  currentCourseMonth?: number; // 1..8
  completedCourseMonths?: number[]; // [1, 2, ...]
  freeUsageLimits?: {
    diagnosticUsed: boolean;
    demoLessonsCount: number;
    practiceTestUsed: boolean;
  };
  acceptedContract?: {
    offerVersion: string;
    acceptedAt: string;
    tariffId: string;
    amount: number;
    paymentId: string;
  };
  streakDays: number;
  predictedScore: number;
  completedTestsCount: number;
  correctAnswersCount: number;
  totalAnsweredCount: number;
  weeklyStudyMinutes: number;
  weakTopics: string[];
  strongTopics: string[];
  todayTasksCompleted: string[];
  repetitionQuestionIds: string[];
  savedPaymentMethods?: SavedPaymentMethod[];
  autoRenewSubscription?: boolean;
}

export interface SavedPaymentMethod {
  id: string;
  token: string; // Secure token from PCI-compliant payment provider
  cardType: 'visa' | 'mastercard' | 'elkart' | 'other';
  cardBrandName: string; // e.g. 'Visa', 'Mastercard', 'Элкарт'
  last4: string; // e.g. '1234'
  expiryMonth: string; // e.g. '12'
  expiryYear: string; // e.g. '28'
  savedAt: string;
  autoRenewEnabled: boolean;
  isDefault?: boolean;
  nextBillingDate?: string;
  billingAmount?: number;
  planTier?: 'free' | 'standard' | 'premium' | 'intensive';
}

export type SubjectId =
  | 'math'
  | 'analogies'
  | 'reading'
  | 'sentences'
  | 'grammar'
  | 'kyrgyz'
  | 'russian'
  | 'english'
  | 'history'
  | 'physics'
  | 'chemistry'
  | 'biology';

export interface LocalizedString {
  ky: string;
  ru: string;
}

export interface DailyStudyTask {
  id: string;
  title: LocalizedString;
  topic: LocalizedString;
  subjectId: SubjectId;
  durationMinutes: number;
  type: 'theory' | 'practice' | 'errors' | 'flashcards' | 'minitest';
  isCompleted: boolean;
}

export interface PersonalStudyPlan {
  id: string;
  userId: string;
  dailyDurationMinutes: 30 | 45 | 60 | 90 | 120;
  targetScore: number;
  daysUntilOrt: number;
  selectedSubjects: string[];
  tasks: DailyStudyTask[];
  updatedAt: string;
}

export interface TopicLesson {
  id: string;
  topicId: string;
  subjectId: SubjectId;
  title: LocalizedString;
  theory: LocalizedString;
  simpleExample: {
    problem: LocalizedString;
    solution: LocalizedString;
  };
  stepByStep: LocalizedString[];
  videoUrl?: string; // YouTube, Vimeo, or MP4
  videoDurationSeconds?: number;
  easyQuestions: Question[];
  mediumQuestions: Question[];
  hardQuestions: Question[];
  miniTestQuestions: Question[];
  status: 'draft' | 'under_review' | 'published';
  simplerExplanation?: LocalizedString;
}

export interface Flashcard {
  id: string;
  subjectId: SubjectId;
  category: 'formula' | 'grammar_rule' | 'word_meaning' | 'analogy_relation' | 'math_lifehack';
  front: LocalizedString;
  back: LocalizedString;
  example?: LocalizedString;
  masteryLevel: 'new' | 'learning' | 'mastered';
  reviewCount: number;
  nextReviewDate: string;
  intervalDays: number;
}

export interface StudentErrorItem {
  id: string;
  userId: string;
  questionId: string;
  questionText: LocalizedString;
  subjectId: SubjectId;
  topic: LocalizedString;
  studentAnswer: string;
  correctAnswer: string;
  whyWrong: LocalizedString;
  stepByStepSolution: LocalizedString;
  similarQuestionId?: string;
  createdAt: string;
  isResolved: boolean;
  resolvedAt?: string;
}

export interface WeeklyReportData {
  questionsSolved: number;
  accuracyPercent: number;
  progressGrowthPercent: number;
  completedTopicsCount: number;
  focusTopicsNextWeek: LocalizedString[];
  studyMinutes: number;
}

export interface ReportedQuestionError {
  id: string;
  questionId: string;
  userId?: string;
  reason: string;
  createdAt: string;
  status: 'open' | 'resolved';
}

export interface Question {
  id: string;
  subjectId: SubjectId;
  topic: LocalizedString;
  difficulty: 'easy' | 'medium' | 'hard';
  text: LocalizedString;
  passage?: LocalizedString;
  options: {
    ky: string[];
    ru: string[];
  };
  correctOptionIndex: number; // 0..3
  explanation: LocalizedString;
  formulaOrRule?: LocalizedString;
  similarExample?: LocalizedString;
  socraticHints?: {
    ky?: string[];
    ru?: string[];
  };
  simplerExplanation?: LocalizedString;
  status?: 'draft' | 'review' | 'published' | 'archived';
  isDemo?: boolean;
}

export interface SubjectInfo {
  id: SubjectId;
  name: LocalizedString;
  description: LocalizedString;
  iconName: string;
  isActive: boolean;
  totalQuestions: number;
  topicsCount: number;
}

export interface TariffPlan {
  id: 'free' | 'standard' | 'premium' | 'intensive';
  name: LocalizedString;
  price: number;
  originalPrice?: number;
  promoPrice?: number;
  promoDiscountPercent?: number;
  period: LocalizedString;
  description: LocalizedString;
  features: {
    ky: string[];
    ru: string[];
  };
  isPopular?: boolean;
  badge?: LocalizedString;
}

export interface TestResult {
  id: string;
  testType: 'diagnostic' | 'practice' | 'topic';
  subjectId?: SubjectId;
  date: string;
  score: number; // e.g. 110-245
  predictedScore: number;
  totalQuestions: number;
  correctCount: number;
  timeSpentSeconds: number;
  weakTopics: string[];
  strongTopics: string[];
  answers: {
    questionId: string;
    selectedIndex: number;
    isCorrect: boolean;
  }[];
}

export interface PromoCode {
  id: string;
  code: string;
  discountType: 'percentage' | 'fixed';
  discountValue: number; // 20 (for 20%) or 150 (for 150 KGS)
  discountPercent: number; // Backward compatibility with percentage
  minOrderAmount?: number; // Minimum order amount in Som required
  validUntil: string;
  usesCount: number;
  maxUses?: number | null; // null/undefined = unlimited
  isActive: boolean;
  description?: string;
  applicableTariffs?: ('standard' | 'premium' | 'intensive')[];
  ownerName?: string;
  teacherName?: string;
  partnerPhone?: string;
  internalNote?: string;
  registeredStudentsCount?: number;
  paidStudentsCount?: number;
  totalRevenueSom?: number;
  monthlyBreakdown?: Record<string, { usesCount: number; paidCount: number; revenueSom: number }>;
  createdAt?: string;
  createdBy?: string;
}

export interface PromoCodeUsage {
  id: string;
  promoCodeId?: string;
  code: string;
  userId: string;
  userName: string;
  userPhone: string;
  orderId: string;
  tariffId: string;
  originalAmount: number;
  discountAmount: number;
  finalAmount: number;
  usedAt: string;
  paymentStatus: 'PAID' | 'PENDING';
  paymentProvider?: string;
}

export interface PaymentTransaction {
  id: string;
  userName: string;
  userPhone: string;
  planId: 'free' | 'standard' | 'premium' | 'intensive';
  planName: string;
  amount: number;
  date: string;
  status: 'demo_pending' | 'active';
  method: string;
}

export interface Achievement {
  id: string;
  icon: string;
  title: LocalizedString;
  description: LocalizedString;
  isUnlocked: boolean;
  progressText?: string;
}

export type BadgeCategory = 'streak' | 'topic_mastery' | 'exam_milestone';
export type BadgeTier = 'bronze' | 'silver' | 'gold' | 'diamond';

export interface Badge {
  id: string;
  category: BadgeCategory;
  tier: BadgeTier;
  icon: string;
  title: LocalizedString;
  description: LocalizedString;
  requirementText: LocalizedString;
  rewardXp: number;
  isUnlocked: boolean;
  isClaimed: boolean;
  unlockedAt?: string;
  currentProgress: number;
  maxProgress: number;
  progressUnit: LocalizedString;
  relatedSubjectId?: SubjectId;
  relatedTopicName?: string;
}

export interface LeaderboardEntry {
  id: string;
  name: string;
  avatar?: string;
  region: string;
  school?: string;
  grade: string;
  masteryPoints: number; // XP
  streakDays: number;
  badgesCount: number;
  isCurrentUser?: boolean;
  predictedScore: number;
}

export type FinikPaymentStatus = 'PENDING' | 'UNDER_REVIEW' | 'PAID' | 'FAILED' | 'CANCELLED' | 'EXPIRED' | 'REFUNDED' | 'REJECTED';

export interface FinikPaymentOrder {
  paymentId: string; // Unique formatted ID (e.g. ORT-2026-000001) or UUID
  userId: string;
  userName: string;
  userEmail: string;
  userPhone: string;
  tariffId: 'free' | 'standard' | 'premium' | 'intensive';
  tariffName: string;
  amount: number;
  currency: 'KGS';
  cardType: 'FINIK_QR' | 'CARD' | 'RESERVE_QR' | 'MBANK_QR';
  paymentStatus: FinikPaymentStatus;
  createdAt: string;
  paidAt?: string;
  expiresAt?: string;
  paymentUrl?: string;
  qrPayload?: string;
  provider: 'finik' | 'reserve' | 'mbank';
  environment: 'beta' | 'production' | 'simulation';
  idempotencyKey?: string;
  webhookReceivedAt?: string;
  whatsAppNotified?: boolean;
  promoCode?: string;
  originalAmount?: number;
  discountAmount?: number;
  legalPayee?: string;
  brandName?: string;
  receiptUrl?: string;
  payerName?: string;
  payerPhone?: string;
  payerAmount?: number;
  rejectionReason?: string;
  verifiedAt?: string;
  verifiedBy?: string;
  transactionNumber?: string;
  receiptHash?: string;
  isDuplicateFlag?: boolean;
  duplicateMatchedId?: string;
  offerAccepted?: boolean;
  offerVersion?: string;
  offerAcceptedAt?: string;
}

export interface OfferAcceptanceRecord {
  id: string;
  userId: string;
  userName: string;
  userPhone: string;
  userEmail?: string;
  offerVersion: string; // 'v1.0-2026'
  tariffId: string;
  amountSom: number;
  paymentId?: string;
  ipAddress?: string;
  userAgent?: string;
  acceptedAt: string;
}

export interface PaymentStats {
  ordersTodayCount: number;
  revenueTodaySom: number;
  ordersWeekCount: number;
  revenueWeekSom: number;
  ordersMonthCount: number;
  revenueMonthSom: number;
  newSubscribersCount: number;
  activeSubscribersCount: number;
  expiredSubscribersCount: number;
  mostPopularTariff: string;
}

export interface AnalyticsRevenuePoint {
  date: string;
  label: string;
  revenue: number;
  ordersCount: number;
  standardRevenue: number;
  intensiveRevenue: number;
  newSubscribers: number;
}

export interface AnalyticsWeeklyPoint {
  weekLabel: string;
  startDate: string;
  revenue: number;
  ordersCount: number;
  newSubscribers: number;
  growthPercent: number;
}

export interface AnalyticsMonthlyPoint {
  monthLabel: string;
  yearMonth: string;
  revenue: number;
  ordersCount: number;
  newSubscribers: number;
  targetRevenue: number;
  growthPercent: number;
}

export interface AnalyticsSubscriptionPoint {
  date: string;
  label: string;
  totalSubscribers: number;
  activeSubscribers: number;
  newSubscribers: number;
  churnedSubscribers: number;
}

export interface AnalyticsTariffPerformance {
  id: string;
  nameKy: string;
  nameRu: string;
  priceSom: number;
  subscribersCount: number;
  ordersCount: number;
  revenueSom: number;
  revenueSharePercent: number;
  conversionRatePercent: number;
  avgRevenuePerUser: number;
}

export interface AnalyticsKPIs {
  todayRevenue: number;
  todayOrders: number;
  revenueGrowthDaily: number;
  weekRevenue: number;
  weekOrders: number;
  revenueGrowthWeekly: number;
  monthRevenue: number;
  monthOrders: number;
  revenueGrowthMonthly: number;
  allTimeRevenue: number;
  averageOrderValue: number;
  totalSubscribers: number;
  activeSubscribers: number;
  newSubscribersCount?: number;
  expiredSubscribers: number;
  autoRenewActiveCount: number;
  autoRenewPercent: number;
  churnRatePercent: number;
  retentionRatePercent: number;
  mostPopularTariff: string;
}

export interface ComprehensiveAnalyticsData {
  dailyRevenue: AnalyticsRevenuePoint[];
  weeklyRevenue: AnalyticsWeeklyPoint[];
  monthlyRevenue: AnalyticsMonthlyPoint[];
  subscriptionGrowth: AnalyticsSubscriptionPoint[];
  tariffPerformance: AnalyticsTariffPerformance[];
  kpis: AnalyticsKPIs;
  timeframe: string;
}

// ============================================================================
// POST-PAYMENT, RECEIPT, CRM, REFUND & WHATSAPP AUTOMATION TYPES
// ============================================================================

export type CrmClientStatus =
  | 'new'
  | 'registered'
  | 'checkout_started'
  | 'paid'
  | 'active_subscription'
  | 'expiring_soon'
  | 'expired'
  | 'vip'
  | 'inactive';

export interface CrmAdminNote {
  id: string;
  clientId: string;
  text: string;
  createdAt: string;
  author: string;
}

export interface CrmClient {
  id: string;
  fullName: string;
  phone: string;
  whatsAppPhone: string;
  email: string;
  registeredAt: string;
  language: 'ky' | 'ru';
  source: string;
  utm?: {
    source?: string;
    medium?: string;
    campaign?: string;
  };
  referralCode?: string;
  referredBy?: string;
  currentTariff: 'free' | 'standard' | 'intensive';
  currentTariffName: string;
  subscriptionStart?: string;
  subscriptionEnd?: string;
  purchasesCount: number;
  totalSpentSom: number;
  usedPromoCodes: string[];
  bonusBalance: number;
  lastActiveAt: string;
  status: CrmClientStatus;
  isVip: boolean;
  notes: CrmAdminNote[];
  serviceWhatsAppConsent: boolean;
  marketingWhatsAppConsent: boolean;
}

export interface ElectronicReceipt {
  id: string;
  orderNumber: string;
  paymentId: string;
  orderId: string;
  projectName: string;
  clientName: string;
  clientPhone: string;
  clientEmail: string;
  tariffName: string;
  tariffId: 'free' | 'standard' | 'intensive';
  costSom: number;
  discountSom: number;
  usedPromoCode?: string;
  bonusesUsedSom: number;
  finalAmountSom: number;
  paymentMethod: string;
  paidAt: string;
  status: 'PAID' | 'REFUNDED' | 'PARTIALLY_REFUNDED';
  qrCodeUrl?: string;
  isLegalReceipt: boolean; // strictly false (not a fiscal KKM cash receipt)
}

export interface PaymentRefundRecord {
  id: string;
  refundId: string;
  paymentId: string;
  orderId: string;
  clientName: string;
  clientPhone: string;
  originalAmountSom: number;
  refundAmountSom: number;
  isPartial: boolean;
  reason: string;
  createdAt: string;
  adminUser: string;
  status: 'PENDING' | 'SUCCESS' | 'FAILED';
  gatewayRefundId?: string;
  recalculatedSubscriptionEnd?: string;
}

export interface OrderTimelineEvent {
  title: string;
  description: string;
  timestamp: string;
  type: 'order_created' | 'payment_id_created' | 'checkout_opened' | 'webhook_received' | 'payment_confirmed' | 'subscription_activated' | 'whatsapp_sent' | 'receipt_generated' | 'refund_issued' | 'whatsapp_reminder';
}

export interface WhatsAppMessageLog {
  id: string;
  recipientPhone: string;
  recipientName: string;
  templateType: 'registration' | 'payment_success' | 'abandoned_reminder_1' | 'abandoned_reminder_2' | 'sub_expiring_3d' | 'sub_expiring_1d' | 'sub_expired' | 'refund' | 'promocode' | 'personal_offer';
  messageText: string;
  sentAt: string;
  status: 'SENT' | 'FAILED_TO_SEND';
  errorDetails?: string;
  relatedPaymentId?: string;
  isMarketing: boolean;
}

export interface WhatsAppTemplate {
  id: string;
  type: WhatsAppMessageLog['templateType'];
  title: string;
  category: 'service' | 'marketing';
  textRu: string;
  textKy: string;
  variables: string[];
}

export interface CrmAuditLog {
  id: string;
  adminUser: string;
  adminRole: 'owner' | 'admin' | 'support';
  action: string;
  targetType: 'client' | 'payment' | 'subscription' | 'refund' | 'bonus' | 'status';
  targetId: string;
  targetName?: string;
  details: string;
  createdAt: string;
}

export interface PaymentErrorLog {
  id: string;
  paymentId?: string;
  userId?: string;
  userName?: string;
  userPhone?: string;
  provider: string;
  errorCode: string;
  errorMessage: string;
  occurredAt: string;
}

export interface CrmDashboardStats {
  newClientsToday: number;
  successfulPaymentsToday: number;
  revenueTodaySom: number;
  abandonedPaymentsCount: number;
  subsExpiringToday: number;
  subsExpiring3Days: number;
  subsExpiredTotal: number;
  refundsTodayCount: number;
  refundsTodayAmountSom: number;
  abandonedFunnel: {
    startedCount: number;
    uncompletedCount: number;
    remindedCount: number;
    returnedCount: number;
    recoveredPaidCount: number;
    recoveryConversionPercent: number;
  };
}

