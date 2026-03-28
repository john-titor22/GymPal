const prisma = require('../lib/prisma');

async function getProfile(userId) {
  return prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, name: true, email: true, bio: true, createdAt: true },
  });
}

async function updateProfile(userId, data) {
  const allowed = {};
  if (data.name !== undefined) allowed.name = data.name;
  if (data.bio !== undefined) allowed.bio = data.bio;

  return prisma.user.update({
    where: { id: userId },
    data: allowed,
    select: { id: true, name: true, email: true, bio: true },
  });
}

module.exports = { getProfile, updateProfile };
