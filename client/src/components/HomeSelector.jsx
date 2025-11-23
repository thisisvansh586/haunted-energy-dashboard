import { useState, useEffect } from 'react'
import { useAuthStore } from '../store/authStore'
import DemoHomeSetup from './DemoHomeSetup'
import './HomeSelector.css'

/**
 * Home Selector Component
 * Allows users to select which home to monitor
 * Stores selection in localStorage
 * Shows demo home setup for new users
 * 
 * Feature: haunted-energy-phase2
 * Requirements: 3.2, 3.5, 15.1
 */
function HomeSelector({ onHomeChange }) {
  const [homes, setHomes] = useState([])
  const [selectedHomeId, setSelectedHomeId] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [showDemoSetup, setShowDemoSetup] = useState(false)
  const { getToken } = useAuthStore()

  useEffect(() => {
    fetchHomes()
  }, [])

  const fetchHomes = async () => {
    try {
      setLoading(true)
      const token = getToken()
      
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3002'}/api/homes`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (!response.ok) throw new Error('Failed to fetch homes')

      const data = await response.json()
      setHomes(data.homes || [])

      // Show demo setup if no homes exist
      if (!data.homes || data.homes.length === 0) {
        setShowDemoSetup(true)
        setLoading(false)
        return
      }

      // Load saved selection or use first home
      const savedHomeId = localStorage.getItem('selectedHomeId')
      const homeToSelect = savedHomeId && data.homes.find(h => h.id === savedHomeId)
        ? savedHomeId
        : data.homes[0]?.id

      if (homeToSelect) {
        handleHomeSelect(homeToSelect)
      }

      setLoading(false)
    } catch (err) {
      console.error('Error fetching homes:', err)
      setError(err.message)
      setLoading(false)
    }
  }

  const handleHomeSelect = (homeId) => {
    setSelectedHomeId(homeId)
    localStorage.setItem('selectedHomeId', homeId)
    
    const selectedHome = homes.find(h => h.id === homeId)
    if (onHomeChange) {
      onHomeChange(selectedHome)
    }
  }

  const handleCreateHome = async () => {
    const name = prompt('Enter home name:')
    if (!name) return

    try {
      const token = getToken()
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3002'}/api/homes`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ name })
      })

      if (!response.ok) throw new Error('Failed to create home')

      const data = await response.json()
      setHomes([...homes, data.home])
      handleHomeSelect(data.home.id)
    } catch (err) {
      console.error('Error creating home:', err)
      alert('Failed to create home: ' + err.message)
    }
  }

  if (loading) {
    return <div className="home-selector loading">Loading homes...</div>
  }

  if (error) {
    return <div className="home-selector error">Error: {error}</div>
  }

  const handleDemoComplete = (home) => {
    setHomes([home])
    handleHomeSelect(home.id)
    setShowDemoSetup(false)
  }

  const handleDemoSkip = () => {
    setShowDemoSetup(false)
  }

  if (showDemoSetup) {
    return <DemoHomeSetup onComplete={handleDemoComplete} onSkip={handleDemoSkip} />
  }

  if (homes.length === 0) {
    return (
      <div className="home-selector empty">
        <p>No homes found</p>
        <button onClick={() => setShowDemoSetup(true)} className="create-home-button">
          🔮 Create Demo Home
        </button>
        <button onClick={handleCreateHome} className="create-home-button">
          + Create Custom Home
        </button>
      </div>
    )
  }

  return (
    <div className="home-selector">
      <label htmlFor="home-select">Select Home:</label>
      <select
        id="home-select"
        value={selectedHomeId || ''}
        onChange={(e) => handleHomeSelect(e.target.value)}
        className="home-select"
      >
        {homes.map(home => (
          <option key={home.id} value={home.id}>
            {home.name}
          </option>
        ))}
      </select>
      <button onClick={handleCreateHome} className="create-home-button" title="Create new home">
        +
      </button>
    </div>
  )
}

export default HomeSelector
