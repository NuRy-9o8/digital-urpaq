# Digital Urpaq - хакатон summary

## Цель

Fullstack-портал для Дворца школьников Digital Urpaq: регистрация пользователей, каталог кружков, заявки на обучение, Летняя Академия, новости, образовательный контент, роли и администрирование.

## Реализовано

- Frontend: React + Vite + Tailwind CSS.
- Backend: Node.js + Express.
- Database: SQLite.
- Роли: гость, учащийся, преподаватель, администратор.
- Авторизация: регистрация, вход, JWT, хэширование паролей.
- Кружки: список, карточка, фильтры, создание и управление.
- Заявки на кружки: подача, статусы `new`, `pending`, `approved`, `rejected`.
- Летняя Академия: отдельная страница `/summer-academy`, API и таблица заявок.
- Контент: новости, объявления, материалы кружков.
- Telegram-бот: интеграция через `TELEGRAM_BOT_TOKEN`, бот `@du_notifications_bot`.
- PWA: manifest, icons, service worker.
- Адаптивный UI для телефона и компьютера.
- Docker-файлы и `docker-compose.yml`.

## Главные страницы

- `/` - главная страница.
- `/clubs` - каталог кружков.
- `/clubs/:id` - карточка кружка и заявка.
- `/summer-academy` - заявка в Летнюю Академию.
- `/news` - новости и объявления.
- `/login`, `/register` - вход и регистрация.
- `/my-applications` - заявки учащегося.
- `/teacher` - кабинет преподавателя.
- `/admin` - админ-панель.

## API

- `POST /api/auth/register`
- `POST /api/auth/login`
- `GET /api/clubs`
- `GET /api/clubs/:id`
- `POST /api/applications`
- `GET /api/applications/my-applications`
- `PUT /api/applications/:applicationId/status`
- `POST /api/academy`
- `GET /api/academy/my-applications`
- `GET /api/academy`
- `PUT /api/academy/:applicationId/status`
- `GET /api/content/news`
- `GET /api/admin/statistics`

## Демо-аккаунты

Пароль для демо-аккаунтов: `password`.

- Администратор: `admin@example.com`
- Преподаватель: `teacher1@example.com`
- Учащийся: `student1@example.com`

## Запуск

Backend:

```powershell
cd backend
npm start
```

Frontend:

```powershell
cd frontend
npm run dev
```

Открыть:

```text
http://localhost:3000
```

## Telegram

В `backend/.env`:

```env
TELEGRAM_BOT_TOKEN=ваш_токен_из_BotFather
TELEGRAM_POLLING=true
```

Для локальной проверки без polling:

```powershell
$env:TELEGRAM_POLLING="false"
npm start
```
