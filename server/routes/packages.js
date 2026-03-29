const express = require('express');
const router = express.Router();
const { getAllPackages, getFeaturedPackages, getPackageById } = require('../controllers/packageController');

router.get('/', getAllPackages);
router.get('/featured', getFeaturedPackages);
router.get('/:id', getPackageById);

module.exports = router;
