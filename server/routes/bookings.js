const express = require('express');
const router = express.Router();
const { createBooking, getUserBookings, cancelBooking } = require('../controllers/bookingController');
const { authMiddleware } = require('../middleware/auth');

router.post('/', authMiddleware, createBooking);
router.get('/', authMiddleware, getUserBookings);
router.put('/:id/cancel', authMiddleware, cancelBooking);

module.exports = router;
