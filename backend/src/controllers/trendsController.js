const pool = require('../config/database');

const getTemperatureTrend = async (req, res) => {
  try {
    const [rows] = await pool.execute(`
      SELECT timestamp, supply_temp, return_temp
      FROM ahu_data
      ORDER BY timestamp DESC
      LIMIT 12
    `);

    if (rows.length === 0) {
      const trend = Array.from({ length: 12 }, (_, index) => ({
        timestamp: new Date(Date.now() - index * 3600000).toISOString(),
        supply_temp: 21 + Math.random() * 4,
        return_temp: 24 + Math.random() * 3
      })).reverse();
      return res.json(trend);
    }

    res.json(rows.reverse());
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

const getEnergyTrend = async (req, res) => {
  try {
    const [rows] = await pool.execute(`
      SELECT timestamp, kwh
      FROM energy_logs
      ORDER BY timestamp DESC
      LIMIT 12
    `);

    if (rows.length === 0) {
      const trend = Array.from({ length: 12 }, (_, index) => ({
        timestamp: new Date(Date.now() - index * 3600000).toISOString(),
        kwh: 100 + Math.random() * 50
      })).reverse();
      return res.json(trend);
    }

    res.json(rows.reverse());
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = { getTemperatureTrend, getEnergyTrend };