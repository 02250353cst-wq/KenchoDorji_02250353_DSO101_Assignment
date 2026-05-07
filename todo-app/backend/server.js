require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { Pool } = require('pg'); // Changed to pg

const app = express();
app.use(cors());
app.use(express.json());

// ─── DB Connection Pool (Postgres) ──────────────────────────────────────────
const pool = new Pool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT || 5432,
  // Required for many cloud DB providers like Render/ElephantSQL
  ssl: {
    rejectUnauthorized: false
  }
});

// ─── Init DB Table ────────────────────────────────────────────────────────────
async function initDB() {
  const client = await pool.connect();
  try {
    await client.query(`
      CREATE TABLE IF NOT EXISTS tasks (
        id         SERIAL PRIMARY KEY,
        title      VARCHAR(255) NOT NULL,
        completed  BOOLEAN DEFAULT FALSE,
        priority   VARCHAR(20) DEFAULT 'medium',
        due_date   DATE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('PostgreSQL table ready');
  } finally {
    client.release();
  }
}

// ─── Routes (Updated for Postgres Syntax) ─────────────────────────────────────

app.get('/', (req, res) => {
  res.json({ status: 'ok', message: 'Todo API is running' });
});

app.get('/tasks', async (req, res) => {
  try {
    const { rows } = await pool.query('SELECT * FROM tasks ORDER BY created_at DESC');
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch tasks' });
  }
});

app.post('/tasks', async (req, res) => {
  const { title, priority = 'medium', due_date = null } = req.body;
  try {
    const { rows } = await pool.query(
      'INSERT INTO tasks (title, priority, due_date) VALUES ($1, $2, $3) RETURNING *',
      [title, priority, due_date]
    );
    res.status(201).json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to create task' });
  }
});

// ─── Start Server (The Deployment Fix) ────────────────────────────────────────
const PORT = process.env.PORT || 10000;

// We start listening IMMEDIATELY so Render's port scan succeeds
app.listen(PORT, "0.0.0.0", () => {
  console.log(`Server running on port ${PORT}`);
  
  // Try to init DB in the background
  initDB().catch(err => {
    console.error('Database initialization failed:', err.stack);
  });
});