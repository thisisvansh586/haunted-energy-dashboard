import express from 'express'
import { supabase } from '../supabaseClient.js'
import { authenticateUser, verifyHomeOwnership } from '../middleware/auth.js'

const router = express.Router()

// All routes require authentication
router.use(authenticateUser)

// Default kWh rate (can be overridden by env)
const KWH_RATE = parseFloat(process.env.DEFAULT_KWH_RATE) || 0.12

/**
 * GET /api/reports?homeId=xxx&period=weekly|monthly
 * Generate aggregated energy reports
 */
router.get('/', verifyHomeOwnership, async (req, res) => {
  try {
    const { period = 'weekly' } = req.query

    // Calculate date range
    const now = new Date()
    const startDate = new Date()
    
    if (period === 'weekly') {
      startDate.setDate(now.getDate() - 7)
    } else if (period === 'monthly') {
      startDate.setMonth(now.getMonth() - 1)
    } else {
      return res.status(400).json({ error: 'Invalid period. Use: weekly or monthly' })
    }

    // Get telemetry data for period
    const { data: telemetry, error } = await supabase
      .from('telemetry')
      .select('power_w, total_w, created_at, device_id')
      .eq('home_id', req.homeId)
      .gte('created_at', startDate.toISOString())
      .order('created_at', { ascending: true })

    if (error) throw error

    if (!telemetry || telemetry.length === 0) {
      return res.json({
        period,
        start_date: startDate.toISOString(),
        end_date: now.toISOString(),
        total_kwh: 0,
        avg_daily_kwh: 0,
        cost_estimate: '$0.00',
        peak_usage: 0,
        device_breakdown: []
      })
    }

    // Calculate total kWh (power_w * hours / 1000)
    // Assuming readings every 1.5 seconds
    const hoursPerReading = 1.5 / 3600
    const total_kwh = telemetry.reduce((sum, reading) => {
      return sum + (reading.power_w * hoursPerReading / 1000)
    }, 0)

    // Calculate average daily kWh
    const days = (now - startDate) / (1000 * 60 * 60 * 24)
    const avg_daily_kwh = total_kwh / days

    // Calculate cost
    const cost_estimate = `$${(total_kwh * KWH_RATE).toFixed(2)}`

    // Find peak usage
    const peak_usage = Math.max(...telemetry.map(t => t.power_w))

    // Device breakdown
    const deviceMap = new Map()
    telemetry.forEach(reading => {
      if (!deviceMap.has(reading.device_id)) {
        deviceMap.set(reading.device_id, { total: 0, count: 0 })
      }
      const device = deviceMap.get(reading.device_id)
      device.total += reading.power_w * hoursPerReading / 1000
      device.count++
    })

    // Get device names
    const deviceIds = Array.from(deviceMap.keys()).filter(Boolean)
    const { data: devices } = await supabase
      .from('devices')
      .select('id, name, icon')
      .in('id', deviceIds)

    const device_breakdown = devices?.map(device => ({
      device_id: device.id,
      name: device.name,
      icon: device.icon,
      kwh: deviceMap.get(device.id).total.toFixed(2),
      cost: `$${(deviceMap.get(device.id).total * KWH_RATE).toFixed(2)}`
    })) || []

    // Sort by usage
    device_breakdown.sort((a, b) => parseFloat(b.kwh) - parseFloat(a.kwh))

    res.json({
      period,
      start_date: startDate.toISOString(),
      end_date: now.toISOString(),
      total_kwh: total_kwh.toFixed(2),
      avg_daily_kwh: avg_daily_kwh.toFixed(2),
      cost_estimate,
      peak_usage: peak_usage.toFixed(1),
      device_breakdown,
      kwh_rate: KWH_RATE
    })
  } catch (error) {
    console.error('Error generating report:', error)
    res.status(500).json({ error: 'Failed to generate report' })
  }
})

export default router
