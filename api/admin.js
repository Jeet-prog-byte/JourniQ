const { getDb } = require('./config/db');
const { authMiddleware, adminMiddleware } = require('./middleware/auth');

export default async function handler(req, res) {
  if (!authMiddleware(req, res)) return;
  if (!adminMiddleware(req, res)) return;

  const urlParts = req.url.split('?')[0].split('/').filter(Boolean);
  const action = urlParts[2]; // assuming /api/admin/action or similar mapping. wait, if URL is /api/admin/stats, index depends on mount.
  // better: find the index of 'admin' and take the next part.
  const adminIndex = urlParts.indexOf('admin');
  const target = adminIndex !== -1 && urlParts.length > adminIndex + 1 ? urlParts[adminIndex + 1] : null;
  const id = adminIndex !== -1 && urlParts.length > adminIndex + 2 ? urlParts[adminIndex + 2] : null;

  if (req.method === 'GET' && target === 'stats') return getStats(req, res);
  if (req.method === 'GET' && target === 'bookings') return getAllBookings(req, res);
  if (req.method === 'GET' && target === 'users') return getAllUsers(req, res);
  
  if (target === 'packages') {
    if (req.method === 'POST') return createPackage(req, res);
    if (req.method === 'PUT' && id) {
      req.params = { id };
      return updatePackage(req, res);
    }
    if (req.method === 'DELETE' && id) {
      req.params = { id };
      return deletePackage(req, res);
    }
  }

  return res.status(404).json({ error: 'Not Found' });
}

async function getStats(req, res) {
  try {
    const db = await getDb();
    
    const usersResult = db.exec("SELECT COUNT(*) FROM users");
    const packagesResult = db.exec("SELECT COUNT(*) FROM packages");
    const bookingsResult = db.exec("SELECT COUNT(*) FROM bookings");
    const revenueResult = db.exec("SELECT COALESCE(SUM(total_price), 0) FROM bookings WHERE status != 'cancelled'");
    const confirmedResult = db.exec("SELECT COUNT(*) FROM bookings WHERE status = 'confirmed'");
    const cancelledResult = db.exec("SELECT COUNT(*) FROM bookings WHERE status = 'cancelled'");

    res.json({
      totalUsers: usersResult[0]?.values[0][0] || 0,
      totalPackages: packagesResult[0]?.values[0][0] || 0,
      totalBookings: bookingsResult[0]?.values[0][0] || 0,
      totalRevenue: revenueResult[0]?.values[0][0] || 0,
      confirmedBookings: confirmedResult[0]?.values[0][0] || 0,
      cancelledBookings: cancelledResult[0]?.values[0][0] || 0
    });
  } catch (err) {
    console.error('Stats error:', err);
    res.status(500).json({ error: 'Server error.' });
  }
}

async function getAllBookings(req, res) {
  try {
    const db = await getDb();
    const result = db.exec(`
      SELECT b.*, p.title as package_title, p.destination, u.name as user_name, u.email as user_email
      FROM bookings b
      JOIN packages p ON b.package_id = p.id
      JOIN users u ON b.user_id = u.id
      ORDER BY b.created_at DESC
    `);

    if (result.length === 0) return res.json([]);

    const columns = result[0].columns;
    const bookings = result[0].values.map(row => {
      const booking = {};
      columns.forEach((col, i) => { booking[col] = row[i]; });
      return booking;
    });

    res.json(bookings);
  } catch (err) {
    res.status(500).json({ error: 'Server error.' });
  }
}

async function createPackage(req, res) {
  try {
    const { title, destination, description, price, duration, max_travelers, category, image_url, gallery, itinerary, included, is_featured } = req.body;

    if (!title || !destination || !price || !duration) {
      return res.status(400).json({ error: 'Title, destination, price, and duration are required.' });
    }

    const db = await getDb();
    db.run(
      `INSERT INTO packages (title, destination, description, price, duration, max_travelers, category, image_url, gallery, itinerary, included, is_featured)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [title, destination, description || '', price, duration, max_travelers || 20, category || 'adventure',
       image_url || '', JSON.stringify(gallery || []), JSON.stringify(itinerary || []), JSON.stringify(included || []), is_featured ? 1 : 0]
    );

    res.status(201).json({ message: 'Package created successfully.' });
  } catch (err) {
    console.error('Create package error:', err);
    res.status(500).json({ error: 'Server error.' });
  }
}

async function updatePackage(req, res) {
  try {
    const { title, destination, description, price, duration, max_travelers, category, image_url, gallery, itinerary, included, is_featured } = req.body;
    const db = await getDb();

    const existing = db.exec("SELECT id FROM packages WHERE id = ?", [req.params.id]);
    if (existing.length === 0 || existing[0].values.length === 0) {
      return res.status(404).json({ error: 'Package not found.' });
    }

    db.run(
      `UPDATE packages SET 
        title = COALESCE(?, title), destination = COALESCE(?, destination),
        description = COALESCE(?, description), price = COALESCE(?, price),
        duration = COALESCE(?, duration), max_travelers = COALESCE(?, max_travelers),
        category = COALESCE(?, category), image_url = COALESCE(?, image_url),
        gallery = COALESCE(?, gallery), itinerary = COALESCE(?, itinerary),
        included = COALESCE(?, included), is_featured = COALESCE(?, is_featured)
       WHERE id = ?`,
      [title, destination, description, price, duration, max_travelers, category, image_url,
       gallery ? JSON.stringify(gallery) : null, itinerary ? JSON.stringify(itinerary) : null,
       included ? JSON.stringify(included) : null, is_featured !== undefined ? (is_featured ? 1 : 0) : null, req.params.id]
    );

    res.json({ message: 'Package updated successfully.' });
  } catch (err) {
    res.status(500).json({ error: 'Server error.' });
  }
}

async function deletePackage(req, res) {
  try {
    const db = await getDb();
    db.run("DELETE FROM packages WHERE id = ?", [req.params.id]);
    res.json({ message: 'Package deleted successfully.' });
  } catch (err) {
    res.status(500).json({ error: 'Server error.' });
  }
}

async function getAllUsers(req, res) {
  try {
    const db = await getDb();
    const result = db.exec("SELECT id, name, email, role, phone, created_at FROM users ORDER BY created_at DESC");

    if (result.length === 0) return res.json([]);

    const columns = result[0].columns;
    const users = result[0].values.map(row => {
      const user = {};
      columns.forEach((col, i) => { user[col] = row[i]; });
      return user;
    });

    res.json(users);
  } catch (err) {
    res.status(500).json({ error: 'Server error.' });
  }
}
