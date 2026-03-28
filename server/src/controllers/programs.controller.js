const programsService = require('../services/programs.service');

async function getPrograms(req, res, next) {
  try {
    const programs = await programsService.getPrograms(req.user.id);
    res.json(programs);
  } catch (err) {
    next(err);
  }
}

async function getProgramById(req, res, next) {
  try {
    const program = await programsService.getProgramById(req.user.id, req.params.id);
    res.json(program);
  } catch (err) {
    next(err);
  }
}

async function createProgram(req, res, next) {
  try {
    const program = await programsService.createProgram(req.user.id, req.body);
    res.status(201).json(program);
  } catch (err) {
    next(err);
  }
}

async function updateProgram(req, res, next) {
  try {
    const program = await programsService.updateProgram(req.user.id, req.params.id, req.body);
    res.json(program);
  } catch (err) {
    next(err);
  }
}

async function deleteProgram(req, res, next) {
  try {
    await programsService.deleteProgram(req.user.id, req.params.id);
    res.status(204).send();
  } catch (err) {
    next(err);
  }
}

async function setActiveProgram(req, res, next) {
  try {
    const program = await programsService.setActiveProgram(req.user.id, req.params.id);
    res.json(program);
  } catch (err) {
    next(err);
  }
}

async function createWorkoutDay(req, res, next) {
  try {
    const day = await programsService.createWorkoutDay(req.user.id, req.params.id, req.body);
    res.status(201).json(day);
  } catch (err) {
    next(err);
  }
}

async function deleteWorkoutDay(req, res, next) {
  try {
    await programsService.deleteWorkoutDay(req.user.id, req.params.programId, req.params.dayId);
    res.status(204).send();
  } catch (err) {
    next(err);
  }
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
};
