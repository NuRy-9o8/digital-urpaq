import React, { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { LogOut, Menu, X } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';

const fallbackLabels = {
  ru: {
    palace: 'Дворец школьников',
    home: 'Главная',
    clubs: 'Кружки',
    academy: 'Летняя Академия',
    news: 'Новости',
    events: 'Мероприятия',
    about: 'О дворце',
    contacts: 'Контакты',
    login: 'Вход',
    register: 'Регистрация',
    logout: 'Выйти',
    profile: 'Профиль',
    myApplications: 'Мои заявки',
    admin: 'Админ-панель',
    teacher: 'Кабинет учителя',
    mainMenu: 'Главное меню',
    mobileMenu: 'Мобильное меню',
    openMenu: 'Открыть меню',
    closeMenu: 'Закрыть меню',
  },
  kz: {
    palace: 'Оқушылар сарайы',
    home: 'Басты бет',
    clubs: 'Үйірмелер',
    academy: 'Жазғы Академия',
    news: 'Жаңалықтар',
    events: 'Іс-шаралар',
    about: 'Сарай туралы',
    contacts: 'Байланыс',
    login: 'Кіру',
    register: 'Тіркелу',
    logout: 'Шығу',
    profile: 'Профиль',
    myApplications: 'Өтінімдерім',
    admin: 'Әкімші панелі',
    teacher: 'Мұғалім кабинеті',
    mainMenu: 'Негізгі мәзір',
    mobileMenu: 'Мобильді мәзір',
    openMenu: 'Мәзірді ашу',
    closeMenu: 'Мәзірді жабу',
  },
  en: {
    palace: 'Student Palace',
    home: 'Home',
    clubs: 'Clubs',
    academy: 'Summer Academy',
    news: 'News',
    events: 'Events',
    about: 'About',
    contacts: 'Contacts',
    login: 'Login',
    register: 'Register',
    logout: 'Logout',
    profile: 'Profile',
    myApplications: 'My applications',
    admin: 'Admin panel',
    teacher: 'Teacher area',
    mainMenu: 'Main menu',
    mobileMenu: 'Mobile menu',
    openMenu: 'Open menu',
    closeMenu: 'Close menu',
  },
};

export const Header = () => {
  const navigate = useNavigate();
  const { isAuthenticated, user, logout, isAdmin, isTeacher, isStudent } = useAuth();
  const { locale, setLanguage, t } = useLanguage();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const labels = { ...fallbackLabels[locale], ...(t?.header || {}) };

  const menuGroups = [
    {
      title: labels.clubs,
      items: [
        { label: labels.clubs, to: '/clubs' },
        { label: labels.myApplications, to: '/my-applications', auth: true, role: 'student' },
        { label: labels.teacher, to: '/teacher', auth: true, role: 'teacher' },
        { label: labels.admin, to: '/admin', auth: true, role: 'admin' }
      ]
    },
    {
      title: labels.academy,
      items: [
        { label: labels.academy, to: '/summer-academy' },
        { label: labels.news, to: '/news' },
        { label: labels.events, to: '/events' }
      ]
    },
    {
      title: labels.about,
      items: [
        { label: labels.about, to: '/about' },
        { label: labels.contacts, to: '/contacts' }
      ]
    }
  ];

  const handleLogout = () => {
    logout();
    setMobileMenuOpen(false);
    navigate('/');
  };

  const closeMenu = () => setMobileMenuOpen(false);

  return (
    <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/95 text-slate-900 shadow-sm backdrop-blur">
      <div className="container flex min-h-[76px] items-center justify-between gap-3 py-3">
        <Link to="/" onClick={closeMenu} className="flex min-w-0 items-center gap-3 text-slate-900">
          <span className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary text-sm font-bold text-white">
            DU
          </span>
          <span className="min-w-0">
            <span className="block truncate text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
              {labels.palace}
            </span>
            <span className="block truncate text-lg font-bold leading-tight">Digital Urpaq</span>
          </span>
        </Link>

        <nav className="hidden items-center gap-3 lg:flex" aria-label={labels.mainMenu}>
          <NavLink
            to="/"
            className={({ isActive }) =>
              `rounded-xl px-3 py-2 text-sm font-semibold transition ${
                isActive ? 'bg-indigo-50 text-primary' : 'text-slate-700 hover:bg-slate-50 hover:text-primary'
              }`
            }
          >
            {labels.home}
          </NavLink>

          {menuGroups.map((group) => (
            <div key={group.title} className="group relative">
              <button
                type="button"
                className="rounded-xl px-3 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 hover:text-primary"
              >
                {group.title}
              </button>
              <div className="invisible absolute left-0 top-full z-20 mt-2 w-56 overflow-hidden rounded-3xl border border-slate-200 bg-white p-3 shadow-xl transition-all duration-200 group-hover:visible group-hover:translate-y-0 group-hover:opacity-100 group-hover:shadow-2xl opacity-0 translate-y-2">
                {group.items.map((item) => {
                  if (item.auth && !isAuthenticated) return null;
                  if (item.role === 'teacher' && !isTeacher) return null;
                  if (item.role === 'admin' && !isAdmin) return null;
                  if (item.role === 'student' && !isStudent) return null;
                  return (
                    <Link
                      key={item.to}
                      to={item.to}
                      onClick={closeMenu}
                      className="block rounded-2xl px-4 py-2 text-sm text-slate-700 transition hover:bg-slate-100"
                    >
                      {item.label}
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>

        <div className="hidden items-center gap-2 lg:flex">
          {['ru', 'kz', 'en'].map((lang) => (
            <button
              key={lang}
              onClick={() => setLanguage(lang)}
              className={`min-h-10 rounded-xl border px-3 text-sm font-semibold uppercase transition ${
                locale === lang ? 'border-primary bg-primary text-white' : 'border-slate-200 text-slate-600 hover:border-primary'
              }`}
            >
              {lang}
            </button>
          ))}
          {isAuthenticated ? (
            <>
              <Link to="/profile" className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-primary hover:text-primary">
                {labels.profile}
              </Link>
              <span className="max-w-[150px] truncate text-sm text-slate-600">{user?.full_name}</span>
              <button onClick={handleLogout} className="btn min-h-10 bg-red-600 px-3 text-sm text-white hover:bg-red-700" aria-label={labels.logout}>
                <LogOut size={16} />
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="btn btn-secondary min-h-10 px-4 text-sm">{labels.login}</Link>
              <Link to="/register" className="btn btn-primary min-h-10 px-4 text-sm">{labels.register}</Link>
            </>
          )}
        </div>

        <button
          className="inline-flex min-h-11 min-w-11 items-center justify-center rounded-xl border border-slate-200 text-slate-700 lg:hidden"
          aria-label={mobileMenuOpen ? labels.closeMenu : labels.openMenu}
          aria-expanded={mobileMenuOpen}
          onClick={() => setMobileMenuOpen((value) => !value)}
        >
          {mobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      {mobileMenuOpen && (
        <nav className="border-t border-slate-200 bg-white lg:hidden" aria-label={labels.mobileMenu}>
          <div className="container grid gap-3 py-4">
            <NavLink
              to="/"
              onClick={closeMenu}
              className={({ isActive }) =>
                `rounded-xl px-4 py-3 text-base font-semibold ${
                  isActive ? 'bg-indigo-50 text-primary' : 'text-slate-700 hover:bg-slate-50'
                }`
              }
            >
              {labels.home}
            </NavLink>
            {menuGroups.map((group) => (
              <div key={group.title} className="rounded-3xl border border-slate-200 bg-slate-50 p-3">
                <div className="text-sm font-semibold text-slate-700 mb-2">{group.title}</div>
                <div className="grid gap-2">
                  {group.items.map((item) => {
                    if (item.auth && !isAuthenticated) return null;
                    if (item.role === 'teacher' && !isTeacher) return null;
                    if (item.role === 'admin' && !isAdmin) return null;
                    if (item.role === 'student' && !isStudent) return null;
                    return (
                      <Link
                        key={item.to}
                        to={item.to}
                        onClick={closeMenu}
                        className="rounded-xl px-4 py-3 text-base font-semibold text-slate-700 hover:bg-white"
                      >
                        {item.label}
                      </Link>
                    );
                  })}
                </div>
              </div>
            ))}
            {isAuthenticated && (
              <Link
                to="/profile"
                onClick={closeMenu}
                className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-base font-semibold text-slate-700 hover:bg-white"
              >
                {labels.profile}
              </Link>
            )}
            {isAuthenticated ? (
              <button onClick={handleLogout} className="btn min-h-12 bg-red-600 px-4 text-white">{labels.logout}</button>
            ) : (
              <div className="grid gap-2 sm:grid-cols-2">
                <Link to="/login" onClick={closeMenu} className="btn btn-secondary min-h-12 px-4">{labels.login}</Link>
                <Link to="/register" onClick={closeMenu} className="btn btn-primary min-h-12 px-4">{labels.register}</Link>
              </div>
            )}
            <div className="flex flex-wrap gap-2 border-t border-slate-100 pt-3">
              {['ru', 'kz', 'en'].map((lang) => (
                <button
                  key={lang}
                  onClick={() => setLanguage(lang)}
                  className={`min-h-10 rounded-xl border px-3 text-sm font-semibold uppercase ${
                    locale === lang ? 'border-primary bg-primary text-white' : 'border-slate-200 text-slate-600'
                  }`}
                >
                  {lang}
                </button>
              ))}
            </div>
          </div>
        </nav>
      )}
    </header>
  );
};
