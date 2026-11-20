// server/api/tickets/[id]/pay.post.ts
export default defineEventHandler(async (event) => {
  const id = Number(getRouterParam(event, 'id'))
  if (!Number.isInteger(id)) {
    throw createError({ statusCode: 400, statusMessage: 'Invalid ticket id.' })
  }

  const body = await readBody(event)

  // Violator signature is required (web settlement only)
  const sig = body?.violator_signature
  if (typeof sig !== 'string' || !sig.startsWith('data:image/png;base64,')) {
    throw createError({ statusCode: 400, statusMessage: 'Violator signature is required.' })
  }
  // ~1.5 MB cap on the base64 string
  if (sig.length > 1_500_000) {
    throw createError({ statusCode: 413, statusMessage: 'Signature is too large.' })
  }

  const ticket = await djangoFetch(event, `/api/admin/tickets/${id}/pay/`, {
    method: 'POST',
    body,
  })
  return withViolatorSignature(ticket)
})