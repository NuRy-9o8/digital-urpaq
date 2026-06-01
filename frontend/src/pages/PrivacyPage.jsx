import React from 'react';
import { ShieldCheck } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

export const PrivacyPage = () => {
  const { t } = useLanguage();

  return (
    <div className="min-h-screen bg-page-pattern">
      <section className="page-hero">
        <div className="container">
          <span className="feature-pill">
            <ShieldCheck size={18} className="mr-2" /> Безопасность данных
          </span>
          <h1>{t.privacy.title}</h1>
          <p>{t.privacy.intro}</p>
        </div>
      </section>

      <section className="section-pad">
        <div className="container max-w-4xl">
          <div className="card">
            <ul className="grid gap-4">
              {t.privacy.items.map((item) => (
                <li key={item} className="rounded-2xl bg-slate-50 p-4 text-slate-700">
                  {item}
                </li>
              ))}
            </ul>
            <p className="mt-6 leading-8 text-slate-600">{t.privacy.contact}</p>
          </div>
        </div>
      </section>
    </div>
  );
};
