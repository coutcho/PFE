import express from "express";
import pkg from "pg";
import cors from "cors";
import bcrypt from "bcryptjs";
import { createHash } from "crypto";
import nodemailer from "nodemailer";
import jwt from "jsonwebtoken";

const app = express();
const port = 3001;

app.use(cors());
app.use(express.json());

const { Pool } = pkg;
const pool = new Pool({
  user: "postgres",
  host: "localhost",
  database: "DB_PFE",
  password: "Rayan123",
  port: 5432,
});

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: "rayanos.adjinatos@gmail.com",
    pass: "gpsi tcoy ojkc tlze",
  },
});

const checkPasswordWithHIBP = async (password) => {
  try {
    const hash = createHash("sha1").update(password).digest("hex").toUpperCase();
    const prefix = hash.slice(0, 5);
    const suffix = hash.slice(5);

    const response = await fetch(`https://api.pwnedpasswords.com/range/${prefix}`, {
      headers: { "Add-Padding": "true" },
    });
    const text = await response.text();

    const lines = text.split("\n");
    for (const line of lines) {
      const [hashSuffix, count] = line.split(":");
      if (hashSuffix === suffix) {
        return parseInt(count, 10) > 0;
      }
    }
    return false;
  } catch (error) {
    console.error("Error checking password with HIBP:", error);
    return false;
  }
};

// Sign-up endpoint
app.post("/api/signup", async (req, res) => {
  const { nom, prenom, email, pass } = req.body;

  if (!nom || !email || !pass) {
    return res.status(400).json({ message: "Missing required fields" });
  }

  if (pass.length < 8) {
    return res.status(400).json({ message: "Password must be at least 8 characters long" });
  }
  if (pass.toLowerCase().startsWith("12345678")) {
    return res.status(400).json({ message: "This password is too common. Please choose a stronger one." });
  }
  const isPwned = await checkPasswordWithHIBP(pass);
  if (isPwned) {
    return res.status(400).json({ message: "This password is too common. Please choose a stronger one." });
  }

  try {
    const existingUser = await pool.query("SELECT * FROM users WHERE email = $1", [email]);
    if (existingUser.rows.length > 0) {
      return res.status(400).json({ message: "Email already in use" });
    }

    const hashedPassword = await bcrypt.hash(pass, 10);

    const newUser = await pool.query(
      "INSERT INTO users (fullname, email, pass) VALUES ($1, $2, $3) RETURNING *",
      [`${nom} ${prenom}`, email, hashedPassword]
    );

    res.status(201).json({
      success: true,
      message: "Account created successfully! Welcome aboard!",
      user: {
        id: newUser.rows[0].id,
        fullname: newUser.rows[0].fullname,
        email: newUser.rows[0].email,
      },
    });
  } catch (error) {
    console.error("Error during sign-up:", error);
    res.status(500).json({ message: "Server error, please try again later" });
  }
});

// Sign-in endpoint (updated to include role in JWT)
app.post("/api/signin", async (req, res) => {
  const { email, pass } = req.body;

  if (!email || !pass) {
    return res.status(400).json({ message: "Email and password are required" });
  }

  try {
    // Fetch user including the role column
    const userQuery = await pool.query(
      "SELECT id, fullname, email, pass, role FROM users WHERE email = $1",
      [email]
    );
    const user = userQuery.rows[0];

    if (!user) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    const isPasswordValid = await bcrypt.compare(pass, user.pass);
    if (!isPasswordValid) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    // Use the role from the database, default to "user" if not set
    const role = user.role || "admin";

    // Generate JWT token with role
    const token = jwt.sign(
      { id: user.id, email: user.email, role },
      "your-secret-key", // Replace with a strong secret key
      { expiresIn: "1h" }
    );

    res.status(200).json({
      success: true,
      message: "Sign-in successful! Welcome back!",
      token,
      user: {
        id: user.id,
        fullname: user.fullname,
        email: user.email,
        role,
      },
    });
  } catch (error) {
    console.error("Error during sign-in:", error);
    res.status(500).json({ message: "Server error, please try again later" });
  }
});

// Forgot Password endpoint
app.post("/api/forgot-password", async (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ message: "Email is required" });
  }

  try {
    const userQuery = await pool.query("SELECT * FROM users WHERE email = $1", [email]);
    const user = userQuery.rows[0];

    if (!user) {
      return res.status(200).json({ message: "If the email exists, a reset link has been sent." });
    }

    const resetToken = jwt.sign({ id: user.id }, "your-secret-key", { expiresIn: "1h" });

    await pool.query(
      "INSERT INTO reset_tokens (user_id, token, expires_at) VALUES ($1, $2, $3)",
      [user.id, resetToken, new Date(Date.now() + 3600000)]
    );

    const resetUrl = `http://localhost:5173/reset-password?token=${resetToken}`;
    const mailOptions = {
      from: "rayanos.adjinatos@gmail.com",
      to: email,
      subject: "Password Reset Request",
      text: `Click this link to reset your password: ${resetUrl}\nThis link expires in 1 hour.`,
    };

    await transporter.sendMail(mailOptions);

    res.status(200).json({ message: "If the email exists, a reset link has been sent." });
  } catch (error) {
    console.error("Error in forgot-password:", error);
    res.status(500).json({ message: "Server error, please try again later" });
  }
});

// Reset Password endpoint
app.post("/api/reset-password", async (req, res) => {
  const { token, newPassword } = req.body;

  if (!token || !newPassword) {
    return res.status(400).json({ message: "Token and new password are required" });
  }

  try {
    const decoded = jwt.verify(token, "your-secret-key");
    const tokenQuery = await pool.query(
      "SELECT * FROM reset_tokens WHERE token = $1 AND expires_at > NOW()",
      [token]
    );
    const resetToken = tokenQuery.rows[0];

    if (!resetToken || resetToken.user_id !== decoded.id) {
      return res.status(400).json({ message: "Invalid or expired reset token" });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    await pool.query("UPDATE users SET pass = $1 WHERE id = $2", [hashedPassword, resetToken.user_id]);

    await pool.query("DELETE FROM reset_tokens WHERE token = $1", [token]);

    res.status(200).json({ message: "Password reset successfully! You can now sign in." });
  } catch (error) {
    console.error("Error in reset-password:", error);
    if (error.name === "TokenExpiredError") {
      return res.status(400).json({ message: "Reset token has expired" });
    }
    res.status(500).json({ message: "Server error, please try again later" });
  }
});

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});