import bcrypt from 'bcryptjs'
import { db } from '../../utils/db'

export default defineEventHandler(async (event) => {
  const id = Number(getRouterParam(event, 'id'))
  const { name, badge_id, password, is_active } = await readBody(event)

  if (!Number.isInteger(id)) {
    throw createError({ statusCode: 400, statusMessage: 'Invalid officer id.' })
  }
  if (!name?.trim() || !badge_id?.trim()) {
    throw createError({ statusCode: 400, statusMessage: 'Name and badge ID are required.' })
  }

  try {
    const hash = password ? await bcrypt.hash(password, 10) : null

    const { rows } = await db.query(
      `UPDATE officer
       SET name = $1, badge_id = $2, is_active = $3, password = COALESCE($4, password)
       WHERE id = $5
       RETURNING id, name, badge_id, is_active`,
      [name.trim(), badge_id.trim(), is_active ?? true, hash, id]
    )

    if (!rows.length) {
      throw createError({ statusCode: 404, statusMessage: 'Officer not found.' })
    }
    return rows[0]
  } catch (err: any) {
    if (err.statusCode) throw err

    if (err.code === '23505') {
      throw createError({ statusCode: 409, statusMessage: 'That badge ID already exists.' })
    }

    console.error(err)
    throw createError({
      statusCode: 500,
      statusMessage: err.message || 'Failed to update officer.',
    })
  }
})