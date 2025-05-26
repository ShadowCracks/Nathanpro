# Nathan Soufer Course Platform - Backend

This is the Express.js backend for the course platform.

## Setup Instructions

### 1. Install Dependencies
```bash
cd backend
npm install
```

### 2. Set up Supabase Database

1. Create a new Supabase project at https://supabase.com
2. Go to SQL Editor in your Supabase dashboard
3. Copy and run the entire contents of `supabase-schema.sql`
4. Get your Supabase credentials:
   - Project URL: Settings → API → Project URL
   - Service Role Key: Settings → API → Service role (secret)

### 3. Configure Environment Variables

Create a `.env` file in the backend directory:

```env
PORT=3001

# Supabase
SUPABASE_URL=your_supabase_project_url
SUPABASE_SERVICE_KEY=your_supabase_service_role_key

# Stripe
STRIPE_SECRET_KEY=sk_test_your_stripe_secret_key
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret

# Google OAuth
GOOGLE_CLIENT_ID=your_google_client_id.apps.googleusercontent.com

# JWT Secret (generate a random string)
JWT_SECRET=your_super_secret_jwt_key_here_make_it_long_and_random

# Frontend URL
CLIENT_URL=http://localhost:5173

# Node Environment
NODE_ENV=development
```

### 4. Create Admin Account

1. Generate a password hash:
```bash
node scripts/generatePassword.js your-admin-password
```

2. Update the admin insert query in Supabase with the generated hash

### 5. Set up Stripe Webhook (for local development)

```bash
# Install Stripe CLI
brew install stripe/stripe-cli/stripe  # Mac
# Or download from https://stripe.com/docs/stripe-cli

# Login to Stripe
stripe login

# Forward webhooks to your local server
stripe listen --forward-to localhost:3001/api/stripe/webhook
```

Copy the webhook signing secret and add it to your `.env` file.

### 6. Run the Server

Development mode:
```bash
npm run dev
```

Production mode:
```bash
npm start
```

## API Endpoints

### Authentication
- `POST /api/auth/google` - Google sign-in
- `GET /api/auth/me` - Get current user (protected)
- `POST /api/auth/logout` - Logout

### Course
- `GET /api/course/status` - Get course status
- `GET /api/course/modules` - Get course modules (protected)

### Payments
- `POST /api/stripe/create-checkout` - Create Stripe checkout session (protected)
- `POST /api/stripe/webhook` - Stripe webhook handler
- `GET /api/payment/verify/:sessionId` - Verify payment (protected)

### Admin
- `POST /api/admin/login` - Admin login
- `GET /api/admin/users` - Get all users (admin only)
- `GET /api/admin/ebook-stats` - Get ebook statistics (admin only)
- `GET /api/admin/course/modules` - Get all course modules (admin only)
- `POST /api/admin/course/module` - Create/update course module (admin only)
- `DELETE /api/admin/course/module/:id` - Delete course module (admin only)
- `POST /api/admin/course/reorder` - Reorder course modules (admin only)

## Testing

Test the API using tools like Postman or curl:

```bash
# Health check
curl http://localhost:3001/api/health

# Test Google sign-in (use actual Google token)
curl -X POST http://localhost:3000/api/auth/google \
  -H "Content-Type: application/json" \
  -d '{"token": "your-google-id-token"}'
```

## Production Deployment

1. Update environment variables for production
2. Set `NODE_ENV=production`
3. Use HTTPS for all URLs
4. Update CORS origin to match your frontend domain
5. Set up proper Stripe webhook endpoint in Stripe dashboard
6. Use a process manager like PM2 or deploy to a service like Heroku/Railway

## Security Notes

- Never commit `.env` file to git
- Always use HTTPS in production
- Keep all dependencies updated
- Use strong JWT secrets
- Implement rate limiting for production
- Add request validation and sanitization