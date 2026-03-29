const { getDb, saveDb } = require('../config/db');

async function createBooking(req, res) {
  try {
    const { package_id, travelers, travel_date, special_requests } = req.body;

    if (!package_id || !travel_date) {
      return res.status(400).json({ error: 'Package ID and travel date are required.' });
    }

    const db = await getDb();

    const pkgResult = db.exec("SELECT * FROM packages WHERE id = ?", [package_id]);
    if (pkgResult.length === 0 || pkgResult[0].values.length === 0) {
      return res.status(404).json({ error: 'Package not found.' });
    }

    const pkgColumns = pkgResult[0].columns;
    const pkgRow = pkgResult[0].values[0];
    const pkg = {};
    pkgColumns.forEach((col, i) => { pkg[col] = pkgRow[i]; });

    const numTravelers = travelers || 1;
    const totalPrice = pkg.price * numTravelers;

    db.run(
      "INSERT INTO bookings (user_id, package_id, travelers, travel_date, total_price, status, special_requests) VALUES (?, ?, ?, ?, ?, 'confirmed', ?)",
      [req.user.id, package_id, numTravelers, travel_date, totalPrice, special_requests || null]
    );
    saveDb();

    // Get the last inserted booking ID using sql.js compatible method
    const idResult = db.exec("SELECT MAX(id) as id FROM bookings WHERE user_id = ?", [req.user.id]);
    const bookingId = idResult[0].values[0][0];

    // Return a constructed booking object instead of JOIN query (more reliable with sql.js)
    const booking = {
      id: bookingId,
      user_id: req.user.id,
      package_id: package_id,
      travelers: numTravelers,
      travel_date: travel_date,
      total_price: totalPrice,
      status: 'confirmed',
      special_requests: special_requests || null,
      package_title: pkg.title,
      destination: pkg.destination,
      image_url: pkg.image_url,
      duration: pkg.duration
    };

    res.status(201).json(booking);
  } catch (err) {
    console.error('Create booking error:', err);
    res.status(500).json({ error: 'Server error.' });
  }
}

async function getUserBookings(req, res) {
  try {
    const db = await getDb();
    const result = db.exec(`
      SELECT b.*, p.title as package_title, p.destination, p.image_url, p.duration, p.category
      FROM bookings b
      JOIN packages p ON b.package_id = p.id
      WHERE b.user_id = ?
      ORDER BY b.created_at DESC
    `, [req.user.id]);

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

async function cancelBooking(req, res) {
  try {
    const db = await getDb();
    const result = db.exec("SELECT * FROM bookings WHERE id = ? AND user_id = ?", [req.params.id, req.user.id]);

    if (result.length === 0 || result[0].values.length === 0) {
      return res.status(404).json({ error: 'Booking not found.' });
    }

    db.run("UPDATE bookings SET status = 'cancelled' WHERE id = ?", [req.params.id]);
    saveDb();

    res.json({ message: 'Booking cancelled successfully.' });
  } catch (err) {
    res.status(500).json({ error: 'Server error.' });
  }
}

module.exports = { createBooking, getUserBookings, cancelBooking };
