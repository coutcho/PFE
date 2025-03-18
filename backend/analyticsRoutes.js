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

const isAdmin = (req, res, next) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Admin access required' });
  }
  next();
};

// Property Analytics
router.get('/properties/total', authenticateToken, isAdmin, async (req, res) => {
  try {
    const result = await pool.query('SELECT COUNT(*) FROM properties');
    res.json({ totalProperties: parseInt(result.rows[0].count, 10) || 0 });
  } catch (err) {
    console.error('Error fetching total properties:', err.stack);
    res.status(500).json({ error: 'Failed to fetch total properties', details: err.message });
  }
});

router.get('/properties/by-type', authenticateToken, isAdmin, async (req, res) => {
  try {
    const result = await pool.query('SELECT type, COUNT(*) as count FROM properties GROUP BY type');
    res.json(result.rows);
  } catch (err) {
    console.error('Error fetching properties by type:', err.stack);
    res.status(500).json({ error: 'Failed to fetch properties by type', details: err.message });
  }
});

router.get('/properties/by-status', authenticateToken, isAdmin, async (req, res) => {
  try {
    const result = await pool.query('SELECT status, COUNT(*) as count FROM properties GROUP BY status');
    res.json(result.rows);
  } catch (err) {
    console.error('Error fetching properties by status:', err.stack);
    res.status(500).json({ error: 'Failed to fetch properties by status', details: err.message });
  }
});

router.get('/properties/by-location', authenticateToken, isAdmin, async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT 
        CASE 
          WHEN LOWER(location) LIKE '%adrar%' THEN 'Adrar'
          WHEN LOWER(location) LIKE '%chlef%' THEN 'Chlef'
          WHEN LOWER(location) LIKE '%laghouat%' THEN 'Laghouat'
          WHEN LOWER(location) LIKE '%oum el bouaghi%' THEN 'Oum El Bouaghi'
          WHEN LOWER(location) LIKE '%batna%' THEN 'Batna'
          WHEN LOWER(location) LIKE '%béjaïa%' THEN 'Béjaïa'
          WHEN LOWER(location) LIKE '%biskra%' THEN 'Biskra'
          WHEN LOWER(location) LIKE '%béchar%' THEN 'Béchar'
          WHEN LOWER(location) LIKE '%blida%' THEN 'Blida'
          WHEN LOWER(location) LIKE '%algiers%' THEN 'Algiers'
          ELSE 'Others'
        END AS location,
        COUNT(*) as count 
      FROM properties 
      GROUP BY 
        CASE 
          WHEN LOWER(location) LIKE '%adrar%' THEN 'Adrar'
          WHEN LOWER(location) LIKE '%chlef%' THEN 'Chlef'
          WHEN LOWER(location) LIKE '%laghouat%' THEN 'Laghouat'
          WHEN LOWER(location) LIKE '%oum el bouaghi%' THEN 'Oum El Bouaghi'
          WHEN LOWER(location) LIKE '%batna%' THEN 'Batna'
          WHEN LOWER(location) LIKE '%béjaïa%' THEN 'Béjaïa'
          WHEN LOWER(location) LIKE '%biskra%' THEN 'Biskra'
          WHEN LOWER(location) LIKE '%béchar%' THEN 'Béchar'
          WHEN LOWER(location) LIKE '%blida%' THEN 'Blida'
          WHEN LOWER(location) LIKE '%algiers%' THEN 'Algiers'
          ELSE 'Others'
        END
    `);
    console.log('Properties by location raw data:', result.rows);
    res.json(result.rows);
  } catch (err) {
    console.error('Error fetching properties by location:', err.stack);
    res.status(500).json({ error: 'Failed to fetch properties by location', details: err.message });
  }
});

router.get('/properties/average-price', authenticateToken, isAdmin, async (req, res) => {
  try {
    const result = await pool.query('SELECT AVG(price) as averageprice FROM properties');
    res.json({ averagePrice: parseFloat(result.rows[0].averageprice) || 0 });
  } catch (err) {
    console.error('Error fetching average price:', err.stack);
    res.status(500).json({ error: 'Failed to fetch average price', details: err.message });
  }
});

router.get('/properties/price-trends', authenticateToken, isAdmin, async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT DATE_TRUNC('month', created_at) as month, AVG(price) as averageprice
      FROM properties
      GROUP BY month
      ORDER BY month
    `);
    res.json(result.rows);
  } catch (err) {
    console.error('Error fetching price trends:', err.stack);
    res.status(500).json({ error: 'Failed to fetch price trends', details: err.message });
  }
});

