import { Navigate } from 'react-router-dom'
import { useAuthStore } from '../store/authStore'
import { isSupabaseConfigured } from '../supabaseClient'

/**
 * Protected Route Component
 * Redirects to login if user is not authenticated
 * Allows demo mode if Supabase is not configured
 */
function ProtectedRoute({ children }) {
  const { user, loading } = useAuthStore()

  // Show loading state
  if (loading) {
    return (
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        background: '#0A0A0F',
        color: '#00FF9C'
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>👻</div>
          <div>Loading...</div>
        </div>
      </div>
    )
  }

  // If Supabase not configured, allow demo mode
  if (!isSupabaseConfigured()) {
    return children
  }

  // Redirect to auth if not authenticated
  if (!user) {
    return <Navigate to="/auth" replace />
  }

  return children
}

export default ProtectedRoute
