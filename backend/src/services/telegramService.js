import TelegramBot from 'node-telegram-bot-api';
import dotenv from 'dotenv';
import { getDatabase } from '../database/init.js';

dotenv.config();

const token = process.env.TELEGRAM_BOT_TOKEN;
const pollingEnabled = process.env.TELEGRAM_POLLING !== 'false';
const adminChatIds = (process.env.TELEGRAM_ADMIN_CHAT_IDS || '')
  .split(',')
  .map((chatId) => chatId.trim())
  .filter(Boolean);

let bot = null;

const escapeHtml = (value = '') =>
  String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;');

const statusLabels = {
  new: 'новая',
  pending: 'на рассмотрении',
  approved: 'одобрена',
  rejected: 'отклонена',
};

const getStatusLabel = (status) => statusLabels[status] || status || 'не указан';

const logError = (context, error) => {
  console.error(`Telegram ${context} error:`, error?.message || error);
};

const getRows = (db, sql, params = []) =>
  new Promise((resolve, reject) => {
    db.all(sql, params, (error, rows) => {
      if (error) reject(error);
      else resolve(rows || []);
    });
  });

const getRow = (db, sql, params = []) =>
  new Promise((resolve, reject) => {
    db.get(sql, params, (error, row) => {
      if (error) reject(error);
      else resolve(row || null);
    });
  });

const withDatabase = async (handler) => {
  const db = await getDatabase();
  try {
    return await handler(db);
  } finally {
    db.close();
  }
};

const createBot = () => {
  if (bot) return bot;

  if (!token) {
    console.warn('Telegram bot token is not configured. Set TELEGRAM_BOT_TOKEN in backend/.env');
    return null;
  }

  bot = new TelegramBot(token, { polling: false });

  bot.onText(/\/start/, (msg) => {
    const welcomeMessage = [
      'Привет! Я бот Digital Urpaq.',
      '',
      'Я отправляю уведомления о событиях из backend:',
      '- новая заявка на кружок',
      '- изменение статуса заявки',
      '- новости школы',
      '- расписание кружков',
      '- анонсы мероприятий',
      '',
      `Ваш chat_id: ${msg.chat.id}`,
      'Сохраните его в личном кабинете, чтобы получать уведомления.',
    ].join('\n');

    bot.sendMessage(msg.chat.id, welcomeMessage, { parse_mode: 'HTML' }).catch((error) => logError('/start', error));
  });

  bot.onText(/\/help/, (msg) => {
    const helpMessage = [
      'Команды бота Digital Urpaq:',
      '/start - приветствие и chat_id',
      '/help - список команд',
      '/news - информация о новостях школы',
      '/schedule - информация о расписании кружков',
      '/events - информация о анонсах мероприятий',
      '',
      'Напишите любое сообщение, и я отвечу "Бот работает".',
    ].join('\n');

    bot.sendMessage(msg.chat.id, helpMessage).catch((error) => logError('/help', error));
  });

  bot.onText(/\/news/, (msg) => {
    bot.sendMessage(msg.chat.id, 'Этот бот уведомит вас о школьных новостях и объявлениях.').catch((error) => logError('/news', error));
  });

  bot.onText(/\/schedule/, (msg) => {
    bot.sendMessage(msg.chat.id, 'Этот бот уведомит вас о расписании кружков и изменениях в расписании.').catch((error) => logError('/schedule', error));
  });

  bot.onText(/\/events/, (msg) => {
    bot.sendMessage(msg.chat.id, 'Этот бот уведомит вас о предстоящих мероприятиях и анонсах.').catch((error) => logError('/events', error));
  });

  bot.on('message', (msg) => {
    if (!msg.text) return;
    const text = msg.text.trim();
    if (text.startsWith('/start') || text.startsWith('/help') || text.startsWith('/news') || text.startsWith('/schedule') || text.startsWith('/events')) {
      return;
    }

    bot.sendMessage(msg.chat.id, 'Бот работает').catch((error) => logError('message reply', error));
  });

  bot.on('polling_error', (error) => {
    logError('polling', error);
  });

  bot.on('webhook_error', (error) => {
    logError('webhook', error);
  });

  if (pollingEnabled) {
    bot.startPolling({ restart: true })
      .then(() => console.log('Telegram bot started in polling mode'))
      .catch((error) => logError('start polling', error));
  } else {
    console.log('Telegram bot created without polling');
  }

  return bot;
};

export const initTelegramBot = () => createBot();

export const sendToUser = async (chatId, text, options = {}) => {
  const telegramBot = createBot();
  if (!telegramBot || !chatId || !text) return null;

  try {
    return await telegramBot.sendMessage(chatId, text, {
      parse_mode: 'HTML',
      disable_web_page_preview: true,
      ...options,
    });
  } catch (error) {
    logError(`send to user ${chatId}`, error);
    return null;
  }
};

export const sendToGroup = async (chatIds, text, options = {}) => {
  const ids = Array.isArray(chatIds) ? chatIds : [chatIds];
  return Promise.all(ids.filter(Boolean).map((chatId) => sendToUser(chatId, text, options)));
};

