import { useState, useEffect } from 'react'
import { useAuthStore } from '../store/authStore'
import Navigation from '../components/Navigation'
import './ReportsPage.css'

function ReportsPage() {
  const { user, signOut, getToken } = useAuthStore()
  const [period, setPeriod] = useState('weekly')
  const [report, setReport] = useState(null)

  const fetchReport = async () => {
    const token = getToken()
    const res = await fetch(`/api/reports?homeId=xxx&period=${period}`, {
      headers: { 'Authorization': `Bearer ${token}` }
    })
    const data = await res.json()
    setReport(data)
  }

  useEffect(() => {
    fetchReport()
  }, [period])

  return (
    <div className="app">
      <Navigation user={user} onLogout={signOut} />
      <div className="reports-page">
        <h1>📈 Energy Reports</h1>
        <div className="period-tabs">
          <button className={period === 'weekly' ? 'active' : ''} onClick={() => setPeriod('weekly')}>Weekly</button>
          <button className={period === 'monthly' ? 'active' : ''} onClick={() => setPeriod('monthly')}>Monthly</button>
        </div>
        {report && (
          <div className="report-summary">
            <div className="summary-card">
              <h3>Total kWh</h3>
              <p>{report.total_kwh}</p>
            </div>
            <div className="summary-card">
              <h3>Avg Daily kWh</h3>
              <p>{report.avg_daily_kwh}</p>
            </div>
            <div className="summary-card">
              <h3>Cost Estimate</h3>
              <p>${report.cost_estimate}</p>
            </div>
            <div className="summary-card">
              <h3>Peak Usage</h3>
              <p>{report.peak_usage} W</p>
            </div>
          </div>
        )}
        {report?.device_breakdown && (
          <div className="device-breakdown">
            <h2>Top Devices</h2>
            {report.device_breakdown.map(d => (
              <div key={d.device_id} className="device-item">
                <span>{d.icon} {d.name}</span>
                <span>{d.kwh} kWh (${d.cost})</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default ReportsPage
