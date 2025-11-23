import express from 'express'
import { supabase } from '../supabaseClient.js'
import { authenticateUser } from '../middleware/auth.js'

const router = express.Router()

/**
 * POST /api/auth/setup-demo-home
 * Create demo home and devices for new users
 * Requires authentication
 */
router.post('/setup-demo-home', authenticateUser, async (req, res) => {
  try {
    // Check if user already has homes
    const { data: existingHomes } = await supabase
      .from('homes')
      .select('id')
      .eq('owner', req.userId)
      .limit(1)

    if (existingHomes && existingHomes.length > 0) {
      return res.status(400).json({ error: 'User already has homes' })
    }

    // Create demo home
    const { data: home, error: homeError } = await supabase
      .from('homes')
      .insert({
        owner: req.userId,
        name: 'Haunted Manor'
      })
      .select()
      .single()

    if (homeError) throw homeError

    // Create demo devices
    const demoDevices = [
      {
        home_id: home.id,
        name: 'Haunted Fridge',
        type: 'appliance',
        icon: '🧊',
        room: 'Kitchen',
        state: 'on',
        idle_threshold: 10.0,
        base_power: 145.2,
        current_power: 145.2
      },
      {
        home_id: home.id,
        name: 'Phantom TV',
        type: 'entertainment',
        icon: '📺',
        room: 'Living Room',
        state: 'standby',
        idle_threshold: 5.0,
        base_power: 2.5,
        current_power: 4.0
      },
      {
        home_id: home.id,
        name: 'Cursed AC',
        type: 'hvac',
        icon: '❄️',
        room: 'Bedroom',
        state: 'on',
        idle_threshold: 15.0,
        base_power: 1850.0,
        current_power: 1850.0
      },
      {
        home_id: home.id,
        name: 'Possessed Washer',
        type: 'appliance',
        icon: '🌀',
        room: 'Laundry Room',
        state: 'off',
        idle_threshold: 8.0,
        base_power: 0.0,
        current_power: 0.0
      },
      {
        home_id: home.id,
        name: 'Eerie Lamp',
        type: 'lighting',
        icon: '💡',
        room: 'Study',
        state: 'on',
        idle_threshold: 2.0,
        base_power: 12.0,
        current_power: 12.0
      }
    ]

    const { data: devices, error: devicesError } = await supabase
      .from('devices')
      .insert(demoDevices)
      .select()

    if (devicesError) throw devicesError

    // Create welcome notification
    await supabase
      .from('notifications')
      .insert({
        user_id: req.userId,
        title: 'Welcome to Haunted Manor',
        body: 'Your demo home has been created with 5 haunted devices. Start monitoring your energy consumption!',
        level: 'success'
      })

    res.status(201).json({
      message: 'Demo home created successfully',
      home,
      devices
    })
  } catch (error) {
    console.error('Error setting up demo home:', error)
    res.status(500).json({ error: 'Failed to setup demo home' })
  }
})

/**
 * GET /api/auth/profile
 * Get current user profile
 */
router.get('/profile', authenticateUser, async (req, res) => {
  try {
    res.json({ user: req.user })
  } catch (error) {
    console.error('Error fetching profile:', error)
    res.status(500).json({ error: 'Failed to fetch profile' })
  }
})

export default router
