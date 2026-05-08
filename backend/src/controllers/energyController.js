const pool = require('../config/database');

const getEnergyData = async (req, res) => {
  try {
    const [rows] = await pool.execute(`
      SELECT e.name, l.voltage, l.current, l.power_factor, l.kwh, l.timestamp
      FROM equipment e
      JOIN energy_logs l ON e.id = l.equipment_id
      WHERE e.type = 'energy_meter'
      ORDER BY l.timestamp DESC
      LIMIT 24
    `);

    if (rows.length === 0) {
      const sample = Array.from({ length: 12 }, (_, idx) => ({
        name: `Meter-${idx + 1}`,
        voltage: 415 + Math.random() * 10,
        current: 10 + Math.random() * 6,
        power_factor: 0.85 + Math.random() * 0.1,
        kwh: 120 + Math.random() * 40,
        timestamp: new Date(Date.now() - idx * 3600000).toISOString()
      }));
      return res.json(sample);
    }

    res.json(rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = { getEnergyData };