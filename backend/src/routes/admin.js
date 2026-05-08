const express = require('express');
const { getAdminStats, getUsers } = require('../controllers/adminController');
const { authenticateToken, authorizeRoles } = require('../middleware/auth');

const router = express.Router();

router.get('/stats', authenticateToken, authorizeRoles('admin'), getAdminStats);
router.get('/users', authenticateToken, authorizeRoles('admin'), getUsers);

module.exports = router;