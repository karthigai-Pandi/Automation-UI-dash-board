const express = require('express');
const { getEnergyData } = require('../controllers/energyController');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

router.get('/', authenticateToken, getEnergyData);

module.exports = router;