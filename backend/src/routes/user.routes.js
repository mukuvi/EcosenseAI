const express = require('express');
const { body } = require('express-validator');
const userController = require('../controllers/user.controller');
const { authenticate, authorize } = require('../middleware/auth');

const router = express.Router();

router.use(authenticate);

// Get user's point balance & transaction history
router.get('/points', userController.getPoints);

// Admin: list all users
router.get('/', authorize('admin'), userController.listUsers);

// Admin: create a user account
router.post(
	'/',
	authorize('admin'),
	[
		body('email').isEmail().normalizeEmail(),
		body('password').isLength({ min: 6 }),
		body('full_name').trim().notEmpty(),
		body('phone').optional().isMobilePhone(),
		body('role').isIn(['citizen', 'admin', 'field_agent', 'organization']),
	],
	userController.createUser
);

// Admin: update user role
router.patch('/:id/role', authorize('admin'), userController.updateRole);

// Admin: block/unblock a user
router.patch(
	'/:id/active',
	authorize('admin'),
	[body('is_active').isBoolean()],
	userController.updateActive
);

// Admin: delete (deactivate) a user
router.delete('/:id', authorize('admin'), userController.deleteUser);

module.exports = router;
