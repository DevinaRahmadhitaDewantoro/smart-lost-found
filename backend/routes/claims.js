const express = require('express');
const router = express.Router();
const db = require('../db'); // Menyesuaikan dengan struktur foldermu

// =========================================================================
// NOTIFICATION HELPER FUNCTION (Saves local notification logs to database)
// =========================================================================
const createNotification = (userId, message) => {
  const sql = 'INSERT INTO notifications (user_id, message) VALUES (?, ?)';
  db.query(sql, [userId, message], (err) => {
    if (err) {
      console.error('❌ Failed to save notification to DB:', err.message);
    } else {
      console.log(`🔔 Notification logged in DB for User ID ${userId}: "${message}"`);
    }
  });
};

// ==========================================
// 1. SUBMIT AN ITEM CLAIM (POST /api/claims)
// ==========================================
// Matches FR-19 with your original database schema: item_id, user_id, proof, status
router.post('/', (req, res) => {
  const { item_id, user_id, proof } = req.body;

  // Input validation
  if (!item_id || !user_id || !proof) {
    return res.status(400).json({ message: 'item_id, user_id, and proof fields are required' });
  }

  const sql = `
    INSERT INTO claims (item_id, user_id, proof, status) 
    VALUES (?, ?, ?, 'pending')
  `;

  db.query(sql, [item_id, user_id, proof], (err, result) => {
    if (err) {
      console.error('Error creating claim:', err.message);
      return res.status(500).json({ message: 'Server error', error: err.message });
    }

    // FR-28: Confirm successful submission via notification
    createNotification(user_id, `Your claim submission for item ID ${item_id} was successfully received.`);

    res.status(201).json({
      message: 'Claim submitted successfully. Waiting for verification.',
      claim_id: result.insertId
    });
  });
});

// ==========================================
// 2. GET ALL CLAIMS LIST (GET /api/claims)
// ==========================================
// Disesuaikan agar melempar alias 'id' & 'proof_message' yang dicari oleh AdminPanel.jsx frontend
router.get('/', (req, res) => {
  const sql = `
    SELECT c.id, c.id AS claim_id, c.proof, c.proof AS proof_message, c.status, c.created_at,
           c.user_id, u.name AS claimer_name, u.email AS claimer_email,
           i.name AS item_name, i.category AS item_category, i.type AS item_type
    FROM claims c
    JOIN users u ON c.user_id = u.id
    JOIN items i ON c.item_id = i.id
    ORDER BY c.created_at DESC
  `;

  db.query(sql, (err, results) => {
    if (err) {
      console.error('Error fetching claims:', err.message);
      return res.status(500).json({ message: 'Server error' });
    }
    res.json(results);
  });
});

// =========================================================================
// 3. FRONTEND SYNC: ADMIN VERIFICATION (PATCH /api/claims/:id)
// =========================================================================
// Rute tambahan untuk menangani aksi klik 'Approve' / 'Reject' langsung dari UI frontend
router.patch('/:id', (req, res) => {
  const claimId = req.params.id;
  const { status } = req.body; // Menerima kata 'approve' atau 'reject' dari frontend

  // Konversi aksi dari UI frontend agar sinkron dengan ENUM database ('approve' -> 'approved')
  const finalStatus = status === 'approve' ? 'approved' : status === 'reject' ? 'rejected' : status;

  if (!finalStatus || !['approved', 'rejected'].includes(finalStatus)) {
    return res.status(400).json({ message: 'Invalid status. Must be "approve" or "reject".' });
  }

  // Step A: Ambil item_id dan user_id terkait dari claimId
  const getClaimSql = 'SELECT item_id, user_id FROM claims WHERE id = ?';
  
  db.query(getClaimSql, [claimId], (err, results) => {
    if (err) {
      console.error('Error fetching claim:', err.message);
      return res.status(500).json({ message: 'Server error' });
    }
    if (results.length === 0) {
      return res.status(404).json({ message: 'Claim request not found' });
    }

    const itemId = results[0].item_id;
    const claimerId = results[0].user_id;

    // Step B: Update status klaim di tabel 'claims'
    const updateClaimSql = 'UPDATE claims SET status = ? WHERE id = ?';
    
    db.query(updateClaimSql, [finalStatus, claimId], (err) => {
      if (err) {
        console.error('Error updating claim status:', err.message);
        return res.status(500).json({ message: 'Server error' });
      }

      // Step C: Perbarui status barang di tabel 'items' (FR-24 & FR-25)
      const finalItemStatus = (finalStatus === 'approved') ? 'Claimed' : 'Found';
      const updateItemSql = 'UPDATE items SET status = ? WHERE id = ?';

      db.query(updateItemSql, [finalItemStatus, itemId], (err) => {
        if (err) {
          console.error('Error updating item status:', err.message);
          return res.status(500).json({ message: 'Server error but claim status was updated' });
        }

        // Step D: Kirim log notifikasi otomatis ke user (FR-27)
        createNotification(claimerId, `Your claim request for item ID ${itemId} has been ${finalStatus} by the admin.`);

        res.status(200).json({
          message: `Claim has been successfully ${finalStatus}.`,
          claim_status: finalStatus,
          item_status: finalItemStatus
        });
      });
    });
  });
});

// =========================================================================
// 4. ORIGINAL BACKEND ROUTE (PUT /api/claims/:id/verify)
// =========================================================================
// Tetap dipertahankan agar pengujian Postman lama kamu tidak rusak/error
router.put('/:id/verify', (req, res) => {
  const claimId = req.params.id;
  const { status } = req.body;

  if (!status || !['approved', 'rejected'].includes(status)) {
    return res.status(400).json({ message: 'Invalid status. Must be "approved" or "rejected".' });
  }

  const getClaimSql = 'SELECT item_id, user_id FROM claims WHERE id = ?';
  
  db.query(getClaimSql, [claimId], (err, results) => {
    if (err) {
      console.error('Error fetching claim:', err.message);
      return res.status(500).json({ message: 'Server error' });
    }
    if (results.length === 0) {
      return res.status(404).json({ message: 'Claim request not found' });
    }

    const itemId = results[0].item_id;
    const claimerId = results[0].user_id;

    const updateClaimSql = 'UPDATE claims SET status = ? WHERE id = ?';
    
    db.query(updateClaimSql, [status, claimId], (err) => {
      if (err) {
        console.error('Error updating claim status:', err.message);
        return res.status(500).json({ message: 'Server error' });
      }

      const finalItemStatus = (status === 'approved') ? 'Claimed' : 'Found';
      const updateItemSql = 'UPDATE items SET status = ? WHERE id = ?';

      db.query(updateItemSql, [finalItemStatus, itemId], (err) => {
        if (err) {
          console.error('Error updating item status:', err.message);
          return res.status(500).json({ message: 'Server error but claim status was updated' });
        }

        createNotification(claimerId, `Your claim request for item ID ${itemId} has been ${status} by the admin.`);

        res.status(200).json({
          message: `Claim has been successfully ${status}.`,
          claim_status: status,
          item_status: finalItemStatus
        });
      });
    });
  });
});

module.exports = router;