const express = require('express');
const { getActiveAlarms, acknowledgeAlarm, getAlarmHistory } = require('../controllers/alarmsController');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

router.get('/', authenticateToken, getActiveAlarms);
router.patch('/:id/acknowledge', authenticateToken, acknowledgeAlarm);
router.get('/history', authenticateToken, getAlarmHistory);

module.exports = router;