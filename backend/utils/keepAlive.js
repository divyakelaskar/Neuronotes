// keepAlive.js
const pool = require('./db');

async function keepMySQLAlive() {
  try {
    const conn = await pool.getConnection();
    await conn.query('SELECT 1');
    conn.release();
    console.log(`[${new Date().toISOString()}] MySQL keep-alive successful`);
  } catch (err) {
    console.error('MySQL keep-alive failed:', err.message);
  }
}

module.exports = keepMySQLAlive;
