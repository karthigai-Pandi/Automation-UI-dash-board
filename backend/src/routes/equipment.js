const express = require('express');
const { getEquipment, createEquipment, updateEquipment, deleteEquipment } = require('../controllers/equipmentController');
const { authenticateToken, authorizeRoles } = require('../middleware/auth');

const router = express.Router();

router.get('/', authenticateToken, getEquipment);
router.post('/', authenticateToken, authorizeRoles('admin', 'operator'), createEquipment);
router.put('/:id', authenticateToken, authorizeRoles('admin', 'operator'), updateEquipment);
router.delete('/:id', authenticateToken, authorizeRoles('admin'), deleteEquipment);

module.exports = router;