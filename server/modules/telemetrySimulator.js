import { supabase } from '../supabaseClient.js'
import { detectAnomalies } from '../lib/anomalyDetector.js'

/**
 * Telemetry Simulator
 * Generates realistic power readings for all devices every 1.5 seconds
 * Feature: haunted-energy-phase2
 */
export class TelemetrySimulator {
  constructor() {
    this.interval = null
    this.isRunning = false
  }

  /**
   * Start the telemetry simulator
   */
  start() {
    if (this.isRunning) {
      console.log('Telemetry simulator already running')
      return
    }

    console.log('🔮 Starting telemetry simulator...')
    this.isRunning = true
    
    // Run immediately
    this.generateTelemetry()
    
    // Then run every 1.5 seconds
    this.interval = setInterval(() => {
      this.generateTelemetry()
    }, 1500)
  }

  /**
   * Stop the telemetry simulator
   */
  stop() {
    if (this.interval) {
      clearInterval(this.interval)
      this.interval = null
      this.isRunning = false
      console.log('🛑 Telemetry simulator stopped')
    }
  }

  /**
   * Generate telemetry for all devices
   */
  async generateTelemetry() {
    try {
      // Get all devices
      const { data: devices, error: devicesError } = await supabase
        .from('devices')
        .select('*, homes!inner(owner)')

      if (devicesError) {
        console.error('Error fetching devices:', devicesError)
        return
      }

      if (!devices || devices.length === 0) {
        return
      }

      // Generate power readings for each device
      const telemetryRecords = []
      const deviceUpdates = []

      for (const device of devices) {
        const power = this.generatePowerForDevice(device)
        
        telemetryRecords.push({
          home_id: device.home_id,
          device_id: device.id,
          power_w: power,
          total_w: power
        })

        deviceUpdates.push({
          id: device.id,
          current_power: power
        })
      }

      // Insert telemetry records in batch
      if (telemetryRecords.length > 0) {
        const { error: telemetryError } = await supabase
          .from('telemetry')
          .insert(telemetryRecords)

        if (telemetryError) {
          console.error('Error inserting telemetry:', telemetryError)
        }
      }

      // Update device current_power
      for (const update of deviceUpdates) {
        await supabase
          .from('devices')
          .update({ current_power: update.current_power })
          .eq('id', update.id)
      }

      // Run anomaly detection
      await this.detectAndCreateAnomalies(devices)

    } catch (error) {
      console.error('Error generating telemetry:', error)
    }
  }

  /**
   * Generate power reading for a single device based on its state
   */
  generatePowerForDevice(device) {
    const { state, base_power, idle_threshold } = device

    if (state === 'off') {
      // Off devices should have 0 power (or very small phantom load occasionally)
      return Math.random() < 0.05 ? Math.random() * idle_threshold * 0.5 : 0
    }

    if (state === 'standby') {
      // Standby: 50-150% of idle_threshold
      const min = idle_threshold * 0.5
      const max = idle_threshold * 1.5
      return min + Math.random() * (max - min)
    }

    if (state === 'on') {
      // On: base_power ± 10%
      const variation = base_power * 0.1
      return base_power + (Math.random() * 2 - 1) * variation
    }

    return 0
  }

  /**
   * Detect anomalies and create notifications
   */
  async detectAndCreateAnomalies(devices) {
    try {
      // Group devices by home
      const homeDevices = new Map()
      
      for (const device of devices) {
        if (!homeDevices.has(device.home_id)) {
          homeDevices.set(device.home_id, [])
        }
        homeDevices.get(device.home_id).push(device)
      }

      // Detect anomalies for each home
      for (const [homeId, homeDeviceList] of homeDevices) {
        const anomalies = await detectAnomalies(homeDeviceList, homeId)
        
        if (anomalies.length > 0) {
          // Insert anomalies
          const { data: insertedAnomalies, error: anomalyError } = await supabase
            .from('anomalies')
            .insert(anomalies)
            .select()

          if (anomalyError) {
            console.error('Error inserting anomalies:', anomalyError)
            continue
          }

          // Create notifications for each anomaly
          const owner = homeDeviceList[0]?.homes?.owner
          if (owner && insertedAnomalies) {
            const notifications = insertedAnomalies.map(anomaly => ({
              user_id: owner,
              title: anomaly.title,
              body: anomaly.message,
              level: anomaly.severity === 'critical' || anomaly.severity === 'high' ? 'error' : 'warning',
              data: {
                anomaly_id: anomaly.id,
                device_id: anomaly.device_id,
                type: anomaly.type
              }
            }))

            await supabase
              .from('notifications')
              .insert(notifications)
          }
        }
      }
    } catch (error) {
      console.error('Error detecting anomalies:', error)
    }
  }
}

// Create singleton instance
export const telemetrySimulator = new TelemetrySimulator()
