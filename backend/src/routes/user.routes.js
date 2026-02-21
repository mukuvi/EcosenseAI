const express = require('express');
const userController = require('../controllers/user.controller');
const { authenticate, authorize } = require('../middleware/auth');

const router = express.Router();

router.use(authenticate);

// Get user's point balance & transaction history
router.get('/points', userController.getPoints);

// Admin: list all users
router.get('/', authorize('admin'), userController.listUsers);

// Admin: update user role
router.patch('/:id/role', authorize('admin'), userController.updateRole);

module.exports = router;
