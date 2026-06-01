import React from 'react';
import { Link } from 'react-router-dom';
import { directorQuote, directions, media } from '../data/siteContent';

export const AboutPage = () => {
  return (
    <div className="min-h-screen bg-slate-50">
      <section className="bg-white py-12 md:py-16">
        <div className="container grid gap-10 lg:grid-cols-[1fr_420px] lg:items-center">
          <div>
            <span className="feature-pill">О дворце</span>
            <h1 className="mt-5 text-4xl font-bold leading-tight text-slate-950 sm:text-5xl">
              Digital Urpaq - образовательный портал Дворца школьников
            </h1>
            <p className="mt-5 max-w-3xl text-lg leading-8 text-slate-600">
              Платформа объединяет информацию о кружках, мероприятиях, новостях и документах для школьников, родителей
              и преподавателей Петропавловска.
            </p>
          </div>
          <div className="grid grid-cols-3 gap-3">
            {[
              ['6', 'направлений'],
              ['100+', 'кружков'],
              ['2875', 'учеников'],
            ].map(([value, label]) => (
              <div key={label} className="rounded-card bg-slate-50 p-4 text-center">
                <div className="text-2xl font-bold text-primary">{value}</div>
                <p className="mt-2 text-xs font-semibold text-slate-600">{label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="section-pad">
        <div className="container grid gap-10 lg:grid-cols-[0.85fr_1.15fr] lg:items-center">
          <img src={media.directorPhoto} alt={directorQuote.name} className="rounded-card shadow-soft" />
          <div>
            <span className="feature-pill">Миссия</span>
            <h2 className="mt-5 text-3xl font-bold text-slate-950">Создать удобный доступ к дополнительному образованию</h2>
            <p className="mt-5 leading-8 text-slate-600">{directorQuote.intro}</p>
            <p className="mt-4 leading-8 text-slate-600">{directorQuote.mission}</p>
          </div>
        </div>
      </section>

      <section className="section-pad bg-white">
        <div className="container">
          <div className="section-heading">
            <span className="feature-pill">Наши возможности</span>
            <h2>Направления, события и поддержка участников</h2>
          </div>
          <div className="mt-10 grid gap-6 lg:grid-cols-3">
            {directions.map((item) => (
              <article key={item.title} className="card">
                <h3 className="text-xl font-semibold text-slate-950">{item.title}</h3>
                <p className="mt-3 text-sm leading-7 text-slate-600">{item.text}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="section-pad">
        <div className="container rounded-card bg-primary p-6 text-white shadow-soft sm:p-10">
          <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-white/75">Готовы начать?</p>
              <h2 className="mt-3 text-3xl font-bold">Откройте новый кружок в Digital Urpaq</h2>
            </div>
            <Link to="/clubs" className="btn btn-accent min-h-12 px-6 py-3">Посмотреть кружки</Link>
          </div>
        </div>
      </section>
    </div>
  );
};
