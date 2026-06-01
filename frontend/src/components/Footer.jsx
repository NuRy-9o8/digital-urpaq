import React from 'react';
import { Link } from 'react-router-dom';
import { Clock, Globe, Mail, MapPin, Phone } from 'lucide-react';
import { footerContent } from '../data/siteContent';

export const Footer = () => {
  return (
    <footer className="bg-slate-950 text-slate-200">
      <div className="container py-10 md:py-14">
        <div className="grid gap-8 lg:grid-cols-[1.2fr_0.7fr_1fr]">
          <div className="min-w-0">
            <Link to="/" className="inline-flex items-center gap-3 text-white">
              <span className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary font-bold">DU</span>
              <span>
                <span className="block text-xs uppercase tracking-[0.18em] text-slate-400">Дворец школьников</span>
                <span className="block text-xl font-bold">Digital Urpaq</span>
              </span>
            </Link>
            <p className="mt-5 max-w-xl text-sm leading-7 text-slate-400">{footerContent.description}</p>
          </div>

          <nav aria-label="Быстрые ссылки">
            <h4 className="text-lg font-semibold text-white">Быстрые ссылки</h4>
            <ul className="mt-4 grid gap-3 text-sm text-slate-400">
              {[
                ['/', 'Главная'],
                ['/about', 'О дворце'],
                ['/clubs', 'Направления'],
                ['/news', 'Новости'],
                ['/events', 'План мероприятий'],
                ['/contacts', 'Контакты'],
              ].map(([href, label]) => (
                <li key={href}>
                  <Link to={href} className="hover:text-white">{label}</Link>
                </li>
              ))}
            </ul>
          </nav>

          <div>
            <h4 className="text-lg font-semibold text-white">Свяжитесь с нами</h4>
            <ul className="mt-4 grid gap-3 text-sm text-slate-400">
              <li className="flex gap-3"><Phone className="mt-1 shrink-0" size={17} /> {footerContent.phone}</li>
              <li className="flex gap-3"><Mail className="mt-1 shrink-0" size={17} /> {footerContent.email}</li>
              <li className="flex gap-3"><MapPin className="mt-1 shrink-0" size={17} /> {footerContent.address}</li>
              <li className="flex gap-3"><Clock className="mt-1 shrink-0" size={17} /> {footerContent.schedule}</li>
              <li className="flex gap-3">
                <Globe className="mt-1 shrink-0" size={17} />
                <a
                  href="https://2gis.kz/petropavlovsk/firm/70000001041354591"
                  target="_blank"
                  rel="noreferrer"
                  className="hover:text-white"
                >
                  Смотреть на 2GIS
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-10 border-t border-slate-800 pt-6 text-sm text-slate-500">
          <p>© 2026 Digital Urpaq. made by curcojho</p>
        </div>
      </div>
    </footer>
  );
};
