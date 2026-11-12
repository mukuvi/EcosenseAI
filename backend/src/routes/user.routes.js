const express = require('express');
const { body, query: queryValidator } = require('express-validator');
const userController = require('../controllers/user.controller');
const { authenticate, authorize } = require('../middleware/auth');

const router = express.Router();

router.use(authenticate);

router.get('/points', userController.getPoints);

router.get('/field-agents', authorize('admin', 'organization'), userController.listFieldAgents);

router.get('/', authorize('admin'), userController.listUsers);

router.post(
	'/',
	authorize('admin'),
	[
		body('email')
			.isEmail()
			.withMessage('Enter a valid email address')
			.normalizeEmail(),
		body('password')
			.isLength({ min: 8 })
			.withMessage('Password must be at least 8 characters long'),
		body('password')
			.matches(/[A-Za-z]/)
			.withMessage('Password must include at least one letter'),
		body('password')
			.matches(/[0-9]/)
			.withMessage('Password must include at least one number'),
		body('full_name')
			.trim()
			.notEmpty()
			.withMessage('Full name is required'),
		body('phone')
			.optional({ values: 'falsy' })
			.isMobilePhone()
			.withMessage('Enter a valid phone number'),
		body('role')
			.isIn(['citizen', 'admin', 'field_agent', 'organization'])
			.withMessage('Choose a valid role'),
	],
	userController.createUser
);

router.patch('/:id/role', authorize('admin'), userController.updateRole);

router.patch(
	'/:id/active',
	authorize('admin'),
	[body('is_active').isBoolean().withMessage('is_active must be true or false')],
	userController.updateActive
);

router.delete('/:id', authorize('admin'), userController.deleteUser);

module.exports = router;
