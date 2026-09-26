import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  GraduationCap,
  Sparkles,
  Globe,
  User,
  LogOut,
  Menu,
  X,
  ShieldCheck,
  ChevronDown
} from 'lucide-react';

export const Navbar: React.FC = () => {
  const { language, setLanguage, t, currentView, navigate, user, logout, setIsAuthModalOpen } = useApp();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);

  const toggleLanguage = () => {
    setLanguage(language === 'ky' ? 'ru' : 'ky');
  };

  const navLinks = [
    { label: t.navHome, view: 'home' },
    { label: t.navDiagnostic, view: 'diagnostic' },
    { label: t.navPrep, view: 'training-topic' },
    { label: t.navErrors, view: 'my-errors' },
    { label: t.navMockTest, view: 'practice-mock' },
    { label: t.navPricing, view: 'tariffs' },
    { label: t.navForParents, view: 'parent-cabinet' },
  ];

  const handleNavClick = (view: string) => {
    navigate(view);
    setMobileMenuOpen(false);
  };

  const getCabinetLabel = () => {
    if (!user) return t.navStudentCabinet;
    if (user.role === 'parent') return t.navParentCabinet;
    if (user.role === 'admin') return t.navAdminCabinet;
    return t.navStudentCabinet;
  };

  const getCabinetView = () => {
    if (!user) return 'student-cabinet';
    if (user.role === 'parent') return 'parent-cabinet';
    if (user.role === 'admin') return 'admin-cabinet';
    return 'student-cabinet';
  };

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200/80 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-18">
          {/* Logo & Brand Title */}
          <div
            id="nav-logo"
            onClick={() => navigate('home')}
            className="flex items-center gap-3 cursor-pointer group select-none"
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-700 via-blue-600 to-cyan-500 flex items-center justify-center text-white shadow-sm shadow-blue-500/20 group-hover:scale-105 transition-transform duration-200 shrink-0">
              <GraduationCap className="w-6 h-6" />
            </div>
            <span className="text-xl font-bold tracking-tight text-slate-900 leading-none">
              ОРТ ОНЛАЙН <span className="text-blue-600">KG</span>
            </span>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-1 lg:gap-2">
            {navLinks.map((link) => {
              const isActive = currentView === link.view;
              return (
                <button
                  key={link.view}
                  id={`nav-link-${link.view}`}
                  onClick={() => handleNavClick(link.view)}
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    isActive
                      ? 'text-blue-700 bg-blue-50 font-semibold'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/80'
                  }`}
                >
                  {link.label}
                </button>
              );
            })}
          </nav>

          {/* Right Actions: Lang Switcher & User Auth */}
          <div className="hidden md:flex items-center gap-3">
            {/* Language Switcher */}
            <button
              id="btn-language-toggle"
              onClick={toggleLanguage}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer"
              title={language === 'ky' ? 'Орус тилине которуу' : 'Переключить на кыргызский'}
            >
              <Globe className="w-3.5 h-3.5 text-blue-600" />
              <span>{language === 'ky' ? 'Кыргызча' : 'Русский'}</span>
              <span className="text-[10px] text-slate-400 font-normal">| {language === 'ky' ? 'RU' : 'KG'}</span>
            </button>

            {/* User status */}
            {user ? (
              <div className="relative">
                <button
                  id="btn-user-menu"
                  onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                  className="flex items-center gap-2 pl-2 pr-3 py-1.5 rounded-xl border border-blue-200 bg-blue-50/50 hover:bg-blue-100/50 transition-all text-left"
                >
                  <div className="w-7 h-7 rounded-lg bg-blue-600 text-white flex items-center justify-center font-bold text-xs">
                    {user.fullName.charAt(0)}
                  </div>
                  <div className="hidden lg:block">
                    <p className="text-xs font-bold text-slate-800 leading-tight truncate max-w-[110px]">
                      {user.fullName}
                    </p>
                    <p className="text-[10px] text-blue-600 font-medium leading-none">
                      {user.role === 'admin'
                        ? 'Администратор'
                        : user.role === 'parent'
                        ? 'Ата-эне'
                        : `${user.predictedScore} балл`}
                    </p>
                  </div>
                  <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                </button>

                {userDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-xl border border-slate-100 py-2 z-50 animate-in fade-in zoom-in-95">
                    <div className="px-4 py-2 border-b border-slate-100">
                      <p className="text-xs font-bold text-slate-900">{user.fullName}</p>
                      <p className="text-[11px] text-slate-500">{user.phone}</p>
                      <span className="inline-block mt-1 px-2 py-0.5 rounded text-[10px] font-semibold bg-blue-100 text-blue-800">
                        {user.role === 'admin'
                          ? 'Администратор'
                          : user.role === 'parent'
                          ? 'Родитель'
                          : 'Ученик (ОРТ)'}
                      </span>
                    </div>

                    <button
                      id="dropdown-cabinet-btn"
                      onClick={() => {
                        setUserDropdownOpen(false);
                        navigate(getCabinetView());
                      }}
                      className="w-full text-left px-4 py-2.5 text-xs font-medium text-slate-700 hover:bg-slate-50 flex items-center gap-2"
                    >
                      <User className="w-4 h-4 text-blue-600" />
                      {getCabinetLabel()}
                    </button>

                    <button
                      id="dropdown-admin-panel-btn"
                      onClick={() => {
                        setUserDropdownOpen(false);
                        navigate('admin-cabinet');
                      }}
                      className="w-full text-left px-4 py-2.5 text-xs font-medium text-slate-700 hover:bg-slate-50 flex items-center gap-2 border-t border-slate-50"
                    >
                      <ShieldCheck className="w-4 h-4 text-emerald-600" />
                      {t.navAdminCabinet}
                    </button>

                    <div className="border-t border-slate-100 mt-1 pt-1">
                      <button
                        id="dropdown-logout-btn"
                        onClick={() => {
                          setUserDropdownOpen(false);
                          logout();
                        }}
                        className="w-full text-left px-4 py-2 text-xs font-medium text-rose-600 hover:bg-rose-50 flex items-center gap-2"
                      >
                        <LogOut className="w-4 h-4" />
                        {t.navLogout}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <button
                id="btn-nav-signin"
                onClick={() => setIsAuthModalOpen(true)}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm shadow-sm transition-all"
              >
                <User className="w-4 h-4" />
                {t.navSignIn}
              </button>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="flex md:hidden items-center gap-2">
            <button
              id="btn-mobile-lang-toggle"
              onClick={toggleLanguage}
              className="px-2.5 py-1.5 rounded-lg border border-slate-200 text-xs font-bold text-slate-700"
            >
              {language === 'ky' ? 'KG' : 'RU'}
            </button>
            <button
              id="btn-mobile-menu-toggle"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg text-slate-700 hover:bg-slate-100"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-b border-slate-200 bg-white px-4 pt-2 pb-6 space-y-3">
          <div className="space-y-1">
            {navLinks.map((link) => (
              <button
                key={link.view}
                onClick={() => handleNavClick(link.view)}
                className={`w-full text-left px-3 py-2.5 rounded-lg text-sm font-medium ${
                  currentView === link.view
                    ? 'text-blue-700 bg-blue-50 font-semibold'
                    : 'text-slate-700 hover:bg-slate-100'
                }`}
              >
                {link.label}
              </button>
            ))}
            <button
              onClick={() => handleNavClick('admin-cabinet')}
              className="w-full text-left px-3 py-2.5 rounded-lg text-sm font-medium text-emerald-700 hover:bg-emerald-50"
            >
              {t.navAdminCabinet}
            </button>
          </div>

          <div className="pt-3 border-t border-slate-100 flex flex-col gap-2">
            {user ? (
              <>
                <button
                  onClick={() => handleNavClick(getCabinetView())}
                  className="w-full py-2.5 px-3 rounded-xl bg-blue-50 text-blue-700 font-semibold text-sm flex items-center justify-center gap-2"
                >
                  <User className="w-4 h-4" />
                  {getCabinetLabel()} ({user.fullName})
                </button>
                <button
                  onClick={() => {
                    logout();
                    setMobileMenuOpen(false);
                  }}
                  className="w-full py-2 px-3 rounded-xl text-rose-600 font-medium text-sm flex items-center justify-center gap-2"
                >
                  <LogOut className="w-4 h-4" />
                  {t.navLogout}
                </button>
              </>
            ) : (
              <button
                onClick={() => {
                  setIsAuthModalOpen(true);
                  setMobileMenuOpen(false);
                }}
                className="w-full py-3 rounded-xl bg-blue-600 text-white font-semibold text-sm shadow-sm"
              >
                {t.navSignIn}
              </button>
            )}
          </div>
        </div>
      )}
    </header>
  );
};
