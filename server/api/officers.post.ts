export default defineEventHandler(async (event) => {
  const { name, badge_id, password } = await readBody(event)

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
      contact_number: '',
    },
  })
  return mapEnforcer(created)
})