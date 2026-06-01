# 📚 Документация Digital Urpaq

Добро пожаловать в документацию! Выберите нужный раздел:

## 🚀 Начало работы

1. **[QUICKSTART.md](./QUICKSTART.md)** - Быстрая установка и запуск (2 минуты)
2. **[README.md](./README.md)** - Полная документация проекта

## 📖 Документация

3. **[ARCHITECTURE.md](./ARCHITECTURE.md)** - Архитектура системы и технические детали
4. **[TECH_STACK.md](./TECH_STACK.md)** - Стек технологий и требования
5. **[FEATURES.md](./FEATURES.md)** - Проверка функционала и готовность к хакатону

## 🔍 Структура кода

### Backend
```
backend/
├── src/
│   ├── controllers/       # Бизнес-логика
│   │   ├── authController.js
│   │   ├── clubController.js
│   │   ├── applicationController.js
│   │   ├── contentController.js
│   │   └── adminController.js
│   ├── routes/            # API маршруты
│   │   ├── authRoutes.js
│   │   ├── clubRoutes.js
│   │   ├── applicationRoutes.js
│   │   ├── contentRoutes.js
│   │   └── adminRoutes.js
│   ├── middleware/        # Middleware
│   │   └── auth.js
│   ├── database/          # БД
│   │   ├── init.js
│   │   └── seed.js
│   └── app.js             # Главное приложение
├── .env                   # Переменные окружения
├── package.json
└── Dockerfile
```

### Frontend
```
frontend/
├── src/
│   ├── pages/             # Страницы
│   │   ├── HomePage.jsx
│   │   ├── LoginPage.jsx
│   │   ├── RegisterPage.jsx
│   │   ├── ClubsPage.jsx
│   │   ├── ClubDetailPage.jsx
│   │   ├── MyApplicationsPage.jsx
│   │   ├── AdminPage.jsx
│   │   └── TeacherPage.jsx
│   ├── components/        # Компоненты
│   │   ├── Header.jsx
│   │   └── Footer.jsx
│   ├── context/           # Context API
│   │   └── AuthContext.jsx
│   ├── services/          # API сервис
│   │   └── api.js
│   ├── App.jsx
│   ├── main.jsx
│   └── index.css
├── index.html
├── vite.config.js
├── tailwind.config.js
├── postcss.config.js
├── package.json
├── Dockerfile
└── nginx.conf
```

## 📋 API Справка

### Аутентификация
```
POST /api/auth/register     - Регистрация
POST /api/auth/login        - Вход
GET  /api/auth/profile      - Профиль
PUT  /api/auth/profile      - Обновить профиль
```

### Кружки
```
GET  /api/clubs             - Список кружков
GET  /api/clubs/:id         - Детали кружка
POST /api/clubs             - Создать кружок (учитель)
PUT  /api/clubs/:id         - Обновить кружок (учитель)
DELETE /api/clubs/:id       - Удалить кружок (учитель)
GET  /api/clubs/:id/students - Студенты кружка (учитель)
```

### Заявки
```
POST /api/applications                    - Новая заявка (студент)
GET  /api/applications/my-applications    - Мои заявки (студент)
GET  /api/applications/club/:id           - Заявки кружка (учитель)
PUT  /api/applications/:id/status         - Изменить статус (учитель)
DELETE /api/applications/:id              - Отменить заявку (студент)
```

### Контент
```
GET  /api/content/news                    - Новости
GET  /api/content/content/club/:id        - Контент кружка
POST /api/content/content                 - Создать контент (учитель)
DELETE /api/content/content/:id           - Удалить контент (учитель)
POST /api/content/news                    - Создать новость (админ)
DELETE /api/content/news/:id              - Удалить новость (админ)
```

### Администратор
```
GET  /api/admin/statistics                - Статистика
GET  /api/admin/users                     - Пользователи
PUT  /api/admin/users/:id/role            - Изменить роль
DELETE /api/admin/users/:id               - Удалить пользователя
GET  /api/admin/applications-stats        - Статистика заявок
```

## 🔐 Учетные данные для тестирования

| Email | Пароль | Роль |
|-------|--------|------|
| admin@example.com | password | Администратор |
| teacher1@example.com | password | Преподаватель |
| student1@example.com | password | Студент |

## ⚙️ Переменные окружения

### Backend (.env)
```
PORT=5000
DATABASE_PATH=./database.db
JWT_SECRET=your_jwt_secret_key_change_in_production
NODE_ENV=development
CLIENT_URL=http://localhost:3000
```

## 🐛 Решение проблем

### Frontend не подключается к Backend
- Убедитесь, что Backend работает на `http://localhost:5000`
- Проверьте `CLIENT_URL` в backend `.env`
- Откройте DevTools (F12) и проверьте консоль на ошибки

### Port уже используется
- **Windows**: `netstat -ano | findstr :5000`
- **Mac/Linux**: `lsof -i :5000`
- Затем убейте процесс или используйте другой port

### Ошибка БД
- Удалите `backend/database.db`
- Перезапустите backend
- БД пересоздастся автоматически с демо-данными

### CORS ошибка
- Проверьте, что Backend включает CORS middleware
- Убедитесь, что `CLIENT_URL` в `.env` правильная

## 📞 Контакты и поддержка

- **Email**: info@digitalurpaq.kz
- **Phone**: +7 (7XX) XXX-XX-XX
- **GitHub**: [link to repo]

## 🎓 Ресурсы для обучения

- [React Документация](https://react.dev/)
- [Express.js Гайд](https://expressjs.com/)
- [Tailwind CSS Docs](https://tailwindcss.com/docs)
- [SQLite Tutorial](https://www.sqlite.org/cli.html)

---

**Последнее обновление**: 31 мая 2026
**Версия**: 1.0.0
**Статус**: ✅ Production Ready
