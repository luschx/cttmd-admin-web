export default defineEventHandler(async (event) => {
  const [tix, vio]: any[] = await Promise.all([
    djangoFetch(event, '/api/admin/tickets/search/'),
    djangoFetch(event, '/api/violations/').catch(() => []),
  ])
  const tickets = Array.isArray(tix) ? tix : tix.results ?? []
  const violations = Array.isArray(vio) ? vio : vio.results ?? []

  // fine lookup by violation id or name (fallback when the ticket has no fine_amount)
  const fines: Record<string, number> = {}
  for (const v of violations) {
    const fine = Number(v.fine_amount) || 0
    fines[String(v.id)] = fine
    if (v.name) fines[String(v.name)] = fine
    if (v.title) fines[String(v.title)] = fine
  }

  const months: Record<string, any> = {}
  for (const t of tickets) {
    const d = new Date(t.date_issued)
    if (isNaN(d.getTime())) continue
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
    const label = d.toLocaleString('en-US', { month: 'long', year: 'numeric' })
    const m = (months[key] ??= { key, month: label, total: 0, settled: 0, pending: 0, revenue: 0 })
    m.total++
    if (String(t.status).toLowerCase() === 'paid') {
      m.settled++
      m.revenue += Number(t.fine_amount) || fines[String(t.violation)] || 0
    } else {
      m.pending++
    }
  }

  return Object.values(months)
    .sort((a: any, b: any) => b.key.localeCompare(a.key))
    .map(({ key, ...rest }: any) => rest)
})