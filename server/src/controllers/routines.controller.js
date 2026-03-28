const routinesService = require('../services/routines.service');

async function getRoutines(req, res, next) {
  try { res.json(await routinesService.getRoutines(req.user.id)); } catch (err) { next(err); }
}

async function getRoutineById(req, res, next) {
  try { res.json(await routinesService.getRoutineById(req.user.id, req.params.id)); } catch (err) { next(err); }
}

async function createRoutine(req, res, next) {
  try { res.status(201).json(await routinesService.createRoutine(req.user.id, req.body)); } catch (err) { next(err); }
}

async function updateRoutine(req, res, next) {
  try { res.json(await routinesService.updateRoutine(req.user.id, req.params.id, req.body)); } catch (err) { next(err); }
}

async function deleteRoutine(req, res, next) {
  try { await routinesService.deleteRoutine(req.user.id, req.params.id); res.status(204).send(); } catch (err) { next(err); }
}

async function addExercise(req, res, next) {
  try { res.status(201).json(await routinesService.addExercise(req.user.id, req.params.id, req.body)); } catch (err) { next(err); }
}

async function updateExercise(req, res, next) {
  try { res.json(await routinesService.updateExercise(req.user.id, req.params.id, req.params.exerciseId, req.body)); } catch (err) { next(err); }
}

async function removeExercise(req, res, next) {
  try { await routinesService.removeExercise(req.user.id, req.params.id, req.params.exerciseId); res.status(204).send(); } catch (err) { next(err); }
}

module.exports = { getRoutines, getRoutineById, createRoutine, updateRoutine, deleteRoutine, addExercise, updateExercise, removeExercise };
