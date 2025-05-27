// backend/src/server.js
require('dotenv').config();
const express = require('express');
const cors = require('cors');
//const helmet = require('helmet');
const cookieParser = require('cookie-parser');
const path = require('path');
const fs = require('fs');

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

// 🔐 Helmet configuration with CSP for Google Sign-In (ONLY ONE helmet config)


// CORS configuration
const corsOptions = {
  origin: function(origin, callback) {
    const allowedOrigins = [
      'https://nathanpro.onrender.com',
      'https://accounts.google.com',
      'http://localhost:5173',
      'http://localhost:3000'
    ];
    
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else if (process.env.NODE_ENV === 'production' && origin && origin.includes('nathanpro.onrender.com')) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Cookie', 'admin-id'],
  exposedHeaders: ['set-cookie']
};

app.use(cors(corsOptions));
app.use(cookieParser());

// 🍪 Universal cookie override with production-ready secure settings
app.use((req, res, next) => {
  const originalCookie = res.cookie.bind(res);
  res.cookie = function(name, value, options = {}) {
    const cookieOptions = {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
      maxAge: options.maxAge || 7 * 24 * 60 * 60 * 1000,
      path: '/',
      ...options
    };
    delete cookieOptions.domain;
    return originalCookie(name, value, cookieOptions);
  };
  next();
});

// Webhook route (must be before JSON body parsing)
app.use('/api/stripe/webhook', express.raw({ type: 'application/json' }));

// Body parsing
app.use(express.json());

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/course', courseRoutes);
app.use('/api/stripe', paymentRoutes);
app.use('/api/admin', adminRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Server is running' });
});

// Cookie test route
app.get('/api/test-cookie', (req, res) => {
  res.cookie('testCookie', 'testValue', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
    maxAge: 60000
  });
  res.json({
    message: 'Test cookie set',
    cookies: req.cookies,
    headers: req.headers
  });
});

// Serve frontend static files
const clientBuildPath = process.env.NODE_ENV === 'production'
  ? path.join(__dirname, '../../client/dist')
  : path.join(__dirname, '../client/dist');

app.use(express.static(clientBuildPath));

// SPA fallback to index.html
app.use((req, res, next) => {
  if (req.path.startsWith('/api')) return next();
  const indexPath = path.join(clientBuildPath, 'index.html');
  if (fs.existsSync(indexPath)) {
    res.sendFile(indexPath);
  } else {
    console.error('Frontend build not found at:', indexPath);
    res.status(404).json({
      error: 'Frontend not found',
      looking_at: indexPath,
      cwd: process.cwd(),
      dirname: __dirname
    });
  }
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({
    error: err.message || 'Internal server error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
});

// Start server
app.listen(PORT, async () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`Looking for frontend at: ${clientBuildPath}`);

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
    } catch (err) {
      console.error('❌ Supabase connection test failed:', err);
    }
    console.log('');
  } else {
    console.log('✅ Server started in production mode');
  }
});