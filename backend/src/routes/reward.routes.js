const express = require('express');
const { body } = require('express-validator');
const rewardController = require('../controllers/reward.controller');
const { authenticate, authorize } = require('../middleware/auth');

const router = express.Router();

router.use(authenticate);

// List available rewards
router.get('/', rewardController.list);

// Redeem a reward
router.post(
  '/:id/redeem',
  rewardController.redeem
);

// Admin: create a reward
router.post(
  '/',
  authorize('admin'),
  [
    body('title').trim().notEmpty(),
    body('points_cost').isInt({ min: 1 }),
    body('quantity_available').isInt({ min: 0 }),
  ],
  rewardController.create
);

// Admin: update a reward
router.put(
  '/:id',
  authorize('admin'),
  rewardController.update
);

module.exports = router;
