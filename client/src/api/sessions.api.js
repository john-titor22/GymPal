import api from './axios';

export const sessionsApi = {
  getDashboard: () => api.get('/sessions/dashboard'),
  getAll: (cursor, limit) => api.get('/sessions', { params: { cursor, limit } }),
  getById: (id) => api.get(`/sessions/${id}`),
  start: (workoutDayId) => api.post('/sessions', { workoutDayId }),
  logSet: (sessionId, data) => api.post(`/sessions/${sessionId}/sets`, data),
  complete: (sessionId, notes) => api.post(`/sessions/${sessionId}/complete`, { notes }),
};
