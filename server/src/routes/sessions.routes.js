const router = require('express').Router();
const sessionsController = require('../controllers/sessions.controller');
const { authenticate } = require('../middleware/auth.middleware');
const { validate } = require('../middleware/validate.middleware');
const { startSessionSchema, logSetSchema, completeSessionSchema } = require('../validators/session.validator');

router.use(authenticate);

router.get('/dashboard', sessionsController.getDashboard);
router.get('/', sessionsController.getSessions);
router.post('/', validate(startSessionSchema), sessionsController.startSession);
router.get('/:id', sessionsController.getSessionById);
router.post('/:id/sets', validate(logSetSchema), sessionsController.logSet);
router.post('/:id/complete', validate(completeSessionSchema), sessionsController.completeSession);
router.delete('/:id', sessionsController.deleteSession);

module.exports = router;
