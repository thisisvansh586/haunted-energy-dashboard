import { describe, it, expect } from 'vitest'
import { render } from '@testing-library/react'
import '@testing-library/jest-dom'
import * as fc from 'fast-check'
import HouseMap from './HouseMap'

// Room position mapping from the component
const rooms = {
  'Kitchen': { x: 50, y: 50 },
  'Living Room': { x: 250, y: 50 },
  'Bedroom': { x: 450, y: 50 },
  'Laundry Room': { x: 50, y: 200 },
  'Study': { x: 250, y: 200 }
}

describe('HouseMap Property-Based Tests', () => {
  // Feature: haunted-energy-dashboard, Property 1: Device icon positioning
  // Validates: Requirements 1.2
  it('Property 1: Device icon positioning - devices should be positioned at room coordinates', () => {
    fc.assert(
      fc.property(
        fc.array(
          fc.record({
            id: fc.string({ minLength: 1 }),
            name: fc.string({ minLength: 1 }),
            room: fc.constantFrom('Kitchen', 'Living Room', 'Bedroom', 'Laundry Room', 'Study'),
            powerW: fc.float({ min: 0, max: 5000 }),
            state: fc.constantFrom('on', 'off', 'standby'),
            lastActive: fc.date().map(d => d.toISOString()),
            idle_threshold: fc.float({ min: 0, max: 100 })
          }),
          { minLength: 1, maxLength: 10 }
        ),
        (devices) => {
          const { container } = render(<HouseMap devices={devices} />)
          const svg = container.querySelector('svg')
          
          // For each device, verify it's positioned at the correct room coordinates
          devices.forEach(device => {
            const room = rooms[device.room]
            if (room) {
              // Device circle should be at room center (x + 75, y + 70)
              const expectedCx = room.x + 75
              const expectedCy = room.y + 70
              
              // Find circles at this position
              const circles = svg.querySelectorAll('circle')
              const deviceCircle = Array.from(circles).find(circle => {
                const cx = parseFloat(circle.getAttribute('cx'))
                const cy = parseFloat(circle.getAttribute('cy'))
                return cx === expectedCx && cy === expectedCy
              })
              
              // At least one device should be at this room's position
              expect(deviceCircle).toBeTruthy()
            }
          })
        }
      ),
      { numRuns: 100 }
    )
  })

  // Feature: haunted-energy-dashboard, Property 2: State color mapping
  // Validates: Requirements 1.3, 2.4, 2.5, 2.6
  it('Property 2: State color mapping - device colors should match state', () => {
    fc.assert(
      fc.property(
        // Generate a single device to avoid overlapping in same room
        fc.record({
          id: fc.string({ minLength: 1 }),
          name: fc.string({ minLength: 1 }),
          room: fc.constantFrom('Kitchen', 'Living Room', 'Bedroom', 'Laundry Room', 'Study'),
          powerW: fc.float({ min: 0, max: 5000 }),
          state: fc.constantFrom('on', 'off', 'standby'),
          lastActive: fc.date().map(d => d.toISOString()),
          idle_threshold: fc.float({ min: 0, max: 100 })
        }),
        (device) => {
          const { container } = render(<HouseMap devices={[device]} />)
          const svg = container.querySelector('svg')
          const circles = svg.querySelectorAll('circle')
          
          // Map expected colors
          const stateColors = {
            'on': '#22c55e',      // green
            'off': '#6b7280',     // gray
            'standby': '#eab308'  // yellow
          }
          
          const room = rooms[device.room]
          if (room) {
            const expectedCx = room.x + 75
            const expectedCy = room.y + 70
            const expectedColor = stateColors[device.state]
            
            // Find the circle for this device
            const deviceCircle = Array.from(circles).find(circle => {
              const cx = parseFloat(circle.getAttribute('cx'))
              const cy = parseFloat(circle.getAttribute('cy'))
              return cx === expectedCx && cy === expectedCy
            })
            
            expect(deviceCircle).toBeTruthy()
            const actualColor = deviceCircle.getAttribute('fill')
            expect(actualColor).toBe(expectedColor)
          }
        }
      ),
      { numRuns: 100 }
    )
  })
})
