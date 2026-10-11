import { db } from '../utils/db'

export default defineEventHandler(async () => {
  const { rows } = await db.query(`
    SELECT
      to_char(date_trunc('month', v.apprehension_dt), 'FMMonth YYYY') AS month,
      COUNT(DISTINCT v.id)::int AS total,
      COUNT(DISTINCT v.id) FILTER (WHERE v.white_paid OR v.yellow_paid)::int AS settled,
      COUNT(DISTINCT v.id) FILTER (WHERE NOT (v.white_paid OR v.yellow_paid))::int AS pending,
      COALESCE(SUM(t.fine_amount) FILTER (WHERE t.paid_at IS NOT NULL), 0)::float AS revenue
    FROM violation v
    LEFT JOIN ticket t ON t.violation_id = v.id
    GROUP BY date_trunc('month', v.apprehension_dt)
    ORDER BY date_trunc('month', v.apprehension_dt) DESC
  `)
  return rows
})