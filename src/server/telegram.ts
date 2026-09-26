/**
 * Server-side Telegram Notification Service for ОРТ ОНЛАЙН KG
 * Uses official Telegram Bot API (https://core.telegram.org/bots/api#sendmessage)
 * 
 * STRICT RULES:
 * - Server-side only (never leaked to browser or frontend bundles)
 * - Safe fallback: Notification errors NEVER crash or halt business logic
 * - Enabled when TELEGRAM_ENABLED=true and credentials present
 */

export interface TelegramNotificationStatus {
  enabled: boolean;
  isConfigured: boolean;
  hasBotToken: boolean;
  hasChatId: boolean;
  warning: string | null;
}

export function getTelegramStatus(): TelegramNotificationStatus {
  const enabled = process.env.TELEGRAM_ENABLED === 'true';
  const hasBotToken = Boolean(process.env.TELEGRAM_BOT_TOKEN && process.env.TELEGRAM_BOT_TOKEN.trim());
  const hasChatId = Boolean(process.env.TELEGRAM_CHAT_ID && process.env.TELEGRAM_CHAT_ID.trim());
  const isConfigured = enabled && hasBotToken && hasChatId;

  let warning: string | null = null;
  if (enabled && (!hasBotToken || !hasChatId)) {
    const missing: string[] = [];
    if (!hasBotToken) missing.push('TELEGRAM_BOT_TOKEN');
    if (!hasChatId) missing.push('TELEGRAM_CHAT_ID');
    warning = `TELEGRAM_ENABLED=true, бирок төмөнкү өзгөрмөлөр жетишсиз: ${missing.join(', ')}. Telegram билдирүүлөрү жөнөтүлбөйт.`;
  }

  return {
    enabled,
    isConfigured,
    hasBotToken,
    hasChatId,
    warning
  };
}

export async function sendTelegramMessage(text: string, options?: { parseMode?: 'HTML' | 'MarkdownV2'; disableWebPagePreview?: boolean }): Promise<boolean> {
  const status = getTelegramStatus();
  if (!status.enabled) {
    // Silently skip if disabled
    return false;
  }

  if (!status.isConfigured) {
    if (status.warning) {
      console.warn(`⚠️ [TELEGRAM WARNING] ${status.warning}`);
    }
    console.log(`ℹ️ [TELEGRAM AUDIT LOG] Message not sent to Telegram API (unconfigured). Content:\n${text}`);
    return false;
  }

  const botToken = process.env.TELEGRAM_BOT_TOKEN!.trim();
  const chatId = process.env.TELEGRAM_CHAT_ID!.trim();

  try {
    const url = `https://api.telegram.org/bot${botToken}/sendMessage`;
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        chat_id: chatId,
        text,
        parse_mode: options?.parseMode,
        disable_web_page_preview: options?.disableWebPagePreview ?? true
      })
    });

    const data = await response.json().catch(() => null);
    if (!response.ok || !data?.ok) {
      console.warn(`⚠️ [TELEGRAM DISPATCH WARNING] Telegram API returned error:`, data?.description || response.statusText);
      return false;
    }

    console.log(`✅ [TELEGRAM DISPATCH] Admin notification delivered successfully to chat ${chatId}`);
    return true;
  } catch (err: any) {
    console.warn(`⚠️ [TELEGRAM NETWORK WARNING] Failed to send Telegram notification: ${err.message}`);
    return false;
  }
}

// --- Specific Notification Helpers ---

/**
 * 1. New User Registered
 */
export async function notifyNewUserRegistration(data: {
  fullName: string;
  phone: string;
  role: string;
  grade?: string;
  region?: string;
  targetScore?: number;
  instructionLanguage?: string;
}) {
  const dateStr = new Date().toLocaleString('ru-RU', { timeZone: 'Asia/Bishkek' });
  const msg = `👤 <b>ЖАҢЫ КОЛДОНУУЧУ КАТТАЛДЫ!</b>
━━━━━━━━━━━━━━━━━━━━
• <b>Аты-жөнү:</b> ${data.fullName}
• <b>Телефон:</b> ${data.phone}
• <b>Ролу:</b> ${data.role}
• <b>Классы:</b> ${data.grade || '—'}
• <b>Аймак:</b> ${data.region || '—'}
• <b>Окутуу тили:</b> ${data.instructionLanguage === 'ky' ? 'Кыргызча' : 'Русский'}
• <b>Максаттуу балл:</b> ${data.targetScore || '—'}
• <b>Убактысы:</b> ${dateStr} (Бишкек)
━━━━━━━━━━━━━━━━━━━━
🎯 <i>ОРТ ОНЛАЙН KG системасы</i>`;

  return sendTelegramMessage(msg, { parseMode: 'HTML' });
}

/**
 * 2. MBank QR Payment Submitted (Awaiting Verification)
 */
