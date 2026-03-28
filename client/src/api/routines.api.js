import api from './axios';

export const routinesApi = {
  getAll: () => api.get('/routines'),
  getById: (id) => api.get(`/routines/${id}`),
  create: (data) => api.post('/routines', data),
  update: (id, data) => api.patch(`/routines/${id}`, data),
  delete: (id) => api.delete(`/routines/${id}`),
  addExercise: (routineId, data) => api.post(`/routines/${routineId}/exercises`, data),
  updateExercise: (routineId, exerciseId, data) => api.patch(`/routines/${routineId}/exercises/${exerciseId}`, data),
  removeExercise: (routineId, exerciseId) => api.delete(`/routines/${routineId}/exercises/${exerciseId}`),
};
