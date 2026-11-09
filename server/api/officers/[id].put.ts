export default defineEventHandler(async (event) => {
  const id = Number(getRouterParam(event, 'id'))
  const { name, badge_id, password, is_active } = await readBody(event)

  if (!Number.isInteger(id)) {
    throw createError({ statusCode: 400, statusMessage: 'Invalid enforcer id.' })
  }
  if (!name?.trim() || !badge_id?.trim()) {
    throw createError({ statusCode: 400, statusMessage: 'Name and badge ID are required.' })
  }
  if (password && password.length < 6) {
    throw createError({ statusCode: 400, statusMessage: 'Password must be at least 6 characters.' })
  }

  const body: any = {
    full_name: name.trim(),
    badge_id: badge_id.trim(),
    is_on_duty: is_active ?? true,
  }
  if (password) body.password = password

  const updated = await djangoFetch(event, `/api/enforcers/${id}/`, {
    method: 'PATCH',
    body,
  })
  return mapEnforcer(updated)
})