const pool = require('../config/database');

const getAHUData = async (req, res) => {
  try {
    const [ahuData] = await pool.execute(`
      SELECT e.name, a.* FROM equipment e
      JOIN ahu_data a ON e.id = a.equipment_id
      WHERE e.type = 'ahu'
      ORDER BY a.timestamp DESC
      LIMIT 10
    `);

    // Simulate real-time data if no data exists
    if (ahuData.length === 0) {
      const mockData = [
        {
          name: 'AHU-01',
          supply_temp: 22.5 + Math.random() * 5,
          return_temp: 25.0 + Math.random() * 3,
          fan_status: Math.random() > 0.1 ? 'on' : 'off',
          auto_manual: 'auto',
          damper_percentage: Math.floor(Math.random() * 100),
          filter_dirty: Math.random() > 0.8,
          alarm_status: Math.random() > 0.9
        }
      ];
      return res.json(mockData);
    }

    res.json(ahuData);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

const updateAHUData = async (req, res) => {
  try {
    const { equipment_id, ...data } = req.body;

    await pool.execute(`
      INSERT INTO ahu_data (equipment_id, supply_temp, return_temp, fan_status, auto_manual, damper_percentage, filter_dirty, alarm_status)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      equipment_id,
      data.supply_temp,
      data.return_temp,
      data.fan_status,
      data.auto_manual,
      data.damper_percentage,
      data.filter_dirty,
      data.alarm_status
    ]);

    res.json({ message: 'AHU data updated successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = { getAHUData, updateAHUData };