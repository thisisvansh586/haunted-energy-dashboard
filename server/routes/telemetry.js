import express from 'express'
import { supabase } from '../supabaseClient.js'
import { authenticateUser, verifyHomeOwnership } from '../middleware/auth.js'

const router = express.Router()

// All routes require authentication
router.use(authenticateUser)

/**
 * GET /api/telemetry?homeId=xxx&since=timestamp&deviceId=xxx
 * Query telemetry history
 */
router.get('/', verifyHomeOwnership, async (req, res) => {
  try {
    const { since, deviceId, limit = 1000 } = req.query

    let query = supabase
      .from('telemetry')
      .select('*')
      .eq('home_id', req.homeId)
      .order('created_at', { ascending: false })
      .limit(parseInt(limit))

    if (since) {
      query = query.gte('created_at', since)
    }

    if (deviceId) {
      query = query.eq('device_id', deviceId)
    }

    const { data: telemetry, error } = await query

    if (error) throw error

    res.json({ telemetry })
  } catch (error) {
    console.error('Error fetching telemetry:', error)
    res.status(500).json({ error: 'Failed to fetch telemetry' })
  }
})

/**
 * GET /api/telemetry/latest?homeId=xxx
 * Get latest telemetry reading for each device
 */
router.get('/latest', verifyHomeOwnership, async (req, res) => {
  try {
    // Get all devices for the home
    const { data: devices } = await supabase
      .from('devices')
      .select('id, name, current_power, state')
      .eq('home_id', req.homeId)

    if (!devices) {
      return res.json({ telemetry: [] })
    }

    // Get latest telemetry for each device
    const telemetryPromises = devices.map(async (device) => {
      const { data } = await supabase
        .from('telemetry')
        .select('*')
        .eq('device_id', device.id)
        .order('created_at', { ascending: false })
        .limit(1)
        .single()

      return data
    })

    const telemetry = (await Promise.all(telemetryPromises)).filter(Boolean)

    res.json({ telemetry })
  } catch (error) {
    console.error('Error fetching latest telemetry:', error)
    res.status(500).json({ error: 'Failed to fetch latest telemetry' })
  }
})

export default router
