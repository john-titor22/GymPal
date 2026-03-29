const prisma = require('../lib/prisma');
const { AppError } = require('../middleware/error.middleware');

async function startSession(userId, routineId) {
  const routine = await prisma.routine.findFirst({
    where: { id: routineId, userId },
    include: { exercises: { orderBy: { order: 'asc' } } },
  });
  if (!routine) throw new AppError('Routine not found', 404);

  const session = await prisma.workoutSession.create({
    data: { userId, routineId },
    include: {
      routine: { include: { exercises: { orderBy: { order: 'asc' } } } },
      exerciseLogs: true,
    },
  });
  return session;
}

async function logSet(userId, sessionId, data) {
  const session = await assertSessionOwner(userId, sessionId);
  if (session.completedAt) throw new AppError('Session already completed', 400);
  return prisma.exerciseLog.create({ data: { ...data, sessionId } });
}

async function completeSession(userId, sessionId, notes) {
  await assertSessionOwner(userId, sessionId);
  return prisma.workoutSession.update({
    where: { id: sessionId },
    data: { completedAt: new Date(), notes },
    include: {
      routine: true,
      exerciseLogs: { include: { exercise: true } },
    },
  });
}

async function getSessionById(userId, sessionId) {
  const session = await prisma.workoutSession.findFirst({
    where: { id: sessionId, userId },
    include: {
      routine: { include: { exercises: { orderBy: { order: 'asc' } } } },
      exerciseLogs: { include: { exercise: true }, orderBy: { createdAt: 'asc' } },
    },
  });
  if (!session) throw new AppError('Session not found', 404);
  return session;
}

async function getSessions(userId, cursor, limit = 10) {
  const take = Math.min(limit, 500);
  const sessions = await prisma.workoutSession.findMany({
    where: { userId },
    take: take + 1,
    ...(cursor && { cursor: { id: cursor }, skip: 1 }),
    orderBy: { startedAt: 'desc' },
    include: {
      routine: { select: { id: true, name: true } },
      _count: { select: { exerciseLogs: true } },
    },
  });

  const hasMore = sessions.length > take;
  if (hasMore) sessions.pop();

  return {
    sessions,
    nextCursor: hasMore ? sessions[sessions.length - 1].id : null,
  };
}

async function getDashboardData(userId) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const weekAgo = new Date(today);
  weekAgo.setDate(weekAgo.getDate() - 7);

  const [recentSessions, weekCount, totalCount, allSessions] = await Promise.all([
    prisma.workoutSession.findMany({
      where: { userId, completedAt: { not: null } },
      take: 5,
      orderBy: { startedAt: 'desc' },
      include: {
        routine: { select: { name: true } },
        _count: { select: { exerciseLogs: true } },
      },
    }),
    prisma.workoutSession.count({
      where: { userId, startedAt: { gte: weekAgo }, completedAt: { not: null } },
    }),
    prisma.workoutSession.count({ where: { userId, completedAt: { not: null } } }),
    prisma.workoutSession.findMany({
      where: { userId },
      select: { startedAt: true, completedAt: true },
      orderBy: { startedAt: 'desc' },
      take: 500,
    }),
  ]);

  const calendar = buildCalendar(allSessions);
  return { recentSessions, weekCount, totalCount, calendar };
}

async function getCalendarData(userId) {
  const sessions = await prisma.workoutSession.findMany({
    where: { userId },
    select: { startedAt: true, completedAt: true },
    orderBy: { startedAt: 'desc' },
    take: 500,
  });
  return buildCalendar(sessions);
}

function buildCalendar(sessions) {
  const sixMonthsAgo = new Date();
  sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
  const dates = {};
  sessions.forEach((s) => {
    if (!s.completedAt) return;
    if (new Date(s.startedAt) < sixMonthsAgo) return;
    const d = new Date(s.startedAt);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    const minutes = Math.max(1, Math.round((new Date(s.completedAt) - d) / 60000));
    dates[key] = (dates[key] || 0) + minutes;
  });
  return dates;
}

async function deleteSession(userId, sessionId) {
  await assertSessionOwner(userId, sessionId);
  await prisma.workoutSession.delete({ where: { id: sessionId } });
}

async function assertSessionOwner(userId, sessionId) {
  const session = await prisma.workoutSession.findFirst({ where: { id: sessionId, userId } });
  if (!session) throw new AppError('Session not found', 404);
  return session;
}

module.exports = { startSession, logSet, completeSession, deleteSession, getSessionById, getSessions, getDashboardData, getCalendarData };
