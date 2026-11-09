import { useAuthStore } from '~/stores/auth'

export default defineNuxtPlugin({
  name: 'auth-persist',
  dependsOn: ['pinia'],
  setup() {
    const auth = useAuthStore()

    const options = {
      maxAge: 60 * 60 * 24 * 7, // 7 days
      sameSite: 'lax' as const,
    }
    const tokenCookie = useCookie<string | null>('auth_token', options)
    const userCookie = useCookie<any | null>('auth_user', options)

    // Restore the session on page load / refresh
    if (tokenCookie.value && !auth.token) {
      auth.token = tokenCookie.value
      auth.user = userCookie.value ?? null
    }

    // Keep the cookies in sync with the store
    watch(
      () => [auth.token, auth.user],
      ([token, user]) => {
        tokenCookie.value = token as string | null
        userCookie.value = user as any
      },
      { deep: true }
    )
  },
})