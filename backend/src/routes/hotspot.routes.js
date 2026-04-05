const express = require('express');
const hotspotController = require('../controllers/hotspot.controller');
const { authenticate } = require('../middleware/auth');

const router = express.Router();

router.use(authenticate);

router.get('/', hotspotController.list);

router.get('/:id', hotspotController.getById);

module.exports = router;