export const sendNotification = async (recipients, text, options = {}) => {
  if (Array.isArray(recipients)) return sendToGroup(recipients, text, options);
  return sendToUser(recipients, text, options);
};

export const notifyUsersByRole = async (role, message) => {
  return withDatabase(async (db) => {
    const rows = await getRows(
      db,
      'SELECT telegram_chat_id FROM users WHERE role = ? AND telegram_chat_id IS NOT NULL',
      [role]
    );
    return sendToGroup(rows.map((row) => row.telegram_chat_id), message);
  });
};

export const notifyAllUsers = async (message) => {
  return withDatabase(async (db) => {
    const rows = await getRows(db, 'SELECT DISTINCT telegram_chat_id FROM users WHERE telegram_chat_id IS NOT NULL');
    return sendToGroup(rows.map((row) => row.telegram_chat_id), message);
  });
};

export const notifyAllStudents = async (message) => notifyUsersByRole('student', message);

export const notifyAllTeachers = async (message) => notifyUsersByRole('teacher', message);

export const notifyAdmins = async (message) => {
  const deliveries = [];
  if (adminChatIds.length) {
    deliveries.push(...(await sendToGroup(adminChatIds, message)));
  }
  deliveries.push(...(await notifyUsersByRole('admin', message)));
  return deliveries;
};

export const notifyNewApplication = async ({ fullName, clubName, comment } = {}, chatIds = adminChatIds) => {
  const message = [
    '<b>Новая заявка на кружок</b>',
    '',
    `ФИО: ${escapeHtml(fullName || 'не указано')}`,
    `Кружок: ${escapeHtml(clubName || 'не указан')}`,
    `Комментарий: ${escapeHtml(comment || 'нет комментария')}`,
  ].join('\n');

  return sendToGroup(chatIds, message);
};

export const notifyStatusChange = async ({ status, clubName, studentName, applicationId } = {}, chatIds = []) => {
  const message = [
    '<b>Изменение статуса заявки</b>',
    '',
    `ФИО: ${escapeHtml(studentName || 'ученик')}`,
    `Кружок: ${escapeHtml(clubName || 'не указан')}`,
    `Статус: <b>${escapeHtml(getStatusLabel(status))}</b>`,
    `Заявка: ${escapeHtml(applicationId || 'N/A')}`,
  ].join('\n');

  return chatIds.length ? sendToGroup(chatIds, message) : notifyAllUsers(message);
};

export const notifyNews = async ({ title, body, content, date } = {}, chatIds = []) => {
  const message = [
    '<b>Новость школы</b>',
    '',
    `<b>${escapeHtml(title || 'Без заголовка')}</b>`,
    escapeHtml(body || content || ''),
    date ? `\nДата: ${escapeHtml(date)}` : '',
  ].join('\n');

  return chatIds.length ? sendToGroup(chatIds, message) : notifyAllUsers(message);
};

export const notifySchedule = async ({ title, details, date } = {}, chatIds = []) => {
  const message = [
    '<b>Расписание кружков</b>',
    '',
    escapeHtml(title || 'График обновлен'),
    escapeHtml(details || ''),
    date ? `\nДата: ${escapeHtml(date)}` : '',
  ].join('\n');

  return chatIds.length ? sendToGroup(chatIds, message) : notifyAllUsers(message);
};

export const notifyEventAnnouncement = async ({ title, description, date, location } = {}, chatIds = []) => {
  const message = [
    '<b>Анонс мероприятия</b>',
    '',
    `<b>${escapeHtml(title || 'Новое событие')}</b>`,
    escapeHtml(description || ''),
    location ? `\nМесто: ${escapeHtml(location)}` : '',
    date ? `\nДата: ${escapeHtml(date)}` : '',
  ].join('\n');

  return chatIds.length ? sendToGroup(chatIds, message) : notifyAllUsers(message);
};

export const notifyUserById = async (userId, message) => {
  return withDatabase(async (db) => {
    const row = await getRow(
      db,
      'SELECT telegram_chat_id FROM users WHERE id = ? AND telegram_chat_id IS NOT NULL',
      [userId]
    );
    return row?.telegram_chat_id ? sendToUser(row.telegram_chat_id, message) : null;
  });
};

export const notifyClubTeacher = async (clubId, message) => {
  return withDatabase(async (db) => {
    const row = await getRow(
      db,
      'SELECT u.telegram_chat_id FROM users u JOIN clubs c ON c.teacher_id = u.id WHERE c.id = ? AND u.telegram_chat_id IS NOT NULL',
      [clubId]
    );
    return row?.telegram_chat_id ? sendToUser(row.telegram_chat_id, message) : null;
  });
};

export const notifyClubStudents = async (clubId, message) => {
  return withDatabase(async (db) => {
    const rows = await getRows(
      db,
      `SELECT DISTINCT u.telegram_chat_id
       FROM users u
       JOIN applications a ON u.id = a.student_id
       WHERE a.club_id = ? AND a.status = 'approved' AND u.telegram_chat_id IS NOT NULL`,
      [clubId]
    );
    return sendToGroup(rows.map((row) => row.telegram_chat_id), message);
  });
};
