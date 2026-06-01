import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { BookOpen, CalendarDays, ChevronRight, GraduationCap, PlayCircle, Send, Sparkles } from 'lucide-react';
import { clubsAPI, contentAPI } from '../services/api';
import { ClickToPlayVideo } from '../components/ClickToPlayVideo';
import { directorQuote, media, sampleClubs } from '../data/siteContent';
import { useLanguage } from '../context/LanguageContext';

const HOME_COPY = {
  ru: {
    city: 'Digital Urpaq - Петропавловск',
    heroTitle: 'Дворец школьников для будущих инженеров, исследователей и творцов',
    heroText: 'Более 100 кружков по шести направлениям, современные лаборатории, проектная работа и онлайн-запись для школьников Петропавловска.',
    apply: 'Записаться',
    details: 'Подробнее',
    heroVideo: 'VR, IT и робототехника',
    admissionOpen: 'Прием заявок открыт',
    stats: [
      ['100+', 'более кружков'],
      ['2875', 'учеников одновременно'],
      ['7+', 'лет опыта'],
      ['80%', 'бесплатных программ'],
    ],
    directionsLabel: 'Направления',
    directionsTitle: 'Выберите направление, которое подходит именно вам',
    directionsText: 'Шесть образовательных направлений, лаборатории, кружки и понятные точки входа для родителей и детей.',
    videoLabel: 'Видео занятий',
    videoTitle: 'Живые фрагменты занятий',
    videoText: 'Короткие видеопревью помогают увидеть лаборатории и творческие студии до записи на кружок.',
    seeAll: 'Смотреть все',
    directorLabel: 'Цитата директора',
    labsLabel: 'IT лаборатории',
    labsTitle: 'От VR до дронов и робототехники',
    labsText: 'Короткий срез направлений, которые уже описаны в материалах проекта.',
    readyTitle: 'Готовы начать обучение?',
    readyText: 'Записывайтесь в кружки Дворца школьников и откройте для себя мир новых возможностей и знаний.',
    clubApply: 'Записаться в кружок',
    academy: 'Летняя Академия',
    popularLabel: 'Популярные кружки',
    popularTitle: 'Быстрый выбор программы',
    allClubs: 'Все кружки',
    education: 'Образование',
    students: 'участников',
    newsLabel: 'Новости',
    newsTitle: 'Актуальное в Digital Urpaq',
    allNews: 'Все новости',
    read: 'Читать',
    telegramTitle: 'Telegram-уведомления',
    telegramText: 'Откройте бота, нажмите /start и получайте новости, события и статусы заявок.',
    telegramButton: 'Открыть бота',
    directions: [
      ['Научно-биологическое направление', '4 лаборатории, 30 кружков', 'Практические занятия по биологии, химии и биотехнологиям, где школьники работают с лабораторными задачами и исследовательскими проектами.', ['Современные биотехнологии', 'Кабинет биологии', 'Кабинет химии']],
      ['IT направление', '11 лабораторий, робототехника, VR', '3D-прототипирование, виртуальная реальность, программирование, радио-SDR, робототехника, LEGO, электроника, дроны и SOFT-программирование.', ['3D-прототипирование', 'Виртуальная реальность', 'SOFT-программирование']],
      ['Художественно-эстетическое направление', 'Музыка, театр, медиа', 'Творческие студии помогают развивать сценические, музыкальные, визуальные и медийные навыки через регулярную практику.', ['Вокал', 'Домбра', 'Журналистика и медиатехнологии']],
      ['Гуманитарное направление', 'Языки, дебаты, ораторство', 'Занятия для развития речи, коммуникации, лидерских качеств и уверенного публичного выступления.', ['Английский язык', 'Казахский язык', 'Дебатный клуб']],
      ['Естественно-математическое направление', 'Математика, физика, шахматы', 'Кружки помогают прокачать логику, олимпиадное мышление и прикладные навыки для технических профессий.', ['Физика', 'Математика', 'Программирование']],
      ['Социально-педагогическое направление', 'Волонтерство и проекты', 'Программы про командную работу, социальные инициативы и развитие личной культуры школьника.', ['Лидерство', 'Волонтерство', 'Проектная деятельность']],
    ],
    featuredPrograms: [
      ['Кабинет виртуальной реальности', 'IT', '12-17 лет', media.videos.vr],
      ['SOFT-программирование', 'IT', '10-17 лет', media.videos.soft],
      ['Современные биотехнологии', 'Наука', '12-18 лет', media.videos.biotech],
      ['Домбра и сценическое творчество', 'Творчество', '7-16 лет', media.videos.dombra],
    ],
    labs: ['Лаборатория 3D-прототипирования', 'Анимационная студия', 'Кабинет виртуальной реальности', 'Лаборатория программируемого радио-SDR', 'Кабинет физики', 'Кабинет SOFT-программирования', 'Лаборатория робототехники и мехатроники', 'Кабинет LEGO', 'Лаборатория промышленного интернета вещей', 'Лаборатория электроники и электротехники', 'Кабинет по сборке дронов'],
    newsFallback: [
      ['season', 'Открыта регистрация на новый учебный сезон', 'Начался прием заявок на кружки и образовательные программы 2026-2027 учебного года.', '31.05.2026'],
      ['academy', 'Старт Летней Академии Digital Urpaq', 'Летние интенсивы помогут школьникам попробовать себя в IT, творчестве и науке.', '31.05.2026'],
      ['ai', 'Новые программы по искусственному интеллекту', 'В новом сезоне появятся занятия по машинному обучению, данным и цифровым помощникам.', '31.05.2026'],
    ],
  },
  kz: {
    city: 'Digital Urpaq - Петропавл',
    heroTitle: 'Болашақ инженерлер, зерттеушілер және шығармашыл оқушыларға арналған сарай',
    heroText: 'Алты бағыт бойынша 100-ден аса үйірме, заманауи зертханалар, жобалық жұмыс және Петропавл оқушыларына онлайн тіркелу.',
    apply: 'Тіркелу',
    details: 'Толығырақ',
    heroVideo: 'VR, IT және робототехника',
    admissionOpen: 'Өтінім қабылдау ашық',
    stats: [['100+', 'үйірме'], ['2875', 'оқушы бір уақытта'], ['7+', 'жыл тәжірибе'], ['80%', 'тегін бағдарлама']],
    directionsLabel: 'Бағыттар',
    directionsTitle: 'Өзіңізге сәйкес бағытты таңдаңыз',
    directionsText: 'Алты білім беру бағыты, зертханалар, үйірмелер және ата-аналар мен балаларға түсінікті бастау нүктелері.',
    videoLabel: 'Сабақ видеолары',
    videoTitle: 'Сабақтардың нақты үзінділері',
    videoText: 'Қысқа видеолар үйірмеге жазылмай тұрып зертханалар мен студияларды көруге көмектеседі.',
    seeAll: 'Барлығын көру',
    directorLabel: 'Директор сөзі',
    labsLabel: 'IT зертханалары',
    labsTitle: 'VR-дан дрондар мен робототехникаға дейін',
    labsText: 'Портал материалдарында сипатталған бағыттардың қысқаша көрінісі.',
    readyTitle: 'Оқуды бастауға дайынсыз ба?',
    readyText: 'Оқушылар сарайының үйірмелеріне жазылып, жаңа білім мен мүмкіндіктер әлемін ашыңыз.',
    clubApply: 'Үйірмеге жазылу',
    academy: 'Жазғы Академия',
    popularLabel: 'Танымал үйірмелер',
    popularTitle: 'Бағдарламаны жылдам таңдау',
    allClubs: 'Барлық үйірмелер',
    education: 'Білім',
    students: 'қатысушы',
    newsLabel: 'Жаңалықтар',
    newsTitle: 'Digital Urpaq жаңалықтары',
    allNews: 'Барлық жаңалықтар',
    read: 'Оқу',
    telegramTitle: 'Telegram-хабарламалар',
    telegramText: 'Ботты ашып, /start басыңыз және жаңалықтар, іс-шаралар мен өтінім мәртебесін алыңыз.',
    telegramButton: 'Ботты ашу',
    directions: [
      ['Ғылыми-биологиялық бағыт', '4 зертхана, 30 үйірме', 'Биология, химия және биотехнология бойынша практикалық сабақтар мен зерттеу жобалары.', ['Биотехнология', 'Биология кабинеті', 'Химия кабинеті']],
      ['IT бағыт', '11 зертхана, робототехника, VR', '3D-прототиптеу, виртуалды шындық, бағдарламалау, робототехника, LEGO, электроника және дрондар.', ['3D-прототиптеу', 'Виртуалды шындық', 'SOFT-бағдарламалау']],
      ['Көркем-эстетикалық бағыт', 'Музыка, театр, медиа', 'Шығармашылық студиялар сахналық, музыкалық, визуалды және медиа дағдыларды дамытады.', ['Вокал', 'Домбыра', 'Журналистика']],
      ['Гуманитарлық бағыт', 'Тілдер, дебат, шешендік', 'Сөйлеу, коммуникация, көшбасшылық және көпшілік алдында сөйлеу дағдылары.', ['Ағылшын тілі', 'Қазақ тілі', 'Дебат клубы']],
      ['Жаратылыстану-математикалық бағыт', 'Математика, физика, шахмат', 'Логика, олимпиадалық ойлау және техникалық мамандықтарға пайдалы дағдылар.', ['Физика', 'Математика', 'Бағдарламалау']],
      ['Әлеуметтік-педагогикалық бағыт', 'Еріктілік және жобалар', 'Командалық жұмыс, әлеуметтік бастамалар және тұлғалық мәдениетті дамыту.', ['Көшбасшылық', 'Еріктілік', 'Жобалық жұмыс']],
    ],
    featuredPrograms: [
      ['Виртуалды шындық кабинеті', 'IT', '12-17 жас', media.videos.vr],
      ['SOFT-бағдарламалау', 'IT', '10-17 жас', media.videos.soft],
      ['Заманауи биотехнологиялар', 'Ғылым', '12-18 жас', media.videos.biotech],
      ['Домбыра және сахналық шығармашылық', 'Шығармашылық', '7-16 жас', media.videos.dombra],
    ],
    labs: ['3D-прототиптеу зертханасы', 'Анимациялық студия', 'Виртуалды шындық кабинеті', 'SDR радио зертханасы', 'Физика кабинеті', 'SOFT-бағдарламалау кабинеті', 'Робототехника зертханасы', 'LEGO кабинеті', 'Өнеркәсіптік интернет зертханасы', 'Электроника зертханасы', 'Дрон құрастыру кабинеті'],
    newsFallback: [
      ['season', 'Жаңа оқу маусымына тіркелу ашылды', '2026-2027 оқу жылына үйірмелер мен бағдарламаларға өтінім қабылдау басталды.', '31.05.2026'],
      ['academy', 'Digital Urpaq Жазғы Академиясы басталады', 'Жазғы интенсивтер оқушыларға IT, шығармашылық және ғылымды байқап көруге мүмкіндік береді.', '31.05.2026'],
      ['ai', 'Жасанды интеллект бойынша жаңа бағдарламалар', 'Жаңа маусымда машиналық оқыту, деректер және цифрлық көмекшілер бойынша сабақтар ашылады.', '31.05.2026'],
    ],
  },
  en: {
    city: 'Digital Urpaq - Petropavlovsk',
    heroTitle: 'Student Palace for future engineers, researchers and creators',
    heroText: 'More than 100 clubs across six tracks, modern laboratories, project-based learning and online enrollment for Petropavlovsk students.',
    apply: 'Apply',
    details: 'Learn more',
    heroVideo: 'VR, IT and robotics',
    admissionOpen: 'Applications are open',
    stats: [['100+', 'clubs'], ['2875', 'students at once'], ['7+', 'years of experience'], ['80%', 'free programs']],
    directionsLabel: 'Tracks',
    directionsTitle: 'Choose the track that fits you',
    directionsText: 'Six educational tracks, laboratories, clubs and clear entry points for parents and students.',
    videoLabel: 'Class videos',
    videoTitle: 'Real fragments from classes',
    videoText: 'Short video previews help students see laboratories and studios before applying.',
    seeAll: 'See all',
    directorLabel: 'Director quote',
    labsLabel: 'IT laboratories',
    labsTitle: 'From VR to drones and robotics',
    labsText: 'A quick overview of the tracks already described in project materials.',
    readyTitle: 'Ready to start learning?',
    readyText: 'Join Student Palace clubs and discover a world of new opportunities and knowledge.',
    clubApply: 'Apply for a club',
    academy: 'Summer Academy',
    popularLabel: 'Popular clubs',
    popularTitle: 'Quick program selection',
    allClubs: 'All clubs',
    education: 'Education',
    students: 'students',
    newsLabel: 'News',
    newsTitle: 'Digital Urpaq updates',
    allNews: 'All news',
    read: 'Read',
    telegramTitle: 'Telegram notifications',
    telegramText: 'Open the bot, press /start and receive news, events and application status updates.',
    telegramButton: 'Open bot',
    directions: [
      ['Science and biology track', '4 laboratories, 30 clubs', 'Practical biology, chemistry and biotechnology classes with laboratory tasks and research projects.', ['Modern biotechnology', 'Biology classroom', 'Chemistry classroom']],
      ['IT track', '11 laboratories, robotics, VR', '3D prototyping, virtual reality, programming, SDR radio, robotics, LEGO, electronics, drones and SOFT programming.', ['3D prototyping', 'Virtual reality', 'SOFT programming']],
      ['Arts and aesthetics track', 'Music, theatre, media', 'Creative studios develop stage, music, visual and media skills through regular practice.', ['Vocal', 'Dombra', 'Journalism and media']],
      ['Humanities track', 'Languages, debate, public speaking', 'Classes for speech, communication, leadership and confident public speaking.', ['English', 'Kazakh', 'Debate club']],
      ['Math and natural sciences track', 'Math, physics, chess', 'Clubs build logic, olympiad thinking and applied skills for technical professions.', ['Physics', 'Mathematics', 'Programming']],
      ['Social and pedagogy track', 'Volunteering and projects', 'Programs about teamwork, social initiatives and personal culture.', ['Leadership', 'Volunteering', 'Project work']],
    ],
    featuredPrograms: [
      ['Virtual reality classroom', 'IT', '12-17 years', media.videos.vr],
      ['SOFT programming', 'IT', '10-17 years', media.videos.soft],
      ['Modern biotechnology', 'Science', '12-18 years', media.videos.biotech],
      ['Dombra and stage creativity', 'Creative', '7-16 years', media.videos.dombra],
    ],
    labs: ['3D prototyping laboratory', 'Animation studio', 'Virtual reality classroom', 'SDR programmable radio laboratory', 'Physics classroom', 'SOFT programming classroom', 'Robotics and mechatronics laboratory', 'LEGO classroom', 'Industrial internet of things laboratory', 'Electronics laboratory', 'Drone assembly classroom'],
    newsFallback: [
      ['season', 'Enrollment for the new school year is open', 'Applications for clubs and educational programs for 2026-2027 have started.', '31.05.2026'],
      ['academy', 'Digital Urpaq Summer Academy starts', 'Summer intensives help students try IT, creativity and science.', '31.05.2026'],
      ['ai', 'New artificial intelligence programs', 'New classes in machine learning, data and digital assistants will launch this season.', '31.05.2026'],
    ],
  },
};

