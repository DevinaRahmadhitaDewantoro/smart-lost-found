const express = require('express');
const router = express.Router();
const db = require('../db');

// FR-04: Submit lost item
router.post('/lost', (req, res) => {
  const { user_id, name, category, description, location, date_reported } = req.body;

  db.query(
    'INSERT INTO items (user_id, type, name, category, description, location, date_reported, status) VALUES (?, "lost", ?, ?, ?, ?, ?, "lost")',
    [user_id, name, category, description, location, date_reported],
    (err, result) => {
      if (err) {
        console.log(err);
        return res.status(500).json({ message: err.message });
      }

      res.status(201).json({
        message: 'Lost item reported successfully',
        item_id: result.insertId
      });
    }
  );
});

// FR-08: Submit found item
router.post('/found', (req, res) => {
  const { user_id, name, category, description, location, date_reported } = req.body;

  db.query(
    'INSERT INTO items (user_id, type, name, category, description, location, date_reported, status) VALUES (?, "found", ?, ?, ?, ?, ?, "found")',
    [user_id, name, category, description, location, date_reported],
    (err, result) => {
      if (err) {
        console.log(err);
        return res.status(500).json({ message: err.message });
      }

      res.status(201).json({
        message: 'Found item reported successfully',
        item_id: result.insertId
      });
    }
  );
});

// GET all items (SAFE)
router.get('/', (req, res) => {
  db.query('SELECT * FROM items', (err, results) => {
    if (err) {
      console.log(err);
      return res.status(500).json({ message: err.message });
    }

    res.json(results);
  });
});

// GET item by ID
router.get('/:id', (req, res) => {
  db.query('SELECT * FROM items WHERE id = ?', [req.params.id], (err, results) => {
    if (err) {
      console.log(err);
      return res.status(500).json({ message: err.message });
    }

    if (results.length === 0) {
      return res.status(404).json({ message: 'Item not found' });
    }

    res.json(results[0]);
  });
});

module.exports = router;