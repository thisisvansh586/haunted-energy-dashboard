# 🚀 Quick Start Commands

## Start Both Servers

### Option 1: Two Terminals (Recommended)

**Terminal 1 - Backend:**
```bash
cd server
npm run dev
```

**Terminal 2 - Frontend:**
```bash
cd client
npm run dev
```

### Option 2: Background Processes (Windows)

```bash
# Start backend in background
cd server
start /B npm run dev

# Start frontend in background
cd ../client
start /B npm run dev
```

## Access the Dashboard

Open your browser to: **http://localhost:3000**

## Stop Servers

Press `Ctrl+C` in each terminal window

Or if running in background:
```bash
# Find and kill processes
netstat -ano | findstr :3001
netstat -ano | findstr :3000
taskkill /F /PID <process_id>
```

## Verify Everything is Running

### Check Backend Health
```bash
curl http://localhost:3001/health
```

Should return:
```json
{
  "status": "ok",
  "mode": "simulation"
}
```

### Check Frontend
Open: http://localhost:3000

You should see the Haunted Energy Dashboard! 👻⚡

## Current Mode

🎮 **Simulation Mode** - No database or authentication required
- Perfect for development and testing
- Uses in-memory data
- No setup needed

## Troubleshooting

### Port Already in Use
```bash
# Windows
netstat -ano | findstr :3001
taskkill /F /PID <process_id>
```

### Can't Connect to Backend
1. Verify server is running: `curl http://localhost:3001/health`
2. Check server terminal for errors
3. Restart the server

### Blank Page
1. Open DevTools (F12)
2. Check Console for errors
3. Hard refresh (Ctrl+Shift+R)
4. Verify both servers are running
