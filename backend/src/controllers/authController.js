import bcrypt from 'bcryptjs';
import { getDatabase } from '../database/init.js';
import { generateToken } from '../middleware/auth.js';
import { notifyAdmins } from '../services/telegramService.js';

export const register = async (req, res) => {
  try {
    const { full_name, password, phone, age } = req.body;
    const email = String(req.body.email || '').trim().toLowerCase();

    if (!full_name || !email || !password) {
      return res.status(400).json({ error: 'Укажите ФИО, email и пароль' });
    }

    if (password.length < 6) {
      return res.status(400).json({ error: 'Пароль должен содержать минимум 6 символов' });
    }

    const db = await getDatabase();

    // Проверка существования пользователя
    db.get('SELECT id FROM users WHERE email = ?', [email], async (err, row) => {
      if (row) {
        return res.status(400).json({ error: 'Пользователь с таким email уже существует' });
      }

      // Хеширование пароля
      const hashedPassword = await bcrypt.hash(password, 10);

      db.run(
        `INSERT INTO users (full_name, email, password, phone, age, role)
         VALUES (?, ?, ?, ?, ?, 'student')`,
        [full_name, email, hashedPassword, phone || null, age || null],
        function (err) {
          if (err) {
            return res.status(500).json({ error: 'Не удалось завершить регистрацию' });
          }

          const user = {
            id: this.lastID,
            email,
            full_name,
            role: 'student'
          };

          const token = generateToken(user);
          res.status(201).json({
            message: 'User registered successfully',
            token,
            user
          });

          notifyAdmins(`Новая регистрация: <b>${full_name}</b> (${email})`).catch((err) => console.error('Telegram notify error:', err));
        }
      );
    });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
};

export const login = async (req, res) => {
  try {
    const email = String(req.body.email || '').trim().toLowerCase();
    const { password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Введите email и пароль' });
    }

    const db = await getDatabase();

    db.get('SELECT * FROM users WHERE email = ?', [email], async (err, user) => {
      if (err || !user) {
        return res.status(401).json({ error: 'Неверный email или пароль' });
      }

      const passwordMatch = await bcrypt.compare(password, user.password);
      if (!passwordMatch) {
        return res.status(401).json({ error: 'Неверный email или пароль' });
      }

      const token = generateToken(user);
      res.json({
        message: 'Login successful',
        token,
        user: {
          id: user.id,
          email: user.email,
          full_name: user.full_name,
          role: user.role,
          phone: user.phone,
          age: user.age
        }
      });
    });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
};

export const getProfile = async (req, res) => {
  try {
    const db = await getDatabase();

    db.get('SELECT id, full_name, email, phone, age, role, telegram_chat_id, created_at FROM users WHERE id = ?', [req.user.id], (err, user) => {
      if (err || !user) {
        return res.status(404).json({ error: 'User not found' });
      }

      res.json(user);
    });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
};

export const updateProfile = async (req, res) => {
  try {
    const { full_name, phone, age } = req.body;
    const db = await getDatabase();

    db.run(
      `UPDATE users SET full_name = ?, phone = ?, age = ?, updated_at = CURRENT_TIMESTAMP
       WHERE id = ?`,
      [full_name || null, phone || null, age || null, req.user.id],
      function (err) {
        if (err) {
          return res.status(500).json({ error: 'Update failed' });
        }

        res.json({ message: 'Profile updated successfully' });
      }
    );
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
};

export const updateTelegramChatId = async (req, res) => {
  try {
    const { telegram_chat_id } = req.body;
    if (!telegram_chat_id) {
      return res.status(400).json({ error: 'telegram_chat_id is required' });
    }

    const db = await getDatabase();

    db.run(
      `UPDATE users SET telegram_chat_id = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?`,
      [telegram_chat_id, req.user.id],
      function (err) {
        if (err || this.changes === 0) {
          return res.status(500).json({ error: 'Failed to update telegram chat id' });
        }

        res.json({ message: 'Telegram subscription updated successfully' });
      }
    );
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
};

export const removeTelegramChatId = async (req, res) => {
  try {
    const db = await getDatabase();

    db.run(
      `UPDATE users SET telegram_chat_id = NULL, updated_at = CURRENT_TIMESTAMP WHERE id = ?`,
      [req.user.id],
      function (err) {
        if (err || this.changes === 0) {
          return res.status(500).json({ error: 'Failed to remove telegram chat id' });
        }

        res.json({ message: 'Telegram subscription removed successfully' });
      }
    );
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
};
