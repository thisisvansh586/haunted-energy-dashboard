import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import Navigation from '../components/Navigation'
import './DeviceDetailsPage.css'

const DEFAULT_DEVICES = [
  { id: '1', name: 'Living Room AC', icon: '❄️', room: 'Living Room', current_power: 1850, state: 'on', base_power: 1850, type: 'hvac' },
  { id: '2', name: 'Kitchen Fridge', icon: '🧊', room: 'Kitchen', current_power: 145, state: 'on', base_power: 145, type: 'appliance' },
  { id: '3', name: 'Bedroom TV', icon: '📺', room: 'Bedroom', current_power: 4, state: 'standby', base_power: 120, type: 'electronics' },
  { id: '4', name: 'Hall Lights', icon: '💡', room: 'Hallway', current_power: 45, state: 'on', base_power: 45, type: 'lighting' },
  { id: '5', name: 'Office Heater', icon: '🔥', room: 'Office', current_power: 0, state: 'off', base_power: 1500, type: 'hvac' },
  { id: '6', name: 'Garage Lights', icon: '💡', room: 'Garage', current_power: 0, state: 'off', base_power: 60, type: 'lighting' }
]

function DeviceDetailsPage() {
  const { deviceId } = useParams()
  const navigate = useNavigate()
  const [device, setDevice] = useState(null)
  const [powerHistory, setPowerHistory] = useState([])
  const [deviceNotifications, setDeviceNotifications] = useState([])

  useEffect(() => {
    const foundDevice = DEFAULT_DEVICES.find(d => d.id === deviceId)
    if (foundDevice) {
      setDevice(foundDevice)
      
      // Generate mock power history
      const history = Array.from({ length: 60 }, (_, i) => ({
        time: `${i}m ago`,
        power: foundDevice.state === 'on' 
          ? foundDevice.base_power * (0.9 + Math.random() * 0.2)
          : foundDevice.state === 'standby' 
          ? Math.random() * 10 
          : 0
      }))
      setPowerHistory(history.reverse())

      // Mock notifications for this device
      setDeviceNotifications([
        { id: '1', message: 'Power spike detected', time: '10m ago', level: 'warning' },
        { id: '2', message: 'Normal operation resumed', time: '1h ago', level: 'info' }
      ])
    }
  }, [deviceId])

  if (!device) {
    return (
      <div className="app">
        <Navigation />
        <div className="device-details-page">
          <h1>Device not found</h1>
          <button onClick={() => navigate('/dashboard')}>Back to Dashboard</button>
        </div>
      </div>
    )
  }

  const avgPower = powerHistory.length > 0 
    ? powerHistory.reduce((sum, h) => sum + h.power, 0) / powerHistory.length 
    : 0

  const maxPower = powerHistory.length > 0 
    ? Math.max(...powerHistory.map(h => h.power)) 
    : 0

  const health = device.state === 'on' && device.current_power > device.base_power * 1.5 
    ? 'warning' 
    : device.state === 'on' 
    ? 'good' 
    : 'idle'

  return (
    <div className="app">
      <Navigation />
      <div className="device-details-page">
        <button className="back-btn" onClick={() => navigate('/dashboard')}>
          ← Back to Dashboard
        </button>

        <div className="device-header-section">
          <div className="device-title">
            <span className="device-icon-large">{device.icon}</span>
            <div>
              <h1>{device.name}</h1>
              <p className="device-location">{device.room}</p>
            </div>
          </div>
          <div className={`device-status-badge ${device.state}`}>
            {device.state.toUpperCase()}
          </div>
        </div>

        <div className="details-grid">
          {/* Real-time Power */}
          <div className="detail-card current-power">
            <h2>⚡ Current Power</h2>
            <div className="power-display">
              <span className="power-value-large">{device.current_power.toFixed(1)}</span>
              <span className="power-unit-large">W</span>
            </div>
            <div className="power-bar">
              <div 
                className="power-fill"
                style={{ width: `${Math.min(100, (device.current_power / device.base_power) * 100)}%` }}
              />
            </div>
          </div>

          {/* Device Stats */}
          <div className="detail-card stats">
            <h2>📊 Statistics</h2>
            <div className="stat-row">
              <span>Base Power:</span>
              <span>{device.base_power} W</span>
            </div>
            <div className="stat-row">
              <span>Average (1h):</span>
              <span>{avgPower.toFixed(1)} W</span>
            </div>
            <div className="stat-row">
              <span>Peak (1h):</span>
              <span>{maxPower.toFixed(1)} W</span>
            </div>
            <div className="stat-row">
              <span>Type:</span>
              <span>{device.type}</span>
            </div>
          </div>

          {/* Device Health */}
          <div className="detail-card health">
            <h2>💚 Device Health</h2>
            <div className={`health-indicator ${health}`}>
              <div className="health-icon">
                {health === 'good' ? '✅' : health === 'warning' ? '⚠️' : '⏸️'}
              </div>
              <div className="health-text">
                {health === 'good' ? 'Operating Normally' : 
                 health === 'warning' ? 'High Power Usage' : 
                 'Idle / Standby'}
              </div>
            </div>
          </div>

          {/* Power Graph */}
          <div className="detail-card power-graph">
            <h2>📈 Power History (Last Hour)</h2>
            <div className="graph-container">
              {powerHistory.slice(-30).map((point, idx) => (
                <div 
                  key={idx}
                  className="graph-bar"
                  style={{ 
                    height: `${Math.min(100, (point.power / maxPower) * 100)}%`,
                    background: point.power > device.base_power * 1.3 
                      ? '#D7263D' 
                      : point.power > device.base_power * 0.5 
                      ? '#00FF9C' 
                      : '#4CC9F0'
                  }}
                  title={`${point.time}: ${point.power.toFixed(1)}W`}
                />
              ))}
            </div>
          </div>

          {/* Device Notifications */}
          <div className="detail-card device-notifications">
            <h2>🔔 Device Alerts</h2>
            <div className="device-notif-list">
              {deviceNotifications.map(notif => (
                <div key={notif.id} className={`device-notif ${notif.level}`}>
                  <span className="notif-icon">
                    {notif.level === 'warning' ? '⚠️' : 'ℹ️'}
                  </span>
                  <div>
                    <p>{notif.message}</p>
                    <span className="notif-time">{notif.time}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default DeviceDetailsPage
