const express = require('express');
const router = express.Router();
const db = require('../db');
//const matchRouter = require('./match'); // Imported match.js to handle FR-15 through FR-18

// FR-04, FR-05, FR-06, FR-07: Submit lost item report
router.post('/lost', (req, res) => {
  const { user_id, name, category, description, location, date_reported } = req.body;

  db.query(
    'INSERT INTO items (user_id, type, name, category, description, location, date_reported, status) VALUES (?, "lost", ?, ?, ?, ?, ?, "lost")',
    [user_id, name, category, description, location, date_reported],
    (err, result) => {
      if (err) return res.status(500).json({ message: 'Server error', error: err.message });
      
      const newItemId = result.insertId;

      // Automatically triggers matching algorithm asynchronously
      // matchRouter.checkForMatches(newItemId);

      // FR-28: Confirm successful submission back to user [cite: 87]
      res.status(201).json({ message: 'Lost item reported successfully', item_id: newItemId });
    }
  );
});

// FR-08, FR-09, FR-10, FR-11: Submit found item report
router.post('/found', (req, res) => {
  const { user_id, name, category, description, location, date_reported } = req.body;

  db.query(
    'INSERT INTO items (user_id, type, name, category, description, location, date_reported, status) VALUES (?, "found", ?, ?, ?, ?, ?, "found")',
    [user_id, name, category, description, location, date_reported],
    (err, result) => {
      if (err) return res.status(500).json({ message: 'Server error', error: err.message });
      
      const newItemId = result.insertId;

      // Automatically triggers matching algorithm asynchronously
      matchRouter.checkForMatches(newItemId);

      // FR-28: Confirm successful submission back to user [cite: 87]
      res.status(201).json({ message: 'Found item reported successfully', item_id: newItemId });
    }
  );
});

// Get all items
router.get('/', (req, res) => {
  db.query('SELECT * FROM items ORDER BY created_at DESC', (err, results) => {
    if (err) return res.status(500).json({ message: 'Server error' });
    res.json(results);
  });
});

// Get single item by ID
router.get('/:id', (req, res) => {
  db.query('SELECT * FROM items WHERE id = ?', [req.params.id], (err, results) => {
    if (err) return res.status(500).json({ message: 'Server error' });
    if (results.length === 0) return res.status(404).json({ message: 'Item not found' });
    res.json(results[0]);
  });
});

module.exports = router;