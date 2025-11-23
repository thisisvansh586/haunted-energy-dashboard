# 🚀 Setup Instructions - Enable Full Features

Your app is currently running in **simulation mode**. To enable authentication, user profiles, and device management, follow these steps:

## Step 1: Get Supabase Keys

1. Go to: https://supabase.com/dashboard/project/juzleommevvicyqdebfi/settings/api
2. Copy these two keys:
   - **Project URL**: `https://juzleommevvicyqdebfi.supabase.co`
   - **anon public** key (starts with `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`)
   - **service_role** key (starts with `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`)

## Step 2: Update Environment Files

### Update `server/.env`:
```env
SUPABASE_URL=https://juzleommevvicyqdebfi.supabase.co
SUPABASE_ANON_KEY=<paste your anon key here>
SUPABASE_SERVICE_KEY=<paste your service_role key here>
```

### Update `client/.env`:
```env
VITE_SUPABASE_URL=https://juzleommevvicyqdebfi.supabase.co
VITE_SUPABASE_ANON_KEY=<paste your anon key here>
```

## Step 3: Run Database Migration

1. Go to: https://supabase.com/dashboard/project/juzleommevvicyqdebfi/sql/new
2. Open the file `db/migrations/001_schema.sql` in your project
3. Copy ALL the SQL code
4. Paste it into the Supabase SQL Editor
5. Click **"Run"** button
6. You should see: "Success. No rows returned"

## Step 4: Restart Servers

### Stop current servers (Ctrl+C in both terminals)

### Terminal 1 - Start Backend:
```bash
cd server
npm start
```

### Terminal 2 - Start Frontend:
```bash
cd client
npm run dev
```

## Step 5: Test the Features

1. Open http://localhost:3000
2. You should see the **login page** (not simulation mode)
3. Click "Sign Up" to create an account
4. After signup, you'll be offered to create a demo home
5. Click "🔮 Create Demo Home"
6. You should see the dashboard with:
   - Home selector at the top
   - Real-time connection indicator
   - Devices with "➕ Add Device" button
   - Device controls (toggle states, edit button)

## Troubleshooting

### Still seeing "simulation mode"?
- Make sure you uncommented the Supabase variables in BOTH `.env` files
- Make sure you replaced the placeholder keys with your REAL keys
- Restart both servers completely

### "Failed to fetch" errors?
- Check that the backend server is running on port 3002
- Check browser console for errors
- Verify your Supabase keys are correct

### Database errors?
- Make sure you ran the migration SQL in Supabase
- Check that all tables were created: homes, devices, telemetry, anomalies, notifications
- Verify RLS policies are enabled

### Can't sign up?
- Check Supabase Auth settings: https://supabase.com/dashboard/project/juzleommevvicyqdebfi/auth/users
- Make sure email confirmation is disabled for testing
- Check server logs for errors

## What You'll Get

Once configured, you'll have:

✅ **Login/Signup** - Full authentication system
✅ **User Profiles** - Your email shown in navigation
✅ **Device Management** - Add, edit, delete devices
✅ **Device Controls** - Toggle device states
✅ **Real-time Updates** - Live power consumption
✅ **Multi-home Support** - Manage multiple properties
✅ **Demo Home** - Quick start with sample devices
✅ **Notifications** - Real-time anomaly alerts

## Quick Test Commands

After setup, test the API:

```bash
# Test health endpoint
curl http://localhost:3002/health

# Should return: {"status":"ok","supabase":"configured","mode":"database"}
```

If you see `"mode":"database"`, you're good to go! 🎉
