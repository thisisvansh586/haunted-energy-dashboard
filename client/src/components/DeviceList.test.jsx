import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import '@testing-library/jest-dom'
import * as fc from 'fast-check'
import DeviceList from './DeviceList'

describe('DeviceList Component Property Tests', () => {
  // Feature: haunted-energy-dashboard, Property 3: Device list completeness
  // Validates: Requirements 2.1
  describe('Property 3: Device list completeness', () => {
    it('should display name, room, state, and power for all devices', { timeout: 10000 }, () => {
      fc.assert(
        fc.property(
          fc.array(
            fc.record({
              id: fc.uuid(),
              name: fc.string({ minLength: 1, maxLength: 20 }).map(s => s.replace(/[^a-z0-9]/gi, 'x') || 'device'),
              room: fc.string({ minLength: 1, maxLength: 20 }).map(s => s.replace(/[^a-z0-9]/gi, 'x') || 'room'),
              state: fc.constantFrom('on', 'off', 'standby'),
              powerW: fc.float({ min: 0, max: 5000, noNaN: true }),
              idle_threshold: fc.float({ min: 0, max: 100, noNaN: true }),
              lastActive: fc.date().map(d => d.toISOString())
            }),
            { minLength: 1, maxLength: 5 }
          ),
          (devices) => {
            const { container } = render(<DeviceList devices={devices} />)
            
            // Verify the correct number of device items are rendered
            const deviceItems = container.querySelectorAll('.device-item')
            expect(deviceItems.length).toBe(devices.length)
            
            // For each device, verify all required information is displayed
            devices.forEach((device) => {
              // Check device name is displayed
              expect(screen.getAllByText(device.name).length).toBeGreaterThan(0)
              
              // Check room is displayed (with location emoji)
              expect(screen.getAllByText(`📍 ${device.room}`).length).toBeGreaterThan(0)
              
              // Check state badge is displayed
              expect(screen.getAllByText(device.state).length).toBeGreaterThan(0)
              
              // Check power consumption is displayed (formatted)
              const powerText = `${device.powerW.toFixed(1)}W`
              expect(screen.getAllByText(powerText).length).toBeGreaterThan(0)
            })
          }
        ),
        { numRuns: 50 }
      )
    })
  })

  // Feature: haunted-energy-dashboard, Property 4: Power consumption formatting
  // Validates: Requirements 2.3
  describe('Property 4: Power consumption formatting', () => {
    it('should format power consumption with one decimal place and unit W', () => {
      fc.assert(
        fc.property(
          fc.array(
            fc.record({
              id: fc.uuid(),
              name: fc.string({ minLength: 1, maxLength: 20 }).map(s => s.replace(/[^a-z0-9]/gi, 'x') || 'device'),
              room: fc.string({ minLength: 1, maxLength: 20 }).map(s => s.replace(/[^a-z0-9]/gi, 'x') || 'room'),
              state: fc.constantFrom('on', 'off', 'standby'),
              powerW: fc.float({ min: 0, max: 5000, noNaN: true }),
              idle_threshold: fc.float({ min: 0, max: 100, noNaN: true }),
              lastActive: fc.date().map(d => d.toISOString())
            }),
            { minLength: 1, maxLength: 10 }
          ),
          (devices) => {
            render(<DeviceList devices={devices} />)
            
            // For each device, verify power is formatted correctly
            devices.forEach((device) => {
              // Expected format: one decimal place + "W"
              const expectedFormat = `${device.powerW.toFixed(1)}W`
              
              // Verify the formatted power is displayed (use getAllByText since duplicates are possible)
              expect(screen.getAllByText(expectedFormat).length).toBeGreaterThan(0)
              
              // Verify format properties:
              // 1. Has exactly one decimal place
              const decimalPart = device.powerW.toFixed(1).split('.')[1]
              expect(decimalPart).toBeDefined()
              expect(decimalPart.length).toBe(1)
              
              // 2. Ends with "W"
              expect(expectedFormat.endsWith('W')).toBe(true)
            })
          }
        ),
        { numRuns: 100 }
      )
    })
  })
})
