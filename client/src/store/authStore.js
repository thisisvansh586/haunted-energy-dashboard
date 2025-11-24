import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { supabase, signIn, signUp, signOut, getCurrentUser } from '../supabaseClient'

/**
 * Authentication store using Zustand
 * Persists session to localStorage
 */
export const useAuthStore = create(
  persist(
    (set, get) => ({
      // State
      user: null,
      session: null,
      loading: true,
      error: null,

      // Actions
      setUser: (user) => set({ user }),
      setSession: (session) => set({ session }),
      setLoading: (loading) => set({ loading }),
      setError: (error) => set({ error }),

      // Initialize auth state
      initialize: async () => {
        try {
          set({ loading: true, error: null })
          
          if (!supabase) {
            set({ loading: false })
            return
          }

          // Get current session from Supabase
          const { data: { session }, error: sessionError } = await supabase.auth.getSession()
          
          if (sessionError) {
            console.error('Session error:', sessionError)
          }
          
          if (session) {
            console.log('✅ Session loaded:', session.user.email)
            set({ session, user: session.user })
          } else {
            console.log('ℹ️ No active session')
            set({ session: null, user: null })
          }

          // Listen for auth state changes (login, logout, token refresh)
          const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
            console.log('🔄 Auth state changed:', event, session?.user?.email)
            
            if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
              set({ session, user: session?.user || null })
            } else if (event === 'SIGNED_OUT') {
              set({ session: null, user: null })
            } else if (event === 'USER_UPDATED') {
              set({ session, user: session?.user || null })
            }
          })

          // Store subscription for cleanup
          set({ loading: false, authSubscription: subscription })
        } catch (error) {
          console.error('Auth initialization error:', error)
          set({ error: error.message, loading: false })
        }
      },

      // Sign in
      signIn: async (email, password) => {
        try {
          set({ loading: true, error: null })
          const { data, error } = await signIn(email, password)
          
          if (error) throw error
          
          set({ 
            user: data.user, 
            session: data.session,
            loading: false 
          })
          
          return { data, error: null }
        } catch (error) {
          set({ error: error.message, loading: false })
          return { data: null, error }
        }
      },

      // Sign up
      signUp: async (email, password) => {
        try {
          set({ loading: true, error: null })
          const { data, error } = await signUp(email, password)
          
          if (error) throw error
          
          set({ 
            user: data.user, 
            session: data.session,
            loading: false 
          })
          
          return { data, error: null }
        } catch (error) {
          set({ error: error.message, loading: false })
          return { data: null, error }
        }
      },

      // Sign out
      signOut: async () => {
        try {
          set({ loading: true, error: null })
          const { error } = await signOut()
          
          if (error) throw error
          
          set({ user: null, session: null, loading: false })
          return { error: null }
        } catch (error) {
          set({ error: error.message, loading: false })
          return { error }
        }
      },

      // Get auth token for API calls (with automatic refresh)
      getToken: async () => {
        if (!supabase) {
          console.warn('⚠️ Supabase not configured')
          return null
        }
        
        try {
          // Get current session (Supabase automatically refreshes if needed)
          const { data: { session }, error } = await supabase.auth.getSession()
          
          if (error) {
            console.error('Error getting session:', error)
            return null
          }
          
          if (session?.access_token) {
            // Update store with fresh session
            set({ session, user: session.user })
            console.log('✅ Token retrieved for:', session.user.email)
            return session.access_token
          }
          
          console.warn('⚠️ No active session - user needs to log in')
          set({ session: null, user: null })
          return null
        } catch (error) {
          console.error('Error in getToken:', error)
          return null
        }
      },

      // Check if user is authenticated
      isAuthenticated: () => {
        return !!get().user
      }
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({ 
        user: state.user, 
        session: state.session 
      })
    }
  )
)
