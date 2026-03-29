const express = require('express');
const router = express.Router();
const { getStats, getAllBookings, createPackage, updatePackage, deletePackage, getAllUsers } = require('../controllers/adminController');
const { authMiddleware, adminMiddleware } = require('../middleware/auth');

router.use(authMiddleware, adminMiddleware);

router.get('/stats', getStats);
router.get('/bookings', getAllBookings);
router.post('/packages', createPackage);
router.put('/packages/:id', updatePackage);
router.delete('/packages/:id', deletePackage);
router.get('/users', getAllUsers);

module.exports = router;
