const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '.env') });

const run = async () => {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
  });

  const schema = fs.readFileSync(path.resolve(__dirname, 'db', 'schema.sql'), 'utf8');
  await connection.query(schema);

  const hashedAdmin = await bcrypt.hash('admin123', 10);
  const hashedOperator = await bcrypt.hash('operator123', 10);
  const hashedViewer = await bcrypt.hash('viewer123', 10);

  await connection.query('USE smart_building_db');
  await connection.query('DELETE FROM users');
  await connection.query('DELETE FROM equipment');
  await connection.query('DELETE FROM ahu_data');
  await connection.query('DELETE FROM fcu_data');
  await connection.query('DELETE FROM energy_logs');
  await connection.query('DELETE FROM dg_logs');
  await connection.query('DELETE FROM alarms');

  await connection.query(
    'INSERT INTO users (username, email, password, role) VALUES (?, ?, ?, ?), (?, ?, ?, ?), (?, ?, ?, ?)',
    [
      'admin', 'admin@building.com', hashedAdmin, 'admin',
      'operator', 'operator@building.com', hashedOperator, 'operator',
      'viewer', 'viewer@building.com', hashedViewer, 'viewer'
    ]
  );

  const [equipmentResult] = await connection.query(
    'INSERT INTO equipment (name, type, location, status) VALUES (?, ?, ?, ?), (?, ?, ?, ?), (?, ?, ?, ?), (?, ?, ?, ?), (?, ?, ?, ?)',
    [
      'AHU-01', 'ahu', 'Floor 1', 'active',
      'FCU-01', 'fcu', 'Room 101', 'active',
      'Energy Meter 1', 'energy_meter', 'Main Panel', 'active',
      'Fire Alarm Panel', 'fire_alarm', 'Control Room', 'active',
      'DG Set', 'dg', 'Generator Room', 'active'
    ]
  );

  const [equipmentRows] = await connection.query('SELECT id, type FROM equipment');
  const ahuId = equipmentRows.find((item) => item.type === 'ahu')?.id;
  const fcuId = equipmentRows.find((item) => item.type === 'fcu')?.id;
  const energyId = equipmentRows.find((item) => item.type === 'energy_meter')?.id;
  const fireId = equipmentRows.find((item) => item.type === 'fire_alarm')?.id;
  const dgId = equipmentRows.find((item) => item.type === 'dg')?.id;

  if (ahuId) {
    await connection.query(
      'INSERT INTO ahu_data (equipment_id, supply_temp, return_temp, fan_status, auto_manual, damper_percentage, filter_dirty, alarm_status) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
      [ahuId, 23.4, 26.1, 'on', 'auto', 65, false, false]
    );
  }

  if (fcuId) {
    await connection.query(
      'INSERT INTO fcu_data (equipment_id, running_status, temperature, speed_status, occupancy_status) VALUES (?, ?, ?, ?, ?)',
      [fcuId, 'on', 24.7, 'medium', true]
    );
  }

  if (energyId) {
    for (let i = 0; i < 12; i += 1) {
      await connection.query(
        'INSERT INTO energy_logs (equipment_id, voltage, current, power_factor, kwh, timestamp) VALUES (?, ?, ?, ?, ?, ?)',
        [energyId, 415 + Math.random() * 5, 8 + Math.random() * 3, 0.9 + Math.random() * 0.05, 100 + Math.random() * 40, new Date(Date.now() - i * 3600000)]
      );
    }
  }

  if (dgId) {
    await connection.query(
      'INSERT INTO dg_logs (equipment_id, running_status, fuel_level, voltage, frequency, engine_temp) VALUES (?, ?, ?, ?, ?, ?)',
      [dgId, 'on', 72.5, 415, 49.8, 81.2]
    );
  }

  if (fireId) {
    await connection.query(
      'INSERT INTO alarms (equipment_id, alarm_type, priority, message, acknowledged) VALUES (?, ?, ?, ?, ?)',
      [fireId, 'Hooter Fault', 'medium', 'Hooter circuit warning', false]
    );
  }

  console.log('Database seed completed.');
  await connection.end();
};

run().catch((error) => {
  console.error(error);
  process.exit(1);
});