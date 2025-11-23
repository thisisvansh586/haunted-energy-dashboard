// Helper function to format timestamps as relative time
function formatRelativeTime(timestamp) {
  const now = Date.now()
  const then = new Date(timestamp).getTime()
  const diffMs = now - then
  
  const minutes = Math.floor(diffMs / (1000 * 60))
  const hours = Math.floor(diffMs / (1000 * 60 * 60))
  const days = Math.floor(diffMs / (1000 * 60 * 60 * 24))
  
  if (minutes < 60) {
    return `${minutes}m ago`
  } else if (hours < 24) {
    return `${hours}h ago`
  } else {
    return `${days}d ago`
  }
}

import { useState, useEffect } from 'react'

function AnomalyPanel({ anomalies, devices }) {
  const [glitchIds, setGlitchIds] = useState(new Set())

  // Trigger glitch animation for new anomalies
  useEffect(() => {
    const newIds = anomalies.map(a => a.id)
    const newAnomalies = newIds.filter(id => !glitchIds.has(id))
    
    if (newAnomalies.length > 0) {
      setGlitchIds(new Set(newIds))
      
      // Remove glitch class after animation completes
      const timer = setTimeout(() => {
        setGlitchIds(new Set())
      }, 300)
      
      return () => clearTimeout(timer)
    }
  }, [anomalies])

  // Show empty state when no anomalies
  if (anomalies.length === 0) {
    return (
      <div style={{ textAlign: 'center', opacity: 0.6, padding: '2rem' }}>
        👻 No anomalies detected - all systems normal!
      </div>
    )
  }

  return (
    <div className="anomaly-list">
      {anomalies.map((anomaly) => {
        // Look up device name by deviceId
        const device = devices.find(d => d.id === anomaly.deviceId)
        const deviceName = device ? device.name : 'Unknown Device'
        const shouldGlitch = glitchIds.has(anomaly.id)
        
        return (
          <div key={anomaly.id} className={`anomaly-item ${anomaly.severity} ${shouldGlitch ? 'glitch' : ''}`}>
            <div className="anomaly-header">
              <span className="anomaly-type" style={{ fontSize: '1.1rem', fontWeight: 'bold' }}>
                {anomaly.title || (anomaly.type === 'phantom_load' ? '👻 Phantom Load' : '⚡ Power Spike')}
              </span>
              <span className={`anomaly-severity ${anomaly.severity}`}>
                {anomaly.severity}
              </span>
            </div>
            
            <div className="anomaly-device" style={{ marginBottom: '0.75rem' }}>
              📍 {deviceName}
            </div>
            
            <div className="anomaly-details" style={{ fontStyle: 'italic', marginBottom: '0.5rem', opacity: 0.9 }}>
              {anomaly.details.description}
            </div>
            
            {anomaly.details.remediation && (
              <div className="anomaly-details" style={{ 
                padding: '0.5rem', 
                background: 'rgba(0, 255, 156, 0.05)', 
                borderLeft: '3px solid var(--neon-green)',
                marginBottom: '0.5rem',
                fontSize: '0.85rem'
              }}>
                💡 {anomaly.details.remediation}
              </div>
            )}
            
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '0.5rem' }}>
              <div className="anomaly-details" style={{ margin: 0 }}>
                💰 {anomaly.details.estimatedCost}
              </div>
              <div className="anomaly-timestamp">
                {formatRelativeTime(anomaly.timestamp)}
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}

export default AnomalyPanel
export { formatRelativeTime }
