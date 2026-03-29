import api from './axios';

export const sessionsApi = {
  getDashboard: () => api.get('/sessions/dashboard'),
  getAll: (cursor, limit) => api.get('/sessions', { params: { cursor, limit } }),
  getById: (id) => api.get(`/sessions/${id}`),
  start: (routineId) => api.post('/sessions', { routineId }),
  logSet: (sessionId, data) => api.post(`/sessions/${sessionId}/sets`, data),
  complete: (sessionId, notes) => api.post(`/sessions/${sessionId}/complete`, { notes }),
  getCalendar: () => api.get('/sessions/calendar'),
  cancel: (sessionId) => api.delete(`/sessions/${sessionId}`),
};
