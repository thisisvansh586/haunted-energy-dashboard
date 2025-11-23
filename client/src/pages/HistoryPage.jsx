import { useState, useEffect } from 'react'
import { useAuthStore } from '../store/authStore'
import Navigation from '../components/Navigation'
import './HistoryPage.css'

function HistoryPage() {
  const { user, signOut, getToken } = useAuthStore()
  const [telemetry, setTelemetry] = useState([])
  const [startDate, setStartDate] = useState(() => {
    const date = new Date()
    date.setDate(date.getDate() - 7)
    return date.toISOString().split('T')[0]
  })
  const [endDate, setEndDate] = useState(() => new Date().toISOString().split('T')[0])

  const fetchTelemetry = async () => {
    const token = getToken()
    const res = await fetch(`/api/telemetry?homeId=xxx&since=${startDate}`, {
      headers: { 'Authorization': `Bearer ${token}` }
    })
    const data = await res.json()
    setTelemetry(data.telemetry || [])
  }

  const exportCSV = () => {
    const csv = [
      ['Timestamp', 'Device ID', 'Power (W)'],
      ...telemetry.map(t => [t.created_at, t.device_id, t.power_w])
    ].map(row => row.join(',')).join('\n')
    
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `telemetry-${startDate}-${endDate}.csv`
    a.click()
  }

  useEffect(() => {
    fetchTelemetry()
  }, [startDate, endDate])

  return (
    <div className="app">
      <Navigation user={user} onLogout={signOut} />
      <div className="history-page">
        <h1>📊 Energy History</h1>
        <div className="date-controls">
          <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} />
          <input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} />
          <button onClick={exportCSV}>Export CSV</button>
        </div>
        <div className="telemetry-list">
          {telemetry.map(t => (
            <div key={t.id} className="telemetry-item">
              <span>{new Date(t.created_at).toLocaleString()}</span>
              <span>{t.power_w.toFixed(1)} W</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default HistoryPage
