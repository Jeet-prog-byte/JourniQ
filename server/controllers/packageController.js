const { getDb } = require('../config/db');

async function getAllPackages(req, res) {
  try {
    const db = await getDb();
    const { search, category, min_price, max_price, min_duration, max_duration, sort, limit, offset } = req.query;

    let query = "SELECT * FROM packages WHERE 1=1";
    const params = [];

    if (search) {
      query += " AND (title LIKE ? OR destination LIKE ? OR description LIKE ?)";
      const s = `%${search}%`;
      params.push(s, s, s);
    }

    if (category) {
      query += " AND category = ?";
      params.push(category);
    }

    if (min_price) {
      query += " AND price >= ?";
      params.push(Number(min_price));
    }

    if (max_price) {
      query += " AND price <= ?";
      params.push(Number(max_price));
    }

    if (min_duration) {
      query += " AND duration >= ?";
      params.push(Number(min_duration));
    }

    if (max_duration) {
      query += " AND duration <= ?";
      params.push(Number(max_duration));
    }

    if (sort === 'price_asc') query += " ORDER BY price ASC";
    else if (sort === 'price_desc') query += " ORDER BY price DESC";
    else if (sort === 'rating') query += " ORDER BY rating DESC";
    else if (sort === 'duration') query += " ORDER BY duration ASC";
    else query += " ORDER BY is_featured DESC, rating DESC";

    const l = Math.min(Number(limit) || 50, 100);
    const o = Number(offset) || 0;
    query += ` LIMIT ${l} OFFSET ${o}`;

    const result = db.exec(query, params);

    if (result.length === 0) {
      return res.json([]);
    }

    const columns = result[0].columns;
    const packages = result[0].values.map(row => {
      const pkg = {};
      columns.forEach((col, i) => {
        if (['gallery', 'itinerary', 'included'].includes(col) && row[i]) {
          try { pkg[col] = JSON.parse(row[i]); } catch { pkg[col] = row[i]; }
        } else {
          pkg[col] = row[i];
        }
      });
      return pkg;
    });

    res.json(packages);
  } catch (err) {
    console.error('Get packages error:', err);
    res.status(500).json({ error: 'Server error.' });
  }
}

async function getFeaturedPackages(req, res) {
  try {
    const db = await getDb();
    const result = db.exec("SELECT * FROM packages WHERE is_featured = 1 ORDER BY rating DESC LIMIT 6");

    if (result.length === 0) return res.json([]);

    const columns = result[0].columns;
    const packages = result[0].values.map(row => {
      const pkg = {};
      columns.forEach((col, i) => {
        if (['gallery', 'itinerary', 'included'].includes(col) && row[i]) {
          try { pkg[col] = JSON.parse(row[i]); } catch { pkg[col] = row[i]; }
        } else {
          pkg[col] = row[i];
        }
      });
      return pkg;
    });

    res.json(packages);
  } catch (err) {
    res.status(500).json({ error: 'Server error.' });
  }
}

async function getPackageById(req, res) {
  try {
    const db = await getDb();
    const result = db.exec("SELECT * FROM packages WHERE id = ?", [req.params.id]);

    if (result.length === 0 || result[0].values.length === 0) {
      return res.status(404).json({ error: 'Package not found.' });
    }

    const columns = result[0].columns;
    const row = result[0].values[0];
    const pkg = {};
    columns.forEach((col, i) => {
      if (['gallery', 'itinerary', 'included'].includes(col) && row[i]) {
        try { pkg[col] = JSON.parse(row[i]); } catch { pkg[col] = row[i]; }
      } else {
        pkg[col] = row[i];
      }
    });

    res.json(pkg);
  } catch (err) {
    res.status(500).json({ error: 'Server error.' });
  }
}

module.exports = { getAllPackages, getFeaturedPackages, getPackageById };
