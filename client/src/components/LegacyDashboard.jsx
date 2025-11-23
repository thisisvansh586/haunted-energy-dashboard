import { useState, useEffect } from 'react'
import Header from './Header'
import HouseMap from './HouseMap'
import DeviceList from './DeviceList'
import UsageGauge from './UsageGauge'
import AnomalyPanel from './AnomalyPanel'
import UsageChart from './UsageChart'
import DeviceChart from './DeviceChart'

function LegacyDashboard() {
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem('theme') || 'dark'
  })
  const [devices, setDevices] = useState([])
  const [anomalies, setAnomalies] = useState([])
  const [usageHistory, setUsageHistory] = useState([])

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light'
    setTheme(newTheme)
    localStorage.setItem('theme', newTheme)
    document.body.className = newTheme
  }

  const fetchData = async () => {
    try {
      const [devicesRes, anomaliesRes] = await Promise.all([
        fetch('/api/devices'),
        fetch('/api/anomalies')
      ])
      const devicesData = await devicesRes.json()
      const anomaliesData = await anomaliesRes.json()
      
      setDevices(devicesData)
      setAnomalies(anomaliesData)
      
      // Update usage history
      if (Array.isArray(devicesData)) {
        const totalPower = devicesData.reduce((sum, d) => sum + (d.powerW || 0), 0)
        setUsageHistory(prev => {
          const newHistory = [...prev, totalPower]
          return newHistory.slice(-60)
        })
      }
    } catch (error) {
      console.error('Failed to fetch data:', error)
    }
  }

  useEffect(() => {
    document.body.className = theme
  }, [theme])

  useEffect(() => {
    fetchData()
    const interval = setInterval(fetchData, 1500)
    return () => clearInterval(interval)
  }, [])

  const totalPower = Array.isArray(devices) ? devices.reduce((sum, d) => sum + (d.powerW || 0), 0) : 0
  const isHighUsage = totalPower > 500

  return (
    <div className="app">
      <div className="legacy-banner">
        ⚠️ Running in simulation mode - Configure Supabase for full features
      </div>
      
      {theme === 'dark' && (
        <>
          <div className="fog-overlay"></div>
          <div className="particle" style={{ left: '10%' }}></div>
          <div className="particle" style={{ left: '30%' }}></div>
          <div className="particle" style={{ left: '50%' }}></div>
          <div className="particle" style={{ left: '70%' }}></div>
          <div className="particle" style={{ left: '90%' }}></div>
        </>
      )}
      
      <Header theme={theme} onToggleTheme={toggleTheme} />
      
      <div className="main-content">
        <div className="left-panel">
          <div className="card house-map">
            <h2>🏚️ House Map</h2>
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
            <UsageGauge totalPower={totalPower} deviceCount={devices.length} isHighUsage={isHighUsage} />
          </div>
          <div className="card">
            <h2>🔌 Devices</h2>
            <DeviceList devices={devices} />
          </div>
          <div className="card anomaly-panel" style={{ marginTop: '1rem' }}>
            <h2>⚠️ Anomalies ({anomalies.length})</h2>
            <AnomalyPanel anomalies={anomalies} devices={devices} />
          </div>
        </div>
      </div>
    </div>
  )
}

export default LegacyDashboard
