import { useState } from 'react'
import { useAuthStore } from '../store/authStore'
import './DemoHomeSetup.css'

/**
 * Demo Home Setup Component
 * Offers to create a demo home with sample devices for new users
 * 
 * Feature: haunted-energy-phase2
 * Requirements: 15.1, 15.2
 * Property 38: Demo home device count
 */
function DemoHomeSetup({ onComplete, onSkip }) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const { getToken } = useAuthStore()

  const handleCreateDemo = async () => {
    try {
      setLoading(true)
      setError(null)

      const token = getToken()
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3002'}/api/auth/setup-demo-home`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Failed to create demo home')
      }

      const data = await response.json()
      console.log('Demo home created:', data)

      // Call onComplete with the created home
      if (onComplete) {
        onComplete(data.home)
      }
    } catch (err) {
      console.error('Error creating demo home:', err)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleSkip = () => {
    if (onSkip) {
      onSkip()
    }
  }

  return (
    <div className="demo-home-setup-overlay">
      <div className="demo-home-setup-modal">
        <div className="demo-home-header">
          <h2>👻 Welcome to Haunted Energy!</h2>
          <p>Let's get you started with a demo home</p>
        </div>

        <div className="demo-home-content">
          <div className="demo-home-features">
            <h3>Your demo home includes:</h3>
            <ul>
              <li>🏚️ <strong>Haunted Manor</strong> - A spooky home to monitor</li>
              <li>🧊 <strong>Haunted Fridge</strong> - Always running, keeping things cool</li>
              <li>📺 <strong>Phantom TV</strong> - Drawing power in standby mode</li>
              <li>❄️ <strong>Cursed AC</strong> - High power consumption device</li>
              <li>🌀 <strong>Possessed Washer</strong> - Currently off</li>
              <li>💡 <strong>Eerie Lamp</strong> - Lighting up the darkness</li>
            </ul>
            <p className="demo-note">
              ✨ Real-time telemetry simulation will start automatically
            </p>
          </div>

          {error && (
            <div className="demo-error">
              <p>⚠️ {error}</p>
            </div>
          )}

          <div className="demo-home-actions">
            <button
              onClick={handleCreateDemo}
              disabled={loading}
              className="demo-create-button"
            >
              {loading ? 'Creating...' : '🔮 Create Demo Home'}
            </button>
            <button
              onClick={handleSkip}
              disabled={loading}
              className="demo-skip-button"
            >
              Skip for now
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default DemoHomeSetup
