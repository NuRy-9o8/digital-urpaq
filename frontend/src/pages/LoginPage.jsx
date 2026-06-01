import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AlertCircle, ArrowRight, CheckCircle2, Lock, Mail, ShieldCheck, Sparkles } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const benefits = [
  'Личный кабинет с заявками на кружки и Летнюю Академию.',
  'Статусы заявок, расписание и полезные уведомления в одном месте.',
  'Привязка Telegram-бота для быстрых сообщений от портала.',
];

export const LoginPage = () => {
  const navigate = useNavigate();
  const { login, isAuthenticated } = useAuth();
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/');
    }
  }, [isAuthenticated, navigate]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const result = await login(formData.email, formData.password);

    if (result.success) {
      navigate('/');
    } else {
      setError(result.error);
    }

    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-page-pattern">
      <section className="relative isolate overflow-hidden bg-white">
        <div className="du-circle du-circle-yellow left-[6%] top-20" />
        <div className="du-circle du-circle-blue right-[7%] top-24" />

        <div className="container relative z-10 grid min-h-[calc(100vh-76px)] gap-10 py-12 lg:grid-cols-[0.95fr_1.05fr] lg:items-center">
          <div className="max-w-2xl">
            <span className="feature-pill">
              <Sparkles size={17} className="mr-2" /> Digital Urpaq ID
            </span>
            <h1 className="mt-6 text-4xl font-extrabold leading-tight text-slate-950 sm:text-5xl">
              Войдите в портал, чтобы управлять своим обучением
            </h1>
            <p className="mt-5 text-lg leading-8 text-slate-600">
              Аккаунт связывает ученика, преподавателя и администрацию: заявки не теряются, решения видны сразу, а важные новости приходят вовремя.
            </p>

            <div className="mt-8 grid gap-4">
              {benefits.map((item) => (
                <div key={item} className="flex gap-3 rounded-card border border-slate-200 bg-white/85 p-4 shadow-sm">
                  <CheckCircle2 className="mt-1 shrink-0 text-primary" size={20} />
                  <p className="text-sm font-medium leading-7 text-slate-700">{item}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="auth-panel">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.16em] text-primary">Безопасный вход</p>
                <h2 className="mt-3 text-3xl font-bold text-slate-950">Личный кабинет</h2>
              </div>
              <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-50 text-primary">
                <ShieldCheck size={24} />
              </div>
            </div>

            {error && (
              <div className="mt-6 flex gap-3 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
                <AlertCircle className="mt-0.5 shrink-0" size={18} />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="mt-7 space-y-5">
              <label className="block">
                <span className="mb-2 block text-sm font-semibold text-slate-700">Email</span>
                <span className="relative block">
                  <Mail className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className="input pl-11"
                    required
                    autoComplete="email"
                    placeholder="student@example.com"
                  />
                </span>
              </label>

              <label className="block">
                <span className="mb-2 block text-sm font-semibold text-slate-700">Пароль</span>
                <span className="relative block">
                  <Lock className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                  <input
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    className="input pl-11"
                    required
                    autoComplete="current-password"
                    placeholder="Введите пароль"
                  />
                </span>
              </label>

              <button type="submit" disabled={loading} className="btn btn-primary min-h-12 w-full px-5 py-3 disabled:cursor-not-allowed disabled:opacity-70">
                {loading ? 'Проверяем данные...' : 'Войти в портал'}
                {!loading && <ArrowRight className="ml-2" size={18} />}
              </button>
            </form>

            <div className="mt-6 rounded-2xl bg-slate-50 p-4 text-sm leading-7 text-slate-600">
              Нет аккаунта?{' '}
              <Link to="/register" className="font-semibold text-primary hover:underline">
                Зарегистрируйтесь
              </Link>
              , чтобы подать заявку на кружок и получать уведомления.
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
