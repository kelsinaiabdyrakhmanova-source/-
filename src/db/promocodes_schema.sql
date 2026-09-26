-- ==============================================================================
-- BILIM AI — PROMOTIONAL CODES & DISCOUNTS DATABASE SCHEMA
-- PostgreSQL / Supabase Schema for Promotional Code Management, 
-- Usage Audit Logs, and Finik Payment Gateway Integration
-- ==============================================================================

-- Enable UUID extension if not already available
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ------------------------------------------------------------------------------
-- 1. PROMOCODES TABLE (Негизги промокоддор таблицасы)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS promocodes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code VARCHAR(32) NOT NULL UNIQUE,
    discount_type VARCHAR(16) NOT NULL CHECK (discount_type IN ('percentage', 'fixed')),
    discount_value INTEGER NOT NULL CHECK (discount_value > 0),
    discount_percent INTEGER NOT NULL DEFAULT 0,
    valid_until TIMESTAMPTZ NOT NULL,
    max_uses INTEGER DEFAULT NULL CHECK (max_uses IS NULL OR max_uses > 0),
    uses_count INTEGER NOT NULL DEFAULT 0 CHECK (uses_count >= 0),
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    min_order_amount INTEGER NOT NULL DEFAULT 0 CHECK (min_order_amount >= 0),
    description TEXT,
    applicable_tariffs TEXT[] NOT NULL DEFAULT ARRAY['standard', 'intensive'],
    created_by TEXT DEFAULT 'Администратор',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    -- Constraints
    CONSTRAINT chk_promocode_code_format CHECK (LENGTH(code) >= 3 AND code = UPPER(TRIM(code))),
    CONSTRAINT chk_percentage_limit CHECK (discount_type != 'percentage' OR (discount_value > 0 AND discount_value <= 100))
);

COMMENT ON TABLE promocodes IS 'Таблица скидочных промокодов платформы Bilim AI';
COMMENT ON COLUMN promocodes.code IS 'Уникальный промокод в верхнем регистре (напр. ORT2026, BILIM150)';
COMMENT ON COLUMN promocodes.discount_type IS 'Тип скидки: процентная (percentage) или фиксированная в сомах (fixed)';
COMMENT ON COLUMN promocodes.discount_value IS 'Значение скидки: процент (1-100) или сумма в сомах (напр. 150)';
COMMENT ON COLUMN promocodes.valid_until IS 'Дата и время окончания срока действия промокода';
COMMENT ON COLUMN promocodes.max_uses IS 'Максимальное количество использований (NULL = безлимитный)';
COMMENT ON COLUMN promocodes.uses_count IS 'Фактическое количество активаций';
COMMENT ON COLUMN promocodes.min_order_amount IS 'Минимальная сумма заказа в сомах для применения промокода';
COMMENT ON COLUMN promocodes.applicable_tariffs IS 'Массив идентификаторов тарифов (standard, intensive)';

-- ------------------------------------------------------------------------------
-- 2. PROMOCODE USAGES AUDIT LOG (Колдонуу тарыхы жана аудит)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS promocode_usages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    promocode_id UUID REFERENCES promocodes(id) ON DELETE SET NULL,
    code VARCHAR(32) NOT NULL,
    user_id TEXT NOT NULL,
    user_name TEXT,
    user_phone TEXT,
    order_id TEXT NOT NULL,
    tariff_id TEXT NOT NULL CHECK (tariff_id IN ('standard', 'intensive', 'free')),
    original_amount INTEGER NOT NULL CHECK (original_amount >= 0),
    discount_amount INTEGER NOT NULL CHECK (discount_amount >= 0),
    final_amount INTEGER NOT NULL CHECK (final_amount >= 0),
    payment_status VARCHAR(16) NOT NULL CHECK (payment_status IN ('PENDING', 'PAID', 'FAILED', 'REFUNDED')) DEFAULT 'PENDING',
    payment_provider VARCHAR(32) NOT NULL DEFAULT 'finik',
    used_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT chk_final_math CHECK (final_amount = GREATEST(0, original_amount - discount_amount))
);

