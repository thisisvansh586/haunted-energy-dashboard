function UsageChart({ usageHistory }) {
  // Ensure we have data to display
  if (!usageHistory || usageHistory.length === 0) {
    return (
      <div style={{ textAlign: 'center', opacity: 0.6, padding: '2rem', animation: 'flicker 2s infinite' }}>
        📈 Collecting usage data...
      </div>
    )
  }

  // Calculate chart dimensions
  const width = 100
  const height = 60
  const padding = 5

  // Get min and max for scaling
  const maxPower = Math.max(...usageHistory, 100)
  const minPower = 0

  // Create SVG path for line chart
  const points = usageHistory.map((power, index) => {
    const x = padding + (index / (usageHistory.length - 1)) * (width - 2 * padding)
    const y = height - padding - ((power - minPower) / (maxPower - minPower)) * (height - 2 * padding)
    return `${x},${y}`
  }).join(' ')

  return (
    <div style={{ width: '100%', height: '150px' }}>
      <svg viewBox={`0 0 ${width} ${height}`} style={{ width: '100%', height: '100%' }}>
        {/* Grid lines */}
        {[0, 0.25, 0.5, 0.75, 1].map((ratio) => (
          <line
            key={ratio}
            x1={padding}
            y1={padding + ratio * (height - 2 * padding)}
            x2={width - padding}
            y2={padding + ratio * (height - 2 * padding)}
            stroke="currentColor"
            strokeOpacity="0.1"
            strokeWidth="0.2"
          />
        ))}

        {/* Line chart */}
        <polyline
          points={points}
          fill="none"
          stroke="#00FF9C"
          strokeWidth="0.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* Area fill */}
        <polygon
          points={`${padding},${height - padding} ${points} ${width - padding},${height - padding}`}
          fill="#00FF9C"
          fillOpacity="0.2"
        />

        {/* Y-axis labels */}
        <text x={padding} y={padding + 2} fontSize="2" fill="currentColor" opacity="0.6">
          {maxPower.toFixed(0)}W
        </text>
        <text x={padding} y={height - padding} fontSize="2" fill="currentColor" opacity="0.6">
          0W
        </text>

        {/* X-axis label */}
        <text x={width / 2} y={height - 1} fontSize="2" fill="currentColor" opacity="0.6" textAnchor="middle">
          Last {usageHistory.length} readings
        </text>
      </svg>
    </div>
  )
}

export default UsageChart
