export default defineEventHandler(async (event) => {
  const data: any[] = await djangoFetch(event, '/api/admin/tickets/search/')
  return data.map((t) => ({
    id: t.id,
    plate_number: t.plate_number ?? '',
    location: t.location,
    violation: t.violation,
    datetime: t.date_issued,
    status: t.status === 'paid' ? 'Paid' : 'Unpaid',
    officers: t.enforcer_badge
      ? { name: t.enforcer_name, officer_code: t.enforcer_badge }
      : null,
  }))
})