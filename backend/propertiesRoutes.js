import express from 'express';
import pkg from 'pg';
import jwt from 'jsonwebtoken';

const router = express.Router();
const { Pool } = pkg;

const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'DB_PFE',
  password: 'Rayan123',
  port: 5432,
});

// Middleware to verify JWT token
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  if (!token) return res.status(401).json({ message: 'Authentication required' });

  jwt.verify(token, 'your-secret-key', (err, user) => {
    if (err) return res.status(403).json({ message: 'Invalid or expired token' });
    req.user = user;
    next();
  });
};

// Get all properties
router.get('/', authenticateToken, async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM properties');
    res.json(result.rows);
  } catch (err) {
    console.error('Error fetching properties:', err);
    res.status(500).json({ error: err.message });
  }
});

// Add a new property
router.post('/', authenticateToken, async (req, res) => {
  const { title, price, location, type, bedrooms, bathrooms, square_footage, description, features, status } = req.body;
  try {
    const result = await pool.query(
      'INSERT INTO properties (title, price, location, type, bedrooms, bathrooms, square_footage, description, features, status) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) RETURNING *',
      [title, parseInt(price), location, type, parseInt(bedrooms), parseInt(bathrooms), parseInt(square_footage), description, features, status]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error('Error adding property:', err);
    res.status(500).json({ error: err.message });
  }
});

// Update a property
router.put('/:id', authenticateToken, async (req, res) => {
  const { id } = req.params;
  const { title, price, location, type, bedrooms, bathrooms, square_footage, description, features, status } = req.body;
  try {
    const result = await pool.query(
      'UPDATE properties SET title = $1, price = $2, location = $3, type = $4, bedrooms = $5, bathrooms = $6, square_footage = $7, description = $8, features = $9, status = $10 WHERE id = $11 RETURNING *',
      [title, parseInt(price), location, type, parseInt(bedrooms), parseInt(bathrooms), parseInt(square_footage), description, features, status, id]
    );
    if (result.rowCount === 0) return res.status(404).json({ error: 'Property not found' });
    res.json(result.rows[0]);
  } catch (err) {
    console.error('Error updating property:', err);
    res.status(500).json({ error: err.message });
  }
});

// Delete a property
router.delete('/:id', authenticateToken, async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query('DELETE FROM properties WHERE id = $1 RETURNING *', [id]);
    if (result.rowCount === 0) return res.status(404).json({ error: 'Property not found' });
    res.status(204).send();
  } catch (err) {
    console.error('Error deleting property:', err);
    res.status(500).json({ error: err.message });
  }
});

export default router;