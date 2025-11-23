import express from 'express'
import { supabase } from '../supabaseClient.js'
import { authenticateUser } from '../middleware/auth.js'

const router = express.Router()

// All routes require authentication
router.use(authenticateUser)

/**
 * GET /api/homes
 * List all homes for the authenticated user
 */
router.get('/', async (req, res) => {
  try {
    const { data: homes, error } = await supabase
      .from('homes')
      .select('*')
      .eq('owner', req.userId)
      .order('created_at', { ascending: false })

    if (error) throw error

    res.json({ homes })
  } catch (error) {
    console.error('Error fetching homes:', error)
    res.status(500).json({ error: 'Failed to fetch homes' })
  }
})

/**
 * POST /api/homes
 * Create a new home
 */
router.post('/', async (req, res) => {
  try {
    const { name } = req.body

    if (!name || name.trim().length === 0) {
      return res.status(400).json({ error: 'Home name is required' })
    }

    const { data: home, error } = await supabase
      .from('homes')
      .insert({
        owner: req.userId,
        name: name.trim()
      })
      .select()
      .single()

    if (error) throw error

    res.status(201).json({ home })
  } catch (error) {
    console.error('Error creating home:', error)
    res.status(500).json({ error: 'Failed to create home' })
  }
})

/**
 * PUT /api/homes/:id
 * Update a home
 */
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params
    const { name } = req.body

    if (!name || name.trim().length === 0) {
      return res.status(400).json({ error: 'Home name is required' })
    }

    // Verify ownership
    const { data: existing } = await supabase
      .from('homes')
      .select('owner')
      .eq('id', id)
      .single()

    if (!existing || existing.owner !== req.userId) {
      return res.status(403).json({ error: 'Access denied' })
    }

    const { data: home, error } = await supabase
      .from('homes')
      .update({ name: name.trim() })
      .eq('id', id)
      .select()
      .single()

    if (error) throw error

    res.json({ home })
  } catch (error) {
    console.error('Error updating home:', error)
    res.status(500).json({ error: 'Failed to update home' })
  }
})

/**
 * DELETE /api/homes/:id
 * Delete a home (cascades to devices, telemetry, anomalies)
 */
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params

    // Verify ownership
    const { data: existing } = await supabase
      .from('homes')
      .select('owner')
      .eq('id', id)
      .single()

    if (!existing || existing.owner !== req.userId) {
      return res.status(403).json({ error: 'Access denied' })
    }

    const { error } = await supabase
      .from('homes')
      .delete()
      .eq('id', id)

    if (error) throw error

    res.json({ message: 'Home deleted successfully' })
  } catch (error) {
    console.error('Error deleting home:', error)
    res.status(500).json({ error: 'Failed to delete home' })
  }
})

export default router
