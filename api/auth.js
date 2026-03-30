const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { getDb, saveDb } = require('./lib/db');
const { JWT_SECRET, authMiddleware } = require('./middleware/auth');

export default async function handler(req, res) {
  // Parse the action from the URL path.
  // URL comes in as /api/auth/register, /api/auth/login, etc. because of vercel rewrites
  const urlParts = req.url.split('?')[0].split('/');
  const action = urlParts[urlParts.length - 1]; // 'register', 'login', 'me', 'profile'

  if (req.method === 'POST' && action === 'register') return register(req, res);
  if (req.method === 'POST' && action === 'login') return login(req, res);
  if (req.method === 'GET' && action === 'me') {
    if (!authMiddleware(req, res)) return;
    return getProfile(req, res);
  }
  if (req.method === 'PUT' && action === 'profile') {
    if (!authMiddleware(req, res)) return;
    return updateProfile(req, res);
  }

  return res.status(404).json({ error: 'Not Found' });
}

async function register(req, res) {
  try {
    const { name, email, password, phone } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ error: 'Name, email and password are required.' });
    }

    if (password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters.' });
    }

    const db = await getDb();

    const existing = db.exec("SELECT id FROM users WHERE email = ?", [email]);
    if (existing.length > 0 && existing[0].values.length > 0) {
      return res.status(400).json({ error: 'Email already registered.' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    db.run("INSERT INTO users (name, email, password, phone) VALUES (?, ?, ?, ?)", 
      [name, email, hashedPassword, phone || null]);
    // saveDb(); disabled or handles internally

    const result = db.exec("SELECT id, name, email, role, phone, created_at FROM users WHERE email = ?", [email]);
    const user = {
      id: result[0].values[0][0],
      name: result[0].values[0][1],
      email: result[0].values[0][2],
      role: result[0].values[0][3],
      phone: result[0].values[0][4],
      created_at: result[0].values[0][5]
    };

    const token = jwt.sign({ id: user.id, email: user.email, role: user.role }, JWT_SECRET, { expiresIn: '7d' });

    res.status(201).json({ user, token });
  } catch (err) {
    console.error('Register error:', err);
    res.status(500).json({ error: 'Server error during registration.' });
  }
}

async function login(req, res) {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required.' });
    }

    const db = await getDb();
    const result = db.exec("SELECT id, name, email, password, role, phone, avatar, created_at FROM users WHERE email = ?", [email]);

    if (result.length === 0 || result[0].values.length === 0) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    const row = result[0].values[0];
    const user = {
      id: row[0], name: row[1], email: row[2], password: row[3],
      role: row[4], phone: row[5], avatar: row[6], created_at: row[7]
    };

    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    const token = jwt.sign({ id: user.id, email: user.email, role: user.role }, JWT_SECRET, { expiresIn: '7d' });

    delete user.password;
    res.json({ user, token });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ error: 'Server error during login.' });
  }
}

async function getProfile(req, res) {
  try {
    const db = await getDb();
    const result = db.exec("SELECT id, name, email, role, phone, avatar, created_at FROM users WHERE id = ?", [req.user.id]);

    if (result.length === 0 || result[0].values.length === 0) {
      return res.status(404).json({ error: 'User not found.' });
    }

    const row = result[0].values[0];
    res.json({
      id: row[0], name: row[1], email: row[2], role: row[3],
      phone: row[4], avatar: row[5], created_at: row[6]
    });
  } catch (err) {
    res.status(500).json({ error: 'Server error.' });
  }
}

async function updateProfile(req, res) {
  try {
    const { name, phone, avatar } = req.body;
    const db = await getDb();

    db.run("UPDATE users SET name = COALESCE(?, name), phone = COALESCE(?, phone), avatar = COALESCE(?, avatar) WHERE id = ?",
      [name || null, phone || null, avatar || null, req.user.id]);
    // saveDb();

    const result = db.exec("SELECT id, name, email, role, phone, avatar, created_at FROM users WHERE id = ?", [req.user.id]);
    const row = result[0].values[0];

    res.json({
      id: row[0], name: row[1], email: row[2], role: row[3],
      phone: row[4], avatar: row[5], created_at: row[6]
    });
  } catch (err) {
    res.status(500).json({ error: 'Server error.' });
  }
}
