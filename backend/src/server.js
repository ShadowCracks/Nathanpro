// backend/src/server.js
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const cookieParser = require('cookie-parser');

// Import routes
const authRoutes = require('./routes/authRoutes');
const courseRoutes = require('./routes/courseRoutes');
const paymentRoutes = require('./routes/paymentRoutes');
const adminRoutes = require('./routes/adminRoutes');

// Import supabase for testing
const supabase = require('./services/supabase');

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(helmet());
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  credentials: true
}));
app.use(cookieParser());

// IMPORTANT: Webhook route MUST be defined BEFORE body parsing middleware
// This ensures the webhook receives the raw body for signature verification
app.use('/api/stripe/webhook', express.raw({ type: 'application/json' }));

// Body parsing middleware for all other routes
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/course', courseRoutes);
app.use('/api/stripe', paymentRoutes);
app.use('/api/admin', adminRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Server is running' });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({
    error: err.message || 'Internal server error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// Start server
app.listen(PORT, async () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
  
  // Test Supabase connection
  console.log('\n🔍 Testing Supabase connection...');
  try {
    // Test users table
    const { data: usersTest, error: usersError } = await supabase
      .from('users')
      .select('id')
      .limit(1);
    
    if (usersError) {
      console.error('❌ Users table error:', usersError);
    } else {
      console.log('✅ Users table accessible');
    }
    
    // Test purchases table
    const { data: purchasesTest, error: purchasesError } = await supabase
      .from('purchases')
      .select('id')
      .limit(1);
    
    if (purchasesError) {
      console.error('❌ Purchases table error:', purchasesError);
    } else {
      console.log('✅ Purchases table accessible');
    }
    
    // Test if we can see the table structure
    const { data: userId } = await supabase
      .from('users')
      .select('id')
      .limit(1)
      .single();
      
    if (userId) {
      console.log('📋 Testing purchase insert with user ID:', userId.id);
      // This is just a test, we'll delete it right after
      const { data: testPurchase, error: insertError } = await supabase
        .from('purchases')
        .insert({
          user_id: userId.id,
          product_type: 'course',
          stripe_session_id: 'test_' + Date.now(),
          amount: 0,
          status: 'test',
          purchased_at: new Date().toISOString(),
        })
        .select();
      
      if (insertError) {
        console.error('❌ Purchase insert test failed:', insertError);
      } else {
        console.log('✅ Purchase insert test successful');
        // Clean up test purchase
        await supabase
          .from('purchases')
          .delete()
          .eq('id', testPurchase[0].id);
      }
    }
    
  } catch (err) {
    console.error('❌ Supabase connection test failed:', err);
  }
  console.log('');
});