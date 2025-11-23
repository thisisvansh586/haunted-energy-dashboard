import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import { isSupabaseConfigured } from './supabaseClient.js'

// Import new routes
import homesRouter from './routes/homes.js'
import devicesRouter from './routes/devices.js'
import authRouter from './routes/auth.js'
import anomaliesRouter from './routes/anomalies.js'
import telemetryRouter from './routes/telemetry.js'
import reportsRouter from './routes/reports.js'
import simulateRouter from './routes/simulate.js'

// Import legacy simulation functions (for backward compatibility)
import { simulateDevices, detectAnomalies } from './lib/simulationData.js'

// Load environment variables
dotenv.config()

const app = express()
const PORT = process.env.PORT || 3001

// Middleware
app.use(cors())
app.use(express.json())

// Health check
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    supabase: isSupabaseConfigured() ? 'connected' : 'simulation mode',
    timestamp: new Date().toISOString()
  })
})

// ============================================================================
// NEW DATABASE-BACKED ROUTES (require authentication)
// ============================================================================

if (isSupabaseConfigured()) {
  console.log('✅ Supabase configured - enabling database routes')
  
  // Auth routes
  app.use('/api/auth', authRouter)
  
  // Resource routes
  app.use('/api/homes', homesRouter)
  app.use('/api/devices', devicesRouter)
  app.use('/api/anomalies', anomaliesRouter)
  app.use('/api/telemetry', telemetryRouter)
  app.use('/api/reports', reportsRouter)
  app.use('/api/simulate', simulateRouter)
} else {
  console.log('⚠️  Supabase not configured - database routes disabled')
  console.log('   Set SUPABASE_URL and SUPABASE_SERVICE_KEY in .env to enable')
}

// ============================================================================
// LEGACY SIMULATION ROUTES (no authentication required - for demo)
// ============================================================================

// GET /api/devices - Legacy simulation endpoint
app.get('/api/devices', (req, res) => {
  if (isSupabaseConfigured()) {
    return res.status(400).json({
      error: 'Use authenticated endpoint: GET /api/devices?homeId=xxx with Authorization header'
    })
  }
  
  const devices = simulateDevices()
  res.json(devices)
})

// GET /api/anomalies - Legacy simulation endpoint
app.get('/api/anomalies', (req, res) => {
  if (isSupabaseConfigured()) {
    return res.status(400).json({
      error: 'Use authenticated endpoint: GET /api/anomalies?homeId=xxx with Authorization header'
    })
  }
  
  const devices = simulateDevices()
  const anomalies = detectAnomalies(devices)
  res.json(anomalies)
})

// GET /api/telemetry - Legacy simulation endpoint
app.get('/api/telemetry', (req, res) => {
  if (isSupabaseConfigured()) {
    return res.status(400).json({
      error: 'Use authenticated endpoint: GET /api/telemetry?homeId=xxx with Authorization header'
    })
  }
  
  const devices = simulateDevices()
  const anomalies = detectAnomalies(devices)
  const totalPowerW = devices.reduce((sum, d) => sum + d.powerW, 0)
  
  res.json({
    timestamp: new Date().toISOString(),
    totalPowerW,
    activeDevices: devices.filter(d => d.state !== 'off').length,
    dailyCostEstimate: ((totalPowerW / 1000) * 24 * 0.12).toFixed(2),
    anomalyCount: anomalies.length,
    devices,
    anomalies
  })
})

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Endpoint not found' })
})

// Error handler
app.use((err, req, res, next) => {
  console.error('Server error:', err)
  res.status(500).json({ error: 'Internal server error' })
})

// Start server
app.listen(PORT, () => {
  console.log(`👻 Haunted Energy Server running on http://localhost:${PORT}`)
  console.log(`📊 Mode: ${isSupabaseConfigured() ? 'Database + Auth' : 'Simulation Only'}`)
  console.log(`📊 API endpoints:`)
  
  if (isSupabaseConfigured()) {
    console.log(`   POST /api/auth/setup-demo-home`)
    console.log(`   GET  /api/homes`)
    console.log(`   GET  /api/devices?homeId=xxx`)
    console.log(`   POST /api/devices/:id/toggle`)
    console.log(`   GET  /api/anomalies?homeId=xxx`)
    console.log(`   GET  /api/telemetry?homeId=xxx`)
    console.log(`   GET  /api/reports?homeId=xxx&period=weekly`)
    console.log(`   POST /api/simulate`)
  } else {
    console.log(`   GET /api/devices (simulation)`)
    console.log(`   GET /api/anomalies (simulation)`)
    console.log(`   GET /api/telemetry (simulation)`)
  }
})

export default app
