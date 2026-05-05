require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mysql = require('mysql2/promise');

const app = express();
app.use(cors());
app.use(express.json());

// ─── DB Connection Pool ───────────────────────────────────────────────────────
const pool = mysql.createPool({
  host:     process.env.DB_HOST,
  user:     process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port:     process.env.DB_PORT || 3306,
  waitForConnections: true,
  connectionLimit: 10,
});

// ─── Init DB Table ────────────────────────────────────────────────────────────
async function initDB() {
  const conn = await pool.getConnection();
  await conn.execute(`
    CREATE TABLE IF NOT EXISTS tasks (
      id         INT AUTO_INCREMENT PRIMARY KEY,
      title      VARCHAR(255) NOT NULL,
      completed  BOOLEAN DEFAULT FALSE,
      priority   ENUM('low','medium','high') DEFAULT 'medium',
      due_date   DATE,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);
  conn.release();
  console.log('Database table ready');
}

// ─── Routes ───────────────────────────────────────────────────────────────────

// Health check
app.get('/', (req, res) => {
  res.json({ status: 'ok', message: 'Todo API is running' });
});

// GET all tasks
app.get('/tasks', async (req, res) => {
  try {
    const [rows] = await pool.execute('SELECT * FROM tasks ORDER BY created_at DESC');
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch tasks' });
  }
});

// GET single task
app.get('/tasks/:id', async (req, res) => {
  try {
    const [rows] = await pool.execute('SELECT * FROM tasks WHERE id = ?', [req.params.id]);
    if (rows.length === 0) return res.status(404).json({ error: 'Task not found' });
    res.json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch task' });
  }
});

// POST create task
app.post('/tasks', async (req, res) => {
  const { title, priority = 'medium', due_date = null } = req.body;
  if (!title) return res.status(400).json({ error: 'Title is required' });
  try {
    const [result] = await pool.execute(
      'INSERT INTO tasks (title, priority, due_date) VALUES (?, ?, ?)',
      [title, priority, due_date || null]
    );
    const [rows] = await pool.execute('SELECT * FROM tasks WHERE id = ?', [result.insertId]);
    res.status(201).json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to create task' });
  }
});

// PUT update task
app.put('/tasks/:id', async (req, res) => {
  const { title, completed, priority, due_date } = req.body;
  try {
    await pool.execute(
      'UPDATE tasks SET title = ?, completed = ?, priority = ?, due_date = ? WHERE id = ?',
      [title, completed, priority, due_date || null, req.params.id]
    );
    const [rows] = await pool.execute('SELECT * FROM tasks WHERE id = ?', [req.params.id]);
    if (rows.length === 0) return res.status(404).json({ error: 'Task not found' });
    res.json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to update task' });
  }
});

// DELETE task
app.delete('/tasks/:id', async (req, res) => {
  try {
    const [result] = await pool.execute('DELETE FROM tasks WHERE id = ?', [req.params.id]);
    if (result.affectedRows === 0) return res.status(404).json({ error: 'Task not found' });
    res.json({ message: 'Task deleted successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to delete task' });
  }
});

// ─── Start Server ─────────────────────────────────────────────────────────────
const PORT = process.env.PORT || 5000;
initDB().then(() => {
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}).catch(err => {
  console.error('Failed to connect to database:', err.message);
  process.exit(1);
});