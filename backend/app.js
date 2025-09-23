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
app.get('/', (req, res) => res.send('API Running'));

setInterval(async () => {
  try {
    const conn = await pool.getConnection();
    await conn.query('SELECT 1'); // lightweight ping
    conn.release();
    console.log(`[${new Date().toISOString()}] ✅ MySQL keep-alive OK`);
  } catch (err) {
    console.error('❌ MySQL keep-alive failed:', err.message);
  }
}, 10 * 60 * 1000);

if (process.env.SELF_URL) {
  setInterval(async () => {
    try {
      await axios.get(`${process.env.SELF_URL}/`);
      console.log(`[${new Date().toISOString()}] 🔄 Self-ping success`);
    } catch (err) {
      console.error('❌ Self-ping failed:', err.message);
    }
  }, 5 * 60 * 1000);
}

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
