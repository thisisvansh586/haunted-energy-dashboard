import { supabase } from '../supabaseClient.js'

/**
 * Authentication middleware
 * Validates JWT token and attaches user to request
 */
export async function authenticateUser(req, res, next) {
  try {
    const authHeader = req.headers.authorization
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Missing or invalid authorization header' })
    }

    const token = authHeader.substring(7) // Remove 'Bearer ' prefix

    // Verify token with Supabase
    const { data: { user }, error } = await supabase.auth.getUser(token)

    if (error || !user) {
      return res.status(401).json({ error: 'Invalid or expired token' })
    }

    // Attach user to request
    req.user = user
    req.userId = user.id
    
    next()
  } catch (error) {
    console.error('Auth middleware error:', error)
    res.status(500).json({ error: 'Authentication failed' })
  }
}

/**
 * Optional authentication - doesn't fail if no token
 * Used for endpoints that work with or without auth
 */
export async function optionalAuth(req, res, next) {
  try {
    const authHeader = req.headers.authorization
    
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.substring(7)
      const { data: { user } } = await supabase.auth.getUser(token)
      
      if (user) {
        req.user = user
        req.userId = user.id
      }
    }
    
    next()
  } catch (error) {
    // Continue without auth
    next()
  }
}

/**
 * Verify user owns the home
 */
export async function verifyHomeOwnership(req, res, next) {
  try {
    const homeId = req.params.homeId || req.query.homeId || req.body.homeId
    
    if (!homeId) {
      return res.status(400).json({ error: 'Home ID required' })
    }

    const { data: home, error } = await supabase
      .from('homes')
      .select('owner')
      .eq('id', homeId)
      .single()

    if (error || !home) {
      return res.status(404).json({ error: 'Home not found' })
    }

    if (home.owner !== req.userId) {
      return res.status(403).json({ error: 'Access denied' })
    }

    req.homeId = homeId
    next()
  } catch (error) {
    console.error('Home ownership verification error:', error)
    res.status(500).json({ error: 'Verification failed' })
  }
}
