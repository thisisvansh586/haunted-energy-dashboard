import { useState, useEffect, useMemo } from 'react'
import { useAuthStore } from '../store/authStore'
import Navigation from '../components/Navigation'
import './HistoryPage.css'

function HistoryPage() {
  const { user, signOut, getToken } = useAuthStore()
  const [telemetry, setTelemetry] = useState([])
  const [devices, setDevices] = useState([])
  const [selectedHomeId, setSelectedHomeId] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  
  const [startDate, setStartDate] = useState(() => {
    const date = new Date()
    date.setDate(date.getDate() - 7)
    return date.toISOString().split('T')[0]
  })
  const [endDate, setEndDate] = useState(() => new Date().toISOString().split('T')[0])

  // Get selected home from localStorage
  useEffect(() => {
    const homeId = localStorage.getItem('selectedHomeId')
    if (homeId) {
      setSelectedHomeId(homeId)
    }
  }, [])

  // Fetch devices for device name lookup
  useEffect(() => {
    if (!selectedHomeId) return

    const fetchDevices = async () => {
      try {
        const token = await getToken()
        const res = await fetch(`/api/devices?homeId=${selectedHomeId}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        })
        const data = await res.json()
        setDevices(data.devices || [])
      } catch (err) {
        console.error('Error fetching devices:', err)
      }
    }

    fetchDevices()
  }, [selectedHomeId, getToken])

  // Fetch telemetry data
  const fetchTelemetry = async () => {
    if (!selectedHomeId) {
      setError('Please select a home first')
      return
    }

    setLoading(true)
    setError(null)

    try {
      const token = await getToken()
      const startISO = new Date(startDate).toISOString()
      const endISO = new Date(endDate + 'T23:59:59').toISOString()
      
      const res = await fetch(
        `/api/telemetry?homeId=${selectedHomeId}&since=${startISO}&limit=10000`,
        {
          headers: { 'Authorization': `Bearer ${token}` }
        }
      )
      
      if (!res.ok) {
        throw new Error('Failed to fetch telemetry')
      }

      const data = await res.json()
      
      // Filter by end date on client side
      const filtered = (data.telemetry || []).filter(t => {
        const timestamp = new Date(t.created_at)
        return timestamp <= new Date(endISO)
      })
      
      setTelemetry(filtered)
    } catch (err) {
      console.error('Error fetching telemetry:', err)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  // Aggregate data if too many points (>1000)
  const aggregatedData = useMemo(() => {
    if (telemetry.length <= 1000) {
      return telemetry
    }

    // Aggregate by hour
    const hourlyMap = new Map()
    
    telemetry.forEach(reading => {
      const hour = new Date(reading.created_at)
      hour.setMinutes(0, 0, 0)
      const key = hour.toISOString()
      
      if (!hourlyMap.has(key)) {
        hourlyMap.set(key, { total: 0, count: 0, timestamp: key })
      }
      
      const bucket = hourlyMap.get(key)
      bucket.total += reading.power_w
      bucket.count++
    })

    return Array.from(hourlyMap.values()).map(bucket => ({
      created_at: bucket.timestamp,
      power_w: bucket.total / bucket.count,
      aggregated: true
    }))
  }, [telemetry])

  // Export to CSV
  const exportCSV = () => {
    if (telemetry.length === 0) {
      alert('No data to export')
      return
    }

    const deviceMap = new Map(devices.map(d => [d.id, d.name]))
    
    const csv = [
      ['Timestamp', 'Device ID', 'Device Name', 'Power (W)', 'Total (W)'],
      ...telemetry.map(t => [
        t.created_at,
        t.device_id || 'N/A',
        deviceMap.get(t.device_id) || 'Unknown',
        t.power_w.toFixed(2),
        t.total_w?.toFixed(2) || t.power_w.toFixed(2)
      ])
    ].map(row => row.join(',')).join('\n')
    
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `energy-history-${startDate}-to-${endDate}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  // Calculate summary stats
  const stats = useMemo(() => {
    if (telemetry.length === 0) return null

    const totalReadings = telemetry.length
    const avgPower = telemetry.reduce((sum, t) => sum + t.power_w, 0) / totalReadings
    const maxPower = Math.max(...telemetry.map(t => t.power_w))
    const minPower = Math.min(...telemetry.map(t => t.power_w))

    return {
      totalReadings,
      avgPower: avgPower.toFixed(1),
      maxPower: maxPower.toFixed(1),
      minPower: minPower.toFixed(1)
    }
  }, [telemetry])

  useEffect(() => {
    if (selectedHomeId) {
      fetchTelemetry()
    }
  }, [startDate, endDate, selectedHomeId])

  if (!selectedHomeId) {
    return (
      <div className="app">
        <Navigation user={user} onLogout={signOut} />
        <div className="history-page">
          <h1>📊 Energy History</h1>
          <div className="empty-state">
            <p>Please select a home from the dashboard to view history</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="app">
      <Navigation user={user} onLogout={signOut} />
      <div className="history-page">
        <h1>📊 Energy History</h1>
        
        <div className="date-controls">
          <div className="date-inputs">
            <label>
              Start Date:
              <input 
                type="date" 
                value={startDate} 
                onChange={e => setStartDate(e.target.value)}
                max={endDate}
              />
            </label>
            <label>
              End Date:
              <input 
                type="date" 
                value={endDate} 
                onChange={e => setEndDate(e.target.value)}
                min={startDate}
                max={new Date().toISOString().split('T')[0]}
              />
            </label>
          </div>
          <div className="control-buttons">
            <button onClick={fetchTelemetry} disabled={loading}>
              {loading ? 'Loading...' : '🔄 Refresh'}
            </button>
            <button onClick={exportCSV} disabled={telemetry.length === 0}>
              📥 Export CSV
            </button>
          </div>
        </div>

        {error && (
          <div className="error-message">
            ⚠️ {error}
          </div>
        )}

        {stats && (
          <div className="stats-summary">
            <div className="stat-card">
              <span className="stat-label">Total Readings</span>
              <span className="stat-value">{stats.totalReadings}</span>
            </div>
            <div className="stat-card">
              <span className="stat-label">Avg Power</span>
              <span className="stat-value">{stats.avgPower} W</span>
            </div>
            <div className="stat-card">
              <span className="stat-label">Peak Power</span>
              <span className="stat-value">{stats.maxPower} W</span>
            </div>
            <div className="stat-card">
              <span className="stat-label">Min Power</span>
              <span className="stat-value">{stats.minPower} W</span>
            </div>
          </div>
        )}

        {aggregatedData.length > 0 && aggregatedData[0].aggregated && (
          <div className="aggregation-notice">
            ℹ️ Data aggregated by hour ({telemetry.length} readings → {aggregatedData.length} points)
          </div>
        )}

        <div className="telemetry-chart">
          <h2>Power Consumption Over Time</h2>
          {loading ? (
            <div className="loading-state">Loading data...</div>
          ) : aggregatedData.length === 0 ? (
            <div className="empty-state">No data available for selected date range</div>
          ) : (
            <div className="simple-chart">
              {aggregatedData.slice(0, 100).map((reading, idx) => (
                <div 
                  key={idx} 
                  className="chart-bar"
                  style={{ 
                    height: `${Math.min(100, (reading.power_w / (stats ? parseFloat(stats.maxPower) : 1)) * 100)}%`,
                    opacity: 0.7 + (reading.power_w / (stats ? parseFloat(stats.maxPower) : 1)) * 0.3
                  }}
                  title={`${new Date(reading.created_at).toLocaleString()}: ${reading.power_w.toFixed(1)}W`}
                />
              ))}
            </div>
          )}
        </div>

        <div className="telemetry-table">
          <h2>Detailed Readings</h2>
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Timestamp</th>
                  <th>Power (W)</th>
                  <th>Total (W)</th>
                </tr>
              </thead>
              <tbody>
                {aggregatedData.slice(0, 500).map((t, idx) => (
                  <tr key={idx}>
                    <td>{new Date(t.created_at).toLocaleString()}</td>
                    <td>{t.power_w.toFixed(1)}</td>
                    <td>{t.total_w?.toFixed(1) || t.power_w.toFixed(1)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            {aggregatedData.length > 500 && (
              <div className="table-footer">
                Showing first 500 of {aggregatedData.length} readings. Export CSV for full data.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default HistoryPage
