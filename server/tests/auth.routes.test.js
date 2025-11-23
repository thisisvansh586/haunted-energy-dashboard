/**
 * Property-Based Tests for Authentication Routes
 * Feature: haunted-energy-phase2
 */

import { describe, it, expect, beforeAll, afterAll } from 'vitest'
import fc from 'fast-check'
import { createClient } from '@supabase/supabase-js'
import request from 'supertest'

const supabaseUrl = process.env.SUPABASE_URL || 'http://localhost:54321'
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY || ''
const apiUrl = process.env.API_URL || 'http://localhost:3001'

const skipTests = !supabaseServiceKey || supabaseServiceKey.length < 10

describe('Auth Routes Tests', () => {
  let supabase
  let testUsers = []
  let testTokens = []

  beforeAll(async () => {
    if (skipTests) return
    
    supabase = createClient(supabaseUrl, supabaseServiceKey)
    
    // Create test users
    for (let i = 0; i < 3; i++) {
      const email = `test-auth-${Date.now()}-${i}@example.com`
      const password = 'TestPassword123!'
      
      const { data, error } = await supabase.auth.admin.createUser({
        email,
        password,
        email_confirm: true
      })
      
      if (!error && data.user) {
        testUsers.push(data.user)
        
        // Get token for this user
        const userClient = createClient(supabaseUrl, supabaseServiceKey)
        const { data: { session } } = await userClient.auth.signInWithPassword({
          email,
          password
        })
        
        if (session) {
          testTokens.push(session.access_token)
        }
      }
    }
  })

  afterAll(async () => {
    if (skipTests) return
    
    // Clean up test data
    for (const user of testUsers) {
      // Delete homes (will cascade to devices)
      await supabase.from('homes').delete().eq('owner', user.id)
      
      // Delete notifications
      await supabase.from('notifications').delete().eq('user_id', user.id)
      
      // Delete user
      await supabase.auth.admin.deleteUser(user.id)
    }
  })

  // Feature: haunted-energy-phase2, Property 38: Demo home device count
  it.skipIf(skipTests)('Property 38: Demo home creation always creates exactly 5 devices', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.integer({ min: 0, max: testUsers.length - 1 }),
        async (userIndex) => {
          if (testUsers.length === 0 || testTokens.length === 0) return true
          
          const user = testUsers[userIndex]
          const token = testTokens[userIndex]
          
          // Call setup-demo-home endpoint
          const response = await request(apiUrl)
            .post('/api/auth/setup-demo-home')
            .set('Authorization', `Bearer ${token}`)
            .expect(201)
          
          // Verify response
          expect(response.body.home).toBeDefined()
          expect(response.body.devices).toBeDefined()
          expect(response.body.devices).toHaveLength(5)
          
          // Verify in database
          const { data: devices } = await supabase
            .from('devices')
            .select('*')
            .eq('home_id', response.body.home.id)
          
          const deviceCount = devices.length
          
          // Clean up
          await supabase.from('homes').delete().eq('id', response.body.home.id)
          
          return deviceCount === 5
        }
      ),
      { numRuns: 5 } // Reduced runs since this creates real data
    )
  })

  it.skipIf(skipTests)('should create demo home with correct structure', async () => {
    if (testUsers.length === 0 || testTokens.length === 0) return
    
    const token = testTokens[0]
    
    const response = await request(apiUrl)
      .post('/api/auth/setup-demo-home')
      .set('Authorization', `Bearer ${token}`)
      .expect(201)
    
    // Verify home
    expect(response.body.home.name).toBe('Haunted Manor')
    expect(response.body.home.owner).toBe(testUsers[0].id)
    
    // Verify devices
    expect(response.body.devices).toHaveLength(5)
    
    const deviceNames = response.body.devices.map(d => d.name)
    expect(deviceNames).toContain('Haunted Fridge')
    expect(deviceNames).toContain('Phantom TV')
    expect(deviceNames).toContain('Cursed AC')
    expect(deviceNames).toContain('Possessed Washer')
    expect(deviceNames).toContain('Eerie Lamp')
    
    // Verify notification was created
    const { data: notifications } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', testUsers[0].id)
      .eq('title', 'Welcome to Haunted Manor')
    
    expect(notifications.length).toBeGreaterThan(0)
    
    // Clean up
    await supabase.from('homes').delete().eq('id', response.body.home.id)
  })

  it.skipIf(skipTests)('should not create demo home if user already has homes', async () => {
    if (testUsers.length === 0 || testTokens.length === 0) return
    
    const user = testUsers[0]
    const token = testTokens[0]
    
    // Create a home first
    const { data: existingHome } = await supabase
      .from('homes')
      .insert({
        owner: user.id,
        name: 'Existing Home'
      })
      .select()
      .single()
    
    // Try to create demo home
    const response = await request(apiUrl)
      .post('/api/auth/setup-demo-home')
      .set('Authorization', `Bearer ${token}`)
      .expect(400)
    
    expect(response.body.error).toBe('User already has homes')
    
    // Clean up
    await supabase.from('homes').delete().eq('id', existingHome.id)
  })

  it.skipIf(skipTests)('should return user profile', async () => {
    if (testUsers.length === 0 || testTokens.length === 0) return
    
    const token = testTokens[0]
    
    const response = await request(apiUrl)
      .get('/api/auth/profile')
      .set('Authorization', `Bearer ${token}`)
      .expect(200)
    
    expect(response.body.user).toBeDefined()
    expect(response.body.user.id).toBe(testUsers[0].id)
    expect(response.body.user.email).toBe(testUsers[0].email)
  })

  it.skipIf(skipTests)('should return 401 for profile without token', async () => {
    await request(apiUrl)
      .get('/api/auth/profile')
      .expect(401)
  })
})
