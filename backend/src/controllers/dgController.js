const pool = require('../config/database');

const getDGData = async (req, res) => {
  try {
    const [rows] = await pool.execute(`
      SELECT e.name, d.running_status, d.fuel_level, d.voltage, d.frequency, d.engine_temp, d.timestamp
      FROM equipment e
      JOIN dg_logs d ON e.id = d.equipment_id
      WHERE e.type = 'dg'
      ORDER BY d.timestamp DESC
      LIMIT 10
    `);

    if (rows.length === 0) {
      return res.json([
        {
          name: 'DG Set',
          running_status: 'on',
          fuel_level: 68.5,
          voltage: 415,
          frequency: 49.8,
          engine_temp: 82.3,
          timestamp: new Date().toISOString()
        }
      ]);
    }

    res.json(rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = { getDGData };