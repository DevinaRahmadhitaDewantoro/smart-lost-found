const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../db');

// FR-01: Register
router.post('/register', (req, res) => {
  const { name, email, password } = req.body;

  // Check if email already exists
  db.query('SELECT * FROM users WHERE email = ?', [email], (err, results) => {
    if (err) return res.status(500).json({ message: 'Server error' });
    if (results.length > 0) return res.status(400).json({ message: 'Email already exists' });

    // Hash password
    const hashedPassword = bcrypt.hashSync(password, 10);

    // Insert user
    db.query('INSERT INTO users (name, email, password) VALUES (?, ?, ?)',
      [name, email, hashedPassword],
      (err, result) => {
        if (err) return res.status(500).json({ message: 'Server error' });
        res.status(201).json({ message: 'User registered successfully' });
      }
    );
  });
});

// FR-02: Login
router.post('/login', (req, res) => {
  const { email, password } = req.body;

  db.query('SELECT * FROM users WHERE email = ?', [email], (err, results) => {
    if (err) return res.status(500).json({ message: 'Server error' });
    if (results.length === 0) return res.status(400).json({ message: 'User not found' });

    const user = results[0];
    const isMatch = bcrypt.compareSync(password, user.password);
    if (!isMatch) return res.status(400).json({ message: 'Invalid password' });

    const token = jwt.sign(
      { id: user.id, role: user.role },
      'secret123',
      { expiresIn: '1d' }
    );

    res.json({ message: 'Login successful', token, user: { id: user.id, name: user.name, role: user.role } });
  });
});

// FR-03: Logout (frontend just deletes the token)
router.post('/logout', (req, res) => {
  res.json({ message: 'Logged out successfully' });
});

module.exports = router;