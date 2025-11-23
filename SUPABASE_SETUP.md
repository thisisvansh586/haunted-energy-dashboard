# 🔮 Supabase Integration Setup Guide

This guide will help you integrate Supabase authentication and real-time features into your Haunted Energy Dashboard.

## 📋 Prerequisites

1. A Supabase account at [supabase.com](https://supabase.com)
2. Your project is already created: `juzleommevvicyqdebfi`
3. Node.js 18+ installed

## 🚀 Quick Setup

### Step 1: Run the Setup Script

```bash
node setup-supabase.js
```

This will:
- Generate secure JWT and session secrets
- Update `.kiro/environment` with the secrets
- Update `server/.env` with the secrets

### Step 2: Get Your Supabase Service Role Key

1. Go to: https://supabase.com/dashboard/project/juzleommevvicyqdebfi/settings/api
2. Copy your **Service Role Key** (⚠️ Keep this secret!)
3. Add it to `server/.env`:

```env
SUPABASE_SERVICE_KEY=your_service_role_key_here
```

### Step 3: Install Dependencies

```bash
# Install backend dependencies
cd server
npm install

# Install frontend dependencies
cd ../client
npm install
```

### Step 4: Start the Servers

```bash
# Terminal 1 - Backend
cd server
npm run dev

# Terminal 2 - Frontend
cd client
npm run dev
```

## 📁 Configuration Files

### Backend Configuration (`server/.env`)
```env
SUPABASE_URL=https://juzleommevvicyqdebfi.supabase.co
SUPABASE_SERVICE_KEY=your_service_role_key_here
JWT_SECRET=auto_generated
SESSION_SECRET=auto_generated
PORT=3001
NODE_ENV=development
```

### Frontend Configuration (`client/.env`)
```env
VITE_SUPABASE_URL=https://juzleommevvicyqdebfi.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
VITE_API_URL=http://localhost:3001
```

## 🔑 Key Differences

| Key Type | Used In | Purpose | Security Level |
|----------|---------|---------|----------------|
| **Anon Key** | Frontend | Public API access, respects RLS | Public (safe to expose) |
| **Service Key** | Backend | Admin access, bypasses RLS | Secret (never expose!) |

## 🏗️ Architecture

```
┌─────────────────────────────────────┐
│         React Frontend              │
│  ┌──────────────────────────────┐  │
│  │  supabaseClient.js           │  │
│  │  - Uses ANON_KEY             │  │
│  │  - Auth: signIn, signUp      │  │
│  │  - Realtime subscriptions    │  │
│  └──────────────────────────────┘  │
└─────────────────────────────────────┘
                 │
                 │ HTTPS
                 ▼
┌─────────────────────────────────────┐
│         Supabase Cloud              │
│  - Authentication                   │
│  - PostgreSQL Database              │
│  - Row Level Security (RLS)         │
│  - Realtime Subscriptions           │
└─────────────────────────────────────┘
                 ▲
                 │ HTTPS
                 │
┌─────────────────────────────────────┐
│         Node.js Backend             │
│  ┌──────────────────────────────┐  │
│  │  supabaseClient.js           │  │
│  │  - Uses SERVICE_KEY          │  │
│  │  - Admin operations          │  │
│  │  - Bypasses RLS              │  │
│  └──────────────────────────────┘  │
└─────────────────────────────────────┘
```

## 🔐 Security Best Practices

1. **Never commit `.env` files** - They're in `.gitignore`
2. **Service Key is SECRET** - Only use on backend
3. **Anon Key is PUBLIC** - Safe to use in frontend
4. **Use Row Level Security** - Protect your data with RLS policies
5. **Rotate secrets regularly** - Update JWT/Session secrets periodically

## 📊 Database Schema (Recommended)

Create these tables in your Supabase project:

### `devices` table
```sql
CREATE TABLE devices (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  room TEXT NOT NULL,
  base_power_w DECIMAL NOT NULL,
  state TEXT CHECK (state IN ('on', 'off', 'standby')),
  idle_threshold DECIMAL NOT NULL,
  user_id UUID REFERENCES auth.users(id),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE devices ENABLE ROW LEVEL SECURITY;

-- Policy: Users can only see their own devices
CREATE POLICY "Users can view own devices"
  ON devices FOR SELECT
  USING (auth.uid() = user_id);
```

### `telemetry` table
```sql
CREATE TABLE telemetry (
  id BIGSERIAL PRIMARY KEY,
  device_id TEXT REFERENCES devices(id),
  power_w DECIMAL NOT NULL,
  timestamp TIMESTAMP DEFAULT NOW(),
  user_id UUID REFERENCES auth.users(id)
);

-- Enable RLS
ALTER TABLE telemetry ENABLE ROW LEVEL SECURITY;

-- Policy: Users can only see their own telemetry
CREATE POLICY "Users can view own telemetry"
  ON telemetry FOR SELECT
  USING (auth.uid() = user_id);
```

### `anomalies` table
```sql
CREATE TABLE anomalies (
  id TEXT PRIMARY KEY,
  device_id TEXT REFERENCES devices(id),
  type TEXT CHECK (type IN ('phantom_load', 'spike')),
  severity TEXT CHECK (severity IN ('low', 'medium', 'high', 'critical')),
  title TEXT NOT NULL,
  description TEXT,
  remediation TEXT,
  estimated_cost TEXT,
  timestamp TIMESTAMP DEFAULT NOW(),
  user_id UUID REFERENCES auth.users(id)
);

-- Enable RLS
ALTER TABLE anomalies ENABLE ROW LEVEL SECURITY;

-- Policy: Users can only see their own anomalies
CREATE POLICY "Users can view own anomalies"
  ON anomalies FOR SELECT
  USING (auth.uid() = user_id);
```

## 🎯 Usage Examples

### Frontend - Sign In
```javascript
import { signIn } from './supabaseClient'

const handleLogin = async () => {
  const { data, error } = await signIn('user@example.com', 'password')
  if (error) console.error('Login failed:', error)
  else console.log('Logged in:', data.user)
}
```

### Frontend - Subscribe to Realtime Updates
```javascript
import { subscribeToChannel } from './supabaseClient'

const subscription = subscribeToChannel('devices', (payload) => {
  console.log('Device updated:', payload)
  // Update your React state here
})

// Cleanup
subscription.unsubscribe()
```

### Backend - Admin Query
```javascript
import { supabase } from './supabaseClient.js'

// Get all devices (bypasses RLS with service key)
const { data, error } = await supabase
  .from('devices')
  .select('*')
```

## 🧪 Testing

The dashboard works in two modes:

1. **Simulation Mode** (default) - No Supabase required
   - Uses in-memory data
   - Perfect for development and testing

2. **Supabase Mode** - When credentials are configured
   - Persists data to database
   - Enables authentication
   - Enables realtime updates

## 🆘 Troubleshooting

### "Supabase not configured" warning
- Check that `.env` files exist and have correct values
- Verify SUPABASE_URL and keys are set
- Restart the dev servers after changing `.env`

### Authentication not working
- Verify VITE_SUPABASE_ANON_KEY is correct in `client/.env`
- Check Supabase dashboard for auth settings
- Ensure email confirmation is disabled for development

### Database queries failing
- Verify SUPABASE_SERVICE_KEY is correct in `server/.env`
- Check RLS policies in Supabase dashboard
- Ensure tables exist and have correct schema

## 📚 Resources

- [Supabase Documentation](https://supabase.com/docs)
- [Supabase JavaScript Client](https://supabase.com/docs/reference/javascript/introduction)
- [Row Level Security Guide](https://supabase.com/docs/guides/auth/row-level-security)
- [Realtime Subscriptions](https://supabase.com/docs/guides/realtime)

## 🎃 Ready to Go!

Once setup is complete, your Haunted Energy Dashboard will have:
- ✅ Secure authentication
- ✅ Database persistence
- ✅ Real-time updates
- ✅ Multi-user support with RLS
- ✅ Production-ready architecture

Happy haunting! 👻⚡
