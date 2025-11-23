import { describe, it, expect } from 'vitest'
import { render } from '@testing-library/react'
import DeviceChart from './DeviceChart'
import fc from 'fast-check'

describe('DeviceChart', () => {
  it('should display message when no devices are available', () => {
    const { container } = render(<DeviceChart devices={[]} />)
    expect(container.textContent).toContain('No device data available')
  })

  it('should render SVG chart when devices are provided', () => {
    const devices = [
      { id: 'dev_001', name: 'Fridge', powerW: 120 },
      { id: 'dev_002', name: 'TV', powerW: 80 }
    ]
    const { container } = render(<DeviceChart devices={devices} />)
    const svg = container.querySelector('svg')
    expect(svg).toBeTruthy()
  })

  // Feature: haunted-energy-dashboard, Property 27: Bar chart device completeness
  it('Property 27: should display one bar for each device', () => {
    fc.assert(
      fc.property(
        fc.array(
          fc.record({
            id: fc.string(),
            name: fc.string({ minLength: 1 }),
            powerW: fc.float({ min: 0, max: 500 })
          }),
          { minLength: 1, maxLength: 10 }
        ),
        (devices) => {
          const { container } = render(<DeviceChart devices={devices} />)
          const svg = container.querySelector('svg')
          
          // Chart should render
          expect(svg).toBeTruthy()
          
          // Should have one rect (bar) per device
          const bars = svg.querySelectorAll('rect')
          expect(bars.length).toBeGreaterThanOrEqual(devices.length)
          
          // Each device's power should be displayed
          devices.forEach(device => {
            const powerText = Math.round(device.powerW).toString()
            expect(container.textContent).toContain(powerText)
          })
          
          return true
        }
      ),
      { numRuns: 100 }
    )
  })
})
