// backend/src/services/supabase.js
const { createClient } = require('@supabase/supabase-js');

if (!process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_KEY) {
  console.error('Missing Supabase environment variables!');
  console.error('SUPABASE_URL:', process.env.SUPABASE_URL);
  console.error('SUPABASE_SERVICE_KEY exists:', !!process.env.SUPABASE_SERVICE_KEY);
}

// Initialize Supabase client with service role key for admin operations
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
);

console.log('Supabase client created:', typeof supabase.from);

module.exports = supabase;