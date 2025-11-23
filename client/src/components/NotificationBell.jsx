import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '../store/authStore'
import './NotificationBell.css'

/**
 * Notification Bell Component
 * Displays icon with unread count badge
 * Shows dropdown with recent notifications
 * 
 * Feature: haunted-energy-phase2
 * Property 30: Notification count accuracy
 */
function NotificationBell({ notifications = [], onMarkAsRead }) {
  const [isOpen, setIsOpen] = useState(false)
  const [unreadCount, setUnreadCount] = useState(0)
  const navigate = useNavigate()
  const { getToken } = useAuthStore()

  useEffect(() => {
    const count = notifications.filter(n => !n.read).length
    setUnreadCount(count)
  }, [notifications])

  const handleBellClick = () => {
    setIsOpen(!isOpen)
  }

  const handleNotificationClick = async (notification) => {
    // Mark as read
    if (!notification.read && onMarkAsRead) {
      await onMarkAsRead(notification.id)
    }

    // Navigate to notifications page
    setIsOpen(false)
    navigate('/notifications')
  }

  const handleViewAll = () => {
    setIsOpen(false)
    navigate('/notifications')
  }

  // Get recent notifications (last 5)
  const recentNotifications = notifications
    .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
    .slice(0, 5)

  return (
    <div className="notification-bell-container">
      <button
        className="notification-bell"
        onClick={handleBellClick}
        aria-label="Notifications"
      >
        🔔
        {unreadCount > 0 && (
          <span className="notification-badge">{unreadCount > 99 ? '99+' : unreadCount}</span>
        )}
      </button>

      {isOpen && (
        <>
          <div className="notification-overlay" onClick={() => setIsOpen(false)} />
          <div className="notification-dropdown">
            <div className="notification-dropdown-header">
              <h3>Notifications</h3>
              {unreadCount > 0 && (
                <span className="unread-count">{unreadCount} unread</span>
              )}
            </div>

            <div className="notification-dropdown-list">
              {recentNotifications.length === 0 ? (
                <div className="notification-empty">
                  <p>No notifications yet</p>
                  <span>👻</span>
                </div>
              ) : (
                recentNotifications.map((notification) => (
                  <div
                    key={notification.id}
                    className={`notification-item ${!notification.read ? 'unread' : ''}`}
                    onClick={() => handleNotificationClick(notification)}
                  >
                    <div className="notification-item-icon">
                      {notification.level === 'error' && '⚠️'}
                      {notification.level === 'warning' && '👻'}
                      {notification.level === 'success' && '✨'}
                      {notification.level === 'info' && '🔮'}
                    </div>
                    <div className="notification-item-content">
                      <h4>{notification.title}</h4>
                      <p>{notification.body}</p>
                      <span className="notification-time">
                        {formatTimeAgo(notification.created_at)}
                      </span>
                    </div>
                    {!notification.read && <div className="notification-dot" />}
                  </div>
                ))
              )}
            </div>

            {recentNotifications.length > 0 && (
              <div className="notification-dropdown-footer">
                <button onClick={handleViewAll} className="view-all-button">
                  View All Notifications
                </button>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  )
}

// Helper function to format time ago
function formatTimeAgo(timestamp) {
  const now = new Date()
  const then = new Date(timestamp)
  const seconds = Math.floor((now - then) / 1000)

  if (seconds < 60) return 'Just now'
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`
  if (seconds < 604800) return `${Math.floor(seconds / 86400)}d ago`
  return then.toLocaleDateString()
}

export default NotificationBell
