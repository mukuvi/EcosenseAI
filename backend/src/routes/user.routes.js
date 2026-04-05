const express = require('express');
const { body } = require('express-validator');
const userController = require('../controllers/user.controller');
const { authenticate, authorize } = require('../middleware/auth');

const router = express.Router();

router.use(authenticate);

router.get('/points', userController.getPoints);

router.get('/', authorize('admin'), userController.listUsers);

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

router.patch('/:id/role', authorize('admin'), userController.updateRole);

router.patch(
	'/:id/active',
	authorize('admin'),
	[body('is_active').isBoolean()],
	userController.updateActive
);

router.delete('/:id', authorize('admin'), userController.deleteUser);

module.exports = router;
