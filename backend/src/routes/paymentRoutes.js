// backend/src/routes/paymentRoutes.js
const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/auth');
const { 
  createCheckoutSession, 
  handleStripeWebhook, 
  verifyPayment 
} = require('../controllers/paymentController');

// Webhook route (no auth, uses Stripe signature verification)
router.post('/webhook', express.raw({ type: 'application/json' }), handleStripeWebhook);

// Protected routes
router.post('/create-checkout', authenticateToken, createCheckoutSession);
router.get('/verify/:sessionId', authenticateToken, verifyPayment);

module.exports = router;