const { getDb } = require('./lib/db');

export default async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });

  const urlParts = req.url.split('?')[0].split('/').filter(Boolean);
  const lastPart = urlParts[urlParts.length - 1];

  if (lastPart === 'packages') {
    return getAllPackages(req, res);
  } else if (lastPart === 'featured') {
    return getFeaturedPackages(req, res);
  } else {
    // If it's a number/ID
    req.params = { id: lastPart };
    return getPackageById(req, res);
  }
}

async function getAllPackages(req, res) {
  try {
    const db = await getDb();
    
    // In Vercel, req.query is usually populated, but just in case, we can also extract from URL manually
    let queryParams = req.query || {};
    if (Object.keys(queryParams).length === 0 && req.url.includes('?')) {
       // fallback manual parsing
       const urlObj = new URL(req.url, `http://${req.headers.host}`);
       for (const [key, value] of urlObj.searchParams.entries()) {
         queryParams[key] = value;
       }
    }

    const { search, category, min_price, max_price, min_duration, max_duration, sort, limit, offset } = queryParams;

    let q = "SELECT * FROM packages WHERE 1=1";
    const params = [];

    if (search) {
      q += " AND (title LIKE ? OR destination LIKE ? OR description LIKE ?)";
      const s = `%${search}%`;
      params.push(s, s, s);
    }

    if (category) {
      q += " AND category = ?";
      params.push(category);
    }

    if (min_price) {
      q += " AND price >= ?";
      params.push(Number(min_price));
    }

    if (max_price) {
      q += " AND price <= ?";
      params.push(Number(max_price));
    }

    if (min_duration) {
      q += " AND duration >= ?";
      params.push(Number(min_duration));
    }

    if (max_duration) {
      q += " AND duration <= ?";
      params.push(Number(max_duration));
    }

    if (sort === 'price_asc') q += " ORDER BY price ASC";
    else if (sort === 'price_desc') q += " ORDER BY price DESC";
    else if (sort === 'rating') q += " ORDER BY rating DESC";
    else if (sort === 'duration') q += " ORDER BY duration ASC";
    else q += " ORDER BY is_featured DESC, rating DESC";

    const l = Math.min(Number(limit) || 50, 100);
    const o = Number(offset) || 0;
    q += ` LIMIT ${l} OFFSET ${o}`;

    const result = db.exec(q, params);

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
