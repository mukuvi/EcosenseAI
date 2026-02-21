const express = require('express');
const { body, query: queryValidator } = require('express-validator');
const reportController = require('../controllers/report.controller');
const { authenticate } = require('../middleware/auth');
const upload = require('../middleware/upload');

const router = express.Router();

// All report routes require authentication
router.use(authenticate);

// Create a new waste report
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

// List reports with filtering
router.get(
  '/',
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

// Get single report
router.get('/:id', reportController.getById);

// Update report status (admin / field_agent)
router.patch(
  '/:id/status',
  [body('status').isIn(['verified', 'assigned', 'in_progress', 'resolved', 'rejected'])],
  reportController.updateStatus
);

module.exports = router;
