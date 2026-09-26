-- ==============================================================================
-- BILIM AI — SUPABASE / POSTGRESQL DATABASE SCHEMA
-- Подготовка к Общереспубликанскому тестированию (ОРТ) Кыргызстана
-- ==============================================================================

-- 1. Profiles (Пользователи и роли)
CREATE TABLE IF NOT EXISTS profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    auth_user_id UUID UNIQUE,
    full_name TEXT NOT NULL,
    phone TEXT NOT NULL UNIQUE,
    role TEXT NOT NULL CHECK (role IN ('student', 'parent', 'teacher', 'admin')) DEFAULT 'student',
    grade TEXT, -- '9-класс', '10-класс', '11-класс', 'Бүтүрүүчү'
    instruction_language TEXT NOT NULL CHECK (instruction_language IN ('ky', 'ru')) DEFAULT 'ky',
    region TEXT, -- Бишкек, Ош, Чуй, Жалал-Абад, Ысык-Көл, Нарын, Талас, Баткен
    target_score INTEGER DEFAULT 185,
    is_minor BOOLEAN DEFAULT TRUE,
    parent_phone TEXT,
    parent_consent BOOLEAN DEFAULT TRUE,
    subscription_tier TEXT CHECK (subscription_tier IN ('free', 'standard', 'intensive')) DEFAULT 'free',
    subscription_expires_at TIMESTAMPTZ,
    streak_days INTEGER DEFAULT 1,
    predicted_score INTEGER DEFAULT 120,
    completed_tests_count INTEGER DEFAULT 0,
    correct_answers_count INTEGER DEFAULT 0,
    total_answered_count INTEGER DEFAULT 0,
    weekly_study_minutes INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Subjects (Предметы ОРТ: математика, аналогии, чтение и доп. предметы)
