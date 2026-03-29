const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const path = require('path');
const { getDb } = require('./config/db');

const authRoutes = require('./routes/auth');
const packageRoutes = require('./routes/packages');
const bookingRoutes = require('./routes/bookings');
const adminRoutes = require('./routes/admin');
const reviewRoutes = require('./routes/reviews');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(helmet({ contentSecurityPolicy: false }));
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/packages', packageRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/reviews', reviewRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'JourniQ API is running' });
});

// Serve Frontend in Production
if (process.env.NODE_ENV === 'production') {
  const clientBuildPath = path.join(__dirname, '../client/dist');
  app.use(express.static(clientBuildPath));

  // Forward all other requests to React Router
  app.get('*', (req, res) => {
    res.sendFile(path.resolve(clientBuildPath, 'index.html'));
  });
}

// Error handling
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

// Start server
async function start() {
  await getDb(); // Initialize database
  app.listen(PORT, () => {
    console.log(`\n🌍 JourniQ API Server running on http://localhost:${PORT}`);
    console.log(`   Health check: http://localhost:${PORT}/api/health\n`);
  });
}

start().catch(console.error);
