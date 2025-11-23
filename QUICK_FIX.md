# Quick Fix - Get Site Working

## The Problem
The site is trying to use authentication but Supabase isn't configured properly.

## The Solution
**Restart BOTH servers** to apply the .env changes:

### Step 1: Stop Both Servers
Press `Ctrl+C` in both terminal windows

### Step 2: Start Backend Server
```bash
cd server
npm start
```

**You should see:**
```
⚠️  Supabase credentials not configured
⚠️  Running in simulation mode
Mode: simulation
```

### Step 3: Start Frontend Server
```bash
cd client
npm run dev
```

### Step 4: Refresh Browser
Go to http://localhost:3000

**You should see:**
- Purple banner: "Running in simulation mode"
- Dashboard with devices
- Everything working WITHOUT login

## If Still Not Working

Check the backend terminal - it should show:
```
Mode: simulation
```

If it shows `Mode: database`, the .env file wasn't updated correctly.

Make sure these lines in `server/.env` are COMMENTED OUT:
```env
# SUPABASE_URL=...
# SUPABASE_ANON_KEY=...
# SUPABASE_SERVICE_KEY=...
```

And these lines in `client/.env` are COMMENTED OUT:
```env
# VITE_SUPABASE_URL=...
# VITE_SUPABASE_ANON_KEY=...
```

Then restart both servers again!
