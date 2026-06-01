import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { clubsAPI, applicationsAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { MapPin, Users, Calendar, Star } from 'lucide-react';

export const ClubDetailPage = () => {
  const { id } = useParams();
  const { isAuthenticated, user } = useAuth();
  const { t } = useLanguage();
  const [club, setClub] = useState(null);
  const [loading, setLoading] = useState(true);
  const [applying, setApplying] = useState(false);
  const [applied, setApplied] = useState(false);
  const [comment, setComment] = useState('');
  const isFull = club ? club.current_students >= club.max_students : false;

  useEffect(() => {
    const fetchClub = async () => {
      try {
        const res = await clubsAPI.getById(id);
        setClub(res.data);
      } catch (error) {
        console.error('Error fetching club:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchClub();
  }, [id]);

  const handleApply = async () => {
    if (!isAuthenticated) {
      alert(t.clubDetail.loginToApply);
      return;
    }

    setApplying(true);
    try {
      await applicationsAPI.submit({
        club_id: club.id,
        comment: comment || null
      });
      setApplied(true);
      alert(t.clubDetail.applyingButton);
    } catch (error) {
      alert(error.response?.data?.error || 'Ошибка при подаче заявки');
    } finally {
      setApplying(false);
    }
  };

  if (loading) {
    return <div className="flex justify-center py-12"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div></div>;
  }

  if (!club) {
    return <div className="text-center py-12 text-gray-500">{t.clubDetail.descriptionTitle || 'Кружок не найден'}</div>;
  }

  return (
    <div className="container py-8">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          {club.image_url && (
            <img src={club.image_url} alt={club.name} className="w-full h-96 object-cover rounded-lg mb-6" />
          )}
          
          <h1 className="text-4xl font-bold mb-4">{club.name}</h1>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className="card">
              <div className="text-2xl font-bold text-blue-600">{club.max_students}</div>
              <div className="text-sm text-gray-600">{t.clubDetail.placesLabel}</div>
            </div>
            <div className="card">
              <div className="text-2xl font-bold text-green-600">{club.current_students}</div>
              <div className="text-sm text-gray-600">{t.clubDetail.registeredLabel}</div>
            </div>
            {club.rating && (
              <div className="card">
                <div className="text-2xl font-bold text-yellow-600">{club.rating.toFixed(1)}</div>
                <div className="text-sm text-gray-600">{t.clubDetail.ratingLabel}</div>
              </div>
            )}
            {club.views && (
              <div className="card">
                <div className="text-2xl font-bold text-purple-600">{club.views}</div>
                <div className="text-sm text-gray-600">{t.clubDetail.viewsLabel}</div>
              </div>
            )}
          </div>

          <div className="card mb-6">
            <h2 className="text-2xl font-bold mb-4">{t.clubDetail.descriptionTitle}</h2>
            <p className="text-gray-700 mb-4">{club.description}</p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {club.location && (
                <div className="flex items-start gap-3">
                  <MapPin className="text-red-500 flex-shrink-0" />
                  <div>
                    <div className="font-medium">{t.clubDetail.venueLabel}</div>
                    <div className="text-gray-600">{club.location}</div>
                  </div>
                </div>
              )}
              {club.schedule && (
                <div className="flex items-start gap-3">
                  <Calendar className="text-blue-500 flex-shrink-0" />
                  <div>
                    <div className="font-medium">{t.clubDetail.scheduleLabel}</div>
                    <div className="text-gray-600">{club.schedule}</div>
                  </div>
                </div>
              )}
              {club.direction && (
                <div className="font-medium">
                  {t.clubDetail.directionLabel}: <span className="text-blue-600">{club.direction}</span>
                </div>
              )}
              {club.age_min && (
                <div className="font-medium">
                  {t.clubDetail.ageLabel}: <span className="text-blue-600">{club.age_min}-{club.age_max || '∞'} лет</span>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="lg:col-span-1">
          <div className="card sticky top-4">
            <h3 className="text-2xl font-bold mb-4">{t.clubDetail.infoTitle}</h3>

            {club.teacher_name && (
              <div className="mb-4">
                <div className="text-sm text-gray-600">{t.clubDetail.teacherLabel}</div>
                <div className="font-medium">{club.teacher_name}</div>
              </div>
            )}

            <div className="mb-4">
              <div className="text-sm text-gray-600">{t.clubDetail.statusLabel}</div>
              <span className={`badge ${club.status === 'open' ? 'badge-success' : 'badge-error'}`}>
                {club.status === 'open' ? t.clubDetail.statusOpen : t.clubDetail.statusClosed}
              </span>
            </div>

            <div className="mb-6">
              <div className="text-sm text-gray-600 mb-2">{t.clubDetail.spotsLabel}</div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-blue-600 h-2 rounded-full transition-all"
                  style={{ width: `${(club.current_students / club.max_students) * 100}%` }}
                ></div>
              </div>
              <div className="text-sm text-gray-600 mt-2">
                {club.max_students - club.current_students} из {club.max_students} мест
              </div>
            </div>

            {isAuthenticated && user?.role === 'student' ? (
              <div>
                <div className="mb-3">
                  <label className="block text-sm font-medium mb-2">{t.clubDetail.commentLabel}</label>
                  <textarea
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    className="input text-sm"
                    rows="3"
                    placeholder={t.clubDetail.commentPlaceholder}
                  />
                </div>
                {club.status === 'closed' || isFull ? (
                  <div className="rounded-lg bg-red-50 border border-red-200 p-4 text-red-700 mb-4">
                    {t.clubDetail.closedMessage}
                  </div>
                ) : null}
                <button
                  onClick={handleApply}
                  disabled={applying || applied || club.status === 'closed' || isFull}
                  className="btn btn-primary w-full"
                >
                  {applied ? t.clubDetail.appliedButton : applying ? t.clubDetail.applyingButton : t.clubDetail.applyButton}
                </button>
              </div>
            ) : isAuthenticated ? (
              <div className="text-center text-gray-500 p-4 bg-gray-50 rounded">
                {t.clubDetail.studentOnly}
              </div>
            ) : (
              <a href="/login" className="btn btn-primary w-full text-center">
                {t.clubDetail.loginToApply}
              </a>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
