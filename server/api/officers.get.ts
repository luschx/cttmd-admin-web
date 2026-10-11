export default defineEventHandler(async (event) => {
  const [enf, tix]: any[] = await Promise.all([
    djangoFetch(event, '/api/enforcers/'),
    djangoFetch(event, '/api/tickets/'),
  ])
  const enforcers = Array.isArray(enf) ? enf : enf.results ?? []
  const tickets = Array.isArray(tix) ? tix : tix.results ?? []

  const counts: Record<number, number> = {}
  for (const t of tickets) {
    if (t.enforcer) counts[t.enforcer] = (counts[t.enforcer] ?? 0) + 1
  }

  return enforcers.map((e: any) => ({
    ...mapEnforcer(e),
    violation_count: counts[e.id] ?? 0,
  }))
})