export default defineEventHandler(async (event) => {
  const [tix, vio]: any[] = await Promise.all([
    djangoFetch(event, '/api/tickets/'),
    djangoFetch(event, '/api/violations/'),
  ])
  const tickets = Array.isArray(tix) ? tix : tix.results ?? []
  const violations = Array.isArray(vio) ? vio : vio.results ?? []

  const fines: Record<number, number> = {}
  for (const v of violations) fines[v.id] = Number(v.fine_amount) || 0

  const months: Record<string, any> = {}
  for (const t of tickets) {
    const d = new Date(t.date_issued)
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
    const label = d.toLocaleString('en-US', { month: 'long', year: 'numeric' })
    const m = (months[key] ??= { key, month: label, total: 0, settled: 0, pending: 0, revenue: 0 })
    m.total++
    if (t.status === 'paid') {
      m.settled++
      m.revenue += fines[t.violation] ?? 0
    } else {
      m.pending++
    }
  }

  return Object.values(months)
    .sort((a: any, b: any) => b.key.localeCompare(a.key))
    .map(({ key, ...rest }: any) => rest)
})