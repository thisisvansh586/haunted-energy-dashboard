import { supabase } from '../supabaseClient.js'

// Haunted Oracle messages (from steering doc)
const hauntedMessages = {
  phantom_load: {
    low: {
      title: "A Quiet Thief",
      description: "A device draws power while appearing dormant — a silent drain on your reserves.",
      remediation: "Unplug the device or use a smart strip to eliminate phantom draws."
    },
    medium: {
      title: "Whispers in the Dark",
      description: "Standby power consumption exceeds normal thresholds — energy bleeds into shadow.",
      remediation: "Check device settings and consider a power strip with auto-shutoff."
    },
    high: {
      title: "The Hungry Ghost",
      description: "Excessive phantom load detected — this device feeds even in slumber.",
      remediation: "Disconnect immediately and inspect for malfunction or replace the device."
    }
  },
  spike: {
    low: {
      title: "A Flicker of Unrest",
      description: "Power usage rises above baseline — a minor disturbance in the flow.",
      remediation: "Monitor the device and check for recent changes in usage patterns."
    },
    medium: {
      title: "Embers Rising",
      description: "A notable surge detected — the device draws more than its usual appetite.",
      remediation: "Investigate connected loads and ensure proper ventilation for the device."
    },
    high: {
      title: "Surge From Below",
      description: "A sudden spike suggests multiple loads or a fault on the same circuit.",
      remediation: "Check recent device actions, isolate devices, and schedule an inspection if it persists."
    },
    critical: {
      title: "The Tempest Awakens",
      description: "Critical power surge detected — immediate attention required to prevent damage.",
      remediation: "Shut down the device immediately and contact an electrician for inspection."
    }
  },
  ghost_walk: {
    low: {
      title: "Spectral Presence",
      description: "An unseen entity drifts through your home, stirring devices in its wake.",
      remediation: "Monitor affected rooms and check for unusual activity patterns."
    }
  }
}

/**
 * Detect phantom load anomaly
 * Triggers when device is off/standby but consuming power above threshold
 */
export async function detectPhantomLoad(device) {
  if (device.state === 'on') return null
  if (device.current_power <= device.idle_threshold) return null

  // Calculate severity
  const ratio = device.current_power / device.idle_threshold
  let severity = 'low'
  if (ratio > 5) severity = 'high'
  else if (ratio > 2) severity = 'medium'

  const message = hauntedMessages.phantom_load[severity]
  const estimatedCost = `$${((device.current_power / 1000) * 24 * 0.12).toFixed(2)}/day`

  return {
    home_id: device.home_id,
    device_id: device.id,
    type: 'phantom_load',
    severity,
    title: message.title,
    message: message.description,
    remediation: message.remediation,
    estimated_cost: estimatedCost
  }
}

/**
 * Detect power spike anomaly
 * Triggers when device power exceeds baseline by significant margin
 */
export async function detectPowerSpike(device, historicalAvg) {
  if (device.state !== 'on') return null
  if (!device.base_power || device.base_power === 0) return null

  const ratio = device.current_power / device.base_power
  if (ratio <= 1.3) return null // Less than 30% increase

  // Calculate severity
  let severity = 'low'
  if (ratio >= 3.0) severity = 'critical'
  else if (ratio >= 2.0) severity = 'high'
  else if (ratio >= 1.5) severity = 'medium'

  const message = hauntedMessages.spike[severity]
  const delta = device.current_power - device.base_power
  const estimatedCost = `$${((delta / 1000) * 24 * 0.12).toFixed(2)}/day`

  return {
    home_id: device.home_id,
    device_id: device.id,
    type: 'spike',
    severity,
    title: message.title,
    message: message.description,
    remediation: message.remediation,
    estimated_cost: estimatedCost
  }
}

/**
 * Run anomaly detection on all devices in a home
 */
export async function detectAnomalies(homeId) {
  try {
    // Get all devices for the home
    const { data: devices, error } = await supabase
      .from('devices')
      .select('*')
      .eq('home_id', homeId)

    if (error || !devices) return []

    const anomalies = []

    for (const device of devices) {
      // Check for phantom load
      const phantomLoad = await detectPhantomLoad(device)
      if (phantomLoad) anomalies.push(phantomLoad)

      // Check for power spike
      const spike = await detectPowerSpike(device)
      if (spike) anomalies.push(spike)
    }

    return anomalies
  } catch (error) {
    console.error('Error detecting anomalies:', error)
    return []
  }
}

/**
 * Create anomaly and notification
 */
export async function createAnomaly(anomaly, userId) {
  try {
    // Insert anomaly
    const { data: created, error: anomalyError } = await supabase
      .from('anomalies')
      .insert(anomaly)
      .select()
      .single()

    if (anomalyError) throw anomalyError

    // Get device name for notification
    const { data: device } = await supabase
      .from('devices')
      .select('name')
      .eq('id', anomaly.device_id)
      .single()

    // Create notification
    await supabase
      .from('notifications')
      .insert({
        user_id: userId,
        title: anomaly.title,
        body: `${device?.name || 'Device'}: ${anomaly.message}`,
        level: anomaly.severity === 'critical' || anomaly.severity === 'high' ? 'error' : 'warning',
        data: {
          anomaly_id: created.id,
          device_id: anomaly.device_id,
          type: anomaly.type
        }
      })

    return created
  } catch (error) {
    console.error('Error creating anomaly:', error)
    return null
  }
}

export default {
  detectPhantomLoad,
  detectPowerSpike,
  detectAnomalies,
  createAnomaly
}
