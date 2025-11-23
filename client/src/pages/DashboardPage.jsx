import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '../store/authStore'
import { useRealtime } from '../hooks/useRealtime'
import Navigation from '../components/Navigation'
import HomeSelector from '../components/HomeSelector'
import HouseMap from '../components/HouseMap'
import DeviceList from '../components/DeviceList'
import UsageGauge from '../components/UsageGauge'
import AnomalyPanel from '../components/AnomalyPanel'
import UsageChart from '../components/UsageChart'
import DeviceChart from '../components/DeviceChart'
import NotificationToast from '../components/NotificationToast'
import { supabase } from '../supabaseClient'

/**
 * Dashboard Page - Main application view
 * Integrates real-time subscriptions, home selection, and notifications
 * Feature: haunted-energy-phase2
 * Property 16: Telemetry UI update
 * Property 18: Notification triggers toast
 */
function DashboardPage() {
  const navigate = useNavigate()
  const { user, signOut, getToken } = useAuthStore()
  const [theme, setTheme] = useState('dark')
  const [devices, setDevices] = useState([])
  const [anomalies, setAnomalies] = useState([])
  const [notifications, setNotifications] = useState([])
  const [usageHistory, setUsageHistory] = useState([])
  const [currentHome, setCurrentHome] = useState(null)
  const [loading, setLoading] = useState(true)
  const [toasts, setToasts] = useState([])

  // Real-time subscriptions
  const { telemetryUpdates, anomalyUpdates, notificationUpdates, isConnected } = useRealtime(
    currentHome?.id,
    user?.id
  )

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light'
    setTheme(newTheme)
    document.body.className = newTheme
  }

  const handleLogout = async () => {
    await signOut()
    navigate('/auth')
  }

  const handleHomeChange = (home) => {
    setCurrentHome(home)
    if (home) {
      fetchDevices(home.id)
      fetchAnomalies(home.id)
      fetchNotifications()
    }
  }

  const fetchDevices = async (homeId) => {
    if (!homeId) return
    try {
      const token = getToken()
      const res = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3002'}/api/devices?homeId=${homeId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      const data = await res.json()
      setDevices(data.devices || [])
    } catch (error) {
      console.error('Error fetching devices:', error)
    }
  }

  const fetchAnomalies = async (homeId) => {
    if (!homeId) return
    try {
      const token = getToken()
      const res = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3002'}/api/anomalies?homeId=${homeId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      const data = await res.json()
      setAnomalies(data.anomalies || [])
    } catch (error) {
      console.error('Error fetching anomalies:', error)
    }
  }

  const fetchNotifications = async () => {
    try {
      const token = getToken()
      const res = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3002'}/api/notifications`, {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      const data = await res.json()
      setNotifications(data.notifications || [])
    } catch (error) {
      console.error('Error fetching notifications:', error)
    }
  }

  const markNotificationAsRead = async (notificationId) => {
    try {
      const token = getToken()
      await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3002'}/api/notifications/${notificationId}/read`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      })
      setNotifications(prev => 
        prev.map(n => n.id === notificationId ? { ...n, read: true } : n)
      )
    } catch (error) {
      console.error('Error marking notification as read:', error)
    }
  }

  // Handle real-time telemetry updates
  useEffect(() => {
    if (telemetryUpdates.length > 0) {
      const latestUpdate = telemetryUpdates[telemetryUpdates.length - 1]
      setDevices(prev => 
        prev.map(d => 
          d.id === latestUpdate.device_id 
            ? { ...d, current_power: latestUpdate.power_w }
            : d
        )
      )
    }
  }, [telemetryUpdates])

  // Handle real-time anomaly updates
  useEffect(() => {
    if (anomalyUpdates.length > 0) {
      const latestAnomaly = anomalyUpdates[anomalyUpdates.length - 1]
      setAnomalies(prev => [latestAnomaly, ...prev])
    }
  }, [anomalyUpdates])

  // Handle real-time notification updates - show toast
  useEffect(() => {
    if (notificationUpdates.length > 0) {
      const latestNotification = notificationUpdates[notificationUpdates.length - 1]
      setNotifications(prev => [latestNotification, ...prev])
      
      // Show toast
      setToasts(prev => [...prev, { ...latestNotification, id: Date.now() }])
    }
  }, [notificationUpdates])

  const removeToast = (toastId) => {
    setToasts(prev => prev.filter(t => t.id !== toastId))
  }

  useEffect(() => {
    document.body.className = theme
    setLoading(false)
    fetchNotifications()
  }, [])

  const totalPower = devices.reduce((sum, d) => sum + (d.current_power || 0), 0)

  if (loading) return <div className="loading">Loading...</div>

  return (
    <div className="app">
      {theme === 'dark' && <div className="fog-overlay"></div>}
      
      <Navigation 
        user={user} 
        onLogout={handleLogout} 
        theme={theme} 
        onToggleTheme={toggleTheme}
        notifications={notifications}
        onMarkNotificationAsRead={markNotificationAsRead}
      />
      
      <div className="main-content">
        <HomeSelector onHomeChange={handleHomeChange} />
        
        {isConnected && (
          <div className="realtime-indicator">
            <span className="realtime-dot"></span>
            Live Updates Active
          </div>
        )}
        
        <div className="left-panel">
          <div className="card house-map">
            <h2>🏚️ {currentHome?.name || 'House Map'}</h2>
            <HouseMap devices={devices} />
          </div>
          <div className="card">
            <h2>📈 Usage History</h2>
            <UsageChart usageHistory={usageHistory} />
          </div>
          <div className="card">
            <h2>📊 Device Power</h2>
            <DeviceChart devices={devices} />
          </div>
        </div>
        <div>
          <div className="card usage-gauge">
            <h2>⚡ Total Power</h2>
            <UsageGauge totalPower={totalPower} deviceCount={devices.length} />
          </div>
          <div className="card">
            <h2>🔌 Devices</h2>
            <DeviceList 
              devices={devices} 
              homeId={currentHome?.id}
              onDeviceUpdate={(device) => {
                if (device._deleted) {
                  setDevices(prev => prev.filter(d => d.id !== device.id))
                } else {
                  setDevices(prev => {
                    const index = prev.findIndex(d => d.id === device.id)
                    if (index >= 0) {
                      const updated = [...prev]
                      updated[index] = device
                      return updated
                    }
                    return [...prev, device]
                  })
                }
              }}
            />
          </div>
          <div className="card anomaly-panel">
            <h2>⚠️ Anomalies ({anomalies.length})</h2>
            <AnomalyPanel anomalies={anomalies} devices={devices} />
          </div>
        </div>
      </div>

      {/* Notification Toasts */}
      <div className="toast-container">
        {toasts.map(toast => (
          <NotificationToast
            key={toast.id}
            notification={toast}
            onDismiss={() => removeToast(toast.id)}
            onClick={() => navigate('/notifications')}
          />
        ))}
      </div>
    </div>
  )
}

export default DashboardPage
