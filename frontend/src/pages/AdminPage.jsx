import React, { useState, useEffect } from 'react';
import { adminAPI, clubsAPI, contentAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Users, BookOpen, ClipboardList, TrendingUp, Newspaper } from 'lucide-react';

const emptyClub = {
  name: '',
  direction: '',
  description: '',
  age_min: '',
  age_max: '',
  schedule: '',
  location: '',
  max_students: 20
};

const emptyNews = {
  title: '',
  content: '',
  type: 'news',
  image_url: ''
};

export const AdminPage = () => {
  const navigate = useNavigate();
  const { isAuthenticated, isAdmin } = useAuth();
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [clubs, setClubs] = useState([]);
  const [news, setNews] = useState([]);
  const [allApplications, setAllApplications] = useState([]);
  const [requests, setRequests] = useState([]);
  const [tab, setTab] = useState('statistics');
  const [loading, setLoading] = useState(true);
  const [requestLoading, setRequestLoading] = useState(false);
  const [manualClub, setManualClub] = useState(emptyClub);
  const [manualSuccess, setManualSuccess] = useState('');
  const [newsForm, setNewsForm] = useState(emptyNews);
  const [newsSuccess, setNewsSuccess] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    if (!isAuthenticated || !isAdmin) {
      navigate('/');
      return;
    }

    const fetchData = async () => {
      try {
        const [statsRes, usersRes, appStatsRes, requestsRes, clubsRes, newsRes] = await Promise.all([
          adminAPI.getStatistics(),
          adminAPI.getUsers(),
          adminAPI.getApplicationStats(),
          adminAPI.getClubRequests(),
          clubsAPI.getAll(),
          contentAPI.getNews()
        ]);

        setStats(statsRes.data);
        setUsers(usersRes.data);
        setAllApplications(appStatsRes.data);
        setRequests(requestsRes.data);
        setClubs(clubsRes.data);
        setNews(newsRes.data);
      } catch (error) {
        console.error('Error fetching admin data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [isAuthenticated, isAdmin, navigate]);

  const refreshData = async () => {
    try {
      const [usersRes, requestsRes, clubsRes, newsRes, statsRes, appStatsRes] = await Promise.all([
        adminAPI.getUsers(),
        adminAPI.getClubRequests(),
        clubsAPI.getAll(),
        contentAPI.getNews(),
        adminAPI.getStatistics(),
        adminAPI.getApplicationStats()
      ]);
      setUsers(usersRes.data);
      setRequests(requestsRes.data);
      setClubs(clubsRes.data);
      setNews(newsRes.data);
      setStats(statsRes.data);
      setAllApplications(appStatsRes.data);
    } catch (error) {
      console.error('Error refreshing admin data:', error);
    }
  };

  const handleRequestStatus = async (id, status) => {
    setRequestLoading(true);
    try {
      await adminAPI.updateClubRequestStatus(id, status, status === 'rejected' ? 'Отклонено администратором' : 'Одобрено администратором');
      setRequests(requests.map((r) => (r.id === id ? { ...r, status } : r)));
      alert('Статус запроса обновлен');
      await refreshData();
    } catch (error) {
      alert(error.response?.data?.error || 'Ошибка при обновлении запроса');
    } finally {
      setRequestLoading(false);
    }
  };

  const handleManualCreate = async () => {
    if (!manualClub.name || !manualClub.direction) {
      alert('Укажите название и направление');
      return;
    }

    setActionLoading(true);
    try {
      await clubsAPI.create({
        name: manualClub.name,
        description: manualClub.description,
        direction: manualClub.direction,
        age_min: manualClub.age_min || null,
        age_max: manualClub.age_max || null,
        schedule: manualClub.schedule,
        location: manualClub.location,
        max_students: manualClub.max_students || 20
      });
      setManualSuccess('Клуб успешно создан вручную.');
      setManualClub(emptyClub);
      await refreshData();
    } catch (error) {
      alert(error.response?.data?.error || 'Ошибка при создании клуба');
    } finally {
      setActionLoading(false);
    }
  };

  const handleCreateNews = async () => {
    if (!newsForm.title || !newsForm.content) {
      alert('Укажите заголовок и содержание новости');
      return;
    }

    setActionLoading(true);
    try {
      await contentAPI.createNews(newsForm);
      setNewsSuccess('Новость успешно опубликована.');
      setNewsForm(emptyNews);
      await refreshData();
    } catch (error) {
      alert(error.response?.data?.error || 'Ошибка при публикации новости');
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteNews = async (newsId) => {
    if (!window.confirm('Удалить новость?')) return;
    setActionLoading(true);
    try {
      await contentAPI.deleteNews(newsId);
      setNews(news.filter((item) => item.id !== newsId));
    } catch (error) {
      alert(error.response?.data?.error || 'Ошибка при удалении новости');
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteClub = async (clubId) => {
    if (!window.confirm('Удалить клуб?')) return;
    setActionLoading(true);
    try {
      await clubsAPI.delete(clubId);
      setClubs(clubs.filter((club) => club.id !== clubId));
      await refreshData();
    } catch (error) {
      alert(error.response?.data?.error || 'Ошибка при удалении клуба');
    } finally {
      setActionLoading(false);
    }
  };

  const handleUserRoleChange = async (userId, role) => {
    setActionLoading(true);
    try {
      await adminAPI.updateUserRole(userId, role);
      setUsers(users.map((user) => (user.id === userId ? { ...user, role } : user)));
    } catch (error) {
      alert(error.response?.data?.error || 'Ошибка при смене роли');
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteUser = async (userId) => {
    if (!window.confirm('Удалить пользователя?')) return;
    setActionLoading(true);
    try {
      await adminAPI.deleteUser(userId);
      setUsers(users.filter((user) => user.id !== userId));
    } catch (error) {
      alert(error.response?.data?.error || 'Ошибка при удалении пользователя');
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return <div className="flex justify-center py-12"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div></div>;
  }

  return (
    <div className="container py-8">
      <h1 className="text-4xl font-bold mb-8">📊 Админ-панель</h1>

      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="card bg-gradient-to-br from-blue-50 to-blue-100">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-gray-600 text-sm">Пользователей</div>
                <div className="text-3xl font-bold text-blue-600">{stats.total_users}</div>
              </div>
              <Users size={32} className="text-blue-600 opacity-20" />
            </div>
          </div>

          <div className="card bg-gradient-to-br from-green-50 to-green-100">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-gray-600 text-sm">Кружков</div>
                <div className="text-3xl font-bold text-green-600">{stats.total_clubs}</div>
              </div>
              <BookOpen size={32} className="text-green-600 opacity-20" />
            </div>
          </div>

          <div className="card bg-gradient-to-br from-purple-50 to-purple-100">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-gray-600 text-sm">Всего заявок</div>
                <div className="text-3xl font-bold text-purple-600">{stats.total_applications}</div>
              </div>
              <ClipboardList size={32} className="text-purple-600 opacity-20" />
            </div>
          </div>

          <div className="card bg-gradient-to-br from-orange-50 to-orange-100">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-gray-600 text-sm">Одобрено</div>
                <div className="text-3xl font-bold text-orange-600">{stats.approved_applications}</div>
              </div>
              <TrendingUp size={32} className="text-orange-600 opacity-20" />
            </div>
          </div>
        </div>
      )}

      <div className="flex flex-wrap gap-4 mb-8 border-b">
        {['statistics', 'users', 'clubs', 'requests', 'news'].map((tabKey) => (
          <button
            key={tabKey}
            onClick={() => setTab(tabKey)}
            className={`px-4 py-2 font-medium border-b-2 transition ${
              tab === tabKey ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-600 hover:text-gray-900'
            }`}
          >
            {tabKey === 'statistics' && 'Статистика'}
            {tabKey === 'users' && `Пользователи (${users.length})`}
            {tabKey === 'clubs' && `Клубы (${clubs.length})`}
            {tabKey === 'requests' && `Запросы (${requests.filter((r) => r.status === 'new').length})`}
            {tabKey === 'news' && `Новости (${news.length})`}
          </button>
        ))}
      </div>

      {tab === 'statistics' && (
        <div className="space-y-4">
          <h2 className="text-2xl font-bold mb-4">Статистика по кружкам</h2>
          {allApplications.length === 0 ? (
            <div className="card text-center py-8 text-gray-500">Заявок пока нет</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b-2 border-gray-300">
                    <th className="text-left py-3 px-4 font-bold">Кружок</th>
                    <th className="text-center py-3 px-4 font-bold">Всего</th>
                    <th className="text-center py-3 px-4 font-bold badge-success">✓ Одобрено</th>
                    <th className="text-center py-3 px-4 font-bold badge-error">✗ Отклонено</th>
                    <th className="text-center py-3 px-4 font-bold badge-info">📋 Новых</th>
                    <th className="text-center py-3 px-4 font-bold badge-warning">⏳ На рассмотрении</th>
                  </tr>
                </thead>
                <tbody>
                  {allApplications.map((app) => (
                    <tr key={app.id} className="border-b hover:bg-gray-50">
                      <td className="py-3 px-4 font-medium">{app.name}</td>
                      <td className="py-3 px-4 text-center">{app.total_applications || 0}</td>
                      <td className="py-3 px-4 text-center text-green-600 font-bold">{app.approved || 0}</td>
                      <td className="py-3 px-4 text-center text-red-600 font-bold">{app.rejected || 0}</td>
                      <td className="py-3 px-4 text-center text-blue-600 font-bold">{app.new || 0}</td>
                      <td className="py-3 px-4 text-center text-orange-600 font-bold">{app.pending || 0}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {tab === 'users' && (
        <div>
          <h2 className="text-2xl font-bold mb-4">Пользователи</h2>
          {users.length === 0 ? (
            <div className="card text-center py-8 text-gray-500">Пользователей не найдено</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b-2 border-gray-300">
                    <th className="text-left py-3 px-4 font-bold">ФИО</th>
                    <th className="text-left py-3 px-4 font-bold">Email</th>
                    <th className="text-left py-3 px-4 font-bold">Роль</th>
                    <th className="text-left py-3 px-4 font-bold">Возраст</th>
                    <th className="text-left py-3 px-4 font-bold">Дата регистрации</th>
                    <th className="text-left py-3 px-4 font-bold">Действия</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((userRow) => (
                    <tr key={userRow.id} className="border-b hover:bg-gray-50">
                      <td className="py-3 px-4 font-medium">{userRow.full_name}</td>
                      <td className="py-3 px-4 text-sm text-gray-600">{userRow.email}</td>
                      <td className="py-3 px-4">
                        <select
                          value={userRow.role}
                          onChange={(e) => handleUserRoleChange(userRow.id, e.target.value)}
                          className="input rounded-lg"
                        >
                          <option value="student">Студент</option>
                          <option value="teacher">Преподаватель</option>
                          <option value="admin">Администратор</option>
                        </select>
                      </td>
                      <td className="py-3 px-4">{userRow.age || '—'}</td>
                      <td className="py-3 px-4 text-sm text-gray-600">
                        {new Date(userRow.created_at).toLocaleDateString('ru-RU')}
                      </td>
                      <td className="py-3 px-4">
                        <button
                          onClick={() => handleDeleteUser(userRow.id)}
                          disabled={actionLoading}
                          className="btn btn-danger btn-sm"
                        >
                          Удалить
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {tab === 'clubs' && (
        <div>
          <h2 className="text-2xl font-bold mb-4">Клубы</h2>
          {clubs.length === 0 ? (
            <div className="card text-center py-8 text-gray-500">Клубы не найдены</div>
          ) : (
            <div className="space-y-4">
              {clubs.map((club) => (
                <div key={club.id} className="card">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <div className="text-sm text-gray-600">Название</div>
                      <div className="font-bold">{club.name}</div>
                      <div className="text-sm text-gray-600">{club.direction}</div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-600">Преподаватель</div>
                      <div className="font-medium">{club.teacher_name || '—'}</div>
                      <div className="text-sm text-gray-600">{club.location || '—'}</div>
                    </div>
                    <div className="flex flex-col justify-between gap-3">
                      <div>
                        <span className={`badge ${club.status === 'open' ? 'badge-success' : 'badge-error'}`}>
                          {club.status === 'open' ? 'Открыт' : 'Закрыт'}
                        </span>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleDeleteClub(club.id)}
                          disabled={actionLoading}
                          className="btn btn-danger btn-sm"
                        >
                          Удалить клуб
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {tab === 'requests' && (
        <div className="space-y-6">
          <div>
            <h2 className="text-2xl font-bold mb-4">Запросы на создание кружков</h2>
            {requests.length === 0 ? (
              <div className="card text-center py-8 text-gray-500">Нет новых запросов</div>
            ) : (
              <div className="space-y-4">
                {requests.map((requestItem) => (
                  <div key={requestItem.id} className="card">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <div className="text-sm text-gray-600">Название</div>
                        <div className="font-bold">{requestItem.name}</div>
                        <div className="text-sm text-gray-600 mt-2">{requestItem.direction}</div>
                      </div>

                      <div>
                        <div className="text-sm text-gray-600">Преподаватель</div>
                        <div className="font-medium">{requestItem.teacher_name}</div>
                        <div className="text-sm text-gray-600">{requestItem.teacher_email}</div>
                      </div>

                      <div className="flex flex-col justify-between gap-3">
                        <div>
                          <span className={`badge ${requestItem.status === 'new' ? 'badge-info' : requestItem.status === 'approved' ? 'badge-success' : 'badge-error'}`}>
                            {requestItem.status === 'new' ? 'Новый' : requestItem.status === 'approved' ? 'Одобрен' : 'Отклонен'}
                          </span>
                        </div>
                        <div className="flex gap-2">
                          {requestItem.status === 'new' && (
                            <>
                              <button
                                onClick={() => handleRequestStatus(requestItem.id, 'approved')}
                                disabled={requestLoading}
                                className="btn btn-primary btn-sm"
                              >
                                Одобрить
                              </button>
                              <button
                                onClick={() => handleRequestStatus(requestItem.id, 'rejected')}
                                disabled={requestLoading}
                                className="btn btn-danger btn-sm"
                              >
                                Отклонить
                              </button>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                    {requestItem.description && (
                      <div className="mt-4 text-gray-700">
                        <div className="text-sm font-medium text-gray-600">Описание</div>
                        <p>{requestItem.description}</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="card">
            <h3 className="text-xl font-bold mb-4">Создать клуб вручную</h3>
            {manualSuccess && (
              <div className="mb-4 rounded-lg bg-green-50 border border-green-200 p-4 text-green-700">
                {manualSuccess}
              </div>
            )}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <input
                type="text"
                placeholder="Название клуба"
                value={manualClub.name}
                onChange={(e) => setManualClub({ ...manualClub, name: e.target.value })}
                className="input"
              />
              <input
                type="text"
                placeholder="Направление"
                value={manualClub.direction}
                onChange={(e) => setManualClub({ ...manualClub, direction: e.target.value })}
                className="input"
              />
              <textarea
                placeholder="Описание"
                value={manualClub.description}
                onChange={(e) => setManualClub({ ...manualClub, description: e.target.value })}
                className="input h-24 lg:col-span-2"
              />
              <input
                type="number"
                placeholder="Мин. возраст"
                value={manualClub.age_min}
                onChange={(e) => setManualClub({ ...manualClub, age_min: e.target.value })}
                className="input"
              />
              <input
                type="number"
                placeholder="Макс. возраст"
                value={manualClub.age_max}
                onChange={(e) => setManualClub({ ...manualClub, age_max: e.target.value })}
                className="input"
              />
              <input
                type="text"
                placeholder="Расписание"
                value={manualClub.schedule}
                onChange={(e) => setManualClub({ ...manualClub, schedule: e.target.value })}
                className="input"
              />
              <input
                type="text"
                placeholder="Локация"
                value={manualClub.location}
                onChange={(e) => setManualClub({ ...manualClub, location: e.target.value })}
                className="input"
              />
              <input
                type="number"
                placeholder="Макс. студентов"
                value={manualClub.max_students}
                onChange={(e) => setManualClub({ ...manualClub, max_students: Number(e.target.value) })}
                className="input"
              />
            </div>
            <button onClick={handleManualCreate} className="btn btn-primary mt-4" disabled={actionLoading}>
              Создать клуб вручную
            </button>
          </div>
        </div>
      )}

      {tab === 'news' && (
        <div className="space-y-6">
          <div className="card">
            <div className="flex items-center gap-3 mb-4">
              <Newspaper size={24} className="text-blue-600" />
              <h2 className="text-2xl font-bold">Управление новостями</h2>
            </div>
            {newsSuccess && (
              <div className="mb-4 rounded-lg bg-green-50 border border-green-200 p-4 text-green-700">
                {newsSuccess}
              </div>
            )}
            <div className="grid grid-cols-1 gap-4">
              <input
                type="text"
                placeholder="Заголовок новости"
                value={newsForm.title}
                onChange={(e) => setNewsForm({ ...newsForm, title: e.target.value })}
                className="input"
              />
              <textarea
                placeholder="Текст новости"
                value={newsForm.content}
                onChange={(e) => setNewsForm({ ...newsForm, content: e.target.value })}
                className="input h-32"
              />
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <select
                  value={newsForm.type}
                  onChange={(e) => setNewsForm({ ...newsForm, type: e.target.value })}
                  className="input"
                >
                  <option value="news">Новость</option>
                  <option value="announcement">Объявление</option>
                  <option value="achievement">Достижение</option>
                </select>
                <input
                  type="text"
                  placeholder="URL изображения (необязательно)"
                  value={newsForm.image_url}
                  onChange={(e) => setNewsForm({ ...newsForm, image_url: e.target.value })}
                  className="input"
                />
              </div>
              <button
                onClick={handleCreateNews}
                className="btn btn-primary w-full"
                disabled={actionLoading}
              >
                Опубликовать новость
              </button>
            </div>
          </div>

          <div>
            <h3 className="text-2xl font-bold mb-4">Список новостей</h3>
            {news.length === 0 ? (
              <div className="card text-center py-8 text-gray-500">Пока нет новостей</div>
            ) : (
              <div className="space-y-4">
                {news.map((item) => (
                  <div key={item.id} className="card">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
                      <div>
                        <div className="text-sm text-gray-600">Заголовок</div>
                        <div className="font-bold">{item.title}</div>
                      </div>
                      <div>
                        <div className="text-sm text-gray-600">Тип</div>
                        <div className="font-medium capitalize">{item.type}</div>
                      </div>
                      <div className="flex gap-2 justify-end">
                        <button
                          onClick={() => handleDeleteNews(item.id)}
                          disabled={actionLoading}
                          className="btn btn-danger btn-sm"
                        >
                          Удалить
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
