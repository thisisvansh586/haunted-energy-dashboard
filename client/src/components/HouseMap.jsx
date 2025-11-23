function HouseMap({ devices }) {
  const rooms = {
    'Kitchen': { x: 50, y: 50 },
    'Living Room': { x: 250, y: 50 },
    'Bedroom': { x: 450, y: 50 },
    'Laundry Room': { x: 50, y: 200 },
    'Study': { x: 250, y: 200 }
  }

  // Calculate total power consumption per room
  const calculateRoomPower = (roomName) => {
    return devices
      .filter(d => d.room === roomName)
      .reduce((sum, d) => sum + d.powerW, 0)
  }

  // Get glow class based on room power
  const getRoomGlowClass = (power) => {
    if (power < 100) return 'room-glow-dim'
    if (power < 300) return 'room-glow-medium'
    return 'room-glow-bright'
  }

  const getStateColor = (state) => {
    switch (state) {
      case 'on': return '#22c55e'
      case 'off': return '#6b7280'
      case 'standby': return '#eab308'
      default: return '#6b7280'
    }
  }

  return (
    <svg viewBox="0 0 600 350" style={{ width: '100%', height: '100%' }}>
      {/* Room rectangles */}
      {Object.entries(rooms).map(([room, pos]) => {
        const roomPower = calculateRoomPower(room)
        const glowClass = roomPower > 0 ? getRoomGlowClass(roomPower) : ''
        
        return (
        <g key={room} className={glowClass}>
          <rect
            x={pos.x}
            y={pos.y}
            width={150}
            height={120}
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeDasharray="5,5"
            opacity="0.3"
          />
          <text
            x={pos.x + 75}
            y={pos.y + 15}
            textAnchor="middle"
            fontSize="12"
            opacity="0.6"
            fill="currentColor"
          >
            {room}
          </text>
          {roomPower > 0 && (
            <text
              x={pos.x + 75}
              y={pos.y + 135}
              textAnchor="middle"
              fontSize="11"
              fill="#00FF9C"
              fontWeight="bold"
            >
              {roomPower.toFixed(0)}W
            </text>
          )}
        </g>
        )
      })}

      {/* Device icons */}
      {devices.map((device) => {
        const room = rooms[device.room]
        if (!room) return null
        
        return (
          <g key={device.id}>
            <circle
              cx={room.x + 75}
              cy={room.y + 70}
              r="20"
              fill={getStateColor(device.state)}
              opacity="0.8"
            />
            <text
              x={room.x + 75}
              y={room.y + 75}
              textAnchor="middle"
              fontSize="20"
            >
              {device.name.includes('Fridge') ? '🧊' :
               device.name.includes('TV') ? '📺' :
               device.name.includes('AC') ? '❄️' :
               device.name.includes('Washer') ? '🌀' :
               device.name.includes('Lamp') ? '💡' : '⚡'}
            </text>
            <text
              x={room.x + 75}
              y={room.y + 100}
              textAnchor="middle"
              fontSize="10"
              fill="currentColor"
            >
              {device.powerW.toFixed(0)}W
            </text>
          </g>
        )
      })}
    </svg>
  )
}

export default HouseMap
