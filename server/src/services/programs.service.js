const prisma = require('../lib/prisma');
const { AppError } = require('../middleware/error.middleware');

async function getPrograms(userId) {
  return prisma.program.findMany({
    where: { userId },
    include: {
      workoutDays: {
        orderBy: { dayOrder: 'asc' },
        select: { id: true, name: true, dayOrder: true, _count: { select: { exercises: true } } },
      },
    },
    orderBy: { createdAt: 'desc' },
  });
}

async function getProgramById(userId, programId) {
  const program = await prisma.program.findFirst({
    where: { id: programId, userId },
    include: {
      workoutDays: {
        orderBy: { dayOrder: 'asc' },
        include: {
          exercises: { orderBy: { order: 'asc' } },
        },
      },
    },
  });
  if (!program) throw new AppError('Program not found', 404);
  return program;
}

async function createProgram(userId, data) {
  return prisma.program.create({
    data: { ...data, userId },
    include: { workoutDays: true },
  });
}

async function updateProgram(userId, programId, data) {
  await assertOwner(userId, programId);
  return prisma.program.update({
    where: { id: programId },
    data,
  });
}

async function deleteProgram(userId, programId) {
  await assertOwner(userId, programId);
  return prisma.program.delete({ where: { id: programId } });
}

async function setActiveProgram(userId, programId) {
  await assertOwner(userId, programId);
  await prisma.program.updateMany({ where: { userId }, data: { isActive: false } });
  return prisma.program.update({ where: { id: programId }, data: { isActive: true } });
}

// WorkoutDay
async function createWorkoutDay(userId, programId, data) {
  await assertOwner(userId, programId);
  return prisma.workoutDay.create({ data: { ...data, programId } });
}

async function deleteWorkoutDay(userId, programId, dayId) {
  await assertOwner(userId, programId);
  return prisma.workoutDay.delete({ where: { id: dayId } });
}

// Exercise
async function createExercise(userId, dayId, data) {
  const day = await prisma.workoutDay.findFirst({
    where: { id: dayId, program: { userId } },
  });
  if (!day) throw new AppError('Workout day not found', 404);
  return prisma.exercise.create({ data: { ...data, workoutDayId: dayId } });
}

async function updateExercise(userId, exerciseId, data) {
  const exercise = await prisma.exercise.findFirst({
    where: { id: exerciseId, workoutDay: { program: { userId } } },
  });
  if (!exercise) throw new AppError('Exercise not found', 404);
  return prisma.exercise.update({ where: { id: exerciseId }, data });
}

async function deleteExercise(userId, exerciseId) {
  const exercise = await prisma.exercise.findFirst({
    where: { id: exerciseId, workoutDay: { program: { userId } } },
  });
  if (!exercise) throw new AppError('Exercise not found', 404);
  return prisma.exercise.delete({ where: { id: exerciseId } });
}

async function assertOwner(userId, programId) {
  const program = await prisma.program.findFirst({ where: { id: programId, userId } });
  if (!program) throw new AppError('Program not found', 404);
  return program;
}

module.exports = {
  getPrograms,
  getProgramById,
  createProgram,
  updateProgram,
  deleteProgram,
  setActiveProgram,
  createWorkoutDay,
  deleteWorkoutDay,
  createExercise,
  updateExercise,
  deleteExercise,
};
