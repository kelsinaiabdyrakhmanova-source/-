/**
 * BILIM AI — Promotional Codes Schema & Validation Models
 * TypeScript type definitions, business validation rules, and financial calculators
 */

export type PromoDiscountType = 'percentage' | 'fixed';
export type PromoTariffTier = 'standard' | 'intensive';

export interface PromoCodeModel {
  id: string;
  code: string;
  discountType: PromoDiscountType;
  discountValue: number; // e.g. 20 (for 20%) or 150 (for 150 Som)
  discountPercent: number; // calculated relative percent
  validUntil: string; // ISO 8601 string
  maxUses?: number | null; // null = unlimited
  usesCount: number;
  isActive: boolean;
  minOrderAmount?: number; // Minimum order in Som required (default 0)
  description?: string;
  applicableTariffs: PromoTariffTier[];
  createdAt: string;
  createdBy?: string;
  updatedAt?: string;
}

export interface PromoCodeUsageRecord {
  id: string;
  promoCodeId?: string;
  code: string;
  userId: string;
  userName?: string;
  userPhone?: string;
  orderId: string;
  tariffId: PromoTariffTier | string;
  originalAmount: number;
  discountAmount: number;
  finalAmount: number;
  paymentStatus: 'PENDING' | 'PAID' | 'FAILED' | 'REFUNDED';
  paymentProvider: 'finik' | 'card' | 'reserve';
  usedAt: string;
}

export interface PromoValidationResult {
  valid: boolean;
  error?: string;
  code?: string;
  discountType?: PromoDiscountType;
  discountValue?: number;
  discountAmount: number;
  discountPercent: number;
  originalAmount: number;
  finalAmount: number;
  promo?: PromoCodeModel;
  message?: string;
}

/**
 * Validates a promotional code against standard business constraints
 */
export function validatePromoCodeRules(
  promo: PromoCodeModel | undefined,
  requestedCode: string,
  tariffId?: string,
  baseAmount: number = 490
): PromoValidationResult {
  const cleanCode = (requestedCode || '').trim().toUpperCase();

  if (!cleanCode) {
    return {
      valid: false,
      error: 'Промокодду киргизиңиз (Введите промокод)',
      discountAmount: 0,
      discountPercent: 0,
      originalAmount: baseAmount,
      finalAmount: baseAmount
    };
  }

  if (!promo) {
    return {
      valid: false,
      error: `Промокод «${cleanCode}» табылган жок (Промокод не найден)`,
      discountAmount: 0,
      discountPercent: 0,
      originalAmount: baseAmount,
      finalAmount: baseAmount
    };
  }

  if (!promo.isActive) {
    return {
      valid: false,
      error: `Промокод «${cleanCode}» активдүү эмес же токтотулган (Промокод деактивирован)`,
      discountAmount: 0,
      discountPercent: 0,
      originalAmount: baseAmount,
      finalAmount: baseAmount,
      promo
    };
  }

  // Expiry check
  const now = Date.now();
  const expiryTime = new Date(promo.validUntil).getTime();
  if (expiryTime <= now) {
    const formattedDate = new Date(promo.validUntil).toLocaleDateString('ru-RU');
    return {
      valid: false,
      error: `Промокоддун «${cleanCode}» колдонуу мөөнөтү бүттү: ${formattedDate} (Срок действия истек)`,
      discountAmount: 0,
      discountPercent: 0,
      originalAmount: baseAmount,
      finalAmount: baseAmount,
      promo
    };
  }

  // Max uses check
  if (promo.maxUses !== null && promo.maxUses !== undefined && promo.usesCount >= promo.maxUses) {
    return {
      valid: false,
      error: `Промокоддун «${cleanCode}» активдештирүү лимити (${promo.maxUses}) бүттү (Лимит исчерпан)`,
      discountAmount: 0,
      discountPercent: 0,
      originalAmount: baseAmount,
      finalAmount: baseAmount,
      promo
    };
  }

  // Tariff compatibility check
  if (tariffId && promo.applicableTariffs && promo.applicableTariffs.length > 0) {
    if (!promo.applicableTariffs.includes(tariffId as PromoTariffTier)) {
      const allowedNames = promo.applicableTariffs
        .map((t) => (t === 'intensive' ? 'Интенсив ОРТ' : 'Стандарт'))
        .join(', ');
      return {
        valid: false,
        error: `Промокод «${cleanCode}» бул тарифке колдонулбайт. Жеткиликтүү тарифтер: ${allowedNames}`,
        discountAmount: 0,
        discountPercent: 0,
        originalAmount: baseAmount,
        finalAmount: baseAmount,
        promo
      };
    }
  }

  // Minimum order amount check
  if (promo.minOrderAmount && promo.minOrderAmount > 0 && baseAmount < promo.minOrderAmount) {
    return {
      valid: false,
      error: `Минималдуу буйрутма суммасы: ${promo.minOrderAmount} сом (Сумма заказа ниже минимума)`,
      discountAmount: 0,
      discountPercent: 0,
      originalAmount: baseAmount,
      finalAmount: baseAmount,
      promo
    };
  }

  // Accurate discount calculation
  let discountAmount = 0;
  if (promo.discountType === 'percentage') {
    discountAmount = Math.round(baseAmount * (promo.discountValue / 100));
  } else {
    discountAmount = Math.min(baseAmount, promo.discountValue);
  }

  const finalAmount = Math.max(0, baseAmount - discountAmount);
  const effectivePercent = baseAmount > 0 ? Math.round((discountAmount / baseAmount) * 100) : 0;

  return {
    valid: true,
    code: promo.code,
    discountType: promo.discountType,
    discountValue: promo.discountValue,
    discountAmount,
    discountPercent: effectivePercent,
    originalAmount: baseAmount,
    finalAmount,
    promo,
    message: `Промокод «${cleanCode}» ийгиликтүү колдонулду! (-${discountAmount} сом)`
  };
}