const toNewsItems = (copy) => copy.newsFallback.map(([id, title, lead, date]) => ({ id, title, lead, date, type: 'news' }));

export const HomePage = () => {
  const { locale } = useLanguage();
  const copy = HOME_COPY[locale] || HOME_COPY.ru;
  const [clubs, setClubs] = useState([]);
  const [news, setNews] = useState(toNewsItems(copy));
  const [loading, setLoading] = useState(true);

  const directionCards = useMemo(
    () => copy.directions.map(([title, count, text, labs]) => ({ title, count, text, labs })),
    [copy]
  );
  const featuredPrograms = useMemo(
    () => copy.featuredPrograms.map(([title, direction, age, video]) => ({ title, direction, age, video })),
    [copy]
  );

  useEffect(() => {
    setNews(toNewsItems(copy));
  }, [copy]);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [clubsRes, newsRes] = await Promise.all([
          clubsAPI.getAll({ status: 'open' }),
          contentAPI.getNews(),
        ]);
        const clubList = (clubsRes.data || []).length ? clubsRes.data : sampleClubs;
        setClubs([...clubList].sort((a, b) => Number(b.id) - Number(a.id)).slice(0, 4));
        if (locale === 'ru') {
          setNews([...(newsRes.data || []).slice(0, 2), ...toNewsItems(copy)].slice(0, 3));
        }
      } catch (error) {
        console.error('Error fetching homepage data:', error);
        setClubs(sampleClubs.slice(0, 4));
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [copy, locale]);

  return (
    <div className="min-h-screen bg-page-pattern">
      <section className="relative isolate overflow-hidden bg-white">
        <div className="du-circle du-circle-yellow left-[4%] top-20" />
        <div className="du-circle du-circle-blue right-[8%] top-28" />
        <div className="du-circle du-circle-outline bottom-16 left-[45%]" />

        <div className="container relative z-10 grid min-h-[calc(100vh-76px)] content-center gap-10 py-12 md:py-16 lg:grid-cols-[1.02fr_0.98fr] lg:items-center">
          <div className="max-w-3xl">
            <span className="feature-pill">
              <Sparkles size={17} /> {copy.city}
            </span>
            <h1 className="mt-6 max-w-4xl text-4xl font-extrabold leading-[1.05] text-slate-950 sm:text-5xl lg:text-6xl">
              {copy.heroTitle}
            </h1>
            <p className="mt-6 max-w-2xl text-base leading-8 text-slate-600 sm:text-lg">{copy.heroText}</p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link to="/clubs" className="btn btn-accent min-h-12 px-6 py-3">
                {copy.apply} <ChevronRight size={18} />
              </Link>
              <Link to="/about" className="btn btn-outline min-h-12 px-6 py-3">{copy.details}</Link>
            </div>
            <div className="mt-10 grid grid-cols-2 gap-3 sm:grid-cols-4">
              {copy.stats.map(([value, label]) => (
                <div key={label} className="stat-tile">
                  <div className="text-2xl font-extrabold text-primary sm:text-3xl">{value}</div>
                  <p className="mt-1 text-xs font-semibold leading-5 text-slate-600">{label}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="hero-media-shell">
            <video className="h-full min-h-[420px] w-full object-cover" autoPlay muted loop playsInline>
              <source src={media.videos.vr} type="video/mp4" />
            </video>
            <div className="hero-float-card left-4 top-4">
              <PlayCircle size={20} className="text-accent" />
              <span>{copy.heroVideo}</span>
            </div>
            <div className="hero-float-card bottom-4 right-4">
              <span className="h-3 w-3 rounded-full bg-emerald-400" />
              <span>{copy.admissionOpen}</span>
            </div>
          </div>
        </div>
      </section>

      <section className="section-pad">
        <div className="container">
          <div className="section-heading">
            <span className="feature-pill">{copy.directionsLabel}</span>
            <h2>{copy.directionsTitle}</h2>
            <p>{copy.directionsText}</p>
          </div>

          <div className="mt-10 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {directionCards.map((item) => (
              <article key={item.title} className="official-direction-card">
                <div>
                  <div className="flex items-start justify-between gap-3">
                    <h3 className="text-xl font-bold leading-tight text-slate-950">{item.title}</h3>
                    <span className="direction-dot" />
                  </div>
                  <p className="mt-2 text-sm font-semibold text-primary">{item.count}</p>
                  <p className="mt-3 text-sm leading-7 text-slate-600">{item.text}</p>
                </div>
                <ul className="mt-5 grid gap-2 text-sm font-medium text-slate-700">
                  {item.labs.map((lab) => (
                    <li key={lab} className="flex items-center gap-2">
                      <span className="h-2 w-2 shrink-0 rounded-full bg-accent" /> {lab}
                    </li>
                  ))}
                </ul>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="section-pad bg-white">
        <div className="container">
          <div className="flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
            <div className="section-heading section-heading-left">
              <span className="feature-pill">{copy.videoLabel}</span>
              <h2>{copy.videoTitle}</h2>
              <p>{copy.videoText}</p>
            </div>
            <Link to="/clubs" className="btn btn-secondary min-h-12 px-5 py-3">{copy.seeAll}</Link>
          </div>

          <div className="mt-8 grid gap-5 md:grid-cols-2 xl:grid-cols-4">
            {featuredPrograms.map((program) => (
              <article key={program.title} className="program-card">
                <ClickToPlayVideo src={program.video} title={program.title} className="aspect-[4/3] w-full" autoLoop />
                <div className="p-5">
                  <span className="badge badge-info">{program.direction}</span>
                  <h3 className="mt-4 text-lg font-bold leading-tight text-slate-950">{program.title}</h3>
                  <p className="mt-2 text-sm font-semibold text-slate-500">{program.age}</p>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="section-pad">
        <div className="container grid gap-10 lg:grid-cols-[0.85fr_1.15fr] lg:items-center">
          <div className="overflow-hidden rounded-card shadow-soft">
            <img src={media.directorPhoto} alt={directorQuote.name} className="h-full min-h-[320px] w-full object-cover" />
          </div>
          <div>
            <span className="feature-pill">{copy.directorLabel}</span>
            <blockquote className="mt-6 text-2xl font-semibold leading-snug text-slate-950 sm:text-3xl">
              "{directorQuote.quote}"
            </blockquote>
            <p className="mt-6 text-slate-600">{directorQuote.intro}</p>
            <p className="mt-4 text-slate-600">{directorQuote.mission}</p>
            <div className="mt-6 border-l-4 border-accent pl-5">
              <p className="font-semibold text-slate-950">{directorQuote.name}</p>
              <p className="text-sm text-slate-500">{directorQuote.role}</p>
            </div>
          </div>
        </div>
      </section>

      <section className="section-pad bg-white">
        <div className="container grid gap-8 lg:grid-cols-[1fr_0.8fr]">
          <div>
            <div className="section-heading section-heading-left">
              <span className="feature-pill">{copy.labsLabel}</span>
              <h2>{copy.labsTitle}</h2>
              <p>{copy.labsText}</p>
            </div>
            <div className="mt-8 grid gap-3 sm:grid-cols-2">
              {copy.labs.map((lab) => (
                <div key={lab} className="flex items-center gap-3 rounded-card border border-slate-200 bg-white p-4">
                  <BookOpen className="shrink-0 text-primary" size={20} />
                  <span className="text-sm font-semibold text-slate-800">{lab}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-card bg-primary p-6 text-white shadow-soft md:p-8">
            <GraduationCap size={36} />
            <h3 className="mt-5 text-2xl font-bold">{copy.readyTitle}</h3>
            <p className="mt-4 text-white/85">{copy.readyText}</p>
            <div className="mt-6 flex flex-col gap-3 sm:flex-row">
              <Link to="/clubs" className="btn btn-accent min-h-12 px-6 py-3">{copy.clubApply}</Link>
              <Link to="/summer-academy" className="btn btn-glass min-h-12 px-6 py-3">{copy.academy}</Link>
            </div>
          </div>
        </div>
      </section>

      <section className="section-pad">
        <div className="container">
          <div className="flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
            <div className="section-heading section-heading-left">
              <span className="feature-pill">{copy.popularLabel}</span>
              <h2>{copy.popularTitle}</h2>
            </div>
            <Link to="/clubs" className="btn btn-secondary min-h-12 px-5 py-3">{copy.allClubs}</Link>
          </div>

          <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {loading
              ? Array.from({ length: 4 }).map((_, index) => <div key={index} className="skeleton h-56 rounded-card" />)
              : clubs.map((club) => (
                  <Link key={club.id} to={typeof club.id === 'number' ? `/clubs/${club.id}` : '/clubs'} className="direction-card">
                    <span className="badge badge-info">{club.direction || copy.education}</span>
                    <h3 className="mt-4 text-lg font-semibold text-slate-950">{club.name}</h3>
                    <p className="mt-3 line-clamp-4 text-sm text-slate-600">{club.description}</p>
                    <p className="mt-5 text-sm font-semibold text-primary">
                      {club.current_students}/{club.max_students} {copy.students}
                    </p>
                  </Link>
                ))}
          </div>
        </div>
      </section>

      <section className="section-pad bg-white">
        <div className="container">
          <div className="flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
            <div className="section-heading section-heading-left">
              <span className="feature-pill">{copy.newsLabel}</span>
              <h2>{copy.newsTitle}</h2>
            </div>
            <Link to="/news" className="btn btn-secondary min-h-12 px-5 py-3">{copy.allNews}</Link>
          </div>

          <div className="mt-8 grid gap-6 lg:grid-cols-3">
            {news.map((item) => (
              <article key={item.id} className="card">
                <div className="flex items-center gap-2 text-sm font-semibold text-primary">
                  <CalendarDays size={18} />
                  <span>{item.date || (item.created_at && new Date(item.created_at).toLocaleDateString('ru-RU'))}</span>
                </div>
                <h3 className="mt-4 text-xl font-semibold text-slate-950">{item.title}</h3>
                <p className="mt-3 text-sm leading-7 text-slate-600">{item.lead || item.content}</p>
                <Link to={`/news/${item.id}`} className="btn btn-secondary mt-5 min-h-10 px-4 text-sm">{copy.read}</Link>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="section-pad bg-slate-950 text-white">
        <div className="container flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="text-3xl font-bold">{copy.telegramTitle}</h2>
            <p className="mt-3 max-w-2xl text-slate-300">{copy.telegramText}</p>
          </div>
          <a href="https://t.me/du_notifications_bot" target="_blank" rel="noreferrer" className="btn btn-accent min-h-12 px-6 py-3">
            <Send size={18} /> {copy.telegramButton}
          </a>
        </div>
      </section>
    </div>
  );
};