COMMENT ON TABLE promocode_usages IS 'Аудит использования промокодов с привязкой к заказам и платежам';

-- ------------------------------------------------------------------------------
-- 3. FINIK PAYMENT ORDERS (Finik төлөм буйрутмалары)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS finik_payment_orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    payment_id UUID NOT NULL UNIQUE,
    user_id TEXT NOT NULL,
    user_name TEXT,
    user_email TEXT,
    user_phone TEXT,
    tariff_id TEXT NOT NULL,
    tariff_name TEXT NOT NULL,
    amount_som INTEGER NOT NULL CHECK (amount_som >= 0),
    original_amount INTEGER CHECK (original_amount >= amount_som),
    discount_amount INTEGER DEFAULT 0 CHECK (discount_amount >= 0),
    promo_code VARCHAR(32),
    currency VARCHAR(8) NOT NULL DEFAULT 'KGS',
    card_type VARCHAR(24) NOT NULL DEFAULT 'FINIK_QR',
    payment_status VARCHAR(20) NOT NULL CHECK (payment_status IN ('PENDING', 'PAID', 'FAILED', 'CANCELLED', 'EXPIRED', 'REFUNDED')) DEFAULT 'PENDING',
    qr_payload TEXT,
    payment_url TEXT,
    provider VARCHAR(20) NOT NULL DEFAULT 'finik',
    environment VARCHAR(20) NOT NULL DEFAULT 'beta',
    idempotency_key TEXT,
    webhook_received_at TIMESTAMPTZ,
    paid_at TIMESTAMPTZ,
    whatsapp_notified BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ------------------------------------------------------------------------------
-- 4. PERFORMANCE & LOOKUP INDEXES
-- ------------------------------------------------------------------------------
CREATE INDEX IF NOT EXISTS idx_promocodes_code ON promocodes(code);
CREATE INDEX IF NOT EXISTS idx_promocodes_is_active_valid ON promocodes(is_active, valid_until);
CREATE INDEX IF NOT EXISTS idx_promocode_usages_code ON promocode_usages(code);
CREATE INDEX IF NOT EXISTS idx_promocode_usages_user_id ON promocode_usages(user_id);
CREATE INDEX IF NOT EXISTS idx_promocode_usages_order_id ON promocode_usages(order_id);
CREATE INDEX IF NOT EXISTS idx_promocode_usages_status ON promocode_usages(payment_status);
CREATE INDEX IF NOT EXISTS idx_finik_orders_payment_id ON finik_payment_orders(payment_id);
CREATE INDEX IF NOT EXISTS idx_finik_orders_user_id ON finik_payment_orders(user_id);
CREATE INDEX IF NOT EXISTS idx_finik_orders_status ON finik_payment_orders(payment_status);

-- ------------------------------------------------------------------------------
-- 5. BUSINESS LOGIC STORED PROCEDURES & FUNCTIONS
-- ------------------------------------------------------------------------------

-- 5.1 Проверка и расчет скидки промокода (PostgreSQL Stored Function)
CREATE OR REPLACE FUNCTION fn_validate_promocode(
    p_code TEXT,
    p_tariff_id TEXT DEFAULT 'standard',
    p_base_amount INTEGER DEFAULT 490
)
RETURNS TABLE (
    is_valid BOOLEAN,
    error_message TEXT,
    promo_id UUID,
    promo_code TEXT,
    discount_type TEXT,
    discount_value INTEGER,
    calculated_discount INTEGER,
    final_amount INTEGER,
    effective_percent INTEGER
) LANGUAGE plpgsql AS $$
DECLARE
    v_promo promocodes%ROWTYPE;
    v_clean_code TEXT;
    v_discount INTEGER := 0;
    v_final INTEGER := p_base_amount;
    v_percent INTEGER := 0;
