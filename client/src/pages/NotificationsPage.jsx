import { useState, useEffect } from 'react'
import { useAuthStore } from '../store/authStore'
import Navigation from '../components/Navigation'
import './NotificationsPage.css'

function NotificationsPage() {
  const { user, signOut, getToken } = useAuthStore()
  const [notifications, setNotifications] = useState([])
  const [filter, setFilter] = useState('all') // 'all', 'unread', 'read'
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const fetchNotifications = async () => {
    setLoading(true)
    setError(null)

    try {
      const token = await getToken()
      const url = filter === 'all' 
        ? '/api/notifications'
        : `/api/notifications?read=${filter === 'read'}`
      
      const res = await fetch(url, {
        headers: { 'Authorization': `Bearer ${token}` }
      })

      if (!res.ok) {
        throw new Error('Failed to fetch notifications')
      }

      const data = await res.json()
      setNotifications(data.notifications || [])
    } catch (err) {
      console.error('Error fetching notifications:', err)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const markAsRead = async (id) => {
    try {
      const token = await getToken()
      await fetch(`/api/notifications/${id}/read`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      })
      
      // Update local state
      setNotifications(prev => 
        prev.map(n => n.id === id ? { ...n, read: true } : n)
      )
    } catch (err) {
      console.error('Error marking as read:', err)
    }
  }

  const markAllAsRead = async () => {
    try {
      const token = await getToken()
      const unreadNotifications = notifications.filter(n => !n.read)
      
      await Promise.all(
        unreadNotifications.map(n =>
          fetch(`/api/notifications/${n.id}/read`, {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${token}` }
          })
        )
      )
      
      fetchNotifications()
    } catch (err) {
      console.error('Error marking all as read:', err)
    }
  }

  const deleteNotification = async (id) => {
    try {
      const token = await getToken()
      await fetch(`/api/notifications/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      })
      
      // Update local state
      setNotifications(prev => prev.filter(n => n.id !== id))
    } catch (err) {
      console.error('Error deleting notification:', err)
    }
  }

  const deleteAllRead = async () => {
    try {
      const token = await getToken()
      const readNotifications = notifications.filter(n => n.read)
      
      await Promise.all(
        readNotifications.map(n =>
          fetch(`/api/notifications/${n.id}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${token}` }
          })
        )
      )
      
      fetchNotifications()
    } catch (err) {
      console.error('Error deleting read notifications:', err)
    }
  }

  const getLevelIcon = (level) => {
    switch (level) {
      case 'success': return '✅'
      case 'warning': return '⚠️'
      case 'error': return '❌'
      default: return 'ℹ️'
    }
  }

  const getLevelColor = (level) => {
    switch (level) {
      case 'success': return '#00FF9C'
      case 'warning': return '#FF6B35'
      case 'error': return '#D7263D'
      default: return '#4CC9F0'
    }
  }

  const getRelativeTime = (timestamp) => {
    const now = new Date()
    const then = new Date(timestamp)
    const diffMs = now - then
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMs / 3600000)
    const diffDays = Math.floor(diffMs / 86400000)

    if (diffMins < 1) return 'Just now'
    if (diffMins < 60) return `${diffMins}m ago`
    if (diffHours < 24) return `${diffHours}h ago`
    if (diffDays < 7) return `${diffDays}d ago`
    return then.toLocaleDateString()
  }

  useEffect(() => {
    fetchNotifications()
  }, [filter])

  const unreadCount = notifications.filter(n => !n.read).length
  const readCount = notifications.filter(n => n.read).length

  return (
    <div className="app">
      <Navigation user={user} onLogout={signOut} />
      <div className="notifications-page">
        <div className="notifications-header">
          <h1>🔔 Notifications</h1>
          <div className="notifications-stats">
            <span className="stat unread">{unreadCount} unread</span>
            <span className="stat read">{readCount} read</span>
          </div>
        </div>

        <div className="notifications-controls">
          <div className="filter-tabs">
            <button 
              className={filter === 'all' ? 'active' : ''}
              onClick={() => setFilter('all')}
            >
              All ({notifications.length})
            </button>
            <button 
              className={filter === 'unread' ? 'active' : ''}
              onClick={() => setFilter('unread')}
            >
              Unread ({unreadCount})
            </button>
            <button 
              className={filter === 'read' ? 'active' : ''}
              onClick={() => setFilter('read')}
            >
              Read ({readCount})
            </button>
          </div>

          <div className="action-buttons">
            {unreadCount > 0 && (
              <button onClick={markAllAsRead} className="mark-all-btn">
                ✓ Mark All Read
              </button>
            )}
            {readCount > 0 && (
              <button onClick={deleteAllRead} className="delete-all-btn">
                🗑️ Clear Read
              </button>
            )}
            <button onClick={fetchNotifications} className="refresh-btn">
              🔄 Refresh
            </button>
          </div>
        </div>

        {error && (
          <div className="error-message">
            ⚠️ {error}
          </div>
        )}

        {loading && notifications.length === 0 ? (
          <div className="loading-state">
            <div className="loading-spinner"></div>
            <p>Loading notifications...</p>
          </div>
        ) : notifications.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">🔕</div>
            <h2>No notifications</h2>
            <p>
              {filter === 'unread' 
                ? "You're all caught up! No unread notifications."
                : filter === 'read'
                ? "No read notifications to show."
                : "You don't have any notifications yet."}
            </p>
          </div>
        ) : (
          <div className="notifications-list">
            {notifications.map(n => (
              <div 
                key={n.id} 
                className={`notification-item ${n.read ? 'read' : 'unread'} level-${n.level || 'info'}`}
                style={{ '--level-color': getLevelColor(n.level || 'info') }}
              >
                <div className="notification-indicator" />
                <div className="notification-icon">
                  {getLevelIcon(n.level || 'info')}
                </div>
                <div className="notification-content">
                  <div className="notification-header">
                    <h3>{n.title}</h3>
                    <span className="notification-time">
                      {getRelativeTime(n.created_at)}
                    </span>
                  </div>
                  <p>{n.body}</p>
                  {n.data && (
                    <div className="notification-data">
                      {JSON.stringify(n.data, null, 2)}
                    </div>
                  )}
                </div>
                <div className="notification-actions">
                  {!n.read && (
                    <button 
                      onClick={() => markAsRead(n.id)}
                      className="action-btn read-btn"
                      title="Mark as read"
                    >
                      ✓
                    </button>
                  )}
                  <button 
                    onClick={() => deleteNotification(n.id)}
                    className="action-btn delete-btn"
                    title="Delete"
                  >
                    🗑️
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default NotificationsPage
