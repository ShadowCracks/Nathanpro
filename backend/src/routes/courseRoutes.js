// backend/src/routes/courseRoutes.js
const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/auth');
const { getCourseModules, getCourseStatus } = require('../controllers/courseController');

// Public routes
router.get('/status', getCourseStatus);

// Protected routes
router.get('/modules', authenticateToken, getCourseModules);

module.exports = router;