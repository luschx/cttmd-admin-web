import { useAuthStore } from '~/stores/auth'

export function useAuth() {
  const authStore = useAuthStore()

  async function login(username: string, password: string) {
    const res: any = await $fetch('/api/auth/login', {
      method: 'POST',
      body: { username, password },
    })

    if (!res?.token) throw new Error('No token in response')

    authStore.login(
      { username: res.username, is_superuser: res.is_superuser } as any,
      res.token
    )
  }

  return { login }
}