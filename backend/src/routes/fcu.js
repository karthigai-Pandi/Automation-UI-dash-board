const express = require('express');
const { getFCUData } = require('../controllers/fcuController');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

router.get('/', authenticateToken, getFCUData);

module.exports = router;