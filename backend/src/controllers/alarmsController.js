const pool = require('../config/database');

const getActiveAlarms = async (req, res) => {
  try {
    const [alarms] = await pool.execute(`
      SELECT a.id, e.name as equipment_name, a.alarm_type, a.priority, a.message, a.acknowledged, a.timestamp
      FROM alarms a
      JOIN equipment e ON a.equipment_id = e.id
      WHERE a.acknowledged = FALSE
      ORDER BY a.timestamp DESC
    `);
    res.json(alarms);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

const acknowledgeAlarm = async (req, res) => {
  try {
    const { id } = req.params;
    const acknowledgedBy = req.user.id;
    await pool.execute('UPDATE alarms SET acknowledged = TRUE, acknowledged_by = ? WHERE id = ?', [acknowledgedBy, id]);
    res.json({ message: 'Alarm acknowledged successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

const getAlarmHistory = async (req, res) => {
  try {
    const [history] = await pool.execute(`
      SELECT a.id, e.name as equipment_name, a.alarm_type, a.priority, a.message, a.acknowledged, a.timestamp
      FROM alarms a
      JOIN equipment e ON a.equipment_id = e.id
      ORDER BY a.timestamp DESC
      LIMIT 50
    `);
    res.json(history);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = { getActiveAlarms, acknowledgeAlarm, getAlarmHistory };