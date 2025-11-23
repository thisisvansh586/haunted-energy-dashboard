import express from 'express'
import { supabase } from '../supabaseClient.js'
import { authenticateUser, verifyHomeOwnership } from '../middleware/auth.js'

const router = express.Router()

// All routes require authentication
router.use(authenticateUser)

/**
 * GET /api/devices?homeId=xxx
 * List all devices for a home
 */
router.get('/', verifyHomeOwnership, async (req, res) => {
  try {
    const { data: devices, error } = await supabase
      .from('devices')
      .select('*')
      .eq('home_id', req.homeId)
      .order('room', { ascending: true })

    if (error) throw error

    res.json({ devices })
  } catch (error) {
    console.error('Error fetching devices:', error)
    res.status(500).json({ error: 'Failed to fetch devices' })
  }
})

/**
 * POST /api/devices
 * Create a new device
 */
router.post('/', async (req, res) => {
  try {
    const { home_id, name, type, icon, room, idle_threshold, base_power } = req.body

    // Verify home ownership
    const { data: home } = await supabase
      .from('homes')
      .select('owner')
      .eq('id', home_id)
      .single()

    if (!home || home.owner !== req.userId) {
      return res.status(403).json({ error: 'Access denied' })
    }

    const { data: device, error } = await supabase
      .from('devices')
      .insert({
        home_id,
        name,
        type,
        icon: icon || '⚡',
        room,
        idle_threshold: idle_threshold || 2,
        base_power: base_power || 0,
        state: 'off',
        current_power: 0
      })
      .select()
      .single()

    if (error) throw error

    res.status(201).json({ device })
  } catch (error) {
    console.error('Error creating device:', error)
    res.status(500).json({ error: 'Failed to create device' })
  }
})

/**
 * POST /api/devices/:id/toggle
 * Toggle device state (on/off/standby)
 */
router.post('/:id/toggle', async (req, res) => {
  try {
    const { id } = req.params
    const { state } = req.body

    if (!['on', 'off', 'standby'].includes(state)) {
      return res.status(400).json({ error: 'Invalid state. Must be: on, off, or standby' })
    }

    // Get device and verify ownership
    const { data: device } = await supabase
      .from('devices')
      .select('*, homes!inner(owner)')
      .eq('id', id)
      .single()

    if (!device || device.homes.owner !== req.userId) {
      return res.status(403).json({ error: 'Access denied' })
    }

    // Calculate new power based on state
    let current_power = 0
    if (state === 'on') {
      current_power = device.base_power || 100
    } else if (state === 'standby') {
      current_power = device.idle_threshold * 0.8
    }

    // Update device
    const { data: updated, error } = await supabase
      .from('devices')
      .update({ state, current_power })
      .eq('id', id)
      .select()
      .single()

    if (error) throw error

    // Insert telemetry record
    await supabase
      .from('telemetry')
      .insert({
        home_id: device.home_id,
        device_id: id,
        power_w: current_power,
        total_w: current_power
      })

    res.json({ device: updated })
  } catch (error) {
    console.error('Error toggling device:', error)
    res.status(500).json({ error: 'Failed to toggle device' })
  }
})

/**
 * POST /api/devices/:id/control
 * Set device power manually (for simulation)
 */
router.post('/:id/control', async (req, res) => {
  try {
    const { id } = req.params
    const { power } = req.body

    if (typeof power !== 'number' || power < 0) {
      return res.status(400).json({ error: 'Invalid power value' })
    }

    // Get device and verify ownership
    const { data: device } = await supabase
      .from('devices')
      .select('*, homes!inner(owner)')
      .eq('id', id)
      .single()

    if (!device || device.homes.owner !== req.userId) {
      return res.status(403).json({ error: 'Access denied' })
    }

    // Update device power
    const { data: updated, error } = await supabase
      .from('devices')
      .update({ current_power: power })
      .eq('id', id)
      .select()
      .single()

    if (error) throw error

    // Insert telemetry record
    await supabase
      .from('telemetry')
      .insert({
        home_id: device.home_id,
        device_id: id,
        power_w: power,
        total_w: power
      })

    res.json({ device: updated })
  } catch (error) {
    console.error('Error controlling device:', error)
    res.status(500).json({ error: 'Failed to control device' })
  }
})

/**
 * PUT /api/devices/:id
 * Update device details
 */
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params
    const { name, type, icon, room, idle_threshold, base_power } = req.body

    // Get device and verify ownership
    const { data: device } = await supabase
      .from('devices')
      .select('*, homes!inner(owner)')
      .eq('id', id)
      .single()

    if (!device || device.homes.owner !== req.userId) {
      return res.status(403).json({ error: 'Access denied' })
    }

    const updates = {}
    if (name) updates.name = name
    if (type) updates.type = type
    if (icon) updates.icon = icon
    if (room) updates.room = room
    if (idle_threshold !== undefined) updates.idle_threshold = idle_threshold
    if (base_power !== undefined) updates.base_power = base_power

    const { data: updated, error } = await supabase
      .from('devices')
      .update(updates)
      .eq('id', id)
      .select()
      .single()

    if (error) throw error

    res.json({ device: updated })
  } catch (error) {
    console.error('Error updating device:', error)
    res.status(500).json({ error: 'Failed to update device' })
  }
})

/**
 * DELETE /api/devices/:id
 * Delete a device
 */
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params

    // Get device and verify ownership
    const { data: device } = await supabase
      .from('devices')
      .select('*, homes!inner(owner)')
      .eq('id', id)
      .single()

    if (!device || device.homes.owner !== req.userId) {
      return res.status(403).json({ error: 'Access denied' })
    }

    const { error } = await supabase
      .from('devices')
      .delete()
      .eq('id', id)

    if (error) throw error

    res.json({ message: 'Device deleted successfully' })
  } catch (error) {
    console.error('Error deleting device:', error)
    res.status(500).json({ error: 'Failed to delete device' })
  }
})

export default router
