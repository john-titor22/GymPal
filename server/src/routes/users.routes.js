const router = require('express').Router();
const usersController = require('../controllers/users.controller');
const { authenticate } = require('../middleware/auth.middleware');

router.get('/me', authenticate, usersController.getProfile);
router.patch('/me', authenticate, usersController.updateProfile);

module.exports = router;
