<script setup lang="ts">
const profile = useAdminProfileStore()

const form = reactive({ full_name: '', username: '', position: '', address: '', bio: '' })
const fileInput = ref<HTMLInputElement | null>(null)
const busy = ref(false)
const msg = ref('')
const err = ref('')

function fill() {
  form.full_name = profile.fullName
  form.username = profile.username
  form.position = profile.position
  form.address = profile.address
  form.bio = profile.bio
}

onMounted(async () => {
  if (!profile.loaded) await profile.fetch().catch(() => {})
  fill()
})

function errorText(e: any) {
  return e?.data?.error || e?.data?.detail || 'Something went wrong.'
}

async function onPick(e: Event) {
  const file = (e.target as HTMLInputElement).files?.[0]
  if (!file) return
  err.value = msg.value = ''
  if (!['image/png', 'image/jpeg', 'image/webp'].includes(file.type)) {
    err.value = 'PNG, JPG or WEBP only.'
    return
  }
  if (file.size > 2 * 1024 * 1024) {
    err.value = 'Max 2 MB.'
    return
  }
  busy.value = true
  try {
    await profile.uploadPhoto(file)
    msg.value = 'Photo updated.'
  } catch (e) {
    err.value = errorText(e)
  } finally {
    busy.value = false
    if (fileInput.value) fileInput.value.value = ''
  }
}

async function removePhoto() {
  err.value = msg.value = ''
  busy.value = true
  try {
    await profile.removePhoto()
    msg.value = 'Photo removed.'
  } catch (e) {
    err.value = errorText(e)
  } finally {
    busy.value = false
  }
}

async function save() {
  err.value = msg.value = ''
  busy.value = true
  try {
    await profile.save({ ...form })
    fill()
    msg.value = 'Profile saved.'
  } catch (e) {
    err.value = errorText(e)
  } finally {
    busy.value = false
  }
}
</script>

<template>
  <section class="rounded-2xl bg-white p-6 shadow-sm">
    <h2 class="mb-4 border-l-4 border-blue-600 pl-3 text-lg font-bold text-slate-900">Admin profile</h2>

    <div class="mb-5 flex items-center gap-4">
      <img
        v-if="profile.photoUrl"
        :src="profile.photoUrl"
        alt="Admin"
        class="h-20 w-20 rounded-full object-cover"
      />
      <div
        v-else
        class="flex h-20 w-20 items-center justify-center rounded-full bg-slate-200 text-2xl font-bold text-slate-600"
      >
        {{ profile.initial }}
      </div>

      <div>
        <p class="font-semibold text-slate-900">{{ profile.displayName }}</p>
        <p class="text-sm text-slate-500">{{ profile.position || 'No position set' }}</p>
        <div class="mt-2 flex items-center gap-2">
          <input ref="fileInput" type="file" accept="image/png,image/jpeg,image/webp" class="hidden" @change="onPick" />
          <button
            type="button"
            :disabled="busy"
            class="rounded-lg bg-blue-50 px-3 py-1.5 text-xs font-semibold text-blue-700 disabled:opacity-50"
            @click="fileInput?.click()"
          >
            Upload photo
          </button>
          <button
            v-if="profile.photoUrl"
            type="button"
            :disabled="busy"
            class="px-2 text-xs font-medium text-red-600 disabled:opacity-50"
            @click="removePhoto"
          >
            Remove
          </button>
        </div>
        <p class="mt-1 text-xs text-slate-400">PNG, JPG or WEBP. Max 2 MB.</p>
      </div>
    </div>

    <div class="space-y-4">
      <label class="block">
        <span class="mb-1 block text-sm font-semibold text-slate-800">Full name</span>
        <input v-model="form.full_name" class="w-full rounded-lg bg-slate-100 px-3 py-2.5 text-sm" />
      </label>
      <label class="block">
        <span class="mb-1 block text-sm font-semibold text-slate-800">Username</span>
        <input v-model="form.username" class="w-full rounded-lg bg-slate-100 px-3 py-2.5 text-sm" />
      </label>
      <label class="block">
        <span class="mb-1 block text-sm font-semibold text-slate-800">Position / Title</span>
        <input v-model="form.position" placeholder="e.g. System Administrator" class="w-full rounded-lg bg-slate-100 px-3 py-2.5 text-sm" />
      </label>
      <label class="block">
        <span class="mb-1 block text-sm font-semibold text-slate-800">Address</span>
        <input v-model="form.address" placeholder="Street, Barangay, City / Municipality" class="w-full rounded-lg bg-slate-100 px-3 py-2.5 text-sm" />
      </label>
      <label class="block">
        <span class="mb-1 block text-sm font-semibold text-slate-800">Bio</span>
        <textarea v-model="form.bio" rows="4" placeholder="Short description (optional)" class="w-full rounded-lg bg-slate-100 px-3 py-2.5 text-sm" />
      </label>
    </div>

    <p v-if="err" class="mt-3 text-sm text-red-600">{{ err }}</p>
    <p v-if="msg" class="mt-3 text-sm text-green-600">{{ msg }}</p>

    <button
      type="button"
      :disabled="busy"
      class="mt-4 rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white disabled:opacity-50"
      @click="save"
    >
      Save changes
    </button>
  </section>
</template>