export async function notifyPaymentSubmitted(data: {
  paymentId: string;
  studentName: string;
  studentPhone: string;
  tariffName: string;
  amountSom: number;
  paymentMethod: string;
  transactionNumber?: string;
  isDuplicate?: boolean;
  duplicateMatchedId?: string;
  receiptUrl?: string;
}) {
  const dateStr = new Date().toLocaleString('ru-RU', { timeZone: 'Asia/Bishkek' });
  const duplicateAlert = data.isDuplicate
    ? `\n⚠️ <b>ЭСКЕРТҮҮ: КҮМӨНДҮҮ ДУБЛИКАТ ЧЕК!</b> (Дал келүү: ${data.duplicateMatchedId})\n`
    : '';

  const msg = `💳 <b>ЖАҢЫ ТӨЛӨМ ЧЕГИ ЖҮКТӨЛДҮ! (ТЕКШЕРҮҮ КҮТҮҮДӨ)</b>
━━━━━━━━━━━━━━━━━━━━${duplicateAlert}
• <b>Окуучу:</b> ${data.studentName}
• <b>Телефон:</b> ${data.studentPhone}
• <b>Тариф / Подписка:</b> ${data.tariffName}
• <b>Суммасы:</b> ${data.amountSom.toLocaleString()} сом
• <b>Төлөм ыкмасы:</b> ${data.paymentMethod || 'MBank QR'}
• <b>Төлөм ID:</b> <code>${data.paymentId}</code>
• <b>Транзакция №:</b> ${data.transactionNumber || 'Көрсөтүлгөн эмес'}
• <b>Статусу:</b> ⏳ Текшерүү күтүлүүдө (PENDING_VERIFICATION)
• <b>Убактысы:</b> ${dateStr} (Бишкек)
━━━━━━━━━━━━━━━━━━━━
Админ-панелде текшерип, тастыктоо же четке кагуу жүргүзүңүз.
🎯 <i>ОсОО «Билет Центр» | ОРТ ОНЛАЙН KG</i>`;

  return sendTelegramMessage(msg, { parseMode: 'HTML' });
}

/**
 * 3. Payment Approved & Subscription Activated
 */
export async function notifyPaymentApproved(data: {
  paymentId: string;
  studentName: string;
  studentPhone: string;
  tariffName: string;
  amountSom: number;
  paymentMethod: string;
  approvedBy: string;
  expiresAt?: string;
}) {
  const dateStr = new Date().toLocaleString('ru-RU', { timeZone: 'Asia/Bishkek' });
  const expiresFormatted = data.expiresAt
    ? new Date(data.expiresAt).toLocaleDateString('ru-RU', { timeZone: 'Asia/Bishkek' })
    : '8 айлык курс (толук)';

  const msg = `✅ <b>ТӨЛӨМ ТАСТЫКТАЛДЫ ЖАНА ПОДПИСКА АКТИВДЕШТИРИЛДИ!</b>
━━━━━━━━━━━━━━━━━━━━
• <b>Окуучу:</b> ${data.studentName}
• <b>Телефон:</b> ${data.studentPhone}
• <b>Тариф:</b> ${data.tariffName}
• <b>Сумма:</b> ${data.amountSom.toLocaleString()} сом
• <b>Ыкма:</b> ${data.paymentMethod || 'MBank QR'}
• <b>Төлөм ID:</b> <code>${data.paymentId}</code>
• <b>Тастыктаган:</b> ${data.approvedBy}
• <b>Статус:</b> ✅ <b>АКТИВДҮҮ (PAID / ACTIVE)</b>
• <b>Аяктоо мөөнөтү:</b> ${expiresFormatted}
• <b>Убактысы:</b> ${dateStr} (Бишкек)
━━━━━━━━━━━━━━━━━━━━
Окуучуга толук даярдык модулдары ачылды.
🎯 <i>ОРТ ОНЛАЙН KG</i>`;

  return sendTelegramMessage(msg, { parseMode: 'HTML' });
}

/**
 * 4. Promo Code Used
 */
export async function notifyPromoCodeUsed(data: {
  code: string;
  userName: string;
  userPhone: string;
  tariffId: string;
  originalAmount: number;
  discountAmount: number;
  finalAmount: number;
  orderId?: string;
}) {
  const dateStr = new Date().toLocaleString('ru-RU', { timeZone: 'Asia/Bishkek' });
  const msg = `🎟️ <b>ПРОМОКОД КОЛДОНУЛДУ!</b>
━━━━━━━━━━━━━━━━━━━━
• <b>Промокод:</b> <code>${data.code}</code>
• <b>Колдонуучу:</b> ${data.userName} (${data.userPhone})
• <b>Тариф:</b> ${data.tariffId}
• <b>Баштапкы баа:</b> ${data.originalAmount} сом
• <b>Арзандатуу:</b> -${data.discountAmount} сом
• <b>Төлөнгөн сумма:</b> ${data.finalAmount} сом
• <b>Буйрутма ID:</b> ${data.orderId || '—'}
• <b>Убактысы:</b> ${dateStr} (Бишкек)
━━━━━━━━━━━━━━━━━━━━
🎯 <i>ОРТ ОНЛАЙН KG Маркетинг</i>`;

  return sendTelegramMessage(msg, { parseMode: 'HTML' });
}

/**
 * 5. Important Admin Action Alert
 */
export async function notifyAdminImportantAction(data: {
  action: string;
  details: string;
  adminUser?: string;
}) {
  const dateStr = new Date().toLocaleString('ru-RU', { timeZone: 'Asia/Bishkek' });
  const msg = `⚠️ <b>АДМИН АРАКЕТИ / МААНИЛҮҮ БИЛДИРҮҮ</b>
━━━━━━━━━━━━━━━━━━━━
• <b>Аракет:</b> ${data.action}
• <b>Маалымат:</b> ${data.details}
• <b>Админ:</b> ${data.adminUser || 'Администратор'}
• <b>Убактысы:</b> ${dateStr} (Бишкек)
━━━━━━━━━━━━━━━━━━━━
🎯 <i>ОРТ ОНЛАЙН KG Коопсуздук</i>`;

  return sendTelegramMessage(msg, { parseMode: 'HTML' });
}
