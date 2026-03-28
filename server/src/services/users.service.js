const prisma = require('../lib/prisma');

async function getProfile(userId) {
  return prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, name: true, email: true, role: true, weight: true, fitnessGoal: true, createdAt: true },
  });
}

async function updateProfile(userId, data) {
  const allowed = {};
  if (data.name !== undefined) allowed.name = data.name;
  if (data.weight !== undefined) allowed.weight = data.weight;
  if (data.fitnessGoal !== undefined) allowed.fitnessGoal = data.fitnessGoal;

  return prisma.user.update({
    where: { id: userId },
    data: allowed,
    select: { id: true, name: true, email: true, role: true, weight: true, fitnessGoal: true },
  });
}

module.exports = { getProfile, updateProfile };
