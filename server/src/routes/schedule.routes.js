const router = require('express').Router();
const { authenticate } = require('../middleware/auth.middleware');
const ctrl = require('../controllers/schedule.controller');

router.use(authenticate);

router.get('/', ctrl.getSchedule);
router.post('/', ctrl.createSchedule);
router.delete('/:id', ctrl.deleteSchedule);

module.exports = router;
