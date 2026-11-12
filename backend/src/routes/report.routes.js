const express = require('express');
const { body, query: queryValidator } = require('express-validator');
const reportController = require('../controllers/report.controller');
const { authenticate, authorize } = require('../middleware/auth');
const upload = require('../middleware/upload');

const router = express.Router();

const REPORT_STATUSES = [
  'pending', 'verified', 'assigned', 'in_progress', 'resolved', 'rejected',
];

const WASTE_TYPES = [
  'plastic', 'organic', 'electronic', 'hazardous',
  'construction', 'medical', 'textile', 'mixed', 'other',
];

const SEVERITIES = ['low', 'medium', 'high', 'critical'];

router.use(authenticate);

router.get(
  '/mine',
  [
    queryValidator('status')
      .optional()
      .isIn(REPORT_STATUSES)
      .withMessage(`Status must be one of: ${REPORT_STATUSES.join(', ')}`),
    queryValidator('page')
      .optional()
      .isInt({ min: 1 })
      .withMessage('Page must be a whole number of 1 or more'),
    queryValidator('limit')
      .optional()
      .isInt({ min: 1, max: 100 })
      .withMessage('Limit must be between 1 and 100'),
  ],
  reportController.listMine
);

router.post(
  '/',
  upload.array('images', 5),
  [
    body('latitude')
      .isFloat({ min: -90, max: 90 })
      .withMessage('Latitude must be a number between -90 and 90'),
    body('longitude')
      .isFloat({ min: -180, max: 180 })
      .withMessage('Longitude must be a number between -180 and 180'),
    body('description')
      .optional()
      .trim(),
    body('waste_type')
      .optional()
      .isIn(WASTE_TYPES)
      .withMessage(`Waste type must be one of: ${WASTE_TYPES.join(', ')}`),
    body('severity')
      .optional()
      .isIn(SEVERITIES)
      .withMessage(`Severity must be one of: ${SEVERITIES.join(', ')}`),
  ],
  reportController.create
);

router.get(
  '/',
  authorize('admin', 'field_agent', 'organization'),
  [
    queryValidator('status')
      .optional()
      .isIn(REPORT_STATUSES)
      .withMessage(`Status must be one of: ${REPORT_STATUSES.join(', ')}`),
    queryValidator('waste_type').optional(),
    queryValidator('page')
      .optional()
      .isInt({ min: 1 })
      .withMessage('Page must be a whole number of 1 or more'),
    queryValidator('limit')
      .optional()
      .isInt({ min: 1, max: 100 })
      .withMessage('Limit must be between 1 and 100'),
  ],
  reportController.list
);

router.get('/assigned', reportController.listAssigned);

router.get('/:id/audio', reportController.getAudio);

router.get('/:id/history', reportController.getHistory);

router.get('/:id', reportController.getById);

router.patch(
  '/:id/status',
  [
    body('status')
      .isIn(['verified', 'assigned', 'in_progress', 'resolved', 'rejected'])
      .withMessage('Status must be one of: verified, assigned, in_progress, resolved, rejected'),
  ],
  reportController.updateStatus
);

router.patch(
  '/:id/assign',
  [
    body('assigned_to')
      .isUUID()
      .withMessage('Choose a valid field agent to assign this report to'),
    body('notes').optional().trim(),
  ],
  reportController.assign
);

module.exports = router;
