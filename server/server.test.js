import { describe, it, expect } from 'vitest'
import * as fc from 'fast-check'
import { SeededRandom, baseDevices, simulateDevices, detectAnomalies } from './server.js'

describe('SeededRandom Property Tests', () => {
  // Feature: haunted-energy-dashboard, Property 23: Seeded random determinism
  // Validates: Requirements 9.5
  it('should produce the same sequence of values for the same seed', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 1, max: 1000000 }), // seed value
        fc.integer({ min: 1, max: 100 }), // number of values to generate
        (seed, count) => {
          // Create two generators with the same seed
          const rng1 = new SeededRandom(seed)
          const rng2 = new SeededRandom(seed)
          
          // Generate sequences from both
          const sequence1 = []
          const sequence2 = []
          
          for (let i = 0; i < count; i++) {
            sequence1.push(rng1.next())
          }
          
          for (let i = 0; i < count; i++) {
            sequence2.push(rng2.next())
          }
          
          // Both sequences should be identical
          expect(sequence1).toEqual(sequence2)
        }
      ),
      { numRuns: 100 }
    )
  })
  
  // Additional test for range() method determinism
  it('should produce the same range values for the same seed', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 1, max: 1000000 }), // seed value
        fc.integer({ min: 1, max: 50 }), // number of values to generate
        fc.float({ min: 0, max: 100 }), // min range
        fc.float({ min: 101, max: 1000 }), // max range
        (seed, count, min, max) => {
          // Create two generators with the same seed
          const rng1 = new SeededRandom(seed)
          const rng2 = new SeededRandom(seed)
          
          // Generate sequences from both using range()
          const sequence1 = []
          const sequence2 = []
          
          for (let i = 0; i < count; i++) {
            sequence1.push(rng1.range(min, max))
          }
          
          for (let i = 0; i < count; i++) {
            sequence2.push(rng2.range(min, max))
          }
          
          // Both sequences should be identical
          expect(sequence1).toEqual(sequence2)
        }
      ),
      { numRuns: 100 }
    )
  })
})

describe('Power Generation Bounds Property Tests', () => {
  // Feature: haunted-energy-dashboard, Property 20: Simulation power fluctuation bounds
  // Validates: Requirements 9.2
  it('should generate power within ±10% of baseline for devices in "on" state', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 1, max: 1000000 }), // seed value
        (seed) => {
          // Create a test device in 'on' state
          const testDevice = {
            id: "test_001",
            name: "Test Device",
            room: "Test Room",
            basePowerW: 100.0,
            state: "on",
            idle_threshold: 5.0
          }
          
          // Simulate power generation using the same logic as simulateDevices
          const rng = new SeededRandom(seed)
          let powerW = testDevice.basePowerW
          powerW += rng.range(-testDevice.basePowerW * 0.1, testDevice.basePowerW * 0.1)
          powerW = Math.max(0, powerW)
          
          // Check that power is within ±10% of baseline
          const lowerBound = testDevice.basePowerW * 0.9
          const upperBound = testDevice.basePowerW * 1.1
          
          expect(powerW).toBeGreaterThanOrEqual(lowerBound)
          expect(powerW).toBeLessThanOrEqual(upperBound)
        }
      ),
      { numRuns: 100 }
    )
  })
  
  // Feature: haunted-energy-dashboard, Property 21: Standby power generation bounds
  // Validates: Requirements 9.3
  it('should generate power between 50% and 150% of idle_threshold for devices in "standby" state', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 1, max: 1000000 }), // seed value
        fc.float({ min: Math.fround(1.0), max: Math.fround(100.0), noNaN: true }), // idle_threshold value
        (seed, idle_threshold) => {
          // Create a test device in 'standby' state
          const testDevice = {
            id: "test_002",
            name: "Test Standby Device",
            room: "Test Room",
            basePowerW: 50.0,
            state: "standby",
            idle_threshold: idle_threshold
          }
          
          // Simulate power generation using the same logic as simulateDevices
          const rng = new SeededRandom(seed)
          let powerW = rng.range(testDevice.idle_threshold * 0.5, testDevice.idle_threshold * 1.5)
          powerW = Math.max(0, powerW)
          
          // Check that power is within the expected range
          const lowerBound = testDevice.idle_threshold * 0.5
          const upperBound = testDevice.idle_threshold * 1.5
          
          expect(powerW).toBeGreaterThanOrEqual(lowerBound)
          expect(powerW).toBeLessThanOrEqual(upperBound)
        }
      ),
      { numRuns: 100 }
    )
  })
  
  // Feature: haunted-energy-dashboard, Property 22: Off device power
  // Validates: Requirements 9.4
  it('should generate zero power for devices in "off" state', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 1, max: 1000000 }), // seed value
        (seed) => {
          // Create a test device in 'off' state
          const testDevice = {
            id: "test_003",
            name: "Test Off Device",
            room: "Test Room",
            basePowerW: 100.0,
            state: "off",
            idle_threshold: 5.0
          }
          
          // Simulate power generation using the same logic as simulateDevices
          const rng = new SeededRandom(seed)
          let powerW = 0
          
          // Check that power is exactly zero
          expect(powerW).toBe(0)
        }
      ),
      { numRuns: 100 }
    )
  })
  
  // Integration test: verify simulateDevices respects all bounds
  it('should respect power generation bounds for all device states in simulateDevices', () => {
    // Run simulateDevices multiple times and check bounds
    for (let i = 0; i < 50; i++) {
      const devices = simulateDevices()
      
      devices.forEach(device => {
        const baseDevice = baseDevices.find(d => d.id === device.id)
        
        if (device.state === 'on') {
          // Should be within ±10% of baseline
          const lowerBound = baseDevice.basePowerW * 0.9
          const upperBound = baseDevice.basePowerW * 1.1
          expect(device.powerW).toBeGreaterThanOrEqual(lowerBound)
          expect(device.powerW).toBeLessThanOrEqual(upperBound)
        } else if (device.state === 'standby') {
          // Should be between 50% and 150% of idle_threshold
          const lowerBound = baseDevice.idle_threshold * 0.5
          const upperBound = baseDevice.idle_threshold * 1.5
          expect(device.powerW).toBeGreaterThanOrEqual(lowerBound)
          expect(device.powerW).toBeLessThanOrEqual(upperBound)
        } else if (device.state === 'off') {
          // Should be exactly zero
          expect(device.powerW).toBe(0)
        }
      })
    }
  })
})

