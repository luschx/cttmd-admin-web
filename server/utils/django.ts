import type { H3Event } from 'h3'

export async function djangoFetch<T = any>(
  event: H3Event,
  path: string,
  options: any = {}
): Promise<T> {
  const config = useRuntimeConfig()
  const token = getCookie(event, 'auth_token')

  if (!token) {
    throw createError({ statusCode: 401, statusMessage: 'Not logged in. Please log in again.' })
  }

  try {
    return await $fetch<T>(`${config.djangoBaseUrl}${path}`, {
      ...options,
      headers: { ...(options.headers || {}), Authorization: `Token ${token}` },
    })
  } catch (err: any) {
    const d = err?.data
    const msg =
      d?.error ||
      d?.detail ||
      (d && typeof d === 'object' ? Object.values(d).flat().join(' ') : '') ||
      'Request to server failed.'
    throw createError({ statusCode: err?.statusCode || 500, statusMessage: msg })
  }
}

export function mapEnforcer(e: any) {
  return {
    id: e.id,
    name: e.full_name ?? e.name ?? '',
    officer_code: e.badge_id ?? '',
    status: (e.is_on_duty ?? true) ? 'Active' : 'Inactive',
    zone: e.zone ?? '—',
    violation_count: e.violation_count ?? 0,
  }
}