BEGIN
    v_clean_code := UPPER(TRIM(p_code));

    -- 1. Проверка наличия кода
    IF v_clean_code IS NULL OR LENGTH(v_clean_code) = 0 THEN
        RETURN QUERY SELECT FALSE, 'Промокодду киргизиңиз (Введите промокод)', NULL::UUID, NULL::TEXT, NULL::TEXT, 0, 0, p_base_amount, 0;
        RETURN;
    END IF;

    -- 2. Поиск в БД
    SELECT * INTO v_promo FROM promocodes WHERE code = v_clean_code;
    IF NOT FOUND THEN
        RETURN QUERY SELECT FALSE, format('Промокод «%s» табылган жок (не найден)', v_clean_code), NULL::UUID, NULL::TEXT, NULL::TEXT, 0, 0, p_base_amount, 0;
        RETURN;
    END IF;

    -- 3. Проверка активности
    IF NOT v_promo.is_active THEN
        RETURN QUERY SELECT FALSE, format('Промокод «%s» активдүү эмес (деактивирован)', v_clean_code), v_promo.id, v_promo.code, v_promo.discount_type, v_promo.discount_value, 0, p_base_amount, 0;
        RETURN;
    END IF;

    -- 4. Проверка срока действия
    IF v_promo.valid_until <= NOW() THEN
        RETURN QUERY SELECT FALSE, format('Промокод «%s» мөөнөтү бүттү (истек срок действия)', v_clean_code), v_promo.id, v_promo.code, v_promo.discount_type, v_promo.discount_value, 0, p_base_amount, 0;
        RETURN;
    END IF;

    -- 5. Проверка лимита активаций
    IF v_promo.max_uses IS NOT NULL AND v_promo.uses_count >= v_promo.max_uses THEN
        RETURN QUERY SELECT FALSE, format('Промокоддун лимити (%s) бүттү (лимит активаций исчерпан)', v_promo.max_uses), v_promo.id, v_promo.code, v_promo.discount_type, v_promo.discount_value, 0, p_base_amount, 0;
        RETURN;
    END IF;

    -- 6. Проверка применимости к тарифу
    IF p_tariff_id IS NOT NULL AND NOT (p_tariff_id = ANY(v_promo.applicable_tariffs)) THEN
        RETURN QUERY SELECT FALSE, format('Бул промокод «%s» тарифи үчүн жараксыз', p_tariff_id), v_promo.id, v_promo.code, v_promo.discount_type, v_promo.discount_value, 0, p_base_amount, 0;
        RETURN;
    END IF;

    -- 7. Проверка минимальной суммы заказа
    IF v_promo.min_order_amount > 0 AND p_base_amount < v_promo.min_order_amount THEN
        RETURN QUERY SELECT FALSE, format('Буйрутманын минималдуу суммасы: %s сом', v_promo.min_order_amount), v_promo.id, v_promo.code, v_promo.discount_type, v_promo.discount_value, 0, p_base_amount, 0;
        RETURN;
    END IF;

    -- 8. Расчет скидки
    IF v_promo.discount_type = 'percentage' THEN
        v_discount := ROUND((p_base_amount * v_promo.discount_value)::NUMERIC / 100);
        v_percent := v_promo.discount_value;
    ELSE
        v_discount := LEAST(p_base_amount, v_promo.discount_value);
        IF p_base_amount > 0 THEN
            v_percent := ROUND((v_discount::NUMERIC / p_base_amount) * 100);
        END IF;
    END IF;

    v_final := GREATEST(0, p_base_amount - v_discount);

    RETURN QUERY SELECT 
        TRUE, 
        'Промокод ийгиликтүү колдонулду'::TEXT, 
        v_promo.id, 
        v_promo.code, 
        v_promo.discount_type, 
        v_promo.discount_value, 
        v_discount, 
        v_final, 
        v_percent;
END;
$$;

-- 5.2 Автоматическое инкрементирование счетчика при подтверждении платежа
CREATE OR REPLACE FUNCTION fn_trg_increment_promocode_usage()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.payment_status = 'PAID' AND (OLD IS NULL OR OLD.payment_status != 'PAID') THEN
        IF NEW.promocode_id IS NOT NULL THEN
            UPDATE promocodes 
            SET uses_count = uses_count + 1,
                updated_at = NOW()
            WHERE id = NEW.promocode_id;
        ELSE
            UPDATE promocodes 
            SET uses_count = uses_count + 1,
                updated_at = NOW()
            WHERE code = NEW.code;
        END IF;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_promocode_usage_paid ON promocode_usages;
