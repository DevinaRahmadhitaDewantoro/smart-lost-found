const express = require('express');
const router = express.Router();
const db = require('../db');
const stringSimilarity = require('string-similarity');

// FR-16: Get a structured list of all active potential matches
router.get('/', (req, res) => {
  const sql = `
    SELECT m.*, 
           i1.name AS lost_item_name, i1.category AS lost_item_category, i1.location AS lost_item_location,
           i2.name AS found_item_name, i2.category AS found_item_category, i2.location AS found_item_location
    FROM matches m
    JOIN items i1 ON m.lost_item_id = i1.id
    JOIN items i2 ON m.found_item_id = i2.id
    ORDER BY m.similarity_score DESC
  `;

  db.query(sql, (err, results) => {
    if (err) {
      console.error('Failed to fetch matches:', err.message);
      return res.status(500).json({ error: 'Database query failed.' });
    }
    res.status(200).json(results);
  });
});

/**
 * HELPER FUNCTION: FR-15 & FR-17 Matching Engine Logic
 */
router.checkForMatches = function(newItemId) {
  console.log(`\n===[ 🚀 MATCHING ENGINE DIMULAI UNTUK ID: ${newItemId} ]===`);
  
  const getItemSql = 'SELECT * FROM items WHERE id = ?';
  
  db.query(getItemSql, [newItemId], (err, results) => {
    if (err) {
      console.error('❌ Step 1 Error (DB Error):', err.message);
      return;
    }
    if (results.length === 0) {
      console.log(`❌ Step 1 Gagal: Item dengan ID ${newItemId} tidak ditemukan di database.`);
      return;
    }
    
    const newItem = results[0];
    console.log(`✅ Step 1 Sukses: Berhasil membaca data barang baru.`);
    console.log(`   -> Nama: "${newItem.name}"`);
    console.log(`   -> Tipe: "${newItem.type}"`);
    console.log(`   -> Kategori: "${newItem.category}"`);
    
    const targetType = newItem.type === 'lost' ? 'found' : 'lost';
    
    // =========================================================================
    // DI SINI TEMPAT BARIS KODE TERSEBUT BERADA:
    // =========================================================================
    const getOppositesSql = 'SELECT * FROM items WHERE type = ? AND category = ? AND id != ?';
    
    console.log(`🔍 Step 2: Mencari kandidat lawan dengan tipe "${targetType}" dan kategori "${newItem.category}"...`);
    
    db.query(getOppositesSql, [targetType, newItem.category, newItemId], (err, candidates) => {
      if (err) {
        console.error('❌ Step 2 Error (DB Error):', err.message);
        return;
      }

      console.log(`📊 Step 2 Sukses: Menemukan [ ${candidates.length} ] kandidat lawan di database.`);

      if (candidates.length === 0) {
        console.log(`⚠️ Hentikan Proses: Tidak ada barang lawan dengan kategori yang sama.`);
        return;
      }

      candidates.forEach((candidate, index) => {
        console.log(`\n📐 Membandingkan data ke-${index + 1} (Candidate ID: ${candidate.id})`);
        
        const text1 = `${newItem.name} ${newItem.description || ''}`.toLowerCase();
        const text2 = `${candidate.name} ${candidate.description || ''}`.toLowerCase();

        const similarityScore = stringSimilarity.compareTwoStrings(text1, text2);
        const similarityPercentage = similarityScore * 100;

        console.log(`   -> Hasil Skor Kemiripan: ${similarityPercentage.toFixed(1)}%`);

        if (similarityPercentage >= 40) {
          console.log(`✨ [ MATCH FOUND! ] Persentase ${similarityPercentage.toFixed(1)}% >= 40%. Menyimpan ke tabel matches...`);

          let lostItemId = newItem.type === 'lost' ? newItem.id : candidate.id;
          let foundItemId = newItem.type === 'found' ? newItem.id : candidate.id;

          const insertMatchSql = `
            INSERT INTO matches (lost_item_id, found_item_id, similarity_score) 
            VALUES (?, ?, ?)
            ON DUPLICATE KEY UPDATE similarity_score = VALUES(similarity_score)
          `;
          
          db.query(insertMatchSql, [lostItemId, foundItemId, similarityPercentage], (err) => {
            if (err) {
              console.error('❌ Gagal menyimpan hasil match ke database:', err.message);
            } else {
              console.log(`💾 Sukses! Hubungan Match antara ID ${lostItemId} & ID ${foundItemId} tersimpan.`);
            }
          });
        } else {
          console.log(`❄️ Skor di bawah 70%, abaikan.`);
        }
      });
    });
  });
};

module.exports = router;