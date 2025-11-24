import { Navigate } from 'react-router-dom'
import { useAuthStore } from '../store/authStore'
import { isSupabaseConfigured } from '../supabaseClient'

/**
 * Protected Route Component
 * Redirects to login if user is not authenticated
 * Allows demo mode if Supabase is not configured
 * 
 * DEV MODE: Set VITE_SKIP_AUTH=true in .env to bypass authentication
 */
function ProtectedRoute({ children }) {
  const { user, loading } = useAuthStore()

  // DEV MODE: Skip authentication if VITE_SKIP_AUTH is true
  const skipAuth = import.meta.env.VITE_SKIP_AUTH === 'true'
  
  if (skipAuth) {
    console.log('🚀 DEV MODE: Authentication bypassed')
    return children
  }

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
