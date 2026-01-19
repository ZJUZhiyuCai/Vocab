import { computed } from 'vue'
import { user, authService } from '../utils/authService'

export function useAuth() {
    const isLoggedIn = computed(() => !!user.value)
    const currentUser = computed(() => user.value)


    const loginWithGoogle = () => authService.signInWithOAuth('google')
    const loginWithGithub = () => authService.signInWithOAuth('github')
    const loginWithMagicLink = (email) => authService.signInWithMagicLink(email)
    const logout = () => authService.signOut()

    return {
        user: currentUser,
        isLoggedIn,
        loginWithGoogle,
        loginWithGithub,
        loginWithMagicLink,
        logout
    }
}
