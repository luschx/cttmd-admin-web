<template>
  <div>
    <div class="flex items-center justify-between mb-6">
      <div>
        <h1 class="text-3xl font-bold text-gray-900">Officers</h1>
        <p class="text-blue-500 text-sm mt-1">Manage enforcement officers</p>
      </div>
      <button @click="openModal" class="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl text-sm font-medium flex items-center gap-2 transition-colors">
        <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
        </svg>
        Add Officer
      </button>
    </div>

    <div class="relative mb-6">
      <svg class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-4.35-4.35M17 11A6 6 0 115 11a6 6 0 0112 0z" />
      </svg>
      <input v-model="search" type="text" placeholder="Search officers..." class="w-full border border-gray-200 rounded-xl pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
    </div>

    <div v-if="loading" class="text-center text-gray-400 text-sm py-10">Loading...</div>

    <div v-else class="grid grid-cols-2 gap-4">
      <div v-for="officer in filtered" :key="officer.id" class="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
        <div class="flex items-start justify-between mb-4">
          <div class="flex items-center gap-3">
            <div class="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center shrink-0">
              <svg xmlns="http://www.w3.org/2000/svg" class="w-6 h-6 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
            <div>
              <div class="font-semibold text-gray-900">Officer {{ officer.name }}</div>
              <div class="text-xs text-gray-400">{{ officer.officer_code }}</div>
            </div>
          </div>
          <div class="flex items-center gap-1">
            <span :class="officer.status === 'Active' ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-500'" class="px-3 py-1 rounded-full text-xs font-medium mr-1">
              {{ officer.status }}
            </span>
            <button
              @click="openEdit(officer)"
              title="Edit officer"
              class="p-1.5 rounded-lg text-gray-400 hover:text-blue-600 hover:bg-blue-50 transition-colors"
            >
              <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
            </button>
            <button
              @click="askDelete(officer)"
              title="Delete officer"
              class="p-1.5 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors"
            >
              <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>
          </div>
        </div>
        <div class="space-y-2 text-sm border-t border-gray-50 pt-4">
          <div class="flex justify-between">
            <span class="text-gray-400">Assigned Zone</span>
            <span class="font-medium text-gray-700">{{ officer.zone }}</span>
          </div>
          <div class="flex justify-between">
            <span class="text-gray-400">Total Violations</span>
            <span class="font-medium text-gray-700">{{ officer.violation_count ?? 0 }}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Add / Edit Officer modal -->
    <div
      v-if="showModal"
      class="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4"
      @click.self="showModal = false"
    >
      <div class="bg-white rounded-2xl shadow-xl w-full max-w-md p-6">
        <div class="flex items-center justify-between mb-5">
          <h2 class="text-xl font-bold text-gray-900">{{ editingId ? 'Edit Officer' : 'Add Officer' }}</h2>
          <button @click="showModal = false" class="text-gray-400 hover:text-gray-600 text-2xl leading-none">&times;</button>
        </div>

        <form @submit.prevent="saveOfficer" class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Full name</label>
            <input v-model="form.name" type="text" required placeholder="e.g. Juan Dela Cruz" class="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Badge ID</label>
            <input v-model="form.badge_id" type="text" required placeholder="e.g. B-001" class="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Password</label>
            <input v-model="form.password" type="password" :required="!editingId" minlength="6" :placeholder="editingId ? 'Leave blank to keep current password' : 'At least 6 characters'" class="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>

          <label class="flex items-center gap-2 text-sm text-gray-700">
            <input v-model="form.is_active" type="checkbox" class="rounded border-gray-300" />
            Active officer
          </label>

          <p v-if="formError" class="text-sm text-red-500">{{ formError }}</p>

          <div class="flex justify-end gap-3 pt-2">
            <button type="button" @click="showModal = false" class="border border-gray-200 rounded-xl px-5 py-2.5 text-sm font-medium hover:bg-gray-50">
              Cancel
            </button>
            <button type="submit" :disabled="saving" class="bg-blue-600 hover:bg-blue-700 text-white rounded-xl px-5 py-2.5 text-sm font-medium disabled:opacity-50">
              {{ saving ? 'Saving...' : editingId ? 'Save changes' : 'Add officer' }}
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- Delete confirmation modal -->
    <div
      v-if="deleteTarget"
      class="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4"
      @click.self="closeDelete"
    >
      <div class="bg-white rounded-2xl shadow-xl w-full max-w-sm p-6">
        <h2 class="text-xl font-bold text-gray-900 mb-2">Delete officer?</h2>
        <p class="text-sm text-gray-600">
          You are about to delete
          <span class="font-semibold">{{ deleteTarget.name }}</span>
          ({{ deleteTarget.officer_code }}). This cannot be undone.
        </p>

        <p v-if="deleteError" class="text-sm text-red-500 mt-3">{{ deleteError }}</p>

        <div class="flex justify-end gap-3 pt-5">
          <button @click="closeDelete" class="border border-gray-200 rounded-xl px-5 py-2.5 text-sm font-medium hover:bg-gray-50">
            Cancel
          </button>
          <button @click="removeOfficer" :disabled="deleting" class="bg-red-600 hover:bg-red-700 text-white rounded-xl px-5 py-2.5 text-sm font-medium disabled:opacity-50">
            {{ deleting ? 'Deleting...' : 'Delete' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">

const search = ref('')
const officers = ref<any[]>([])
const loading = ref(true)

const showModal = ref(false)
const saving = ref(false)
const formError = ref('')
const editingId = ref<number | null>(null)
const form = reactive({
  name: '',
  badge_id: '',
  password: '',
  is_active: true,
})

const deleteTarget = ref<any>(null)
const deleting = ref(false)
const deleteError = ref('')

async function loadOfficers() {
  try {
    officers.value = await $fetch<any[]>('/api/officers')
  } catch (error) {
    console.error(error)
  }
  loading.value = false
}

onMounted(loadOfficers)

function openModal() {
  editingId.value = null
  form.name = ''
  form.badge_id = ''
  form.password = ''
  form.is_active = true
  formError.value = ''
  showModal.value = true
}

function openEdit(officer: any) {
  editingId.value = officer.id
  form.name = officer.name
  form.badge_id = officer.officer_code
  form.password = ''
  form.is_active = officer.status === 'Active'
  formError.value = ''
  showModal.value = true
}

async function saveOfficer() {
  formError.value = ''
  saving.value = true

  try {
    if (editingId.value) {
      await $fetch(`/api/officers/${editingId.value}`, {
        method: 'PUT',
        body: { ...form },
      })
    } else {
      await $fetch('/api/officers', {
        method: 'POST',
        body: { ...form },
      })
    }
    showModal.value = false
    await loadOfficers()
  } catch (error: any) {
    formError.value = error?.data?.statusMessage || 'Failed to save officer.'
  }

  saving.value = false
}

function askDelete(officer: any) {
  deleteError.value = ''
  deleteTarget.value = officer
}

function closeDelete() {
  deleteTarget.value = null
  deleteError.value = ''
}

async function removeOfficer() {
  if (!deleteTarget.value) return

  deleting.value = true
  deleteError.value = ''

  try {
    await $fetch(`/api/officers/${deleteTarget.value.id}`, { method: 'DELETE' })
    closeDelete()
    await loadOfficers()
  } catch (error: any) {
    deleteError.value = error?.data?.statusMessage || 'Failed to delete officer.'
  }

  deleting.value = false
}

const filtered = computed(() =>
  officers.value.filter(o =>
    o.name.toLowerCase().includes(search.value.toLowerCase()) ||
    o.officer_code.toLowerCase().includes(search.value.toLowerCase())
  )
)
</script>