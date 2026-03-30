const prisma = require('../lib/prisma');
const { AppError } = require('../middleware/error.middleware');

async function getSchedule(userId, from, to) {
  return prisma.scheduledWorkout.findMany({
    where: {
      userId,
      date: { gte: new Date(from), lte: new Date(to) },
    },
    include: {
      routine: {
        select: {
          id: true,
          name: true,
          exercises: { select: { sets: true } },
        },
      },
    },
    orderBy: { date: 'asc' },
  });
}

async function createSchedule(userId, { routineId, date }) {
  const routine = await prisma.routine.findFirst({ where: { id: routineId, userId } });
  if (!routine) throw new AppError('Routine not found', 404);
  return prisma.scheduledWorkout.create({
    data: { userId, routineId, date: new Date(date) },
    include: {
      routine: {
        select: {
          id: true,
          name: true,
          exercises: { select: { sets: true } },
        },
      },
    },
  });
}

async function deleteSchedule(userId, scheduleId) {
  const entry = await prisma.scheduledWorkout.findFirst({ where: { id: scheduleId, userId } });
  if (!entry) throw new AppError('Not found', 404);
  await prisma.scheduledWorkout.delete({ where: { id: scheduleId } });
}

module.exports = { getSchedule, createSchedule, deleteSchedule };
