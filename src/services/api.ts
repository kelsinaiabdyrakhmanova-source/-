import { Question, SubjectId, UserProfile, TestResult } from '../types';

export const api = {
  async getDbStatus() {
    const res = await fetch('/api/db/status');
    return res.json();
  },

  async login(phone?: string, role?: string) {
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phone, role })
    });
    if (!res.ok) {
      const data = await res.json();
      throw new Error(data.error || 'Login failed');
    }
    return res.json();
  },

  async register(data: Partial<UserProfile>) {
    const res = await fetch('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    if (!res.ok) {
      const errorData = await res.json();
      throw new Error(errorData.error || 'Registration failed');
    }
    return res.json();
  },

  async getProfile(id: string) {
    const res = await fetch(`/api/auth/profile/${id}`);
    if (!res.ok) throw new Error('Profile fetch failed');
    return res.json();
  },

  async getQuestions(userRole?: string) {
    const headers: Record<string, string> = {};
    if (userRole) headers['x-user-role'] = userRole;
    const res = await fetch('/api/questions', { headers });
    return res.json();
  },

  async createQuestion(questionData: any) {
    const res = await fetch('/api/questions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(questionData)
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Failed to create question');
    }
    return res.json();
  },

  async updateQuestion(id: string, questionData: any) {
    const res = await fetch(`/api/questions/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(questionData)
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Failed to update question');
    }
    return res.json();
  },

  async archiveQuestion(id: string) {
    const res = await fetch(`/api/questions/${id}`, {
      method: 'DELETE'
    });
    return res.json();
  },

  async importQuestions(rows: any[], commit = false) {
    const res = await fetch('/api/questions/import', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ rows, commit })
    });
    return res.json();
  },

  async getDiagnosticQuestions(lang: 'ky' | 'ru') {
    const res = await fetch(`/api/tests/diagnostic/questions?lang=${lang}`);
    return res.json();
  },

  async startDiagnosticAttempt(userId: string, testLanguage: 'ky' | 'ru') {
    const res = await fetch('/api/tests/attempts/start', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, testLanguage })
    });
    return res.json();
  },

  async saveAttemptAnswer(attemptId: string, questionId: string, selectedOptionIndex: number, timeSpentSeconds: number) {
    const res = await fetch(`/api/tests/attempts/${attemptId}/answer`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ questionId, selectedOptionIndex, timeSpentSeconds })
    });
    return res.json();
  },

  async finishAttempt(attemptId: string, answersMap: Record<string, number>, timeSpentSeconds: number) {
    const res = await fetch(`/api/tests/attempts/${attemptId}/finish`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ answersMap, timeSpentSeconds })
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Evaluation failed');
    }
    return res.json();
  },

  async askAiExplainer(params: {
    questionText: string;
    options: string[];
    correctIndex: number;
    studentIndex?: number | null;
    explanation: string;
    formulaOrRule?: string;
    topic?: string;
    subjectId?: string;
    action: 'why_correct' | 'why_incorrect' | 'simpler' | 'similar' | 'custom';
    customQuery?: string;
    language: 'ky' | 'ru';
  }) {
    const res = await fetch('/api/ai/explain', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params)
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'AI Explainer request failed');
    }
    return res.json();
  },

  async getStudentCabinet(studentId: string) {
    const res = await fetch(`/api/student/${studentId}/cabinet`);
    return res.json();
  },

  async confirmPayment(data: {
    userId: string;
    planTier: string;
    amount: number;
    paymentMethod: string;
    promoCode?: string;
    saveCard?: boolean;
    autoRenew?: boolean;
    cardToken?: string;
    cardBrand?: string;
    last4?: string;
    expiryMonth?: string;
    expiryYear?: string;
    savedMethodId?: string;
  }) {
    const res = await fetch('/api/payment/confirm', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    return res.json();
  },

  async getPaymentMethods(userId: string) {
    const res = await fetch(`/api/payment/methods/${userId}`);
    return res.json();
  },

  async deleteSavedPaymentMethod(userId: string, methodId: string) {
    const res = await fetch(`/api/payment/methods/${userId}/${methodId}`, {
      method: 'DELETE'
    });
    return res.json();
  },

  async toggleAutoRenew(userId: string, enabled: boolean) {
    const res = await fetch(`/api/payment/autorenew/${userId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ enabled })
    });
    return res.json();
  },

  // --- Finik Payment SDK & Orders API ---
  async getFinikConfigStatus() {
    const res = await fetch('/api/payments/finik/config-status');
    return res.json();
  },

  async createFinikPayment(data: {
    userId: string;
    userName?: string;
    userEmail?: string;
    userPhone?: string;
    tariffId: string;
    tariffName: string;
    amount: number;
    lang?: string;
    promoCode?: string;
  }) {
    const res = await fetch('/api/payments/finik/create', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Failed to initiate payment with Finik');
    }
    return res.json();
  },

  async getFinikPaymentStatus(paymentId: string) {
    const res = await fetch(`/api/payments/finik/status/${paymentId}`);
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Failed to check payment status');
    }
    return res.json();
  },

  async simulateFinikWebhook(paymentId: string, status = 'PAID') {
    const res = await fetch('/api/payments/finik/simulate-webhook', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ paymentId, status })
    });
    return res.json();
  },

  async getPaymentOrders(filters?: { period?: string; status?: string; search?: string }) {
    const params = new URLSearchParams();
    if (filters?.period) params.set('period', filters.period);
    if (filters?.status) params.set('status', filters.status);
    if (filters?.search) params.set('search', filters.search);

    const res = await fetch(`/api/payments/orders?${params.toString()}`);
    return res.json();
  },

  async getPaymentStats() {
    const res = await fetch('/api/payments/stats');
    return res.json();
  },

  async sendWhatsAppExpiryReminder(userId: string, type: '3_days' | '1_day' | 'expired', phone?: string) {
    const res = await fetch('/api/notifications/whatsapp/remind-expiry', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, type, phone })
    });
    return res.json();
  },

  async submitPaymentReceipt(data: {
    paymentId: string;
    payerName: string;
    payerPhone: string;
    payerAmount: number;
    receiptUrl: string;
    transactionNumber?: string;
    offerAccepted?: boolean;
    offerVersion?: string;
  }) {
    const res = await fetch('/api/payments/submit-receipt', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Чекти жүктөөдө ката кетти');
    }
    return res.json();
  },

  async acceptOfferContract(data: {
    userId: string;
    userName: string;
    userPhone: string;
    userEmail?: string;
    offerVersion?: string;
    tariffId: string;
    amountSom: number;
    paymentId?: string;
  }) {
    const res = await fetch('/api/contracts/accept', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    return res.json();
  },

  async getUserContract(userId: string) {
    const res = await fetch(`/api/contracts/user/${userId}`);
    return res.json();
  },

  async getAdminContracts() {
    const res = await fetch('/api/admin/contracts');
    return res.json();
  },

  async getCourseProgress(userId: string) {
    const res = await fetch(`/api/course/progress/${userId}`);
    return res.json();
  },

  async completeCourseMonth(userId: string, monthNumber: number) {
    const res = await fetch(`/api/course/month/${monthNumber}/complete`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId })
    });
    return res.json();
  },

  async getSystemStatus() {
    const res = await fetch('/api/admin/system-status');
    return res.json();
  },

  async adminConfirmPayment(paymentId: string, adminUser = 'Администратор') {
    const res = await fetch('/api/payments/admin/confirm', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ paymentId, adminUser })
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Төлөмдү тастыктоодо ката кетти');
    }
    return res.json();
  },

  async adminRejectPayment(paymentId: string, reason?: string, adminUser = 'Администратор') {
    const res = await fetch('/api/payments/admin/reject', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ paymentId, reason, adminUser })
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Төлөмдү четке кагууда ката кетти');
    }
    return res.json();
  },

  // ==========================================
  // PROMO CODES API
  // ==========================================

  async getPromoCodes(filters?: { activeOnly?: boolean; search?: string }) {
    const params = new URLSearchParams();
    if (filters?.activeOnly) params.set('activeOnly', 'true');
    if (filters?.search) params.set('search', filters.search);
    const res = await fetch(`/api/promocodes?${params.toString()}`);
    return res.json();
  },

  async createPromoCode(data: {
    code: string;
    discountType?: 'percentage' | 'fixed';
    discountValue: number;
    validUntil: string;
    maxUses?: number | null;
    isActive?: boolean;
    minOrderAmount?: number;
    description?: string;
    applicableTariffs?: string[];
    createdBy?: string;
  }) {
    const res = await fetch('/api/promocodes', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    const json = await res.json();
    if (!res.ok) {
      throw new Error(json.error || 'Failed to create promo code');
    }
    return json;
  },

  async updatePromoCode(id: string, data: any) {
    const res = await fetch(`/api/promocodes/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    const json = await res.json();
    if (!res.ok) {
      throw new Error(json.error || 'Failed to update promo code');
    }
    return json;
  },

  async deletePromoCode(id: string) {
    const res = await fetch(`/api/promocodes/${id}`, {
      method: 'DELETE'
    });
    const json = await res.json();
    if (!res.ok) {
      throw new Error(json.error || 'Failed to delete promo code');
    }
    return json;
  },

  async togglePromoCodeActive(id: string, isActive?: boolean) {
    const res = await fetch(`/api/promocodes/${id}/toggle`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ isActive })
    });
    const json = await res.json();
    if (!res.ok) {
      throw new Error(json.error || 'Failed to toggle promo code');
    }
    return json;
  },

  async validatePromoCode(code: string, tariffId?: string, amount?: number) {
    const res = await fetch('/api/promocodes/validate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ code, tariffId, amount })
    });
    const json = await res.json();
    if (!res.ok) {
      throw new Error(json.error || 'Invalid promo code');
    }
    return json;
  },

  async getPromoCodeUsages(filters?: { code?: string; search?: string }) {
    const params = new URLSearchParams();
    if (filters?.code) params.set('code', filters.code);
    if (filters?.search) params.set('search', filters.search);
    const res = await fetch(`/api/promocodes/usages?${params.toString()}`);
    return res.json();
  },

  async getPromoStats() {
    const res = await fetch('/api/promocodes/stats');
    return res.json();
  },

  async getAdminAnalytics(timeframe: string = '30d') {
    const res = await fetch(`/api/admin/analytics?timeframe=${encodeURIComponent(timeframe)}`);
    return res.json();
  },

  async getTelegramNotificationStatus() {
    const res = await fetch('/api/notifications/telegram/status');
    return res.json();
  },

  async testTelegramNotification() {
    const res = await fetch('/api/notifications/telegram/test', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    });
    return res.json();
  },

  async getMonthExamQuestions(monthNumber: number) {
    const res = await fetch(`/api/course/month/${monthNumber}/questions`);
    return res.json();
  },

  async submitMonthExam(data: {
    userId: string;
    monthNumber: number;
    completedLessonsCount: number;
    totalLessonsCount: number;
    answers: Record<string, number>;
    timeSpentSeconds?: number;
  }) {
    const res = await fetch(`/api/course/month/${data.monthNumber}/complete`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    const json = await res.json();
    if (!res.ok) {
      throw new Error(json.error || 'Тестти текшерүүдө ката кетти');
    }
    return json;
  }
};

