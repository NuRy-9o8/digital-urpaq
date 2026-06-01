import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || '/api';

export const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  }
});

export const authAPI = {
  register: (data) => apiClient.post('/auth/register', data),
  login: (data) => apiClient.post('/auth/login', data),
  getProfile: () => apiClient.get('/auth/profile'),
  updateProfile: (data) => apiClient.put('/auth/profile', data),
  updateTelegramChatId: (data) => apiClient.put('/auth/profile/telegram', data),
  removeTelegramChatId: () => apiClient.delete('/auth/profile/telegram'),
};

export const clubsAPI = {
  getAll: (params) => apiClient.get('/clubs', { params }),
  getById: (id) => apiClient.get(`/clubs/${id}`),
  create: (data) => apiClient.post('/clubs', data),
  update: (id, data) => apiClient.put(`/clubs/${id}`, data),
  delete: (id) => apiClient.delete(`/clubs/${id}`),
  getStudents: (clubId) => apiClient.get(`/clubs/${clubId}/students`),
  requestOpen: (data) => apiClient.post('/clubs/requests', data)
};

export const applicationsAPI = {
  submit: (data) => apiClient.post('/applications', data),
  getMyApplications: () => apiClient.get('/applications/my-applications'),
  getClubApplications: (clubId) => apiClient.get(`/applications/club/${clubId}`),
  updateStatus: (id, status) => apiClient.put(`/applications/${id}/status`, { status }),
  cancel: (id) => apiClient.delete(`/applications/${id}`)
};

export const academyAPI = {
  submit: (data) => apiClient.post('/academy', data),
  getMyApplications: () => apiClient.get('/academy/my-applications'),
  getAll: () => apiClient.get('/academy'),
  updateStatus: (id, status) => apiClient.put(`/academy/${id}/status`, { status })
};

export const contentAPI = {
  getNews: (type) => apiClient.get('/content/news', { params: { type } }),
  getNewsById: (id) => apiClient.get(`/content/news/${id}`),
  getClubContent: (clubId) => apiClient.get(`/content/content/club/${clubId}`),
  createContent: (data) => apiClient.post('/content/content', data),
  deleteContent: (id) => apiClient.delete(`/content/content/${id}`),
  createNews: (data) => apiClient.post('/content/news', data),
  deleteNews: (id) => apiClient.delete(`/content/news/${id}`)
};

export const adminAPI = {
  getUsers: () => apiClient.get('/admin/users'),
  updateUserRole: (userId, role) => apiClient.put(`/admin/users/${userId}/role`, { role }),
  deleteUser: (userId) => apiClient.delete(`/admin/users/${userId}`),
  getStatistics: () => apiClient.get('/admin/statistics'),
  getApplicationStats: () => apiClient.get('/admin/applications-stats'),
  getClubRequests: () => apiClient.get('/admin/club-requests'),
  updateClubRequestStatus: (requestId, status, note) => apiClient.put(`/admin/club-requests/${requestId}`, { status, admin_note: note })
};

apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    const isAuthAttempt = ['/auth/login', '/auth/register'].some((path) => error.config?.url?.includes(path));

    if (error.response?.status === 401 && !isAuthAttempt) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);
