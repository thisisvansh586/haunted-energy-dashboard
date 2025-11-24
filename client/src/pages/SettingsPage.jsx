import { useState } from 'react'
import Navigation from '../components/Navigation'
import './SettingsPage.css'

function SettingsPage() {
  const [activeSection, setActiveSection] = useState('profile')
  const [settings, setSettings] = useState({
    // Profile
    displayName: 'Guest User',
    email: 'guest@haunted-energy.com',
    timezone: 'UTC',
    
    // Theme
    theme: 'dark',
    accentColor: '#00FF9C',
    
    // Dashboard
    defaultView: 'grid',
    showPowerSummary: true,
    autoRefresh: true,
    refreshInterval: 3,
    
    // Notifications
    emailNotifications: true,
    pushNotifications: false,
    highPowerAlerts: true,
    deviceOfflineAlerts: true,
    weeklyReports: true,
    
    // Energy Preferences
    currency: 'USD',
    energyUnit: 'kWh',
    costPerKwh: 0.12,
    monthlyBudget: 150,
    
    // App Settings
    language: 'en',
    dateFormat: 'MM/DD/YYYY',
    timeFormat: '12h',
    
    // Security
    twoFactorAuth: false,
    sessionTimeout: 30
  })

  const handleSettingChange = (key, value) => {
    setSettings(prev => ({ ...prev, [key]: value }))
  }

  const sections = [
    { id: 'profile', icon: '👤', label: 'Profile' },
    { id: 'theme', icon: '🎨', label: 'Theme' },
    { id: 'dashboard', icon: '📊', label: 'Dashboard' },
    { id: 'notifications', icon: '🔔', label: 'Notifications' },
    { id: 'energy', icon: '⚡', label: 'Energy Preferences' },
    { id: 'app', icon: '⚙️', label: 'App Settings' },
    { id: 'security', icon: '🔒', label: 'Security' }
  ]

  return (
    <div className="app">
      <Navigation />
      
      <div className="settings-page">
        <div className="settings-header">
          <h1>⚙️ Settings</h1>
          <p>Customize your Haunted Energy experience</p>
        </div>

        <div className="settings-container">
          {/* Sidebar Navigation */}
          <div className="settings-sidebar">
            {sections.map(section => (
              <button
                key={section.id}
                className={`settings-nav-item ${activeSection === section.id ? 'active' : ''}`}
                onClick={() => setActiveSection(section.id)}
              >
                <span className="settings-nav-icon">{section.icon}</span>
                <span>{section.label}</span>
              </button>
            ))}
          </div>

          {/* Settings Content */}
          <div className="settings-content">
            {/* Profile Section */}
            {activeSection === 'profile' && (
              <div className="settings-section">
                <h2>👤 Profile Settings</h2>
                <p className="section-description">Manage your personal information</p>

                <div className="settings-group">
                  <label>Display Name</label>
                  <input
                    type="text"
                    value={settings.displayName}
                    onChange={(e) => handleSettingChange('displayName', e.target.value)}
                    placeholder="Enter your name"
                  />
                </div>

                <div className="settings-group">
                  <label>Email Address</label>
                  <input
                    type="email"
                    value={settings.email}
                    onChange={(e) => handleSettingChange('email', e.target.value)}
                    placeholder="your@email.com"
                  />
                </div>

                <div className="settings-group">
                  <label>Timezone</label>
                  <select
                    value={settings.timezone}
                    onChange={(e) => handleSettingChange('timezone', e.target.value)}
                  >
                    <option value="UTC">UTC</option>
                    <option value="America/New_York">Eastern Time</option>
                    <option value="America/Chicago">Central Time</option>
                    <option value="America/Denver">Mountain Time</option>
                    <option value="America/Los_Angeles">Pacific Time</option>
                  </select>
                </div>

                <button className="save-btn">Save Profile</button>
              </div>
            )}

            {/* Theme Section */}
            {activeSection === 'theme' && (
              <div className="settings-section">
                <h2>🎨 Theme Settings</h2>
                <p className="section-description">Customize the look and feel</p>

                <div className="settings-group">
                  <label>Theme Mode</label>
                  <div className="theme-options">
                    <button
                      className={`theme-option ${settings.theme === 'dark' ? 'active' : ''}`}
                      onClick={() => handleSettingChange('theme', 'dark')}
                    >
                      <span>🌙</span>
                      <span>Dark</span>
                    </button>
                    <button
                      className={`theme-option ${settings.theme === 'light' ? 'active' : ''}`}
                      onClick={() => handleSettingChange('theme', 'light')}
                    >
                      <span>☀️</span>
                      <span>Light</span>
                    </button>
                  </div>
                </div>

                <div className="settings-group">
                  <label>Accent Color</label>
                  <div className="color-picker">
                    {['#00FF9C', '#4CC9F0', '#FF6B35', '#D7263D', '#FF44C2'].map(color => (
                      <button
                        key={color}
                        className={`color-option ${settings.accentColor === color ? 'active' : ''}`}
                        style={{ backgroundColor: color }}
                        onClick={() => handleSettingChange('accentColor', color)}
                      />
                    ))}
                  </div>
                </div>

                <button className="save-btn">Apply Theme</button>
              </div>
            )}

            {/* Dashboard Section */}
            {activeSection === 'dashboard' && (
              <div className="settings-section">
                <h2>📊 Dashboard Customization</h2>
                <p className="section-description">Configure your dashboard layout and behavior</p>

                <div className="settings-group">
                  <label>Default View</label>
                  <select
                    value={settings.defaultView}
                    onChange={(e) => handleSettingChange('defaultView', e.target.value)}
                  >
                    <option value="grid">Grid View</option>
                    <option value="list">List View</option>
                    <option value="compact">Compact View</option>
                  </select>
                </div>

                <div className="settings-group">
                  <div className="toggle-setting">
                    <div>
                      <label>Show Power Summary</label>
                      <p className="setting-hint">Display power statistics at the top</p>
                    </div>
                    <label className="toggle">
                      <input
                        type="checkbox"
                        checked={settings.showPowerSummary}
                        onChange={(e) => handleSettingChange('showPowerSummary', e.target.checked)}
                      />
                      <span className="toggle-slider"></span>
                    </label>
                  </div>
                </div>

                <div className="settings-group">
                  <div className="toggle-setting">
                    <div>
                      <label>Auto Refresh</label>
                      <p className="setting-hint">Automatically update device data</p>
                    </div>
                    <label className="toggle">
                      <input
                        type="checkbox"
                        checked={settings.autoRefresh}
                        onChange={(e) => handleSettingChange('autoRefresh', e.target.checked)}
                      />
                      <span className="toggle-slider"></span>
                    </label>
                  </div>
                </div>

                {settings.autoRefresh && (
                  <div className="settings-group">
                    <label>Refresh Interval (seconds)</label>
                    <input
                      type="number"
                      value={settings.refreshInterval}
                      onChange={(e) => handleSettingChange('refreshInterval', parseInt(e.target.value))}
                      min="1"
                      max="60"
                    />
                  </div>
                )}

                <button className="save-btn">Save Dashboard Settings</button>
              </div>
            )}

            {/* Notifications Section */}
            {activeSection === 'notifications' && (
              <div className="settings-section">
                <h2>🔔 Notification Preferences</h2>
                <p className="section-description">Control how and when you receive alerts</p>

                <div className="settings-group">
                  <div className="toggle-setting">
                    <div>
                      <label>Email Notifications</label>
                      <p className="setting-hint">Receive alerts via email</p>
                    </div>
                    <label className="toggle">
                      <input
                        type="checkbox"
                        checked={settings.emailNotifications}
                        onChange={(e) => handleSettingChange('emailNotifications', e.target.checked)}
                      />
                      <span className="toggle-slider"></span>
                    </label>
                  </div>
                </div>

                <div className="settings-group">
                  <div className="toggle-setting">
                    <div>
                      <label>Push Notifications</label>
                      <p className="setting-hint">Browser push notifications</p>
                    </div>
                    <label className="toggle">
                      <input
                        type="checkbox"
                        checked={settings.pushNotifications}
                        onChange={(e) => handleSettingChange('pushNotifications', e.target.checked)}
                      />
                      <span className="toggle-slider"></span>
                    </label>
                  </div>
                </div>

                <div className="settings-divider"></div>

                <h3>Alert Types</h3>

                <div className="settings-group">
                  <div className="toggle-setting">
                    <div>
                      <label>High Power Alerts</label>
                      <p className="setting-hint">Notify when devices exceed power thresholds</p>
                    </div>
                    <label className="toggle">
                      <input
                        type="checkbox"
                        checked={settings.highPowerAlerts}
                        onChange={(e) => handleSettingChange('highPowerAlerts', e.target.checked)}
                      />
                      <span className="toggle-slider"></span>
                    </label>
                  </div>
                </div>

                <div className="settings-group">
                  <div className="toggle-setting">
                    <div>
                      <label>Device Offline Alerts</label>
                      <p className="setting-hint">Notify when devices disconnect</p>
                    </div>
                    <label className="toggle">
                      <input
                        type="checkbox"
                        checked={settings.deviceOfflineAlerts}
                        onChange={(e) => handleSettingChange('deviceOfflineAlerts', e.target.checked)}
                      />
                      <span className="toggle-slider"></span>
                    </label>
                  </div>
                </div>

                <div className="settings-group">
                  <div className="toggle-setting">
                    <div>
                      <label>Weekly Reports</label>
                      <p className="setting-hint">Receive weekly energy summaries</p>
                    </div>
                    <label className="toggle">
                      <input
                        type="checkbox"
                        checked={settings.weeklyReports}
                        onChange={(e) => handleSettingChange('weeklyReports', e.target.checked)}
                      />
                      <span className="toggle-slider"></span>
                    </label>
                  </div>
                </div>

                <button className="save-btn">Save Notification Settings</button>
              </div>
            )}

            {/* Energy Preferences Section */}
            {activeSection === 'energy' && (
              <div className="settings-section">
                <h2>⚡ Energy Preferences</h2>
                <p className="section-description">Configure energy tracking and cost calculations</p>

                <div className="settings-group">
                  <label>Currency</label>
                  <select
                    value={settings.currency}
                    onChange={(e) => handleSettingChange('currency', e.target.value)}
                  >
                    <option value="USD">USD ($)</option>
                    <option value="EUR">EUR (€)</option>
                    <option value="GBP">GBP (£)</option>
                    <option value="JPY">JPY (¥)</option>
                  </select>
                </div>

                <div className="settings-group">
                  <label>Energy Unit</label>
                  <select
                    value={settings.energyUnit}
                    onChange={(e) => handleSettingChange('energyUnit', e.target.value)}
                  >
                    <option value="kWh">Kilowatt-hours (kWh)</option>
                    <option value="Wh">Watt-hours (Wh)</option>
                    <option value="MWh">Megawatt-hours (MWh)</option>
                  </select>
                </div>

                <div className="settings-group">
                  <label>Cost per kWh</label>
                  <input
                    type="number"
                    value={settings.costPerKwh}
                    onChange={(e) => handleSettingChange('costPerKwh', parseFloat(e.target.value))}
                    step="0.01"
                    min="0"
                    placeholder="0.12"
                  />
                  <p className="setting-hint">Your electricity rate</p>
                </div>

                <div className="settings-group">
                  <label>Monthly Budget ({settings.currency})</label>
                  <input
                    type="number"
                    value={settings.monthlyBudget}
                    onChange={(e) => handleSettingChange('monthlyBudget', parseInt(e.target.value))}
                    min="0"
                    placeholder="150"
                  />
                  <p className="setting-hint">Set your monthly energy budget</p>
                </div>

                <button className="save-btn">Save Energy Settings</button>
              </div>
            )}

            {/* App Settings Section */}
            {activeSection === 'app' && (
              <div className="settings-section">
                <h2>⚙️ App Settings</h2>
                <p className="section-description">General application preferences</p>

                <div className="settings-group">
                  <label>Language</label>
                  <select
                    value={settings.language}
                    onChange={(e) => handleSettingChange('language', e.target.value)}
                  >
                    <option value="en">English</option>
                    <option value="es">Español</option>
                    <option value="fr">Français</option>
                    <option value="de">Deutsch</option>
                    <option value="ja">日本語</option>
                  </select>
                </div>

                <div className="settings-group">
                  <label>Date Format</label>
                  <select
                    value={settings.dateFormat}
                    onChange={(e) => handleSettingChange('dateFormat', e.target.value)}
                  >
                    <option value="MM/DD/YYYY">MM/DD/YYYY</option>
                    <option value="DD/MM/YYYY">DD/MM/YYYY</option>
                    <option value="YYYY-MM-DD">YYYY-MM-DD</option>
                  </select>
                </div>

                <div className="settings-group">
                  <label>Time Format</label>
                  <select
                    value={settings.timeFormat}
                    onChange={(e) => handleSettingChange('timeFormat', e.target.value)}
                  >
                    <option value="12h">12-hour (AM/PM)</option>
                    <option value="24h">24-hour</option>
                  </select>
                </div>

                <button className="save-btn">Save App Settings</button>
              </div>
            )}

            {/* Security Section */}
            {activeSection === 'security' && (
              <div className="settings-section">
                <h2>🔒 Security Settings</h2>
                <p className="section-description">Protect your account and data</p>

                <div className="settings-group">
                  <div className="toggle-setting">
                    <div>
                      <label>Two-Factor Authentication</label>
                      <p className="setting-hint">Add an extra layer of security</p>
                    </div>
                    <label className="toggle">
                      <input
                        type="checkbox"
                        checked={settings.twoFactorAuth}
                        onChange={(e) => handleSettingChange('twoFactorAuth', e.target.checked)}
                      />
                      <span className="toggle-slider"></span>
                    </label>
                  </div>
                </div>

                <div className="settings-group">
                  <label>Session Timeout (minutes)</label>
                  <input
                    type="number"
                    value={settings.sessionTimeout}
                    onChange={(e) => handleSettingChange('sessionTimeout', parseInt(e.target.value))}
                    min="5"
                    max="120"
                  />
                  <p className="setting-hint">Auto-logout after inactivity</p>
                </div>

                <div className="settings-divider"></div>

                <div className="danger-zone">
                  <h3>⚠️ Danger Zone</h3>
                  <button className="danger-btn">Change Password</button>
                  <button className="danger-btn">Export Data</button>
                  <button className="danger-btn">Delete Account</button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default SettingsPage
