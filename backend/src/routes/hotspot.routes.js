const express = require('express');
const hotspotController = require('../controllers/hotspot.controller');
const { authenticate } = require('../middleware/auth');

const router = express.Router();

router.use(authenticate);

// Get predicted waste hotspots
router.get('/', hotspotController.list);

// Get hotspot detail
router.get('/:id', hotspotController.getById);

module.exports = router;
