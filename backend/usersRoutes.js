import express from 'express';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import pkg from 'pg';

const router = express.Router();
const { Pool } = pkg;

const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'DB_PFE',
  password: 'Rayan123',
  port: 5432,
});

// Middleware to verify JWT token and admin role
const authenticateAdmin = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  if (!token) return res.status(401).json({ message: 'Authentication required' });

  jwt.verify(token, 'your-secret-key', (err, user) => {
    if (err) return res.status(403).json({ message: 'Invalid or expired token' });
    if (user.role !== 'admin') return res.status(403).json({ message: 'Admin access required' });
    req.user = user;
    next();
  });
};

// Get all users
router.get('/', authenticateAdmin, async (req, res) => {
  try {
    const result = await pool.query('SELECT id, fullname AS name, email, role, phone, join_date AS joinDate FROM users');
    res.json(result.rows);
  } catch (err) {
    console.error('Error fetching users:', err);
    res.status(500).json({ error: err.message });
  }
});

// Add a new user
router.post('/', authenticateAdmin, async (req, res) => {
  const { name, email, role, phone, joinDate, password } = req.body;
  try {
    const hashedPassword = await bcrypt.hash(password, 10); // No default here, frontend must send it
    const result = await pool.query(
      'INSERT INTO users (fullname, email, pass, role, phone, join_date) VALUES ($1, $2, $3, $4, $5, $6) RETURNING id, fullname AS name, email, role, phone, join_date AS joinDate',
      [name, email, hashedPassword, role, phone, joinDate]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error('Error adding user:', err);
    res.status(500).json({ error: err.message });
  }
});

// Update a user
router.put('/:id', authenticateAdmin, async (req, res) => {
  const { id } = req.params;
  const { name, email, role, phone, joinDate } = req.body;
  try {
    const result = await pool.query(
      'UPDATE users SET fullname = $1, email = $2, role = $3, phone = $4, join_date = $5 WHERE id = $6 RETURNING id, fullname AS name, email, role, phone, join_date AS joinDate',
      [name, email, role, phone, joinDate, id]
    );
    if (result.rowCount === 0) return res.status(404).json({ error: 'User not found' });
    res.json(result.rows[0]);
  } catch (err) {
    console.error('Error updating user:', err);
    res.status(500).json({ error: err.message });
  }
});

// Delete a user
router.delete('/:id', authenticateAdmin, async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query('DELETE FROM users WHERE id = $1 RETURNING *', [id]);
    if (result.rowCount === 0) return res.status(404).json({ error: 'User not found' });
    res.status(204).send();
  } catch (err) {
    console.error('Error deleting user:', err);
    res.status(500).json({ error: err.message });
  }
});

export default router;