export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig()
  const body = await readBody(event)

  try {
    const res: any = await $fetch(`${config.djangoBaseUrl}/api/auth/admin-login/`, {
      method: 'POST',
      body: { username: body.username, password: body.password },
    })

    setCookie(event, 'auth_token', res.token, {
      httpOnly: true,
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24,
    })

    return res
  } catch (err: any) {
    throw createError({
      statusCode: err?.statusCode || 401,
      statusMessage: err?.data?.error || 'Login failed',
    })
  }
})