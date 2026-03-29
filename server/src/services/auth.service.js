const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const prisma = require('../lib/prisma');
const { AppError } = require('../middleware/error.middleware');

function generateAccessToken(user) {
  return jwt.sign(
    { sub: user.id },
    process.env.JWT_ACCESS_SECRET,
    { expiresIn: process.env.JWT_ACCESS_EXPIRES_IN }
  );
}

function generateRefreshToken(user) {
  return jwt.sign(
    { sub: user.id },
    process.env.JWT_REFRESH_SECRET,
    { expiresIn: process.env.JWT_REFRESH_EXPIRES_IN }
  );
}

const USER_SELECT = { id: true, name: true, email: true, bio: true, isAdmin: true };

async function register({ name, email, password }) {
  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) throw new AppError('Email already in use', 409);

  const hashed = await bcrypt.hash(password, 10);
  const user = await prisma.user.create({
    data: { name, email, password: hashed },
    select: USER_SELECT,
  });

  const accessToken = generateAccessToken(user);
  const refreshToken = generateRefreshToken(user);
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
  await prisma.refreshToken.create({ data: { token: refreshToken, userId: user.id, expiresAt } });

  return { user, accessToken, refreshToken };
}

async function login({ email, password }) {
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) throw new AppError('Invalid credentials', 401);

  const valid = await bcrypt.compare(password, user.password);
  if (!valid) throw new AppError('Invalid credentials', 401);

  const accessToken = generateAccessToken(user);
  const refreshToken = generateRefreshToken(user);
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
  await prisma.refreshToken.create({ data: { token: refreshToken, userId: user.id, expiresAt } });

  const { password: _, ...safeUser } = user;
  return { user: safeUser, accessToken, refreshToken };
}

async function refresh(token) {
  if (!token) throw new AppError('No refresh token', 401);

  let payload;
  try {
    payload = jwt.verify(token, process.env.JWT_REFRESH_SECRET);
  } catch {
    throw new AppError('Invalid refresh token', 401);
  }

  const stored = await prisma.refreshToken.findUnique({ where: { token } });
  if (!stored || stored.expiresAt < new Date()) {
    throw new AppError('Refresh token expired', 401);
  }

  await prisma.refreshToken.delete({ where: { token } });

  const user = await prisma.user.findUnique({ where: { id: payload.sub }, select: { id: true } });
  if (!user) throw new AppError('User not found', 401);

  const accessToken = generateAccessToken(user);
  const newRefreshToken = generateRefreshToken(user);
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
  await prisma.refreshToken.create({ data: { token: newRefreshToken, userId: user.id, expiresAt } });

  return { accessToken, refreshToken: newRefreshToken };
}

async function logout(token) {
  if (token) {
    await prisma.refreshToken.deleteMany({ where: { token } });
  }
}

module.exports = { register, login, refresh, logout };
