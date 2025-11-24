import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import Navigation from '../components/Navigation'
import './DashboardPage.css'

// Default demo devices
const DEFAULT_DEVICES = [
  { id: '1', name: 'Living Room AC', icon: '❄️', room: 'Living Room', current_power: 1850, state: 'on', base_power: 1850, type: 'hvac' },
  { id: '2', name: 'Kitchen Fridge', icon: '🧊', room: 'Kitchen', current_power: 145, state: 'on', base_power: 145, type: 'appliance' },
  { id: '3', name: 'Bedroom TV', icon: '📺', room: 'Bedroom', current_power: 4, state: 'standby', base_power: 120, type: 'electronics' },
  { id: '4', name: 'Hall Lights', icon: '💡', room: 'Hallway', current_power: 45, state: 'on', base_power: 45, type: 'lighting' },
  { id: '5', name: 'Office Heater', icon: '🔥', room: 'Office', current_power: 0, state: 'off', base_power: 1500, type: 'hvac' },
  { id: '6', name: 'Garage Lights', icon: '💡', room: 'Garage', current_power: 0, state: 'off', base_power: 60, type: 'lighting' }
]

// Default notifications
const DEFAULT_NOTIFICATIONS = [
  { id: '1', title: 'High Power Detected', message: 'Living Room AC consuming 1850W', level: 'warning', time: '5m ago' },
  { id: '2', title: 'Standby Mode', message: 'Bedroom TV dropped to standby mode', level: 'info', time: '12m ago' },
  { id: '3', title: 'Device Disconnected', message: 'Office Heater went offline', level: 'error', time: '1h ago' }
]

function DashboardPage() {
  const navigate = useNavigate()
  const [devices, setDevices] = useState(DEFAULT_DEVICES)
  const [notifications, setNotifications] = useState(DEFAULT_NOTIFICATIONS)
  const [theme, setTheme] = useState('dark')

  useEffect(() => {
    document.body.className = theme
    // Simulate power fluctuations
    const interval = setInterval(() => {
      setDevices(prev => prev.map(d => ({
        ...d,
        current_power: d.state === 'on' ? d.base_power * (0.9 + Math.random() * 0.2) :
                       d.state === 'standby' ? Math.random() * 10 : 0
      })))
    }, 3000)
    return () => clearInterval(interval)
  }, [])

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light'
    setTheme(newTheme)
    document.body.className = newTheme
  }

  const toggleDevice = (id) => {
    setDevices(prev => prev.map(d => {
      if (d.id === id) {
        const states = ['off', 'standby', 'on']
        const currentIndex = states.indexOf(d.state)
        const nextState = states[(currentIndex + 1) % states.length]
        return { ...d, state: nextState }
      }
      return d
    }))
  }

  const totalPower = devices.reduce((sum, d) => sum + d.current_power, 0)
  const activeDevices = devices.filter(d => d.state === 'on').length
  const standbyDevices = devices.filter(d => d.state === 'standby').length
  const ghostPower = devices.filter(d => d.state === 'standby').reduce((sum, d) => sum + d.current_power, 0)

  return (
    <div className="app">
      <Navigation theme={theme} onToggleTheme={toggleTheme} />
      
      <div className="dashboard-container">
        {/* Power Summary Section */}
        <div className="power-summary">
          <div className="summary-card total">
            <div className="summary-icon">⚡</div>
            <div className="summary-content">
              <h3>Total Power</h3>
              <p className="summary-value">{totalPower.toFixed(1)} W</p>
              <span className="summary-label">Current Usage</span>
            </div>
          </div>
          
          <div className="summary-card active">
            <div className="summary-icon">🟢</div>
            <div className="summary-content">
              <h3>Active Devices</h3>
              <p className="summary-value">{activeDevices}</p>
              <span className="summary-label">Currently ON</span>
            </div>
          </div>
          
          <div className="summary-card standby">
            <div className="summary-icon">🟡</div>
            <div className="summary-content">
              <h3>Standby Devices</h3>
              <p className="summary-value">{standbyDevices}</p>
              <span className="summary-label">Low Power Mode</span>
            </div>
          </div>
          
          <div className="summary-card ghost">
            <div className="summary-icon">👻</div>
            <div className="summary-content">
              <h3>Ghost Power</h3>
              <p className="summary-value">{ghostPower.toFixed(1)} W</p>
              <span className="summary-label">Wasted Energy</span>
            </div>
          </div>
        </div>

        <div className="dashboard-grid">
          {/* Devices Section */}
          <div className="devices-section">
            <h2>🔌 Devices</h2>
            <div className="devices-grid">
              {devices.map(device => (
                <div 
                  key={device.id} 
                  className={`device-card ${device.state}`}
                  onClick={() => navigate(`/device/${device.id}`)}
                >
                  <div className="device-header">
                    <span className="device-icon">{device.icon}</span>
                    <span className={`device-status ${device.state}`}>
                      {device.state.toUpperCase()}
                    </span>
                  </div>
                  <h3>{device.name}</h3>
                  <p className="device-room">{device.room}</p>
                  <div className="device-power">
                    <span className="power-value">{device.current_power.toFixed(1)}</span>
                    <span className="power-unit">W</span>
                  </div>
                  <button 
                    className="toggle-btn"
                    onClick={(e) => {
                      e.stopPropagation()
                      toggleDevice(device.id)
                    }}
                  >
                    Toggle
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Notifications Panel */}
          <div className="notifications-panel">
            <h2>🔔 Alerts</h2>
            <div className="notifications-list">
              {notifications.map(notif => (
                <div key={notif.id} className={`notification-item ${notif.level}`}>
                  <div className="notif-icon">
                    {notif.level === 'warning' ? '⚠️' : notif.level === 'error' ? '❌' : 'ℹ️'}
                  </div>
                  <div className="notif-content">
                    <h4>{notif.title}</h4>
                    <p>{notif.message}</p>
                    <span className="notif-time">{notif.time}</span>
                  </div>
                </div>
              ))}
            </div>
            <button className="view-all-btn" onClick={() => navigate('/notifications')}>
              View All Notifications
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default DashboardPage