CREATE TABLE IF NOT EXISTS subjects (
    id TEXT PRIMARY KEY, -- 'math', 'analogies', 'reading', etc.
    name_ky TEXT NOT NULL,
    name_ru TEXT NOT NULL,
    description_ky TEXT,
    description_ru TEXT,
    icon_name TEXT NOT NULL DEFAULT 'BookOpen',
    is_active BOOLEAN DEFAULT TRUE,
    display_order INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Topics (Темы разделов ОРТ)
CREATE TABLE IF NOT EXISTS topics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    subject_id TEXT REFERENCES subjects(id) ON DELETE CASCADE,
    name_ky TEXT NOT NULL,
    name_ru TEXT NOT NULL,
    description_ky TEXT,
    description_ru TEXT,
    order_index INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Questions (База вопросов ОРТ)
CREATE TABLE IF NOT EXISTS questions (
    id TEXT PRIMARY KEY,
    subject_id TEXT REFERENCES subjects(id) ON DELETE RESTRICT,
    topic_ky TEXT NOT NULL,
    topic_ru TEXT NOT NULL,
    difficulty TEXT NOT NULL CHECK (difficulty IN ('easy', 'medium', 'hard')) DEFAULT 'medium',
    text_ky TEXT NOT NULL,
    text_ru TEXT NOT NULL,
    passage_ky TEXT, -- Для чтения и анализа текста
    passage_ru TEXT,
    explanation_ky TEXT NOT NULL,
    explanation_ru TEXT NOT NULL,
    formula_ky TEXT,
    formula_ru TEXT,
    hint_ky TEXT,
    hint_ru TEXT,
    status TEXT NOT NULL CHECK (status IN ('draft', 'review', 'published', 'archived')) DEFAULT 'published',
    is_demo BOOLEAN DEFAULT TRUE,
    author_name TEXT DEFAULT 'Методический отдел Bilim AI',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Answer Options (Варианты ответов A, B, C, D)
CREATE TABLE IF NOT EXISTS answer_options (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    question_id TEXT REFERENCES questions(id) ON DELETE CASCADE,
    option_order INTEGER NOT NULL CHECK (option_order BETWEEN 0 AND 3),
    text_ky TEXT NOT NULL,
    text_ru TEXT NOT NULL,
    is_correct BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. Tests (Тесты: диагностический, тренировочный, пробный ОРТ)
CREATE TABLE IF NOT EXISTS tests (
    id TEXT PRIMARY KEY,
    title_ky TEXT NOT NULL,
    title_ru TEXT NOT NULL,
    test_type TEXT NOT NULL CHECK (test_type IN ('diagnostic', 'practice', 'topic', 'mock_full')),
    duration_minutes INTEGER DEFAULT 20,
    total_questions INTEGER DEFAULT 20,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. Test Questions (Связь вопросов с тестами)
CREATE TABLE IF NOT EXISTS test_questions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    test_id TEXT REFERENCES tests(id) ON DELETE CASCADE,
    question_id TEXT REFERENCES questions(id) ON DELETE CASCADE,
    order_index INTEGER NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(test_id, question_id)
);

-- 8. Test Attempts (Попытки прохождения тестов пользователем)
CREATE TABLE IF NOT EXISTS test_attempts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    test_id TEXT REFERENCES tests(id) ON DELETE CASCADE,
    status TEXT NOT NULL CHECK (status IN ('in_progress', 'completed', 'abandoned')) DEFAULT 'in_progress',
    test_language TEXT NOT NULL CHECK (test_language IN ('ky', 'ru')) DEFAULT 'ky',
    started_at TIMESTAMPTZ DEFAULT NOW(),
    completed_at TIMESTAMPTZ,
    time_spent_seconds INTEGER DEFAULT 0,
    total_questions INTEGER DEFAULT 0,
    correct_count INTEGER DEFAULT 0,
    incorrect_count INTEGER DEFAULT 0,
    skipped_count INTEGER DEFAULT 0,
    score_percentage NUMERIC(5, 2) DEFAULT 0,
    predicted_score INTEGER DEFAULT 110,
    diagnostic_report JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 9. Student Answers (Ответы ученика по каждому вопросу в попытке)
CREATE TABLE IF NOT EXISTS student_answers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    attempt_id UUID REFERENCES test_attempts(id) ON DELETE CASCADE,
    question_id TEXT REFERENCES questions(id) ON DELETE CASCADE,
    selected_option_index INTEGER, -- 0..3 or NULL if skipped
    is_correct BOOLEAN DEFAULT FALSE,
    answered_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(attempt_id, question_id)
);

-- 10. Study Progress (Прогресс ученика по темам и дням)
CREATE TABLE IF NOT EXISTS study_progress (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    subject_id TEXT REFERENCES subjects(id) ON DELETE CASCADE,
    topic_name TEXT NOT NULL,
    total_attempts INTEGER DEFAULT 0,
    correct_attempts INTEGER DEFAULT 0,
    mastery_level TEXT NOT NULL CHECK (mastery_level IN ('needs_basics', 'needs_practice', 'good', 'strong')) DEFAULT 'needs_basics',
    last_practiced_at TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, subject_id, topic_name)
);

-- 11. Subscriptions & Transactions (Подписки и оплаты)
CREATE TABLE IF NOT EXISTS subscriptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    plan_tier TEXT NOT NULL CHECK (plan_tier IN ('free', 'standard', 'intensive')),
    amount_som INTEGER NOT NULL DEFAULT 0,
    payment_method TEXT NOT NULL, -- 'MBank', 'Optima', 'O!Dengi', 'QR (Элкарт)'
    payment_status TEXT NOT NULL CHECK (payment_status IN ('pending', 'active', 'expired', 'failed')) DEFAULT 'active',
    promo_code TEXT,
    starts_at TIMESTAMPTZ DEFAULT NOW(),
    expires_at TIMESTAMPTZ DEFAULT NOW() + INTERVAL '30 days',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 12. Promocodes (Таблица промокодов и скидок)
CREATE TABLE IF NOT EXISTS promocodes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code TEXT NOT NULL UNIQUE,
    discount_type TEXT NOT NULL CHECK (discount_type IN ('percentage', 'fixed')) DEFAULT 'percentage',
    discount_value INTEGER NOT NULL CHECK (discount_value > 0),
    valid_until TIMESTAMPTZ NOT NULL,
    max_uses INTEGER DEFAULT NULL,
    uses_count INTEGER NOT NULL DEFAULT 0,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    min_order_amount INTEGER NOT NULL DEFAULT 0,
    description TEXT,
    applicable_tariffs TEXT[] DEFAULT ARRAY['standard', 'intensive'],
    created_by TEXT DEFAULT 'Администратор',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 13. Promocode Usages (История использования промокодов)
CREATE TABLE IF NOT EXISTS promocode_usages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    promocode_id UUID REFERENCES promocodes(id) ON DELETE SET NULL,
    code TEXT NOT NULL,
    user_id TEXT,
    user_name TEXT,
    user_phone TEXT,
    order_id TEXT NOT NULL,
    tariff_id TEXT NOT NULL,
    original_amount INTEGER NOT NULL DEFAULT 0,
    discount_amount INTEGER NOT NULL DEFAULT 0,
    final_amount INTEGER NOT NULL DEFAULT 0,
    payment_status TEXT NOT NULL CHECK (payment_status IN ('PENDING', 'PAID', 'FAILED')) DEFAULT 'PENDING',
    payment_provider TEXT DEFAULT 'finik',
    used_at TIMESTAMPTZ DEFAULT NOW()
);

