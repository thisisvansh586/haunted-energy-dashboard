import { useState, useEffect } from 'react'
import { useAuthStore } from '../store/authStore'
import Navigation from '../components/Navigation'
import './NotificationsPage.css'

function NotificationsPage() {
  const { user, signOut, getToken } = useAuthStore()
  const [notifications, setNotifications] = useState([])

  const fetchNotifications = async () => {
    const token = getToken()
    const res = await fetch('/api/notifications', {
      headers: { 'Authorization': `Bearer ${token}` }
    })
    const data = await res.json()
    setNotifications(data.notifications || [])
  }

  const markAsRead = async (id) => {
    const token = getToken()
    await fetch(`/api/notifications/${id}/read`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${token}` }
    })
    fetchNotifications()
  }

  const deleteNotification = async (id) => {
    const token = getToken()
    await fetch(`/api/notifications/${id}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${token}` }
    })
    fetchNotifications()
  }

  useEffect(() => {
    fetchNotifications()
  }, [])

  return (
    <div className="app">
      <Navigation user={user} onLogout={signOut} />
      <div className="notifications-page">
        <h1>🔔 Notifications</h1>
        <div className="notifications-list">
          {notifications.map(n => (
            <div key={n.id} className={`notification-item ${n.read ? 'read' : 'unread'}`}>
              <div className="notification-content">
                <h3>{n.title}</h3>
                <p>{n.body}</p>
                <span className="notification-time">{new Date(n.created_at).toLocaleString()}</span>
              </div>
              <div className="notification-actions">
                {!n.read && <button onClick={() => markAsRead(n.id)}>Mark Read</button>}
                <button onClick={() => deleteNotification(n.id)}>Delete</button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default NotificationsPage
