const initSqlJs = require('sql.js');
const path = require('path');
const fs = require('fs');

const seedData = require('./seedData.json');

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

  // Idempotent Seeding Logic
  try {
    const res = db.exec("SELECT COUNT(*) as count FROM packages");
    let count = 0;
    if (res.length > 0 && res[0].values.length > 0) {
      count = res[0].values[0][0];
    }
    
    if (count === 0) {
      console.log("DB is empty. Auto-seeding packages...");
      seedDatabase(db);
    }
  } catch (err) {
    console.error("Error during DB count check:", err);
    // If 'packages' table didn't exist or errored, try seeding anyway
    seedDatabase(db);
  }

  return db;
}

function seedDatabase(db) {
  try {
    // Seed users
    if (seedData.users && seedData.users.length) {
      const stmt = db.prepare("INSERT INTO users (id, name, email, password, role, avatar, phone, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)");
      for (const u of seedData.users) {
        stmt.run([u.id, u.name, u.email, u.password, u.role, u.avatar, u.phone, u.created_at]);
      }
      stmt.free();
    }

    // Seed packages
    if (seedData.packages && seedData.packages.length) {
      const stmt = db.prepare("INSERT INTO packages (id, title, destination, description, price, duration, max_travelers, category, rating, image_url, gallery, itinerary, included, is_featured, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)");
      for (const p of seedData.packages) {
        stmt.run([p.id, p.title, p.destination, p.description, p.price, p.duration, p.max_travelers, p.category, p.rating, p.image_url, p.gallery, p.itinerary, p.included, p.is_featured, p.created_at]);
      }
      stmt.free();
    }

    // Seed bookings
    if (seedData.bookings && seedData.bookings.length) {
      const stmt = db.prepare("INSERT INTO bookings (id, user_id, package_id, travelers, travel_date, total_price, status, special_requests, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)");
      for (const b of seedData.bookings) {
        stmt.run([b.id, b.user_id, b.package_id, b.travelers, b.travel_date, b.total_price, b.status, b.special_requests, b.created_at]);
      }
      stmt.free();
    }

    // Seed reviews
    if (seedData.reviews && seedData.reviews.length) {
      const stmt = db.prepare("INSERT INTO reviews (id, user_id, package_id, rating, comment, created_at) VALUES (?, ?, ?, ?, ?, ?)");
      for (const r of seedData.reviews) {
        stmt.run([r.id, r.user_id, r.package_id, r.rating, r.comment, r.created_at]);
      }
      stmt.free();
    }
    console.log("Database seeded successfully.");
  } catch (err) {
    console.error("Error seeding database:", err);
  }
}

function saveDb() {
  // No-op for Vercel
}

module.exports = { getDb, saveDb };
