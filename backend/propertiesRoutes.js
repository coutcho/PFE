import express from 'express';
import pkg from 'pg';
import jwt from 'jsonwebtoken';
import multer from 'multer';
import path from 'path';

const router = express.Router();
const { Pool } = pkg;

const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'DB_PFE',
  password: 'Rayan123',
  port: 5432,
});

// Multer configuration for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'public/uploads/');
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  },
});
const upload = multer({ storage }).array('images', 10);

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
router.get('/', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM properties');
    res.json(result.rows);
  } catch (err) {
    console.error('Error fetching properties:', err);
    res.status(500).json({ error: err.message });
  }
});

// Get a single property by ID
router.get('/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query('SELECT * FROM properties WHERE id = $1', [id]);
    if (result.rows.length === 0) return res.status(404).json({ message: 'Property not found' });
    res.json(result.rows[0]);
  } catch (err) {
    console.error('Error fetching property:', err);
    res.status(500).json({ error: err.message });
  }
});

router.post('/', authenticateToken, upload, async (req, res) => {
  const { title, price, location, type, bedrooms, bathrooms, square_footage, description, features, status, lat, long } = req.body;
  const images_path = req.files ? req.files.map(file => `/uploads/${file.filename}`) : [];

  try {
    const parsedFeatures = typeof features === 'string' ? JSON.parse(features) : features;
    const result = await pool.query(
      'INSERT INTO properties (title, price, location, type, bedrooms, bathrooms, square_footage, description, features, status, lat, long, images_path) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13) RETURNING *',
      [
        title,
        parseInt(price),
        location,
        type,
        parseInt(bedrooms),
        parseInt(bathrooms),
        parseInt(square_footage),
        description,
        parsedFeatures,
        status,
        lat ? parseFloat(lat) : null,
        long ? parseFloat(long) : null,
        JSON.stringify(images_path), // Explicitly stringify to ensure valid JSON
      ]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error('Error adding property:', err);
    res.status(500).json({ error: err.message });
  }
});
// Update a property with image upload
router.put('/:id', authenticateToken, upload, async (req, res) => {
  const { id } = req.params;
  const { title, price, location, type, bedrooms, bathrooms, square_footage, description, features, status, lat, long, images_path } = req.body;
  console.log('req.body.images_path type:', typeof images_path);
  console.log('req.body.images_path value:', images_path);
  
  let existingImages = [];
  try {
    existingImages = images_path ? JSON.parse(images_path) : [];
  } catch (err) {
    console.error('Error parsing images_path:', err);
    existingImages = [];
  }
  
  const newImages = req.files && req.files.length > 0 ? req.files.map(file => `/uploads/${file.filename}`) : [];
  const updatedImagesPath = [...existingImages, ...newImages];
  console.log('updatedImagesPath:', updatedImagesPath);

  try {
    const parsedFeatures = typeof features === 'string' ? JSON.parse(features) : features;
    const result = await pool.query(
      'UPDATE properties SET title = $1, price = $2, location = $3, type = $4, bedrooms = $5, bathrooms = $6, square_footage = $7, description = $8, features = $9, status = $10, lat = $11, long = $12, images_path = $13 WHERE id = $14 RETURNING *',
      [
        title,
        parseInt(price),
        location,
        type,
        parseInt(bedrooms),
        parseInt(bathrooms),
        parseInt(square_footage),
        description,
        parsedFeatures,
        status,
        lat ? parseFloat(lat) : null,
        long ? parseFloat(long) : null,
        JSON.stringify(updatedImagesPath), // Explicitly stringify to ensure valid JSON
        id,
      ]
    );
    if (result.rowCount === 0) return res.status(404).json({ error: 'Property not found' });
    res.json(result.rows[0]);
  } catch (err) {
    console.error('Error updating property:', err);
    res.status(500).json({ error: err.message });
  }
});

router.delete('/:id', authenticateToken, async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query('DELETE FROM properties WHERE id = $1 RETURNING *', [id]);
    if (result.rowCount === 0) {
      return res.status(404).json({ message: 'Property not found' });
    }
    res.status(204).send(); // Success, no content
  } catch (err) {
    console.error('Error deleting property:', err);
    res.status(500).json({ error: err.message });
  }
});

export default router;