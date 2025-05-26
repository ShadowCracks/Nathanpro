// backend/scripts/generatePassword.js
// Run this script to generate a bcrypt hash for admin passwords
// Usage: node scripts/generatePassword.js yourpassword

const bcrypt = require('bcrypt');

const password = process.argv[2];

if (!password) {
  console.error('Please provide a password as an argument');
  console.log('Usage: node scripts/generatePassword.js yourpassword');
  process.exit(1);
}

const saltRounds = 10;

bcrypt.hash(password, saltRounds, (err, hash) => {
  if (err) {
    console.error('Error generating hash:', err);
    process.exit(1);
  }
  
  console.log('\nPassword:', password);
  console.log('Hash:', hash);
  console.log('\nUse this hash in your Supabase admin insert query.');
});