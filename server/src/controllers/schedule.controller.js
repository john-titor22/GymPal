const scheduleService = require('../services/schedule.service');

async function getSchedule(req, res, next) {
  try {
    const { from, to } = req.query;
    if (!from || !to) return res.status(400).json({ message: 'from and to are required' });
    const data = await scheduleService.getSchedule(req.user.id, from, to);
    res.json(data);
  } catch (err) { next(err); }
}

async function createSchedule(req, res, next) {
  try {
    const data = await scheduleService.createSchedule(req.user.id, req.body);
    res.status(201).json(data);
  } catch (err) { next(err); }
}

async function deleteSchedule(req, res, next) {
  try {
    await scheduleService.deleteSchedule(req.user.id, req.params.id);
    res.status(204).end();
  } catch (err) { next(err); }
}

module.exports = { getSchedule, createSchedule, deleteSchedule };
