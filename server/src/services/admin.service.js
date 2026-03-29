const prisma = require('../lib/prisma');
const { AppError } = require('../middleware/error.middleware');

async function listUsers() {
  const users = await prisma.user.findMany({
    select: {
      id: true, name: true, email: true, isAdmin: true, createdAt: true,
      _count: { select: { sessions: true, routines: true } },
    },
    orderBy: { createdAt: 'desc' },
  });
  return users;
}

async function deleteUser(adminId, userId) {
  if (adminId === userId) throw new AppError('Cannot delete your own account', 400);
  await prisma.user.delete({ where: { id: userId } });
}

async function toggleAdmin(adminId, userId) {
  if (adminId === userId) throw new AppError('Cannot change your own admin status', 400);
  const user = await prisma.user.findUnique({ where: { id: userId }, select: { isAdmin: true } });
  if (!user) throw new AppError('User not found', 404);
  return prisma.user.update({
    where: { id: userId },
    data: { isAdmin: !user.isAdmin },
    select: { id: true, isAdmin: true },
  });
}

async function promoteBySecret(userId, secret) {
  if (!process.env.ADMIN_SECRET || secret !== process.env.ADMIN_SECRET) {
    throw new AppError('Invalid secret', 403);
  }
  return prisma.user.update({
    where: { id: userId },
    data: { isAdmin: true },
    select: { id: true, name: true, isAdmin: true },
  });
}

module.exports = { listUsers, deleteUser, toggleAdmin, promoteBySecret };
