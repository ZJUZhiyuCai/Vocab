import { supabase } from './supabase'
import { ref } from 'vue'

export const user = ref(null)
export const authError = ref(null)

// Check for auth errors in URL hash on page load
function checkAuthErrorInHash() {
    const hash = window.location.hash
    if (hash && hash.includes('error=')) {
        const params = new URLSearchParams(hash.substring(1))
        const error = params.get('error')
        const errorCode = params.get('error_code')
        const errorDescription = params.get('error_description')

        if (error) {
            console.error('🚨 Auth Error from URL:', {
                error,
                errorCode,
                errorDescription: decodeURIComponent(errorDescription || '')
            })
            authError.value = {
                error,
                errorCode,
                message: decodeURIComponent(errorDescription || error)
            }
            // Clear the hash to prevent confusion
            window.history.replaceState(null, '', window.location.pathname)
            return true
        }
    }
    return false
}

// Check for auth errors first
const hasAuthError = checkAuthErrorInHash()

// Initialize user session
supabase.auth.getSession().then(({ data: { session }, error }) => {
    if (error) {
        console.error('🚨 getSession Error:', error)
    }
    user.value = session?.user ?? null
    console.log('🔐 Session initialized:', session ? 'Logged in as ' + session.user.email : 'Not logged in')
})

// Listen for auth state changes
supabase.auth.onAuthStateChange((event, session) => {
    console.log('🔐 Auth state changed:', event)
    user.value = session?.user ?? null

    if (event === 'SIGNED_IN') {
        console.log('✅ User signed in:', session?.user?.email)
        authError.value = null
    } else if (event === 'SIGNED_OUT') {
        console.log('👋 User signed out')
    } else if (event === 'TOKEN_REFRESHED') {
        console.log('🔄 Token refreshed')
    }
})

export const authService = {

    /**
     * OAuth Login (Google/GitHub)
     */
    async signInWithOAuth(provider) {
        const redirectUrl = import.meta.env.VITE_REDIRECT_URL || window.location.origin
        console.log('🔐 Redirect URL (OAuth):', redirectUrl)

        const { data, error } = await supabase.auth.signInWithOAuth({
            provider,
            options: {
                redirectTo: redirectUrl
            }
        })
        return { data, error }
    },

    /**
     * Email Magic Link Login
     */
    async signInWithMagicLink(email) {
        const redirectUrl = import.meta.env.VITE_REDIRECT_URL || window.location.origin
        console.log('🔐 Redirect URL (Magic Link):', redirectUrl)

        const { data, error } = await supabase.auth.signInWithOtp({
            email,
            options: {
                emailRedirectTo: redirectUrl
            }
        })

        if (error) {
            console.error('🚨 Magic Link Error:', error)
        } else {
            console.log('📧 Magic link sent to:', email)
        }

        return { data, error }
    },

    /**
     * Sign Out
     */
    async signOut() {
        const { error } = await supabase.auth.signOut()
        return { error }
    },

    /**
     * Get current user
     */
    getUser() {
        return user.value
    },

    /**
     * Check if logged in
     */
    isLoggedIn() {
        return !!user.value
    },

    /**
     * Get auth error from URL (if any)
     */
    getAuthError() {
        return authError.value
    },

    /**
     * Clear auth error
     */
    clearAuthError() {
        authError.value = null
    }
}
