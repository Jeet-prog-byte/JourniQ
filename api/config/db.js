const initSqlJs = require('sql.js');
const path = require('path');
const fs = require('fs');

// Vercel deployment bundles files differently. By keeping journiq.db in api folder,
// we ensure it is accessible. We load it purely into memory so Vercel can run statelessly.
const DB_PATH = path.join(process.cwd(), 'api', 'journiq.db');

let db = null;

async function getDb() {
  if (db) return db;

  const SQL = await initSqlJs();

  if (fs.existsSync(DB_PATH)) {
    const fileBuffer = fs.readFileSync(DB_PATH);
    db = new SQL.Database(fileBuffer);
  } else {
    // Fallback if missing, create fresh structure
    db = new SQL.Database();
    console.warn("journiq.db not found at", DB_PATH, "- created an empty memory DB instead.");

    // Create tables
    db.run(`
      CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        email TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL,
        role TEXT DEFAULT 'user',
        avatar TEXT,
        phone TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    db.run(`
      CREATE TABLE IF NOT EXISTS packages (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT NOT NULL,
        destination TEXT NOT NULL,
        description TEXT,
        price REAL NOT NULL,
        duration INTEGER NOT NULL,
        max_travelers INTEGER DEFAULT 20,
        category TEXT,
        rating REAL DEFAULT 4.5,
        image_url TEXT,
        gallery TEXT,
        itinerary TEXT,
        included TEXT,
        is_featured INTEGER DEFAULT 0,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    db.run(`
      CREATE TABLE IF NOT EXISTS bookings (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        package_id INTEGER NOT NULL,
        travelers INTEGER DEFAULT 1,
        travel_date TEXT NOT NULL,
        total_price REAL NOT NULL,
        status TEXT DEFAULT 'confirmed',
        special_requests TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id),
        FOREIGN KEY (package_id) REFERENCES packages(id)
      )
    `);

    db.run(`
      CREATE TABLE IF NOT EXISTS reviews (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        package_id INTEGER NOT NULL,
        rating INTEGER NOT NULL,
        comment TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id),
        FOREIGN KEY (package_id) REFERENCES packages(id)
      )
    `);
  }

  return db;
}

// In a serverless stateless function without a writable filesystem, we purposefully disable saves.
function saveDb() {
  // No-op for Vercel
  // If local persistence is needed during development, you can uncomment file write:
  // if (db && process.env.NODE_ENV !== 'production') {
  //   const data = db.export();
  //   const buffer = Buffer.from(data);
  //   fs.writeFileSync(DB_PATH, buffer);
  // }
}

module.exports = { getDb, saveDb };
