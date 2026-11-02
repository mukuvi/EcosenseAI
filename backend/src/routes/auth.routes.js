const express = require('express');
const { body } = require('express-validator');
const authController = require('../controllers/auth.controller');
const rateLimit = require('../middleware/rateLimit');

const router = express.Router();
const authRateLimit = rateLimit({ windowMs: 15 * 60 * 1000, max: 20 });

router.post(
  '/register',
  authRateLimit,
  [
    body('email').isEmail().normalizeEmail(),
    body('password')
      .isLength({ min: 8 })
      .matches(/[A-Za-z]/)
      .matches(/[0-9]/),
    body('full_name').trim().notEmpty(),
    body('phone').optional().isMobilePhone(),
    body('role').optional().isIn(['citizen', 'organization', 'field_agent', 'admin']),
  ],
  authController.register
);

router.post(
  '/login',
  authRateLimit,
  [
    body('email').isEmail().normalizeEmail(),
    body('password').notEmpty(),
  ],
  authController.login
);

router.get('/me', authController.getProfile);

module.exports = router;
