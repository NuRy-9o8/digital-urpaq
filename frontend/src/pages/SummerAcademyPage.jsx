import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { CalendarDays, CheckCircle2, Send } from 'lucide-react';
import { academyAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';

const programs = [
  'IT и программирование',
  'Робототехника и дроны',
  'Искусственный интеллект',
  'Цифровое искусство',
  'Биотехнологии',
  'Проектная лаборатория',
];

export const SummerAcademyPage = () => {
  const { isAuthenticated, user } = useAuth();
  const [form, setForm] = useState({
    program: programs[0],
    student_name: user?.full_name || '',
    age: user?.age || '',
    phone: user?.phone || '',
    comment: '',
  });
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState('');

  const updateField = (field, value) => {
    setForm((current) => ({ ...current, [field]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setMessage('');

    if (!isAuthenticated) {
      setMessage('Для подачи заявки нужно войти в аккаунт учащегося.');
      return;
    }

    if (!form.program || !form.student_name) {
      setMessage('Укажите программу и ФИО учащегося.');
      return;
    }

    setSubmitting(true);
    try {
      await academyAPI.submit(form);
      setMessage('Заявка в Летнюю Академию отправлена. Статус можно будет отслеживать в системе.');
      setForm((current) => ({ ...current, comment: '' }));
    } catch (error) {
      setMessage(error.response?.data?.error || 'Не удалось отправить заявку.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <section className="bg-slate-950 py-14 text-white md:py-20">
        <div className="container grid gap-10 lg:grid-cols-[1fr_420px] lg:items-center">
          <div>
            <span className="feature-pill feature-pill-dark">Летняя Академия Digital Urpaq</span>
            <h1 className="mt-6 text-4xl font-bold leading-tight sm:text-5xl">
              Интенсивы для школьников 14-18 лет
            </h1>
            <p className="mt-5 max-w-3xl text-lg leading-8 text-slate-300">
              Выберите программу, отправьте заявку онлайн и получите возможность пройти летний практический курс во
              Дворце школьников.
            </p>
          </div>
          <div className="rounded-card border border-white/10 bg-white/10 p-6">
            <CalendarDays size={34} />
            <h2 className="mt-5 text-2xl font-bold">Прием заявок открыт</h2>
            <p className="mt-3 text-slate-300">Форма доступна зарегистрированным учащимся. Администратор видит заявки в API и может менять статус.</p>
          </div>
        </div>
      </section>

      <section className="section-pad">
        <div className="container grid gap-8 lg:grid-cols-[0.9fr_1.1fr]">
          <div className="space-y-5">
            <div className="card">
              <h2 className="text-2xl font-semibold text-slate-950">Программы Академии</h2>
              <ul className="mt-5 grid gap-3">
                {programs.map((program) => (
                  <li key={program} className="flex gap-3 text-slate-700">
                    <CheckCircle2 className="mt-1 shrink-0 text-primary" size={18} />
                    <span>{program}</span>
                  </li>
                ))}
              </ul>
            </div>

            {!isAuthenticated && (
              <div className="rounded-card border border-amber-200 bg-amber-50 p-5 text-amber-900">
                Для подачи заявки войдите или зарегистрируйтесь.
                <div className="mt-4 flex flex-col gap-2 sm:flex-row">
                  <Link to="/login" className="btn btn-primary min-h-11 px-4">Войти</Link>
                  <Link to="/register" className="btn btn-secondary min-h-11 px-4">Регистрация</Link>
                </div>
              </div>
            )}
          </div>

          <form onSubmit={handleSubmit} className="card">
            <h2 className="text-2xl font-semibold text-slate-950">Заявка на участие</h2>
            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              <label className="grid gap-2 sm:col-span-2">
                <span className="text-sm font-semibold text-slate-700">Программа</span>
                <select className="input" value={form.program} onChange={(event) => updateField('program', event.target.value)}>
                  {programs.map((program) => (
                    <option key={program} value={program}>{program}</option>
                  ))}
                </select>
              </label>
              <label className="grid gap-2 sm:col-span-2">
                <span className="text-sm font-semibold text-slate-700">ФИО учащегося</span>
                <input className="input" value={form.student_name} onChange={(event) => updateField('student_name', event.target.value)} />
              </label>
              <label className="grid gap-2">
                <span className="text-sm font-semibold text-slate-700">Возраст</span>
                <input className="input" type="number" min="14" max="18" value={form.age} onChange={(event) => updateField('age', event.target.value)} />
              </label>
              <label className="grid gap-2">
                <span className="text-sm font-semibold text-slate-700">Телефон</span>
                <input className="input" value={form.phone} onChange={(event) => updateField('phone', event.target.value)} />
              </label>
              <label className="grid gap-2 sm:col-span-2">
                <span className="text-sm font-semibold text-slate-700">Комментарий</span>
                <textarea className="input min-h-[120px]" value={form.comment} onChange={(event) => updateField('comment', event.target.value)} />
              </label>
            </div>

            {message && <div className="mt-5 rounded-card bg-slate-100 p-4 text-sm text-slate-700">{message}</div>}

            <button type="submit" disabled={submitting} className="btn btn-accent mt-6 min-h-12 w-full px-6 py-3 sm:w-auto">
              <Send className="mr-2" size={18} /> {submitting ? 'Отправка...' : 'Отправить заявку'}
            </button>
          </form>
        </div>
      </section>
    </div>
  );
};
