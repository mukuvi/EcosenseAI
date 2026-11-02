const express = require('express');
const { body } = require('express-validator');
const notificationController = require('../controllers/notification.controller');
const { authenticate } = require('../middleware/auth');

const router = express.Router();

router.use(authenticate);

router.get('/', notificationController.list);
router.patch('/read-all', notificationController.markAllRead);
router.patch('/:id/read', notificationController.markRead);

router.post(
  '/push-token',
  [
    body('token').isString().isLength({ min: 10 }),
    body('platform').optional().isIn(['ios', 'android', 'web']),
  ],
  notificationController.registerPushToken
);

router.delete('/push-token', notificationController.removePushToken);

module.exports = router;
