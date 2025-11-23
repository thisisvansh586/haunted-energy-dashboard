import express from 'express'
import { supabase } from '../supabaseClient.js'
import { authenticateUser } from '../middleware/auth.js'
import { detectPhantomLoad, detectPowerSpike, createAnomaly } from '../lib/anomalyDetector.js'

const router = express.Router()

// All routes require authentication
router.use(authenticateUser)

/**
 * POST /api/simulate
 * Trigger simulation scenarios for demo purposes
 * Body: { scenario: 'phantom_load' | 'spike' | 'ghost_walk', deviceId, homeId }
 */
router.post('/', async (req, res) => {
  try {
    const { scenario, deviceId, homeId } = req.body

    if (!scenario || !homeId) {
      return res.status(400).json({ error: 'scenario and homeId are required' })
    }

    // Verify home ownership
    const { data: home } = await supabase
      .from('homes')
      .select('owner')
      .eq('id', homeId)
      .single()

    if (!home || home.owner !== req.userId) {
      return res.status(403).json({ error: 'Access denied' })
    }

    let result = {}

    switch (scenario) {
      case 'phantom_load':
        result = await simulatePhantomLoad(deviceId, homeId, req.userId)
        break
      
      case 'spike':
        result = await simulateSpike(deviceId, homeId, req.userId)
        break
      
      case 'ghost_walk':
        result = await simulateGhostWalk(homeId, req.userId)
        break
      
      default:
        return res.status(400).json({ error: 'Invalid scenario. Use: phantom_load, spike, or ghost_walk' })
    }

    res.json(result)
  } catch (error) {
    console.error('Error running simulation:', error)
    res.status(500).json({ error: 'Simulation failed' })
  }
})

/**
 * Simulate phantom load on a device
 */
async function simulatePhantomLoad(deviceId, homeId, userId) {
  if (!deviceId) {
    throw new Error('deviceId required for phantom_load scenario')
  }

  // Get device
  const { data: device } = await supabase
    .from('devices')
    .select('*')
    .eq('id', deviceId)
    .single()

  if (!device) {
    throw new Error('Device not found')
  }

  // Set device to standby with high power
  const phantomPower = device.idle_threshold * 3 // 3x threshold
  
  await supabase
    .from('devices')
    .update({
      state: 'standby',
      current_power: phantomPower
    })
    .eq('id', deviceId)

  // Insert telemetry
  await supabase
    .from('telemetry')
    .insert({
      home_id: homeId,
      device_id: deviceId,
      power_w: phantomPower,
      total_w: phantomPower,
      anomaly: true
    })

  // Detect and create anomaly
  const updatedDevice = { ...device, state: 'standby', current_power: phantomPower }
  const anomaly = await detectPhantomLoad(updatedDevice)
  
  if (anomaly) {
    await createAnomaly(anomaly, userId)
  }

  return {
    scenario: 'phantom_load',
    device_id: deviceId,
    power_set: phantomPower,
    anomaly_created: !!anomaly
  }
}

/**
 * Simulate power spike on a device
 */
async function simulateSpike(deviceId, homeId, userId) {
  if (!deviceId) {
    throw new Error('deviceId required for spike scenario')
  }

  // Get device
  const { data: device } = await supabase
    .from('devices')
    .select('*')
    .eq('id', deviceId)
    .single()

  if (!device) {
    throw new Error('Device not found')
  }

  // Set device to on with 2x power
  const spikePower = (device.base_power || 100) * 2
  
  await supabase
    .from('devices')
    .update({
      state: 'on',
      current_power: spikePower
    })
    .eq('id', deviceId)

  // Insert telemetry
  await supabase
    .from('telemetry')
    .insert({
      home_id: homeId,
      device_id: deviceId,
      power_w: spikePower,
      total_w: spikePower,
      anomaly: true
    })

  // Detect and create anomaly
  const updatedDevice = { ...device, state: 'on', current_power: spikePower }
  const anomaly = await detectPowerSpike(updatedDevice)
  
  if (anomaly) {
    await createAnomaly(anomaly, userId)
  }

  return {
    scenario: 'spike',
    device_id: deviceId,
    power_set: spikePower,
    anomaly_created: !!anomaly
  }
}

/**
 * Simulate ghost walking through rooms
 */
async function simulateGhostWalk(homeId, userId) {
  // Get all devices in the home
  const { data: devices } = await supabase
    .from('devices')
    .select('*')
    .eq('home_id', homeId)

  if (!devices || devices.length === 0) {
    throw new Error('No devices found in home')
  }

  // Pick 2-3 random devices
  const affectedCount = Math.min(3, Math.max(2, Math.floor(devices.length / 2)))
  const shuffled = devices.sort(() => 0.5 - Math.random())
  const affected = shuffled.slice(0, affectedCount)

  const updates = []

  for (const device of affected) {
    // Temporarily increase power
    const ghostPower = (device.base_power || 50) * 1.3
    
    await supabase
      .from('devices')
      .update({ current_power: ghostPower })
      .eq('id', device.id)

    await supabase
      .from('telemetry')
      .insert({
        home_id: homeId,
        device_id: device.id,
        power_w: ghostPower,
        total_w: ghostPower,
        anomaly: true
      })

    updates.push({
      device_id: device.id,
      device_name: device.name,
      room: device.room,
      power_increase: ghostPower - device.current_power
    })
  }

  // Create ghost_walk anomaly
  await supabase
    .from('anomalies')
    .insert({
      home_id: homeId,
      device_id: null,
      type: 'ghost_walk',
      severity: 'low',
      title: 'Spectral Presence',
      message: 'An unseen entity drifts through your home, stirring devices in its wake.',
      remediation: 'Monitor affected rooms and check for unusual activity patterns.',
      estimated_cost: '$0.00'
    })

  // Create notification
  await supabase
    .from('notifications')
    .insert({
      user_id: userId,
      title: 'Spectral Presence Detected',
      body: `A ghost has walked through ${affectedCount} rooms, affecting devices along its path.`,
      level: 'warning',
      data: {
        type: 'ghost_walk',
        affected_devices: affected.map(d => d.id)
      }
    })

  return {
    scenario: 'ghost_walk',
    affected_devices: updates,
    anomaly_created: true
  }
}

export default router
