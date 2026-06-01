import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { authAPI } from '../services/api.js';
import { useAuth } from '../context/AuthContext.jsx';

export const ProfilePage = () => {
  const navigate = useNavigate();
  const { isAuthenticated, user, updateProfile } = useAuth();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [telegramSaving, setTelegramSaving] = useState(false);
  const [feedback, setFeedback] = useState('');

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    const fetchProfile = async () => {
      try {
        const response = await authAPI.getProfile();
        setProfile(response.data);
      } catch (error) {
        console.error('Failed to load profile:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [isAuthenticated, navigate]);

  const handleChange = (key, value) => {
    setProfile((prevProfile) => ({ ...prevProfile, [key]: value }));
  };

  const handleSaveProfile = async () => {
    if (!profile) return;

    setSaving(true);
    const result = await updateProfile({
      full_name: profile.full_name,
      phone: profile.phone,
      age: profile.age,
    });

    if (result.success) {
      setFeedback('Профиль сохранен.');
    } else {
      setFeedback(result.error || 'Ошибка при сохранении профиля.');
    }
    setSaving(false);
  };

  const handleSaveTelegram = async () => {
    if (!profile?.telegram_chat_id) {
      setFeedback('Укажите chat_id, чтобы сохранить подписку.');
      return;
    }

    setTelegramSaving(true);
    try {
      await authAPI.updateTelegramChatId({ telegram_chat_id: profile.telegram_chat_id });
      setFeedback('Telegram chat_id сохранен. Уведомления будут приходить в Telegram.');
    } catch (error) {
      setFeedback('Ошибка при сохранении Telegram chat_id.');
      console.error(error);
    } finally {
      setTelegramSaving(false);
    }
  };

  const handleRemoveTelegram = async () => {
    setTelegramSaving(true);
    try {
      await authAPI.removeTelegramChatId();
      setProfile((prev) => ({ ...prev, telegram_chat_id: null }));
      setFeedback('Подписка на Telegram уведомления отключена.');
    } catch (error) {
      setFeedback('Ошибка при удалении Telegram chat_id.');
      console.error(error);
    } finally {
      setTelegramSaving(false);
    }
  };

  if (loading || !profile) {
    return (
      <div className="flex justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="container py-8">
      <div className="max-w-3xl space-y-6">
        <div className="space-y-2">
          <h1 className="text-4xl font-bold">Личный кабинет</h1>
          <p className="text-slate-600">Здесь вы можете обновить профиль и подключить Telegram для уведомлений.</p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <label className="block">
            <span className="text-sm font-semibold text-slate-700">Email</span>
            <input type="email" value={profile.email || ''} disabled className="mt-2 w-full rounded-xl border border-slate-200 bg-slate-100 px-4 py-3 text-sm text-slate-700" />
          </label>

          <label className="block">
            <span className="text-sm font-semibold text-slate-700">Роль</span>
            <input type="text" value={profile.role || ''} disabled className="mt-2 w-full rounded-xl border border-slate-200 bg-slate-100 px-4 py-3 text-sm text-slate-700" />
          </label>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <label className="block">
            <span className="text-sm font-semibold text-slate-700">ФИО</span>
            <input
              type="text"
              value={profile.full_name || ''}
              onChange={(event) => handleChange('full_name', event.target.value)}
              className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 text-sm"
            />
          </label>

          <label className="block">
            <span className="text-sm font-semibold text-slate-700">Телефон</span>
            <input
              type="text"
              value={profile.phone || ''}
              onChange={(event) => handleChange('phone', event.target.value)}
              className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 text-sm"
            />
          </label>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <label className="block">
            <span className="text-sm font-semibold text-slate-700">Возраст</span>
            <input
              type="number"
              value={profile.age || ''}
              onChange={(event) => handleChange('age', event.target.value)}
              className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 text-sm"
            />
          </label>

          <label className="block">
            <span className="text-sm font-semibold text-slate-700">Telegram chat_id</span>
            <input
              type="text"
              value={profile.telegram_chat_id || ''}
              onChange={(event) => handleChange('telegram_chat_id', event.target.value)}
              className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 text-sm"
              placeholder="Введите chat_id, полученный от бота"
            />
          </label>
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <button
            onClick={handleSaveProfile}
            disabled={saving}
            className="btn btn-primary min-h-12 rounded-xl px-4 text-white"
          >
            {saving ? 'Сохранение...' : 'Сохранить профиль'}
          </button>

          <button
            onClick={handleSaveTelegram}
            disabled={telegramSaving}
            className="btn btn-secondary min-h-12 rounded-xl px-4"
          >
            {telegramSaving ? 'Сохранение...' : 'Сохранить Telegram'}
          </button>

          <button
            onClick={handleRemoveTelegram}
            disabled={telegramSaving}
            className="btn btn-outline min-h-12 rounded-xl px-4 text-slate-700"
          >
            Отключить Telegram
          </button>
        </div>

        {feedback && <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700">{feedback}</div>}

        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-xl font-semibold mb-3">Как подключить Telegram</h2>
          <ol className="list-decimal space-y-2 pl-5 text-slate-600">
            <li>Откройте чат с ботом в Telegram.</li>
            <li>Отправьте команду <strong>/start</strong>.</li>
            <li>Скопируйте свой <strong>chat_id</strong> из сообщения бота.</li>
            <li>Вставьте chat_id в это поле и нажмите «Сохранить Telegram».</li>
          </ol>
        </div>
      </div>
    </div>
  );
};
