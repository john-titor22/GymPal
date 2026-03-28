const router = require('express').Router();
const programsController = require('../controllers/programs.controller');
const { authenticate } = require('../middleware/auth.middleware');
const { validate } = require('../middleware/validate.middleware');
const { createProgramSchema, updateProgramSchema, createWorkoutDaySchema } = require('../validators/program.validator');

router.use(authenticate);

router.get('/', programsController.getPrograms);
router.post('/', validate(createProgramSchema), programsController.createProgram);
router.get('/:id', programsController.getProgramById);
router.patch('/:id', validate(updateProgramSchema), programsController.updateProgram);
router.delete('/:id', programsController.deleteProgram);
router.post('/:id/activate', programsController.setActiveProgram);

// Workout days nested under programs
router.post('/:id/days', validate(createWorkoutDaySchema), programsController.createWorkoutDay);
router.delete('/:programId/days/:dayId', programsController.deleteWorkoutDay);

module.exports = router;
