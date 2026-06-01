import React from 'react';
import { ScrollText } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

export const TermsPage = () => {
  const { t } = useLanguage();

  return (
    <div className="min-h-screen bg-page-pattern">
      <section className="page-hero">
        <div className="container">
          <span className="feature-pill">
            <ScrollText size={18} className="mr-2" /> Правила портала
          </span>
          <h1>{t.terms.title}</h1>
          <p>{t.terms.intro}</p>
        </div>
      </section>

      <section className="section-pad">
        <div className="container max-w-4xl">
          <div className="card">
            <ol className="grid gap-4">
              {t.terms.items.map((item, index) => (
                <li key={item} className="flex gap-4 rounded-2xl bg-slate-50 p-4 text-slate-700">
                  <span className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary text-sm font-bold text-white">
                    {index + 1}
                  </span>
                  <span>{item}</span>
                </li>
              ))}
            </ol>
            <p className="mt-6 leading-8 text-slate-600">{t.terms.contact}</p>
          </div>
        </div>
      </section>
    </div>
  );
};
