# 🚀 Quick Start Guide

## Prerequisites
- Node.js 18+
- Supabase account (or run in simulation mode)

## 5-Minute Setup

### 1. Install Dependencies (2 min)
```bash
# Install backend
cd server && npm install

# Install frontend
cd ../client && npm install
```

### 2. Database Setup (1 min) - OPTIONAL
If you want full features with authentication:

1. Go to: https://supabase.com/dashboard/project/juzleommevvicyqdebfi/sql/new
2. Copy all content from `db/migrations/001_schema.sql`
3. Paste and click "Run"
4. Done! ✅

**Skip this step to run in simulation mode (no auth required)**

### 3. Start Servers (1 min)
```bash
# Terminal 1 - Backend
cd server
npm run dev

# Terminal 2 - Frontend  
cd client
npm run dev
```

### 4. Access Dashboard (1 min)
Open: http://localhost:3000

**With Supabase:**
1. Click "Create Account"
2. Enter email/password
3. Click "Create Demo Home"
4. Done! You'll see 5 haunted devices 👻

**Without Supabase:**
- Dashboard loads immediately in simulation mode
- No authentication required
- 5 demo devices pre-loaded

## 🎯 What You'll See

- **Real-time power monitoring** (updates every 1.5s)
- **Haunted Oracle anomaly detection** (phantom loads, power spikes)
- **Energy reports** (weekly/monthly)
- **Historical data** (with CSV export)
- **Notifications** (for detected anomalies)
- **Cyber-goth UI** (neon glows, dark theme)

## 🔧 Troubleshooting

**Port already in use?**
```bash
# Change ports in:
# server/server.js (line 8): const PORT = 3002
# client/vite.config.js: server: { port: 3001 }
```

**Supabase not working?**
- Check `.kiro/environment` has correct keys
- Restart servers after adding keys
- Or just run in simulation mode!

**Dependencies failing?**
```bash
# Clear and reinstall
rm -rf node_modules package-lock.json
npm install
```

## 📚 Next Steps

- Read `IMPLEMENTATION_COMPLETE.md` for full feature list
- Read `API_QUICKSTART.md` for API testing
- Read `SUPABASE_SETUP.md` for detailed Supabase guide

## 🎉 That's It!

You now have a fully functional energy monitoring dashboard with:
- ✅ Multi-user authentication
- ✅ Real-time telemetry
- ✅ Anomaly detection
- ✅ Reports & analytics
- ✅ Beautiful UI

**Enjoy your haunted energy monitoring!** 👻⚡
