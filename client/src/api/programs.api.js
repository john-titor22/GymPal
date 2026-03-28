import api from './axios';

export const programsApi = {
  getAll: () => api.get('/programs'),
  getById: (id) => api.get(`/programs/${id}`),
  create: (data) => api.post('/programs', data),
  update: (id, data) => api.patch(`/programs/${id}`, data),
  delete: (id) => api.delete(`/programs/${id}`),
  activate: (id) => api.post(`/programs/${id}/activate`),

  createDay: (programId, data) => api.post(`/programs/${programId}/days`, data),
  deleteDay: (programId, dayId) => api.delete(`/programs/${programId}/days/${dayId}`),

  createExercise: (dayId, data) => api.post(`/workout-days/${dayId}/exercises`, data),
  updateExercise: (id, data) => api.patch(`/workout-days/exercises/${id}`, data),
  deleteExercise: (id) => api.delete(`/workout-days/exercises/${id}`),
};
