const mysql = require('mysql2/promise');

const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'network_app',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  enableKeepAlive: true,
  keepAliveInitialDelay: 10000,
});

pool.on('connection', (conn) => {
  console.log('🔗 New MySQL connection established');
  conn.on('error', (err) => {
    console.error('⚠️ MySQL connection error:', err.code, err.message);
  });
  conn.on('close', () => console.warn('🔌 MySQL connection closed'));
});

module.exports = pool;
