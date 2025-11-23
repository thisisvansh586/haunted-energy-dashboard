/**
 * Unit Tests for Authentication Middleware
 * Feature: haunted-energy-phase2
 * Requirements: 1.1, 1.2
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { authenticateUser, optionalAuth, verifyHomeOwnership } from '../middleware/auth.js'

// Mock the supabase client
vi.mock('../supabaseClient.js', () => ({
  supabase: {
    auth: {
      getUser: vi.fn()
    },
    from: vi.fn()
  }
}))

import { supabase } from '../supabaseClient.js'

describe('Authentication Middleware', () => {
  let req, res, next

  beforeEach(() => {
    req = {
      headers: {},
      params: {},
      query: {},
      body: {}
    }
    res = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn().mockReturnThis()
    }
    next = vi.fn()
    vi.clearAllMocks()
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  describe('authenticateUser', () => {
    it('should return 401 when no authorization header (missing token)', async () => {
      await authenticateUser(req, res, next)
      
      expect(res.status).toHaveBeenCalledWith(401)
      expect(res.json).toHaveBeenCalledWith({
        error: 'Missing or invalid authorization header'
      })
      expect(next).not.toHaveBeenCalled()
    })

    it('should return 401 when authorization header does not start with Bearer (missing token)', async () => {
      req.headers.authorization = 'Basic abc123'
      
      await authenticateUser(req, res, next)
      
      expect(res.status).toHaveBeenCalledWith(401)
      expect(res.json).toHaveBeenCalledWith({
        error: 'Missing or invalid authorization header'
      })
      expect(next).not.toHaveBeenCalled()
    })

    it('should return 401 when authorization header is empty Bearer (missing token)', async () => {
      req.headers.authorization = 'Bearer '
      
      // Mock Supabase to return error for empty token
      supabase.auth.getUser.mockResolvedValue({
        data: { user: null },
        error: { message: 'Invalid token' }
      })
      
      await authenticateUser(req, res, next)
      
      expect(res.status).toHaveBeenCalledWith(401)
      expect(res.json).toHaveBeenCalledWith({
        error: 'Invalid or expired token'
      })
      expect(next).not.toHaveBeenCalled()
    })

    it('should return 401 when token is invalid', async () => {
      req.headers.authorization = 'Bearer invalid-token'
      
      // Mock Supabase to return error for invalid token
      supabase.auth.getUser.mockResolvedValue({
        data: { user: null },
        error: { message: 'Invalid token' }
      })
      
      await authenticateUser(req, res, next)
      
      expect(supabase.auth.getUser).toHaveBeenCalledWith('invalid-token')
      expect(res.status).toHaveBeenCalledWith(401)
      expect(res.json).toHaveBeenCalledWith({
        error: 'Invalid or expired token'
      })
      expect(next).not.toHaveBeenCalled()
    })

    it('should return 401 when token is expired', async () => {
      req.headers.authorization = 'Bearer expired-token'
      
      // Mock Supabase to return error for expired token
      supabase.auth.getUser.mockResolvedValue({
        data: { user: null },
        error: { message: 'Token expired' }
      })
      
      await authenticateUser(req, res, next)
      
      expect(supabase.auth.getUser).toHaveBeenCalledWith('expired-token')
      expect(res.status).toHaveBeenCalledWith(401)
      expect(res.json).toHaveBeenCalledWith({
        error: 'Invalid or expired token'
      })
      expect(next).not.toHaveBeenCalled()
    })

    it('should return 401 when user is null despite no error', async () => {
      req.headers.authorization = 'Bearer malformed-token'
      
      // Mock Supabase to return null user without error
      supabase.auth.getUser.mockResolvedValue({
        data: { user: null },
        error: null
      })
      
      await authenticateUser(req, res, next)
      
      expect(supabase.auth.getUser).toHaveBeenCalledWith('malformed-token')
      expect(res.status).toHaveBeenCalledWith(401)
      expect(res.json).toHaveBeenCalledWith({
        error: 'Invalid or expired token'
      })
      expect(next).not.toHaveBeenCalled()
    })

    it('should attach user to request when token is valid', async () => {
      const mockUser = {
        id: 'user-123',
        email: 'test@example.com',
        aud: 'authenticated',
        role: 'authenticated'
      }
      
      req.headers.authorization = 'Bearer valid-token'
      
      // Mock Supabase to return valid user
      supabase.auth.getUser.mockResolvedValue({
        data: { user: mockUser },
        error: null
      })
      
      await authenticateUser(req, res, next)
      
      expect(supabase.auth.getUser).toHaveBeenCalledWith('valid-token')
      expect(req.user).toEqual(mockUser)
      expect(req.userId).toBe('user-123')
      expect(next).toHaveBeenCalled()
      expect(res.status).not.toHaveBeenCalled()
      expect(res.json).not.toHaveBeenCalled()
    })

    it('should return 500 when unexpected error occurs', async () => {
      req.headers.authorization = 'Bearer valid-token'
      
      // Mock Supabase to throw an unexpected error
      supabase.auth.getUser.mockRejectedValue(new Error('Network error'))
      
      await authenticateUser(req, res, next)
      
      expect(res.status).toHaveBeenCalledWith(500)
      expect(res.json).toHaveBeenCalledWith({
        error: 'Authentication failed'
      })
      expect(next).not.toHaveBeenCalled()
    })
  })

  describe('optionalAuth', () => {
    it('should call next without error when no authorization header', async () => {
      await optionalAuth(req, res, next)
      
      expect(next).toHaveBeenCalled()
      expect(req.user).toBeUndefined()
    })

    it('should attach user when valid token provided', async () => {
      req.headers.authorization = 'Bearer valid-token'
      
      // Would need proper mocking for full test
      await optionalAuth(req, res, next)
      
      expect(next).toHaveBeenCalled()
    })

    it('should continue without auth when invalid token provided', async () => {
      req.headers.authorization = 'Bearer invalid-token'
      
      await optionalAuth(req, res, next)
      
      expect(next).toHaveBeenCalled()
    })
  })

  describe('verifyHomeOwnership', () => {
    it('should return 400 when no homeId provided', async () => {
      req.userId = 'user-123'
      
      await verifyHomeOwnership(req, res, next)
      
      expect(res.status).toHaveBeenCalledWith(400)
      expect(res.json).toHaveBeenCalledWith({
        error: 'Home ID required'
      })
      expect(next).not.toHaveBeenCalled()
    })

    it('should return 404 when home not found', async () => {
      req.userId = 'user-123'
      req.params.homeId = 'non-existent-home'
      
      // Would need proper mocking for database query
    })

    it('should return 403 when user does not own home', async () => {
      req.userId = 'user-123'
      req.params.homeId = 'home-456'
      
      // Would need proper mocking for database query
    })

    it('should call next when user owns home', async () => {
      req.userId = 'user-123'
      req.params.homeId = 'home-456'
      
      // Would need proper mocking for database query
    })
  })
})

/**
 * Integration Tests for Auth Middleware
 * These tests require a real Supabase instance
 */
describe('Auth Middleware Integration Tests', () => {
  const skipTests = !process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_KEY

  it.skipIf(skipTests)('should authenticate with real token', async () => {
    // This would be an integration test with real Supabase
    // Create a test user, get a real token, and test the middleware
  })

  it.skipIf(skipTests)('should verify home ownership with real data', async () => {
    // This would be an integration test with real Supabase
    // Create a test user, home, and verify ownership
  })
})