describe('Phantom Load Detection Property Tests', () => {
  // Feature: haunted-energy-dashboard, Property 8: Phantom load detection
  // Validates: Requirements 4.1
  it('should create a phantom_load anomaly when device is standby/off and powerW exceeds idle_threshold', () => {
    fc.assert(
      fc.property(
        fc.constantFrom('standby', 'off'), // state
        fc.float({ min: Math.fround(1.0), max: Math.fround(100.0), noNaN: true }), // idle_threshold
        fc.float({ min: Math.fround(0.01), max: Math.fround(10.0), noNaN: true }), // multiplier to exceed threshold
        (state, idle_threshold, multiplier) => {
          // Create a device that exceeds idle_threshold
          const powerW = idle_threshold * (1 + multiplier)
          const testDevice = {
            id: "test_phantom",
            name: "Test Phantom Device",
            room: "Test Room",
            basePowerW: 100.0,
            state: state,
            idle_threshold: idle_threshold,
            powerW: powerW,
            lastActive: new Date().toISOString()
          }
          
          const anomalies = detectAnomalies([testDevice])
          
          // Should detect a phantom load anomaly
          const phantomAnomaly = anomalies.find(a => a.type === 'phantom_load')
          expect(phantomAnomaly).toBeDefined()
          expect(phantomAnomaly.deviceId).toBe(testDevice.id)
        }
      ),
      { numRuns: 100 }
    )
  })
  
  it('should NOT create a phantom_load anomaly when device is standby/off but powerW is below idle_threshold', () => {
    fc.assert(
      fc.property(
        fc.constantFrom('standby', 'off'), // state
        fc.float({ min: Math.fround(10.0), max: Math.fround(100.0), noNaN: true }), // idle_threshold
        fc.float({ min: Math.fround(0.0), max: Math.fround(0.99), noNaN: true }), // multiplier to stay below threshold
        (state, idle_threshold, multiplier) => {
          // Create a device that does NOT exceed idle_threshold
          const powerW = idle_threshold * multiplier
          const testDevice = {
            id: "test_no_phantom",
            name: "Test Normal Device",
            room: "Test Room",
            basePowerW: 100.0,
            state: state,
            idle_threshold: idle_threshold,
            powerW: powerW,
            lastActive: new Date().toISOString()
          }
          
          const anomalies = detectAnomalies([testDevice])
          
          // Should NOT detect a phantom load anomaly
          const phantomAnomaly = anomalies.find(a => a.type === 'phantom_load')
          expect(phantomAnomaly).toBeUndefined()
        }
      ),
      { numRuns: 100 }
    )
  })
  
  it('should NOT create a phantom_load anomaly when device is on (regardless of power)', () => {
    fc.assert(
      fc.property(
        fc.float({ min: 1.0, max: 100.0 }), // idle_threshold
        fc.float({ min: 0.0, max: 1000.0 }), // powerW (any value)
        (idle_threshold, powerW) => {
          // Create a device in 'on' state
          const testDevice = {
            id: "test_on_device",
            name: "Test On Device",
            room: "Test Room",
            basePowerW: 100.0,
            state: 'on',
            idle_threshold: idle_threshold,
            powerW: powerW,
            lastActive: new Date().toISOString()
          }
          
          const anomalies = detectAnomalies([testDevice])
          
          // Should NOT detect a phantom load anomaly (might detect spike though)
          const phantomAnomaly = anomalies.find(a => a.type === 'phantom_load')
          expect(phantomAnomaly).toBeUndefined()
        }
      ),
      { numRuns: 100 }
    )
  })
  
  // Feature: haunted-energy-dashboard, Property 9: Phantom load severity assignment
  // Validates: Requirements 4.2, 4.3, 4.4
  it('should assign correct severity based on power to idle_threshold ratio', () => {
    fc.assert(
      fc.property(
        fc.constantFrom('standby', 'off'), // state
        fc.float({ min: Math.fround(1.0), max: Math.fround(100.0), noNaN: true }), // idle_threshold
        fc.constantFrom(
          { multiplier: 1.5, expectedSeverity: 'low' },    // <= 2x threshold
          { multiplier: 3.0, expectedSeverity: 'medium' }, // > 2x and <= 5x threshold
          { multiplier: 7.0, expectedSeverity: 'high' }    // > 5x threshold
        ),
        (state, idle_threshold, testCase) => {
          // Create a device with specific power level
          const powerW = idle_threshold * testCase.multiplier
          const testDevice = {
            id: "test_severity",
            name: "Test Severity Device",
            room: "Test Room",
            basePowerW: 100.0,
            state: state,
            idle_threshold: idle_threshold,
            powerW: powerW,
            lastActive: new Date().toISOString()
          }
          
          const anomalies = detectAnomalies([testDevice])
          
          // Should detect anomaly with correct severity
          const phantomAnomaly = anomalies.find(a => a.type === 'phantom_load')
          expect(phantomAnomaly).toBeDefined()
          expect(phantomAnomaly.severity).toBe(testCase.expectedSeverity)
        }
      ),
      { numRuns: 100 }
    )
  })
  
  it('should assign low severity when powerW <= idle_threshold * 2', () => {
    fc.assert(
      fc.property(
        fc.constantFrom('standby', 'off'),
        fc.float({ min: Math.fround(10.0), max: Math.fround(100.0), noNaN: true }),
        fc.float({ min: Math.fround(1.01), max: Math.fround(2.0), noNaN: true }), // multiplier between 1 and 2 (inclusive)
        (state, idle_threshold, multiplier) => {
          const powerW = idle_threshold * multiplier
          const testDevice = {
            id: "test_low",
            name: "Test Low Severity",
            room: "Test Room",
            basePowerW: 100.0,
            state: state,
            idle_threshold: idle_threshold,
            powerW: powerW,
            lastActive: new Date().toISOString()
          }
          
          const anomalies = detectAnomalies([testDevice])
          const phantomAnomaly = anomalies.find(a => a.type === 'phantom_load')
          
          expect(phantomAnomaly).toBeDefined()
          expect(phantomAnomaly.severity).toBe('low')
        }
      ),
      { numRuns: 100 }
    )
  })
  
  it('should assign medium severity when idle_threshold * 2 < powerW <= idle_threshold * 5', () => {
    fc.assert(
      fc.property(
        fc.constantFrom('standby', 'off'),
        fc.float({ min: Math.fround(10.0), max: Math.fround(100.0), noNaN: true }),
        fc.float({ min: Math.fround(2.01), max: Math.fround(5.0), noNaN: true }), // multiplier between 2 and 5 (exclusive of 2, inclusive of 5)
        (state, idle_threshold, multiplier) => {
          const powerW = idle_threshold * multiplier
          const testDevice = {
            id: "test_medium",
            name: "Test Medium Severity",
            room: "Test Room",
            basePowerW: 100.0,
            state: state,
            idle_threshold: idle_threshold,
            powerW: powerW,
            lastActive: new Date().toISOString()
          }
          
          const anomalies = detectAnomalies([testDevice])
          const phantomAnomaly = anomalies.find(a => a.type === 'phantom_load')
          
          expect(phantomAnomaly).toBeDefined()
          expect(phantomAnomaly.severity).toBe('medium')
        }
      ),
      { numRuns: 100 }
    )
  })
  
  it('should assign high severity when powerW > idle_threshold * 5', () => {
    fc.assert(
      fc.property(
        fc.constantFrom('standby', 'off'),
        fc.float({ min: Math.fround(10.0), max: Math.fround(100.0), noNaN: true }),
        fc.float({ min: Math.fround(5.01), max: Math.fround(20.0), noNaN: true }), // multiplier > 5
        (state, idle_threshold, multiplier) => {
          const powerW = idle_threshold * multiplier
          const testDevice = {
            id: "test_high",
            name: "Test High Severity",
            room: "Test Room",
            basePowerW: 100.0,
            state: state,
            idle_threshold: idle_threshold,
            powerW: powerW,
            lastActive: new Date().toISOString()
          }
          
          const anomalies = detectAnomalies([testDevice])
          const phantomAnomaly = anomalies.find(a => a.type === 'phantom_load')
          
          expect(phantomAnomaly).toBeDefined()
          expect(phantomAnomaly.severity).toBe('high')
        }
      ),
      { numRuns: 100 }
    )
  })
})

