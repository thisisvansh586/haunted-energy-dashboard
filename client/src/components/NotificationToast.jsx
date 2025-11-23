import { useEffect, useState } from 'react'
import './NotificationToast.css'

/**
 * Notification Toast Component
 * Displays animated toast notifications with Haunted Oracle messages
 * Auto-dismisses after 5 seconds
 * 
 * Feature: haunted-energy-phase2
 * Property 18: Notification triggers toast
 */
function NotificationToast({ notification, onDismiss, onClick }) {
  const [isVisible, setIsVisible] = useState(false)
  const [isExiting, setIsExiting] = useState(false)

  useEffect(() => {
    // Fade in
    setTimeout(() => setIsVisible(true), 10)

    // Auto-dismiss after 5 seconds
    const timer = setTimeout(() => {
      handleDismiss()
    }, 5000)

    return () => clearTimeout(timer)
  }, [])

  const handleDismiss = () => {
    setIsExiting(true)
    setTimeout(() => {
      onDismiss()
    }, 300)
  }

  const handleClick = () => {
    if (onClick) {
      onClick(notification)
    }
    handleDismiss()
  }

  const getLevelClass = (level) => {
    switch (level) {
      case 'error':
        return 'toast-error'
      case 'warning':
        return 'toast-warning'
      case 'success':
        return 'toast-success'
      default:
        return 'toast-info'
    }
  }

  return (
    <div
      className={`notification-toast ${getLevelClass(notification.level)} ${
        isVisible && !isExiting ? 'toast-visible' : ''
      } ${isExiting ? 'toast-exiting' : ''}`}
      onClick={handleClick}
    >
      <div className="toast-header">
        <span className="toast-icon">
          {notification.level === 'error' && '⚠️'}
          {notification.level === 'warning' && '👻'}
          {notification.level === 'success' && '✨'}
          {notification.level === 'info' && '🔮'}
        </span>
        <h4 className="toast-title">{notification.title}</h4>
        <button
          className="toast-close"
          onClick={(e) => {
            e.stopPropagation()
            handleDismiss()
          }}
          aria-label="Dismiss"
        >
          ×
        </button>
      </div>
      <p className="toast-body">{notification.body}</p>
    </div>
  )
}

export default NotificationToast
