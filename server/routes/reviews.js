const express = require('express');
const router = express.Router();
const { getDb, saveDb } = require('../config/db');
const { authMiddleware } = require('../middleware/auth');

router.post('/', authMiddleware, async (req, res) => {
  try {
    const { package_id, rating, comment } = req.body;

    if (!package_id || !rating) {
      return res.status(400).json({ error: 'Package ID and rating are required.' });
    }

    if (rating < 1 || rating > 5) {
      return res.status(400).json({ error: 'Rating must be between 1 and 5.' });
    }

    const db = await getDb();
    db.run("INSERT INTO reviews (user_id, package_id, rating, comment) VALUES (?, ?, ?, ?)",
      [req.user.id, package_id, rating, comment || '']);
    saveDb();

    // Update package average rating
    const avgResult = db.exec("SELECT AVG(rating) FROM reviews WHERE package_id = ?", [package_id]);
    if (avgResult.length > 0) {
      const avgRating = Math.round(avgResult[0].values[0][0] * 10) / 10;
      db.run("UPDATE packages SET rating = ? WHERE id = ?", [avgRating, package_id]);
      saveDb();
    }

    res.status(201).json({ message: 'Review added successfully.' });
  } catch (err) {
    console.error('Review create error:', err);
    res.status(500).json({ error: 'Server error.' });
  }
});

router.get('/:packageId', async (req, res) => {
  try {
    const db = await getDb();
    const result = db.exec(`
      SELECT r.*, u.name as user_name
      FROM reviews r
      JOIN users u ON r.user_id = u.id
      WHERE r.package_id = ?
      ORDER BY r.created_at DESC
    `, [req.params.packageId]);

    if (result.length === 0) return res.json([]);

    const columns = result[0].columns;
    const reviews = result[0].values.map(row => {
      const review = {};
      columns.forEach((col, i) => { review[col] = row[i]; });
      return review;
    });

    res.json(reviews);
  } catch (err) {
    res.status(500).json({ error: 'Server error.' });
  }
});

module.exports = router;
