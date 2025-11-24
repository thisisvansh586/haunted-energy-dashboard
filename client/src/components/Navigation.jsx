import { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import NotificationBell from './NotificationBell'
import './Navigation.css'

/**
 * Navigation Component
 * Clean navbar with expandable menu on the right
 */
function Navigation({ theme, onToggleTheme, notifications = [], onMarkNotificationAsRead }) {
  const location = useLocation()
  const [menuOpen, setMenuOpen] = useState(false)

  const toggleMenu = () => {
    setMenuOpen(!menuOpen)
  }

  const closeMenu = () => {
    setMenuOpen(false)
  }

  return (
    <nav className="navigation">
      <div className="nav-brand">
        <Link to="/dashboard" onClick={closeMenu}>
          <h1>👻 Haunted Energy</h1>
        </Link>
      </div>
      
      <div className="nav-right">
        <NotificationBell 
          notifications={notifications} 
          onMarkAsRead={onMarkNotificationAsRead}
        />
        
        <button 
          className={`menu-toggle ${menuOpen ? 'open' : ''}`}
          onClick={toggleMenu}
          aria-label="Toggle menu"
        >
          <span></span>
          <span></span>
          <span></span>
        </button>
      </div>

      {/* Expandable Menu */}
      <div className={`nav-menu ${menuOpen ? 'open' : ''}`}>
        <div className="menu-header">
          <div className="user-profile">
            <div className="user-avatar">👤</div>
            <div className="user-info">
              <div className="user-name">Guest User</div>
              <div className="user-role">Demo Mode</div>
            </div>
          </div>
        </div>

        <div className="menu-divider"></div>

        <div className="menu-section">
          <div className="menu-section-title">Quick Actions</div>
          <button 
            className="menu-item add-device-btn"
            onClick={() => {
              // Trigger add device modal
              const event = new CustomEvent('openAddDeviceModal')
              window.dispatchEvent(event)
              closeMenu()
            }}
          >
            <span className="menu-icon">➕</span>
            <span>Add Device</span>
          </button>
        </div>

        <div className="menu-divider"></div>

        <div className="menu-section">
          <div className="menu-section-title">Navigation</div>
          <Link 
            to="/dashboard" 
            className={`menu-item ${location.pathname === '/dashboard' ? 'active' : ''}`}
            onClick={closeMenu}
          >
            <span className="menu-icon">📊</span>
            <span>Dashboard</span>
          </Link>
          <Link 
            to="/history" 
            className={`menu-item ${location.pathname === '/history' ? 'active' : ''}`}
            onClick={closeMenu}
          >
            <span className="menu-icon">📜</span>
            <span>History</span>
          </Link>
          <Link 
            to="/reports" 
            className={`menu-item ${location.pathname === '/reports' ? 'active' : ''}`}
            onClick={closeMenu}
          >
            <span className="menu-icon">📈</span>
            <span>Reports</span>
          </Link>
          <Link 
            to="/notifications" 
            className={`menu-item ${location.pathname === '/notifications' ? 'active' : ''}`}
            onClick={closeMenu}
          >
            <span className="menu-icon">🔔</span>
            <span>Notifications</span>
            {notifications.filter(n => !n.read).length > 0 && (
              <span className="menu-badge">{notifications.filter(n => !n.read).length}</span>
            )}
          </Link>
        </div>

        <div className="menu-divider"></div>

        <div className="menu-section">
          <div className="menu-section-title">Preferences</div>
          {theme && onToggleTheme && (
            <button className="menu-item" onClick={() => { onToggleTheme(); closeMenu(); }}>
              <span className="menu-icon">{theme === 'light' ? '🌙' : '☀️'}</span>
              <span>{theme === 'light' ? 'Dark Mode' : 'Light Mode'}</span>
            </button>
          )}
          <Link 
            to="/settings" 
            className={`menu-item ${location.pathname === '/settings' ? 'active' : ''}`}
            onClick={closeMenu}
          >
            <span className="menu-icon">⚙️</span>
            <span>Settings</span>
          </Link>
        </div>
      </div>

      {/* Overlay */}
      {menuOpen && <div className="menu-overlay" onClick={closeMenu}></div>}
    </nav>
  )
}

export default Navigation
