const prisma = require('../lib/prisma');
const { AppError } = require('../middleware/error.middleware');

async function startSession(userId, workoutDayId) {
  const day = await prisma.workoutDay.findFirst({
    where: { id: workoutDayId, program: { userId } },
    include: { exercises: { orderBy: { order: 'asc' } } },
  });
  if (!day) throw new AppError('Workout day not found', 404);

  const session = await prisma.workoutSession.create({
    data: { userId, workoutDayId },
    include: {
      workoutDay: { include: { exercises: { orderBy: { order: 'asc' } } } },
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
      workoutDay: true,
      exerciseLogs: { include: { exercise: true } },
    },
  });
}

async function getSessionById(userId, sessionId) {
  const session = await prisma.workoutSession.findFirst({
    where: { id: sessionId, userId },
    include: {
      workoutDay: { include: { exercises: { orderBy: { order: 'asc' } } } },
      exerciseLogs: { include: { exercise: true }, orderBy: { createdAt: 'asc' } },
    },
  });
  if (!session) throw new AppError('Session not found', 404);
  return session;
}

async function getSessions(userId, cursor, limit = 10) {
  const take = Math.min(limit, 50);
  const sessions = await prisma.workoutSession.findMany({
    where: { userId },
    take: take + 1,
    ...(cursor && { cursor: { id: cursor }, skip: 1 }),
    orderBy: { startedAt: 'desc' },
    include: {
      workoutDay: { select: { id: true, name: true } },
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

  const [activeProgram, recentSessions, weekCount] = await Promise.all([
    prisma.program.findFirst({
      where: { userId, isActive: true },
      include: {
        workoutDays: {
          orderBy: { dayOrder: 'asc' },
          include: { exercises: { orderBy: { order: 'asc' } } },
        },
      },
    }),
    prisma.workoutSession.findMany({
      where: { userId },
      take: 5,
      orderBy: { startedAt: 'desc' },
      include: { workoutDay: { select: { name: true } } },
    }),
    prisma.workoutSession.count({
      where: { userId, startedAt: { gte: weekAgo }, completedAt: { not: null } },
    }),
  ]);

  return { activeProgram, recentSessions, weekCount };
}

async function assertSessionOwner(userId, sessionId) {
  const session = await prisma.workoutSession.findFirst({ where: { id: sessionId, userId } });
  if (!session) throw new AppError('Session not found', 404);
  return session;
}

module.exports = { startSession, logSet, completeSession, getSessionById, getSessions, getDashboardData };
