import { Link, useLocation } from 'react-router-dom'
import NotificationBell from './NotificationBell'
import './Navigation.css'

/**
 * Navigation Component
 * No authentication - simplified navigation bar
 */
function Navigation({ theme, onToggleTheme, notifications = [], onMarkNotificationAsRead }) {
  const location = useLocation()

  return (
    <nav className="navigation">
      <div className="nav-brand">
        <h1>👻 Haunted Energy</h1>
      </div>
      <div className="nav-links">
        <Link to="/dashboard" className={location.pathname === '/dashboard' ? 'active' : ''}>Dashboard</Link>
        <Link to="/history" className={location.pathname === '/history' ? 'active' : ''}>History</Link>
        <Link to="/reports" className={location.pathname === '/reports' ? 'active' : ''}>Reports</Link>
        <Link to="/notifications" className={location.pathname === '/notifications' ? 'active' : ''}>Notifications</Link>
      </div>
      <div className="nav-controls">
        <NotificationBell 
          notifications={notifications} 
          onMarkAsRead={onMarkNotificationAsRead}
        />
        {theme && onToggleTheme && (
          <button className="theme-toggle" onClick={onToggleTheme}>
            {theme === 'light' ? '🌙' : '☀️'}
          </button>
        )}
      </div>
    </nav>
  )
}

export default Navigation
