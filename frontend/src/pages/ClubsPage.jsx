import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Filter, Search, Users } from 'lucide-react';
import { clubsAPI } from '../services/api';
import { directions, itLabs, sampleClubs } from '../data/siteContent';
import { ClickToPlayVideo } from '../components/ClickToPlayVideo';

const groups = [
  'Все',
  'IT',
  'Научно-биологическое',
  'Художественно-эстетическое',
  'Гуманитарное',
  'Естественно-математическое',
  'Социально-педагогическое',
  'Спортивное',
];

export const ClubsPage = () => {
  const [clubs, setClubs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [direction, setDirection] = useState('Все');

  useEffect(() => {
    const fetchClubs = async () => {
      try {
        const res = await clubsAPI.getAll({ status: 'open' });
        setClubs((res.data || []).length ? res.data : sampleClubs);
      } catch (error) {
        console.error('Error fetching clubs:', error);
        setClubs(sampleClubs);
      } finally {
        setLoading(false);
      }
    };

    fetchClubs();
  }, []);

  const filteredClubs = useMemo(() => {
    return clubs.filter((club) => {
      const text = `${club.name} ${club.description} ${club.direction}`.toLowerCase();
      const matchesSearch = text.includes(search.toLowerCase());
      const matchesDirection =
        direction === 'Все' || (club.direction || '').toLowerCase().includes(direction.toLowerCase().split('-')[0]);
      return matchesSearch && matchesDirection;
    });
  }, [clubs, direction, search]);

  return (
    <div className="min-h-screen bg-slate-50">
      <section className="bg-white py-12 md:py-16">
        <div className="container grid gap-8 xl:grid-cols-[1fr_420px] xl:items-end">
          <div>
            <span className="feature-pill">Кружки и направления</span>
            <h1 className="mt-5 text-4xl font-bold leading-tight text-slate-950 sm:text-5xl">
              Современные направления для школьников
            </h1>
            <p className="mt-5 max-w-3xl text-lg leading-8 text-slate-600">
              Найдите кружок по интересам: от IT-лабораторий и биотехнологий до творческих студий, спорта и проектных
              занятий.
            </p>
          </div>

          <div className="rounded-card border border-slate-200 bg-slate-50 p-4">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input
                type="text"
                placeholder="Поиск кружков"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                className="input min-h-12 pl-12"
              />
            </div>
          </div>
        </div>
      </section>

      <section className="section-pad">
        <div className="container grid gap-8 lg:grid-cols-[280px_1fr]">
          <aside className="space-y-5">
            <div className="soft-card">
              <div className="flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.14em] text-primary">
                <Filter size={17} /> Фильтры
              </div>
              <div className="mt-5 flex gap-2 overflow-x-auto pb-2 lg:grid lg:overflow-visible lg:pb-0">
                {groups.map((group) => (
                  <button
                    key={group}
                    onClick={() => setDirection(group)}
                    className={`min-h-11 shrink-0 rounded-xl px-4 text-left text-sm font-semibold transition ${
                      direction === group ? 'bg-primary text-white' : 'bg-slate-50 text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    {group}
                  </button>
                ))}
              </div>
            </div>

            <div className="soft-card">
              <h2 className="text-lg font-semibold text-slate-950">IT лаборатории</h2>
              <ul className="mt-4 grid gap-2 text-sm text-slate-600">
                {itLabs.slice(0, 6).map((item) => (
                  <li key={item}>• {item}</li>
                ))}
              </ul>
            </div>
          </aside>

          <div className="space-y-8">
            <div className="grid gap-6 md:grid-cols-3">
              {directions.slice(0, 3).map((item) => (
                <article key={item.title} className="program-card">
                  <ClickToPlayVideo src={item.video} title={item.title} />
                  <div className="p-5">
                    <p className="text-sm font-semibold text-primary">{item.count}</p>
                    <h3 className="mt-2 font-semibold text-slate-950">{item.title}</h3>
                    <p className="mt-2 line-clamp-4 text-sm leading-6 text-slate-600">{item.text}</p>
                  </div>
                </article>
              ))}
            </div>

            {loading ? (
              <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
                {Array.from({ length: 6 }).map((_, index) => (
                  <div key={index} className="skeleton h-60 rounded-card" />
                ))}
              </div>
            ) : filteredClubs.length === 0 ? (
              <div className="rounded-card bg-white p-10 text-center text-slate-500 shadow-soft">
                Кружков по выбранным фильтрам пока нет.
              </div>
            ) : (
              <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
                {filteredClubs.map((club) => (
                  <Link
                    key={club.id}
                    to={typeof club.id === 'number' ? `/clubs/${club.id}` : '/clubs'}
                    className="direction-card flex min-h-[250px] flex-col"
                  >
                    <span className="badge badge-info w-fit">{club.direction || 'Образование'}</span>
                    <h2 className="mt-4 text-xl font-semibold leading-tight text-slate-950">{club.name}</h2>
                    <p className="mt-3 line-clamp-4 text-sm leading-7 text-slate-600">{club.description}</p>
                    <div className="mt-auto flex flex-wrap items-center gap-3 pt-5 text-sm text-slate-500">
                      <span className="inline-flex items-center gap-2">
                        <Users size={16} /> {club.current_students}/{club.max_students}
                      </span>
                      <span>{club.age_min}-{club.age_max} лет</span>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>
      </section>
    </div>
  );
};
