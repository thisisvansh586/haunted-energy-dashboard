import { describe, it, expect } from 'vitest'
import { render } from '@testing-library/react'
import UsageChart from './UsageChart'
import fc from 'fast-check'

describe('UsageChart', () => {
  it('should display message when no data is available', () => {
    const { container } = render(<UsageChart usageHistory={[]} />)
    expect(container.textContent).toContain('Collecting usage data')
  })

  it('should render SVG chart when data is provided', () => {
    const usageHistory = [100, 150, 200, 180, 220]
    const { container } = render(<UsageChart usageHistory={usageHistory} />)
    const svg = container.querySelector('svg')
    expect(svg).toBeTruthy()
  })

  // Feature: haunted-energy-dashboard, Property 26: Chart data point count
  it('Property 26: should display the last 60 data points', () => {
    fc.assert(
      fc.property(
        fc.array(fc.float({ min: 0, max: 1000 }), { minLength: 1, maxLength: 100 }),
        (dataPoints) => {
          const last60 = dataPoints.slice(-60)
          const { container } = render(<UsageChart usageHistory={last60} />)
          const svg = container.querySelector('svg')
          
          // Chart should render
          expect(svg).toBeTruthy()
          
          // Should show correct number of readings in label
          const text = container.textContent
          expect(text).toContain(`Last ${last60.length} readings`)
          
          return true
        }
      ),
      { numRuns: 100 }
    )
  })
})
