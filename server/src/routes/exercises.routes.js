const router = require('express').Router();
const exercisesController = require('../controllers/exercises.controller');
const { authenticate } = require('../middleware/auth.middleware');
const { validate } = require('../middleware/validate.middleware');
const { createExerciseSchema, updateExerciseSchema } = require('../validators/program.validator');

router.use(authenticate);

router.post('/:dayId/exercises', validate(createExerciseSchema), exercisesController.createExercise);
router.patch('/exercises/:id', validate(updateExerciseSchema), exercisesController.updateExercise);
router.delete('/exercises/:id', exercisesController.deleteExercise);

module.exports = router;
