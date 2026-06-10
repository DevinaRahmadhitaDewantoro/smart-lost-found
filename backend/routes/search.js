const express = require('express');
const router = express.Router();
const db = require('../db');

// FR-12: Keyword search
// FR-13: Filter by category, location, status
// FR-14: Display results in structured list
router.get('/', (req, res) => {
  const { keyword, category, location, status } = req.query;

  let query = 'SELECT * FROM items WHERE 1=1';
  let params = [];

  if (keyword) {
    query += ' AND (name LIKE ? OR description LIKE ?)';
    params.push(`%${keyword}%`, `%${keyword}%`);
  }

  if (category) {
    query += ' AND category = ?';
    params.push(category);
  }

  if (location) {
    query += ' AND location LIKE ?';
    params.push(`%${location}%`);
  }

  if (status) {
    query += ' AND status = ?';
    params.push(status);
  }

  query += ' ORDER BY created_at DESC';

  db.query(query, params, (err, results) => {
    if (err) return res.status(500).json({ message: 'Server error', error: err.message });
    res.json(results);
  });
});

module.exports = router;