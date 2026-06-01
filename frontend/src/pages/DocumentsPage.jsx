import React from 'react';
import { Link } from 'react-router-dom';
import { FileText, ShieldCheck, ScrollText } from 'lucide-react';

const documents = [
  {
    id: 1,
    title: 'Положение о кружках',
    url: '#',
    description: 'Правила записи, посещения занятий, распределения мест и взаимодействия с преподавателями.',
    icon: FileText,
  },
  {
    id: 2,
    title: 'Политика конфиденциальности',
    url: '/privacy',
    description: 'Как портал хранит персональные данные учеников, родителей и сотрудников Дворца школьников.',
    icon: ShieldCheck,
  },
  {
    id: 3,
    title: 'Пользовательское соглашение',
    url: '/terms',
    description: 'Условия использования Digital Urpaq, личного кабинета, заявок и уведомлений.',
    icon: ScrollText,
  },
];

export const DocumentsPage = () => {
  return (
    <div className="min-h-screen bg-page-pattern">
      <section className="page-hero">
        <div className="container">
          <span className="feature-pill">Документы</span>
          <h1>Правила и материалы для участников портала</h1>
          <p>
            Здесь собраны основные документы Digital Urpaq: они помогают понять порядок регистрации, подачи заявок,
            обработки данных и участия в образовательных программах.
          </p>
        </div>
      </section>

      <section className="section-pad">
        <div className="container grid gap-5 md:grid-cols-3">
          {documents.map((doc) => {
            const Icon = doc.icon;
            const content = (
              <>
                <div>
                  <Icon className="text-primary" size={30} />
                  <h2 className="mt-5 text-xl font-bold leading-tight text-slate-950">{doc.title}</h2>
                  <p className="mt-3 text-sm leading-7 text-slate-600">{doc.description}</p>
                </div>
                <span className="btn btn-secondary mt-6 min-h-11 px-4 text-sm">Открыть документ</span>
              </>
            );

            return doc.url === '#' ? (
              <article key={doc.id} className="document-card">
                {content}
              </article>
            ) : (
              <Link key={doc.id} to={doc.url} className="document-card">
                {content}
              </Link>
            );
          })}
        </div>
      </section>
    </div>
  );
};
