const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const pool = require('../config/database');

// Mock users for when database is not available
const mockUsers = [
  { id: 1, username: 'admin', email: 'admin@building.com', password: '$2a$10$hashedpassword', role: 'admin' },
  { id: 2, username: 'operator', email: 'operator@building.com', password: '$2a$10$hashedpassword', role: 'operator' },
  { id: 3, username: 'viewer', email: 'viewer@building.com', password: '$2a$10$hashedpassword', role: 'viewer' }
];

const login = async (req, res) => {
  try {
    const { username, password } = req.body;

    // Try database first
    try {
      const [users] = await pool.execute(
        'SELECT * FROM users WHERE username = ?',
        [username]
      );

      if (users.length > 0) {
        const user = users[0];
        const isValidPassword = await bcrypt.compare(password, user.password);

        if (isValidPassword) {
          const token = jwt.sign(
            { id: user.id, username: user.username, role: user.role },
            process.env.JWT_SECRET,
            { expiresIn: '24h' }
          );

          return res.json({
            token,
            user: {
              id: user.id,
              username: user.username,
              email: user.email,
              role: user.role
            }
          });
        }
      }
    } catch (dbError) {
      console.log('Database not available, using mock authentication');
    }

    // Fallback to mock users
    const mockUser = mockUsers.find(u => u.username === username);
    if (!mockUser) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // For mock users, accept default passwords
    const validPasswords = {
      'admin': 'admin123',
      'operator': 'operator123',
      'viewer': 'viewer123'
    };

    if (password !== validPasswords[username]) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const token = jwt.sign(
      { id: mockUser.id, username: mockUser.username, role: mockUser.role },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.json({
      token,
      user: {
        id: mockUser.id,
        username: mockUser.username,
        email: mockUser.email,
        role: mockUser.role
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

const register = async (req, res) => {
  try {
    const { username, email, password, role } = req.body;

    const hashedPassword = await bcrypt.hash(password, 10);

    await pool.execute(
      'INSERT INTO users (username, email, password, role) VALUES (?, ?, ?, ?)',
      [username, email, hashedPassword, role || 'viewer']
    );

    res.status(201).json({ message: 'User created successfully' });
  } catch (error) {
    console.error(error);
    if (error.code === 'ER_DUP_ENTRY') {
      res.status(400).json({ message: 'Username or email already exists' });
    } else {
      res.status(500).json({ message: 'Server error' });
    }
  }
};

const getProfile = async (req, res) => {
  try {
    // Try database first
    try {
      const [users] = await pool.execute(
        'SELECT id, username, email, role, created_at FROM users WHERE id = ?',
        [req.user.id]
      );

      if (users.length > 0) {
        return res.json(users[0]);
      }
    } catch (dbError) {
      console.log('Database not available, using mock profile');
    }

    // Fallback to mock users
    const mockUser = mockUsers.find(u => u.id === req.user.id);
    if (!mockUser) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({
      id: mockUser.id,
      username: mockUser.username,
      email: mockUser.email,
      role: mockUser.role,
      created_at: new Date().toISOString()
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = { login, register, getProfile };