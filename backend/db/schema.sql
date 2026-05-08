-- Smart Building Monitoring Database Schema

CREATE DATABASE IF NOT EXISTS smart_building_db;
USE smart_building_db;

-- Users table
CREATE TABLE users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  username VARCHAR(50) UNIQUE NOT NULL,
  email VARCHAR(100) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  role ENUM('admin', 'operator', 'viewer') DEFAULT 'viewer',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Equipment table
CREATE TABLE equipment (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  type ENUM('ahu', 'fcu', 'energy_meter', 'fire_alarm', 'dg') NOT NULL,
  location VARCHAR(100),
  status ENUM('active', 'inactive', 'maintenance') DEFAULT 'active',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- AHU Data table
CREATE TABLE ahu_data (
  id INT AUTO_INCREMENT PRIMARY KEY,
  equipment_id INT,
  supply_temp DECIMAL(5,2),
  return_temp DECIMAL(5,2),
  fan_status ENUM('on', 'off'),
  auto_manual ENUM('auto', 'manual'),
  damper_percentage INT,
  filter_dirty BOOLEAN DEFAULT FALSE,
  alarm_status BOOLEAN DEFAULT FALSE,
  timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (equipment_id) REFERENCES equipment(id)
);

-- FCU Data table
CREATE TABLE fcu_data (
  id INT AUTO_INCREMENT PRIMARY KEY,
  equipment_id INT,
  running_status ENUM('on', 'off'),
  temperature DECIMAL(5,2),
  speed_status ENUM('low', 'medium', 'high'),
  occupancy_status BOOLEAN DEFAULT FALSE,
  timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (equipment_id) REFERENCES equipment(id)
);

-- Alarms table
CREATE TABLE alarms (
  id INT AUTO_INCREMENT PRIMARY KEY,
  equipment_id INT,
  alarm_type VARCHAR(100),
  priority ENUM('low', 'medium', 'high'),
  message TEXT,
  acknowledged BOOLEAN DEFAULT FALSE,
  acknowledged_by INT,
  timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (equipment_id) REFERENCES equipment(id),
  FOREIGN KEY (acknowledged_by) REFERENCES users(id)
);

-- Energy Logs table
CREATE TABLE energy_logs (
  id INT AUTO_INCREMENT PRIMARY KEY,
  equipment_id INT,
  voltage DECIMAL(7,2),
  current DECIMAL(7,2),
  power_factor DECIMAL(3,2),
  kwh DECIMAL(10,2),
  timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (equipment_id) REFERENCES equipment(id)
);

-- DG Logs table
CREATE TABLE dg_logs (
  id INT AUTO_INCREMENT PRIMARY KEY,
  equipment_id INT,
  running_status ENUM('on', 'off'),
  fuel_level DECIMAL(5,2),
  voltage DECIMAL(7,2),
  frequency DECIMAL(5,2),
  engine_temp DECIMAL(5,2),
  timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (equipment_id) REFERENCES equipment(id)
);

-- Insert sample data
INSERT INTO users (username, email, password, role) VALUES
('admin', 'admin@building.com', '$2a$10$hashedpassword', 'admin'),
('operator', 'operator@building.com', '$2a$10$hashedpassword', 'operator'),
('viewer', 'viewer@building.com', '$2a$10$hashedpassword', 'viewer');

INSERT INTO equipment (name, type, location) VALUES
('AHU-01', 'ahu', 'Floor 1'),
('FCU-01', 'fcu', 'Room 101'),
('Energy Meter 1', 'energy_meter', 'Main Panel'),
('Fire Alarm Panel', 'fire_alarm', 'Control Room'),
('DG Set', 'dg', 'Generator Room');