router.get('/properties/new-over-time', authenticateToken, isAdmin, async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT DATE_TRUNC('month', created_at) as month, COUNT(*) as count
      FROM properties
      GROUP BY month
      ORDER BY month
    `);
    res.json(result.rows);
  } catch (err) {
    console.error('Error fetching new properties over time:', err.stack);
    res.status(500).json({ error: 'Failed to fetch new properties over time', details: err.message });
  }
});

router.get('/properties/per-agent', authenticateToken, isAdmin, async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT u.fullname as agentname, COUNT(p.id) as propertycount
      FROM users u
      LEFT JOIN properties p ON u.id = p.user_id
      WHERE u.role = 'agent'
      GROUP BY u.fullname
    `);
    res.json(result.rows);
  } catch (err) {
    console.error('Error fetching properties per agent:', err.stack);
    res.status(500).json({ error: 'Failed to fetch properties per agent', details: err.message });
  }
});

// User Analytics
router.get('/users/total', authenticateToken, isAdmin, async (req, res) => {
  try {
    const result = await pool.query("SELECT COUNT(*) FROM users WHERE role = 'user'");
    res.json({ totalUsers: parseInt(result.rows[0].count, 10) || 0 });
  } catch (err) {
    console.error('Error fetching total users:', err.stack);
    res.status(500).json({ error: 'Failed to fetch total users', details: err.message });
  }
});

router.get('/users/by-role', authenticateToken, isAdmin, async (req, res) => {
  try {
    const result = await pool.query('SELECT role, COUNT(*) as count FROM users GROUP BY role');
    res.json(result.rows);
  } catch (err) {
    console.error('Error fetching users by role:', err.stack);
    res.status(500).json({ error: 'Failed to fetch users by role', details: err.message });
  }
});

router.get('/users/new-over-time', authenticateToken, isAdmin, async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT DATE_TRUNC('month', join_date) as month, COUNT(*) as count
      FROM users
      GROUP BY month
      ORDER BY month
    `);
    res.json(result.rows);
  } catch (err) {
    console.error('Error fetching new users over time:', err.stack);
    res.status(500).json({ error: 'Failed to fetch new users over time', details: err.message });
  }
});

// Inquiry Analytics
router.get('/inquiries/total', authenticateToken, isAdmin, async (req, res) => {
  try {
    const result = await pool.query('SELECT COUNT(*) FROM inquiries');
    res.json({ totalInquiries: parseInt(result.rows[0].count, 10) || 0 });
  } catch (err) {
    console.error('Error fetching total inquiries:', err.stack);
    res.status(500).json({ error: 'Failed to fetch total inquiries', details: err.message });
  }
});

router.get('/inquiries/over-time', authenticateToken, isAdmin, async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT DATE_TRUNC('month', created_at) as month, COUNT(*) as count
      FROM inquiries
      GROUP BY month
      ORDER BY month
    `);
    res.json(result.rows);
  } catch (err) {
    console.error('Error fetching inquiries over time:', err.stack);
    res.status(500).json({ error: 'Failed to fetch inquiries over time', details: err.message });
  }
});

router.get('/inquiries/per-property', authenticateToken, isAdmin, async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT property_id, COUNT(*) as count
      FROM inquiries
      GROUP BY property_id
      ORDER BY count DESC
    `);
    res.json(result.rows);
  } catch (err) {
    console.error('Error fetching inquiries per property:', err.stack);
    res.status(500).json({ error: 'Failed to fetch inquiries per property', details: err.message });
  }
});

router.get('/inquiries/per-agent', authenticateToken, isAdmin, async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT agent_id, COUNT(*) as count
      FROM inquiries
      WHERE agent_id IS NOT NULL
      GROUP BY agent_id
    `);
    res.json(result.rows);
  } catch (err) {
    console.error('Error fetching inquiries per agent:', err.stack);
    res.status(500).json({ error: 'Failed to fetch inquiries per agent', details: err.message });
  }
});

export default router;