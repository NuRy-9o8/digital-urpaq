# 🚀 Быстрый старт Digital Urpaq

## ⚡ Автоматическая установка

### Windows
```bash
install.bat
```

### macOS / Linux
```bash
chmod +x install.sh
./install.sh
```

## 📝 Ручная установка

### 1. Backend

```bash
cd backend
npm install
npm run dev
```

Backend запустится на `http://localhost:5000`

### 2. Frontend (в отдельном терминале)

```bash
cd frontend
npm install
npm run dev
```

Frontend запустится на `http://localhost:3000`

## 🔐 Данные для входа

После первого запуска backend создаст демо-пользователей:

| Email | Пароль | Роль |
|-------|--------|------|
| admin@example.com | password | Администратор |
| teacher1@example.com | password | Преподаватель |
| student1@example.com | password | Студент |

## ✅ Проверка

1. **Backend здоров?**
   ```bash
   curl http://localhost:5000/api/health
   ```
   Ответ: `{"status":"OK"}`

2. **Frontend работает?**
   Откройте `http://localhost:3000` в браузере

## 🛠️ Trouble Shooting

**Ошибка: Port 5000/3000 уже используется**
- Backend: Измените PORT в `.env`
- Frontend: `npm run dev -- --port 3001`

**Ошибка БД**
- Удалите `backend/database.db`
- Перезапустите backend

**CORS ошибки**
- Убедитесь, что backend и frontend запущены
- Проверьте CLIENT_URL в `backend/.env`

## 📚 Документация

- [Backend API Docs](./backend/README.md)
- [Frontend Docs](./frontend/README.md)
- [Главный README](./README.md)

## 🎯 Дальше

После успешного запуска:

1. Зарегистрируйте собственный аккаунт на `/register`
2. Изучите функции приложения
3. Попробуйте создать кружок (администратор)
4. Подайте заявку на кружок (студент)
5. Управляйте заявками (преподаватель/администратор)

Удачи! 🚀
