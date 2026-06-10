const express = require('express');
const router = express.Router();
const db = require('../db');

// =========================================================
// GET USER NOTIFICATIONS (GET /api/notifications/:userId)
// =========================================================
// Matches FR-26, FR-27, and FR-28 for fetching user alerts
router.get('/:userId', (req, res) => {
  const userId = req.params.userId;

  const sql = `
    SELECT id, message, is_read, created_at 
    FROM notifications 
    WHERE user_id = ? 
    ORDER BY created_at DESC
  `;

  db.query(sql, [userId], (err, results) => {
    if (err) {
      console.error('Error fetching notifications:', err.message);
      return res.status(500).json({ message: 'Server error' });
    }
    
    res.json(results);
  });
});

module.exports = router;