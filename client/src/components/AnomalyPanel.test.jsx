import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import '@testing-library/jest-dom'
import * as fc from 'fast-check'
import AnomalyPanel, { formatRelativeTime } from './AnomalyPanel'

// Helper to generate valid descriptions (non-whitespace)
const descriptionArbitrary = () => 
  fc.string({ minLength: 10, maxLength: 100 })
    .map(s => s.replace(/[^a-zA-Z0-9 ]/g, 'x'))
    .filter(s => s.trim().length >= 10)

describe('AnomalyPanel Component Property Tests', () => {
  // Feature: haunted-energy-dashboard, Property 13: Anomaly display completeness
  // Validates: Requirements 6.1
  describe('Property 13: Anomaly display completeness', () => {
    it('should display type, severity, device name, and timestamp for all anomalies', { timeout: 10000 }, () => {
      fc.assert(
        fc.property(
          fc.array(
            fc.record({
              id: fc.uuid(),
              deviceId: fc.uuid(),
              type: fc.constantFrom('phantom_load', 'spike'),
              severity: fc.constantFrom('low', 'medium', 'high', 'critical'),
              timestamp: fc.integer({ min: Date.now() - 7 * 24 * 60 * 60 * 1000, max: Date.now() }).map(ms => new Date(ms).toISOString()),
              details: fc.record({
                powerDelta: fc.float({ min: 0, max: 1000, noNaN: true }),
                duration: fc.integer({ min: 0, max: 3600 }),
                estimatedCost: fc.float({ min: 0, max: 10, noNaN: true }).map(v => `$${v.toFixed(2)}`),
                description: descriptionArbitrary()
              })
            }),
            { minLength: 1, maxLength: 5 }
          ),
          fc.array(
            fc.record({
              id: fc.uuid(),
              name: fc.string({ minLength: 1, maxLength: 20 }).map(s => s.replace(/[^a-z0-9]/gi, 'x') || 'device'),
              room: fc.string({ minLength: 1, maxLength: 20 }),
              state: fc.constantFrom('on', 'off', 'standby'),
              powerW: fc.float({ min: 0, max: 5000, noNaN: true }),
              idle_threshold: fc.float({ min: 0, max: 100, noNaN: true }),
              lastActive: fc.integer({ min: Date.now() - 7 * 24 * 60 * 60 * 1000, max: Date.now() }).map(ms => new Date(ms).toISOString())
            }),
            { minLength: 1, maxLength: 10 }
          ),
          (anomalies, devices) => {
            // Ensure anomalies reference valid device IDs
            const anomaliesWithValidDevices = anomalies.map((anomaly, idx) => ({
              ...anomaly,
              deviceId: devices[idx % devices.length].id
            }))
            
            const { container } = render(
              <AnomalyPanel anomalies={anomaliesWithValidDevices} devices={devices} />
            )
            
            // Verify the correct number of anomaly items are rendered
            const anomalyItems = container.querySelectorAll('.anomaly-item')
            expect(anomalyItems.length).toBe(anomaliesWithValidDevices.length)
            
            // For each anomaly, verify all required information is displayed
            anomaliesWithValidDevices.forEach((anomaly) => {
              // Check type is displayed
              const typeText = anomaly.type === 'phantom_load' ? '👻 Phantom Load' : '⚡ Power Spike'
              expect(screen.getAllByText(typeText).length).toBeGreaterThan(0)
              
              // Check severity badge is displayed
              expect(screen.getAllByText(anomaly.severity).length).toBeGreaterThan(0)
              
              // Check device name is displayed
              const device = devices.find(d => d.id === anomaly.deviceId)
              if (device) {
                expect(screen.getAllByText(`📍 ${device.name}`).length).toBeGreaterThan(0)
              }
              
              // Check timestamp is displayed (relative format)
              const relativeTime = formatRelativeTime(anomaly.timestamp)
              expect(screen.getAllByText(relativeTime).length).toBeGreaterThan(0)
            })
          }
        ),
        { numRuns: 50 }
      )
    })
  })

  // Feature: haunted-energy-dashboard, Property 14: Severity badge color mapping
  // Validates: Requirements 6.2
  describe('Property 14: Severity badge color mapping', () => {
    it('should map severity levels to correct badge colors', () => {
      fc.assert(
        fc.property(
          fc.constantFrom('low', 'medium', 'high', 'critical'),
          (severity) => {
            const anomaly = {
              id: 'test-anomaly',
              deviceId: 'test-device',
              type: 'phantom_load',
              severity: severity,
              timestamp: new Date().toISOString(),
              details: {
                powerDelta: 100,
                duration: 60,
                estimatedCost: '$1.00',
                description: 'Test anomaly'
              }
            }
            
            const device = {
              id: 'test-device',
              name: 'Test Device',
              room: 'Test Room',
              state: 'on',
              powerW: 100,
              idle_threshold: 10,
              lastActive: new Date().toISOString()
            }
            
            const { container } = render(
              <AnomalyPanel anomalies={[anomaly]} devices={[device]} />
            )
            
            // Verify severity badge has correct class
            const severityBadge = container.querySelector(`.anomaly-severity.${severity}`)
            expect(severityBadge).toBeTruthy()
            
            // Verify anomaly item has correct border class
            const anomalyItem = container.querySelector(`.anomaly-item.${severity}`)
            expect(anomalyItem).toBeTruthy()
          }
        ),
        { numRuns: 100 }
      )
    })
  })

  // Feature: haunted-energy-dashboard, Property 15: Anomaly details presence
  // Validates: Requirements 6.3
  describe('Property 15: Anomaly details presence', () => {
    it('should display description and estimated cost for all anomalies', () => {
      fc.assert(
        fc.property(
          fc.array(
            fc.record({
              id: fc.uuid(),
              deviceId: fc.uuid(),
              type: fc.constantFrom('phantom_load', 'spike'),
              severity: fc.constantFrom('low', 'medium', 'high', 'critical'),
              timestamp: fc.integer({ min: Date.now() - 7 * 24 * 60 * 60 * 1000, max: Date.now() }).map(ms => new Date(ms).toISOString()),
              details: fc.record({
                powerDelta: fc.float({ min: 0, max: 1000, noNaN: true }),
                duration: fc.integer({ min: 0, max: 3600 }),
                estimatedCost: fc.float({ min: 0, max: 10, noNaN: true }).map(v => `$${v.toFixed(2)}`),
                description: descriptionArbitrary()
              })
            }),
            { minLength: 1, maxLength: 5 }
          ),
          fc.array(
            fc.record({
              id: fc.uuid(),
              name: fc.string({ minLength: 1, maxLength: 20 }).map(s => s.replace(/[^a-z0-9]/gi, 'x') || 'device'),
              room: fc.string({ minLength: 1, maxLength: 20 }),
              state: fc.constantFrom('on', 'off', 'standby'),
              powerW: fc.float({ min: 0, max: 5000, noNaN: true }),
              idle_threshold: fc.float({ min: 0, max: 100, noNaN: true }),
              lastActive: fc.integer({ min: Date.now() - 7 * 24 * 60 * 60 * 1000, max: Date.now() }).map(ms => new Date(ms).toISOString())
            }),
            { minLength: 1, maxLength: 10 }
          ),
          (anomalies, devices) => {
            // Ensure anomalies reference valid device IDs
            const anomaliesWithValidDevices = anomalies.map((anomaly, idx) => ({
              ...anomaly,
              deviceId: devices[idx % devices.length].id
            }))
            
            render(
              <AnomalyPanel anomalies={anomaliesWithValidDevices} devices={devices} />
            )
            
            // For each anomaly, verify description and cost are displayed
            anomaliesWithValidDevices.forEach((anomaly) => {
              // Check description is displayed (use function matcher to handle whitespace normalization)
              const normalizedDescription = anomaly.details.description.replace(/\s+/g, ' ').trim()
              expect(screen.getAllByText((content, element) => {
                const normalizedContent = content.replace(/\s+/g, ' ').trim()
                return normalizedContent === normalizedDescription
              }).length).toBeGreaterThan(0)
              
              // Check estimated cost is displayed
              const costText = `💰 Estimated cost: ${anomaly.details.estimatedCost}`
              expect(screen.getAllByText(costText).length).toBeGreaterThan(0)
            })
          }
        ),
        { numRuns: 50 }
      )
    })
  })

  // Feature: haunted-energy-dashboard, Property 16: Relative timestamp formatting
  // Validates: Requirements 6.4
  describe('Property 16: Relative timestamp formatting', () => {
    it('should format timestamps as minutes for <60min, hours for <24h, days for older', () => {
      fc.assert(
        fc.property(
          fc.integer({ min: 0, max: 60 * 24 * 7 }), // 0 to 7 days in minutes
          (minutesAgo) => {
            const now = Date.now()
            const timestamp = new Date(now - minutesAgo * 60 * 1000).toISOString()
            
            const result = formatRelativeTime(timestamp)
            
            if (minutesAgo < 60) {
              // Should show minutes
              expect(result).toMatch(/^\d+m ago$/)
              const displayedMinutes = parseInt(result.match(/^(\d+)m ago$/)[1])
              expect(displayedMinutes).toBe(minutesAgo)
            } else if (minutesAgo < 60 * 24) {
              // Should show hours
              expect(result).toMatch(/^\d+h ago$/)
              const expectedHours = Math.floor(minutesAgo / 60)
              const displayedHours = parseInt(result.match(/^(\d+)h ago$/)[1])
              expect(displayedHours).toBe(expectedHours)
            } else {
              // Should show days
              expect(result).toMatch(/^\d+d ago$/)
              const expectedDays = Math.floor(minutesAgo / (60 * 24))
              const displayedDays = parseInt(result.match(/^(\d+)d ago$/)[1])
              expect(displayedDays).toBe(expectedDays)
            }
          }
        ),
        { numRuns: 100 }
      )
    })
  })
})
