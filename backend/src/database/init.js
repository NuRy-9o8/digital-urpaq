import sqlite3 from 'sqlite3';
import { fileURLToPath } from 'url';
import path from 'path';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dbPath = path.resolve(__dirname, '../../database.db');

export const initDatabase = () => {
  return new Promise((resolve, reject) => {
    const db = new sqlite3.Database(dbPath, (err) => {
      if (err) {
        reject(err);
        return;
      }

      db.serialize(() => {
        // Таблица пользователей
        db.run(`
          CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            full_name TEXT NOT NULL,
            email TEXT UNIQUE NOT NULL,
            password TEXT NOT NULL,
            phone TEXT,
            age INTEGER,
            role TEXT CHECK(role IN ('guest', 'student', 'teacher', 'admin')) DEFAULT 'student',
            telegram_chat_id TEXT,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
          )
        `);

        // Добавляем поле telegram_chat_id для существующих таблиц, если оно отсутствует
        db.all("PRAGMA table_info(users)", [], (err, columns) => {
          if (!err && columns && !columns.some((col) => col.name === 'telegram_chat_id')) {
            db.run('ALTER TABLE users ADD COLUMN telegram_chat_id TEXT', (alterErr) => {
              if (alterErr) console.error('Failed to add telegram_chat_id column:', alterErr);
            });
          }
        });

        // Таблица кружков
        db.run(`
          CREATE TABLE IF NOT EXISTS clubs (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            description TEXT,
            direction TEXT,
            age_min INTEGER,
            age_max INTEGER,
            teacher_id INTEGER,
            schedule TEXT,
            location TEXT,
            max_students INTEGER DEFAULT 20,
            current_students INTEGER DEFAULT 0,
            status TEXT CHECK(status IN ('open', 'closed')) DEFAULT 'open',
            image_url TEXT,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (teacher_id) REFERENCES users(id)
          )
        `);

        // Таблица заявок
        db.run(`
          CREATE TABLE IF NOT EXISTS applications (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            student_id INTEGER NOT NULL,
            club_id INTEGER NOT NULL,
            status TEXT CHECK(status IN ('new', 'approved', 'rejected', 'pending')) DEFAULT 'new',
            comment TEXT,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (student_id) REFERENCES users(id),
            FOREIGN KEY (club_id) REFERENCES clubs(id)
          )
        `);

        // Таблица образовательного контента
        db.run(`
          CREATE TABLE IF NOT EXISTS educational_content (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            club_id INTEGER,
            title TEXT NOT NULL,
            content TEXT,
            type TEXT CHECK(type IN ('text', 'video', 'presentation', 'file', 'task', 'material')),
            access_level TEXT CHECK(access_level IN ('public', 'registered', 'club_only')) DEFAULT 'public',
            file_url TEXT,
            created_by INTEGER NOT NULL,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (club_id) REFERENCES clubs(id),
            FOREIGN KEY (created_by) REFERENCES users(id)
          )
        `);

        // Таблица новостей и объявлений
        db.run(`
          CREATE TABLE IF NOT EXISTS news (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            title TEXT NOT NULL,
            content TEXT NOT NULL,
            type TEXT CHECK(type IN ('news', 'announcement', 'banner', 'achievement')) DEFAULT 'news',
            image_url TEXT,
            is_published INTEGER DEFAULT 1,
            created_by INTEGER NOT NULL,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (created_by) REFERENCES users(id)
          )
        `);

        // Таблица для хранения рейтинга/популярности кружков
        db.run(`
          CREATE TABLE IF NOT EXISTS club_stats (
            club_id INTEGER PRIMARY KEY,
            views INTEGER DEFAULT 0,
            applications_count INTEGER DEFAULT 0,
            rating REAL DEFAULT 5.0,
            FOREIGN KEY (club_id) REFERENCES clubs(id)
          )
        `);

        // Таблица запросов на создание нового кружка
        db.run(`
          CREATE TABLE IF NOT EXISTS club_requests (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            teacher_id INTEGER NOT NULL,
            name TEXT NOT NULL,
            description TEXT,
            direction TEXT,
            age_min INTEGER,
            age_max INTEGER,
            schedule TEXT,
            location TEXT,
            max_students INTEGER DEFAULT 20,
            status TEXT CHECK(status IN ('new', 'approved', 'rejected')) DEFAULT 'new',
            club_id INTEGER,
            admin_note TEXT,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (teacher_id) REFERENCES users(id),
            FOREIGN KEY (club_id) REFERENCES clubs(id)
          )
        `);

        db.run(`
          CREATE TABLE IF NOT EXISTS academy_applications (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            student_id INTEGER NOT NULL,
            program TEXT NOT NULL,
            student_name TEXT NOT NULL,
            age INTEGER,
            phone TEXT,
            comment TEXT,
            status TEXT CHECK(status IN ('new', 'approved', 'rejected', 'pending')) DEFAULT 'new',
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (student_id) REFERENCES users(id)
          )
        `);

        console.log('✅ База данных инициализирована успешно');
        resolve(db);
      });
    });
  });
};

export const getDatabase = () => {
  return new Promise((resolve, reject) => {
    const db = new sqlite3.Database(dbPath, (err) => {
      if (err) reject(err);
      else resolve(db);
    });
  });
};
