export default defineEventHandler(async (event) => {
  const { name, badge_id, password, zone, phone_number } = await readBody(event)

  if (!name?.trim() || !badge_id?.trim() || !password) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Name, badge ID and password are required.',
    })
  }

  const created = await djangoFetch(event, '/api/admin/enforcers/create/', {
    method: 'POST',
    body: {
      badge_id: badge_id.trim(),
      full_name: name.trim(),
      password,
      contact_number: String(phone_number ?? '').trim(),
      assigned_area: zone ?? '',
    },
  })
  return mapEnforcer(created)
})