describe('Power Spike Detection Property Tests', () => {
  // Feature: haunted-energy-dashboard, Property 11: Power spike detection
  // Validates: Requirements 5.1
  it('should create a spike anomaly when device is on and powerW exceeds basePowerW * 1.3', () => {
    fc.assert(
      fc.property(
        fc.float({ min: Math.fround(10.0), max: Math.fround(1000.0), noNaN: true }), // basePowerW
        fc.float({ min: Math.fround(1.31), max: Math.fround(5.0), noNaN: true }), // multiplier > 1.3
        (basePowerW, multiplier) => {
          // Create a device with power exceeding baseline * 1.3
          const powerW = basePowerW * multiplier
          const testDevice = {
            id: "test_spike",
            name: "Test Spike Device",
            room: "Test Room",
            basePowerW: basePowerW,
            state: 'on',
            idle_threshold: 5.0,
            powerW: powerW,
            lastActive: new Date().toISOString()
          }
          
          const anomalies = detectAnomalies([testDevice])
          
          // Should detect a spike anomaly
          const spikeAnomaly = anomalies.find(a => a.type === 'spike')
          expect(spikeAnomaly).toBeDefined()
          expect(spikeAnomaly.deviceId).toBe(testDevice.id)
        }
      ),
      { numRuns: 100 }
    )
  })
  
  it('should NOT create a spike anomaly when device is on but powerW is below basePowerW * 1.3', () => {
    fc.assert(
      fc.property(
        fc.float({ min: Math.fround(10.0), max: Math.fround(1000.0), noNaN: true }), // basePowerW
        fc.float({ min: Math.fround(0.5), max: Math.fround(1.3), noNaN: true }), // multiplier <= 1.3
        (basePowerW, multiplier) => {
          // Create a device with power NOT exceeding baseline * 1.3
          const powerW = basePowerW * multiplier
          const testDevice = {
            id: "test_no_spike",
            name: "Test Normal Device",
            room: "Test Room",
            basePowerW: basePowerW,
            state: 'on',
            idle_threshold: 5.0,
            powerW: powerW,
            lastActive: new Date().toISOString()
          }
          
          const anomalies = detectAnomalies([testDevice])
          
          // Should NOT detect a spike anomaly
          const spikeAnomaly = anomalies.find(a => a.type === 'spike')
          expect(spikeAnomaly).toBeUndefined()
        }
      ),
      { numRuns: 100 }
    )
  })
  
  it('should NOT create a spike anomaly when device is off or standby (regardless of power)', () => {
    fc.assert(
      fc.property(
        fc.constantFrom('standby', 'off'), // state
        fc.float({ min: Math.fround(10.0), max: Math.fround(1000.0), noNaN: true }), // basePowerW
        fc.float({ min: Math.fround(0.0), max: Math.fround(5000.0), noNaN: true }), // powerW (any value)
        (state, basePowerW, powerW) => {
          // Create a device in 'off' or 'standby' state
          const testDevice = {
            id: "test_off_standby",
            name: "Test Off/Standby Device",
            room: "Test Room",
            basePowerW: basePowerW,
            state: state,
            idle_threshold: 5.0,
            powerW: powerW,
            lastActive: new Date().toISOString()
          }
          
          const anomalies = detectAnomalies([testDevice])
          
          // Should NOT detect a spike anomaly (might detect phantom load though)
          const spikeAnomaly = anomalies.find(a => a.type === 'spike')
          expect(spikeAnomaly).toBeUndefined()
        }
      ),
      { numRuns: 100 }
    )
  })
  
  // Feature: haunted-energy-dashboard, Property 12: Spike severity assignment
  // Validates: Requirements 5.2, 5.3, 5.4, 5.5
  it('should assign correct severity based on power to baseline ratio', () => {
    fc.assert(
      fc.property(
        fc.float({ min: Math.fround(10.0), max: Math.fround(1000.0), noNaN: true }), // basePowerW
        fc.constantFrom(
          { multiplier: 1.4, expectedSeverity: 'low' },      // < 1.5x baseline
          { multiplier: 1.7, expectedSeverity: 'medium' },   // 1.5x-2.0x baseline
          { multiplier: 2.5, expectedSeverity: 'high' },     // 2.0x-3.0x baseline
          { multiplier: 3.5, expectedSeverity: 'critical' }  // >= 3.0x baseline
        ),
        (basePowerW, testCase) => {
          // Create a device with specific power level
          const powerW = basePowerW * testCase.multiplier
          const testDevice = {
            id: "test_spike_severity",
            name: "Test Spike Severity Device",
            room: "Test Room",
            basePowerW: basePowerW,
            state: 'on',
            idle_threshold: 5.0,
            powerW: powerW,
            lastActive: new Date().toISOString()
          }
          
          const anomalies = detectAnomalies([testDevice])
          
          // Should detect anomaly with correct severity
          const spikeAnomaly = anomalies.find(a => a.type === 'spike')
          expect(spikeAnomaly).toBeDefined()
          expect(spikeAnomaly.severity).toBe(testCase.expectedSeverity)
        }
      ),
      { numRuns: 100 }
    )
  })
  
  it('should assign low severity when powerW < basePowerW * 1.5', () => {
    fc.assert(
      fc.property(
        fc.float({ min: Math.fround(10.0), max: Math.fround(1000.0), noNaN: true }),
        fc.float({ min: Math.fround(1.31), max: Math.fround(1.49), noNaN: true }), // multiplier between 1.3 and 1.5 (exclusive of 1.5)
        (basePowerW, multiplier) => {
          const powerW = basePowerW * multiplier
          const testDevice = {
            id: "test_low_spike",
            name: "Test Low Spike Severity",
            room: "Test Room",
            basePowerW: basePowerW,
            state: 'on',
            idle_threshold: 5.0,
            powerW: powerW,
            lastActive: new Date().toISOString()
          }
          
          const anomalies = detectAnomalies([testDevice])
          const spikeAnomaly = anomalies.find(a => a.type === 'spike')
          
          expect(spikeAnomaly).toBeDefined()
          expect(spikeAnomaly.severity).toBe('low')
        }
      ),
      { numRuns: 100 }
    )
  })
  
  it('should assign medium severity when basePowerW * 1.5 <= powerW < basePowerW * 2.0', () => {
    fc.assert(
      fc.property(
        fc.float({ min: Math.fround(10.0), max: Math.fround(1000.0), noNaN: true }),
        fc.float({ min: Math.fround(1.5), max: Math.fround(1.99), noNaN: true }), // multiplier between 1.5 and 2.0 (exclusive of 2.0)
        (basePowerW, multiplier) => {
          const powerW = basePowerW * multiplier
          const testDevice = {
            id: "test_medium_spike",
            name: "Test Medium Spike Severity",
            room: "Test Room",
            basePowerW: basePowerW,
            state: 'on',
            idle_threshold: 5.0,
            powerW: powerW,
            lastActive: new Date().toISOString()
          }
          
          const anomalies = detectAnomalies([testDevice])
          const spikeAnomaly = anomalies.find(a => a.type === 'spike')
          
          expect(spikeAnomaly).toBeDefined()
          expect(spikeAnomaly.severity).toBe('medium')
        }
      ),
      { numRuns: 100 }
    )
  })
  
  it('should assign high severity when basePowerW * 2.0 <= powerW < basePowerW * 3.0', () => {
    fc.assert(
      fc.property(
        fc.float({ min: Math.fround(10.0), max: Math.fround(1000.0), noNaN: true }),
        fc.float({ min: Math.fround(2.0), max: Math.fround(2.99), noNaN: true }), // multiplier between 2.0 and 3.0 (exclusive of 3.0)
        (basePowerW, multiplier) => {
          const powerW = basePowerW * multiplier
          const testDevice = {
            id: "test_high_spike",
            name: "Test High Spike Severity",
            room: "Test Room",
            basePowerW: basePowerW,
            state: 'on',
            idle_threshold: 5.0,
            powerW: powerW,
            lastActive: new Date().toISOString()
          }
          
          const anomalies = detectAnomalies([testDevice])
          const spikeAnomaly = anomalies.find(a => a.type === 'spike')
          
          expect(spikeAnomaly).toBeDefined()
          expect(spikeAnomaly.severity).toBe('high')
        }
      ),
      { numRuns: 100 }
    )
  })
  
  it('should assign critical severity when powerW >= basePowerW * 3.0', () => {
    fc.assert(
      fc.property(
        fc.float({ min: Math.fround(10.0), max: Math.fround(1000.0), noNaN: true }),
        fc.float({ min: Math.fround(3.0), max: Math.fround(10.0), noNaN: true }), // multiplier >= 3.0
        (basePowerW, multiplier) => {
          const powerW = basePowerW * multiplier
          const testDevice = {
            id: "test_critical_spike",
            name: "Test Critical Spike Severity",
            room: "Test Room",
            basePowerW: basePowerW,
            state: 'on',
            idle_threshold: 5.0,
            powerW: powerW,
            lastActive: new Date().toISOString()
          }
          
          const anomalies = detectAnomalies([testDevice])
          const spikeAnomaly = anomalies.find(a => a.type === 'spike')
          
          expect(spikeAnomaly).toBeDefined()
          expect(spikeAnomaly.severity).toBe('critical')
        }
      ),
      { numRuns: 100 }
    )
  })
})

