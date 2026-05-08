const pool = require('../config/database');

const getFCUData = async (req, res) => {
  try {
    const [rows] = await pool.execute(`
      SELECT e.name, f.* FROM equipment e
      JOIN fcu_data f ON e.id = f.equipment_id
      WHERE e.type = 'fcu'
      ORDER BY f.timestamp DESC
      LIMIT 10
    `);

    if (rows.length === 0) {
      return res.json([
        {
          name: 'FCU-01',
          running_status: 'on',
          temperature: 24.2,
          speed_status: 'medium',
          occupancy_status: true
        }
      ]);
    }

    res.json(rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = { getFCUData };