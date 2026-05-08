const express = require('express');
const { getFireAlarmStatus } = require('../controllers/fireController');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

router.get('/', authenticateToken, getFireAlarmStatus);

module.exports = router;