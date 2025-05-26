// backend/src/routes/authRoutes.js
const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/auth');
const { googleSignIn, getCurrentUser, logout } = require('../controllers/authController');

// Public routes
router.post('/google', googleSignIn);

// Protected routes
router.get('/me', authenticateToken, getCurrentUser);
router.post('/logout', logout);

module.exports = router;