import { useEffect, useState, useCallback } from 'react'
import { supabase } from '../supabaseClient'

/**
 * Custom hook for Supabase Realtime subscriptions
 * Subscribes to telemetry, anomalies, and notifications channels
 * 
 * Feature: haunted-energy-phase2
 * @param {string} homeId - The home ID to subscribe to
 * @param {string} userId - The user ID for notifications
 */
export function useRealtime(homeId, userId) {
  const [telemetryUpdates, setTelemetryUpdates] = useState([])
  const [anomalyUpdates, setAnomalyUpdates] = useState([])
  const [notificationUpdates, setNotificationUpdates] = useState([])
  const [isConnected, setIsConnected] = useState(false)

  // Handle telemetry updates
  const handleTelemetryUpdate = useCallback((payload) => {
    console.log('Telemetry update:', payload)
    setTelemetryUpdates(prev => [...prev, payload.new])
  }, [])

  // Handle anomaly updates
  const handleAnomalyUpdate = useCallback((payload) => {
    console.log('Anomaly update:', payload)
    setAnomalyUpdates(prev => [...prev, payload.new])
  }, [])

  // Handle notification updates
  const handleNotificationUpdate = useCallback((payload) => {
    console.log('Notification update:', payload)
    setNotificationUpdates(prev => [...prev, payload.new])
  }, [])

  useEffect(() => {
    if (!supabase || !homeId || !userId) {
      return
    }

    console.log(`🔮 Subscribing to realtime channels for home: ${homeId}`)

    // Subscribe to telemetry channel
    const telemetryChannel = supabase
      .channel(`telemetry:${homeId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'telemetry',
          filter: `home_id=eq.${homeId}`
        },
        handleTelemetryUpdate
      )
      .subscribe((status) => {
        console.log('Telemetry channel status:', status)
        if (status === 'SUBSCRIBED') {
          setIsConnected(true)
        }
      })

    // Subscribe to anomalies channel
    const anomaliesChannel = supabase
      .channel(`anomalies:${homeId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'anomalies',
          filter: `home_id=eq.${homeId}`
        },
        handleAnomalyUpdate
      )
      .subscribe((status) => {
        console.log('Anomalies channel status:', status)
      })

    // Subscribe to notifications channel
    const notificationsChannel = supabase
      .channel(`notifications:${userId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${userId}`
        },
        handleNotificationUpdate
      )
      .subscribe((status) => {
        console.log('Notifications channel status:', status)
      })

    // Cleanup function
    return () => {
      console.log('🛑 Unsubscribing from realtime channels')
      supabase.removeChannel(telemetryChannel)
      supabase.removeChannel(anomaliesChannel)
      supabase.removeChannel(notificationsChannel)
      setIsConnected(false)
    }
  }, [homeId, userId, handleTelemetryUpdate, handleAnomalyUpdate, handleNotificationUpdate])

  return {
    telemetryUpdates,
    anomalyUpdates,
    notificationUpdates,
    isConnected,
    clearUpdates: () => {
      setTelemetryUpdates([])
      setAnomalyUpdates([])
      setNotificationUpdates([])
    }
  }
}
