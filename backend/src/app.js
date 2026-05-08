const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');

// Load environment variables
dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Serve static files from the React app build directory
app.use(express.static(path.join(__dirname, '../../frontend/dist')));

// Routes
const authRoutes = require('./routes/auth');
const dashboardRoutes = require('./routes/dashboard');
const ahuRoutes = require('./routes/ahu');
const fcuRoutes = require('./routes/fcu');
const energyRoutes = require('./routes/energy');
const fireRoutes = require('./routes/fire');
const dgRoutes = require('./routes/dg');
const alarmsRoutes = require('./routes/alarms');
const equipmentRoutes = require('./routes/equipment');
const usersRoutes = require('./routes/users');
const trendsRoutes = require('./routes/trends');
const adminRoutes = require('./routes/admin');

app.use('/api/auth', authRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/ahu', ahuRoutes);
app.use('/api/fcu', fcuRoutes);
app.use('/api/energy', energyRoutes);
app.use('/api/fire', fireRoutes);
app.use('/api/dg', dgRoutes);
app.use('/api/alarms', alarmsRoutes);
app.use('/api/equipment', equipmentRoutes);
app.use('/api/users', usersRoutes);
app.use('/api/trends', trendsRoutes);
app.use('/api/admin', adminRoutes);

// Catch all handler: send back React's index.html file for client-side routing
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../../frontend/dist/index.html'));
});

app.get('/', (req, res) => {
  res.json({ message: 'Smart Building Monitoring Dashboard API' });
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

module.exports = app;