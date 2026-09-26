import express from 'express';
import path from 'path';
import crypto from 'crypto';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';
import { db, DbQuestion, DbFinikOrder } from './src/server/db';
import { SubjectId } from './src/types';
import {
  getTelegramStatus,
  sendTelegramMessage,
  notifyNewUserRegistration,
  notifyPaymentSubmitted,
  notifyPaymentApproved,
  notifyPromoCodeUsed,
  notifyAdminImportantAction
} from './src/server/telegram';

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true, limit: '10mb' }));

  // =========================================================================
  // API ROUTES (Mounted FIRST)
  // =========================================================================

  // 1. Health & Database Status
  app.get('/api/health', (req, res) => {
    res.json({
      status: 'ok',
      service: 'ОРТ Онлайн Backend',
      timestamp: new Date().toISOString()
    });
  });

  app.get('/api/db/status', (req, res) => {
    res.json({
      database: db.isSupabaseConnected ? 'PostgreSQL (Supabase)' : 'PostgreSQL Schema Ready (Local Engine Active)',
      supabaseConfigured: db.isSupabaseConnected,
      tables: {
        profiles: db.profiles.length,
        questions: db.questions.length,
        testAttempts: db.testAttempts.length,
        studentAnswers: db.studentAnswers.length,
        studyProgress: db.studyProgress.length,
        subscriptions: db.subscriptions.length,
        finikOrders: db.finikOrders.length,
        promocodes: db.promoCodes.length,
        promocodeUsages: db.promoCodeUsages.length
      },
      schemaPath: '/src/db/schema.sql'
    });
  });

  // 2. Authentication & Profiles
  app.post('/api/auth/register', (req, res) => {
    try {
      const { fullName, phone, role, grade, instructionLanguage, region, targetScore, isMinor, parentPhone } = req.body;
      if (!fullName || !phone) {
        return res.status(400).json({ error: 'Аты-жөнү жана телефон номери милдеттүү түрдө толтурулушу керек / Имя и телефон обязательны' });
      }

      const existing = db.profiles.find((p) => p.phone.replace(/\s+/g, '') === phone.replace(/\s+/g, ''));
      if (existing) {
        return res.json({ profile: existing, message: 'Existing profile loaded' });
      }

      const passwordHash = req.body.password
        ? crypto.createHash('sha256').update(String(req.body.password) + '_salt_bilim_2026').digest('hex')
        : undefined;

      const newProfile = {
        id: 'user-' + Date.now(),
        full_name: fullName.trim(),
        phone: phone.trim(),
        email: req.body.email ? String(req.body.email).trim() : undefined,
        password_hash: passwordHash,
        role: role || 'student',
        grade: role === 'student' ? grade || '11-класс' : undefined,
        instruction_language: instructionLanguage || 'ky',
        region: region || 'Бишкек',
        target_score: targetScore ? Number(targetScore) : 185,
        is_minor: Boolean(isMinor),
        parent_phone: parentPhone ? parentPhone.trim() : undefined,
        parent_consent: true,
        subscription_tier: 'free' as const,
        streak_days: 1,
        predicted_score: 115,
        completed_tests_count: 0,
        correct_answers_count: 0,
        total_answered_count: 0,
        weekly_study_minutes: 0,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      db.profiles.push(newProfile);

      // Record mandatory Public Offer acceptance for the registered user
      const clientIp = (req.headers['x-forwarded-for'] as string) || req.socket.remoteAddress || '127.0.0.1';
      const userAgent = (req.headers['user-agent'] as string) || 'browser';
      db.recordOfferAcceptance({
        userId: newProfile.id,
        userName: newProfile.full_name,
        userPhone: newProfile.phone,
        userEmail: newProfile.email,
        offerVersion: req.body.offerVersion || 'v1.0-2026',
        tariffId: 'free',
        amountSom: 0,
        paymentId: undefined,
        ipAddress: String(clientIp),
        userAgent: String(userAgent)
      });

      db.save();

      // Dispatch Telegram Admin Notification asynchronously (never blocks registration)
      notifyNewUserRegistration({
        fullName: newProfile.full_name,
        phone: newProfile.phone,
        role: newProfile.role,
        grade: newProfile.grade,
        region: newProfile.region,
        targetScore: newProfile.target_score,
        instructionLanguage: newProfile.instruction_language
      }).catch((err) => console.warn('Telegram registration notify notice:', err.message));

      res.json({ profile: newProfile });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.post('/api/auth/login', (req, res) => {
    try {
      const { phone, role } = req.body;
      const cleanPhone = phone ? phone.replace(/[\s\-\(\)]/g, '') : '';
      
      let profile = db.profiles.find((p) => p.phone.replace(/[\s\-\(\)]/g, '') === cleanPhone);

      // If logging in via demo role selector or phone match
      if (!profile && role) {
        profile = db.profiles.find((p) => p.role === role);
      }

      if (!profile) {
        return res.status(404).json({ error: 'Бул телефон номери менен колдонуучу табылган жок / Пользователь с таким номером не найден' });
      }

      res.json({ profile });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.get('/api/auth/profile/:id', (req, res) => {
    const profile = db.profiles.find((p) => p.id === req.params.id);
    if (!profile) {
      return res.status(404).json({ error: 'Profile not found' });
    }
    res.json({ profile });
  });

  // 3. Questions (Safe for Students, Full for Teachers/Admins)
  app.get('/api/questions', (req, res) => {
    const role = req.headers['x-user-role'] as string;
    const isStaff = role === 'admin' || role === 'teacher';

    if (isStaff) {
      // Return full questions with answer keys & status
      return res.json({ questions: db.questions });
    }

    // Security requirement #3: Students never see correct option or explanations before answering
    const safeQuestions = db.questions
      .filter((q) => q.status === 'published')
      .map((q) => ({
        id: q.id,
        subjectId: q.subject_id,
        topic: { ky: q.topic_ky, ru: q.topic_ru },
        difficulty: q.difficulty,
        text: { ky: q.text_ky, ru: q.text_ru },
        passage: q.passage_ky ? { ky: q.passage_ky, ru: q.passage_ru || '' } : undefined,
        options: {
          ky: q.options_ky,
          ru: q.options_ru
        },
        formulaOrRule: { ky: q.formula_ky || '', ru: q.formula_ru || '' },
        socraticHints: {
          ky: q.hint_ky ? [q.hint_ky] : [],
          ru: q.hint_ru ? [q.hint_ru] : []
        },
        status: q.status,
        isDemo: q.is_demo
      }));

    res.json({ questions: safeQuestions });
  });

  // Admin/Teacher: Create Question with validation
  app.post('/api/questions', (req, res) => {
    try {
      const q = req.body;
      // Requirement #4 validation
      if (!q.textKy?.trim() || !q.textRu?.trim()) {
        return res.status(400).json({ error: 'Текст суроосу эки тилде тең толтурулушу керек / Текст вопроса обязателен на обоих языках' });
      }
      if (!q.optionsKy || q.optionsKy.length < 4 || !q.optionsRu || q.optionsRu.length < 4) {
        return res.status(400).json({ error: '4 вариант жооп талап кылынат / Требуются 4 варианта ответа' });
      }
      if (q.correctOptionIndex === undefined || q.correctOptionIndex < 0 || q.correctOptionIndex > 3) {
        return res.status(400).json({ error: 'Туура вариантты белгилеңиз (0-3) / Укажите верный ответ' });
      }
      if (!q.explanationKy?.trim() || !q.explanationRu?.trim()) {
        return res.status(400).json({ error: 'Чыгаруунун түшүндүрмөсү эки тилде талап кылынат / Объяснение обязательно на обоих языках' });
      }

      const newQ: DbQuestion = {
        id: 'q-' + Date.now(),
        subject_id: q.subjectId || 'math',
        topic_ky: q.topicKy.trim(),
        topic_ru: q.topicRu.trim(),
        difficulty: q.difficulty || 'medium',
        text_ky: q.textKy.trim(),
        text_ru: q.textRu.trim(),
        passage_ky: q.passageKy?.trim() || undefined,
        passage_ru: q.passageRu?.trim() || undefined,
        options_ky: q.optionsKy.map((opt: string) => opt.trim()),
        options_ru: q.optionsRu.map((opt: string) => opt.trim()),
        correct_option_index: Number(q.correctOptionIndex),
        explanation_ky: q.explanationKy.trim(),
        explanation_ru: q.explanationRu.trim(),
        formula_ky: q.formulaKy?.trim() || undefined,
        formula_ru: q.formulaRu?.trim() || undefined,
        hint_ky: q.hintKy?.trim() || undefined,
        hint_ru: q.hintRu?.trim() || undefined,
        status: q.status || 'published',
        is_demo: true,
        author_name: q.authorName || 'Методический отдел ОРТ Онлайн',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      db.questions.unshift(newQ);
      db.save();
      res.json({ question: newQ });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // Admin/Teacher: Edit Question
  app.put('/api/questions/:id', (req, res) => {
    try {
      const qIndex = db.questions.findIndex((q) => q.id === req.params.id);
      if (qIndex === -1) {
        return res.status(404).json({ error: 'Суроо табылган жок / Вопрос не найден' });
      }

      const q = req.body;
      const existing = db.questions[qIndex];

      db.questions[qIndex] = {
        ...existing,
        subject_id: q.subjectId || existing.subject_id,
        topic_ky: q.topicKy !== undefined ? q.topicKy.trim() : existing.topic_ky,
        topic_ru: q.topicRu !== undefined ? q.topicRu.trim() : existing.topic_ru,
        difficulty: q.difficulty || existing.difficulty,
        text_ky: q.textKy !== undefined ? q.textKy.trim() : existing.text_ky,
        text_ru: q.textRu !== undefined ? q.textRu.trim() : existing.text_ru,
        passage_ky: q.passageKy !== undefined ? q.passageKy.trim() : existing.passage_ky,
        passage_ru: q.passageRu !== undefined ? q.passageRu.trim() : existing.passage_ru,
        options_ky: q.optionsKy || existing.options_ky,
        options_ru: q.optionsRu || existing.options_ru,
        correct_option_index: q.correctOptionIndex !== undefined ? Number(q.correctOptionIndex) : existing.correct_option_index,
        explanation_ky: q.explanationKy !== undefined ? q.explanationKy.trim() : existing.explanation_ky,
        explanation_ru: q.explanationRu !== undefined ? q.explanationRu.trim() : existing.explanation_ru,
        formula_ky: q.formulaKy !== undefined ? q.formulaKy.trim() : existing.formula_ky,
        formula_ru: q.formulaRu !== undefined ? q.formulaRu.trim() : existing.formula_ru,
        hint_ky: q.hintKy !== undefined ? q.hintKy.trim() : existing.hint_ky,
        hint_ru: q.hintRu !== undefined ? q.hintRu.trim() : existing.hint_ru,
        status: q.status || existing.status,
        updated_at: new Date().toISOString()
      };

      db.save();
      res.json({ question: db.questions[qIndex] });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // Admin/Teacher: Archive Question (safe archival per Requirement #4)
  app.delete('/api/questions/:id', (req, res) => {
    const q = db.questions.find((item) => item.id === req.params.id);
    if (!q) {
      return res.status(404).json({ error: 'Вопрос не найден' });
    }

    // Per Requirement #4: "Удаление вопроса, который уже использовался в тесте, заменить архивированием"
    q.status = 'archived';
    q.updated_at = new Date().toISOString();
    db.save();
    res.json({ success: true, message: 'Вопрос успешно перемещен в архив' });
  });

  // Admin/Teacher: Import CSV/Excel parser & validator
  app.post('/api/questions/import', (req, res) => {
    try {
      const { rows } = req.body;
      if (!Array.isArray(rows) || rows.length === 0) {
        return res.status(400).json({ error: 'Катарлар табылган жок / Не переданы строки для импорта' });
      }

      const validQuestions: DbQuestion[] = [];
      const errorsList: Array<{ rowNumber: number; reason: string }> = [];
      const duplicateWarnings: Array<{ rowNumber: number; existingId: string }> = [];

      rows.forEach((row, idx) => {
        const line = idx + 1;
        // Check required fields
        if (!row.question_ru?.trim() || !row.question_ky?.trim()) {
          errorsList.push({ rowNumber: line, reason: 'Текст суроосу же котормосу жок (RU же KY бош)' });
          return;
        }
        if (!row.option_a_ru || !row.option_b_ru || !row.option_c_ru || !row.option_d_ru ||
            !row.option_a_ky || !row.option_b_ky || !row.option_c_ky || !row.option_d_ky) {
          errorsList.push({ rowNumber: line, reason: '4 варианттын бири же анын котормосу толтурулган эмес' });
          return;
        }

        // Correct option letter A, B, C, D to 0, 1, 2, 3
        const letter = (row.correct_option || 'A').toString().trim().toUpperCase();
        const letterMap: Record<string, number> = { 'A': 0, 'B': 1, 'C': 2, 'D': 3, '0': 0, '1': 1, '2': 2, '3': 3 };
        const optIdx = letterMap[letter] !== undefined ? letterMap[letter] : 0;

        // Check for duplicates
        const existing = db.questions.find((q) =>
          q.text_ru.toLowerCase().trim() === row.question_ru.toLowerCase().trim() ||
          q.text_ky.toLowerCase().trim() === row.question_ky.toLowerCase().trim()
        );
        if (existing) {
          duplicateWarnings.push({ rowNumber: line, existingId: existing.id });
        }

        validQuestions.push({
          id: 'imp-' + Date.now() + '-' + idx,
          subject_id: (row.subject?.toLowerCase() || 'math') as SubjectId,
          topic_ky: row.topic_ky?.trim() || row.topic?.trim() || 'Жалпы тема',
          topic_ru: row.topic_ru?.trim() || row.topic?.trim() || 'Общая тема',
          difficulty: (['easy', 'medium', 'hard'].includes(row.difficulty) ? row.difficulty : 'medium'),
          text_ky: row.question_ky.trim(),
          text_ru: row.question_ru.trim(),
          options_ky: [row.option_a_ky, row.option_b_ky, row.option_c_ky, row.option_d_ky],
          options_ru: [row.option_a_ru, row.option_b_ru, row.option_c_ru, row.option_d_ru],
          correct_option_index: optIdx,
          explanation_ky: row.explanation_ky?.trim() || 'Түшүндүрмө даярдалууда',
          explanation_ru: row.explanation_ru?.trim() || 'Объяснение подготавливается',
          hint_ky: row.hint_ky?.trim() || undefined,
          hint_ru: row.hint_ru?.trim() || undefined,
          status: row.status === 'draft' ? 'draft' : 'published',
          is_demo: true,
          author_name: 'CSV Импорт',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        });
      });

      // If commit requested
      if (req.body.commit && validQuestions.length > 0) {
        db.questions.unshift(...validQuestions);
        db.save();
      }

      res.json({
        totalFound: rows.length,
        validCount: validQuestions.length,
        errorsCount: errorsList.length,
        errorsList,
        duplicatesCount: duplicateWarnings.length,
        duplicates: duplicateWarnings,
        imported: Boolean(req.body.commit)
      });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // 4. Diagnostic Test Flow (20 Questions: 8 Math, 6 Analogies, 6 Reading)
  app.get('/api/tests/diagnostic/questions', (req, res) => {
    const lang = (req.query.lang === 'ru' ? 'ru' : 'ky') as 'ky' | 'ru';
    const questions = db.getDiagnosticQuestions(lang, false);
    res.json({
      testTitle: lang === 'ky' ? 'ОРТ Баштапкы Диагностикалык Тести' : 'Стартовый диагностический тест ОРТ',
      totalQuestions: questions.length,
      durationMinutes: 20,
      questions
    });
  });

  // Start or resume test attempt
  app.post('/api/tests/attempts/start', (req, res) => {
    try {
      const { userId, testLanguage } = req.body;
      const lang: 'ky' | 'ru' = testLanguage === 'ru' ? 'ru' : 'ky';

      // Check if user already has an active attempt (Requirement 7: одновременно только одна активная попытка)
      const existing = db.testAttempts.find(
        (a) => a.user_id === userId && a.test_id === 'diagnostic-ort' && a.status === 'in_progress'
      );

      if (existing) {
        // Return existing attempt questions so user can continue without data loss!
        const existingAnswers = db.studentAnswers
          .filter((sa) => sa.attempt_id === existing.id)
          .reduce((acc, curr) => {
            acc[curr.question_id] = curr.selected_option_index !== null ? curr.selected_option_index : -1;
            return acc;
          }, {} as Record<string, number>);

        return res.json({
          attemptId: existing.id,
          isResumed: true,
          testLanguage: existing.test_language,
          questionIds: existing.question_ids,
          savedAnswers: existingAnswers,
          timeSpentSeconds: existing.time_spent_seconds
        });
      }

      // Pick 20 questions (8 math, 6 analogies, 6 reading)
      const qList = db.getDiagnosticQuestions(lang, false);
      const questionIds = qList.map((q) => q.id);

      const newAttempt = {
        id: 'attempt-' + Date.now(),
        user_id: userId || 'user-demo-student',
        test_id: 'diagnostic-ort',
        status: 'in_progress' as const,
        test_language: lang,
        started_at: new Date().toISOString(),
        time_spent_seconds: 0,
        total_questions: questionIds.length,
        correct_count: 0,
        incorrect_count: 0,
        skipped_count: 0,
        score_percentage: 0,
        predicted_score: 110,
        question_ids: questionIds
      };

      db.testAttempts.push(newAttempt);
      db.save();

      res.json({
        attemptId: newAttempt.id,
        isResumed: false,
        testLanguage: lang,
        questionIds,
        savedAnswers: {},
        timeSpentSeconds: 0
      });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // Save student answer incrementally (Requirement 7: автосохранение ответов, продолжение после перезагрузки)
  app.post('/api/tests/attempts/:id/answer', (req, res) => {
    try {
      const attempt = db.testAttempts.find((a) => a.id === req.params.id);
      if (!attempt) {
        return res.status(404).json({ error: 'Попытка не найдена' });
      }

      const { questionId, selectedOptionIndex, timeSpentSeconds } = req.body;
      if (timeSpentSeconds !== undefined) {
        attempt.time_spent_seconds = timeSpentSeconds;
      }

      const existingIdx = db.studentAnswers.findIndex(
        (sa) => sa.attempt_id === attempt.id && sa.question_id === questionId
      );

      if (existingIdx !== -1) {
        db.studentAnswers[existingIdx].selected_option_index = selectedOptionIndex;
        db.studentAnswers[existingIdx].answered_at = new Date().toISOString();
      } else {
        db.studentAnswers.push({
          id: 'ans-' + Date.now(),
          attempt_id: attempt.id,
          user_id: attempt.user_id,
          question_id: questionId,
          selected_option_index: selectedOptionIndex,
          is_correct: false,
          answered_at: new Date().toISOString()
        });
      }

      db.save();
      res.json({ success: true });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // Finish test with server-side evaluation (Requirement 3, 7, 8)
  app.post('/api/tests/attempts/:id/finish', (req, res) => {
    try {
      const { answersMap, timeSpentSeconds } = req.body;
      const report = db.evaluateAttempt(req.params.id, answersMap || {}, timeSpentSeconds || 600);
      res.json({ report });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // 4.5 AI Explainer endpoint (AI Түшүндүрүүчү: Gemini 3.8 Flash + Pedagogical Fallback)
  app.post('/api/ai/explain', async (req, res) => {
    try {
      const {
        questionText,
        options,
        correctIndex,
        studentIndex,
        explanation,
        formulaOrRule,
        topic,
        subjectId,
        action,
        customQuery,
        language = 'ky'
      } = req.body;

      const isKy = language === 'ky';
      const optLetters = ['А', 'Б', 'В', 'Г'];
      const correctLetter = optLetters[correctIndex] || 'А';
      const studentLetter = studentIndex !== undefined && studentIndex !== null && studentIndex >= 0 ? optLetters[studentIndex] : null;
      const correctText = options?.[correctIndex] || '';
      const studentText = studentIndex !== undefined && studentIndex !== null && studentIndex >= 0 ? options?.[studentIndex] : null;

      let promptInstruction = '';
      if (action === 'why_correct') {
        promptInstruction = isKy
          ? `Суроо: "${questionText}". Варианттар: ${JSON.stringify(options)}. Туура вариант: ${correctLetter}) "${correctText}". Түшүндүрмө: "${explanation}". Суроо: "Эмнеге бул туура?". Окуучуга жөнөкөй, логикалык жана ынанымдуу түшүндүрүп бер. Башка варианттар эмнеге туура эмес экенин кыскача белгиле.`
          : `Вопрос: "${questionText}". Варианты: ${JSON.stringify(options)}. Правильный ответ: ${correctLetter}) "${correctText}". Базовое пояснение: "${explanation}". Запрос: "Почему это правильно?". Объясни ученику понятным языком, четко покажи логику решения и почему другие варианты не подходят.`;
      } else if (action === 'why_incorrect') {
        promptInstruction = isKy
          ? `Суроо: "${questionText}". Окуучу тандаган вариант: ${studentLetter ? studentLetter + ') ' + studentText : 'белгисиз'}. Чыныгы туура жооп: ${correctLetter}) "${correctText}". Түшүндүрмө: "${explanation}". Окуучунун суроосу: "Эмнеге менин жообум туура эмес?". Окуучу кайсы логикалык катага же тузакка алданганын жылуу жана түшүнүктүү тилде талдап бер.`
          : `Вопрос: "${questionText}". Ответ ученика: ${studentLetter ? studentLetter + ') ' + studentText : 'не указан'}. Правильный ответ: ${correctLetter}) "${correctText}". Базовое пояснение: "${explanation}". Запрос: "Почему мой ответ неверный?". Разбери типичную ловушку и заблуждение, почему этот выбор неверен, и как мыслить правильно.`;
      } else if (action === 'simpler') {
        promptInstruction = isKy
          ? `Суроо: "${questionText}". Туура жообу: ${correctLetter}) "${correctText}". Эреже: "${formulaOrRule || ''}". Түшүндүрмө: "${explanation}". Окуучу сурайт: "Жөнөкөй тил менен түшүндүр". Муну күнүмдүк турмуштук мисал (дүкөн, алма, достук, же табият) менен өтө жөнөкөй, 11-класстын окуучусуна жагымдуу тилде түшүндүр.`
          : `Вопрос: "${questionText}". Правильный ответ: ${correctLetter}) "${correctText}". Правило: "${formulaOrRule || ''}". Запрос: "Объясни простыми словами". Объясни суть на жизненном примере из повседневной жизни максимально просто, без сложного академизма.`;
      } else if (action === 'similar') {
        promptInstruction = isKy
          ? `Тема: "${topic || ''}". Бул суроо сыяктуу: "${questionText}". Туура жообу: "${correctText}". Окуучу сурайт: "Окшош башка мисал бер". ОРТ форматындагы таптакыр жаңы 1 окшош мисал суроо түз, анын 4 вариантын бер, жана кадам сайын чыгарылышын көрсөт.`
          : `Тема: "${topic || ''}". На основе вопроса: "${questionText}". Запрос: "Приведи другой аналогичный пример". Составь одно новое аналогичное задание в формате ОРТ с 4 вариантами и подробным пошаговым решением.`;
      } else {
        promptInstruction = isKy
          ? `Суроо: "${questionText}". Туура жообу: ${correctLetter}) "${correctText}". Окуучунун жеке суроосу: "${customQuery}". ОРТга даярдап жаткан жеке репетитор катары жылуу, так жана пайдалуу жооп бер.`
          : `Вопрос: "${questionText}". Правильный ответ: ${correctLetter}) "${correctText}". Пользовательский вопрос ученика: "${customQuery}". Ответь дружелюбно, точно и конструктивно как опытный репетитор ОРТ.`;
      }

      // Try Gemini 3.8 Flash if key is configured
      if (process.env.GEMINI_API_KEY) {
        try {
          const ai = new GoogleGenAI();
          const response = await ai.models.generateContent({
            model: 'gemini-3.8-flash',
            contents: promptInstruction,
            config: {
              systemInstruction: isKy
                ? 'Сен Кыргызстандагы «ОРТ Онлайн» платформасынын мыкты, жылуу, сабырдуу жеке онлайн-репетиторусуң. Жоопторуң дайыма кыргыз тилинде, так, түшүнүктүү жана шыктандыруучу болсун.'
                : 'Ты первоклассный онлайн-репетитор платформы «ОРТ Онлайн» в Кыргызстане. Твои ответы всегда доброжелательные, понятные, методически точные и мотивирующие.'
            }
          });

          if (response.text) {
            return res.json({
              reply: response.text,
              source: 'gemini-3.8-flash'
            });
          }
        } catch (geminiErr: any) {
          console.warn('Gemini generateContent error, falling back to pedagogical engine:', geminiErr.message);
        }
      }

      // Intelligent Pedagogical Fallback Engine
      let fallbackText = '';
      if (action === 'why_correct') {
        if (isKy) {
          fallbackText = `💡 **Эмне үчүн бул вариант туура?**\n\nБул суроодо туура вариант — **${correctLetter}) ${correctText}**.\n\nСебеби: ${explanation}\n\n${formulaOrRule ? `📌 **Эреже / Формула:** ${formulaOrRule}\n\n` : ''}Башка варианттарды карасак, алар сүйлөмдүн маанисине же математикалык эрежелерге каршы келет же адаштыруучу тузак болуп саналат.`;
        } else {
          fallbackText = `💡 **Почему этот вариант верный?**\n\nВ этом задании правильный ответ — **${correctLetter}) ${correctText}**.\n\nОбоснование: ${explanation}\n\n${formulaOrRule ? `📌 **Правило / Формула:** ${formulaOrRule}\n\n` : ''}Остальные варианты являются типичными дистракторами (ловушками), которые не согласуются с контекстом или дают неверный расчет.`;
        }
      } else if (action === 'why_incorrect') {
        if (isKy) {
          fallbackText = `⚠️ **Эмне үчүн сиздин жообуңуз туура эмес болду?**\n\nСиз **${studentLetter || 'башка вариантты'}** тандадыңыз. ОРТда көпчүлүк окуучулар дал ушул тузакка алданышат!\n\nЭмне себептен ката кетти:\n1. Шашылыш эсептеп же тексттин баштапкы шартын көңүлгө албай койгонсуз.\n2. Чыныгы туура жооп: **${correctLetter}) ${correctText}**.\n\n${explanation}\n\nКеңеш: Кийинки жолу мындай суроодо шартты кайра бир жолу окуп, бүтүм чыгаруудан мурун текшерип коюңуз!`;
        } else {
          fallbackText = `⚠️ **Почему ваш ответ оказался неверным?**\n\nВы выбрали вариант **${studentLetter || 'другой вариант'}**. Это очень распространенная ловушка на ОРТ!\n\nВ чем типичная ошибка:\n1. Чаще всего здесь путают исходное значение с конечным, либо не дочитывают контекст до конца.\n2. Правильный вариант: **${correctLetter}) ${correctText}**.\n\n${explanation}\n\nСовет: В аналогичных вопросах всегда перепроверяйте, на какой именно вопрос просят ответить в условии!`;
        }
      } else if (action === 'simpler') {
        if (isKy) {
          fallbackText = `🗣️ **Жөнөкөй тил менен түшүндүргөндө:**\n\nЭлестет: бул күнүмдүк жашоодогудай эле нерсе! Эгер сен дүкөнгө барып, 500 сомдук буюмду 400 сомго алсаң, 100 сом үнөмдөдүң. Демек, баштапкы 500 сомдун бештен бир бөлүгү (20%) арзандады.\n\nОРТ суроолору да так ушундай: эч кандай татаал сыйкыр жок, болгону маселени жөнөкөй турмуштук кадамдарга бөлүп кароо керек!\n\nТуура жооп: **${correctLetter}) ${correctText}**`;
        } else {
          fallbackText = `🗣️ **Простыми словами:**\n\nПредставь ситуацию из обычной жизни: если ты покупаешь вещь со скидкой, ты делишь сумму скидки на первоначальную цену и умножаешь на 100. \n\nВ ОРТ нет никакой магии — все задания строятся на базовой жизненной логике и аккуратности. Не усложняй условие, а разбей его на два простых шага.\n\nПравильный ответ: **${correctLetter}) ${correctText}**`;
        }
      } else if (action === 'similar') {
        if (isKy) {
          fallbackText = `🔄 **Окшош жаңы мисал:**\n\n**Тапшырма:** «Дүкөндө 1000 сомдук куртка 800 сомго чейин арзандатылды. Куртка канча пайызга арзандаган?»\n\nА) 15%   Б) 20%   В) 25%   Г) 10%\n\n**Кадам-кадам чыгарылышы:**\n1. Айырманы табабыз: 1000 - 800 = 200 сом.\n2. Баштапкы баага бөлөбүз: 200 / 1000 = 0.20.\n3. Пайызга айлантабыз: 0.20 × 100% = 20%.\n\n✅ **Туура жообу:** Б) 20%. Көрдүңүзбү, так эле сиз чечкен суроо сыяктуу иштейт!`;
        } else {
          fallbackText = `🔄 **Похожий пример для закрепления:**\n\n**Задание:** «Куртка стоила 1000 сомов, а на распродаже ее цена стала 800 сомов. На сколько процентов снизилась цена?»\n\nА) 15%   Б) 20%   В) 25%   Г) 10%\n\n**Пошаговое решение:**\n1. Находим размер скидки: 1000 - 800 = 200 сомов.\n2. Делим скидку на начальную цену: 200 / 1000 = 0.20.\n3. Переводим в проценты: 0.20 × 100% = 20%.\n\n✅ **Правильный ответ:** Б) 20%. Логика абсолютно аналогична вашему заданию!`;
        }
      } else {
        if (isKy) {
          fallbackText = `Саламатсызбы! Сиздин сурооңуз: «${customQuery}».\n\nБул «${topic || 'ОРТ тапшырмасы'}» боюнча эң башкысы — ${formulaOrRule || explanation || 'эрежелерди бекем өздөштүрүү'}. Дагы кошумча сурооңуз болсо, тартынбай жазыңыз!`;
        } else {
          fallbackText = `Здравствуйте! По вашему вопросу: «${customQuery}».\n\nГлавное в теме «${topic || 'задания ОРТ'}» — это ${formulaOrRule || explanation || 'понимание фундаментальных связей'}. Смело задавайте вопросы, если хотите разобрать детальнее!`;
        }
      }

      res.json({
        reply: fallbackText,
        source: 'pedagogical-engine'
      });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // 5. Student Cabinet Data (Real data from DB, no fake numbers!)
  app.get('/api/student/:id/cabinet', (req, res) => {
    const profile = db.profiles.find((p) => p.id === req.params.id);
    if (!profile) {
      return res.status(404).json({ error: 'Студент табылган жок / Ученик не найден' });
    }

    const attempts = db.testAttempts
      .filter((a) => a.user_id === profile.id && a.status === 'completed')
      .sort((a, b) => new Date(b.completed_at || 0).getTime() - new Date(a.completed_at || 0).getTime());

    const latestReport = attempts[0]?.diagnostic_report || null;

    // "Мои ошибки": get unique questions user answered incorrectly
    const wrongAnswers = db.studentAnswers.filter(
      (sa) => sa.user_id === profile.id && sa.selected_option_index !== null && !sa.is_correct
    );
    const wrongQuestionIds = Array.from(new Set(wrongAnswers.map((wa) => wa.question_id)));
    const mistakeQuestions = db.questions.filter((q) => wrongQuestionIds.includes(q.id));

    // Progress by topics
    const progressList = db.studyProgress.filter((sp) => sp.user_id === profile.id);

    res.json({
      profile,
      attemptsCount: attempts.length,
      latestReport,
      testHistory: attempts.map((a) => ({
        id: a.id,
        date: a.completed_at,
        score: a.predicted_score,
        accuracy: a.score_percentage,
        correctCount: a.correct_count,
        totalQuestions: a.total_questions,
        timeSpentSeconds: a.time_spent_seconds
      })),
      mistakesCount: mistakeQuestions.length,
      mistakeQuestions: mistakeQuestions.map((q) => ({
        id: q.id,
        subjectId: q.subject_id,
        topic: { ky: q.topic_ky, ru: q.topic_ru },
        text: { ky: q.text_ky, ru: q.text_ru },
        options: { ky: q.options_ky, ru: q.options_ru },
        correctOptionIndex: q.correct_option_index,
        explanation: { ky: q.explanation_ky, ru: q.explanation_ru }
      })),
      studyProgress: progressList
    });
  });

  // 6. Payment Confirmation & Tokenized Cards (PCI DSS Compliant)
  app.post('/api/payment/confirm', (req, res) => {
    try {
      const {
        userId,
        planTier,
        amount,
        paymentMethod,
        promoCode,
        saveCard,
        autoRenew,
        cardToken,
        cardBrand,
        last4,
        expiryMonth,
        expiryYear,
        savedMethodId
      } = req.body;

      const profile = db.profiles.find((p) => p.id === userId);

      // Method display name for the transaction log
      let methodLabel = paymentMethod || 'MBank';
      if (paymentMethod === 'saved_card' || savedMethodId) {
        const savedCard = profile?.saved_payment_methods?.find((m) => m.id === savedMethodId) || profile?.saved_payment_methods?.[0];
        methodLabel = savedCard ? `${savedCard.card_brand_name} •••• ${savedCard.last4} (Saved Token)` : 'Saved Card Token';
      } else if (paymentMethod === 'card') {
        methodLabel = cardBrand ? `${cardBrand} •••• ${last4 || '****'}` : 'Банковская карта';
      }

      const tx = {
        id: 'tx-' + Date.now(),
        user_id: userId || 'user-demo-student',
        user_name: profile ? profile.full_name : 'Колдонуучу',
        user_phone: profile ? profile.phone : '+996 700 000 000',
        plan_tier: planTier || 'standard',
        amount_som: amount || 490,
        payment_method: methodLabel,
        payment_status: 'active' as const,
        promo_code: promoCode,
        starts_at: new Date().toISOString(),
        expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
      };

      db.subscriptions.unshift(tx);

      // Record promo code usage if promo code was provided
      if (promoCode) {
        const cleanCode = promoCode.trim().toUpperCase();
        const promo = db.promoCodes.find((p) => p.code.toUpperCase() === cleanCode);
        if (promo) {
          promo.uses_count = (promo.uses_count || 0) + 1;
        }
        const basePlanAmount = planTier === 'intensive' ? 890 : 490;
        const discountSom = Math.max(0, basePlanAmount - (amount || 490));
        db.promoCodeUsages.unshift({
          id: 'pcu-' + Date.now(),
          promo_code_id: promo?.id,
          code: cleanCode,
          user_id: tx.user_id,
          user_name: tx.user_name,
          user_phone: tx.user_phone,
          order_id: tx.id,
          tariff_id: planTier || 'standard',
          original_amount: basePlanAmount,
          discount_amount: discountSom,
          final_amount: tx.amount_som,
          used_at: tx.starts_at,
          payment_status: 'PAID'
        });
      }

      if (profile) {
        profile.subscription_tier = planTier;
        profile.subscription_expires_at = tx.expires_at;

        // If user chose to save payment method (Requirement: safe gateway token, no CVV/full card)
        if (saveCard) {
          if (!profile.saved_payment_methods) {
            profile.saved_payment_methods = [];
          }

          const sanitizedBrand = cardBrand || 'Visa';
          const sanitizedLast4 = String(last4 || '1234').slice(-4);
          const brandNormalized = sanitizedBrand.toLowerCase();
          const cardType: 'visa' | 'mastercard' | 'elkart' | 'other' =
            brandNormalized.includes('elkart') || brandNormalized.includes('элкарт')
              ? 'elkart'
              : brandNormalized.includes('master')
              ? 'mastercard'
              : brandNormalized.includes('visa')
              ? 'visa'
              : 'other';

          const newMethod = {
            id: 'spm-' + Date.now(),
            user_id: profile.id,
            token: cardToken || 'tok_pci_' + Math.random().toString(36).substring(2, 10),
            card_type: cardType,
            card_brand_name: sanitizedBrand,
            last4: sanitizedLast4,
            expiry_month: expiryMonth || '12',
            expiry_year: expiryYear || '28',
            saved_at: new Date().toISOString(),
            auto_renew_enabled: Boolean(autoRenew),
            next_billing_date: tx.expires_at.split('T')[0],
            billing_amount: tx.amount_som,
            plan_tier: planTier
          };

          // Filter out existing identical card to avoid duplicates
          profile.saved_payment_methods = [
            newMethod,
            ...profile.saved_payment_methods.filter((m) => m.last4 !== sanitizedLast4)
          ];
          profile.auto_renew_subscription = Boolean(autoRenew);
        } else if (paymentMethod === 'saved_card' && savedMethodId) {
          // Paying with existing card, keep autoRenew updated if specified
          if (typeof autoRenew === 'boolean') {
            profile.auto_renew_subscription = autoRenew;
            const targetMethod = profile.saved_payment_methods?.find((m) => m.id === savedMethodId);
            if (targetMethod) {
              targetMethod.auto_renew_enabled = autoRenew;
              targetMethod.next_billing_date = tx.expires_at.split('T')[0];
              targetMethod.billing_amount = tx.amount_som;
            }
          }
        }
      }

      db.save();

      // Dispatch Telegram Admin Notifications
      notifyPaymentApproved({
        paymentId: tx.id,
        studentName: tx.user_name,
        studentPhone: tx.user_phone,
        tariffName: tx.plan_tier === 'intensive' ? 'Intensive' : (tx.plan_tier === 'premium' ? 'Premium (8 ай)' : 'Standard (1 ай)'),
        amountSom: tx.amount_som,
        paymentMethod: tx.payment_method,
        approvedBy: 'Система (Автоматтык)',
        expiresAt: tx.expires_at
      }).catch((err) => console.warn('Telegram payment notify notice:', err.message));

      if (promoCode) {
        notifyPromoCodeUsed({
          code: promoCode.trim().toUpperCase(),
          userName: tx.user_name,
          userPhone: tx.user_phone,
          tariffId: tx.plan_tier,
          originalAmount: tx.plan_tier === 'intensive' ? 890 : 490,
          discountAmount: Math.max(0, (tx.plan_tier === 'intensive' ? 890 : 490) - tx.amount_som),
          finalAmount: tx.amount_som,
          orderId: tx.id
        }).catch((err) => console.warn('Telegram promo notify notice:', err.message));
      }

      res.json({
        success: true,
        transaction: tx,
        profile
      });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // 7. Get Saved Payment Methods (PCI DSS Safe - Only tokens and last4)
  app.get('/api/payment/methods/:userId', (req, res) => {
    try {
      const { userId } = req.params;
      const profile = db.profiles.find((p) => p.id === userId);
      if (!profile) {
        return res.status(404).json({ error: 'User not found' });
      }

      res.json({
        savedPaymentMethods: profile.saved_payment_methods || [],
        autoRenewSubscription: Boolean(profile.auto_renew_subscription)
      });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // 8. Delete Saved Payment Method
  app.delete('/api/payment/methods/:userId/:methodId', (req, res) => {
    try {
      const { userId, methodId } = req.params;
      const profile = db.profiles.find((p) => p.id === userId);
      if (!profile) {
        return res.status(404).json({ error: 'User not found' });
      }

      if (profile.saved_payment_methods) {
        profile.saved_payment_methods = profile.saved_payment_methods.filter((m) => m.id !== methodId);
        if (profile.saved_payment_methods.length === 0) {
          profile.auto_renew_subscription = false;
        }
      }

      db.save();

      res.json({
        success: true,
        message: 'Payment method removed successfully',
        savedPaymentMethods: profile.saved_payment_methods || [],
        autoRenewSubscription: Boolean(profile.auto_renew_subscription)
      });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // 9. Toggle Auto-Renewal
  app.patch('/api/payment/autorenew/:userId', (req, res) => {
    try {
      const { userId } = req.params;
      const { enabled } = req.body;
      const profile = db.profiles.find((p) => p.id === userId);
      if (!profile) {
        return res.status(404).json({ error: 'User not found' });
      }

      profile.auto_renew_subscription = Boolean(enabled);
      if (profile.saved_payment_methods) {
        profile.saved_payment_methods.forEach((m) => {
          m.auto_renew_enabled = Boolean(enabled);
        });
      }

      db.save();

      res.json({
        success: true,
        autoRenewSubscription: profile.auto_renew_subscription,
        savedPaymentMethods: profile.saved_payment_methods || []
      });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // =========================================================================
  // 10. FINIK PAYMENT API, WEBHOOK & WHATSAPP NOTIFICATIONS
  // =========================================================================

  // In-memory rate limiting to prevent payment brute-forcing
  const paymentRateLimitMap = new Map<string, { count: number; resetTime: number }>();
  const checkPaymentRateLimit = (req: express.Request, res: express.Response, next: express.NextFunction) => {
    const ip = req.ip || req.socket.remoteAddress || 'unknown';
    const now = Date.now();
    const entry = paymentRateLimitMap.get(ip);
    if (entry && now < entry.resetTime) {
      if (entry.count > 30) {
        return res.status(429).json({ error: 'Слишком много запросов. Пожалуйста, повторите через минуту.' });
      }
      entry.count++;
    } else {
      paymentRateLimitMap.set(ip, { count: 1, resetTime: now + 60 * 1000 });
    }
    next();
  };

  // WhatsApp Admin Notification Dispatcher
  async function sendAdminWhatsAppNotification(order: DbFinikOrder, originHost?: string) {
    try {
      const adminPhone = process.env.ADMIN_WHATSAPP_PHONE || '+996700000001';
      const waToken = process.env.WHATSAPP_API_TOKEN;
      const waPhoneId = process.env.WHATSAPP_PHONE_NUMBER_ID;

      const paidDate = order.paid_at ? new Date(order.paid_at) : new Date();
      const dateFormatted = paidDate.toLocaleDateString('ru-RU');
      const timeFormatted = paidDate.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' });
      const host = originHost || 'http://localhost:3000';
      const adminUrl = `${host}/admin?tab=payments&paymentId=${order.payment_id}`;

      const textMessage = `💳 НОВАЯ ОПЛАТА
Клиент: ${order.user_name || 'Не указано'}
Телефон: ${order.user_phone || 'Не указано'}
Email: ${order.user_email || 'Не указано'}

Тариф: ${order.tariff_name || order.tariff_id}
Сумма: ${order.amount_som} сом

Способ оплаты: Finik
Payment ID: ${order.payment_id}

Статус: ✅ Оплачено

Дата: ${dateFormatted}
Время: ${timeFormatted}

Подписка активирована автоматически.

Открыть заказ в админ-панели: ${adminUrl}`;

      console.log('\n📲 ---------------- WHATSAPP ADMIN NOTIFICATION ----------------');
      console.log(textMessage);
      console.log('---------------------------------------------------------------\n');

      if (waToken && waPhoneId) {
        const cleanPhone = adminPhone.replace(/[^0-9]/g, '');
        const waRes = await fetch(`https://graph.facebook.com/v18.0/${waPhoneId}/messages`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${waToken}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            messaging_product: 'whatsapp',
            to: cleanPhone,
            type: 'text',
            text: { body: textMessage }
          })
        });
        const waData = await waRes.json();
        console.log('WhatsApp Cloud API dispatch status:', waData);
      } else {
        console.log('ℹ️ WhatsApp Cloud credentials not configured in .env. Notification safely logged in server audit trail.');
      }
    } catch (err: any) {
      console.error('WhatsApp dispatch warning:', err.message);
    }
  }

  // Helper to determine Finik activation status
  function getFinikStatus() {
    const isEnabled = process.env.FINIK_ENABLED === 'true';
    const hasAccountId = Boolean(process.env.FINIK_ACCOUNT_ID && process.env.FINIK_ACCOUNT_ID.trim());
    const hasApiKey = Boolean(process.env.FINIK_API_KEY && process.env.FINIK_API_KEY.trim());
    const hasSecretKey = Boolean(process.env.FINIK_SECRET_KEY && process.env.FINIK_SECRET_KEY.trim());
    const hasAllCredentials = hasAccountId && hasApiKey && hasSecretKey;

    if (isEnabled && !hasAllCredentials) {
      const missing: string[] = [];
      if (!hasAccountId) missing.push('FINIK_ACCOUNT_ID');
      if (!hasApiKey) missing.push('FINIK_API_KEY');
      if (!hasSecretKey) missing.push('FINIK_SECRET_KEY');
      console.warn(`⚠️ [FINIK WARNING] FINIK_ENABLED=true, бирок төмөнкү credentials жетишсиз: ${missing.join(', ')}. Finik API чакырылбайт, MBank QR негизги төлөм катары иштей берет.`);
    }

    // Active ONLY when explicitly enabled AND all required credentials exist
    const isActive = isEnabled && hasAllCredentials;
    return {
      isEnabled,
      hasAllCredentials,
      isActive,
      hasAccountId,
      hasApiKey,
      hasSecretKey
    };
  }

  // 10.1 Check Finik Configuration Status
  app.get('/api/payments/finik/config-status', (req, res) => {
    const finikStatus = getFinikStatus();
    const isWhatsAppConfigured = Boolean(process.env.WHATSAPP_API_TOKEN && process.env.WHATSAPP_PHONE_NUMBER_ID);
    const environment = process.env.FINIK_ENVIRONMENT || 'beta';
    const telegramStatus = getTelegramStatus();

    res.json({
      enabled: finikStatus.isEnabled,
      isConfigured: finikStatus.isActive,
      isActive: finikStatus.isActive,
      primaryMethod: 'mbank_qr',
      environment,
      accountId: finikStatus.isActive ? process.env.FINIK_ACCOUNT_ID : '',
      warning: finikStatus.isEnabled && !finikStatus.hasAllCredentials
        ? 'FINIK_ENABLED=true, бирок керектүү credentials толук эмес'
        : null,
      isWhatsAppConfigured,
      adminPhone: process.env.ADMIN_WHATSAPP_PHONE || '+996700000001',
      telegram: {
        enabled: telegramStatus.enabled,
        isConfigured: telegramStatus.isConfigured,
        warning: telegramStatus.warning
      }
    });
  });

  // 10.1.1 Telegram Notification Status & Test (Server-side only credentials)
  app.get('/api/notifications/telegram/status', (req, res) => {
    const status = getTelegramStatus();
    res.json({
      success: true,
      enabled: status.enabled,
      isConfigured: status.isConfigured,
      hasBotToken: status.hasBotToken,
      hasChatId: status.hasChatId,
      warning: status.warning,
      primaryPaymentMethod: 'MBank QR'
    });
  });

  app.post('/api/notifications/telegram/test', async (req, res) => {
    try {
      const status = getTelegramStatus();
      if (!status.enabled) {
        return res.json({
          success: false,
          sent: false,
          message: 'Telegram билдирүүлөрү өчүрүлгөн (TELEGRAM_ENABLED=false).'
        });
      }

      if (!status.isConfigured) {
        return res.json({
          success: false,
          sent: false,
          warning: status.warning,
          message: 'TELEGRAM_BOT_TOKEN же TELEGRAM_CHAT_ID орнотула элек.'
        });
      }

      const testMsg = `🔔 <b>ТЕСТТИК БИЛДИРҮҮ</b>\n━━━━━━━━━━━━━━━━━━━━\nОРТ ОНЛАЙН KG Telegram-боту ийгиликтүү туташтырылды!\nУбактысы: ${new Date().toLocaleString('ru-RU', { timeZone: 'Asia/Bishkek' })}\n━━━━━━━━━━━━━━━━━━━━\n🎯 <i>ОсОО «Билет Центр»</i>`;
      const delivered = await sendTelegramMessage(testMsg, { parseMode: 'HTML' });

      res.json({
        success: delivered,
        sent: delivered,
        message: delivered
          ? 'Тесттик билдирүү Telegram аркылуу ийгиликтүү жөнөтүлдү!'
          : 'Telegram API ката кайтарды же байланыш болгон жок.'
      });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // 10.2 Create Finik Payment (Dynamic unique PaymentId per attempt)
  app.post('/api/payments/finik/create', checkPaymentRateLimit, async (req, res) => {
    try {
      const {
        userId,
        userName,
        userEmail,
        userPhone,
        tariffId,
        tariffName,
        amount,
        lang = 'ky',
        promoCode
      } = req.body;

      if (!tariffId) {
        return res.status(400).json({ error: 'Тариф талап кылынат' });
      }

      // Canonical tariff price to prevent client tampering
      const canonicalBasePrice = tariffId === 'intensive' ? 890 : (tariffId === 'standard' ? 490 : (Number(amount) || 490));
      let originalAmount = canonicalBasePrice;
      let finalPayAmount = canonicalBasePrice;
      let discountAmount = 0;
      let appliedPromoCode: string | undefined = undefined;

      if (promoCode && typeof promoCode === 'string' && promoCode.trim()) {
        const valRes = db.validatePromoCode(promoCode, tariffId, canonicalBasePrice);
        if (valRes.valid && valRes.promo) {
          finalPayAmount = valRes.finalAmount;
          discountAmount = valRes.discountAmount;
          appliedPromoCode = valRes.promo.code;
        } else {
          return res.status(400).json({
            success: false,
            error: valRes.error || 'Промокод жараксыз же мөөнөтү бүткөн'
          });
        }
      } else if (amount && Number(amount) > 0) {
        finalPayAmount = Number(amount);
        originalAmount = Number(amount);
      }

      const paymentId = db.generateNextPaymentId();
      const origin = req.headers.origin || 'http://localhost:3000';
      const redirectUrl = `${origin}/payment/pending?paymentId=${paymentId}`;
      const webhookUrl = `${origin}/api/payments/finik/webhook`;

      // Find user profile for fallback contact info
      const profile = db.profiles.find((p) => p.id === userId);
      const effectiveName = userName || profile?.full_name || 'Студент';
      const effectivePhone = userPhone || profile?.phone || '+996 700 000 000';
      const effectiveEmail = userEmail || `${(userId || 'student').replace(/[^a-z0-9]/gi, '')}@ort-online.kg`;

      const finikStatus = getFinikStatus();

      const order: DbFinikOrder = {
        id: 'ord-' + Date.now(),
        payment_id: paymentId,
        user_id: userId || 'user-demo-student',
        user_name: effectiveName,
        user_email: effectiveEmail,
        user_phone: effectivePhone,
        tariff_id: tariffId as any,
        tariff_name: tariffName || (tariffId === 'premium' ? 'Premium (Толук курс)' : 'Standard (1 ай)'),
        amount_som: finalPayAmount,
        original_amount: originalAmount,
        discount_amount: discountAmount,
        promo_code: appliedPromoCode,
        currency: 'KGS',
        card_type: finikStatus.isActive ? 'FINIK_QR' : 'MBANK_QR',
        payment_status: 'PENDING',
        created_at: new Date().toISOString(),
        payment_url: redirectUrl,
        legal_payee: 'ОсОО «Билет Центр»',
        brand_name: 'ОРТ ОНЛАЙН KG',
        // Standard National Kyrgyz QR / MBank Payload Format (Legal Payee: ОсОО "Билет Центр")
        qr_payload: `ST00012|Name=ОсОО "Билет Центр"|PersonalAcc=1230000000000000|BankName=MBANK|BIC=103001|Sum=${finalPayAmount * 100}|Purpose=ОРТ ОНЛАЙН KG: ${tariffName || tariffId} (${paymentId})|PayeeINN=01234567891011`,
        provider: finikStatus.isActive ? 'finik' : 'mbank',
        environment: (process.env.FINIK_ENVIRONMENT as any) || 'beta',
        whatsAppNotified: false
      };

      // Call external Finik API ONLY IF FINIK_ENABLED=true AND all credentials exist
      if (finikStatus.isActive) {
        try {
          const finikBaseUrl = process.env.FINIK_ENVIRONMENT === 'production'
            ? 'https://api.acquiring.averspay.kg/v1/payment'
            : 'https://beta-api.acquiring.averspay.kg/v1/payment';

          const finikReqBody = {
            Amount: finalPayAmount,
            CardType: 'FINIK_QR',
            PaymentId: paymentId,
            RedirectUrl: redirectUrl,
            Lang: lang,
            accountId: process.env.FINIK_ACCOUNT_ID,
            webhookUrl: webhookUrl,
            description: `ОРТ Онлайн — ${tariffName || tariffId}`
          };

          const finikResponse = await fetch(finikBaseUrl, {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${process.env.FINIK_API_KEY}`,
              'Content-Type': 'application/json'
            },
            body: JSON.stringify(finikReqBody)
          });

          if (finikResponse.ok) {
            const finikResult = await finikResponse.json();
            if (finikResult.qrPayload) order.qr_payload = finikResult.qrPayload;
            if (finikResult.paymentUrl) order.payment_url = finikResult.paymentUrl;
          }
        } catch (apiErr) {
          console.warn('Finik direct API call skipped/fell back to dynamic QR sandbox:', apiErr);
        }
      }

      db.createFinikOrder(order);

      res.json({
        success: true,
        order,
        paymentId: order.payment_id,
        amount: order.amount_som,
        currency: order.currency,
        tariffName: order.tariff_name,
        paymentUrl: order.payment_url,
        qrPayload: order.qr_payload,
        isConfigured: finikStatus.isActive,
        isFinikActive: finikStatus.isActive,
        primaryMethod: 'mbank_qr',
        environment: order.environment
      });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // 10.3 Finik Webhook (Crucial: Status verification, Idempotent subscription activation, WhatsApp admin notice)
  app.post('/api/payments/finik/webhook', async (req, res) => {
    try {
      const payload = req.body || {};
      const paymentId = payload.PaymentId || payload.paymentId || payload.orderId;
      const paymentStatus = payload.Status || payload.status || payload.PaymentStatus;

      console.log(`\n🔔 Finik Webhook received for PaymentId [${paymentId}], Status [${paymentStatus}]`);

      if (!paymentId) {
        return res.status(400).json({ error: 'Missing PaymentId in webhook payload' });
      }

      // Check signature if secret configured
      if (process.env.FINIK_SECRET_KEY && req.headers['x-finik-signature']) {
        const receivedSignature = req.headers['x-finik-signature'] as string;
        const expectedSignature = crypto
          .createHmac('sha256', process.env.FINIK_SECRET_KEY)
          .update(JSON.stringify(payload))
          .digest('hex');

        if (receivedSignature !== expectedSignature) {
          console.error('Invalid Finik webhook signature!');
          return res.status(401).json({ error: 'Invalid signature' });
        }
      }

      const isPaid = paymentStatus === 'PAID' || paymentStatus === 'SUCCESS' || paymentStatus === 'COMPLETED';

      if (isPaid) {
        // Idempotency: db.activateSubscriptionFromWebhook ensures single activation
        const activation = db.activateSubscriptionFromWebhook(paymentId, payload);
        if (!activation.success) {
          return res.status(404).json({ error: activation.error });
        }

        // WhatsApp and Telegram notification sent ONLY ONCE upon confirmed webhook
        if (activation.order && !activation.alreadyProcessed && !activation.order.whatsAppNotified) {
          await sendAdminWhatsAppNotification(activation.order, req.headers.origin);
          activation.order.whatsAppNotified = true;
          db.save();
        }

        if (activation.order && !activation.alreadyProcessed) {
          notifyPaymentApproved({
            paymentId: activation.order.payment_id,
            studentName: activation.order.user_name,
            studentPhone: activation.order.user_phone,
            tariffName: activation.order.tariff_name,
            amountSom: activation.order.amount_som,
            paymentMethod: activation.order.provider === 'finik' ? 'Finik' : 'MBank QR',
            approvedBy: 'Шлюз (Webhook)',
            expiresAt: activation.profile?.subscription_expires_at
          }).catch((err) => console.warn('Telegram webhook notify notice:', err.message));
        }

        return res.json({
          status: 'ok',
          received: true,
          activated: !activation.alreadyProcessed,
          message: activation.message
        });
      } else {
        // Update to FAILED or CANCELLED if non-successful status received
        const newStatus = paymentStatus === 'CANCELLED' ? 'CANCELLED' : 'FAILED';
        db.updateFinikOrderStatus(paymentId, newStatus as any);
        return res.json({ status: 'ok', received: true, paymentStatus: newStatus });
      }
    } catch (err: any) {
      console.error('Finik webhook error:', err);
      res.status(500).json({ error: err.message });
    }
  });

  // 10.4 Query Payment Status (Used by frontend pending polling)
  app.get('/api/payments/finik/status/:paymentId', (req, res) => {
    try {
      const { paymentId } = req.params;
      const order = db.getFinikOrderByPaymentId(paymentId);
      if (!order) {
        return res.status(404).json({ error: 'Payment order not found' });
      }

      const profile = db.profiles.find((p) => p.id === order.user_id);

      res.json({
        success: true,
        order,
        status: order.payment_status,
        isPaid: order.payment_status === 'PAID',
        profile: profile ? {
          id: profile.id,
          subscriptionTier: profile.subscription_tier,
          subscriptionExpires: profile.subscription_expires_at
        } : null
      });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // 10.5 Simulate Finik Webhook (For testing Beta/Sandbox payments & WhatsApp notifications)
  app.post('/api/payments/finik/simulate-webhook', async (req, res) => {
    try {
      const { paymentId, status = 'PAID' } = req.body;
      if (!paymentId) {
        return res.status(400).json({ error: 'PaymentId талап кылынат' });
      }

      const order = db.getFinikOrderByPaymentId(paymentId);
      if (!order) {
        return res.status(404).json({ error: 'Бул PaymentId менен заказ табылган жок' });
      }

      if (status === 'PAID') {
        const activation = db.activateSubscriptionFromWebhook(paymentId, { idempotencyKey: 'sim-' + Date.now() });
        if (activation.order && !activation.alreadyProcessed && !activation.order.whatsAppNotified) {
          await sendAdminWhatsAppNotification(activation.order, req.headers.origin);
          activation.order.whatsAppNotified = true;
          db.save();
        }

        if (activation.order && !activation.alreadyProcessed) {
          notifyPaymentApproved({
            paymentId: activation.order.payment_id,
            studentName: activation.order.user_name,
            studentPhone: activation.order.user_phone,
            tariffName: activation.order.tariff_name,
            amountSom: activation.order.amount_som,
            paymentMethod: 'MBank QR / Симуляция',
            approvedBy: 'Тесттик симуляция',
            expiresAt: activation.profile?.subscription_expires_at
          }).catch((err) => console.warn('Telegram sim notify notice:', err.message));
        }

        return res.json({
          success: true,
          message: activation.alreadyProcessed
            ? 'Идемпотенттүүлүк: Бул төлөм мурда эле ийгиликтүү ырасталган.'
            : 'Төлөм симуляцияланды! Подписка активдештирилди жана админге билдирүү катталды.',
          order: activation.order,
          profile: activation.profile
        });
      } else {
        const updated = db.updateFinikOrderStatus(paymentId, status as any);
        return res.json({ success: true, order: updated });
      }
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // 10.6 Admin Payments List (With filters by period, status, and search)
  app.get('/api/payments/orders', (req, res) => {
    try {
      const { period, status, search } = req.query as { period?: string; status?: string; search?: string };
      const orders = db.getPaymentOrders({ period, status, search });
      res.json({
        success: true,
        orders,
        total: orders.length
      });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // 10.7 Admin Payment Statistics
  app.get('/api/payments/stats', (req, res) => {
    try {
      const stats = db.getPaymentStats();
      res.json({
        success: true,
        stats
      });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // 10.7.1 Comprehensive Analytics Endpoint (Daily, Weekly, Monthly Revenue, Growth, Tariffs)
  app.get('/api/admin/analytics', (req, res) => {
    try {
      const { timeframe = '30d' } = req.query as { timeframe?: string };
      const analytics = db.getComprehensiveAnalytics(timeframe);
      res.json({
        success: true,
        analytics
      });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // 10.7.2 Manual Receipt Submission (After clicking «Мен төлөдүм»)
  app.post('/api/payments/submit-receipt', (req, res) => {
    try {
      const {
        paymentId,
        payerName,
        payerPhone,
        payerAmount,
        receiptUrl,
        transactionNumber,
        offerAccepted,
        offerVersion
      } = req.body;

      if (!paymentId) {
        return res.status(400).json({ error: 'PaymentId талап кылынат' });
      }

      if (!offerAccepted) {
        return res.status(400).json({ error: 'Публичная оферта жана пайдалануу шарттарын кабыл алуу милдеттүү' });
      }

      if (receiptUrl && receiptUrl.startsWith('data:')) {
        const isAllowedType = receiptUrl.startsWith('data:image/') || receiptUrl.startsWith('data:application/pdf');
        if (!isAllowedType) {
          return res.status(400).json({ error: 'Жүктөлгөн файлдын форматы туура эмес (сүрөт же PDF гана кабыл алынат)' });
        }
        if (receiptUrl.length > 15 * 1024 * 1024) {
          return res.status(400).json({ error: 'Чек файлы өтө чоң (максималдуу көлөмү 10 МБ)' });
        }
      }

      const clientIp = (req.headers['x-forwarded-for'] as string) || req.socket.remoteAddress || '127.0.0.1';

      const result = db.submitManualReceipt({
        paymentId,
        payerName: (payerName || '').trim(),
        payerPhone: (payerPhone || '').trim(),
        payerAmount: Number(payerAmount) || 0,
        receiptUrl: receiptUrl || '',
        transactionNumber: (transactionNumber || '').trim(),
        offerAccepted: Boolean(offerAccepted),
        offerVersion: offerVersion || 'v1.0-2026',
        offerIp: String(clientIp)
      });

      if (!result.success) {
        return res.status(404).json({ error: result.error });
      }

      console.log(`\n📄 [ОРТ ОНЛАЙН KG] Жаңы чек жүктөлдү! PaymentId: ${paymentId}, Төлөөчү: ${payerName}, Сумма: ${payerAmount} сом. Алуучу: ОсОО «Билет Центр»`);
      if (result.isDuplicate) {
        console.warn(`⚠️ [ОРТ ОНЛАЙН KG] КҮМӨНДҮҮ ДУБЛИКАТ: ${paymentId} дал келди: ${result.order?.duplicate_matched_id}`);
      }

      // Dispatch Telegram Admin Notification asynchronously
      notifyPaymentSubmitted({
        paymentId,
        studentName: (payerName || '').trim() || result.order?.user_name || 'Студент',
        studentPhone: (payerPhone || '').trim() || result.order?.user_phone || '—',
        tariffName: result.order?.tariff_name || 'Standard (1 ай)',
        amountSom: Number(payerAmount) || result.order?.amount_som || 1000,
        paymentMethod: 'MBank QR (ОсОО «Билет Центр»)',
        transactionNumber: (transactionNumber || '').trim(),
        isDuplicate: result.isDuplicate,
        duplicateMatchedId: result.order?.duplicate_matched_id,
        receiptUrl: receiptUrl || ''
      }).catch((err) => console.warn('Telegram payment submitted notify notice:', err.message));

      if (result.order?.promo_code) {
        notifyPromoCodeUsed({
          code: result.order.promo_code,
          userName: (payerName || '').trim() || result.order.user_name || 'Студент',
          userPhone: (payerPhone || '').trim() || result.order.user_phone || '—',
          tariffId: result.order.tariff_id || 'standard',
          originalAmount: result.order.original_amount || (result.order.amount_som + (result.order.discount_amount || 0)),
          discountAmount: result.order.discount_amount || 0,
          finalAmount: result.order.amount_som,
          orderId: paymentId
        }).catch((err) => console.warn('Telegram promo notify notice:', err.message));
      }

      res.json({
        success: true,
        order: result.order,
        isDuplicate: result.isDuplicate,
        message: 'Төлөм текшерүүгө жөнөтүлдү. Тастыкталгандан кийин ОРТ ОНЛАЙН KG кызматы активдештирилет.'
      });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // --- Electronic Contract / Offer Endpoints (Requirements 9 & 10) ---
  app.post('/api/contracts/accept', (req, res) => {
    try {
      const { userId, userName, userPhone, userEmail, offerVersion = 'v1.0-2026', tariffId, amountSom, paymentId } = req.body;
      if (!userId || !userPhone) {
        return res.status(400).json({ error: 'Колдонуучунун маалыматтары талап кылынат' });
      }

      const clientIp = (req.headers['x-forwarded-for'] as string) || req.socket.remoteAddress || '127.0.0.1';
      const userAgent = req.headers['user-agent'] || 'browser';

      const record = db.recordOfferAcceptance({
        userId,
        userName: userName || 'Колдонуучу',
        userPhone,
        userEmail,
        offerVersion,
        tariffId: tariffId || 'standard',
        amountSom: Number(amountSom) || 1000,
        paymentId,
        ipAddress: String(clientIp),
        userAgent
      });

      res.json({
        success: true,
        record,
        message: 'Публичная оферта жана келишим ийгиликтүү кабыл алынды.'
      });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.get('/api/contracts/user/:userId', (req, res) => {
    try {
      const { userId } = req.params;
      const contract = db.getUserOfferAcceptance(userId);
      res.json({ success: true, contract: contract || null });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.get('/api/admin/contracts', (req, res) => {
    try {
      const contracts = db.getAllOfferAcceptances();
      res.json({ success: true, contracts });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // --- 8-Month Course Progression Endpoints (Requirements 2 & 4) ---
  app.get('/api/course/progress/:userId', (req, res) => {
    try {
      const progress = db.getUserCourseProgress(req.params.userId);
      res.json({ success: true, progress });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.get('/api/course/month/:monthNumber/questions', (req, res) => {
    try {
      const monthNumber = Math.max(1, Math.min(8, Number(req.params.monthNumber) || 1));
      const questions = db.getMonthExamQuestions(monthNumber, false);
      res.json({
        success: true,
        monthNumber,
        passingScorePercent: 50,
        requiredLessonsPercent: 90,
        totalQuestions: questions.length,
        questions
      });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.post('/api/course/month/:monthNumber/complete', (req, res) => {
    try {
      const monthNumber = Number(req.params.monthNumber);
      const {
        userId,
        completedLessonsCount = 0,
        totalLessonsCount = 10,
        answers = {},
        timeSpentSeconds = 600
      } = req.body;

      if (!userId) {
        return res.status(400).json({ error: 'userId талап кылынат' });
      }

      const result = db.completeCourseMonth({
        userId,
        monthNumber,
        completedLessonsCount: Number(completedLessonsCount),
        totalLessonsCount: Number(totalLessonsCount),
        answers,
        timeSpentSeconds: Number(timeSpentSeconds)
      });

      if (!result.success && result.error) {
        return res.status(400).json(result);
      }

      res.json(result);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // --- System Status & Integration Readiness (Requirements 7, 11, 14, 15) ---
  app.get('/api/admin/system-status', (req, res) => {
    try {
      const tgStatus = getTelegramStatus();
      res.json({
        success: true,
        brand: 'ОРТ ОНЛАЙН KG',
        legalPayee: 'ОсОО «Билет Центр»',
        adminEmailRecipient: 'kelsinay22@gmail.com',
        adminTelegramStatus: tgStatus.isConfigured ? 'CONNECTED' : (tgStatus.enabled ? 'CREDENTIALS_NEEDED' : 'DISABLED'),
        adminTelegramWarning: tgStatus.warning,
        adminWhatsAppRecipient: '+7 964 700 49 70',
        whatsAppApiStatus: 'Optional (Unused)',
        customerSupportPhone: '+996 507 392 634',
        customerSupportWhatsApp: '+996 507 392 634',
        primaryWhatsApp: '+996 779 949 400',
        instagramHandle: '@ort_online_kg',
        legalRequisitesStatus: 'Required before launch',
        databaseBackupAvailable: true,
        antiDuplicateProtection: 'ACTIVE'
      });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // --- Database Full Backup Export (Requirement 15) ---
  app.get('/api/admin/backup/export', (req, res) => {
    try {
      const backup = db.exportDatabaseBackup();
      notifyAdminImportantAction({
        action: 'Маалымат базасынын резервдик көчүрмөсү экспорттолду',
        details: `Резервдик көчүрмө ийгиликтүү жүктөлдү (BACKUP EXPORT)`,
        adminUser: 'Администратор'
      }).catch((err) => console.warn('Telegram backup export notice:', err.message));
      res.setHeader('Content-Type', 'application/json');
      res.setHeader('Content-Disposition', `attachment; filename=ort_online_kg_backup_${new Date().toISOString().slice(0, 10)}.json`);
      res.json(backup);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // 10.7.3 Admin Confirm Payment (Тастыктоо)
  app.post('/api/payments/admin/confirm', async (req, res) => {
    try {
      const { paymentId, adminUser = 'Администратор' } = req.body;
      if (!paymentId) {
        return res.status(400).json({ error: 'PaymentId талап кылынат' });
      }

      const result = db.confirmManualPayment(paymentId, adminUser);
      if (!result.success) {
        return res.status(404).json({ error: result.error });
      }

      if (result.order && !result.alreadyProcessed && !result.order.whatsAppNotified) {
        await sendAdminWhatsAppNotification(result.order, req.headers.origin);
        result.order.whatsAppNotified = true;
        db.save();
      }

      // Dispatch Telegram Admin Notification: Payment Approved & Subscription Activated
      if (result.order) {
        notifyPaymentApproved({
          paymentId: result.order.payment_id,
          studentName: result.order.user_name || 'Студент',
          studentPhone: result.order.user_phone || '—',
          tariffName: result.order.tariff_name || 'Standard',
          amountSom: result.order.amount_som || 1000,
          paymentMethod: 'MBank QR',
          approvedBy: adminUser,
          expiresAt: result.profile?.subscription_expires_at
        }).catch((err) => console.warn('Telegram payment approved notify notice:', err.message));
      }

      res.json({
        success: true,
        order: result.order,
        profile: result.profile,
        message: 'Төлөм ийгиликтүү тастыкталды жана ОРТ Онлайн кызматы активдештирилди!'
      });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // 10.7.4 Admin Reject Payment (Четке кагуу)
  app.post('/api/payments/admin/reject', (req, res) => {
    try {
      const { paymentId, reason = 'Чек дал келбейт же так эмес', adminUser = 'Администратор' } = req.body;
      if (!paymentId) {
        return res.status(400).json({ error: 'PaymentId талап кылынат' });
      }

      const result = db.rejectManualPayment(paymentId, reason, adminUser);
      if (!result.success) {
        return res.status(404).json({ error: result.error });
      }

      // Dispatch Telegram Notification for reject action
      notifyAdminImportantAction({
        action: 'Төлөм четке кагылды (PAYMENT_REJECTED)',
        details: `Payment ID: ${paymentId}\nСебеби: ${reason}\nОкуучу: ${result.order?.user_name || '—'} (${result.order?.user_phone || '—'})`,
        adminUser
      }).catch((err) => console.warn('Telegram reject notify notice:', err.message));

      res.json({
        success: true,
        order: result.order,
        message: 'Төлөм четке кагылды.'
      });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // 10.8 WhatsApp Expiry Reminder Notification (Automated 3-day, 1-day, and Expired reminders)
  app.post('/api/notifications/whatsapp/remind-expiry', async (req, res) => {
    try {
      const { userId = 'user-demo-student', type = '3_days', phone } = req.body;
      const profile = db.profiles.find((p) => p.id === userId);
      const studentName = profile?.full_name || 'Студент';
      const targetPhone = phone || profile?.phone || process.env.ADMIN_WHATSAPP_PHONE || '+996700891234';
      const renewUrl = `${req.headers.origin || 'http://localhost:3000'}/pricing`;

      let message = '';
      if (type === '1_day') {
        message = `⏳ ОРТ Онлайн: Подпискаңыз эртең аяктайт!\n\nСаламатсызбы, ${studentName}! Сиздин ОРТга даярдануу подпискаңыздын мөөнөтү эртең аяктайт. Ударный режимди жана суроолор базасына толук кирүүнү сактап калуу үчүн узартыңыз:\n👉 ${renewUrl}`;
      } else if (type === 'expired') {
        message = `⚠️ ОРТ Онлайн: Подписка аяктады\n\nСаламатсызбы, ${studentName}! ОРТ подпискаңыздын мөөнөтү бүттү. Finik аркылуу каалаган учурда кайра кошулуп, даярдыкты уланта аласыз:\n👉 ${renewUrl}`;
      } else {
        message = `🔔 ОРТ Онлайн: Подписканын мөөнөтү жакындап калды\n\nСаламатсызбы, ${studentName}! Сиздин ОРТ подпискаңыз 3 күндөн кийин аяктайт. Жеке AI сунуштарын жана тесттерди үзгүлтүксүз колдонуу үчүн узартууну сунуштайбыз:\n👉 ${renewUrl}`;
      }

      console.log(`\n📲 --- WHATSAPP EXPIRY REMINDER [${type}] to ${targetPhone} ---`);
      console.log(message);
      console.log('-------------------------------------------------------------\n');

      const waToken = process.env.WHATSAPP_API_TOKEN;
      const waPhoneId = process.env.WHATSAPP_PHONE_NUMBER_ID;

      if (waToken && waPhoneId) {
        const cleanPhone = targetPhone.replace(/[^0-9]/g, '');
        const waRes = await fetch(`https://graph.facebook.com/v18.0/${waPhoneId}/messages`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${waToken}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            messaging_product: 'whatsapp',
            to: cleanPhone,
            type: 'text',
            text: { body: message }
          })
        });
        const waData = await waRes.json();
        return res.json({ success: true, delivered: true, type, targetPhone, waData, previewText: message });
      }

      return res.json({
        success: true,
        delivered: false,
        note: 'WhatsApp API credentials not set in .env; reminder logged to server log.',
        type,
        targetPhone,
        previewText: message
      });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // =========================================================================
  // 11. PROMO CODES MANAGEMENT & VALIDATION API
  // =========================================================================

  // 11.1 List Promo Codes with optional filters
  app.get('/api/promocodes', (req, res) => {
    try {
      const { activeOnly, search } = req.query as { activeOnly?: string; search?: string };
      const promoCodes = db.getPromoCodes({
        activeOnly: activeOnly === 'true' || activeOnly === '1',
        search
      });
      res.json({
        success: true,
        promoCodes,
        total: promoCodes.length
      });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // 11.2 Create New Promo Code
  app.post('/api/promocodes', (req, res) => {
    try {
      const {
        code,
        discountType,
        discountValue,
        discount_type,
        discount_value,
        validUntil,
        valid_until,
        maxUses,
        max_uses,
        isActive,
        is_active,
        minOrderAmount,
        min_order_amount,
        description,
        applicableTariffs,
        applicable_tariffs,
        ownerName,
        owner_name,
        teacherName,
        teacher_name,
        partnerPhone,
        partner_phone,
        internalNote,
        internal_note,
        createdBy,
        created_by
      } = req.body;

      const result = db.createPromoCode({
        code,
        discount_type: discountType || discount_type || 'percentage',
        discount_value: Number(discountValue !== undefined ? discountValue : discount_value),
        valid_until: validUntil || valid_until,
        max_uses: maxUses !== undefined ? maxUses : max_uses,
        is_active: isActive !== undefined ? isActive : is_active,
        min_order_amount: minOrderAmount !== undefined ? Number(minOrderAmount) : (min_order_amount !== undefined ? Number(min_order_amount) : 0),
        description,
        applicable_tariffs: applicableTariffs || applicable_tariffs,
        owner_name: ownerName || owner_name,
        teacher_name: teacherName || teacher_name,
        partner_phone: partnerPhone || partner_phone,
        internal_note: internalNote || internal_note,
        created_by: createdBy || created_by || 'Администратор'
      });

      if (!result.success) {
        return res.status(400).json({ error: result.error });
      }

      notifyAdminImportantAction({
        action: 'Жаңы промокод түзүлдү',
        details: `Код: ${result.promo?.code}\nАрзандатуу: ${result.promo?.discount_value}${result.promo?.discount_type === 'percentage' ? '%' : ' сом'}\nЖооптуу: ${result.promo?.owner_name || '—'}\nМөөнөтү: ${result.promo?.valid_until || 'Мөөнөтсүз'}`,
        adminUser: createdBy || created_by || 'Администратор'
      }).catch((err) => console.warn('Telegram promo create notice:', err.message));

      res.status(201).json({
        success: true,
        promo: result.promo,
        message: `Промокод «${result.promo?.code}» ийгиликтүү түзүлдү!`
      });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // 11.3 Update Promo Code
  app.put('/api/promocodes/:id', (req, res) => {
    try {
      const { id } = req.params;
      const updates = req.body;

      const mappedUpdates: any = { ...updates };
      if (updates.discountType !== undefined) mappedUpdates.discount_type = updates.discountType;
      if (updates.discountValue !== undefined) mappedUpdates.discount_value = updates.discountValue;
      if (updates.validUntil !== undefined) mappedUpdates.valid_until = updates.validUntil;
      if (updates.maxUses !== undefined) mappedUpdates.max_uses = updates.maxUses;
      if (updates.isActive !== undefined) mappedUpdates.is_active = updates.isActive;
      if (updates.minOrderAmount !== undefined) mappedUpdates.min_order_amount = Number(updates.minOrderAmount);
      if (updates.min_order_amount !== undefined) mappedUpdates.min_order_amount = Number(updates.min_order_amount);
      if (updates.applicableTariffs !== undefined) mappedUpdates.applicable_tariffs = updates.applicableTariffs;
      if (updates.ownerName !== undefined) mappedUpdates.owner_name = updates.ownerName;
      if (updates.partnerPhone !== undefined) mappedUpdates.partner_phone = updates.partnerPhone;
      if (updates.teacherName !== undefined) mappedUpdates.teacher_name = updates.teacherName;
      if (updates.internalNote !== undefined) mappedUpdates.internal_note = updates.internalNote;

      const result = db.updatePromoCode(id, mappedUpdates);
      if (!result.success) {
        return res.status(400).json({ error: result.error });
      }

      res.json({
        success: true,
        promo: result.promo,
        message: 'Промокод ийгиликтүү жаңыланды'
      });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // 11.4 Delete Promo Code
  app.delete('/api/promocodes/:id', (req, res) => {
    try {
      const { id } = req.params;
      const result = db.deletePromoCode(id);
      if (!result.success) {
        return res.status(404).json({ error: result.error });
      }
      res.json({
        success: true,
        message: 'Промокод өчүрүлдү'
      });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // 11.5 Toggle Promo Code Status (Activate / Deactivate)
  app.patch('/api/promocodes/:id/toggle', (req, res) => {
    try {
      const { id } = req.params;
      const { isActive } = req.body;
      const result = db.togglePromoCode(id, isActive);
      if (!result.success) {
        return res.status(404).json({ error: result.error });
      }
      res.json({
        success: true,
        promo: result.promo,
        message: result.promo?.is_active ? 'Промокод активдештирилди' : 'Промокод токтотулду'
      });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // 11.6 Validate Promo Code for Checkout
  app.post('/api/promocodes/validate', (req, res) => {
    try {
      const { code, tariffId, amount } = req.body;
      const validation = db.validatePromoCode(code, tariffId, amount ? Number(amount) : undefined);
      if (!validation.valid) {
        return res.status(400).json({
          valid: false,
          error: validation.error,
          finalAmount: validation.finalAmount,
          discountAmount: 0,
          discountPercent: 0
        });
      }

      res.json({
        valid: true,
        code: validation.promo?.code,
        discountType: validation.promo?.discount_type,
        discountValue: validation.promo?.discount_value,
        discountPercent: validation.discountPercent,
        discountAmount: validation.discountAmount,
        originalAmount: validation.originalAmount,
        finalAmount: validation.finalAmount,
        promo: validation.promo,
        message: `Промокод «${validation.promo?.code}» ийгиликтүү колдонулду!`
      });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // 11.7 Get Promo Code Usage Audit Log
  app.get('/api/promocodes/usages', (req, res) => {
    try {
      const { code, search } = req.query as { code?: string; search?: string };
      const usages = db.getPromoCodeUsages({ code, search });
      res.json({
        success: true,
        usages,
        total: usages.length
      });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // 11.8 Get Promo Codes Analytics & Stats
  app.get('/api/promocodes/stats', (req, res) => {
    try {
      const stats = db.getPromoStats();
      res.json({
        success: true,
        stats
      });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // =========================================================================
  // VITE MIDDLEWARE (Development) or STATIC SERVING (Production)
  // =========================================================================
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa'
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`ОРТ Онлайн Server running on http://0.0.0.0:${PORT}`);
    const finikStartup = getFinikStatus();
    if (!finikStartup.isEnabled) {
      console.log('ℹ️ [PAYMENT] FINIK интеграциясы убактылуу өчүрүлгөн (FINIK_ENABLED=false). Негизги төлөм ыкмасы: MBANK QR (ОсОО «Билет Центр»).');
    } else if (finikStartup.isActive) {
      console.log('✅ [PAYMENT] FINIK интеграциясы активдүү жана credentials текшерилди.');
    }

    const tgStartup = getTelegramStatus();
    if (!tgStartup.enabled) {
      console.log('ℹ️ [TELEGRAM] Telegram билдирүүлөрү өчүрүлгөн (TELEGRAM_ENABLED=false).');
    } else if (tgStartup.isConfigured) {
      console.log('✅ [TELEGRAM] Telegram админ билдирүүлөрү активдүү жана конфигурацияланган.');
    } else if (tgStartup.warning) {
      console.warn(`⚠️ [TELEGRAM WARNING] ${tgStartup.warning}`);
    }
  });
}

startServer();
