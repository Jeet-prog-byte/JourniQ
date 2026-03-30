const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'journiq_secret_key_2024';

function authMiddleware(req, res) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({ error: 'Access denied. No token provided.' });
    return false;
  }

  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    return true;
  } catch (err) {
    res.status(401).json({ error: 'Invalid or expired token.' });
    return false;
  }
}

function adminMiddleware(req, res) {
  if (req.user?.role !== 'admin') {
    res.status(403).json({ error: 'Access denied. Admin only.' });
    return false;
  }
  return true;
}

module.exports = { authMiddleware, adminMiddleware, JWT_SECRET };
