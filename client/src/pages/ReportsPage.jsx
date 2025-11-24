import { useState, useEffect } from 'react'
import { useAuthStore } from '../store/authStore'
import Navigation from '../components/Navigation'
import './ReportsPage.css'

function ReportsPage() {
  const { user, signOut, getToken } = useAuthStore()
  const [period, setPeriod] = useState('weekly')
  const [report, setReport] = useState(null)
  const [selectedHomeId, setSelectedHomeId] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  // Get selected home from localStorage
  useEffect(() => {
    const homeId = localStorage.getItem('selectedHomeId')
    if (homeId) {
      setSelectedHomeId(homeId)
    }
  }, [])

  const fetchReport = async () => {
    if (!selectedHomeId) {
      setError('Please select a home first')
      return
    }

    setLoading(true)
    setError(null)

    try {
      const token = await getToken()
      const res = await fetch(`/api/reports?homeId=${selectedHomeId}&period=${period}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      })

      if (!res.ok) {
        throw new Error('Failed to fetch report')
      }

      const data = await res.json()
      setReport(data)
    } catch (err) {
      console.error('Error fetching report:', err)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (selectedHomeId) {
      fetchReport()
    }
  }, [period, selectedHomeId])

  if (!selectedHomeId) {
    return (
      <div className="app">
        <Navigation user={user} onLogout={signOut} />
        <div className="reports-page">
          <h1>📈 Energy Reports</h1>
          <div className="empty-state">
            <p>Please select a home from the dashboard to view reports</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="app">
      <Navigation user={user} onLogout={signOut} />
      <div className="reports-page">
        <h1>📈 Energy Reports</h1>
        
        <div className="period-tabs">
          <button 
            className={period === 'weekly' ? 'active' : ''} 
            onClick={() => setPeriod('weekly')}
            disabled={loading}
          >
            📅 Weekly
          </button>
          <button 
            className={period === 'monthly' ? 'active' : ''} 
            onClick={() => setPeriod('monthly')}
            disabled={loading}
          >
            📆 Monthly
          </button>
          <button 
            onClick={fetchReport}
            disabled={loading}
            className="refresh-btn"
          >
            {loading ? '⏳ Loading...' : '🔄 Refresh'}
          </button>
        </div>

        {error && (
          <div className="error-message">
            ⚠️ {error}
          </div>
        )}

        {loading && !report && (
          <div className="loading-state">
            <div className="loading-spinner"></div>
            <p>Generating {period} report...</p>
          </div>
        )}

        {report && (
          <>
            <div className="report-header">
              <div className="report-period">
                <span className="period-label">{period === 'weekly' ? '7 Days' : '30 Days'}</span>
                <span className="period-dates">
                  {new Date(report.start_date).toLocaleDateString()} - {new Date(report.end_date).toLocaleDateString()}
                </span>
              </div>
              <div className="kwh-rate">
                Rate: ${report.kwh_rate}/kWh
              </div>
            </div>

            <div className="report-summary">
              <div className="summary-card total-kwh">
                <div className="card-icon">⚡</div>
                <div className="card-content">
                  <h3>Total Energy</h3>
                  <p className="card-value">{report.total_kwh}</p>
                  <span className="card-unit">kWh</span>
                </div>
              </div>
              
              <div className="summary-card avg-kwh">
                <div className="card-icon">📊</div>
                <div className="card-content">
                  <h3>Daily Average</h3>
                  <p className="card-value">{report.avg_daily_kwh}</p>
                  <span className="card-unit">kWh/day</span>
                </div>
              </div>
              
              <div className="summary-card cost">
                <div className="card-icon">💰</div>
                <div className="card-content">
                  <h3>Total Cost</h3>
                  <p className="card-value">${report.cost_estimate}</p>
                  <span className="card-unit">{period === 'weekly' ? 'per week' : 'per month'}</span>
                </div>
              </div>
              
              <div className="summary-card peak">
                <div className="card-icon">🔥</div>
                <div className="card-content">
                  <h3>Peak Usage</h3>
                  <p className="card-value">{report.peak_usage}</p>
                  <span className="card-unit">W</span>
                </div>
              </div>
            </div>

            {report.device_breakdown && report.device_breakdown.length > 0 && (
              <div className="device-breakdown">
                <h2>🏆 Top Energy Consumers</h2>
                <div className="device-list">
                  {report.device_breakdown.map((device, index) => (
                    <div key={device.device_id} className="device-item">
                      <div className="device-rank">#{index + 1}</div>
                      <div className="device-info">
                        <span className="device-icon">{device.icon}</span>
                        <span className="device-name">{device.name}</span>
                      </div>
                      <div className="device-stats">
                        <div className="device-kwh">
                          <span className="stat-value">{device.kwh}</span>
                          <span className="stat-unit">kWh</span>
                        </div>
                        <div className="device-cost">
                          <span className="cost-value">${device.cost}</span>
                        </div>
                      </div>
                      <div 
                        className="device-bar"
                        style={{
                          width: `${(parseFloat(device.kwh) / parseFloat(report.device_breakdown[0].kwh)) * 100}%`
                        }}
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {(!report.device_breakdown || report.device_breakdown.length === 0) && (
              <div className="empty-state">
                <p>No device data available for this period</p>
              </div>
            )}

            <div className="report-insights">
              <h2>💡 Insights & Recommendations</h2>
              <div className="insights-grid">
                {parseFloat(report.total_kwh) > 0 && (
                  <>
                    <div className="insight-card">
                      <div className="insight-icon">🌱</div>
                      <div className="insight-content">
                        <h4>Carbon Footprint</h4>
                        <p>~{(parseFloat(report.total_kwh) * 0.92).toFixed(2)} lbs CO₂</p>
                        <span className="insight-note">Based on average grid emissions</span>
                      </div>
                    </div>

                    <div className="insight-card">
                      <div className="insight-icon">💡</div>
                      <div className="insight-content">
                        <h4>Efficiency Tip</h4>
                        <p>
                          {parseFloat(report.avg_daily_kwh) > 30 
                            ? 'Consider reducing standby power consumption'
                            : 'Great job! Your usage is efficient'}
                        </p>
                      </div>
                    </div>

                    <div className="insight-card">
                      <div className="insight-icon">📈</div>
                      <div className="insight-content">
                        <h4>Projected {period === 'weekly' ? 'Monthly' : 'Yearly'} Cost</h4>
                        <p>
                          ${period === 'weekly' 
                            ? (parseFloat(report.cost_estimate) * 4.33).toFixed(2)
                            : (parseFloat(report.cost_estimate) * 12).toFixed(2)}
                        </p>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  )
}

export default ReportsPage
