export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id')
  return await djangoFetch(event, `/api/detections/${id}/declined-detail/`)
})