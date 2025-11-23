import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '../store/authStore'

function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isSignUp, setIsSignUp] = useState(false)
  const [message, setMessage] = useState('')
  
  const { signIn, signUp, loading, error } = useAuthStore()
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setMessage('')

    if (!email || !password) {
      setMessage('Please enter email and password')
      return
    }

    const { data, error } = isSignUp 
      ? await signUp(email, password)
      : await signIn(email, password)

    if (error) {
      setMessage(error.message || 'Authentication failed')
    } else if (data) {
      // Redirect to dashboard
      navigate('/')
    }
  }

  return (
    <div className="login-container">
      <div className="login-card">
        <div className="login-header">
          <h1>👻 Haunted Energy Dashboard</h1>
          <p>{isSignUp ? 'Create your account' : 'Sign in to your account'}</p>
        </div>

        <form onSubmit={handleSubmit} className="login-form">
          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="your@email.com"
              disabled={loading}
              required
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
              disabled={loading}
              required
              minLength={6}
            />
          </div>

          {(message || error) && (
            <div className="message error">
              {message || error}
            </div>
          )}

          <button 
            type="submit" 
            className="btn-primary"
            disabled={loading}
          >
            {loading ? 'Loading...' : (isSignUp ? 'Sign Up' : 'Sign In')}
          </button>
        </form>

        <div className="login-footer">
          <button
            type="button"
            onClick={() => setIsSignUp(!isSignUp)}
            className="btn-link"
            disabled={loading}
          >
            {isSignUp 
              ? 'Already have an account? Sign in' 
              : "Don't have an account? Sign up"}
          </button>
        </div>

        <div className="demo-mode">
          <p>Or continue without authentication</p>
          <button
            type="button"
            onClick={() => navigate('/')}
            className="btn-secondary"
          >
            Demo Mode
          </button>
        </div>
      </div>

      <style jsx>{`
        .login-container {
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          background: linear-gradient(180deg, #0D0F17 0%, #05060A 100%);
          padding: 2rem;
        }

        .login-card {
          background: #11111A;
          border: 2px solid #4CC9F0;
          border-radius: 12px;
          padding: 2rem;
          max-width: 400px;
          width: 100%;
          box-shadow: 0 6px 30px rgba(0,255,156,0.12), 0 0 40px rgba(76,201,240,0.05);
        }

        .login-header {
          text-align: center;
          margin-bottom: 2rem;
        }

        .login-header h1 {
          color: #00FF9C;
          font-size: 1.8rem;
          margin-bottom: 0.5rem;
          text-shadow: 0 0 10px #00FF9C;
        }

        .login-header p {
          color: rgba(255,255,255,0.7);
          font-size: 0.9rem;
        }

        .login-form {
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
        }

        .form-group {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }

        .form-group label {
          color: #00FF9C;
          font-size: 0.9rem;
          font-weight: 500;
        }

        .form-group input {
          background: #0A0A0F;
          border: 1px solid #4CC9F0;
          border-radius: 6px;
          padding: 0.75rem;
          color: #E0E0E0;
          font-size: 1rem;
          transition: all 0.3s;
        }

        .form-group input:focus {
          outline: none;
          border-color: #00FF9C;
          box-shadow: 0 0 10px rgba(0,255,156,0.3);
        }

        .form-group input:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .message {
          padding: 0.75rem;
          border-radius: 6px;
          font-size: 0.9rem;
        }

        .message.error {
          background: rgba(215, 38, 61, 0.1);
          border: 1px solid #D7263D;
          color: #FF6B6B;
        }

        .btn-primary {
          background: #00FF9C;
          color: #0A0A0F;
          border: none;
          border-radius: 6px;
          padding: 0.75rem;
          font-size: 1rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s;
        }

        .btn-primary:hover:not(:disabled) {
          background: #00CC7D;
          box-shadow: 0 0 20px rgba(0,255,156,0.5);
        }

        .btn-primary:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .login-footer {
          margin-top: 1rem;
          text-align: center;
        }

        .btn-link {
          background: none;
          border: none;
          color: #4CC9F0;
          cursor: pointer;
          font-size: 0.9rem;
          text-decoration: underline;
        }

        .btn-link:hover:not(:disabled) {
          color: #00FF9C;
        }

        .demo-mode {
          margin-top: 2rem;
          padding-top: 2rem;
          border-top: 1px solid rgba(76,201,240,0.2);
          text-align: center;
        }

        .demo-mode p {
          color: rgba(255,255,255,0.5);
          font-size: 0.85rem;
          margin-bottom: 1rem;
        }

        .btn-secondary {
          background: transparent;
          border: 1px solid #4CC9F0;
          color: #4CC9F0;
          border-radius: 6px;
          padding: 0.5rem 1.5rem;
          font-size: 0.9rem;
          cursor: pointer;
          transition: all 0.3s;
        }

        .btn-secondary:hover {
          background: rgba(76,201,240,0.1);
          box-shadow: 0 0 10px rgba(76,201,240,0.3);
        }
      `}</style>
    </div>
  )
}

export default Login
