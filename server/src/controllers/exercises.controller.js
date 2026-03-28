const programsService = require('../services/programs.service');

async function createExercise(req, res, next) {
  try {
    const exercise = await programsService.createExercise(req.user.id, req.params.dayId, req.body);
    res.status(201).json(exercise);
  } catch (err) {
    next(err);
  }
}

async function updateExercise(req, res, next) {
  try {
    const exercise = await programsService.updateExercise(req.user.id, req.params.id, req.body);
    res.json(exercise);
  } catch (err) {
    next(err);
  }
}

async function deleteExercise(req, res, next) {
  try {
    await programsService.deleteExercise(req.user.id, req.params.id);
    res.status(204).send();
  } catch (err) {
    next(err);
  }
}

module.exports = { createExercise, updateExercise, deleteExercise };
