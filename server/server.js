import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import { isSupabaseConfigured } from './supabaseClient.js'
import { simulateDevices, detectAnomalies, SeededRandom, baseDevices } from './lib/simulationData.js'

// Load environment variables
dotenv.config()

// Import routes
import authRoutes from './routes/auth.js'
import homesRoutes from './routes/homes.js'
import devicesRoutes from './routes/devices.js'
import telemetryRoutes from './routes/telemetry.js'
import anomaliesRoutes from './routes/anomalies.js'
import notificationsRoutes from './routes/notifications.js'
import reportsRoutes from './routes/reports.js'
import simulateRoutes from './routes/simulate.js'

const app = express()
const PORT = process.env.PORT || 3002

// Middleware
app.use(cors())
app.use(express.json())

// Health check
app.get('/health', (_req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    supabase: isSupabaseConfigured() ? 'configured' : 'not configured',
    mode: isSupabaseConfigured() ? 'database' : 'simulation'
  })
})

// ============================================================================
// AUTHENTICATED ROUTES (Require Supabase)
// ============================================================================

if (isSupabaseConfigured()) {
  console.log('✅ Supabase configured - enabling authenticated routes')

  app.use('/api/auth', authRoutes)
  app.use('/api/homes', homesRoutes)
  app.use('/api/devices', devicesRoutes)
  app.use('/api/telemetry', telemetryRoutes)
  app.use('/api/anomalies', anomaliesRoutes)
  app.use('/api/notifications', notificationsRoutes)
  app.use('/api/reports', reportsRoutes)
  app.use('/api/simulate', simulateRoutes)

  // Start telemetry simulator (async)
  import('./modules/telemetrySimulator.js').then(({ telemetrySimulator }) => {
    telemetrySimulator.start()
  }).catch(err => {
    console.error('Failed to start telemetry simulator:', err)
  })

} else {
  console.log('⚠️  Supabase not configured - running in simulation mode')

  // Legacy simulation endpoints (no auth required)
  app.get('/api/devices', (_req, res) => {
    try {
      const devices = simulateDevices()
      res.json(devices)
    } catch (error) {
      console.error('Simulation error:', error)
      res.status(500).json({ error: 'Simulation failed', details: error.message })
    }
  })

  app.get('/api/anomalies', (_req, res) => {
    try {
      const devices = simulateDevices()
      const anomalies = detectAnomalies(devices)
      res.json(anomalies)
    } catch (error) {
      console.error('Simulation error:', error)
      res.status(500).json({ error: 'Simulation failed', details: error.message })
    }
  })

  app.get('/api/telemetry', (_req, res) => {
    try {
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
    } catch (error) {
      console.error('Simulation error:', error)
      res.status(500).json({ error: 'Simulation failed', details: error.message })
    }
  })
}

// ============================================================================
// ERROR HANDLING
// ============================================================================

// 404 handler
app.use((_req, res) => {
  res.status(404).json({ error: 'Not found' })
})

// Error handler
app.use((err, _req, res, _next) => {
  console.error('Server error:', err)
  res.status(500).json({ error: 'Internal server error' })
})

// ============================================================================
// START SERVER
// ============================================================================

const server = app.listen(PORT, () => {
  console.log(`
╔═══════════════════════════════════════════════════════════╗
║                                                           ║
║   👻 Haunted Home Energy Dashboard - Server Running      ║
║                                                           ║
║   Port: ${PORT}                                            ║
║   Mode: ${isSupabaseConfigured() ? 'Database' : 'Simulation'}                                      ║
║   Time: ${new Date().toLocaleString()}                    ║
║                                                           ║
╚═══════════════════════════════════════════════════════════╝
  `)
})

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully...')
  server.close(() => {
    console.log('Server closed')
    process.exit(0)
  })
})

process.on('SIGINT', () => {
  console.log('SIGINT received, shutting down gracefully...')
  server.close(() => {
    console.log('Server closed')
    process.exit(0)
  })
})

// Export for testing
export { simulateDevices, detectAnomalies, SeededRandom, baseDevices }
export default app
