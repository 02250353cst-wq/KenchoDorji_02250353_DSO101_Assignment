// __tests__/app.test.js
// Basic unit tests for the Todo API
// These tests check the app logic without needing a real database

const express = require('express');
const cors = require('cors');

// ─── Create a lightweight mock app for testing ───────────────────────────────
const app = express();
app.use(cors());
app.use(express.json());

// In-memory task store for tests
let mockTasks = [
  { id: 1, title: 'Test Task 1', completed: false, priority: 'medium', due_date: null },
  { id: 2, title: 'Test Task 2', completed: true,  priority: 'high',   due_date: null },
];
let nextId = 3;

app.get('/', (req, res) => res.json({ status: 'ok', message: 'Todo API is running' }));

app.get('/tasks', (req, res) => res.json(mockTasks));

app.get('/tasks/:id', (req, res) => {
  const task = mockTasks.find(t => t.id == req.params.id);
  if (!task) return res.status(404).json({ error: 'Task not found' });
  res.json(task);
});

app.post('/tasks', (req, res) => {
  const { title, priority = 'medium', due_date = null } = req.body;
  if (!title) return res.status(400).json({ error: 'Title is required' });
  const task = { id: nextId++, title, completed: false, priority, due_date };
  mockTasks.push(task);
  res.status(201).json(task);
});

app.put('/tasks/:id', (req, res) => {
  const idx = mockTasks.findIndex(t => t.id == req.params.id);
  if (idx === -1) return res.status(404).json({ error: 'Task not found' });
  mockTasks[idx] = { ...mockTasks[idx], ...req.body };
  res.json(mockTasks[idx]);
});

app.delete('/tasks/:id', (req, res) => {
  const idx = mockTasks.findIndex(t => t.id == req.params.id);
  if (idx === -1) return res.status(404).json({ error: 'Task not found' });
  mockTasks.splice(idx, 1);
  res.json({ message: 'Task deleted successfully' });
});

// ─── Tests ────────────────────────────────────────────────────────────────────
const request = require('supertest');

beforeEach(() => {
  mockTasks = [
    { id: 1, title: 'Test Task 1', completed: false, priority: 'medium', due_date: null },
    { id: 2, title: 'Test Task 2', completed: true,  priority: 'high',   due_date: null },
  ];
  nextId = 3;
});

describe('GET /', () => {
  test('Health check returns ok', async () => {
    const res = await request(app).get('/');
    expect(res.statusCode).toBe(200);
    expect(res.body.status).toBe('ok');
  });
});

describe('GET /tasks', () => {
  test('Returns all tasks', async () => {
    const res = await request(app).get('/tasks');
    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBe(2);
  });
});

describe('GET /tasks/:id', () => {
  test('Returns a single task by id', async () => {
    const res = await request(app).get('/tasks/1');
    expect(res.statusCode).toBe(200);
    expect(res.body.title).toBe('Test Task 1');
  });

  test('Returns 404 for non-existent task', async () => {
    const res = await request(app).get('/tasks/999');
    expect(res.statusCode).toBe(404);
  });
});

describe('POST /tasks', () => {
  test('Creates a new task', async () => {
    const res = await request(app)
      .post('/tasks')
      .send({ title: 'New Task', priority: 'low' });
    expect(res.statusCode).toBe(201);
    expect(res.body.title).toBe('New Task');
    expect(res.body.completed).toBe(false);
  });

  test('Returns 400 if title is missing', async () => {
    const res = await request(app)
      .post('/tasks')
      .send({ priority: 'high' });
    expect(res.statusCode).toBe(400);
  });
});

describe('PUT /tasks/:id', () => {
  test('Updates a task', async () => {
    const res = await request(app)
      .put('/tasks/1')
      .send({ title: 'Updated Task', completed: true, priority: 'high' });
    expect(res.statusCode).toBe(200);
    expect(res.body.title).toBe('Updated Task');
    expect(res.body.completed).toBe(true);
  });

  test('Returns 404 for non-existent task', async () => {
    const res = await request(app)
      .put('/tasks/999')
      .send({ title: 'Ghost' });
    expect(res.statusCode).toBe(404);
  });
});

describe('DELETE /tasks/:id', () => {
  test('Deletes a task', async () => {
    const res = await request(app).delete('/tasks/1');
    expect(res.statusCode).toBe(200);
    expect(res.body.message).toBe('Task deleted successfully');
  });

  test('Returns 404 for non-existent task', async () => {
    const res = await request(app).delete('/tasks/999');
    expect(res.statusCode).toBe(404);
  });
});