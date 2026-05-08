const express = require('express');
const { getTemperatureTrend, getEnergyTrend } = require('../controllers/trendsController');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

router.get('/temperature', authenticateToken, getTemperatureTrend);
router.get('/energy', authenticateToken, getEnergyTrend);

module.exports = router;