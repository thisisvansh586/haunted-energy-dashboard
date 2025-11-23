import { useState, useEffect } from 'react'
import { useAuthStore } from '../store/authStore'
import './DeviceManagementModal.css'

/**
 * Device Management Modal
 * Create, edit, and delete devices
 * 
 * Feature: haunted-energy-phase2
 * Requirements: 4.1, 4.3, 4.4
 */
function DeviceManagementModal({ device, homeId, onClose, onSave, onDelete }) {
  const { getToken } = useAuthStore()
  const [formData, setFormData] = useState({
    name: '',
    type: 'appliance',
    icon: '⚡',
    room: '',
    base_power: 100,
    idle_threshold: 5,
    state: 'off'
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const isEditMode = !!device

  useEffect(() => {
    if (device) {
      setFormData({
        name: device.name || '',
        type: device.type || 'appliance',
        icon: device.icon || '⚡',
        room: device.room || '',
        base_power: device.base_power || 100,
        idle_threshold: device.idle_threshold || 5,
        state: device.state || 'off'
      })
    }
  }, [device])

  const deviceTypes = [
    { value: 'appliance', label: 'Appliance', icon: '🧊' },
    { value: 'hvac', label: 'HVAC', icon: '❄️' },
    { value: 'lighting', label: 'Lighting', icon: '💡' },
    { value: 'electronics', label: 'Electronics', icon: '📺' },
    { value: 'entertainment', label: 'Entertainment', icon: '🎮' }
  ]

  const deviceIcons = ['⚡', '🧊', '📺', '❄️', '🌀', '💡', '🔌', '🎮', '💻', '🖨️', '📱', '🔊', '🎵', '🌡️', '🔥']

  const rooms = [
    'Kitchen',
    'Living Room',
    'Bedroom',
    'Bathroom',
    'Laundry Room',
    'Garage',
    'Office',
    'Study',
    'Dining Room',
    'Basement',
    'Attic'
  ]

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: name === 'base_power' || name === 'idle_threshold' 
        ? parseFloat(value) || 0 
        : value
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      const token = await getToken()
      const url = isEditMode
        ? `${import.meta.env.VITE_API_URL || 'http://localhost:3002'}/api/devices/${device.id}`
        : `${import.meta.env.VITE_API_URL || 'http://localhost:3002'}/api/devices`

      const method = isEditMode ? 'PUT' : 'POST'
      const body = isEditMode ? formData : { ...formData, home_id: homeId }

      const response = await fetch(url, {
        method,
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(body)
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Failed to save device')
      }

      const data = await response.json()
      if (onSave) {
        onSave(data.device)
      }
      onClose()
    } catch (err) {
      console.error('Error saving device:', err)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this device?')) {
      return
    }

    setLoading(true)
    setError(null)

    try {
      const token = await getToken()
      const response = await fetch(
        `${import.meta.env.VITE_API_URL || 'http://localhost:3002'}/api/devices/${device.id}`,
        {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      )

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Failed to delete device')
      }

      if (onDelete) {
        onDelete(device.id)
      }
      onClose()
    } catch (err) {
      console.error('Error deleting device:', err)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>{isEditMode ? '⚙️ Edit Device' : '➕ Add Device'}</h2>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>

        <form onSubmit={handleSubmit} className="device-form">
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="name">Device Name *</label>
              <input
                id="name"
                name="name"
                type="text"
                value={formData.name}
                onChange={handleChange}
                placeholder="e.g., Living Room TV"
                required
                disabled={loading}
              />
            </div>

            <div className="form-group">
              <label htmlFor="type">Type *</label>
              <select
                id="type"
                name="type"
                value={formData.type}
                onChange={handleChange}
                required
                disabled={loading}
              >
                {deviceTypes.map(type => (
                  <option key={type.value} value={type.value}>
                    {type.icon} {type.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="room">Room *</label>
              <select
                id="room"
                name="room"
                value={formData.room}
                onChange={handleChange}
                required
                disabled={loading}
              >
                <option value="">Select a room</option>
                {rooms.map(room => (
                  <option key={room} value={room}>
                    {room}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="icon">Icon</label>
              <select
                id="icon"
                name="icon"
                value={formData.icon}
                onChange={handleChange}
                disabled={loading}
              >
                {deviceIcons.map(icon => (
                  <option key={icon} value={icon}>
                    {icon}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="base_power">
                Base Power (W) *
                <span className="help-text">Power when device is ON</span>
              </label>
              <input
                id="base_power"
                name="base_power"
                type="number"
                min="0"
                step="0.1"
                value={formData.base_power}
                onChange={handleChange}
                required
                disabled={loading}
              />
            </div>

            <div className="form-group">
              <label htmlFor="idle_threshold">
                Idle Threshold (W) *
                <span className="help-text">Max power when OFF/standby</span>
              </label>
              <input
                id="idle_threshold"
                name="idle_threshold"
                type="number"
                min="0"
                step="0.1"
                value={formData.idle_threshold}
                onChange={handleChange}
                required
                disabled={loading}
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="state">Initial State</label>
            <select
              id="state"
              name="state"
              value={formData.state}
              onChange={handleChange}
              disabled={loading}
            >
              <option value="off">Off</option>
              <option value="on">On</option>
              <option value="standby">Standby</option>
            </select>
          </div>

          {error && (
            <div className="form-error">
              ⚠️ {error}
            </div>
          )}

          <div className="modal-actions">
            {isEditMode && (
              <button
                type="button"
                onClick={handleDelete}
                disabled={loading}
                className="delete-button"
              >
                🗑️ Delete
              </button>
            )}
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="cancel-button"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="save-button"
            >
              {loading ? 'Saving...' : isEditMode ? 'Save Changes' : 'Add Device'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default DeviceManagementModal