-- 14. Finik Payment Orders (Finik төлөмдөрүнүн буйрутмалары)
CREATE TABLE IF NOT EXISTS finik_payment_orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    payment_id UUID NOT NULL UNIQUE,
    user_id TEXT NOT NULL,
    user_name TEXT,
    user_email TEXT,
    user_phone TEXT,
    tariff_id TEXT NOT NULL,
    tariff_name TEXT NOT NULL,
    amount_som INTEGER NOT NULL,
    original_amount INTEGER,
    discount_amount INTEGER DEFAULT 0,
    promo_code TEXT,
    currency TEXT NOT NULL DEFAULT 'KGS',
    card_type TEXT NOT NULL DEFAULT 'FINIK_QR',
    payment_status TEXT NOT NULL CHECK (payment_status IN ('PENDING', 'PAID', 'FAILED', 'CANCELLED', 'EXPIRED', 'REFUNDED')) DEFAULT 'PENDING',
    qr_payload TEXT,
    payment_url TEXT,
    provider TEXT NOT NULL DEFAULT 'finik',
    environment TEXT NOT NULL DEFAULT 'beta',
    idempotency_key TEXT,
    webhook_received_at TIMESTAMPTZ,
    paid_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indices for performance
CREATE INDEX IF NOT EXISTS idx_promocodes_code ON promocodes(code);
CREATE INDEX IF NOT EXISTS idx_promocodes_active ON promocodes(is_active);
CREATE INDEX IF NOT EXISTS idx_promocodes_valid_until ON promocodes(valid_until);
CREATE INDEX IF NOT EXISTS idx_promocode_usages_code ON promocode_usages(code);
CREATE INDEX IF NOT EXISTS idx_promocode_usages_user_id ON promocode_usages(user_id);
CREATE INDEX IF NOT EXISTS idx_finik_orders_payment_id ON finik_payment_orders(payment_id);
CREATE INDEX IF NOT EXISTS idx_finik_orders_status ON finik_payment_orders(payment_status);

-- ==============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ==============================================================================
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE answer_options ENABLE ROW LEVEL SECURITY;
ALTER TABLE test_attempts ENABLE ROW LEVEL SECURITY;
ALTER TABLE student_answers ENABLE ROW LEVEL SECURITY;
ALTER TABLE study_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE promocodes ENABLE ROW LEVEL SECURITY;
ALTER TABLE promocode_usages ENABLE ROW LEVEL SECURITY;

-- 1) Questions RLS: Students see published; Teachers/Admins see all
CREATE POLICY "Public and students can view published questions" 
    ON questions FOR SELECT 
    USING (status = 'published');

CREATE POLICY "Teachers and admins have full access to questions" 
    ON questions FOR ALL 
    USING (EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role IN ('teacher', 'admin')));

-- 2) Answer options: Students only see text; is_correct should not leak before answering!
CREATE POLICY "Users can view answer options" 
    ON answer_options FOR SELECT 
    USING (TRUE);

-- 3) Test attempts: Users see and update their own attempts
CREATE POLICY "Users view own attempts" 
    ON test_attempts FOR SELECT 
    USING (user_id = auth.uid());

CREATE POLICY "Users insert own attempts" 
    ON test_attempts FOR INSERT 
    WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users update own active attempts" 
    ON test_attempts FOR UPDATE 
    USING (user_id = auth.uid() AND status = 'in_progress');

-- 4) Student answers: Users write to their own attempt
CREATE POLICY "Users insert and view own answers" 
    ON student_answers FOR ALL 
    USING (EXISTS (SELECT 1 FROM test_attempts WHERE test_attempts.id = student_answers.attempt_id AND test_attempts.user_id = auth.uid()));

-- 5) Study progress: Users view and manage their own progress
CREATE POLICY "Users manage own progress" 
    ON study_progress FOR ALL 
    USING (user_id = auth.uid());

-- 6) Subscriptions: Users view their own subscriptions
CREATE POLICY "Users view own subscriptions" 
    ON subscriptions FOR SELECT 
    USING (user_id = auth.uid());

-- 7) Promocodes: Public can validate active codes; Admins have full access
CREATE POLICY "Public can view active promocodes" 
    ON promocodes FOR SELECT 
    USING (is_active = TRUE AND valid_until > NOW());

CREATE POLICY "Admins full access to promocodes" 
    ON promocodes FOR ALL 
    USING (EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin'));

-- 8) Promocode Usages: Admins full access; users can view their own usages
CREATE POLICY "Admins view all promocode usages" 
    ON promocode_usages FOR SELECT 
    USING (EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin'));

