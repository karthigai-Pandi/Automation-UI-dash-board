const express = require('express');
const { getDGData } = require('../controllers/dgController');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

router.get('/', authenticateToken, getDGData);

module.exports = router;