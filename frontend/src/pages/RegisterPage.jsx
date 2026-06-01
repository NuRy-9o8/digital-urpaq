import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AlertCircle, ArrowRight, ClipboardCheck, GraduationCap, Mail, Phone, User } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const steps = [
  ['1', 'Создайте аккаунт ученика'],
  ['2', 'Выберите кружок или программу Академии'],
  ['3', 'Следите за статусом заявки в кабинете'],
];

export const RegisterPage = () => {
  const navigate = useNavigate();
  const { register, isAuthenticated } = useAuth();
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    phone: '',
    age: '',
  });
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

    if (!formData.fullName || !formData.email || !formData.password) {
      setError('Заполните ФИО, email и пароль.');
      return;
    }

    if (formData.password.length < 6) {
      setError('Пароль должен содержать минимум 6 символов.');
      return;
    }

    setLoading(true);

    const result = await register(
      formData.fullName.trim(),
      formData.email,
      formData.password,
      formData.phone.trim(),
      formData.age ? parseInt(formData.age, 10) : null
    );

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
        <div className="du-circle du-circle-blue left-[5%] top-24" />
        <div className="du-circle du-circle-yellow right-[8%] top-20" />

        <div className="container relative z-10 grid min-h-[calc(100vh-76px)] gap-10 py-12 lg:grid-cols-[1.02fr_0.98fr] lg:items-center">
          <div className="max-w-2xl">
            <span className="feature-pill">
              <GraduationCap size={18} className="mr-2" /> Старт в Digital Urpaq
            </span>
            <h1 className="mt-6 text-4xl font-extrabold leading-tight text-slate-950 sm:text-5xl">
              Зарегистрируйтесь и откройте доступ к программам Дворца школьников
            </h1>
            <p className="mt-5 text-lg leading-8 text-slate-600">
              Профиль нужен для онлайн-заявок, участия в кружках, Летней Академии и получения уведомлений от преподавателей и администрации.
            </p>

            <div className="mt-8 grid gap-3 sm:grid-cols-3">
              {steps.map(([value, label]) => (
                <div key={value} className="stat-tile">
                  <div className="text-2xl font-extrabold text-primary">{value}</div>
                  <p className="mt-2 text-sm font-semibold leading-6 text-slate-700">{label}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="auth-panel">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.16em] text-primary">Новый аккаунт</p>
                <h2 className="mt-3 text-3xl font-bold text-slate-950">Регистрация ученика</h2>
              </div>
              <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-50 text-primary">
                <ClipboardCheck size={24} />
              </div>
            </div>

            {error && (
              <div className="mt-6 flex gap-3 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
                <AlertCircle className="mt-0.5 shrink-0" size={18} />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="mt-7 grid gap-5">
              <label className="block">
                <span className="mb-2 block text-sm font-semibold text-slate-700">ФИО</span>
                <span className="relative block">
                  <User className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                  <input type="text" name="fullName" value={formData.fullName} onChange={handleChange} className="input pl-11" required placeholder="Ваше полное имя" />
                </span>
              </label>

              <label className="block">
                <span className="mb-2 block text-sm font-semibold text-slate-700">Email</span>
                <span className="relative block">
                  <Mail className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                  <input type="email" name="email" value={formData.email} onChange={handleChange} className="input pl-11" required autoComplete="email" placeholder="student@example.com" />
                </span>
              </label>

              <div className="grid gap-5 sm:grid-cols-2">
                <label className="block">
                  <span className="mb-2 block text-sm font-semibold text-slate-700">Пароль</span>
                  <input type="password" name="password" value={formData.password} onChange={handleChange} className="input" required autoComplete="new-password" placeholder="Минимум 6 символов" />
                </label>

                <label className="block">
                  <span className="mb-2 block text-sm font-semibold text-slate-700">Возраст</span>
                  <input type="number" name="age" value={formData.age} onChange={handleChange} className="input" min="6" max="18" placeholder="Например, 14" />
                </label>
              </div>

              <label className="block">
                <span className="mb-2 block text-sm font-semibold text-slate-700">Телефон</span>
                <span className="relative block">
                  <Phone className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                  <input type="tel" name="phone" value={formData.phone} onChange={handleChange} className="input pl-11" placeholder="+7 (XXX) XXX-XX-XX" />
                </span>
              </label>

              <button type="submit" disabled={loading} className="btn btn-primary min-h-12 w-full px-5 py-3 disabled:cursor-not-allowed disabled:opacity-70">
                {loading ? 'Создаем аккаунт...' : 'Зарегистрироваться'}
                {!loading && <ArrowRight className="ml-2" size={18} />}
              </button>
            </form>

            <div className="mt-6 rounded-2xl bg-slate-50 p-4 text-sm leading-7 text-slate-600">
              Уже есть аккаунт?{' '}
              <Link to="/login" className="font-semibold text-primary hover:underline">
                Войдите в личный кабинет
              </Link>
              .
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
