export default defineEventHandler(async (event) => {
  const data: any = await djangoFetch(event, '/api/enforcers/')
  const list = Array.isArray(data) ? data : data.results ?? []
  return list.slice(0, 3)
})