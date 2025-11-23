import express from 'express'
import { supabase } from '../supabaseClient.js'
import { authenticateUser } from '../middleware/auth.js'

const router = express.Router()

// All routes require authentication
router.use(authenticateUser)

/**
 * GET /api/notifications
 * Get all notifications for the authenticated user
 */
router.get('/', async (req, res) => {
  try {
    const { limit = 50, read } = req.query

    let query = supabase
      .from('notifications')
      .select('*')
      .eq('user_id', req.userId)
      .order('created_at', { ascending: false })
      .limit(parseInt(limit))

    // Filter by read status if specified
    if (read !== undefined) {
      query = query.eq('read', read === 'true')
    }

    const { data: notifications, error } = await query

    if (error) throw error

    res.json({ notifications })
  } catch (error) {
    console.error('Error fetching notifications:', error)
    res.status(500).json({ error: 'Failed to fetch notifications' })
  }
})

/**
 * POST /api/notifications/:id/read
 * Mark a notification as read
 */
router.post('/:id/read', async (req, res) => {
  try {
    const { id } = req.params

    // Verify ownership
    const { data: notification } = await supabase
      .from('notifications')
      .select('user_id')
      .eq('id', id)
      .single()

    if (!notification || notification.user_id !== req.userId) {
      return res.status(403).json({ error: 'Access denied' })
    }

    const { data: updated, error } = await supabase
      .from('notifications')
      .update({ read: true })
      .eq('id', id)
      .select()
      .single()

    if (error) throw error

    res.json({ notification: updated })
  } catch (error) {
    console.error('Error marking notification as read:', error)
    res.status(500).json({ error: 'Failed to mark notification as read' })
  }
})

/**
 * DELETE /api/notifications/:id
 * Delete/dismiss a notification
 */
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params

    // Verify ownership
    const { data: notification } = await supabase
      .from('notifications')
      .select('user_id')
      .eq('id', id)
      .single()

    if (!notification || notification.user_id !== req.userId) {
      return res.status(403).json({ error: 'Access denied' })
    }

    const { error } = await supabase
      .from('notifications')
      .delete()
      .eq('id', id)

    if (error) throw error

    res.json({ message: 'Notification deleted successfully' })
  } catch (error) {
    console.error('Error deleting notification:', error)
    res.status(500).json({ error: 'Failed to delete notification' })
  }
})

/**
 * GET /api/notifications/unread-count
 * Get count of unread notifications
 */
router.get('/unread-count', async (req, res) => {
  try {
    const { count, error } = await supabase
      .from('notifications')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', req.userId)
      .eq('read', false)

    if (error) throw error

    res.json({ count: count || 0 })
  } catch (error) {
    console.error('Error fetching unread count:', error)
    res.status(500).json({ error: 'Failed to fetch unread count' })
  }
})

export default router
