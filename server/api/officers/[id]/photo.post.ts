// Change this to the picture field name your Django enforcer model/serializer uses
const DJANGO_PHOTO_FIELD = 'profile_picture'

export default defineEventHandler(async (event) => {
  const id = Number(getRouterParam(event, 'id'))
  if (!Number.isInteger(id)) {
    throw createError({ statusCode: 400, statusMessage: 'Invalid enforcer id.' })
  }

  const parts = await readMultipartFormData(event)
  const file = parts?.find((p) => p.name === 'photo' && p.filename)

  if (!file) {
    throw createError({ statusCode: 400, statusMessage: 'No image uploaded.' })
  }
  if (!file.type?.startsWith('image/')) {
    throw createError({ statusCode: 400, statusMessage: 'File must be an image.' })
  }
  if (file.data.length > 5 * 1024 * 1024) {
    throw createError({ statusCode: 400, statusMessage: 'Image must be under 5 MB.' })
  }

  const fd = new FormData()
  fd.append(
    DJANGO_PHOTO_FIELD,
    new Blob([file.data as unknown as BlobPart], { type: file.type }),
    file.filename
  )

  const updated = await djangoFetch(event, `/api/enforcers/${id}/`, {
    method: 'PATCH',
    body: fd,
  })
  return mapEnforcer(updated)
})