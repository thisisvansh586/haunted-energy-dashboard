import { useState } from 'react'
import { useAuthStore } from '../store/authStore'
import DeviceManagementModal from './DeviceManagementModal'
import './DeviceList.css'

/**
 * Enhanced Device List Component
 * Displays devices with control buttons and management options
 * 
 * Feature: haunted-energy-phase2
 * Requirements: 4.2, 4.5, 13.1, 13.2
 */
function DeviceList({ devices, homeId, onDeviceUpdate }) {
  const { getToken } = useAuthStore()
  const [selectedDevice, setSelectedDevice] = useState(null)
  const [showModal, setShowModal] = useState(false)
  const [controllingDevice, setControllingDevice] = useState(null)

  const handleToggleState = async (device) => {
    setControllingDevice(device.id)
    try {
      const token = await getToken()
      const states = ['off', 'standby', 'on']
      const currentIndex = states.indexOf(device.state)
      const nextState = states[(currentIndex + 1) % states.length]

      const response = await fetch(
        `${import.meta.env.VITE_API_URL || 'http://localhost:3002'}/api/devices/${device.id}/toggle`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ state: nextState })
        }
      )

      if (!response.ok) throw new Error('Failed to toggle device')

      const data = await response.json()
      if (onDeviceUpdate) {
        onDeviceUpdate(data.device)
      }
    } catch (error) {
      console.error('Error toggling device:', error)
    } finally {
      setControllingDevice(null)
    }
  }

  const handleEdit = (device) => {
    setSelectedDevice(device)
    setShowModal(true)
  }

  const handleAdd = () => {
    setSelectedDevice(null)
    setShowModal(true)
  }

  const handleSave = (updatedDevice) => {
    if (onDeviceUpdate) {
      onDeviceUpdate(updatedDevice)
    }
  }

  const handleDelete = (deviceId) => {
    if (onDeviceUpdate) {
      onDeviceUpdate({ id: deviceId, _deleted: true })
    }
  }

  return (
    <>
      <div className="device-list">
        <div className="device-list-header">
          <button onClick={handleAdd} className="add-device-button">
            ➕ Add Device
          </button>
        </div>

        {devices.length === 0 ? (
          <div className="device-list-empty">
            <p>No devices yet</p>
            <span>👻</span>
          </div>
        ) : (
          devices.map((device) => {
            const isHighPower = (device.current_power || device.powerW || 0) > 150
            const power = device.current_power || device.powerW || 0
            const isControlling = controllingDevice === device.id

            return (
              <div key={device.id} className={`device-item ${isHighPower ? 'high-power' : ''}`}>
                <div className="device-info">
                  <div className="device-header">
                    <span className="device-icon">{device.icon || '⚡'}</span>
                    <div className="device-name">{device.name}</div>
                  </div>
                  <div className="device-room">📍 {device.room}</div>
                  <div className="device-power">
                    {power.toFixed(1)}W
                  </div>
                </div>

                <div className="device-controls">
                  <button
                    onClick={() => handleToggleState(device)}
                    disabled={isControlling}
                    className={`state-toggle state-${device.state}`}
                    title={`Current: ${device.state} - Click to toggle`}
                  >
                    {isControlling ? '⏳' : device.state}
                  </button>
                  <button
                    onClick={() => handleEdit(device)}
                    className="edit-button"
                    title="Edit device"
                  >
                    ⚙️
                  </button>
                </div>
              </div>
            )
          })
        )}
      </div>

      {showModal && (
        <DeviceManagementModal
          device={selectedDevice}
          homeId={homeId}
          onClose={() => setShowModal(false)}
          onSave={handleSave}
          onDelete={handleDelete}
        />
      )}
    </>
  )
}

export default DeviceList
