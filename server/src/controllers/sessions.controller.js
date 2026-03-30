const sessionsService = require('../services/sessions.service');

async function getCalendar(req, res, next) {
  try {
    const data = await sessionsService.getCalendarData(req.user.id);
    res.json(data);
  } catch (err) { next(err); }
}

async function deleteSession(req, res, next) {
  try {
    await sessionsService.deleteSession(req.user.id, req.params.id);
    res.status(204).end();
  } catch (err) {
    next(err);
  }
}

async function getDashboard(req, res, next) {
  try {
    const data = await sessionsService.getDashboardData(req.user.id);
    res.json(data);
  } catch (err) {
    next(err);
  }
}

async function getSessions(req, res, next) {
  try {
    const { cursor, limit } = req.query;
    const data = await sessionsService.getSessions(req.user.id, cursor, Number(limit) || 10);
    res.json(data);
  } catch (err) {
    next(err);
  }
}

async function getSessionById(req, res, next) {
  try {
    const session = await sessionsService.getSessionById(req.user.id, req.params.id);
    res.json(session);
  } catch (err) {
    next(err);
  }
}

async function startSession(req, res, next) {
  try {
    const session = await sessionsService.startSession(req.user.id, req.body.routineId);
    res.status(201).json(session);
  } catch (err) {
    next(err);
  }
}

async function logSet(req, res, next) {
  try {
    const log = await sessionsService.logSet(req.user.id, req.params.id, req.body);
    res.status(201).json(log);
  } catch (err) {
    next(err);
  }
}

async function completeSession(req, res, next) {
  try {
    const session = await sessionsService.completeSession(req.user.id, req.params.id, req.body.notes);
    res.json(session);
  } catch (err) {
    next(err);
  }
}

async function getStats(req, res, next) {
  try {
    const data = await sessionsService.getStats(req.user.id);
    res.json(data);
  } catch (err) { next(err); }
}

module.exports = { getDashboard, getSessions, getSessionById, getCalendar, startSession, logSet, completeSession, deleteSession, getStats };
