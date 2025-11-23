import express from 'express'
import { supabase } from '../supabaseClient.js'
import { authenticateUser, verifyHomeOwnership } from '../middleware/auth.js'

const router = express.Router()

// All routes require authentication
router.use(authenticateUser)

/**
 * GET /api/anomalies?homeId=xxx
 * Get recent anomalies for a home
 */
router.get('/', verifyHomeOwnership, async (req, res) => {
  try {
    const { limit = 50, resolved } = req.query

    let query = supabase
      .from('anomalies')
      .select('*, devices(name, icon, room)')
      .eq('home_id', req.homeId)
      .order('created_at', { ascending: false })
      .limit(parseInt(limit))

    if (resolved !== undefined) {
      query = query.eq('resolved', resolved === 'true')
    }

    const { data: anomalies, error } = await query

    if (error) throw error

    res.json({ anomalies })
  } catch (error) {
    console.error('Error fetching anomalies:', error)
    res.status(500).json({ error: 'Failed to fetch anomalies' })
  }
})

/**
 * POST /api/anomalies/:id/resolve
 * Mark an anomaly as resolved
 */
router.post('/:id/resolve', async (req, res) => {
  try {
    const { id } = req.params

    // Get anomaly and verify ownership
    const { data: anomaly } = await supabase
      .from('anomalies')
      .select('*, homes!inner(owner)')
      .eq('id', id)
      .single()

    if (!anomaly || anomaly.homes.owner !== req.userId) {
      return res.status(403).json({ error: 'Access denied' })
    }

    const { data: updated, error } = await supabase
      .from('anomalies')
      .update({ 
        resolved: true,
        resolved_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single()

    if (error) throw error

    res.json({ anomaly: updated })
  } catch (error) {
    console.error('Error resolving anomaly:', error)
    res.status(500).json({ error: 'Failed to resolve anomaly' })
  }
})

/**
 * DELETE /api/anomalies/:id
 * Delete an anomaly
 */
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params

    // Get anomaly and verify ownership
    const { data: anomaly } = await supabase
      .from('anomalies')
      .select('*, homes!inner(owner)')
      .eq('id', id)
      .single()

    if (!anomaly || anomaly.homes.owner !== req.userId) {
      return res.status(403).json({ error: 'Access denied' })
    }

    const { error } = await supabase
      .from('anomalies')
      .delete()
      .eq('id', id)

    if (error) throw error

    res.json({ message: 'Anomaly deleted successfully' })
  } catch (error) {
    console.error('Error deleting anomaly:', error)
    res.status(500).json({ error: 'Failed to delete anomaly' })
  }
})

export default router
