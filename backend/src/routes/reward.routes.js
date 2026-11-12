const express = require('express');
const { body } = require('express-validator');
const rewardController = require('../controllers/reward.controller');
const { authenticate, authorize } = require('../middleware/auth');

const router = express.Router();

router.use(authenticate);

router.get('/', rewardController.list);

router.post(
  '/:id/redeem',
  rewardController.redeem
);

router.post(
  '/',
  authorize('admin'),
  [
    body('title')
      .trim()
      .notEmpty()
      .withMessage('Reward title is required'),
    body('points_cost')
      .isInt({ min: 1 })
      .withMessage('Points cost must be a whole number of 1 or more'),
    body('quantity_available')
      .isInt({ min: 0 })
      .withMessage('Quantity available must be a whole number of 0 or more'),
  ],
  rewardController.create
);

router.put(
  '/:id',
  authorize('admin'),
  rewardController.update
);

module.exports = router;
