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

// Trust proxy for Render deployment
if (process.env.NODE_ENV === 'production') {
 app.set('trust proxy', 1);
}

// Middleware
app.use(helmet({
 crossOriginResourcePolicy: false,
}));

// CORS configuration - Fixed for production with cookies
const corsOptions = {
 origin: [
   'https://nathanpro-seven.vercel.app',
   'http://localhost:5173',
   'http://localhost:3000',
   'http://localhost:5174'
 ],
 credentials: true,
 methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
 allowedHeaders: ['Content-Type', 'Authorization', 'Cookie'],
 exposedHeaders: ['set-cookie']
};

app.use(cors(corsOptions));

// Cookie parser with options for production
app.use(cookieParser());

// Set cookie options globally for production
app.use((req, res, next) => {
 if (process.env.NODE_ENV === 'production') {
   // Override res.cookie to always use secure settings in production
   const originalCookie = res.cookie.bind(res);
   res.cookie = function(name, value, options = {}) {
     return originalCookie(name, value, {
       ...options,
       httpOnly: options.httpOnly !== false, // Default to true
       secure: true, // Always true in production
       sameSite: 'none', // Required for cross-origin cookies
       domain: '.onrender.com', // Allow cookie for all render subdomains
       path: '/'
     });
   };
 }
 next();
});

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
 
 // Only run Supabase tests in development
 if (process.env.NODE_ENV !== 'production') {
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
 } else {
   console.log('✅ Server started in production mode');
 }
});