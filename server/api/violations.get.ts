import { db } from '../utils/db'

export default defineEventHandler(async () => {
  const { rows } = await db.query(`
    SELECT
      v.id,
      COALESCE(v.plate_number, '') AS plate_number,
      v.location_desc AS location,
      v.apprehension_dt AS datetime,
      v.status,
      v.white_paid,
      v.yellow_paid,
      CASE WHEN o.id IS NULL THEN NULL
           ELSE json_build_object('name', o.name, 'officer_code', o.badge_id)
      END AS officers
    FROM violation v
    LEFT JOIN officer o ON o.id = v.officer_id
    ORDER BY v.apprehension_dt DESC
  `)
  return rows
})