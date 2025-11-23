import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import '@testing-library/jest-dom'
import Header from './Header'

describe('Header Component Unit Tests', () => {
  describe('Rendering with different themes', () => {
    it('should render application title with ghost emoji', () => {
      const mockToggle = vi.fn()
      render(<Header theme="dark" onToggleTheme={mockToggle} />)
      
      expect(screen.getByText('👻')).toBeInTheDocument()
      expect(screen.getByText('Haunted Home Energy Dashboard')).toBeInTheDocument()
    })

    it('should render with light theme', () => {
      const mockToggle = vi.fn()
      const { container } = render(<Header theme="light" onToggleTheme={mockToggle} />)
      
      expect(container.querySelector('.header')).toBeInTheDocument()
    })

    it('should render with dark theme', () => {
      const mockToggle = vi.fn()
      const { container } = render(<Header theme="dark" onToggleTheme={mockToggle} />)
      
      expect(container.querySelector('.header')).toBeInTheDocument()
    })
  })

  describe('Icon display based on theme', () => {
    it('should show moon icon when theme is light', () => {
      const mockToggle = vi.fn()
      render(<Header theme="light" onToggleTheme={mockToggle} />)
      
      expect(screen.getByText('🌙')).toBeInTheDocument()
    })

    it('should show sun icon when theme is dark', () => {
      const mockToggle = vi.fn()
      render(<Header theme="dark" onToggleTheme={mockToggle} />)
      
      expect(screen.getByText('☀️')).toBeInTheDocument()
    })
  })

  describe('Toggle button click handler', () => {
    it('should call onToggleTheme when button is clicked', () => {
      const mockToggle = vi.fn()
      render(<Header theme="dark" onToggleTheme={mockToggle} />)
      
      const button = screen.getByRole('button')
      fireEvent.click(button)
      
      expect(mockToggle).toHaveBeenCalledTimes(1)
    })

    it('should call onToggleTheme callback on each click', () => {
      const mockToggle = vi.fn()
      render(<Header theme="light" onToggleTheme={mockToggle} />)
      
      const button = screen.getByRole('button')
      fireEvent.click(button)
      fireEvent.click(button)
      fireEvent.click(button)
      
      expect(mockToggle).toHaveBeenCalledTimes(3)
    })
  })
})
