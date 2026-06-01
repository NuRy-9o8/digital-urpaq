import React from 'react';
import { useLanguage } from '../context/LanguageContext';

const events = [
  {
    id: 1,
    title: 'Открытый день образовательных программ',
    date: '2026-06-21',
    location: 'Актовый зал дворца',
    description: 'Презентация новых кружков и встречи с преподавателями.',
  },
  {
    id: 2,
    title: 'Мастер-класс по робототехнике',
    date: '2026-07-05',
    location: 'Лаборатория робототехники',
    description: 'Практическая работа: сборка и программирование роботов.',
  },
  {
    id: 3,
    title: 'Конкурс проектных работ',
    date: '2026-08-12',
    location: 'Конференц-зал',
    description: 'Соревнование проектов школьников с экспертным жюри.',
  },
];

export const EventsPage = () => {
  const { t } = useLanguage();

  return (
    <div className="min-h-screen bg-slate-50 py-16">
      <div className="container space-y-10">
        <section className="rounded-[32px] bg-white p-10 shadow-[rgba(59,62,172,0.08)_0px_24px_80px]">
          <span className="feature-pill">{t.header.events}</span>
          <h1 className="mt-4 text-4xl font-bold text-slate-950">{t.events.title}</h1>
          <p className="mt-4 text-lg text-slate-600">{t.events.description}</p>
        </section>

        <section className="grid gap-8 lg:grid-cols-3">
          {events.map((event) => (
            <article key={event.id} className="card hover:shadow-xl transition">
              <div className="inline-flex rounded-full bg-primary/10 px-4 py-2 text-sm font-semibold text-primary">{new Date(event.date).toLocaleDateString('ru-RU')}</div>
              <h2 className="mt-5 text-2xl font-semibold text-slate-950">{event.title}</h2>
              <p className="mt-4 text-slate-600">{event.description}</p>
              <div className="mt-6 text-sm text-slate-500">Место: {event.location}</div>
            </article>
          ))}
        </section>

        <section className="rounded-[32px] bg-white p-10 shadow-[rgba(59,62,172,0.08)_0px_24px_80px]">
          <h2 className="text-2xl font-semibold text-slate-950">{t.events.calendarTitle}</h2>
          <div className="mt-6 overflow-hidden rounded-[28px] border border-slate-200">
            <table className="min-w-full border-collapse bg-white text-left text-sm text-slate-600">
              <thead className="bg-slate-50 text-slate-700">
                <tr>
                  <th className="px-6 py-4">Дата</th>
                  <th className="px-6 py-4">Событие</th>
                  <th className="px-6 py-4">Локация</th>
                </tr>
              </thead>
              <tbody>
                {events.map((event) => (
                  <tr key={event.id} className="border-t border-slate-200 hover:bg-slate-50">
                    <td className="px-6 py-4 font-semibold text-slate-950">{new Date(event.date).toLocaleDateString('ru-RU')}</td>
                    <td className="px-6 py-4">{event.title}</td>
                    <td className="px-6 py-4">{event.location}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </div>
  );
};
