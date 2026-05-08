const pool = require('../config/database');

const getEquipment = async (req, res) => {
  try {
    const [equipment] = await pool.execute('SELECT * FROM equipment ORDER BY id');
    res.json(equipment);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

const createEquipment = async (req, res) => {
  try {
    const { name, type, location, status } = req.body;
    const [result] = await pool.execute(
      'INSERT INTO equipment (name, type, location, status) VALUES (?, ?, ?, ?)',
      [name, type, location, status || 'active']
    );
    res.status(201).json({ id: result.insertId, name, type, location, status: status || 'active' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

const updateEquipment = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, type, location, status } = req.body;
    await pool.execute(
      'UPDATE equipment SET name = ?, type = ?, location = ?, status = ? WHERE id = ?',
      [name, type, location, status, id]
    );
    res.json({ message: 'Equipment updated successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

const deleteEquipment = async (req, res) => {
  try {
    const { id } = req.params;
    await pool.execute('DELETE FROM equipment WHERE id = ?', [id]);
    res.json({ message: 'Equipment removed successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = { getEquipment, createEquipment, updateEquipment, deleteEquipment };