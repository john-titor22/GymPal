const router = require('express').Router();
const ctrl = require('../controllers/routines.controller');
const { authenticate } = require('../middleware/auth.middleware');

router.use(authenticate);

router.get('/', ctrl.getRoutines);
router.post('/', ctrl.createRoutine);
router.get('/:id', ctrl.getRoutineById);
router.patch('/:id', ctrl.updateRoutine);
router.delete('/:id', ctrl.deleteRoutine);
router.post('/:id/exercises', ctrl.addExercise);
router.delete('/:id/exercises/:exerciseId', ctrl.removeExercise);

module.exports = router;
