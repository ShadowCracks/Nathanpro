// backend/src/server.js
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const cookieParser = require('cookie-parser');
const path = require('path');

// Import routes
const authRoutes = require('./routes/authRoutes');
const courseRoutes = require('./routes/courseRoutes');
const paymentRoutes = require('./routes/paymentRoutes');
const adminRoutes = require('./routes/adminRoutes');

// Import supabase for testing
const supabase = require('./services/supabase');

const app = express();
const PORT = process.env.PORT || 3001;

// Trust proxy for Render deployment
if (process.env.NODE_ENV === 'production') {
  app.set('trust proxy', 1);
}

// Middleware
app.use(helmet({
  crossOriginResourcePolicy: false,
}));

// CORS configuration - simplified since frontend and backend are on same domain now
const corsOptions = {
  origin: function(origin, callback) {
    const allowedOrigins = [
      'http://localhost:5173',
      'http://localhost:3000',
      'http://localhost:5174'
    ];
    
    // Allow requests with no origin (like mobile apps) or same-origin requests
    if (!origin) return callback(null, true);
    
    // In production, allow same-origin requests
    if (process.env.NODE_ENV === 'production') {
      return callback(null, true);
    }
    
    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Cookie'],
  exposedHeaders: ['set-cookie']
};

app.use(cors(corsOptions));
app.use(cookieParser());

// Update the auth controller to fix cookie settings
app.use((req, res, next) => {
  const originalCookie = res.cookie.bind(res);
  res.cookie = function(name, value, options = {}) {
    const cookieOptions = {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
      maxAge: options.maxAge || 7 * 24 * 60 * 60 * 1000, // 7 days default
      path: '/',
      ...options
    };
    
    // Don't set domain - let the browser handle it
    delete cookieOptions.domain;
    
    return originalCookie(name, value, cookieOptions);
  };
  next();
});

// IMPORTANT: Webhook route MUST be defined BEFORE body parsing middleware
app.use('/api/stripe/webhook', express.raw({ type: 'application/json' }));

// Body parsing middleware for all other routes
app.use(express.json());

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/course', courseRoutes);
app.use('/api/stripe', paymentRoutes);
app.use('/api/admin', adminRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Server is running' });
});

// Test cookie endpoint
app.get('/api/test-cookie', (req, res) => {
  res.cookie('testCookie', 'testValue', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
    maxAge: 60000 // 1 minute
  });
  res.json({ 
    message: 'Test cookie set',
    cookies: req.cookies,
    headers: req.headers
  });
});

// Serve static files from the React build (only in production)
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../../client/dist')));

  // All non-API routes should serve the React app
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../../client/dist', 'index.html'));
  });
}

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({
    error: err.message || 'Internal server error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
});

// 404 handler for API routes only (in development)
if (process.env.NODE_ENV !== 'production') {
  app.use((req, res) => {
    res.status(404).json({ error: 'Route not found' });
  });
}

// Start server
app.listen(PORT, async () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
  
  // Only run Supabase tests in development
  if (process.env.NODE_ENV !== 'production') {
    console.log('\n🔍 Testing Supabase connection...');
    try {
      const { data: usersTest, error: usersError } = await supabase
        .from('users')
        .select('id')
        .limit(1);
      
      if (usersError) {
        console.error('❌ Users table error:', usersError);
      } else {
        console.log('✅ Users table accessible');
      }
      
      const { data: purchasesTest, error: purchasesError } = await supabase
        .from('purchases')
        .select('id')
        .limit(1);
      
      if (purchasesError) {
        console.error('❌ Purchases table error:', purchasesError);
      } else {
        console.log('✅ Purchases table accessible');
      }
      
      const { data: userId } = await supabase
        .from('users')
        .select('id')
        .limit(1)
        .single();
        
      if (userId) {
        console.log('📋 Testing purchase insert with user ID:', userId.id);
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
  } else {
    console.log('✅ Server started in production mode');
    console.log('🚀 Serving frontend and backend from same domain');
  }
});