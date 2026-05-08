const express = require('express');
const { getUsers, updateUserRole, deleteUser, registerUser } = require('../controllers/userController');
const { authenticateToken, authorizeRoles } = require('../middleware/auth');

const router = express.Router();

router.get('/', authenticateToken, authorizeRoles('admin'), getUsers);
router.post('/', authenticateToken, authorizeRoles('admin'), registerUser);
router.put('/:id/role', authenticateToken, authorizeRoles('admin'), updateUserRole);
router.delete('/:id', authenticateToken, authorizeRoles('admin'), deleteUser);

module.exports = router;