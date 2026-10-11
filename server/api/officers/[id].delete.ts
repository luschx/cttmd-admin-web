import { db } from '../../utils/db'

export default defineEventHandler(async (event) => {
  const id = Number(getRouterParam(event, 'id'))

  if (!Number.isInteger(id)) {
    throw createError({ statusCode: 400, statusMessage: 'Invalid officer id.' })
  }

  try {
    const { rowCount } = await db.query('DELETE FROM officer WHERE id = $1', [id])

    if (!rowCount) {
      throw createError({ statusCode: 404, statusMessage: 'Officer not found.' })
    }
    return { ok: true }
  } catch (err: any) {
    if (err.statusCode) throw err

    if (err.code === '23503') {
      throw createError({
        statusCode: 409,
        statusMessage:
          "This officer has recorded violations or tickets, so they can't be deleted. Set them to inactive instead.",
      })
    }

    console.error(err)
    throw createError({
      statusCode: 500,
      statusMessage: err.message || 'Failed to delete officer.',
    })
  }
})