import { supabase } from './supabase'
import { ref } from 'vue'

export const user = ref(null)

// Initialize user session
supabase.auth.getSession().then(({ data: { session } }) => {
    user.value = session?.user ?? null
})

// Listen for auth state changes
supabase.auth.onAuthStateChange((_event, session) => {
    user.value = session?.user ?? null
})

export const authService = {

    /**
     * OAuth Login (Google/GitHub)
     */
    async signInWithOAuth(provider) {
        const { data, error } = await supabase.auth.signInWithOAuth({
            provider,
            options: {
                redirectTo: window.location.origin
            }
        })
        return { data, error }
    },

    /**
     * Email Magic Link Login
     */
    async signInWithMagicLink(email) {
        const { data, error } = await supabase.auth.signInWithOtp({
            email,
            options: {
                emailRedirectTo: window.location.origin
            }
        })
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
    }
}
