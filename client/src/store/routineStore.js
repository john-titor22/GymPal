import { create } from 'zustand';
import { routinesApi } from '../api/routines.api';

export const useRoutineStore = create((set) => ({
  routines: [],
  currentRoutine: null,
  isLoading: false,

  fetchRoutines: async () => {
    set({ isLoading: true });
    try {
      const { data } = await routinesApi.getAll();
      set({ routines: data });
    } finally {
      set({ isLoading: false });
    }
  },

  fetchRoutineById: async (id) => {
    set({ isLoading: true });
    try {
      const { data } = await routinesApi.getById(id);
      set({ currentRoutine: data });
    } finally {
      set({ isLoading: false });
    }
  },

  createRoutine: async (data) => {
    const { data: routine } = await routinesApi.create(data);
    set((s) => ({ routines: [routine, ...s.routines] }));
    return routine;
  },

  deleteRoutine: async (id) => {
    await routinesApi.delete(id);
    set((s) => ({ routines: s.routines.filter((r) => r.id !== id) }));
  },

  addExercise: async (routineId, data) => {
    const { data: exercise } = await routinesApi.addExercise(routineId, data);
    set((s) => ({
      currentRoutine: s.currentRoutine
        ? { ...s.currentRoutine, exercises: [...s.currentRoutine.exercises, exercise] }
        : s.currentRoutine,
    }));
    return exercise;
  },

  updateExercise: async (routineId, exerciseId, data) => {
    const { data: exercise } = await routinesApi.updateExercise(routineId, exerciseId, data);
    set((s) => ({
      currentRoutine: s.currentRoutine
        ? { ...s.currentRoutine, exercises: s.currentRoutine.exercises.map((e) => e.id === exerciseId ? exercise : e) }
        : s.currentRoutine,
    }));
    return exercise;
  },

  removeExercise: async (routineId, exerciseId) => {
    await routinesApi.removeExercise(routineId, exerciseId);
    set((s) => ({
      currentRoutine: s.currentRoutine
        ? { ...s.currentRoutine, exercises: s.currentRoutine.exercises.filter((e) => e.id !== exerciseId) }
        : s.currentRoutine,
    }));
  },
}));