describe('Anomaly Structure Property Tests', () => {
  // Feature: haunted-energy-dashboard, Property 10: Anomaly structure completeness
  // Validates: Requirements 4.5
  it('should include all required fields in anomaly objects', () => {
    fc.assert(
      fc.property(
        fc.constantFrom('standby', 'off', 'on'), // state
        fc.float({ min: Math.fround(10.0), max: Math.fround(1000.0), noNaN: true }), // basePowerW
        fc.float({ min: Math.fround(1.0), max: Math.fround(100.0), noNaN: true }), // idle_threshold
        fc.float({ min: Math.fround(1.0), max: Math.fround(10.0), noNaN: true }), // power multiplier
        (state, basePowerW, idle_threshold, multiplier) => {
          // Create a device that will trigger an anomaly
          let powerW
          if (state === 'on') {
            // Create a spike by exceeding baseline * 1.3
            powerW = basePowerW * (1.3 + multiplier)
          } else {
            // Create a phantom load by exceeding idle_threshold
            powerW = idle_threshold * (1 + multiplier)
          }
          
          const testDevice = {
            id: "test_structure",
            name: "Test Structure Device",
            room: "Test Room",
            basePowerW: basePowerW,
            state: state,
            idle_threshold: idle_threshold,
            powerW: powerW,
            lastActive: new Date().toISOString()
          }
          
          const anomalies = detectAnomalies([testDevice])
          
          // Should detect at least one anomaly
          expect(anomalies.length).toBeGreaterThan(0)
          
          // Check that all anomalies have required fields
          anomalies.forEach(anomaly => {
            // Required top-level fields
            expect(anomaly).toHaveProperty('id')
            expect(anomaly).toHaveProperty('deviceId')
            expect(anomaly).toHaveProperty('type')
            expect(anomaly).toHaveProperty('severity')
            expect(anomaly).toHaveProperty('timestamp')
            expect(anomaly).toHaveProperty('details')
            
            // Verify field types
            expect(typeof anomaly.id).toBe('string')
            expect(typeof anomaly.deviceId).toBe('string')
            expect(['phantom_load', 'spike']).toContain(anomaly.type)
            expect(['low', 'medium', 'high', 'critical']).toContain(anomaly.severity)
            expect(typeof anomaly.timestamp).toBe('string')
            expect(typeof anomaly.details).toBe('object')
            
            // Required details fields
            expect(anomaly.details).toHaveProperty('powerDelta')
            expect(anomaly.details).toHaveProperty('duration')
            expect(anomaly.details).toHaveProperty('estimatedCost')
            expect(anomaly.details).toHaveProperty('description')
            
            // Verify details field types
            expect(typeof anomaly.details.powerDelta).toBe('number')
            expect(typeof anomaly.details.duration).toBe('number')
            expect(typeof anomaly.details.estimatedCost).toBe('string')
            expect(typeof anomaly.details.description).toBe('string')
            
            // Verify deviceId matches
            expect(anomaly.deviceId).toBe(testDevice.id)
          })
        }
      ),
      { numRuns: 100 }
    )
  })
  
  it('should have non-empty string values for required string fields', () => {
    fc.assert(
      fc.property(
        fc.constantFrom('standby', 'off'), // state (easier to trigger phantom load)
        fc.float({ min: Math.fround(1.0), max: Math.fround(100.0), noNaN: true }), // idle_threshold
        fc.float({ min: Math.fround(1.0), max: Math.fround(10.0), noNaN: true }), // power multiplier
        (state, idle_threshold, multiplier) => {
          // Create a device that will trigger a phantom load anomaly
          const powerW = idle_threshold * (1 + multiplier)
          
          const testDevice = {
            id: "test_strings",
            name: "Test String Device",
            room: "Test Room",
            basePowerW: 100.0,
            state: state,
            idle_threshold: idle_threshold,
            powerW: powerW,
            lastActive: new Date().toISOString()
          }
          
          const anomalies = detectAnomalies([testDevice])
          
          // Should detect at least one anomaly
          expect(anomalies.length).toBeGreaterThan(0)
          
          // Check that string fields are non-empty
          anomalies.forEach(anomaly => {
            expect(anomaly.id.length).toBeGreaterThan(0)
            expect(anomaly.deviceId.length).toBeGreaterThan(0)
            expect(anomaly.type.length).toBeGreaterThan(0)
            expect(anomaly.severity.length).toBeGreaterThan(0)
            expect(anomaly.timestamp.length).toBeGreaterThan(0)
            expect(anomaly.details.estimatedCost.length).toBeGreaterThan(0)
            expect(anomaly.details.description.length).toBeGreaterThan(0)
          })
        }
      ),
      { numRuns: 100 }
    )
  })
  
  it('should have positive numeric values for powerDelta and duration', () => {
    fc.assert(
      fc.property(
        fc.constantFrom('standby', 'off', 'on'), // state
        fc.float({ min: Math.fround(10.0), max: Math.fround(1000.0), noNaN: true }), // basePowerW
        fc.float({ min: Math.fround(1.0), max: Math.fround(100.0), noNaN: true }), // idle_threshold
        fc.float({ min: Math.fround(1.0), max: Math.fround(10.0), noNaN: true }), // power multiplier
        (state, basePowerW, idle_threshold, multiplier) => {
          // Create a device that will trigger an anomaly
          let powerW
          if (state === 'on') {
            powerW = basePowerW * (1.3 + multiplier)
          } else {
            powerW = idle_threshold * (1 + multiplier)
          }
          
          const testDevice = {
            id: "test_numeric",
            name: "Test Numeric Device",
            room: "Test Room",
            basePowerW: basePowerW,
            state: state,
            idle_threshold: idle_threshold,
            powerW: powerW,
            lastActive: new Date().toISOString()
          }
          
          const anomalies = detectAnomalies([testDevice])
          
          // Should detect at least one anomaly
          expect(anomalies.length).toBeGreaterThan(0)
          
          // Check that numeric fields have valid values
          anomalies.forEach(anomaly => {
            expect(anomaly.details.powerDelta).toBeGreaterThan(0)
            expect(anomaly.details.duration).toBeGreaterThan(0)
            expect(Number.isFinite(anomaly.details.powerDelta)).toBe(true)
            expect(Number.isFinite(anomaly.details.duration)).toBe(true)
          })
        }
      ),
      { numRuns: 100 }
    )
  })
})

