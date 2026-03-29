const router = require('express').Router();
const ctrl = require('../controllers/admin.controller');
const { authenticate } = require('../middleware/auth.middleware');
const { requireAdmin } = require('../middleware/admin.middleware');

router.use(authenticate);

// Self-promote via secret (no admin required — bootstraps the first admin)
router.post('/promote', ctrl.promoteBySecret);

// All routes below require admin
router.use(requireAdmin);
router.get('/users', ctrl.listUsers);
router.delete('/users/:userId', ctrl.deleteUser);
router.patch('/users/:userId/toggle-admin', ctrl.toggleAdmin);

module.exports = router;
