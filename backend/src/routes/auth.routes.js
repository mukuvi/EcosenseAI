const express = require('express');
const { body } = require('express-validator');
const authController = require('../controllers/auth.controller');
const rateLimit = require('../middleware/rateLimit');

const router = express.Router();
const authRateLimit = rateLimit({ windowMs: 15 * 60 * 1000, max: 20 });

const PASSWORD_RULES = [
  body('password')
    .isLength({ min: 8 })
    .withMessage('Password must be at least 8 characters long'),
  body('password')
    .matches(/[A-Za-z]/)
    .withMessage('Password must include at least one letter'),
  body('password')
    .matches(/[0-9]/)
    .withMessage('Password must include at least one number'),
];

router.post(
  '/register',
  authRateLimit,
  [
    body('email')
      .isEmail()
      .withMessage('Enter a valid email address')
      .normalizeEmail(),
    ...PASSWORD_RULES,
    body('full_name')
      .trim()
      .notEmpty()
      .withMessage('Full name is required'),
    body('phone')
      .optional({ values: 'falsy' })
      .isMobilePhone()
      .withMessage('Enter a valid phone number'),
    body('role')
      .optional()
      .isIn(['citizen', 'organization', 'field_agent', 'admin'])
      .withMessage('Choose a valid account type'),
  ],
  authController.register
);

router.post(
  '/login',
  authRateLimit,
  [
    body('email')
      .isEmail()
      .withMessage('Enter a valid email address')
      .normalizeEmail(),
    body('password')
      .notEmpty()
      .withMessage('Password is required'),
  ],
  authController.login
);

router.get('/me', authController.getProfile);

module.exports = router;
