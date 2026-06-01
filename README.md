# 🎓 Digital Urpaq - Полнофункциональный Portal для кружков

Современный fullstack-портал для регистрации кружков, записи учащихся, управления образовательным и рекламным контентом.

## 🚀 Стек технологий

### Backend
- **Node.js** - JavaScript runtime
- **Express.js** - REST API framework
- **SQLite** - Database
- **JWT** - Authentication
- **bcrypt** - Password hashing
- **CORS** - Cross-origin support

### Frontend
- **React 18** - UI Framework
- **React Router** - Navigation
- **Tailwind CSS** - Styling
- **Axios** - HTTP Client
- **Lucide Icons** - Icons

## 📋 Основные функции

### 🔐 Аутентификация
- ✅ Регистрация и вход
- ✅ JWT токены
- ✅ Разграничение ролей
- ✅ Защита паролей (bcrypt)

### 📚 Управление кружками
- ✅ Просмотр списка кружков
- ✅ Фильтрация по направлению и возрасту
- ✅ Детальная информация о кружке
- ✅ Статистика (просмотры, рейтинг)

### 📝 Заявки
- ✅ Подача заявок на кружок
- ✅ Просмотр своих заявок
- ✅ Управление статусом (администратор/учитель)
- ✅ История заявок

### 👥 Роли пользователей
- **Гость** - просмотр кружков и новостей
- **Студент** - подача заявок, просмотр своих данных
- **Преподаватель** - управление кружком и заявками
- **Администратор** - полный контроль над системой

### 📊 Админ-панель
- ✅ Статистика (пользователи, кружки, заявки)
- ✅ Управление пользователями
- ✅ Аналитика заявок по кружкам
- ✅ Управление контентом

## ⚙️ Установка и запуск

### Требования
- Node.js 14+
- npm или yarn

### Backend Setup

```bash
cd backend
npm install

# Запуск в режиме разработки
npm run dev

# Или обычный запуск
npm start
```

Backend запустится на `http://localhost:5000`

### Frontend Setup

```bash
cd frontend
npm install

# Запуск в режиме разработки
npm run dev

# Build для production
npm run build
```

Frontend запустится на `http://localhost:3000`

## 📁 Структура проекта

```
digital-urpaq/
├── backend/
│   ├── src/
│   │   ├── controllers/       # Бизнес-логика
│   │   ├── routes/            # API маршруты
│   │   ├── middleware/        # Middleware (auth, validation)
│   │   ├── database/          # БД инициализация
│   │   └── app.js             # Главное приложение
│   ├── .env                   # Переменные окружения
│   └── package.json
│
└── frontend/
    ├── src/
    │   ├── pages/             # Страницы приложения
    │   ├── components/        # React компоненты
    │   ├── context/           # Context API (auth)
    │   ├── services/          # API клиент
    │   ├── App.jsx            # Главный компонент
    │   └── index.css          # Стили
    ├── index.html
    └── package.json
```

## 🔌 API Endpoints

### Auth
- `POST /api/auth/register` - Регистрация
- `POST /api/auth/login` - Вход
- `GET /api/auth/profile` - Получить профиль
- `PUT /api/auth/profile` - Обновить профиль

### Clubs
- `GET /api/clubs` - Список всех кружков
- `GET /api/clubs/:id` - Детали кружка
- `POST /api/clubs` - Создать кружок (учитель/админ)
- `PUT /api/clubs/:id` - Обновить кружок (учитель/админ)
- `DELETE /api/clubs/:id` - Удалить кружок (учитель/админ)
- `GET /api/clubs/:clubId/students` - Студенты кружка

### Applications
- `POST /api/applications` - Подать заявку
- `GET /api/applications/my-applications` - Мои заявки
- `GET /api/applications/club/:clubId` - Заявки кружка (учитель)
- `PUT /api/applications/:applicationId/status` - Обновить статус
- `DELETE /api/applications/:applicationId` - Отменить заявку

### Content
- `GET /api/content/news` - Новости
- `GET /api/content/content/club/:clubId` - Контент кружка
- `POST /api/content/content` - Создать контент
- `POST /api/content/news` - Создать новость (админ)

### Admin
- `GET /api/admin/statistics` - Статистика
- `GET /api/admin/users` - Список пользователей
- `PUT /api/admin/users/:userId/role` - Изменить роль
- `DELETE /api/admin/users/:userId` - Удалить пользователя
- `GET /api/admin/applications-stats` - Статистика заявок

## 🔧 Переменные окружения

### Backend (.env)
```
PORT=5000
DATABASE_PATH=./database.db
JWT_SECRET=your_jwt_secret_key_change_in_production
NODE_ENV=development
CLIENT_URL=http://localhost:3000
```

## 📊 База данных

SQLite таблицы:
- `users` - Пользователи
- `clubs` - Кружки
- `applications` - Заявки
- `educational_content` - Образовательный контент
- `news` - Новости и объявления
- `club_stats` - Статистика кружков

## 🎯 Возможности для развития

- 📱 Мобильное приложение (React Native/Flutter)
- 📲 PWA версия
- 🤖 Telegram-бот
- 🎨 Загрузка изображений и файлов
- 📅 Календарь расписания
- 🔍 Расширенный поиск и фильтрация
- 🌍 Многоязычность (КК, РУ, EN)
- 🐳 Docker контейнеризация
- 📈 Продвинутая аналитика
- 🤖 LLM API интеграция

## 👥 Авторы

Digital Urpaq Development Team

## 📝 Лицензия

MIT

## 📞 Поддержка

Для вопросов и предложений обратитесь к администрации Digital Urpaq.
