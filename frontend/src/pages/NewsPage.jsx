import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { CalendarDays, Search } from 'lucide-react';
import { contentAPI } from '../services/api';
import { localNews } from '../data/siteContent';

export const NewsPage = () => {
  const [news, setNews] = useState(localNews);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState('');

  useEffect(() => {
    const loadNews = async () => {
      try {
        const response = await contentAPI.getNews();
        const apiNews = (response.data || []).map((item) => ({
          ...item,
          lead: item.content,
          body: item.content,
          date: item.created_at ? new Date(item.created_at).toLocaleDateString('ru-RU') : '',
        }));
        setNews([...apiNews, ...localNews]);
      } catch (error) {
        console.error('Error loading news:', error);
        setNews(localNews);
      } finally {
        setLoading(false);
      }
    };

    loadNews();
  }, []);

  const filteredNews = news.filter((item) => {
    const haystack = `${item.title} ${item.lead} ${item.body}`.toLowerCase();
    return haystack.includes(query.toLowerCase());
  });

  return (
    <div className="min-h-screen bg-slate-50">
      <section className="bg-white py-12 md:py-16">
        <div className="container grid gap-8 lg:grid-cols-[1fr_420px] lg:items-end">
          <div>
            <span className="feature-pill">Новости</span>
            <h1 className="mt-5 text-4xl font-bold leading-tight text-slate-950 sm:text-5xl">
              Актуальные новости Digital Urpaq
            </h1>
            <p className="mt-5 max-w-3xl text-lg leading-8 text-slate-600">
              Здесь собраны объявления, достижения учащихся и важные обновления по программам Дворца школьников.
            </p>
          </div>
          <label className="relative block">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input
              className="input min-h-12 pl-12"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Поиск по новостям"
            />
          </label>
        </div>
      </section>

      <section className="section-pad">
        <div className="container">
          {loading ? (
            <div className="grid gap-6 lg:grid-cols-3">
              {Array.from({ length: 3 }).map((_, index) => (
                <div key={index} className="skeleton h-64 rounded-card" />
              ))}
            </div>
          ) : filteredNews.length === 0 ? (
            <div className="rounded-card bg-white p-10 text-center text-slate-500 shadow-soft">
              Новостей по вашему запросу пока нет.
            </div>
          ) : (
            <div className="grid gap-6 lg:grid-cols-3">
              {filteredNews.map((item) => (
                <article key={item.id} className="card flex flex-col">
                  <div className="flex items-center gap-2 text-sm font-semibold text-primary">
                    <CalendarDays size={18} />
                    <span>{item.date}</span>
                  </div>
                  <h2 className="mt-4 text-2xl font-semibold leading-tight text-slate-950">{item.title}</h2>
                  <p className="mt-4 text-sm font-semibold leading-7 text-slate-700">{item.lead}</p>
                  <p className="mt-3 line-clamp-4 text-sm leading-7 text-slate-600">{item.body}</p>
                  <span className="mt-6 inline-flex w-fit rounded-full bg-indigo-50 px-3 py-2 text-xs font-semibold uppercase text-primary">
                    {item.type === 'achievement' ? 'Достижение' : 'Новость'}
                  </span>
                  <Link to={`/news/${item.id}`} className="btn btn-primary mt-6 min-h-11 px-4 text-sm">
                    Читать полностью
                  </Link>
                </article>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
};
