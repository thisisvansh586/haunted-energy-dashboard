/**
 * Simulation Data Generator
 * Provides mock device data and anomaly detection for demo mode
 */

// Seeded random number generator for deterministic simulation
export class SeededRandom {
  constructor(seed = Date.now()) {
    this.seed = seed
  }

  next() {
    this.seed = (this.seed * 9301 + 49297) % 233280
    return this.seed / 233280
  }

  range(min, max) {
    return min + this.next() * (max - min)
  }

  choice(array) {
    return array[Math.floor(this.next() * array.length)]
  }
}

// Base device templates
export const baseDevices = [
  { id: 'fridge-1', name: 'Refrigerator', room: 'Kitchen', basePowerW: 150, state: 'on', idle_threshold: 120 },
  { id: 'tv-1', name: 'Living Room TV', room: 'Living Room', basePowerW: 120, state: 'standby', idle_threshold: 15 },
  { id: 'ac-1', name: 'Air Conditioner', room: 'Bedroom', basePowerW: 1500, state: 'on', idle_threshold: 50 },
  { id: 'washer-1', name: 'Washing Machine', room: 'Laundry', basePowerW: 500, state: 'off', idle_threshold: 10 },
  { id: 'dryer-1', name: 'Dryer', room: 'Laundry', basePowerW: 3000, state: 'off', idle_threshold: 10 },
  { id: 'dishwasher-1', name: 'Dishwasher', room: 'Kitchen', basePowerW: 1800, state: 'off', idle_threshold: 10 },
  { id: 'microwave-1', name: 'Microwave', room: 'Kitchen', basePowerW: 1000, state: 'standby', idle_threshold: 5 },
  { id: 'computer-1', name: 'Desktop Computer', room: 'Office', basePowerW: 300, state: 'on', idle_threshold: 50 },
  { id: 'router-1', name: 'WiFi Router', room: 'Office', basePowerW: 12, state: 'on', idle_threshold: 10 },
  { id: 'lights-1', name: 'Living Room Lights', room: 'Living Room', basePowerW: 60, state: 'on', idle_threshold: 0 }
]

/**
 * Generate simulated device data with realistic power consumption
 */
export function simulateDevices() {
  const rng = new SeededRandom()
  
  return baseDevices.map(device => {
    let powerW = 0
    
    switch (device.state) {
      case 'on':
        // Active devices use base power with some variation
        powerW = rng.range(device.basePowerW * 0.8, device.basePowerW * 1.2)
        break
      case 'standby':
        // Standby devices use idle power with variation
        powerW = rng.range(device.idle_threshold * 0.5, device.idle_threshold * 1.5)
        break
      case 'off':
        // Off devices should use minimal power (phantom load)
        powerW = rng.range(0, device.idle_threshold * 0.3)
        break
    }
    
    return {
      ...device,
      powerW: Math.round(powerW * 10) / 10, // Round to 1 decimal
      timestamp: new Date().toISOString()
    }
  })
}

/**
 * Detect anomalies in device power consumption
 */
export function detectAnomalies(devices) {
  const anomalies = []
  const rng = new SeededRandom()
  
  devices.forEach(device => {
    // Phantom load detection (device off but drawing power)
    if (device.state === 'off' && device.powerW > device.idle_threshold * 0.5) {
      anomalies.push({
        id: `anomaly-${device.id}-phantom`,
        deviceId: device.id,
        deviceName: device.name,
        type: 'phantom_load',
        severity: device.powerW > device.idle_threshold ? 'high' : 'medium',
        title: 'Phantom Power Draw',
        description: `${device.name} is drawing ${device.powerW}W while off`,
        remediation: 'Unplug device or use a smart power strip',
        estimatedCost: `$${((device.powerW / 1000) * 24 * 30 * 0.12).toFixed(2)}/month`,
        timestamp: new Date().toISOString()
      })
    }
    
    // Power spike detection (device using more than expected)
    if (device.state === 'on' && device.powerW > device.basePowerW * 1.3) {
      anomalies.push({
        id: `anomaly-${device.id}-spike`,
        deviceId: device.id,
        deviceName: device.name,
        type: 'spike',
        severity: device.powerW > device.basePowerW * 1.5 ? 'critical' : 'high',
        title: 'Power Spike Detected',
        description: `${device.name} is using ${device.powerW}W (${Math.round((device.powerW / device.basePowerW - 1) * 100)}% above normal)`,
        remediation: 'Check device for issues or reduce load',
        estimatedCost: `$${(((device.powerW - device.basePowerW) / 1000) * 24 * 30 * 0.12).toFixed(2)}/month extra`,
        timestamp: new Date().toISOString()
      })
    }
    
    // Standby power waste (device in standby using too much)
    if (device.state === 'standby' && device.powerW > device.idle_threshold * 2) {
      anomalies.push({
        id: `anomaly-${device.id}-standby`,
        deviceId: device.id,
        deviceName: device.name,
        type: 'phantom_load',
        severity: 'medium',
        title: 'High Standby Power',
        description: `${device.name} is using ${device.powerW}W in standby mode`,
        remediation: 'Consider unplugging when not in use',
        estimatedCost: `$${((device.powerW / 1000) * 24 * 30 * 0.12).toFixed(2)}/month`,
        timestamp: new Date().toISOString()
      })
    }
  })
  
  return anomalies
}
