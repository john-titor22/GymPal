const prisma = require('../lib/prisma');

async function requireAdmin(req, res, next) {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: { isAdmin: true },
    });
    if (!user?.isAdmin) return res.status(403).json({ message: 'Admin access required' });
    next();
  } catch (err) {
    next(err);
  }
}

module.exports = { requireAdmin };