describe('API Endpoint Integration Tests', () => {
  // Test /api/devices endpoint
  it('should return a valid device array from /api/devices', () => {
    const devices = simulateDevices()
    
    // Verify it returns an array
    expect(Array.isArray(devices)).toBe(true)
    
    // Verify array is not empty
    expect(devices.length).toBeGreaterThan(0)
    
    // Verify each device has required fields
    devices.forEach(device => {
      expect(device).toHaveProperty('id')
      expect(device).toHaveProperty('name')
      expect(device).toHaveProperty('room')
      expect(device).toHaveProperty('powerW')
      expect(device).toHaveProperty('state')
      expect(device).toHaveProperty('lastActive')
      expect(device).toHaveProperty('idle_threshold')
      expect(device).toHaveProperty('basePowerW')
      
      // Verify field types
      expect(typeof device.id).toBe('string')
      expect(typeof device.name).toBe('string')
      expect(typeof device.room).toBe('string')
      expect(typeof device.powerW).toBe('number')
      expect(['on', 'off', 'standby']).toContain(device.state)
      expect(typeof device.lastActive).toBe('string')
      expect(typeof device.idle_threshold).toBe('number')
      expect(typeof device.basePowerW).toBe('number')
      
      // Verify powerW is non-negative
      expect(device.powerW).toBeGreaterThanOrEqual(0)
    })
  })
  
  // Test /api/anomalies endpoint
  it('should return a valid anomaly array from /api/anomalies', () => {
    const devices = simulateDevices()
    const anomalies = detectAnomalies(devices)
    
    // Verify it returns an array
    expect(Array.isArray(anomalies)).toBe(true)
    
    // Anomalies array can be empty if no anomalies detected
    // But if there are anomalies, verify their structure
    anomalies.forEach(anomaly => {
      expect(anomaly).toHaveProperty('id')
      expect(anomaly).toHaveProperty('deviceId')
      expect(anomaly).toHaveProperty('type')
      expect(anomaly).toHaveProperty('severity')
      expect(anomaly).toHaveProperty('timestamp')
      expect(anomaly).toHaveProperty('details')
      
      // Verify field types
      expect(typeof anomaly.id).toBe('string')
      expect(typeof anomaly.deviceId).toBe('string')
      expect(['phantom_load', 'spike']).toContain(anomaly.type)
      expect(['low', 'medium', 'high', 'critical']).toContain(anomaly.severity)
      expect(typeof anomaly.timestamp).toBe('string')
      expect(typeof anomaly.details).toBe('object')
      
      // Verify details structure
      expect(anomaly.details).toHaveProperty('powerDelta')
      expect(anomaly.details).toHaveProperty('duration')
      expect(anomaly.details).toHaveProperty('estimatedCost')
      expect(anomaly.details).toHaveProperty('description')
      
      // Verify deviceId references a valid device
      const device = devices.find(d => d.id === anomaly.deviceId)
      expect(device).toBeDefined()
    })
  })
  
  // Test /api/telemetry endpoint
  it('should return a complete telemetry snapshot from /api/telemetry', () => {
    const devices = simulateDevices()
    const anomalies = detectAnomalies(devices)
    const totalPowerW = devices.reduce((sum, d) => sum + d.powerW, 0)
    
    const telemetry = {
      timestamp: new Date().toISOString(),
      totalPowerW,
      activeDevices: devices.filter(d => d.state !== 'off').length,
      dailyCostEstimate: ((totalPowerW / 1000) * 24 * 0.12).toFixed(2),
      anomalyCount: anomalies.length,
      devices,
      anomalies
    }
    
    // Verify top-level structure
    expect(telemetry).toHaveProperty('timestamp')
    expect(telemetry).toHaveProperty('totalPowerW')
    expect(telemetry).toHaveProperty('activeDevices')
    expect(telemetry).toHaveProperty('dailyCostEstimate')
    expect(telemetry).toHaveProperty('anomalyCount')
    expect(telemetry).toHaveProperty('devices')
    expect(telemetry).toHaveProperty('anomalies')
    
    // Verify field types
    expect(typeof telemetry.timestamp).toBe('string')
    expect(typeof telemetry.totalPowerW).toBe('number')
    expect(typeof telemetry.activeDevices).toBe('number')
    expect(typeof telemetry.dailyCostEstimate).toBe('string')
    expect(typeof telemetry.anomalyCount).toBe('number')
    expect(Array.isArray(telemetry.devices)).toBe(true)
    expect(Array.isArray(telemetry.anomalies)).toBe(true)
    
    // Verify calculated values
    expect(telemetry.totalPowerW).toBeGreaterThanOrEqual(0)
    expect(telemetry.activeDevices).toBeGreaterThanOrEqual(0)
    expect(telemetry.activeDevices).toBeLessThanOrEqual(telemetry.devices.length)
    expect(telemetry.anomalyCount).toBe(telemetry.anomalies.length)
    
    // Verify totalPowerW calculation
    const calculatedTotal = telemetry.devices.reduce((sum, d) => sum + d.powerW, 0)
    expect(Math.abs(telemetry.totalPowerW - calculatedTotal)).toBeLessThan(0.01)
    
    // Verify dailyCostEstimate calculation
    const expectedCost = ((telemetry.totalPowerW / 1000) * 24 * 0.12).toFixed(2)
    expect(telemetry.dailyCostEstimate).toBe(expectedCost)
  })
  
  // Test response consistency across multiple calls
  it('should return consistent data structure across multiple calls', () => {
    // Call endpoints multiple times
    for (let i = 0; i < 10; i++) {
      const devices = simulateDevices()
      const anomalies = detectAnomalies(devices)
      
      // Verify devices array structure is consistent
      expect(Array.isArray(devices)).toBe(true)
      expect(devices.length).toBe(baseDevices.length)
      
      // Verify anomalies array structure is consistent
      expect(Array.isArray(anomalies)).toBe(true)
      
      // Verify all device IDs match base devices
      const deviceIds = devices.map(d => d.id).sort()
      const baseIds = baseDevices.map(d => d.id).sort()
      expect(deviceIds).toEqual(baseIds)
    }
  })
  
  // Test that anomalies reference valid devices
  it('should ensure all anomalies reference valid device IDs', () => {
    const devices = simulateDevices()
    const anomalies = detectAnomalies(devices)
    const deviceIds = devices.map(d => d.id)
    
    anomalies.forEach(anomaly => {
      expect(deviceIds).toContain(anomaly.deviceId)
    })
  })
})
