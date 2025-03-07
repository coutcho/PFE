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

// Middleware to authenticate JWT token
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

// **GET /api/properties** - Fetch all properties
router.get('/', async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT id, title, price, location, type, bedrooms, bathrooms, etage, square_footage, description, features, status, lat, long, images_path, equipe AS equipped FROM properties'
    );
    console.log('Query result:', result.rows); // Debug log
    res.json(result.rows);
  } catch (err) {
    console.error('Error fetching properties:', err);
    res.status(500).json({ error: err.message });
  }
});

// **GET /api/properties/:id** - Fetch a single property by ID
router.get('/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query(
      'SELECT id, title, price, location, type, bedrooms, bathrooms, etage, square_footage, description, features, status, lat, long, images_path, equipe AS equipped FROM properties WHERE id = $1',
      [id]
    );
    if (result.rows.length === 0) return res.status(404).json({ message: 'Property not found' });
    console.log('Fetched property:', result.rows[0]); // Debug log
    res.json(result.rows[0]);
  } catch (err) {
    console.error('Error fetching property:', err);
    res.status(500).json({ error: err.message });
  }
});

// **POST /api/properties** - Create a new property
router.post('/', authenticateToken, upload, async (req, res) => {
  const { title, price, location, type, bedrooms, bathrooms, etage, square_footage, description, features, status, lat, long, equipped } = req.body;
  const images_path = req.files ? req.files.map(file => `/uploads/${file.filename}`) : [];

  try {
    const parsedFeatures = typeof features === 'string' ? JSON.parse(features) : features;
    const parsedEquipped = equipped === 'true' ? true : equipped === 'false' ? false : false; // Default to false if not 'true' or 'false'

    const result = await pool.query(
      'INSERT INTO properties (title, price, location, type, bedrooms, bathrooms, etage, square_footage, description, features, status, lat, long, images_path, equipe) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15) RETURNING id, title, price, location, type, bedrooms, bathrooms, etage, square_footage, description, features, status, lat, long, images_path, equipe AS equipped',
      [
        title,
        parseInt(price),
        location,
        type,
        parseInt(bedrooms),
        type === 'villa' && bathrooms ? parseInt(bathrooms) : null,
        type !== 'villa' && etage ? parseInt(etage) : null,
        parseInt(square_footage),
        description,
        parsedFeatures,
        status,
        lat ? parseFloat(lat) : null,
        long ? parseFloat(long) : null,
        JSON.stringify(images_path),
        parsedEquipped,
      ]
    );
    console.log('Inserted property:', result.rows[0]); // Debug log
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error('Error adding property:', err);
    res.status(500).json({ error: err.message });
  }
});

// **PUT /api/properties/:id** - Update an existing property
router.put('/:id', authenticateToken, upload, async (req, res) => {
  const { id } = req.params;
  const { title, price, location, type, bedrooms, bathrooms, etage, square_footage, description, features, status, lat, long, images_path, equipped } = req.body;

  let existingImages = [];
  try {
    existingImages = images_path ? JSON.parse(images_path) : [];
  } catch (err) {
    console.error('Error parsing images_path:', err);
    existingImages = [];
  }

  const newImages = req.files && req.files.length > 0 ? req.files.map(file => `/uploads/${file.filename}`) : [];
  const updatedImagesPath = [...existingImages, ...newImages];
  const parsedEquipped = equipped === 'true' ? true : equipped === 'false' ? false : false; // Default to false if not 'true' or 'false'

  try {
    const parsedFeatures = typeof features === 'string' ? JSON.parse(features) : features;

    const result = await pool.query(
      'UPDATE properties SET title = $1, price = $2, location = $3, type = $4, bedrooms = $5, bathrooms = $6, etage = $7, square_footage = $8, description = $9, features = $10, status = $11, lat = $12, long = $13, images_path = $14, equipe = $15 WHERE id = $16 RETURNING id, title, price, location, type, bedrooms, bathrooms, etage, square_footage, description, features, status, lat, long, images_path, equipe AS equipped',
      [
        title,
        parseInt(price),
        location,
        type,
        parseInt(bedrooms),
        type === 'villa' && bathrooms ? parseInt(bathrooms) : null,
        type !== 'villa' && etage ? parseInt(etage) : null,
        parseInt(square_footage),
        description,
        parsedFeatures,
        status,
        lat ? parseFloat(lat) : null,
        long ? parseFloat(long) : null,
        JSON.stringify(updatedImagesPath),
        parsedEquipped,
        id,
      ]
    );
    if (result.rowCount === 0) return res.status(404).json({ error: 'Property not found' });
    console.log('Updated property:', result.rows[0]); // Debug log
    res.json(result.rows[0]);
  } catch (err) {
    console.error('Error updating property:', err);
    res.status(500).json({ error: err.message });
  }
});

// **DELETE /api/properties/:id** - Delete a property
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