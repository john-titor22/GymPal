const usersService = require('../services/users.service');

async function getProfile(req, res, next) {
  try {
    const user = await usersService.getProfile(req.user.id);
    res.json(user);
  } catch (err) {
    next(err);
  }
}

async function updateProfile(req, res, next) {
  try {
    const user = await usersService.updateProfile(req.user.id, req.body);
    res.json(user);
  } catch (err) {
    next(err);
  }
}

module.exports = { getProfile, updateProfile };
