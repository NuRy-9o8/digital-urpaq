import React from 'react';
import { Mail, MapPin, Phone, Send } from 'lucide-react';
import { footerContent } from '../data/siteContent';

export const ContactsPage = () => {
  return (
    <div className="min-h-screen bg-slate-50">
      <section className="bg-white py-12 md:py-16">
        <div className="container">
          <span className="feature-pill">Контакты</span>
          <h1 className="mt-5 text-4xl font-bold leading-tight text-slate-950 sm:text-5xl">Свяжитесь с нами</h1>
          <p className="mt-5 max-w-2xl text-lg leading-8 text-slate-600">
            Мы всегда рады ответить на ваши вопросы и помочь с регистрацией на кружки.
          </p>
        </div>
      </section>

      <section className="section-pad">
        <div className="container grid gap-8 lg:grid-cols-[0.95fr_1.05fr]">
          <div className="grid gap-5 sm:grid-cols-2">
            <div className="card">
              <Phone className="text-primary" size={28} />
              <h2 className="mt-4 text-xl font-semibold text-slate-950">Приемная</h2>
              <p className="mt-2 text-slate-600">{footerContent.phone}</p>
            </div>
            <div className="card">
              <Phone className="text-primary" size={28} />
              <h2 className="mt-4 text-xl font-semibold text-slate-950">Ресепшн</h2>
              <p className="mt-2 text-slate-600">{footerContent.reception}</p>
            </div>
            <div className="card">
              <Mail className="text-primary" size={28} />
              <h2 className="mt-4 text-xl font-semibold text-slate-950">Email</h2>
              <p className="mt-2 break-words text-slate-600">{footerContent.mailAlt}</p>
            </div>
            <div className="card">
              <MapPin className="text-primary" size={28} />
              <h2 className="mt-4 text-xl font-semibold text-slate-950">Адрес</h2>
              <p className="mt-2 text-slate-600">150000, {footerContent.address}</p>
            </div>

            <div className="card sm:col-span-2">
              <h2 className="text-xl font-semibold text-slate-950">Telegram-бот</h2>
              <p className="mt-3 text-slate-600">
                Найдите @du_notifications_bot в Telegram, нажмите /start и получайте уведомления о кружках, событиях и
                статусе заявок.
              </p>
              <a
                href="https://t.me/du_notifications_bot"
                target="_blank"
                rel="noreferrer"
                className="btn btn-primary mt-5 min-h-12 px-5 py-3"
              >
                <Send className="mr-2" size={18} /> Открыть бота
              </a>
            </div>
          </div>

          <div className="rounded-card bg-white p-4 shadow-soft sm:p-6">
            <h2 className="text-2xl font-semibold text-slate-950">Наше местоположение</h2>
            <p className="mt-3 text-slate-600">150000, {footerContent.address}</p>
            <div className="mt-6 overflow-hidden rounded-card border border-slate-200">
              <iframe
                title="Digital Urpaq location"
                src="https://maps.google.com/maps?q=54.853781,69.115596&z=16&output=embed"
                width="100%"
                height="420"
                className="block border-0"
                loading="lazy"
              />
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
