import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '../store/authStore'
import './AuthPage.css'

function AuthPage() {
  const [mode, setMode] = useState('login') // 'login' or 'signup'
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [message, setMessage] = useState('')
  
  const navigate = useNavigate()
  const { signIn, signUp, isAuthenticated, loading, error } = useAuthStore()

  useEffect(() => {
    if (isAuthenticated()) {
      navigate('/dashboard')
    }
  }, [isAuthenticated, navigate])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setMessage('')

    if (mode === 'signup') {
      if (password !== confirmPassword) {
        setMessage('Passwords do not match')
        return
      }
      if (password.length < 6) {
        setMessage('Password must be at least 6 characters')
        return
      }
      
      const { error } = await signUp(email, password)
      if (!error) {
        navigate('/dashboard')
      }
    } else {
      const { error } = await signIn(email, password)
      if (!error) {
        navigate('/dashboard')
      }
    }
  }

  return (
    <div className="auth-page">
      <div className="auth-container">
        <div className="auth-card">
          <div className="auth-header">
            <h1>👻 Haunted Energy</h1>
            <h2>{mode === 'login' ? 'Sign In' : 'Create Account'}</h2>
          </div>

          <form onSubmit={handleSubmit} className="auth-form">
            <div className="form-group">
              <label htmlFor="email">Email</label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your@email.com"
                required
                disabled={loading}
              />
            </div>

            <div className="form-group">
              <label htmlFor="password">Password</label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                disabled={loading}
              />
            </div>

            {mode === 'signup' && (
              <div className="form-group">
                <label htmlFor="confirmPassword">Confirm Password</label>
                <input
                  id="confirmPassword"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  disabled={loading}
                />
              </div>
            )}

            {(error || message) && (
              <div className={`message ${error ? 'error' : 'info'}`}>
                {error || message}
              </div>
            )}

            <button type="submit" className="auth-button" disabled={loading}>
              {loading ? 'Loading...' : mode === 'login' ? 'Sign In' : 'Create Account'}
            </button>
          </form>

          <div className="auth-footer">
            <p>
              {mode === 'login' ? "Don't have an account?" : 'Already have an account?'}{' '}
              <button
                type="button"
                className="link-button"
                onClick={() => {
                  setMode(mode === 'login' ? 'signup' : 'login')
                  setMessage('')
                }}
                disabled={loading}
              >
                {mode === 'login' ? 'Sign Up' : 'Sign In'}
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default AuthPage
