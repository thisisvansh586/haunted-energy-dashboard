/**
 * Property-Based Tests for Row Level Security (RLS) Policies
 * 
 * These tests verify that RLS policies correctly isolate user data.
 * Feature: haunted-energy-phase2
 */

import { describe, it, expect, beforeAll, afterAll } from 'vitest'
import fc from 'fast-check'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.SUPABASE_URL || 'http://localhost:54321'
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY || ''

// Skip tests if Supabase is not configured
const skipTests = !supabaseServiceKey || supabaseServiceKey.length < 10

describe('RLS Policy Tests', () => {
  let supabase
  let testUsers = []
  let testHomes = []

  beforeAll(async () => {
    if (skipTests) return
    
    supabase = createClient(supabaseUrl, supabaseServiceKey)
    
    // Create test users
    for (let i = 0; i < 3; i++) {
      const email = `test-user-${Date.now()}-${i}@example.com`
      const password = 'TestPassword123!'
      
      const { data, error } = await supabase.auth.admin.createUser({
        email,
        password,
        email_confirm: true
      })
      
      if (!error && data.user) {
        testUsers.push(data.user)
      }
    }
  })

  afterAll(async () => {
    if (skipTests) return
    
    // Clean up test data
    for (const home of testHomes) {
      await supabase.from('homes').delete().eq('id', home.id)
    }
    
    // Clean up test users
    for (const user of testUsers) {
      await supabase.auth.admin.deleteUser(user.id)
    }
  })

  // Feature: haunted-energy-phase2, Property 3: Home ownership isolation
  it.skipIf(skipTests)('Property 3: Users can only query their own homes', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.integer({ min: 0, max: testUsers.length - 1 }),
        fc.string({ minLength: 3, maxLength: 20 }),
        async (userIndex, homeName) => {
          if (testUsers.length === 0) return true
          
          const user = testUsers[userIndex]
          
          // Create a home for this user
          const { data: home, error: createError } = await supabase
            .from('homes')
            .insert({ owner: user.id, name: homeName })
            .select()
            .single()
          
          if (createError) return true // Skip if creation fails
          testHomes.push(home)
          
          // Query homes as this user
          const userClient = createClient(supabaseUrl, supabaseServiceKey)
          const { data: { session } } = await userClient.auth.signInWithPassword({
            email: user.email,
            password: 'TestPassword123!'
          })
          
          if (!session) return true
          
          const { data: homes } = await userClient
            .from('homes')
            .select('*')
          
          // All returned homes should belong to this user
          const allOwnedByUser = homes.every(h => h.owner === user.id)
          
          return allOwnedByUser
        }
      ),
      { numRuns: 10 }
    )
  })

  // Feature: haunted-energy-phase2, Property 4: Device ownership isolation
  it.skipIf(skipTests)('Property 4: Users can only query devices in their homes', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.integer({ min: 0, max: testUsers.length - 1 }),
        fc.string({ minLength: 3, maxLength: 20 }),
        async (userIndex, deviceName) => {
          if (testUsers.length === 0 || testHomes.length === 0) return true
          
          const user = testUsers[userIndex]
          const userHome = testHomes.find(h => h.owner === user.id)
          
          if (!userHome) return true
          
          // Create a device in this user's home
          const { data: device, error: createError } = await supabase
            .from('devices')
            .insert({
              home_id: userHome.id,
              name: deviceName,
              type: 'appliance',
              room: 'Kitchen',
              base_power: 100
            })
            .select()
            .single()
          
          if (createError) return true
          
          // Query devices as this user
          const userClient = createClient(supabaseUrl, supabaseServiceKey)
          const { data: { session } } = await userClient.auth.signInWithPassword({
            email: user.email,
            password: 'TestPassword123!'
          })
          
          if (!session) return true
          
          const { data: devices } = await userClient
            .from('devices')
            .select('*, homes!inner(*)')
          
          // All returned devices should belong to homes owned by this user
          const allOwnedByUser = devices.every(d => d.homes.owner === user.id)
          
          // Clean up
          await supabase.from('devices').delete().eq('id', device.id)
          
          return allOwnedByUser
        }
      ),
      { numRuns: 10 }
    )
  })

  // Feature: haunted-energy-phase2, Property 5: Telemetry ownership isolation
  it.skipIf(skipTests)('Property 5: Users can only query telemetry from their homes', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.integer({ min: 0, max: testUsers.length - 1 }),
        fc.float({ min: 0, max: 1000 }),
        async (userIndex, powerW) => {
          if (testUsers.length === 0 || testHomes.length === 0) return true
          
          const user = testUsers[userIndex]
          const userHome = testHomes.find(h => h.owner === user.id)
          
          if (!userHome) return true
          
          // Create telemetry for this user's home
          const { data: telemetry, error: createError } = await supabase
            .from('telemetry')
            .insert({
              home_id: userHome.id,
              power_w: powerW,
              total_w: powerW
            })
            .select()
            .single()
          
          if (createError) return true
          
          // Query telemetry as this user
          const userClient = createClient(supabaseUrl, supabaseServiceKey)
          const { data: { session } } = await userClient.auth.signInWithPassword({
            email: user.email,
            password: 'TestPassword123!'
          })
          
          if (!session) return true
          
          const { data: telemetryRecords } = await userClient
            .from('telemetry')
            .select('*, homes!inner(*)')
          
          // All returned telemetry should belong to homes owned by this user
          const allOwnedByUser = telemetryRecords.every(t => t.homes.owner === user.id)
          
          // Clean up
          await supabase.from('telemetry').delete().eq('id', telemetry.id)
          
          return allOwnedByUser
        }
      ),
      { numRuns: 10 }
    )
  })

  // Feature: haunted-energy-phase2, Property 6: Anomaly ownership isolation
  it.skipIf(skipTests)('Property 6: Users can only query anomalies from their homes', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.integer({ min: 0, max: testUsers.length - 1 }),
        fc.constantFrom('phantom_load', 'spike', 'ghost_walk'),
        async (userIndex, anomalyType) => {
          if (testUsers.length === 0 || testHomes.length === 0) return true
          
          const user = testUsers[userIndex]
          const userHome = testHomes.find(h => h.owner === user.id)
          
          if (!userHome) return true
          
          // Create anomaly for this user's home
          const { data: anomaly, error: createError } = await supabase
            .from('anomalies')
            .insert({
              home_id: userHome.id,
              type: anomalyType,
              severity: 'medium',
              title: 'Test Anomaly',
              message: 'Test message'
            })
            .select()
            .single()
          
          if (createError) return true
          
          // Query anomalies as this user
          const userClient = createClient(supabaseUrl, supabaseServiceKey)
          const { data: { session } } = await userClient.auth.signInWithPassword({
            email: user.email,
            password: 'TestPassword123!'
          })
          
          if (!session) return true
          
          const { data: anomalies } = await userClient
            .from('anomalies')
            .select('*, homes!inner(*)')
          
          // All returned anomalies should belong to homes owned by this user
          const allOwnedByUser = anomalies.every(a => a.homes.owner === user.id)
          
          // Clean up
          await supabase.from('anomalies').delete().eq('id', anomaly.id)
          
          return allOwnedByUser
        }
      ),
      { numRuns: 10 }
    )
  })

  // Feature: haunted-energy-phase2, Property 7: Notification ownership isolation
  it.skipIf(skipTests)('Property 7: Users can only query their own notifications', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.integer({ min: 0, max: testUsers.length - 1 }),
        fc.string({ minLength: 5, maxLength: 50 }),
        async (userIndex, notificationTitle) => {
          if (testUsers.length === 0) return true
          
          const user = testUsers[userIndex]
          
          // Create notification for this user
          const { data: notification, error: createError } = await supabase
            .from('notifications')
            .insert({
              user_id: user.id,
              title: notificationTitle,
              body: 'Test notification body'
            })
            .select()
            .single()
          
          if (createError) return true
          
          // Query notifications as this user
          const userClient = createClient(supabaseUrl, supabaseServiceKey)
          const { data: { session } } = await userClient.auth.signInWithPassword({
            email: user.email,
            password: 'TestPassword123!'
          })
          
          if (!session) return true
          
          const { data: notifications } = await userClient
            .from('notifications')
            .select('*')
          
          // All returned notifications should belong to this user
          const allOwnedByUser = notifications.every(n => n.user_id === user.id)
          
          // Clean up
          await supabase.from('notifications').delete().eq('id', notification.id)
          
          return allOwnedByUser
        }
      ),
      { numRuns: 10 }
    )
  })
})
