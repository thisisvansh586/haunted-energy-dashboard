function DeviceChart({ devices }) {
  if (!devices || devices.length === 0) {
    return (
      <div style={{ textAlign: 'center', opacity: 0.6, padding: '2rem', animation: 'flicker 2s infinite' }}>
        📊 Waiting for devices...
      </div>
    )
  }

  // Calculate chart dimensions
  const width = 100
  const height = 60
  const padding = 8
  const barWidth = (width - 2 * padding) / devices.length - 1

  // Get max power for scaling
  const maxPower = Math.max(...devices.map(d => d.powerW), 100)

  // Get bar color based on power level
  const getBarColor = (power) => {
    if (power > 200) return '#D7263D' // Danger red
    if (power > 100) return '#FF6B35' // Warning orange
    return '#00FF9C' // Neon green
  }

  return (
    <div style={{ width: '100%', height: '200px' }}>
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

        {/* Bars */}
        {devices.map((device, index) => {
          const barHeight = (device.powerW / maxPower) * (height - 2 * padding - 8)
          const x = padding + index * (barWidth + 1)
          const y = height - padding - barHeight - 8

          return (
            <g key={device.id}>
              {/* Bar */}
              <rect
                x={x}
                y={y}
                width={barWidth}
                height={barHeight}
                fill={getBarColor(device.powerW)}
                opacity="0.8"
                rx="0.5"
              />
              
              {/* Power value on top */}
              <text
                x={x + barWidth / 2}
                y={y - 1}
                fontSize="1.5"
                fill="currentColor"
                textAnchor="middle"
                opacity="0.8"
              >
                {device.powerW.toFixed(0)}
              </text>

              {/* Device name at bottom */}
              <text
                x={x + barWidth / 2}
                y={height - padding - 2}
                fontSize="1.5"
                fill="currentColor"
                textAnchor="middle"
                opacity="0.6"
                transform={`rotate(-45, ${x + barWidth / 2}, ${height - padding - 2})`}
              >
                {device.name.split(' ')[0]}
              </text>
            </g>
          )
        })}

        {/* Y-axis label */}
        <text x={padding} y={padding + 2} fontSize="2" fill="currentColor" opacity="0.6">
          {maxPower.toFixed(0)}W
        </text>
        <text x={padding} y={height - padding - 8} fontSize="2" fill="currentColor" opacity="0.6">
          0W
        </text>
      </svg>
    </div>
  )
}

export default DeviceChart
