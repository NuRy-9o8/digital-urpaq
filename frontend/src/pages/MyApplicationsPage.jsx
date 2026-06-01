import React, { useState, useEffect } from 'react';
import { applicationsAPI, clubsAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { useNavigate } from 'react-router-dom';
import { CheckCircle, XCircle, Clock } from 'lucide-react';

export const MyApplicationsPage = () => {
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuth();
  const { t } = useLanguage();
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [canceling, setCanceling] = useState(null);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    const fetchApplications = async () => {
      try {
        const res = await applicationsAPI.getMyApplications();
        setApplications(res.data);
      } catch (error) {
        console.error('Error fetching applications:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchApplications();
  }, [isAuthenticated, navigate]);

  const handleCancel = async (appId) => {
    if (!confirm(t.applications.cancelConfirm)) return;

    setCanceling(appId);
    try {
      await applicationsAPI.cancel(appId);
      setApplications(applications.filter(app => app.id !== appId));
      alert(t.applications.canceled);
    } catch (error) {
      alert(t.applications.cancelError);
    } finally {
      setCanceling(null);
    }
  };

  const getStatusBadge = (status) => {
    const badges = {
      'new': <span className="badge badge-info">📋 {t.applications.statuses.new}</span>,
      'pending': <span className="badge badge-warning">⏳ {t.applications.statuses.pending}</span>,
      'approved': <span className="badge badge-success">✓ {t.applications.statuses.approved}</span>,
      'rejected': <span className="badge badge-error">✗ {t.applications.statuses.rejected}</span>
    };
    return badges[status] || <span className="badge">{status}</span>;
  };

  if (loading) {
    return <div className="flex justify-center py-12"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div></div>;
  }

  return (
    <div className="container py-8">
      <h1 className="text-4xl font-bold mb-8">{t.applications.title}</h1>

      {applications.length === 0 ? (
        <div className="card text-center py-12">
          <p className="text-gray-500 text-lg mb-4">{t.applications.noApplications}</p>
          <a href="/clubs" className="btn btn-primary">{t.applications.cta}</a>
        </div>
      ) : (
        <div className="space-y-4">
          {applications.map((app) => (
            <div key={app.id} className="card">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <h3 className="text-xl font-bold">{app.club_name}</h3>
                  <p className="text-gray-600 text-sm">{app.description}</p>
                </div>

                <div className="flex flex-col justify-between">
                  <div>
                    <div className="text-sm text-gray-600 mb-1">{t.applications.statusLabel}</div>
                    {getStatusBadge(app.status)}
                  </div>
                  <div>
                    <div className="text-sm text-gray-600 mb-1">{t.applications.dateLabel}</div>
                    <div className="text-sm">{new Date(app.created_at).toLocaleDateString('ru-RU')}</div>
                  </div>
                </div>

                <div className="flex items-end justify-end">
                  {['new', 'pending'].includes(app.status) && (
                    <button
                      onClick={() => handleCancel(app.id)}
                      disabled={canceling === app.id}
                      className="btn btn-danger"
                    >
                      {canceling === app.id ? t.applications.cancel + '...' : t.applications.cancel}
                    </button>
                  )}
                </div>
              </div>

              {app.comment && (
                <div className="mt-4 pt-4 border-t">
                  <div className="text-sm font-medium text-gray-600 mb-2">{t.applications.commentLabel}</div>
                  <p className="text-gray-700">{app.comment}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
