# 🎓 Digital Urpaq - Техническая Архитектура

## 🏗️ Архитектура системы

```
┌─────────────────────────────────────────────────────────────┐
│                      Пользователи                           │
│  (Гости, Студенты, Преподаватели, Администраторы)          │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ▼
        ┌────────────────────────────────────┐
        │     React Frontend (Port 3000)     │
        │  ├─ Pages                          │
        │  ├─ Components                     │
        │  └─ Context (Auth)                 │
        └────────────────┬───────────────────┘
                         │ HTTP/REST
                         ▼
        ┌────────────────────────────────────┐
        │  Express Backend (Port 5000)       │
        │  ├─ Auth Routes                    │
        │  ├─ Club Routes                    │
        │  ├─ Application Routes             │
        │  ├─ Content Routes                 │
        │  └─ Admin Routes                   │
        └────────────────┬───────────────────┘
                         │
                         ▼
        ┌────────────────────────────────────┐
        │      SQLite Database               │
        │  ├─ Users                          │
        │  ├─ Clubs                          │
        │  ├─ Applications                   │
        │  ├─ Content                        │
        │  ├─ News                           │
        │  └─ Stats                          │
        └────────────────────────────────────┘
```

## 📊 Структура БД

### Таблица: users
```sql
id (PK)
full_name
email (UNIQUE)
password (хеш)
phone
age
role (guest, student, teacher, admin)
created_at
updated_at
```

### Таблица: clubs
```sql
id (PK)
name
description
direction
age_min, age_max
teacher_id (FK → users.id)
schedule
location
max_students
current_students
status (open, closed)
image_url
created_at
updated_at
```

### Таблица: applications
```sql
id (PK)
student_id (FK → users.id)
club_id (FK → clubs.id)
status (new, approved, rejected, pending)
comment
created_at
updated_at
```

### Таблица: educational_content
```sql
id (PK)
club_id (FK → clubs.id)
title
content
type (text, video, presentation, file, task)
access_level (public, registered, club_only)
file_url
created_by (FK → users.id)
created_at
updated_at
```

### Таблица: news
```sql
id (PK)
title
content
type (news, announcement, banner, achievement)
image_url
is_published
created_by (FK → users.id)
created_at
updated_at
```

### Таблица: club_stats
```sql
club_id (FK → clubs.id)
views (количество просмотров)
applications_count
rating
```

## 🔐 Безопасность

### Аутентификация
1. **Регистрация** → `bcrypt` хеширование пароля
2. **Вход** → JWT токен (7 дней)
3. **Запросы** → Bearer token в заголовке
4. **Валидация** → Проверка токена и роли

### Авторизация
- **Гость**: Просмотр кружков, новостей
- **Студент**: Подача заявок, просмотр своих данных
- **Преподаватель**: Управление своим кружком
- **Администратор**: Полный доступ

## 🔄 Основные Flow'ы

### 1. Регистрация
```
User Register → Email Check → Password Hash → DB Save → Token Gen → Response
```

### 2. Подача Заявки
```
Auth Check → Duplicate Check → Save Application → Update Stats → Response
```

### 3. Одобрение Заявки
```
Auth Check (Teacher) → Status Validation → DB Update → Response
```

### 4. Просмотр Кружка
```
Get Club → Increment Views → Get Stats → Response
```

## 🎨 Frontend Routes

| Route | Компонент | Роли |
|-------|-----------|------|
| `/` | HomePage | All |
| `/login` | LoginPage | Public |
| `/register` | RegisterPage | Public |
| `/clubs` | ClubsPage | All |
| `/clubs/:id` | ClubDetailPage | All |
| `/my-applications` | MyApplicationsPage | Student |
| `/teacher` | TeacherPage | Teacher |
| `/admin` | AdminPage | Admin |

## 🔌 API Endpoints Summary

### Публичные (без auth)
- `GET /api/clubs` - Список кружков
- `GET /api/clubs/:id` - Детали кружка
- `GET /api/content/news` - Новости
- `POST /api/auth/register` - Регистрация
- `POST /api/auth/login` - Вход

### Защищенные (auth required)
- `GET /api/auth/profile` - Профиль
- `POST /api/applications` - Новая заявка
- `GET /api/applications/my-applications` - Мои заявки

### Учитель (role: teacher)
- `POST /api/clubs` - Создать кружок
- `GET /api/applications/club/:id` - Заявки
- `PUT /api/applications/:id/status` - Изменить статус

### Администратор (role: admin)
- `GET /api/admin/statistics` - Статистика
- `GET /api/admin/users` - Все пользователи
- `PUT /api/admin/users/:id/role` - Изменить роль
- `DELETE /api/admin/users/:id` - Удалить пользователя

## ⚡ Производительность

### Оптимизации
- JWT вместо сессий (stateless)
- SQLite индексы на FK
- CORS caching
- Frontend lazy loading
- API pagination (планируется)

### Масштабирование
- Миграция на PostgreSQL
- Redis кеширование
- Webpack code splitting
- CDN для статических файлов
- Load balancing

## 🧪 Тестирование

### Unit Tests
```bash
cd backend
npm test
```

### E2E Tests
```bash
cd frontend
npm run test:e2e
```

## 📈 Метрики

- **Время ответа API**: < 200ms
- **Размер бандла Frontend**: ~ 350KB (gzipped)
- **Размер БД**: ~ 2-5MB (для 1000 кружков)

## 🚀 Развертывание

### Production Checklist
- [ ] Изменить JWT_SECRET
- [ ] Настроить CORS для production domain
- [ ] Включить HTTPS
- [ ] Настроить логирование
- [ ] Настроить мониторинг
- [ ] Бэкапы БД
- [ ] CDN для изображений

### Docker (планируется)
```bash
docker-compose up
```

## 📝 Лицензия

MIT