CREATE TRIGGER trg_promocode_usage_paid
AFTER INSERT OR UPDATE OF payment_status ON promocode_usages
FOR EACH ROW EXECUTE FUNCTION fn_trg_increment_promocode_usage();

-- ------------------------------------------------------------------------------
-- 6. ANALYTICAL VIEWS FOR REPORTING & ADMIN PANEL
-- ------------------------------------------------------------------------------

-- 6.1 Активные промокоды
CREATE OR REPLACE VIEW v_active_promocodes AS
SELECT 
    p.id,
    p.code,
    p.discount_type,
    p.discount_value,
    p.valid_until,
    p.uses_count,
    p.max_uses,
    (p.max_uses IS NULL OR p.uses_count < p.max_uses) AS has_remaining_uses,
    p.applicable_tariffs,
    p.description,
    p.created_at
FROM promocodes p
WHERE p.is_active = TRUE 
  AND p.valid_until > NOW()
ORDER BY p.created_at DESC;

-- 6.2 Эффективность промокодов (Performance KPIs)
CREATE OR REPLACE VIEW v_promocode_performance AS
SELECT 
    p.code,
    p.discount_type,
    p.discount_value,
    p.uses_count,
    p.max_uses,
    COUNT(u.id) FILTER (WHERE u.payment_status = 'PAID') AS confirmed_orders_count,
    COALESCE(SUM(u.original_amount) FILTER (WHERE u.payment_status = 'PAID'), 0) AS gross_sales_som,
    COALESCE(SUM(u.discount_amount) FILTER (WHERE u.payment_status = 'PAID'), 0) AS total_discount_given_som,
    COALESCE(SUM(u.final_amount) FILTER (WHERE u.payment_status = 'PAID'), 0) AS net_revenue_collected_som,
    p.is_active,
    p.valid_until
FROM promocodes p
LEFT JOIN promocode_usages u ON u.code = p.code
GROUP BY p.id, p.code, p.discount_type, p.discount_value, p.uses_count, p.max_uses, p.is_active, p.valid_until
ORDER BY net_revenue_collected_som DESC;

-- ------------------------------------------------------------------------------
-- 7. SEED DATA FOR DEMO & TESTING
-- ------------------------------------------------------------------------------
INSERT INTO promocodes (code, discount_type, discount_value, discount_percent, valid_until, max_uses, uses_count, is_active, min_order_amount, description, applicable_tariffs, created_by)
VALUES
    ('ORT2026', 'percentage', 20, 20, NOW() + INTERVAL '120 days', 100, 42, TRUE, 0, 'Скидка 20% для всех абитуриентов ОРТ 2026', ARRAY['standard', 'intensive'], 'Администратор'),
    ('BILIM150', 'fixed', 150, 15, NOW() + INTERVAL '90 days', 50, 18, TRUE, 400, 'Фиксированная скидка 150 сом на любой тариф', ARRAY['standard', 'intensive'], 'Маркетинг'),
    ('ALGA10', 'percentage', 10, 10, NOW() + INTERVAL '60 days', NULL, 8, TRUE, 0, 'Базовая скидка 10% без лимита активаций', ARRAY['standard', 'intensive'], 'Партнеры'),
    ('SUPERORT', 'percentage', 30, 30, NOW() + INTERVAL '45 days', 25, 5, TRUE, 800, 'Эксклюзивная скидка 30% на тариф Интенсив ОРТ', ARRAY['intensive'], 'Методисты'),
    ('EXPIRED30', 'percentage', 30, 30, NOW() - INTERVAL '30 days', 20, 15, FALSE, 0, 'Тестовый истекший промокод для проверки валидации', ARRAY['standard'], 'Система')
ON CONFLICT (code) DO NOTHING;
