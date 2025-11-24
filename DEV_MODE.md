# Development Mode - Skip Authentication

## Quick Setup

To bypass authentication during development and go straight to the dashboard:

### 1. Enable Dev Mode

In `client/.env`, set:
```env
VITE_SKIP_AUTH=true
```

### 2. Restart the Client

```bash
# Stop the client (Ctrl+C)
# Start it again
cd client
npm run dev
```

### 3. Access Dashboard Directly

- Open `http://localhost:5173`
- You'll go straight to the dashboard - **no login required!** 🎉

## What This Does

- ✅ Skips the login page
- ✅ Bypasses authentication checks
- ✅ Allows direct access to all pages
- ✅ Saves time during development

## Important Notes

⚠️ **WARNING**: This is for **DEVELOPMENT ONLY**!

- Backend API calls will still fail without a real token
- Some features that require user data won't work
- **NEVER deploy with `VITE_SKIP_AUTH=true`**

## When to Use This

**Good for:**
- Testing UI components
- Working on styling
- Developing frontend features
- Quick iterations without login hassle

**Not good for:**
- Testing authentication flows
- Testing API integrations
- Testing user-specific features
- Production deployments

## Re-enable Authentication

To turn authentication back on:

### Option 1: Set to false
```env
VITE_SKIP_AUTH=false
```

### Option 2: Remove the line
Just delete or comment out the line:
```env
# VITE_SKIP_AUTH=true
```

Then restart the client.

## Backend Note

The backend still requires authentication. If you need to test API calls without auth, you can:

1. Use a valid token from a logged-in session
2. Temporarily disable auth middleware on specific routes
3. Use the demo/simulation mode (comment out Supabase keys)

## Current Status

✅ **Dev mode is ENABLED** - Authentication is bypassed

You can now access the dashboard directly without logging in!
