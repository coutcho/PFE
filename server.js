import express from 'express';
import pkg from 'pg';
import cors from 'cors';
import bcrypt from 'bcryptjs';
import { createHash } from 'crypto'; // Node's built-in crypto module for SHA-1
import nodemailer from 'nodemailer'; // For sending emails
import jwt from 'jsonwebtoken'; // For secure tokens

const app = express();
const port = 3001;

// Middleware
app.use(cors());
app.use(express.json());

const { Pool } = pkg;
const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'DB_PFE',
  password: 'Rayan123',
  port: 5432,
});

// Email transporter setup (using Gmail as an example)
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'rayanos.adjinatos@gmail.com', // Replace with your email
    pass: 'gpsi tcoy ojkc tlze', // Replace with your Gmail App Password
  },
});

// Function to check password against HIBP
const checkPasswordWithHIBP = async (password) => {
  try {
    const hash = createHash('sha1').update(password).digest('hex').toUpperCase();
    const prefix = hash.slice(0, 5);
    const suffix = hash.slice(5);

    const response = await fetch(`https://api.pwnedpasswords.com/range/${prefix}`, {
      headers: { 'Add-Padding': 'true' },
    });
    const text = await response.text();

    const lines = text.split('\n');
    for (const line of lines) {
      const [hashSuffix, count] = line.split(':');
      if (hashSuffix === suffix) {
        return parseInt(count, 10) > 0; // True if found in breaches
      }
    }
    return false;
  } catch (error) {
    console.error('Error checking password with HIBP:', error);
    return false; // Fallback: allow if HIBP fails
  }
};

// Sign-up endpoint
app.post('/api/signup', async (req, res) => {
  const { nom, prenom, email, pass } = req.body;

  if (!nom || !email || !pass) {
    return res.status(400).json({ message: 'Missing required fields' });
  }

  // Password strength checks
  if (pass.length < 8) {
    return res.status(400).json({ message: 'Password must be at least 8 characters long' });
  }
  if (pass.toLowerCase().startsWith('12345678')) {
    return res.status(400).json({ message: 'This password is too common. Please choose a stronger one.' });
  }
  const isPwned = await checkPasswordWithHIBP(pass);
  if (isPwned) {
    return res.status(400).json({ message: 'This password is too common. Please choose a stronger one.' });
  }

  try {
    const existingUser = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    if (existingUser.rows.length > 0) {
      return res.status(400).json({ message: 'Email already in use' });
    }

    const hashedPassword = await bcrypt.hash(pass, 10);

    const newUser = await pool.query(
      'INSERT INTO users (fullname, email, pass) VALUES ($1, $2, $3) RETURNING *',
      [`${nom} ${prenom}`, email, hashedPassword]
    );

    res.status(201).json({
      success: true,
      message: 'Account created successfully! Welcome aboard!',
      user: {
        id: newUser.rows[0].id,
        fullname: newUser.rows[0].fullname,
        email: newUser.rows[0].email,
      },
    });
  } catch (error) {
    console.error('Error during sign-up:', error);
    res.status(500).json({ message: 'Server error, please try again later' });
  }
});

// Sign-in endpoint
app.post('/api/signin', async (req, res) => {
  const { email, pass } = req.body;

  if (!email || !pass) {
    return res.status(400).json({ message: 'Email and password are required' });
  }

  try {
    const userQuery = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    const user = userQuery.rows[0];

    if (!user) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    const isPasswordValid = await bcrypt.compare(pass, user.pass);
    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    res.status(200).json({
      success: true,
      message: 'Sign-in successful! Welcome back!',
      user: {
        id: user.id,
        fullname: user.fullname,
        email: user.email,
      },
    });
  } catch (error) {
    console.error('Error during sign-in:', error);
    res.status(500).json({ message: 'Server error, please try again later' });
  }
});

// Forgot Password endpoint
app.post('/api/forgot-password', async (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ message: 'Email is required' });
  }

  try {
    const userQuery = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    const user = userQuery.rows[0];

    if (!user) {
      // Don't reveal if email exists for security
      return res.status(200).json({ message: 'If the email exists, a reset link has been sent.' });
    }

    // Generate a reset token (valid for 1 hour)
    const resetToken = jwt.sign({ id: user.id }, 'your-secret-key', { expiresIn: '1h' });

    // Save token to database
    await pool.query(
      'INSERT INTO reset_tokens (user_id, token, expires_at) VALUES ($1, $2, $3)',
      [user.id, resetToken, new Date(Date.now() + 3600000)] // 1 hour from now
    );

    // Send reset email
    const resetUrl = `http://localhost:5173/reset-password?token=${resetToken}`;
    const mailOptions = {
      from: 'your-email@gmail.com',
      to: email,
      subject: 'Password Reset Request',
      text: `Click this link to reset your password: ${resetUrl}\nThis link expires in 1 hour.`,
    };

    await transporter.sendMail(mailOptions);

    res.status(200).json({ message: 'If the email exists, a reset link has been sent.' });
  } catch (error) {
    console.error('Error in forgot-password:', error);
    res.status(500).json({ message: 'Server error, please try again later' });
  }
});

// Reset Password endpoint
app.post('/api/reset-password', async (req, res) => {
  const { token, newPassword } = req.body;

  if (!token || !newPassword) {
    return res.status(400).json({ message: 'Token and new password are required' });
  }

  try {
    // Verify token
    const decoded = jwt.verify(token, 'your-secret-key');
    const tokenQuery = await pool.query(
      'SELECT * FROM reset_tokens WHERE token = $1 AND expires_at > NOW()',
      [token]
    );
    const resetToken = tokenQuery.rows[0];

    if (!resetToken || resetToken.user_id !== decoded.id) {
      return res.status(400).json({ message: 'Invalid or expired reset token' });
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update user's password
    await pool.query('UPDATE users SET pass = $1 WHERE id = $2', [hashedPassword, resetToken.user_id]);

    // Delete used token
    await pool.query('DELETE FROM reset_tokens WHERE token = $1', [token]);

    res.status(200).json({ message: 'Password reset successfully! You can now sign in.' });
  } catch (error) {
    console.error('Error in reset-password:', error);
    if (error.name === 'TokenExpiredError') {
      return res.status(400).json({ message: 'Reset token has expired' });
    }
    res.status(500).json({ message: 'Server error, please try again later' });
  }
});

// Start server
app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});