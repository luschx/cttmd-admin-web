import bcrypt from 'bcryptjs'
import { db } from '../utils/db'

export default defineEventHandler(async (event) => {
  try {
    const { name, badge_id, password, is_active } = await readBody(event)

    if (!name?.trim() || !badge_id?.trim() || !password) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Name, badge ID and password are required.',
      })
    }

    const hash = await bcrypt.hash(password, 10)

    const { rows } = await db.query(
      `INSERT INTO officer (name, badge_id, password, is_active)
       VALUES ($1, $2, $3, $4)
       RETURNING id, name, badge_id, is_active`,
      [name.trim(), badge_id.trim(), hash, is_active ?? true]
    )
    return rows[0]
  } catch (err: any) {
    console.error(err)

    if (err.statusCode) throw err

    if (err.code === '23505') {
      throw createError({
        statusCode: 409,
        statusMessage: 'That badge ID already exists.',
      })
    }

    throw createError({
      statusCode: 500,
      statusMessage: err.message || 'Unknown error',
    })
  }
})