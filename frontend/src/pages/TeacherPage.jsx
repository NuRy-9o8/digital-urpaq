import React, { useState, useEffect } from 'react';
import { clubsAPI, applicationsAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { CheckCircle, XCircle } from 'lucide-react';

export const TeacherPage = () => {
  const navigate = useNavigate();
  const { isAuthenticated, isTeacher, user } = useAuth();
  const [clubs, setClubs] = useState([]);
  const [selectedClub, setSelectedClub] = useState(null);
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(null);
  const [request, setRequest] = useState({
    name: '',
    description: '',
    direction: '',
    age_min: '',
    age_max: '',
    schedule: '',
    location: '',
    max_students: 20
  });
  const [requesting, setRequesting] = useState(false);
  const [requestSuccess, setRequestSuccess] = useState('');

  useEffect(() => {
    if (!isAuthenticated || !isTeacher) {
      navigate('/');
      return;
    }

    const fetchClubs = async () => {
      try {
        const res = await clubsAPI.getAll();
        const myClubs = res.data.filter(club => club.teacher_id === user?.id);
        setClubs(myClubs);
        if (myClubs.length > 0) {
          setSelectedClub(myClubs[0].id);
        }
      } catch (error) {
        console.error('Error fetching clubs:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchClubs();
  }, [isAuthenticated, isTeacher, navigate, user?.id]);

  useEffect(() => {
    if (!selectedClub) return;

    const fetchApplications = async () => {
      try {
        const res = await applicationsAPI.getClubApplications(selectedClub);
        setApplications(res.data);
      } catch (error) {
        console.error('Error fetching applications:', error);
      }
    };

    fetchApplications();
  }, [selectedClub]);

  const handleUpdateStatus = async (appId, status) => {
    setUpdating(appId);
    try {
      await applicationsAPI.updateStatus(appId, status);
      setApplications(applications.map(app =>
        app.id === appId ? { ...app, status } : app
      ));
      alert('Статус обновлен');
    } catch (error) {
      alert('Ошибка при обновлении статуса');
    } finally {
      setUpdating(null);
    }
  };

  const handleRequestSubmit = async () => {
    if (!request.name || !request.direction) {
      alert('Укажите название и направление кружка');
      return;
    }

    setRequesting(true);
    try {
      await clubsAPI.requestOpen({
        name: request.name,
        description: request.description,
        direction: request.direction,
        age_min: request.age_min || null,
        age_max: request.age_max || null,
        schedule: request.schedule,
        location: request.location,
        max_students: request.max_students || 20
      });
      setRequestSuccess('Запрос успешно отправлен. Администратор рассмотрит его в ближайшее время.');
      setRequest({ name: '', description: '', direction: '', age_min: '', age_max: '', schedule: '', location: '', max_students: 20 });
    } catch (error) {
      alert(error.response?.data?.error || 'Ошибка при отправке запроса');
    } finally {
      setRequesting(false);
    }
  };

  if (loading) {
    return <div className="flex justify-center py-12"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div></div>;
  }

  return (
    <div className="container py-8">
      <h1 className="text-4xl font-bold mb-8">👨‍🏫 Кабинет преподавателя</h1>

      {clubs.length === 0 ? (
        <div className="card text-center py-12">
          <p className="text-gray-500 text-lg">У вас нет кружков</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          <div className="lg:col-span-1">
            <div className="card sticky top-4">
              <h3 className="text-lg font-bold mb-4">Мои кружки</h3>
              <div className="space-y-2">
                {clubs.map((club) => (
                  <button
                    key={club.id}
                    onClick={() => setSelectedClub(club.id)}
                    className={`w-full text-left p-3 rounded transition ${
                      selectedClub === club.id
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-100 hover:bg-gray-200'
                    }`}
                  >
                    <div className="font-medium">{club.name}</div>
                    <div className="text-sm opacity-75">
                      {club.current_students}/{club.max_students} студентов
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="lg:col-span-3">
            {selectedClub && (
              <div>
                <h2 className="text-2xl font-bold mb-4">
                  {clubs.find(c => c.id === selectedClub)?.name}
                </h2>

                <div className="card mb-6">
                  <h3 className="text-lg font-bold mb-4">Информация кружка</h3>
                  {(() => {
                    const club = clubs.find(c => c.id === selectedClub);
                    return (
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <div className="text-sm text-gray-600">Студентов</div>
                          <div className="text-2xl font-bold text-blue-600">{club?.current_students}/{club?.max_students}</div>
                        </div>
                        <div>
                          <div className="text-sm text-gray-600">Место</div>
                          <div className="font-medium">{club?.location || '—'}</div>
                        </div>
                        <div>
                          <div className="text-sm text-gray-600">Расписание</div>
                          <div className="font-medium">{club?.schedule || '—'}</div>
                        </div>
                        <div>
                          <div className="text-sm text-gray-600">Статус</div>
                          <span className={`badge ${club?.status === 'open' ? 'badge-success' : 'badge-error'}`}>
                            {club?.status === 'open' ? 'Открыт' : 'Закрыт'}
                          </span>
                        </div>
                      </div>
                    );
                  })()}
                </div>

                <h3 className="text-lg font-bold mb-4">Заявки от студентов</h3>

                {applications.length === 0 ? (
                  <div className="card text-center py-8 text-gray-500">
                    <p>Заявок пока нет</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {applications.map((app) => (
                      <div key={app.id} className="card">
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                          <div>
                            <div className="text-sm font-medium text-gray-600">Студент</div>
                            <div className="font-bold">{app.full_name}</div>
                            <div className="text-sm text-gray-600">{app.email}</div>
                          </div>

                          <div>
                            <div className="text-sm font-medium text-gray-600">Контакт</div>
                            <div className="font-medium">{app.phone || '—'}</div>
                            <div className="text-sm text-gray-600">Возраст: {app.age || '—'}</div>
                          </div>

                          <div>
                            <div className="text-sm font-medium text-gray-600">Статус</div>
                            <span className={`badge ${
                              app.status === 'approved' ? 'badge-success' :
                              app.status === 'rejected' ? 'badge-error' :
                              app.status === 'pending' ? 'badge-warning' :
                              'badge-info'
                            }`}>
                              {app.status === 'approved' ? '✓ Одобрено' :
                               app.status === 'rejected' ? '✗ Отклонено' :
                               app.status === 'pending' ? '⏳ На рассмотрении' :
                               '📋 Новое'}
                            </span>
                          </div>

                          <div className="flex gap-2 items-end">
                            {!['approved', 'rejected'].includes(app.status) && (
                              <>
                                <button
                                  onClick={() => handleUpdateStatus(app.id, 'approved')}
                                  disabled={updating === app.id}
                                  className="btn btn-primary text-sm py-1"
                                >
                                  Одобрить
                                </button>
                                <button
                                  onClick={() => handleUpdateStatus(app.id, 'rejected')}
                                  disabled={updating === app.id}
                                  className="btn btn-danger text-sm py-1"
                                >
                                  Отклонить
                                </button>
                              </>
                            )}
                          </div>
                        </div>

                        {app.comment && (
                          <div className="mt-3 pt-3 border-t">
                            <div className="text-sm font-medium text-gray-600">Комментарий:</div>
                            <p className="text-gray-700">{app.comment}</p>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
                <div className="card mt-8">
                  <h3 className="text-xl font-bold mb-4">Запрос на создание нового кружка</h3>
                  {requestSuccess && (
                    <div className="mb-4 rounded-lg bg-green-50 border border-green-200 p-4 text-green-700">
                      {requestSuccess}
                    </div>
                  )}
                  <div className="grid grid-cols-1 gap-4">
                    <input
                      type="text"
                      placeholder="Название кружка"
                      value={request.name}
                      onChange={(e) => setRequest({ ...request, name: e.target.value })}
                      className="input"
                    />
                    <input
                      type="text"
                      placeholder="Направление"
                      value={request.direction}
                      onChange={(e) => setRequest({ ...request, direction: e.target.value })}
                      className="input"
                    />
                    <textarea
                      placeholder="Описание"
                      value={request.description}
                      onChange={(e) => setRequest({ ...request, description: e.target.value })}
                      className="input h-24"
                    />
                    <div className="grid grid-cols-2 gap-4">
                      <input
                        type="number"
                        placeholder="Мин. возраст"
                        value={request.age_min}
                        onChange={(e) => setRequest({ ...request, age_min: e.target.value })}
                        className="input"
                      />
                      <input
                        type="number"
                        placeholder="Макс. возраст"
                        value={request.age_max}
                        onChange={(e) => setRequest({ ...request, age_max: e.target.value })}
                        className="input"
                      />
                    </div>
                    <input
                      type="text"
                      placeholder="Расписание"
                      value={request.schedule}
                      onChange={(e) => setRequest({ ...request, schedule: e.target.value })}
                      className="input"
                    />
                    <input
                      type="text"
                      placeholder="Место проведения"
                      value={request.location}
                      onChange={(e) => setRequest({ ...request, location: e.target.value })}
                      className="input"
                    />
                    <input
                      type="number"
                      placeholder="Макс. студентов"
                      value={request.max_students}
                      onChange={(e) => setRequest({ ...request, max_students: Number(e.target.value) })}
                      className="input"
                    />
                    <button
                      onClick={handleRequestSubmit}
                      disabled={requesting}
                      className="btn btn-primary w-full"
                    >
                      {requesting ? 'Отправка запроса...' : 'Отправить запрос на кружок'}
                    </button>
                  </div>
                </div>              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
