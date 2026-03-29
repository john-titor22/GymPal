import { create } from 'zustand';
import { sessionsApi } from '../api/sessions.api';

export const useSessionStore = create((set) => ({
  activeSession: null,
  dashboard: null,
  calendar: {},
  isLoading: false,

  fetchDashboard: async () => {
    set({ isLoading: true });
    try {
      const { data } = await sessionsApi.getDashboard();
      set({ dashboard: data, isLoading: false });
    } catch {
      set({ isLoading: false });
    }
  },

  fetchCalendar: async () => {
    try {
      const { data } = await sessionsApi.getCalendar();
      set({ calendar: data });
    } catch { /* ignore */ }
  },

  startSession: async (routineId) => {
    const { data: session } = await sessionsApi.start(routineId);
    set({ activeSession: session });
    return session;
  },

  logSet: async (setData) => {
    const sessionId = useSessionStore.getState().activeSession?.id;
    if (!sessionId) return;
    const { data: log } = await sessionsApi.logSet(sessionId, setData);
    set((s) => ({
      activeSession: s.activeSession
        ? { ...s.activeSession, exerciseLogs: [...s.activeSession.exerciseLogs, log] }
        : null,
    }));
    return log;
  },

  completeSession: async (notes) => {
    const sessionId = useSessionStore.getState().activeSession?.id;
    if (!sessionId) throw new Error('No active session');
    const { data: session } = await sessionsApi.complete(sessionId, notes);
    // Clear active session and stale dashboard so it refetches fresh
    set({ activeSession: null, dashboard: null });
    return session;
  },

  cancelSession: async () => {
    const sessionId = useSessionStore.getState().activeSession?.id;
    if (sessionId) {
      try { await sessionsApi.cancel(sessionId); } catch { /* ignore if already gone */ }
    }
    set({ activeSession: null });
  },

  clearSession: () => set({ activeSession: null }),
}));
