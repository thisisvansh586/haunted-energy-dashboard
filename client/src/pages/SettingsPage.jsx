import { useAuthStore } from '../store/authStore'
import Navigation from '../components/Navigation'

function SettingsPage() {
  const { user, signOut } = useAuthStore()

  return (
    <div className="app">
      <Navigation user={user} onLogout={signOut} />
      <div style={{ padding: '2rem' }}>
        <h1>⚙️ Settings</h1>
        <p>Settings page coming soon...</p>
      </div>
    </div>
  )
}

export default SettingsPage
