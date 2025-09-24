require('dotenv').config();
const express = require('express');
const cors = require('cors');
const axios = require('axios');
const pool = require('./db');
const routes = require('./routes');

const app = express();
app.use(cors());
app.use(express.json());

app.use('/api', routes);
app.get('/', (req, res) => res.send('Neuronotes API Running'));

async function pingDB() {
  try {
    const conn = await pool.getConnection();
    await conn.query('SELECT 1');
    conn.release();
    console.log(`[${new Date().toISOString()}] ✅ MySQL keep-alive OK`);
  } catch (err) {
    console.warn(`[${new Date().toISOString()}] ⚠️ MySQL ping failed, retrying...`);
    try {
      const conn = await pool.getConnection();
      await conn.query('SELECT 1');
      conn.release();
      console.log(`[${new Date().toISOString()}] ✅ MySQL recovered on retry`);
    } catch (retryErr) {
      console.error(`[${new Date().toISOString()}] ❌ MySQL keep-alive failed:`, retryErr.message);
    }
  }
}

setInterval(pingDB, 5 * 60 * 1000);

if (process.env.SELF_URL) {
  setInterval(async () => {
    try {
      await axios.get(`${process.env.SELF_URL}/`);
      console.log(`[${new Date().toISOString()}] 🔄 Self-ping success`);
    } catch (err) {
      console.error(`[${new Date().toISOString()}] ❌ Self-ping failed:`, err.message);
    }
  }, 5 * 60 * 1000);
}

process.on('SIGINT', async () => {
  console.log('🛑 Shutting down gracefully...');
  try {
    await pool.end();
    console.log('✅ MySQL pool closed');
  } catch (err) {
    console.error('⚠️ Error closing MySQL pool:', err.message);
  }
  process.exit(0);
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
