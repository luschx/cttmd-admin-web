import { db } from '../utils/db'

export default defineEventHandler(async () => {
  const { rows } = await db.query(
    'SELECT id, name, badge_id, is_active FROM officer'
  )
  return rows
})