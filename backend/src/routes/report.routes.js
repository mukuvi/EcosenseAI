const express = require('express');
const { body, query: queryValidator } = require('express-validator');
const reportController = require('../controllers/report.controller');
const { authenticate, authorize } = require('../middleware/auth');
const upload = require('../middleware/upload');

const router = express.Router();

router.use(authenticate);

router.get(
  '/mine',
  [
    queryValidator('status').optional().isIn([
      'pending', 'verified', 'assigned', 'in_progress', 'resolved', 'rejected',
    ]),
    queryValidator('page').optional().isInt({ min: 1 }),
    queryValidator('limit').optional().isInt({ min: 1, max: 100 }),
  ],
  reportController.listMine
);

router.post(
  '/',
  upload.array('images', 5),
  [
    body('latitude').isFloat({ min: -90, max: 90 }),
    body('longitude').isFloat({ min: -180, max: 180 }),
    body('description').optional().trim(),
    body('waste_type').optional().isIn([
      'plastic', 'organic', 'electronic', 'hazardous',
      'construction', 'medical', 'textile', 'mixed', 'other',
    ]),
    body('severity').optional().isIn(['low', 'medium', 'high', 'critical']),
  ],
  reportController.create
);

router.get(
  '/',
  authorize('admin', 'field_agent', 'organization'),
  [
    queryValidator('status').optional().isIn([
      'pending', 'verified', 'assigned', 'in_progress', 'resolved', 'rejected',
    ]),
    queryValidator('waste_type').optional(),
    queryValidator('page').optional().isInt({ min: 1 }),
    queryValidator('limit').optional().isInt({ min: 1, max: 100 }),
  ],
  reportController.list
);

router.get('/assigned', reportController.listAssigned);

router.get('/:id/audio', reportController.getAudio);

router.get('/:id/history', reportController.getHistory);

router.get('/:id', reportController.getById);

router.patch(
  '/:id/status',
  [body('status').isIn(['verified', 'assigned', 'in_progress', 'resolved', 'rejected'])],
  reportController.updateStatus
);

router.patch(
  '/:id/assign',
  [
    body('assigned_to').isUUID(),
    body('notes').optional().trim(),
  ],
  reportController.assign
);

module.exports = router;
