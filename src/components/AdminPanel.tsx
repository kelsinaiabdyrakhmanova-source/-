import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Question, SubjectId } from '../types';
import { api } from '../services/api';
import { AdminPaymentsTab } from './AdminPaymentsTab';
import { AdminPromocodesTab } from './AdminPromocodesTab';
import { AdminAnalyticsTab } from './AdminAnalyticsTab';
import {
  ShieldCheck,
  Plus,
  Filter,
  Trash2,
  Edit2,
  Users,
  CheckCircle,
  BarChart2,
  BarChart3,
  RefreshCw,
  Search,
  BookOpen,
  HelpCircle,
  X,
  UploadCloud,
  FileSpreadsheet,
  AlertTriangle,
  Archive,
  CheckCircle2,
  Clock,
  Database,
  CreditCard,
  Tag,
  TrendingUp
} from 'lucide-react';

export const AdminPanel: React.FC = () => {
  const { questions, language, t, addQuestion, updateQuestion, deleteQuestion, showToast, reloadQuestions } = useApp();

  const [activeTab, setActiveTab] = useState<'questions' | 'analytics' | 'payments' | 'promocodes'>('questions');
  const [selectedSubjectFilter, setSelectedSubjectFilter] = useState<string>('all');
  const [selectedStatusFilter, setSelectedStatusFilter] = useState<string>('all');
  const [selectedDifficultyFilter, setSelectedDifficultyFilter] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');

  // Modals
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [editingQuestionId, setEditingQuestionId] = useState<string | null>(null);

  // Form State for Add / Edit
  const [formData, setFormData] = useState<{
    subjectId: SubjectId;
    topicKy: string;
    topicRu: string;
    difficulty: 'easy' | 'medium' | 'hard';
    status: 'draft' | 'review' | 'published' | 'archived';
    textKy: string;
    textRu: string;
    passageKy: string;
    passageRu: string;
    optionsKy: [string, string, string, string];
    optionsRu: [string, string, string, string];
    correctOptionIndex: number;
    explanationKy: string;
    explanationRu: string;
    formulaKy: string;
    formulaRu: string;
    hintKy: string;
    hintRu: string;
  }>({
    subjectId: 'math',
    topicKy: '',
    topicRu: '',
    difficulty: 'medium',
    status: 'published',
    textKy: '',
    textRu: '',
    passageKy: '',
    passageRu: '',
    optionsKy: ['', '', '', ''],
    optionsRu: ['', '', '', ''],
    correctOptionIndex: 0,
    explanationKy: '',
    explanationRu: '',
    formulaKy: '',
    formulaRu: '',
    hintKy: '',
    hintRu: ''
  });

  // CSV Import State
  const [csvText, setCsvText] = useState('');
  const [importResult, setImportResult] = useState<any | null>(null);
  const [isImporting, setIsImporting] = useState(false);

  // Filter questions
  const filteredQuestions = questions.filter((q) => {
    const matchesSubject = selectedSubjectFilter === 'all' || q.subjectId === selectedSubjectFilter;
    const matchesStatus = selectedStatusFilter === 'all' || (q.status || 'published') === selectedStatusFilter;
    const matchesDiff = selectedDifficultyFilter === 'all' || (q.difficulty || 'medium') === selectedDifficultyFilter;
    const matchesSearch =
      q.text[language]?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      q.topic[language]?.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSubject && matchesStatus && matchesDiff && matchesSearch;
  });

  const openAddModal = () => {
    setEditingQuestionId(null);
    setFormData({
      subjectId: 'math',
      topicKy: '',
      topicRu: '',
      difficulty: 'medium',
      status: 'published',
      textKy: '',
      textRu: '',
      passageKy: '',
      passageRu: '',
      optionsKy: ['', '', '', ''],
      optionsRu: ['', '', '', ''],
      correctOptionIndex: 0,
      explanationKy: '',
      explanationRu: '',
      formulaKy: '',
      formulaRu: '',
      hintKy: '',
      hintRu: ''
    });
    setIsModalOpen(true);
  };

  const openEditModal = (q: any) => {
    setEditingQuestionId(q.id);
    setFormData({
      subjectId: q.subjectId || q.subject_id,
      topicKy: q.topic?.ky || q.topic_ky || '',
      topicRu: q.topic?.ru || q.topic_ru || '',
      difficulty: q.difficulty || 'medium',
      status: q.status || 'published',
      textKy: q.text?.ky || q.text_ky || '',
      textRu: q.text?.ru || q.text_ru || '',
      passageKy: q.passage?.ky || q.passage_ky || '',
      passageRu: q.passage?.ru || q.passage_ru || '',
      optionsKy: (q.options?.ky || q.options_ky || ['', '', '', '']) as [string, string, string, string],
      optionsRu: (q.options?.ru || q.options_ru || ['', '', '', '']) as [string, string, string, string],
      correctOptionIndex: q.correctOptionIndex !== undefined ? q.correctOptionIndex : q.correct_option_index || 0,
      explanationKy: q.explanation?.ky || q.explanation_ky || '',
      explanationRu: q.explanation?.ru || q.explanation_ru || '',
      formulaKy: q.formulaOrRule?.ky || q.formula_ky || '',
      formulaRu: q.formulaOrRule?.ru || q.formula_ru || '',
      hintKy: q.socraticHints?.ky?.[0] || q.hint_ky || '',
      hintRu: q.socraticHints?.ru?.[0] || q.hint_ru || ''
    });
    setIsModalOpen(true);
  };

  const handleSaveQuestion = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation (Requirement 4)
    if (!formData.textKy.trim() || !formData.textRu.trim()) {
      showToast(
        language === 'ky'
          ? 'Суроонун тексти эки тилде тең толтурулушу керек'
          : 'Текст вопроса обязателен на обоих языках (кыргызском и русском)',
        'error'
      );
      return;
    }

    if (!formData.explanationKy.trim() || !formData.explanationRu.trim()) {
      showToast(
        language === 'ky'
          ? 'Түшүндүрмө эки тилде тең толтурулушу керек'
          : 'Объяснение обязательно на обоих языках',
        'error'
      );
      return;
    }

    const payload = {
      id: editingQuestionId || 'q-' + Date.now(),
      subjectId: formData.subjectId,
      topicKy: formData.topicKy.trim() || 'Жалпы тема',
      topicRu: formData.topicRu.trim() || 'Общая тема',
      difficulty: formData.difficulty,
      status: formData.status,
      textKy: formData.textKy.trim(),
      textRu: formData.textRu.trim(),
      passageKy: formData.passageKy.trim() || undefined,
      passageRu: formData.passageRu.trim() || undefined,
      optionsKy: formData.optionsKy,
      optionsRu: formData.optionsRu,
      correctOptionIndex: Number(formData.correctOptionIndex),
      explanationKy: formData.explanationKy.trim(),
      explanationRu: formData.explanationRu.trim(),
      formulaKy: formData.formulaKy.trim() || undefined,
      formulaRu: formData.formulaRu.trim() || undefined,
      hintKy: formData.hintKy.trim() || undefined,
      hintRu: formData.hintRu.trim() || undefined
    };

    if (editingQuestionId) {
      await updateQuestion(payload);
    } else {
      await addQuestion(payload);
    }

    setIsModalOpen(false);
  };

  // Archive question instead of deleting if already used (Requirement 4)
  const handleArchive = async (id: string) => {
    if (
      window.confirm(
        language === 'ky'
          ? 'Бул суроону архивге жылдырууну каалайсызбы? Ал тесттердин тарыхында сакталат.'
          : 'Переместить этот вопрос в архив? Он сохранится в истории ранее пройденных тестов.'
      )
    ) {
      await deleteQuestion(id);
    }
  };

  // CSV parsing & validation (Requirement 4)
  const handleProcessCsv = async (commit = false) => {
    if (!csvText.trim()) {
      showToast(language === 'ky' ? 'CSV текстин киргизиңиз' : 'Введите CSV данные', 'warning');
      return;
    }

    setIsImporting(true);
    try {
      // Parse CSV rows
      const lines = csvText.trim().split('\n').filter((l) => l.trim().length > 0);
      const headers = lines[0].split(',').map((h) => h.trim().toLowerCase());

      const rows: any[] = [];
      for (let i = 1; i < lines.length; i++) {
        // Simple comma split handling quoted strings
        const regex = /(?:,|\n|^)("(?:(?:"")*[^"]*)*"|[^",\n]*|(?:\n|$))/g;
        const matches: string[] = [];
        let match;
        while ((match = regex.exec(lines[i])) !== null) {
          if (match.index === regex.lastIndex) regex.lastIndex++;
          let val = match[1] || '';
          if (val.startsWith('"') && val.endsWith('"')) val = val.slice(1, -1).replace(/""/g, '"');
          matches.push(val.trim());
          if (matches.length > 20) break;
        }

        const rowObj: any = {};
        headers.forEach((h, idx) => {
          rowObj[h] = matches[idx] || '';
        });
        rows.push(rowObj);
      }

      // Send to server import validator
      const res = await api.importQuestions(rows, commit);
      setImportResult(res);

      if (commit && res.imported) {
        showToast(
          language === 'ky'
            ? `${res.validCount} суроо ийгиликтүү кошулду!`
            : `Успешно импортировано ${res.validCount} вопросов!`,
          'success'
        );
        await reloadQuestions();
      }
    } catch (e: any) {
      showToast(e.message || 'Импорт катасы', 'error');
    } finally {
      setIsImporting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Admin Header */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/90 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-slate-900 text-white flex items-center justify-center font-bold">
              <ShieldCheck className="w-6 h-6 text-blue-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-black text-slate-900">
                  {language === 'ky' ? 'Администратор панелин жана Банк суроолорун башкаруу' : 'Панель администратора и Банк вопросов'}
                </h1>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800">
                  PostgreSQL
                </span>
              </div>
              <p className="text-xs sm:text-sm text-slate-500">
                {language === 'ky'
                  ? 'ОРТ базасын толуктоо, суроолорду валидациялоо жана CSV/Excel импорту'
                  : 'Управление банком заданий ОРТ, двухъязычная валидация и CSV-импорт'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {activeTab === 'questions' && (
              <>
                <button
                  id="btn-admin-import-csv"
                  onClick={() => {
                    setImportResult(null);
                    setIsImportModalOpen(true);
                  }}
                  className="px-4 py-3 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs sm:text-sm flex items-center gap-2 transition-colors cursor-pointer"
                >
                  <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
                  <span>{language === 'ky' ? 'CSV Импорт' : 'Импорт из CSV'}</span>
                </button>

                <button
                  id="btn-admin-add-question"
                  onClick={openAddModal}
                  className="px-5 py-3 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs sm:text-sm shadow-sm flex items-center gap-2 transition-colors cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>{language === 'ky' ? 'Жаңы суроо кошуу' : 'Добавить вопрос'}</span>
                </button>
              </>
            )}
          </div>
        </div>

        {/* Navigation Tabs (Questions, Analytics, Payments, Promocodes) */}
        <div className="flex flex-wrap border-b border-slate-200">
          <button
            id="tab-admin-questions"
            onClick={() => setActiveTab('questions')}
            className={`py-3 px-5 sm:px-6 font-bold text-sm border-b-2 flex items-center gap-2 transition-colors cursor-pointer ${
              activeTab === 'questions'
                ? 'border-blue-600 text-blue-600 bg-white/70'
                : 'border-transparent text-slate-500 hover:text-slate-900'
            }`}
          >
            <Database className="w-4 h-4" />
            <span>{language === 'ky' ? 'Банк суроолору' : 'Банк вопросов'}</span>
            <span className="px-2 py-0.5 rounded-full text-xs bg-slate-100 text-slate-600 font-semibold">
              {questions.length}
            </span>
          </button>

          <button
            id="tab-admin-analytics"
            onClick={() => setActiveTab('analytics')}
            className={`py-3 px-5 sm:px-6 font-bold text-sm border-b-2 flex items-center gap-2 transition-colors cursor-pointer ${
              activeTab === 'analytics'
                ? 'border-blue-600 text-blue-600 bg-white/70'
                : 'border-transparent text-slate-500 hover:text-slate-900'
            }`}
          >
            <BarChart3 className="w-4 h-4 text-blue-600" />
            <span>{language === 'ky' ? 'Аналитика & Графиктер' : 'Аналитика & Графики'}</span>
            <span className="px-2 py-0.5 rounded-full text-xs bg-indigo-100 text-indigo-800 font-bold">
              {language === 'ky' ? 'Жаңы' : 'New'}
            </span>
          </button>

          <button
            id="tab-admin-payments"
            onClick={() => setActiveTab('payments')}
            className={`py-3 px-5 sm:px-6 font-bold text-sm border-b-2 flex items-center gap-2 transition-colors cursor-pointer ${
              activeTab === 'payments'
                ? 'border-blue-600 text-blue-600 bg-white/70'
                : 'border-transparent text-slate-500 hover:text-slate-900'
            }`}
          >
            <CreditCard className="w-4 h-4" />
            <span>{language === 'ky' ? 'Төлөмдөр & Finik' : 'Платежи & Finik'}</span>
            <span className="px-2 py-0.5 rounded-full text-xs bg-emerald-100 text-emerald-800 font-bold">
              Finik SDK
            </span>
          </button>

          <button
            id="tab-admin-promocodes"
            onClick={() => setActiveTab('promocodes')}
            className={`py-3 px-5 sm:px-6 font-bold text-sm border-b-2 flex items-center gap-2 transition-colors cursor-pointer ${
              activeTab === 'promocodes'
                ? 'border-blue-600 text-blue-600 bg-white/70'
                : 'border-transparent text-slate-500 hover:text-slate-900'
            }`}
          >
            <Tag className="w-4 h-4" />
            <span>{t.adminTabPromo || (language === 'ky' ? 'Промокоддор' : 'Промокоды')}</span>
            <span className="px-2 py-0.5 rounded-full text-xs bg-blue-100 text-blue-800 font-bold">
              Скидки
            </span>
          </button>
        </div>

        {activeTab === 'analytics' ? (
          <AdminAnalyticsTab />
        ) : activeTab === 'payments' ? (
          <AdminPaymentsTab />
        ) : activeTab === 'promocodes' ? (
          <AdminPromocodesTab />
        ) : (
          <>
        {/* 5 Admin Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          <div className="p-5 bg-white rounded-2xl border border-slate-200 shadow-2xs">
            <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
              <span>{language === 'ky' ? 'Жалпы суроолор' : 'Всего вопросов в базе'}</span>
              <Database className="w-4 h-4 text-blue-600" />
            </div>
            <p className="text-2xl font-black text-slate-900">{questions.length}</p>
            <span className="text-[10px] text-emerald-600 font-semibold">30 демо + база</span>
          </div>

          <div className="p-5 bg-white rounded-2xl border border-slate-200 shadow-2xs">
            <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
              <span>{t.adminCompletedTests}</span>
              <CheckCircle className="w-4 h-4 text-emerald-600" />
            </div>
            <p className="text-2xl font-black text-slate-900">14,290</p>
            <span className="text-[10px] text-slate-500">диагностика & сынактар</span>
          </div>

          <div className="p-5 bg-white rounded-2xl border border-slate-200 shadow-2xs">
            <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
              <span>{t.adminAverageScore}</span>
              <BarChart2 className="w-4 h-4 text-purple-600" />
            </div>
            <p className="text-2xl font-black text-slate-900">146.4</p>
            <span className="text-[10px] text-purple-600 font-semibold">баштапкы 128ден өстү</span>
          </div>

          <div className="p-5 bg-white rounded-2xl border border-slate-200 shadow-2xs">
            <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
              <span>{language === 'ky' ? 'Жарыяланган' : 'Опубликовано'}</span>
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            </div>
            <p className="text-2xl font-black text-emerald-700">
              {questions.filter((q) => (q.status || 'published') === 'published').length}
            </p>
            <span className="text-[10px] text-slate-500">тесттерге жеткиликтүү</span>
          </div>

          <div className="p-5 bg-white rounded-2xl border border-slate-200 shadow-2xs">
            <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
              <span>{language === 'ky' ? 'Архивдегилер' : 'В архиве'}</span>
              <Archive className="w-4 h-4 text-slate-400" />
            </div>
            <p className="text-2xl font-black text-slate-700">
              {questions.filter((q) => q.status === 'archived').length}
            </p>
            <span className="text-[10px] text-slate-500">тарыхта сакталган</span>
          </div>
        </div>

        {/* Questions Management Table / Cards */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/90 shadow-sm space-y-6">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-slate-100 pb-5">
            <div>
              <h2 className="text-base sm:text-lg font-bold text-slate-900">
                {language === 'ky' ? 'Суроолор банкы' : 'Банк заданий'} ({filteredQuestions.length})
              </h2>
            </div>

            {/* 4 Multi-Filters: Subject, Status, Difficulty, Search (Requirement 4) */}
            <div className="flex flex-wrap items-center gap-3">
              {/* Search */}
              <div className="relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder={language === 'ky' ? 'Издөө...' : 'Поиск по тексту или теме...'}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9 pr-4 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:border-blue-500 w-44 sm:w-56"
                />
              </div>

              {/* Subject Filter */}
              <select
                value={selectedSubjectFilter}
                onChange={(e) => setSelectedSubjectFilter(e.target.value)}
                className="py-2 px-3 rounded-xl border border-slate-200 text-xs font-semibold bg-white text-slate-700 focus:outline-none focus:border-blue-500"
              >
                <option value="all">{language === 'ky' ? 'Бардык предметтер' : 'Все предметы'}</option>
                <option value="math">{language === 'ky' ? 'Математика' : 'Математика'}</option>
                <option value="analogies">{language === 'ky' ? 'Аналогиялар' : 'Аналогии'}</option>
                <option value="reading">{language === 'ky' ? 'Окуп түшүнүү' : 'Чтение текста'}</option>
              </select>

              {/* Status Filter */}
              <select
                value={selectedStatusFilter}
                onChange={(e) => setSelectedStatusFilter(e.target.value)}
                className="py-2 px-3 rounded-xl border border-slate-200 text-xs font-semibold bg-white text-slate-700 focus:outline-none focus:border-blue-500"
              >
                <option value="all">{language === 'ky' ? 'Бардык статустар' : 'Все статусы'}</option>
                <option value="published">{language === 'ky' ? 'Опубликован' : 'Опубликован'}</option>
                <option value="review">{language === 'ky' ? 'На проверке' : 'На проверке'}</option>
                <option value="draft">{language === 'ky' ? 'Черновик' : 'Черновик'}</option>
                <option value="archived">{language === 'ky' ? 'Архив' : 'Архив'}</option>
              </select>

              {/* Difficulty Filter */}
              <select
                value={selectedDifficultyFilter}
                onChange={(e) => setSelectedDifficultyFilter(e.target.value)}
                className="py-2 px-3 rounded-xl border border-slate-200 text-xs font-semibold bg-white text-slate-700 focus:outline-none focus:border-blue-500"
              >
                <option value="all">{language === 'ky' ? 'Бардык татаалдык' : 'Любая сложность'}</option>
                <option value="easy">{language === 'ky' ? 'Жөнөкөй (Easy)' : 'Легкий'}</option>
                <option value="medium">{language === 'ky' ? 'Орточо (Medium)' : 'Средний'}</option>
                <option value="hard">{language === 'ky' ? 'Татаал (Hard)' : 'Сложный'}</option>
              </select>
            </div>
          </div>

          {/* Question List Display */}
          <div className="space-y-4">
            {filteredQuestions.map((q: any, idx) => {
              const subTitle =
                q.subjectId === 'math' || q.subject_id === 'math'
                  ? 'Математика'
                  : q.subjectId === 'analogies' || q.subject_id === 'analogies'
                  ? 'Аналогии'
                  : 'Чтение текста';
              const topicText = q.topic?.[language] || q.topic_ky || q.topic_ru || 'Тема';
              const textContent = q.text?.[language] || q.text_ky || q.text_ru || '';
              const correctIdx = q.correctOptionIndex !== undefined ? q.correctOptionIndex : q.correct_option_index || 0;
              const optionsList = (q.options?.[language] || (language === 'ky' ? q.options_ky : q.options_ru) || []) as string[];
              const statusVal = q.status || 'published';

              return (
                <div
                  key={q.id || idx}
                  className={`p-5 rounded-2xl border transition-all ${
                    statusVal === 'archived'
                      ? 'bg-slate-50 border-slate-200 opacity-60'
                      : 'bg-white border-slate-200/90 hover:border-slate-300 shadow-2xs'
                  }`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3 mb-3">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="px-2.5 py-0.5 rounded-md text-[11px] font-bold bg-blue-50 text-blue-700 border border-blue-100">
                        {subTitle}
                      </span>
                      <span className="text-xs font-semibold text-slate-700">{topicText}</span>
                      <span
                        className={`px-2 py-0.5 rounded-md text-[10px] font-bold uppercase ${
                          q.difficulty === 'hard'
                            ? 'bg-rose-50 text-rose-700 border border-rose-100'
                            : q.difficulty === 'easy'
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-100'
                            : 'bg-amber-50 text-amber-700 border border-amber-100'
                        }`}
                      >
                        {q.difficulty || 'medium'}
                      </span>
                      <span
                        className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${
                          statusVal === 'published'
                            ? 'bg-emerald-100 text-emerald-800'
                            : statusVal === 'review'
                            ? 'bg-amber-100 text-amber-800'
                            : statusVal === 'draft'
                            ? 'bg-slate-200 text-slate-800'
                            : 'bg-rose-100 text-rose-800'
                        }`}
                      >
                        {statusVal}
                      </span>
                      {q.isDemo && (
                        <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-purple-50 text-purple-700 border border-purple-100">
                          Демо-үлгү
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => openEditModal(q)}
                        className="p-1.5 rounded-lg text-slate-500 hover:text-blue-600 hover:bg-slate-100 transition-colors"
                        title={language === 'ky' ? 'Оңдоо' : 'Редактировать'}
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleArchive(q.id)}
                        className="p-1.5 rounded-lg text-slate-500 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                        title={language === 'ky' ? 'Архивге жылдыруу' : 'Переместить в архив'}
                      >
                        <Archive className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  <p className="text-sm font-semibold text-slate-900 mb-3 whitespace-pre-line leading-relaxed">
                    {textContent}
                  </p>

                  {/* Options Overview */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                    {optionsList.map((opt: string, optIdx: number) => {
                      const isCorrect = optIdx === correctIdx;
                      return (
                        <div
                          key={optIdx}
                          className={`p-2.5 rounded-xl border flex items-center justify-between ${
                            isCorrect
                              ? 'bg-emerald-50/70 border-emerald-300 text-emerald-950 font-bold'
                              : 'bg-slate-50/50 border-slate-200 text-slate-600'
                          }`}
                        >
                          <span>{opt}</span>
                          {isCorrect && (
                            <span className="text-[10px] bg-emerald-600 text-white px-1.5 py-0.5 rounded-md">
                              {language === 'ky' ? 'Туура' : 'Верный'}
                            </span>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}

            {filteredQuestions.length === 0 && (
              <div className="text-center py-12 text-slate-500 text-xs">
                {language === 'ky' ? 'Суроолор табылган жок' : 'Вопросов по выбранным фильтрам не найдено'}
              </div>
            )}
          </div>
        </div>
        </>
        )}
      </div>

      {/* Modal: Add / Edit Question with strict validation */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="max-w-3xl w-full bg-white rounded-3xl p-6 sm:p-8 space-y-6 shadow-2xl border border-slate-100 my-8">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <h3 className="text-lg font-bold text-slate-900">
                {editingQuestionId
                  ? language === 'ky' ? 'Суроону өзгөртүү' : 'Редактировать вопрос'
                  : language === 'ky' ? 'Жаңы суроо кошуу' : 'Добавить новый вопрос'}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveQuestion} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Предмет</label>
                  <select
                    value={formData.subjectId}
                    onChange={(e) => setFormData({ ...formData, subjectId: e.target.value as SubjectId })}
                    className="w-full p-2.5 rounded-xl border border-slate-200 font-semibold"
                  >
                    <option value="math">Математика</option>
                    <option value="analogies">Аналогии</option>
                    <option value="reading">Чтение текста</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Сложность</label>
                  <select
                    value={formData.difficulty}
                    onChange={(e) => setFormData({ ...formData, difficulty: e.target.value as any })}
                    className="w-full p-2.5 rounded-xl border border-slate-200 font-semibold"
                  >
                    <option value="easy">Легкий</option>
                    <option value="medium">Средний</option>
                    <option value="hard">Сложный</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Статус</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                    className="w-full p-2.5 rounded-xl border border-slate-200 font-semibold"
                  >
                    <option value="published">Опубликован</option>
                    <option value="review">На проверке</option>
                    <option value="draft">Черновик</option>
                    <option value="archived">В архиве</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Верный ответ (0-3)</label>
                  <select
                    value={formData.correctOptionIndex}
                    onChange={(e) => setFormData({ ...formData, correctOptionIndex: Number(e.target.value) })}
                    className="w-full p-2.5 rounded-xl border border-blue-200 bg-blue-50 font-bold text-blue-900"
                  >
                    <option value={0}>Вариант А (1-й)</option>
                    <option value={1}>Вариант Б (2-й)</option>
                    <option value={2}>Вариант В (3-й)</option>
                    <option value={3}>Вариант Г (4-й)</option>
                  </select>
                </div>
              </div>

              {/* Bilingual Topics */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Тема (Кыргызча)</label>
                  <input
                    type="text"
                    required
                    placeholder="Мисалы: Сызыктуу теңдемелер"
                    value={formData.topicKy}
                    onChange={(e) => setFormData({ ...formData, topicKy: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-slate-200"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Тема (Русский)</label>
                  <input
                    type="text"
                    required
                    placeholder="Например: Линейные уравнения"
                    value={formData.topicRu}
                    onChange={(e) => setFormData({ ...formData, topicRu: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-slate-200"
                  />
                </div>
              </div>

              {/* Bilingual Question Text */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Текст суроосу (Кыргызча) *</label>
                  <textarea
                    rows={3}
                    required
                    value={formData.textKy}
                    onChange={(e) => setFormData({ ...formData, textKy: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-slate-200"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Текст вопроса (Русский) *</label>
                  <textarea
                    rows={3}
                    required
                    value={formData.textRu}
                    onChange={(e) => setFormData({ ...formData, textRu: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-slate-200"
                  />
                </div>
              </div>

              {/* Bilingual 4 Options */}
              <div>
                <label className="block font-bold text-slate-700 mb-1">Варианты жооптору (4 вариант тең эки тилде)</label>
                <div className="space-y-2">
                  {[0, 1, 2, 3].map((optIdx) => (
                    <div key={optIdx} className="grid grid-cols-2 gap-2">
                      <input
                        type="text"
                        required
                        placeholder={`Вариант ${['А', 'Б', 'В', 'Г'][optIdx]} (KY)`}
                        value={formData.optionsKy[optIdx]}
                        onChange={(e) => {
                          const updated = [...formData.optionsKy] as [string, string, string, string];
                          updated[optIdx] = e.target.value;
                          setFormData({ ...formData, optionsKy: updated });
                        }}
                        className="p-2 rounded-xl border border-slate-200"
                      />
                      <input
                        type="text"
                        required
                        placeholder={`Вариант ${['А', 'Б', 'В', 'Г'][optIdx]} (RU)`}
                        value={formData.optionsRu[optIdx]}
                        onChange={(e) => {
                          const updated = [...formData.optionsRu] as [string, string, string, string];
                          updated[optIdx] = e.target.value;
                          setFormData({ ...formData, optionsRu: updated });
                        }}
                        className="p-2 rounded-xl border border-slate-200"
                      />
                    </div>
                  ))}
                </div>
              </div>

              {/* Explanations */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Чыгаруунун түшүндүрмөсү (KY) *</label>
                  <textarea
                    rows={2}
                    required
                    value={formData.explanationKy}
                    onChange={(e) => setFormData({ ...formData, explanationKy: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-slate-200"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Объяснение решения (RU) *</label>
                  <textarea
                    rows={2}
                    required
                    value={formData.explanationRu}
                    onChange={(e) => setFormData({ ...formData, explanationRu: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-slate-200"
                  />
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold"
                >
                  {language === 'ky' ? 'Жокко чыгаруу' : 'Отмена'}
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold shadow-sm"
                >
                  {language === 'ky' ? 'Сактоо' : 'Сохранить'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: CSV / Excel Import & Duplicate Check & Validation Report (Requirement 4) */}
      {isImportModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="max-w-2xl w-full bg-white rounded-3xl p-6 sm:p-8 space-y-5 shadow-2xl border border-slate-100">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2 font-bold text-slate-900 text-base">
                <UploadCloud className="w-5 h-5 text-emerald-600" />
                <span>{language === 'ky' ? 'Суроолорду CSV аркылуу импорттоо' : 'Импорт вопросов из CSV / Excel'}</span>
              </div>
              <button
                onClick={() => setIsImportModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 text-xs text-slate-600 space-y-1">
              <p className="font-bold text-slate-800">
                {language === 'ky' ? 'Талап кылынган колонкалар:' : 'Формат колонок CSV (через запятую):'}
              </p>
              <code className="text-[11px] block text-blue-700 bg-white p-2 rounded-lg border border-slate-200 overflow-x-auto">
                subject,topic_ky,topic_ru,difficulty,question_ky,question_ru,option_a_ky,option_a_ru,option_b_ky,option_b_ru,option_c_ky,option_c_ru,option_d_ky,option_d_ru,correct_option,explanation_ky,explanation_ru
              </code>
            </div>

            <div>
              <label className="block font-bold text-xs text-slate-700 mb-1">
                {language === 'ky' ? 'CSV маалыматтарын коюңуз:' : 'Вставьте текст CSV:'}
              </label>
              <textarea
                rows={6}
                value={csvText}
                onChange={(e) => setCsvText(e.target.value)}
                placeholder="subject,topic_ky,topic_ru,difficulty,question_ky,question_ru,option_a_ky,option_a_ru,option_b_ky,option_b_ru,option_c_ky,option_c_ru,option_d_ky,option_d_ru,correct_option,explanation_ky,explanation_ru&#10;math,Бөлчөктөр,Дроби,easy,1/2 + 1/2 эмнеге барабар?,Чему равно 1/2 + 1/2?,1,1,2,2,0,0,1/4,1/4,A,Бир бүтүн болот,Получается единица"
                className="w-full p-3 rounded-2xl border border-slate-200 text-xs font-mono"
              />
            </div>

            {/* Validation & Error Report (Requirement 4) */}
            {importResult && (
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-xs space-y-3">
                <div className="flex items-center justify-between font-bold">
                  <span>{language === 'ky' ? 'Текшерүүнүн жыйынтыгы:' : 'Отчет валидации импорта:'}</span>
                  <div className="flex gap-2">
                    <span className="text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-md">
                      ✓ {importResult.validCount} жарактуу
                    </span>
                    {importResult.errorsCount > 0 && (
                      <span className="text-rose-700 bg-rose-100 px-2 py-0.5 rounded-md">
                        ✕ {importResult.errorsCount} ката
                      </span>
                    )}
                    {importResult.duplicatesCount > 0 && (
                      <span className="text-amber-700 bg-amber-100 px-2 py-0.5 rounded-md">
                        ⚠ {importResult.duplicatesCount} дубликат
                      </span>
                    )}
                  </div>
                </div>

                {/* Error reasons breakdown */}
                {importResult.errorsList?.length > 0 && (
                  <div className="space-y-1 text-[11px] text-rose-800 bg-rose-50 p-2.5 rounded-xl border border-rose-200">
                    <p className="font-bold">Эмне үчүн четке кагылды:</p>
                    {importResult.errorsList.map((err: any, i: number) => (
                      <p key={i}>• Катар {err.rowNumber}: {err.reason}</p>
                    ))}
                  </div>
                )}

                {importResult.duplicates?.length > 0 && (
                  <div className="space-y-1 text-[11px] text-amber-800 bg-amber-50 p-2.5 rounded-xl border border-amber-200">
                    <p className="font-bold">Дубликат эскертүүлөрү:</p>
                    {importResult.duplicates.map((dup: any, i: number) => (
                      <p key={i}>• Катар {dup.rowNumber}: суроо базада мурда бар (ID: {dup.existingId})</p>
                    ))}
                  </div>
                )}
              </div>
            )}

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => handleProcessCsv(false)}
                disabled={isImporting}
                className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs"
              >
                {language === 'ky' ? 'Алдын ала текшерүү' : 'Предварительная проверка'}
              </button>

              <button
                type="button"
                onClick={() => handleProcessCsv(true)}
                disabled={isImporting || !csvText.trim()}
                className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-sm flex items-center gap-2"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>{language === 'ky' ? 'Базага кошуу' : 'Импортировать в базу'}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
