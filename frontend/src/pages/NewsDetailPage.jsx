import React, { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, CalendarDays, User } from 'lucide-react';
import { contentAPI } from '../services/api';
import { localNews } from '../data/siteContent';

const normalizeNews = (item) => ({
  ...item,
  lead: item.lead || item.content,
  body: item.body || item.content,
  date: item.date || (item.created_at ? new Date(item.created_at).toLocaleDateString('ru-RU') : ''),
});

export const NewsDetailPage = () => {
  const { id } = useParams();
  const [newsItem, setNewsItem] = useState(() => normalizeNews(localNews.find((item) => String(item.id) === id) || {}));
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadNewsItem = async () => {
      const localItem = localNews.find((item) => String(item.id) === id);
      if (localItem) {
        setNewsItem(normalizeNews(localItem));
        setLoading(false);
        return;
      }

      try {
        const response = await contentAPI.getNewsById(id);
        setNewsItem(normalizeNews(response.data));
      } catch (error) {
        console.error('Error loading news item:', error);
        setNewsItem(null);
      } finally {
        setLoading(false);
      }
    };

    loadNewsItem();
  }, [id]);

  if (loading) {
    return (
      <div className="container py-16">
        <div className="skeleton h-96 rounded-card" />
      </div>
    );
  }

  if (!newsItem?.title) {
    return (
      <div className="container py-16">
        <div className="rounded-card bg-white p-10 text-center shadow-soft">
          <h1 className="text-2xl font-bold text-slate-950">Новость не найдена</h1>
          <Link to="/news" className="btn btn-primary mt-6 min-h-11 px-5">Вернуться к новостям</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-page-pattern">
      <section className="bg-white py-12 md:py-16">
        <div className="container">
          <Link to="/news" className="inline-flex items-center gap-2 text-sm font-semibold text-primary hover:underline">
            <ArrowLeft size={18} /> Все новости
          </Link>
          <div className="mt-8 max-w-4xl">
            <span className="feature-pill">{newsItem.type === 'achievement' ? 'Достижение' : 'Новость'}</span>
            <h1 className="mt-5 text-4xl font-bold leading-tight text-slate-950 sm:text-5xl">{newsItem.title}</h1>
            <div className="mt-6 flex flex-wrap gap-4 text-sm font-semibold text-slate-500">
              {newsItem.date && (
                <span className="inline-flex items-center gap-2">
                  <CalendarDays size={18} /> {newsItem.date}
                </span>
              )}
              {newsItem.author && (
                <span className="inline-flex items-center gap-2">
                  <User size={18} /> {newsItem.author}
                </span>
              )}
            </div>
            <p className="mt-6 text-xl font-semibold leading-8 text-slate-700">{newsItem.lead}</p>
          </div>
        </div>
      </section>

      <section className="section-pad">
        <article className="container max-w-4xl rounded-card bg-white p-6 shadow-soft sm:p-10">
          {(newsItem.body || '').split('\n').filter(Boolean).map((paragraph) => (
            <p key={paragraph} className="mb-5 text-base leading-8 text-slate-700">
              {paragraph}
            </p>
          ))}
        </article>
      </section>
    </div>
  );
};
