const express = require('express');
const { getAHUData, updateAHUData } = require('../controllers/ahuController');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

router.get('/', authenticateToken, getAHUData);
router.post('/', authenticateToken, updateAHUData);

module.exports = router;