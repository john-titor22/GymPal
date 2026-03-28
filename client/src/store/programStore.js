import { create } from 'zustand';
import { programsApi } from '../api/programs.api';

export const useProgramStore = create((set, get) => ({
  programs: [],
  currentProgram: null,
  isLoading: false,
  error: null,

  fetchPrograms: async () => {
    set({ isLoading: true, error: null });
    try {
      const { data } = await programsApi.getAll();
      set({ programs: data, isLoading: false });
    } catch (err) {
      set({ error: err.response?.data?.message || 'Failed to load programs', isLoading: false });
    }
  },

  fetchProgramById: async (id) => {
    set({ isLoading: true, error: null });
    try {
      const { data } = await programsApi.getById(id);
      set({ currentProgram: data, isLoading: false });
      return data;
    } catch (err) {
      set({ error: err.response?.data?.message || 'Failed to load program', isLoading: false });
    }
  },

  createProgram: async (data) => {
    const { data: program } = await programsApi.create(data);
    set((s) => ({ programs: [program, ...s.programs] }));
    return program;
  },

  deleteProgram: async (id) => {
    await programsApi.delete(id);
    set((s) => ({ programs: s.programs.filter((p) => p.id !== id) }));
  },

  activateProgram: async (id) => {
    const { data: updated } = await programsApi.activate(id);
    set((s) => ({
      programs: s.programs.map((p) => ({ ...p, isActive: p.id === id })),
      currentProgram: s.currentProgram?.id === id ? { ...s.currentProgram, isActive: true } : s.currentProgram,
    }));
    return updated;
  },

  addWorkoutDay: async (programId, data) => {
    const { data: day } = await programsApi.createDay(programId, data);
    set((s) => ({
      currentProgram: s.currentProgram
        ? { ...s.currentProgram, workoutDays: [...s.currentProgram.workoutDays, day] }
        : null,
    }));
    return day;
  },

  removeWorkoutDay: async (programId, dayId) => {
    await programsApi.deleteDay(programId, dayId);
    set((s) => ({
      currentProgram: s.currentProgram
        ? { ...s.currentProgram, workoutDays: s.currentProgram.workoutDays.filter((d) => d.id !== dayId) }
        : null,
    }));
  },

  addExercise: async (dayId, data) => {
    const { data: exercise } = await programsApi.createExercise(dayId, data);
    set((s) => ({
      currentProgram: s.currentProgram
        ? {
            ...s.currentProgram,
            workoutDays: s.currentProgram.workoutDays.map((d) =>
              d.id === dayId ? { ...d, exercises: [...(d.exercises || []), exercise] } : d
            ),
          }
        : null,
    }));
    return exercise;
  },

  removeExercise: async (dayId, exerciseId) => {
    await programsApi.deleteExercise(exerciseId);
    set((s) => ({
      currentProgram: s.currentProgram
        ? {
            ...s.currentProgram,
            workoutDays: s.currentProgram.workoutDays.map((d) =>
              d.id === dayId ? { ...d, exercises: d.exercises.filter((e) => e.id !== exerciseId) } : d
            ),
          }
        : null,
    }));
  },
}));
