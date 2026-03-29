import { create } from 'zustand';
import { sessionsApi } from '../api/sessions.api';

function buildCalendarFromSessions(sessions) {
  const sixMonthsAgo = new Date();
  sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
  const calendar = {};
  (sessions || []).forEach((s) => {
    if (!s.completedAt) return;
    const started = new Date(s.startedAt);
    if (started < sixMonthsAgo) return;
    const key = [
      started.getFullYear(),
      String(started.getMonth() + 1).padStart(2, '0'),
      String(started.getDate()).padStart(2, '0'),
    ].join('-');
    const mins = Math.max(1, Math.round((new Date(s.completedAt) - started) / 60000));
    calendar[key] = (calendar[key] || 0) + mins;
  });
  return calendar;
}

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
      // Fetch all sessions and build calendar client-side — no dependency on the
      // /calendar server endpoint which had unreliable filtering
      const { data } = await sessionsApi.getAll(undefined, 500);
      set({ calendar: buildCalendarFromSessions(data.sessions) });
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
    set({ activeSession: null, dashboard: null });
    // Rebuild calendar from sessions after completion
    useSessionStore.getState().fetchCalendar();
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
