import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { Question } from '../types';
import { api } from '../services/api';
import {
  Sparkles,
  Bot,
  User,
  Send,
  HelpCircle,
  CheckCircle2,
  AlertCircle,
  Lightbulb,
  RotateCcw,
  BookOpen,
  X,
  Copy,
  Check
} from 'lucide-react';

interface AiExplainerModalProps {
  isOpen: boolean;
  onClose: () => void;
  question: Question;
  studentAnswerIndex?: number | null;
}

interface Message {
  id: string;
  sender: 'ai' | 'user';
  text: string;
  time: string;
}

export const AiExplainerModal: React.FC<AiExplainerModalProps> = ({
  isOpen,
  onClose,
  question,
  studentAnswerIndex
}) => {
  const { language, t } = useApp();
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputVal, setInputVal] = useState('');
  const [loading, setLoading] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const isKy = language === 'ky';
  const optLetters = ['А', 'Б', 'В', 'Г'];

  // Initialize or reset when question changes
  useEffect(() => {
    if (isOpen && question) {
      const introText = isKy
        ? `Салам! Мен «ОРТ Онлайн» жеке онлайн-репетиторумун. Бул «${question.topic[language]}» тапшырмасы боюнча сизге каалаган сурооңузга түшүндүрмө берүүгө даярмын. Төмөнкү баскычтардын бирин тандаңыз же өз сурооңузду жазыңыз!`
        : `Привет! Я персональный онлайн-репетитор «ОРТ Онлайн». Я готов подробно разобрать с вами задание по теме «${question.topic[language]}». Выберите один из частых вопросов ниже или задайте свой собственный!`;

      setMessages([
        {
          id: 'welcome',
          sender: 'ai',
          text: introText,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);
    }
  }, [isOpen, question?.id, language]);

  if (!isOpen || !question) return null;

  const handleAction = async (action: 'why_correct' | 'why_incorrect' | 'simpler' | 'similar' | 'custom', customText?: string) => {
    const userQueryText = customText || (
      action === 'why_correct'
        ? (isKy ? 'Эмнеге бул туура?' : 'Почему этот ответ правильный?')
        : action === 'why_incorrect'
        ? (isKy ? 'Эмнеге менин жообум туура эмес?' : 'Почему мой ответ неверный?')
        : action === 'simpler'
        ? (isKy ? 'Жөнөкөй тил менен түшүндүр' : 'Объясни простыми словами')
        : (isKy ? 'Окшош башка мисал бер' : 'Приведи похожий пример с решением')
    );

    const userMsg: Message = {
      id: 'usr-' + Date.now(),
      sender: 'user',
      text: userQueryText,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputVal('');
    setLoading(true);

    try {
      const res = await api.askAiExplainer({
        questionText: question.text[language],
        options: question.options[language],
        correctIndex: question.correctOptionIndex,
        studentIndex: studentAnswerIndex,
        explanation: question.explanation[language],
        formulaOrRule: question.formulaOrRule?.[language],
        topic: question.topic[language],
        subjectId: question.subjectId,
        action,
        customQuery: customText,
        language
      });

      const aiMsg: Message = {
        id: 'ai-' + Date.now(),
        sender: 'ai',
        text: res.reply || (isKy ? 'Түшүндүрмө даярдалды.' : 'Объяснение подготовлено.'),
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages((prev) => [...prev, aiMsg]);
    } catch (e: any) {
      const errorMsg: Message = {
        id: 'ai-err-' + Date.now(),
        sender: 'ai',
        text: isKy
          ? `Түшүндүрмө: ${question.explanation[language]}\n\nФормула / Эреже: ${question.formulaOrRule?.[language] || 'Жалпы эрежелерге таяныңыз.'}`
          : `Пояснение: ${question.explanation[language]}\n\nПравило: ${question.formulaOrRule?.[language] || 'Опирайтесь на стандартные свойства.'}`,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl border border-slate-200 flex flex-col max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between bg-gradient-to-r from-blue-50/90 via-indigo-50/60 to-purple-50/80">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white flex items-center justify-center shadow-md shadow-blue-500/20">
              <Bot className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-black text-slate-900 text-base sm:text-lg">
                  {isKy ? 'Суроонун түшүндүрмөсү' : 'Пошаговый разбор'}
                </h3>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 text-blue-700 border border-blue-200 flex items-center gap-1">
                  ОРТ Онлайн
                </span>
              </div>
              <p className="text-xs text-slate-500 truncate max-w-xs sm:max-w-md">
                {question.topic[language]} • {question.subjectId.toUpperCase()}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-9 h-9 rounded-xl border border-slate-200/80 hover:bg-slate-100 text-slate-400 hover:text-slate-700 flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Compact Question Preview Card */}
        <div className="px-5 py-3 bg-slate-50/80 border-b border-slate-100 text-xs text-slate-700 space-y-1.5 shrink-0">
          <p className="font-semibold text-slate-900 line-clamp-2">
            📌 {question.text[language]}
          </p>
          <div className="flex flex-wrap items-center gap-2 text-[11px]">
            <span className="px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800 font-bold border border-emerald-200">
              {isKy ? 'Туура вариант:' : 'Правильный ответ:'} {optLetters[question.correctOptionIndex]}) {question.options[language][question.correctOptionIndex]}
            </span>
            {studentAnswerIndex !== undefined && studentAnswerIndex !== null && studentAnswerIndex >= 0 && (
              <span
                className={`px-2 py-0.5 rounded-md font-bold border ${
                  studentAnswerIndex === question.correctOptionIndex
                    ? 'bg-emerald-100 text-emerald-800 border-emerald-200'
                    : 'bg-rose-100 text-rose-800 border-rose-200'
                }`}
              >
                {isKy ? 'Сиздин тандооңуз:' : 'Ваш ответ:'} {optLetters[studentAnswerIndex]}) {question.options[language][studentAnswerIndex]}
              </span>
            )}
          </div>
        </div>

        {/* Chat Stream Area */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-3.5 bg-slate-50/40 text-xs sm:text-sm">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex items-start gap-2.5 ${
                msg.sender === 'user' ? 'justify-end' : 'justify-start'
              }`}
            >
              {msg.sender === 'ai' && (
                <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white flex items-center justify-center shrink-0 mt-0.5 shadow-xs">
                  <Bot className="w-4 h-4" />
                </div>
              )}

              <div
                className={`relative group p-4 rounded-2xl max-w-[88%] sm:max-w-[80%] leading-relaxed ${
                  msg.sender === 'user'
                    ? 'bg-blue-600 text-white rounded-br-xs shadow-xs'
                    : 'bg-white border border-slate-200/90 text-slate-800 rounded-bl-xs shadow-xs'
                }`}
              >
                <div className="whitespace-pre-line text-xs sm:text-[13px] leading-relaxed">
                  {msg.text}
                </div>
                <div
                  className={`mt-1 text-[10px] flex items-center justify-between gap-3 ${
                    msg.sender === 'user' ? 'text-blue-200' : 'text-slate-400'
                  }`}
                >
                  <span>{msg.time}</span>
                  {msg.sender === 'ai' && (
                    <button
                      onClick={() => handleCopy(msg.id, msg.text)}
                      className="opacity-0 group-hover:opacity-100 transition-opacity text-slate-500 hover:text-slate-800 flex items-center gap-1 cursor-pointer"
                      title={isKy ? 'Көчүрүп алуу' : 'Скопировать'}
                    >
                      {copiedId === msg.id ? (
                        <>
                          <Check className="w-3 h-3 text-emerald-600" />
                          <span className="text-[10px] text-emerald-600">{isKy ? 'Көчүрүлдү' : 'Скопировано'}</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3 h-3" />
                          <span className="text-[10px]">{isKy ? 'Көчүрүү' : 'Копировать'}</span>
                        </>
                      )}
                    </button>
                  )}
                </div>
              </div>

              {msg.sender === 'user' && (
                <div className="w-8 h-8 rounded-xl bg-slate-200 text-slate-700 flex items-center justify-center shrink-0 mt-0.5">
                  <User className="w-4 h-4" />
                </div>
              )}
            </div>
          ))}

          {loading && (
            <div className="flex items-center gap-3 p-3.5 rounded-2xl bg-white border border-slate-200 text-xs text-blue-700 shadow-xs max-w-xs animate-pulse">
              <Bot className="w-4 h-4 animate-spin text-blue-600" />
              <span className="font-semibold">
                {isKy ? 'Онлайн-репетитор түшүндүрмө даярдоодо...' : 'Онлайн-репетитор готовит объяснение...'}
              </span>
            </div>
          )}
        </div>

        {/* 4 Instant Action Buttons (Requirement 5: Эмнеге бул туура?, Эмнеге менин жообум туура эмес?, Жөнөкөй тил менен түшүндүр, Окшош башка мисал бер) */}
        <div className="p-3 bg-white border-t border-slate-100 space-y-2 shrink-0">
          <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider px-1">
            {isKy ? 'Тез суроолор:' : 'Быстрые вопросы:'}
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            <button
              id="ai-btn-why-correct"
              disabled={loading}
              onClick={() => handleAction('why_correct')}
              className="p-2 sm:py-2.5 px-2 rounded-xl border border-emerald-200 hover:border-emerald-300 bg-emerald-50/70 hover:bg-emerald-100/70 text-emerald-900 text-[11px] sm:text-xs font-bold flex flex-col items-center justify-center gap-1 transition-all text-center cursor-pointer disabled:opacity-50"
            >
              <Lightbulb className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{isKy ? 'Эмнеге бул туура?' : 'Почему это правильно?'}</span>
            </button>

            <button
              id="ai-btn-why-incorrect"
              disabled={loading}
              onClick={() => handleAction('why_incorrect')}
              className="p-2 sm:py-2.5 px-2 rounded-xl border border-rose-200 hover:border-rose-300 bg-rose-50/70 hover:bg-rose-100/70 text-rose-900 text-[11px] sm:text-xs font-bold flex flex-col items-center justify-center gap-1 transition-all text-center cursor-pointer disabled:opacity-50"
            >
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>{isKy ? 'Эмнеге ката?' : 'Почему мой ответ неверен?'}</span>
            </button>

            <button
              id="ai-btn-simpler"
              disabled={loading}
              onClick={() => handleAction('simpler')}
              className="p-2 sm:py-2.5 px-2 rounded-xl border border-purple-200 hover:border-purple-300 bg-purple-50/70 hover:bg-purple-100/70 text-purple-900 text-[11px] sm:text-xs font-bold flex flex-col items-center justify-center gap-1 transition-all text-center cursor-pointer disabled:opacity-50"
            >
              <HelpCircle className="w-4 h-4 text-purple-600 shrink-0" />
              <span>{isKy ? 'Жөнөкөй тилде' : 'Простыми словами'}</span>
            </button>

            <button
              id="ai-btn-similar"
              disabled={loading}
              onClick={() => handleAction('similar')}
              className="p-2 sm:py-2.5 px-2 rounded-xl border border-blue-200 hover:border-blue-300 bg-blue-50/70 hover:bg-blue-100/70 text-blue-900 text-[11px] sm:text-xs font-bold flex flex-col items-center justify-center gap-1 transition-all text-center cursor-pointer disabled:opacity-50"
            >
              <RotateCcw className="w-4 h-4 text-blue-600 shrink-0" />
              <span>{isKy ? 'Окшош мисал' : 'Похожий пример'}</span>
            </button>
          </div>

          {/* Custom Input */}
          <div className="flex items-center gap-2 pt-1">
            <input
              type="text"
              value={inputVal}
              onChange={(e) => setInputVal(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && inputVal.trim() && !loading) {
                  handleAction('custom', inputVal.trim());
                }
              }}
              placeholder={isKy ? 'Онлайн-репетитордон каалаган нерсеңизди сураңыз...' : 'Задайте любой вопрос онлайн-репетитору...'}
              className="flex-1 px-4 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm focus:outline-none focus:border-blue-600 bg-slate-50/60 focus:bg-white transition-all"
            />
            <button
              disabled={!inputVal.trim() || loading}
              onClick={() => handleAction('custom', inputVal.trim())}
              className="p-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:opacity-40 text-white transition-colors cursor-pointer shrink-0 shadow-xs shadow-blue-600/20"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
