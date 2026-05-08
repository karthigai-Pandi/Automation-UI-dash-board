const pool = require('../config/database');

const getDashboardSummary = async (req, res) => {
  try {
    // Total AHU count
    const [ahuCount] = await pool.execute(
      'SELECT COUNT(*) as count FROM equipment WHERE type = "ahu"'
    );

    // Running equipment count
    const [runningCount] = await pool.execute(
      'SELECT COUNT(*) as count FROM equipment WHERE status = "active"'
    );

    // Alarm count
    const [alarmCount] = await pool.execute(
      'SELECT COUNT(*) as count FROM alarms WHERE acknowledged = FALSE'
    );

    // Temperature summary (mock data for now)
    const temperatureSummary = {
      average: 23.5,
      min: 20.0,
      max: 28.0
    };

    // Energy consumption summary
    const [energyData] = await pool.execute(
      'SELECT AVG(kwh) as average, SUM(kwh) as total FROM energy_logs WHERE timestamp >= DATE_SUB(NOW(), INTERVAL 24 HOUR)'
    );

    res.json({
      ahuCount: ahuCount[0].count,
      runningEquipment: runningCount[0].count,
      activeAlarms: alarmCount[0].count,
      temperatureSummary,
      energyConsumption: energyData[0]
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = { getDashboardSummary };