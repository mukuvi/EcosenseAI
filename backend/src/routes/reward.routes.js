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
    body('title').trim().notEmpty(),
    body('points_cost').isInt({ min: 1 }),
    body('quantity_available').isInt({ min: 0 }),
  ],
  rewardController.create
);

router.put(
  '/:id',
  authorize('admin'),
  rewardController.update
);

module.exports = router;
