# Authentication Troubleshooting Guide

## Changes Made

I've updated the authentication system to properly handle Supabase tokens:

### 1. ✅ Enhanced Auth Store (`client/src/store/authStore.js`)

**Changes:**
- Added proper `supabase.auth.getSession()` on initialization
- Added `supabase.auth.onAuthStateChange()` listener for token refresh
- Enhanced `getToken()` with better error handling and logging
- Added console logs to track auth state changes

**Key Features:**
- Automatically refreshes tokens when they expire
- Stores session in localStorage via Zustand persist
- Listens for SIGNED_IN, SIGNED_OUT, TOKEN_REFRESHED, USER_UPDATED events

### 2. ✅ Enhanced Backend Auth Middleware (`server/middleware/auth.js`)

**Changes:**
- Added detailed logging for auth failures
- Better error messages with details
- Validates token is not null/undefined/empty

### 3. ✅ Enhanced DeviceManagementModal (`client/src/components/DeviceManagementModal.jsx`)

**Changes:**
- Added token validation before API calls
- Added detailed console logging for debugging
- Better error messages

## How It Works

### Token Flow:

1. **User logs in** → Supabase returns session with `access_token`
2. **Session stored** → Zustand stores session in state + localStorage
3. **API calls** → `getToken()` retrieves fresh token (auto-refreshes if needed)
4. **Token sent** → `Authorization: Bearer <token>` header in all requests
5. **Backend validates** → Middleware verifies token with Supabase
6. **Token refresh** → `onAuthStateChange` listener updates session automatically

## Testing Steps

### 1. Check Browser Console

Open DevTools Console and look for these messages:

**On Page Load:**
```
✅ Session loaded: user@example.com
```

**On Login:**
```
🔄 Auth state changed: SIGNED_IN user@example.com
```

**On API Call:**
```
✅ Token retrieved for: user@example.com
🔑 Token retrieved, making API call...
📤 Sending request: POST http://localhost:3002/api/devices
```

**On Token Refresh (automatic):**
```
🔄 Auth state changed: TOKEN_REFRESHED user@example.com
```

### 2. Check Server Console

Look for these messages:

**On Successful Auth:**
```
✅ Auth success: user@example.com
```

**On Auth Failure:**
```
❌ Auth failed: Invalid or expired token
```

### 3. Test Authentication

1. **Log out** (if logged in)
2. **Log in** with your credentials
3. **Check console** for "Session loaded" message
4. **Try adding a device** - should work now!

### 4. Verify Token in Network Tab

1. Open DevTools → Network tab
2. Try adding a device
3. Click on the `/api/devices` request
4. Check Headers → Request Headers
5. Should see: `Authorization: Bearer eyJhbGc...` (long token)

## Common Issues & Solutions

### Issue: "Invalid or expired token"

**Possible Causes:**
1. Not logged in
2. Session expired
3. Token not being sent

**Solutions:**
1. Log out and log back in
2. Check console for "Session loaded" message
3. Verify token in Network tab

### Issue: "Missing or invalid authorization header"

**Possible Causes:**
1. Token is null/undefined
2. `getToken()` not being awaited
3. Supabase not configured

**Solutions:**
1. Check `.env` file has `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`
2. Restart dev server after changing `.env`
3. Clear browser localStorage and log in again

### Issue: Token not refreshing

**Possible Causes:**
1. `onAuthStateChange` listener not set up
2. Supabase auto-refresh disabled

**Solutions:**
1. Check console for "Auth state changed: TOKEN_REFRESHED" messages
2. Verify `autoRefreshToken: true` in supabaseClient.js (already set)

## Manual Testing

### Test 1: Fresh Login
```bash
# 1. Clear browser storage
localStorage.clear()

# 2. Refresh page
# 3. Log in
# 4. Check console for "Session loaded"
# 5. Try adding device
```

### Test 2: Token Refresh
```bash
# 1. Log in
# 2. Wait 55 minutes (tokens expire after 1 hour)
# 3. Try adding device
# 4. Should auto-refresh and work
```

### Test 3: API Call
```bash
# In browser console:
const store = useAuthStore.getState()
const token = await store.getToken()
console.log('Token:', token)

# Should print a long JWT token
```

## Environment Variables

Make sure these are set in `client/.env`:

```env
VITE_SUPABASE_URL=https://juzleommevvicyqdebfi.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
VITE_API_URL=http://localhost:3002
```

And in `server/.env`:

```env
SUPABASE_URL=https://juzleommevvicyqdebfi.supabase.co
SUPABASE_SERVICE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
PORT=3002
```

## Quick Fix Commands

### Restart Everything
```bash
# Terminal 1 - Server
cd server
npm run dev

# Terminal 2 - Client
cd client
npm run dev
```

### Clear Browser State
```javascript
// In browser console
localStorage.clear()
sessionStorage.clear()
location.reload()
```

### Check Current Auth State
```javascript
// In browser console
const store = useAuthStore.getState()
console.log('User:', store.user)
console.log('Session:', store.session)
console.log('Token:', await store.getToken())
```

## Next Steps

1. **Log out and log back in** to get a fresh session
2. **Check browser console** for auth messages
3. **Try adding a device** - should work now!
4. **Check server console** for "Auth success" message

If you still see "Invalid or expired token", please share:
1. Browser console output
2. Server console output
3. Network tab screenshot showing the Authorization header
