const prisma = require('../lib/prisma');
const { AppError } = require('../middleware/error.middleware');

async function getRoutines(userId) {
  return prisma.routine.findMany({
    where: { userId },
    include: {
      exercises: {
        orderBy: { order: 'asc' },
        select: { id: true, name: true, muscleGroup: true, sets: true, reps: true, weight: true },
      },
    },
    orderBy: { createdAt: 'desc' },
  });
}

async function getRoutineById(userId, routineId) {
  const routine = await prisma.routine.findFirst({
    where: { id: routineId, userId },
    include: { exercises: { orderBy: { order: 'asc' } } },
  });
  if (!routine) throw new AppError('Routine not found', 404);
  return routine;
}

async function createRoutine(userId, data) {
  return prisma.routine.create({
    data: { name: data.name, userId },
    include: { exercises: true },
  });
}

async function updateRoutine(userId, routineId, data) {
  await assertOwner(userId, routineId);
  return prisma.routine.update({
    where: { id: routineId },
    data: { name: data.name },
  });
}

async function deleteRoutine(userId, routineId) {
  await assertOwner(userId, routineId);
  return prisma.routine.delete({ where: { id: routineId } });
}

async function addExercise(userId, routineId, data) {
  await assertOwner(userId, routineId);
  const count = await prisma.exercise.count({ where: { routineId } });
  return prisma.exercise.create({
    data: {
      name: data.name,
      muscleGroup: data.muscleGroup || 'OTHER',
      equipment: data.equipment || null,
      sets: 1,
      reps: 0,
      weight: null,
      notes: null,
      restTimer: null,
      order: count,
      routineId,
    },
  });
}

async function updateExercise(userId, routineId, exerciseId, data) {
  await assertOwner(userId, routineId);
  const update = {};
  if (data.sets !== undefined) update.sets = Math.max(1, Number(data.sets));
  if (data.setTypes !== undefined) update.setTypes = Array.isArray(data.setTypes) ? data.setTypes : [];
  if (data.reps !== undefined) update.reps = Math.max(0, Number(data.reps));
  if (data.weight !== undefined) update.weight = data.weight === null || data.weight === '' ? null : Number(data.weight);
  if (data.notes !== undefined) update.notes = data.notes || null;
  if (data.restTimer !== undefined) update.restTimer = data.restTimer === null || data.restTimer === '' ? null : Number(data.restTimer);
  return prisma.exercise.update({ where: { id: exerciseId }, data: update });
}

async function removeExercise(userId, routineId, exerciseId) {
  await assertOwner(userId, routineId);
  return prisma.exercise.delete({ where: { id: exerciseId } });
}

async function assertOwner(userId, routineId) {
  const routine = await prisma.routine.findFirst({ where: { id: routineId, userId } });
  if (!routine) throw new AppError('Routine not found', 404);
  return routine;
}

module.exports = { getRoutines, getRoutineById, createRoutine, updateRoutine, deleteRoutine, addExercise, updateExercise, removeExercise };
