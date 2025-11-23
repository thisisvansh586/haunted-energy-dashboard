# 🚀 API Quick Start Guide

## Prerequisites

1. ✅ Database migration run in Supabase
2. ✅ Server running: `npm run dev` (in server folder)
3. ✅ Supabase keys configured in `.env`

## Step 1: Sign Up

**Option A: Via Supabase Dashboard**
1. Go to: https://supabase.com/dashboard/project/juzleommevvicyqdebfi/auth/users
2. Click "Add User" → "Create new user"
3. Enter email and password
4. Copy the user ID

**Option B: Via API** (if email auth enabled)
```bash
curl -X POST https://juzleommevvicyqdebfi.supabase.co/auth/v1/signup \
  -H "apikey: YOUR_ANON_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "securepassword123"
  }'
```

## Step 2: Get JWT Token

**Via Supabase Dashboard:**
1. Go to Auth → Users
2. Click on your user
3. Copy the "Access Token" (JWT)

**Via API:**
```bash
curl -X POST https://juzleommevvicyqdebfi.supabase.co/auth/v1/token?grant_type=password \
  -H "apikey: YOUR_ANON_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "securepassword123"
  }'
```

Save the `access_token` from the response.

## Step 3: Create Demo Home

```bash
curl -X POST http://localhost:3001/api/auth/setup-demo-home \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json"
```

**Response:**
```json
{
  "message": "Demo home created successfully",
  "home": {
    "id": "uuid-here",
    "name": "Haunted Manor",
    "owner": "user-id"
  },
  "devices": [
    { "name": "Haunted Fridge", "room": "Kitchen", ... },
    { "name": "Phantom TV", "room": "Living Room", ... },
    ...
  ]
}
```

## Step 4: Test API Endpoints

### List Your Homes
```bash
curl http://localhost:3001/api/homes \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### List Devices
```bash
# Replace HOME_ID with your home's UUID
curl "http://localhost:3001/api/devices?homeId=HOME_ID" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### Toggle Device
```bash
# Replace DEVICE_ID with a device UUID
curl -X POST http://localhost:3001/api/devices/DEVICE_ID/toggle \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"state": "on"}'
```

### Simulate Phantom Load
```bash
curl -X POST http://localhost:3001/api/simulate \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "scenario": "phantom_load",
    "homeId": "HOME_ID",
    "deviceId": "DEVICE_ID"
  }'
```

### Get Anomalies
```bash
curl "http://localhost:3001/api/anomalies?homeId=HOME_ID" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### Get Weekly Report
```bash
curl "http://localhost:3001/api/reports?homeId=HOME_ID&period=weekly" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

## Step 5: Test Simulation Scenarios

### Phantom Load
```bash
curl -X POST http://localhost:3001/api/simulate \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "scenario": "phantom_load",
    "homeId": "HOME_ID",
    "deviceId": "DEVICE_ID"
  }'
```

### Power Spike
```bash
curl -X POST http://localhost:3001/api/simulate \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "scenario": "spike",
    "homeId": "HOME_ID",
    "deviceId": "DEVICE_ID"
  }'
```

### Ghost Walk
```bash
curl -X POST http://localhost:3001/api/simulate \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "scenario": "ghost_walk",
    "homeId": "HOME_ID"
  }'
```

## Environment Variables

Make sure your `server/.env` has:
```env
SUPABASE_URL=https://juzleommevvicyqdebfi.supabase.co
SUPABASE_SERVICE_KEY=your_service_key_here
JWT_SECRET=auto_generated
SESSION_SECRET=auto_generated
DEFAULT_KWH_RATE=0.12
PORT=3001
```

## Troubleshooting

### "Missing or invalid authorization header"
- Make sure you include: `-H "Authorization: Bearer YOUR_TOKEN"`
- Token must be a valid JWT from Supabase

### "Access denied"
- Verify the homeId belongs to your user
- Check RLS policies are enabled in Supabase

### "Supabase not configured"
- Check `server/.env` has SUPABASE_SERVICE_KEY
- Restart the server after adding keys

### "Home not found"
- Run `/api/auth/setup-demo-home` first
- Or create a home via `/api/homes` POST

## Testing with Postman

1. Create a new collection
2. Add environment variable: `jwt_token`
3. Set Authorization header: `Bearer {{jwt_token}}`
4. Import these endpoints

## Next Steps

Once API is working:
1. Build frontend authentication
2. Add realtime subscriptions
3. Create dashboard UI
4. Add device controls

## Quick Test Script

Save as `test-api.sh`:
```bash
#!/bin/bash

# Set your JWT token here
TOKEN="your_jwt_token_here"

echo "🏠 Creating demo home..."
HOME_RESPONSE=$(curl -s -X POST http://localhost:3001/api/auth/setup-demo-home \
  -H "Authorization: Bearer $TOKEN")

HOME_ID=$(echo $HOME_RESPONSE | jq -r '.home.id')
DEVICE_ID=$(echo $HOME_RESPONSE | jq -r '.devices[0].id')

echo "✅ Home created: $HOME_ID"
echo "✅ First device: $DEVICE_ID"

echo ""
echo "📊 Listing devices..."
curl -s "http://localhost:3001/api/devices?homeId=$HOME_ID" \
  -H "Authorization: Bearer $TOKEN" | jq

echo ""
echo "⚡ Simulating phantom load..."
curl -s -X POST http://localhost:3001/api/simulate \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d "{\"scenario\":\"phantom_load\",\"homeId\":\"$HOME_ID\",\"deviceId\":\"$DEVICE_ID\"}" | jq

echo ""
echo "🚨 Checking anomalies..."
curl -s "http://localhost:3001/api/anomalies?homeId=$HOME_ID" \
  -H "Authorization: Bearer $TOKEN" | jq

echo ""
echo "✅ API test complete!"
```

Run with: `bash test-api.sh`
