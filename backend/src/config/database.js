const mysql = require('mysql2/promise');

const dbConfig = {
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
};

// Create a mock pool for when database is not available
const createMockPool = () => ({
  execute: async () => {
    throw new Error('Database not available');
  }
});

let pool;

try {
  pool = mysql.createPool(dbConfig);
  // Test the connection
  pool.execute('SELECT 1').catch(() => {
    console.log('Database not available, using mock data');
    pool = createMockPool();
  });
} catch (error) {
  console.log('Database not available, using mock data');
  pool = createMockPool();
}

module.exports = pool;