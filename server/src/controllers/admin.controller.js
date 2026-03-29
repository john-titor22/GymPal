const adminService = require('../services/admin.service');

async function listUsers(req, res, next) {
  try { res.json(await adminService.listUsers()); } catch (err) { next(err); }
}

async function deleteUser(req, res, next) {
  try {
    await adminService.deleteUser(req.user.id, req.params.userId);
    res.status(204).end();
  } catch (err) { next(err); }
}

async function toggleAdmin(req, res, next) {
  try { res.json(await adminService.toggleAdmin(req.user.id, req.params.userId)); } catch (err) { next(err); }
}

async function promoteBySecret(req, res, next) {
  try { res.json(await adminService.promoteBySecret(req.user.id, req.body.secret)); } catch (err) { next(err); }
}

module.exports = { listUsers, deleteUser, toggleAdmin, promoteBySecret };
