import api from './axios';

export const scheduleApi = {
  getRange: (from, to) => api.get('/schedule', { params: { from, to } }),
  create:   (data)     => api.post('/schedule', data),
  remove:   (id)       => api.delete(`/schedule/${id}`),
};
