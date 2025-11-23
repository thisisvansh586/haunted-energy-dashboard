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

          // Get current session
          const { data: { session } } = await supabase.auth.getSession()
          
          if (session) {
            set({ session, user: session.user })
          }

          // Listen for auth changes
          supabase.auth.onAuthStateChange((_event, session) => {
            set({ session, user: session?.user || null })
          })

          set({ loading: false })
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

      // Get auth token for API calls (with refresh)
      getToken: async () => {
        if (!supabase) return null
        
        // Get fresh session
        const { data: { session } } = await supabase.auth.getSession()
        
        if (session) {
          set({ session, user: session.user })
          return session.access_token
        }
        
        return null
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
