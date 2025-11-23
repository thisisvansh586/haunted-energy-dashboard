import { describe, it, expect, afterEach } from 'vitest'
import { render, screen, cleanup } from '@testing-library/react'
import '@testing-library/jest-dom'
import * as fc from 'fast-check'
import UsageGauge from './UsageGauge'

describe('UsageGauge Component Property Tests', () => {
  afterEach(() => {
    cleanup()
  })

  // Feature: haunted-energy-dashboard, Property 6: Daily cost calculation
  // Validates: Requirements 3.3, 3.4
  describe('Property 6: Daily cost calculation', () => {
    it('should calculate daily cost using formula (totalPowerW / 1000) * 24 * 0.12 and format to two decimal places', () => {
      fc.assert(
        fc.property(
          fc.float({ min: 0, max: 10000, noNaN: true }), // totalPower in watts
          (totalPower) => {
            // Calculate expected daily cost using the formula
            const expectedCost = ((totalPower / 1000) * 24 * 0.12).toFixed(2)
            
            // Render the component
            const { container } = render(<UsageGauge totalPower={totalPower} deviceCount={5} />)
            
            // Verify the cost is displayed with correct format
            const costText = `💰 $${expectedCost}/day estimated`
            expect(container.textContent).toContain(costText)
            
            // Verify the format has exactly two decimal places
            const decimalPart = expectedCost.split('.')[1]
            expect(decimalPart).toBeDefined()
            expect(decimalPart.length).toBe(2)
            
            // Clean up after each property test iteration
            cleanup()
          }
        ),
        { numRuns: 100 }
      )
    })

    it('should format cost as dollar amount with two decimal places', () => {
      fc.assert(
        fc.property(
          fc.float({ min: 0, max: 10000, noNaN: true }),
          (totalPower) => {
            const dailyCost = ((totalPower / 1000) * 24 * 0.12).toFixed(2)
            
            const { container } = render(<UsageGauge totalPower={totalPower} deviceCount={3} />)
            
            // Verify format: starts with $, has two decimal places
            expect(dailyCost).toMatch(/^\d+\.\d{2}$/)
            
            // Verify it's displayed in the component
            expect(container.textContent).toContain(`💰 $${dailyCost}/day estimated`)
            
            // Clean up after each property test iteration
            cleanup()
          }
        ),
        { numRuns: 100 }
      )
    })
  })

  // Feature: haunted-energy-dashboard, Property 7: Device count accuracy
  // Validates: Requirements 3.5
  describe('Property 7: Device count accuracy', () => {
    it('should display device count equal to the length of devices array', () => {
      fc.assert(
        fc.property(
          fc.integer({ min: 0, max: 100 }), // deviceCount
          fc.float({ min: 0, max: 5000, noNaN: true }), // totalPower
          (deviceCount, totalPower) => {
            // Render the component
            const { container } = render(<UsageGauge totalPower={totalPower} deviceCount={deviceCount} />)
            
            // Verify the device count is displayed correctly
            const deviceText = `🔌 ${deviceCount} devices monitored`
            expect(container.textContent).toContain(deviceText)
            
            // Verify the displayed count matches the input
            expect(container.textContent).toContain(deviceCount.toString())
            
            // Clean up after each property test iteration
            cleanup()
          }
        ),
        { numRuns: 100 }
      )
    })
  })
})
