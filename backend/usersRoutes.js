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

// Middleware to verify JWT token for any authenticated user
const authenticateUser = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  if (!token) return res.status(401).json({ message: 'Authentication required' });

  jwt.verify(token, 'your-secret-key', (err, user) => {
    if (err) return res.status(403).json({ message: 'Invalid or expired token' });
    req.user = user;
    next();
  });
};

// Validate role is one of the allowed values
const validateRole = (role) => {
  const allowedRoles = ['admin', 'chauffeur', 'agent'];
  return allowedRoles.includes(role);
};

// Get all users (admin only)
router.get('/', authenticateAdmin, async (req, res) => {
  try {
    const result = await pool.query('SELECT id, fullname AS name, email, role, phone, join_date AS joinDate FROM users');
    res.json(result.rows);
  } catch (err) {
    console.error('Error fetching users:', err);
    res.status(500).json({ message: 'Failed to fetch users', error: err.message });
  }
});

// Get all agents (public access for any authenticated user)
router.get('/agents', authenticateUser, async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT id, fullname AS name, email, phone FROM users WHERE role = $1',
      ['agent']
    );
    res.json(result.rows);
  } catch (err) {
    console.error('Error fetching agents:', err);
    res.status(500).json({ message: 'Failed to fetch agents', error: err.message });
  }
});

// Get a specific agent by ID (public access for any authenticated user)
router.get('/agents/:id', authenticateUser, async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query(
      'SELECT id, fullname AS name, email, phone FROM users WHERE id = $1 AND role = $2',
      [id, 'agent']
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Agent not found' });
    }
    
    res.json(result.rows[0]);
  } catch (err) {
    console.error('Error fetching agent:', err);
    res.status(500).json({ message: 'Failed to fetch agent', error: err.message });
  }
});

// Get current user info (public access for any authenticated user)
router.get('/me', authenticateUser, async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT id, email, fullname, role FROM users WHERE id = $1',
      [req.user.id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    res.json(result.rows[0]);
  } catch (err) {
    console.error('Error fetching user info:', err);
    res.status(500).json({ error: err.message });
  }
});

// Add a new user
router.post('/', authenticateAdmin, async (req, res) => {
  const { name, email, role, phone, joinDate, password } = req.body;
  
  try {
    // Validate role
    if (!validateRole(role)) {
      return res.status(400).json({ message: 'Invalid role. Must be admin, chauffeur, or agent' });
    }
    
    // First check if email already exists
    const existingUser = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    if (existingUser.rows.length > 0) {
      return res.status(400).json({ message: 'Email address already in use' });
    }
    
    const hashedPassword = await bcrypt.hash(password, 10);
    
    const result = await pool.query(
      'INSERT INTO users (fullname, email, pass, role, phone, join_date) VALUES ($1, $2, $3, $4, $5, $6) RETURNING id, fullname AS name, email, role, phone, join_date AS joinDate',
      [name, email, hashedPassword, role, phone, joinDate]
    );
    
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error('Error adding user:', err);
    if (err.code === '23505') {
      if (err.constraint === 'users_email_key') {
        return res.status(400).json({ message: 'Email address already in use' });
      }
    }
    res.status(500).json({ message: 'Failed to add user', error: err.message });
  }
});

// Update a user
router.put('/:id', authenticateAdmin, async (req, res) => {
  const { id } = req.params;
  const { name, email, role, phone, joinDate, password } = req.body;
  
  try {
    // Validate role if provided
    if (role && !validateRole(role)) {
      return res.status(400).json({ message: 'Invalid role. Must be admin, chauffeur, or agent' });
    }
    
    // Check if the user exists
    const userExists = await pool.query('SELECT * FROM users WHERE id = $1', [id]);
    if (userExists.rows.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Check if the email is already used by another user
    if (email) {
      const existingEmail = await pool.query('SELECT * FROM users WHERE email = $1 AND id != $2', [email, id]);
      if (existingEmail.rows.length > 0) {
        return res.status(400).json({ message: 'Email address already in use by another user' });
      }
    }
    
    // Start building the query
    let query = 'UPDATE users SET ';
    const values = [];
    const updateFields = [];
    
    if (name) {
      values.push(name);
      updateFields.push(`fullname = $${values.length}`);
    }
    
    if (email) {
      values.push(email);
      updateFields.push(`email = $${values.length}`);
    }
    
    if (role) {
      values.push(role);
      updateFields.push(`role = $${values.length}`);
    }
    
    if (phone) {
      values.push(phone);
      updateFields.push(`phone = $${values.length}`);
    }
    
    if (joinDate) {
      values.push(joinDate);
      updateFields.push(`join_date = $${values.length}`);
    }
    
    if (password && password.trim() !== '') {
      const hashedPassword = await bcrypt.hash(password, 10);
      values.push(hashedPassword);
      updateFields.push(`pass = $${values.length}`);
    }
    
    if (updateFields.length === 0) {
      const result = await pool.query(
        'SELECT id, fullname AS name, email, role, phone, join_date AS joinDate FROM users WHERE id = $1',
        [id]
      );
      return res.json(result.rows[0]);
    }
    
    query += updateFields.join(', ');
    query += ' WHERE id = $' + (values.length + 1);
    query += ' RETURNING id, fullname AS name, email, role, phone, join_date AS joinDate';
    
    values.push(id);
    
    const result = await pool.query(query, values);
    
    res.json(result.rows[0]);
  } catch (err) {
    console.error('Error updating user:', err);
    if (err.code === '23505') {
      if (err.constraint === 'users_email_key') {
        return res.status(400).json({ message: 'Email address already in use' });
      }
    }
    res.status(500).json({ message: 'Failed to update user', error: err.message });
  }
});

// Delete a user
router.delete('/:id', authenticateAdmin, async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query('DELETE FROM users WHERE id = $1 RETURNING id', [id]);
    if (result.rowCount === 0) return res.status(404).json({ message: 'User not found' });
    res.status(204).send();
  } catch (err) {
    console.error('Error deleting user:', err);
    res.status(500).json({ message: 'Failed to delete user', error: err.message });
  }
});

export default router;