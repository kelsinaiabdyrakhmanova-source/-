import React from 'react';
import { useApp } from '../context/AppContext';
import {
  GraduationCap,
  MessageCircle,
  Instagram,
  Mail,
  Phone,
  MapPin,
  AlertTriangle,
  Heart
} from 'lucide-react';

export const Footer: React.FC = () => {
  const { language, t, navigate } = useApp();

  return (
    <footer className="bg-slate-900 text-slate-300 border-t border-slate-800">
      {/* Top Disclaimer Band */}
      <div className="bg-slate-950/80 border-b border-slate-800/80 py-4 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto flex items-start sm:items-center gap-3 text-xs text-slate-400">
          <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5 sm:mt-0" />
          <p className="leading-relaxed">
            {t.footerDisclaimer}
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">
          {/* Col 1: Brand */}
          <div className="lg:col-span-2 space-y-4">
            <div
              onClick={() => navigate('home')}
              className="flex items-center gap-2.5 cursor-pointer group"
            >
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-600 to-cyan-500 flex items-center justify-center text-white font-bold">
                <GraduationCap className="w-5 h-5" />
              </div>
              <span className="text-xl font-extrabold text-white tracking-tight">
                ОРТ ОНЛАЙН <span className="text-blue-400">KG</span>
              </span>
            </div>
            <p className="text-xs sm:text-sm text-slate-400 max-w-sm leading-relaxed">
              {language === 'ky'
                ? 'Кыргызстандагы бүтүрүүчүлөр үчүн ОРТга даярдоочу расмий билим берүү веб-платформасы жана жеке онлайн-репетитор.'
                : 'Официальная образовательная веб-платформа подготовки к ОРТ с персональным онлайн-репетитором для выпускников Кыргызстана.'}
            </p>

            <div className="pt-2 flex items-center gap-3">
              <a
                href="https://wa.me/996779949400"
                target="_blank"
                rel="noreferrer"
                className="w-9 h-9 rounded-lg bg-slate-800 hover:bg-emerald-600 text-slate-300 hover:text-white flex items-center justify-center transition-colors"
                title="Негизги WhatsApp"
              >
                <MessageCircle className="w-4 h-4" />
              </a>
              <a
                href="https://instagram.com/ort_online_kg"
                target="_blank"
                rel="noreferrer"
                className="w-9 h-9 rounded-lg bg-slate-800 hover:bg-pink-600 text-slate-300 hover:text-white flex items-center justify-center transition-colors"
                title="Instagram @ort_online_kg"
              >
                <Instagram className="w-4 h-4" />
              </a>
              <a
                href="mailto:kelsinay22@gmail.com"
                className="w-9 h-9 rounded-lg bg-slate-800 hover:bg-blue-600 text-slate-300 hover:text-white flex items-center justify-center transition-colors"
                title="Email: kelsinay22@gmail.com"
              >
                <Mail className="w-4 h-4" />
              </a>
            </div>
            <div className="pt-1 text-[11px] text-slate-400">
              <span className="text-slate-300 font-semibold">Instagram: </span>
              <a href="https://instagram.com/ort_online_kg" target="_blank" rel="noreferrer" className="text-pink-400 hover:underline">
                @ort_online_kg
              </a>
            </div>
          </div>

          {/* Col 2: Navigation Links */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold text-white uppercase tracking-wider">
              {language === 'ky' ? 'Бөлүмдөр' : 'Разделы'}
            </h3>
            <ul className="space-y-2 text-xs">
              <li>
                <button
                  onClick={() => navigate('home')}
                  className="hover:text-white transition-colors"
                >
                  {t.navHome}
                </button>
              </li>
              <li>
                <button
                  onClick={() => navigate('diagnostic')}
                  className="hover:text-white transition-colors"
                >
                  {t.btnStartFreeTest}
                </button>
              </li>
              <li>
                <button
                  onClick={() => navigate('training-topic')}
                  className="hover:text-white transition-colors"
                >
                  {t.navPrep}
                </button>
              </li>
              <li>
                <button
                  onClick={() => navigate('practice-mock')}
                  className="hover:text-white transition-colors"
                >
                  {t.navMockTest}
                </button>
              </li>
              <li>
                <button
                  onClick={() => navigate('tariffs')}
                  className="hover:text-white transition-colors"
                >
                  {t.navPricing}
                </button>
              </li>
              <li>
                <button
                  onClick={() => navigate('parent-cabinet')}
                  className="hover:text-white transition-colors"
                >
                  {t.navForParents}
                </button>
              </li>
            </ul>
          </div>

          {/* Col 3: Legal Links */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold text-white uppercase tracking-wider">
              {t.footerLegalLinks}
            </h3>
            <ul className="space-y-2 text-xs">
              <li>
                <button
                  id="footer-privacy-link"
                  onClick={() => navigate('privacy')}
                  className="hover:text-white transition-colors text-left"
                >
                  {t.footerPrivacy}
                </button>
              </li>
              <li>
                <button
                  id="footer-terms-link"
                  onClick={() => navigate('terms')}
                  className="hover:text-white transition-colors text-left"
                >
                  {t.footerTerms}
                </button>
              </li>
              <li>
                <button
                  id="footer-payment-rules-link"
                  onClick={() => navigate('payment-rules')}
                  className="hover:text-white transition-colors text-left"
                >
                  {t.footerPaymentRules}
                </button>
              </li>
              <li>
                <button
                  id="footer-about-link"
                  onClick={() => navigate('about')}
                  className="hover:text-white transition-colors text-left"
                >
                  {t.footerAbout}
                </button>
              </li>
            </ul>
          </div>

          {/* Col 4: Contacts & Support Info */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold text-white uppercase tracking-wider">
              {language === 'ky' ? 'Байланыш жана колдоо' : 'Контакты и поддержка'}
            </h3>
            <ul className="space-y-2.5 text-xs text-slate-400">
              <li className="flex items-center gap-2">
                <MessageCircle className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span>
                  <strong className="text-slate-300">Негизги WhatsApp:</strong>{' '}
                  <a href="https://wa.me/996779949400" target="_blank" rel="noreferrer" className="text-emerald-400 hover:underline">
                    +996 779 949 400
                  </a>
                </span>
              </li>
              <li className="flex items-center gap-2">
                <Phone className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                <span>
                  <strong className="text-slate-300">Колдоо (Тел/WA):</strong>{' '}
                  <a href="https://wa.me/996507392634" target="_blank" rel="noreferrer" className="text-blue-400 hover:underline">
                    +996 507 392 634
                  </a>
                </span>
              </li>
              <li className="flex items-center gap-2">
                <Mail className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                <span>
                  <strong className="text-slate-300">Администратор:</strong>{' '}
                  <a href="mailto:kelsinay22@gmail.com" className="text-cyan-400 hover:underline">
                    kelsinay22@gmail.com
                  </a>
                </span>
              </li>
              <li className="flex items-center gap-2 text-[11px] text-slate-400">
                <MessageCircle className="w-3 h-3 text-emerald-500 shrink-0" />
                <span>
                  Админ билдирүүлөр: <a href="https://wa.me/79647004970" target="_blank" rel="noreferrer" className="text-slate-300 hover:underline">+7 964 700 49 70</a>
                </span>
              </li>
              <li className="pt-1 border-t border-slate-800 text-[11px] text-slate-400">
                <span className="text-slate-300 font-semibold">Төлөм алуучу: </span> ОсОО «Билет Центр»
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom copyright line */}
        <div className="pt-8 mt-8 border-t border-slate-800/80 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-4">
          <p>© {new Date().getFullYear()} ОРТ ОНЛАЙН KG. {t.allRightsReserved}</p>
          <p className="flex items-center gap-1">
            <span>{language === 'ky' ? 'Кыргызстандын билим берүүсү үчүн' : 'Сделано для школьников Кыргызстана'}</span>
            <Heart className="w-3 h-3 text-rose-500 fill-rose-500 inline" />
          </p>
        </div>
      </div>
    </footer>
  );
};
