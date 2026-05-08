const pool = require('../config/database');

const getFireAlarmStatus = async (req, res) => {
  try {
    const [rows] = await pool.execute(`
      SELECT e.name, a.alarm_type, a.priority, a.message, a.acknowledged, a.timestamp
      FROM equipment e
      LEFT JOIN alarms a ON e.id = a.equipment_id
      WHERE e.type = 'fire_alarm'
      ORDER BY a.timestamp DESC
      LIMIT 5
    `);

    if (rows.length === 0) {
      return res.json([
        {
          name: 'Fire Alarm Panel',
          alarm_type: 'MCP Fault',
          priority: 'high',
          message: 'Manual Call Point offline',
          acknowledged: false,
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

module.exports = { getFireAlarmStatus };