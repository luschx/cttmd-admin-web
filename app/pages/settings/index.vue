<template>
  <div>
    <div class="mb-6 flex items-center">
      <span class="w-1 h-8 rounded-full bg-[#2952D9] mr-3"></span>
      <div>
        <h1 class="text-3xl font-bold text-[#0F1F4D]">Settings</h1>
        <p class="text-[#2952D9] text-sm mt-1">System and account configuration</p>
      </div>
    </div>

    <div class="space-y-5 max-w-2xl">

      <!-- Edit admin -->
      <div class="bg-white rounded-2xl shadow-[0_4px_16px_rgba(15,31,77,0.06)] p-6">
        <div class="flex items-center mb-5">
          <span class="w-1 h-5 rounded-full bg-[#2952D9] mr-3"></span>
          <h2 class="text-lg font-semibold text-[#0F1F4D]">Edit admin</h2>
        </div>

        <form @submit.prevent="saveAdmin" class="space-y-4">
          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-semibold text-[#0F1F4D] mb-1">Admin name</label>
              <input v-model="admin.name" type="text" required class="w-full bg-[#F0F4FB] text-[#0F1F4D] placeholder-[#9AA6C0] rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#2952D9]" />
            </div>
            <div>
              <label class="block text-sm font-semibold text-[#0F1F4D] mb-1">Email</label>
              <input v-model="admin.email" type="email" required class="w-full bg-[#F0F4FB] text-[#0F1F4D] placeholder-[#9AA6C0] rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#2952D9]" />
            </div>
          </div>

          <div class="border-t border-[#E8EDF7] pt-4">
            <p class="text-sm font-semibold text-[#0F1F4D] mb-1">Change password</p>
            <p class="text-xs text-[#6B7A99] mb-3">Leave blank to keep your current password</p>
            <div class="space-y-3">
              <input v-model="admin.current_password" type="password" placeholder="Current password" class="w-full bg-[#F0F4FB] text-[#0F1F4D] placeholder-[#9AA6C0] rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#2952D9]" />
              <div class="grid grid-cols-2 gap-3">
                <input v-model="admin.new_password" type="password" placeholder="New password" class="w-full bg-[#F0F4FB] text-[#0F1F4D] placeholder-[#9AA6C0] rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#2952D9]" />
                <input v-model="admin.confirm_password" type="password" placeholder="Confirm new password" class="w-full bg-[#F0F4FB] text-[#0F1F4D] placeholder-[#9AA6C0] rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#2952D9]" />
              </div>
            </div>
          </div>

          <p v-if="adminError" class="text-sm text-[#E5484D] bg-[#FDECEC] rounded-xl px-4 py-2">{{ adminError }}</p>
          <p v-if="adminSaved" class="text-sm text-[#1F9D55] bg-[#DCF5E4] rounded-xl px-4 py-2">Changes saved.</p>

          <button type="submit" :disabled="savingAdmin" class="bg-gradient-to-r from-[#1B3262] to-[#2952D9] text-white px-6 py-3 rounded-xl text-sm font-semibold shadow-[0_4px_16px_rgba(41,82,217,0.35)] hover:opacity-90 disabled:opacity-50 transition">
            {{ savingAdmin ? 'Saving...' : 'Save changes' }}
          </button>
        </form>
      </div>

      <!-- System -->
      <div class="bg-white rounded-2xl shadow-[0_4px_16px_rgba(15,31,77,0.06)] p-6">
        <div class="flex items-center mb-5">
          <span class="w-1 h-5 rounded-full bg-[#2952D9] mr-3"></span>
          <h2 class="text-lg font-semibold text-[#0F1F4D]">System</h2>
        </div>
        <div class="space-y-4">
          <div v-for="item in toggles" :key="item.key" class="flex items-center justify-between">
            <div>
              <div class="text-sm font-semibold text-[#0F1F4D]">{{ item.label }}</div>
              <div class="text-xs text-[#6B7A99]">{{ item.description }}</div>
            </div>
            <button
              type="button"
              @click="item.enabled = !item.enabled"
              :class="item.enabled ? 'bg-[#2952D9]' : 'bg-[#C9D3EA]'"
              class="w-12 h-7 rounded-full transition-colors relative shrink-0"
            >
              <span :class="item.enabled ? 'translate-x-6' : 'translate-x-1'" class="absolute top-1 w-5 h-5 bg-white rounded-full transition-transform shadow-sm"></span>
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
// ---- Edit admin ----
const admin = reactive({
  name: 'Admin',
  email: 'admin@cttmd.gov.ph',
  current_password: '',
  new_password: '',
  confirm_password: '',
})
const savingAdmin = ref(false)
const adminError = ref('')
const adminSaved = ref(false)

async function saveAdmin() {
  adminError.value = ''
  adminSaved.value = false

  if (admin.new_password) {
    if (!admin.current_password) {
      adminError.value = 'Enter your current password to change it.'
      return
    }
    if (admin.new_password.length < 6) {
      adminError.value = 'New password must be at least 6 characters.'
      return
    }
    if (admin.new_password !== admin.confirm_password) {
      adminError.value = 'New passwords do not match.'
      return
    }
  }

  savingAdmin.value = true
  try {
    // TODO: connect to your backend (e.g. PUT /api/auth/profile) once the Django endpoint exists
    adminSaved.value = true
    admin.current_password = ''
    admin.new_password = ''
    admin.confirm_password = ''
  } catch (error: any) {
    adminError.value = error?.data?.statusMessage || 'Failed to save changes.'
  }
  savingAdmin.value = false
}

// ---- System toggles (saved in this browser) ----
const toggles = reactive([
  { key: 'live', label: 'Live monitoring', description: 'Enable real-time violation updates', enabled: true },
  { key: 'email', label: 'Email notifications', description: 'Send alerts to admin email on new violations', enabled: false },
  { key: 'timeout', label: 'Auto-settle timeout', description: 'Automatically flag overdue tickets after 30 days', enabled: true },
])

onMounted(() => {
  try {
    const saved = JSON.parse(localStorage.getItem('cttmd-settings') || '{}')
    toggles.forEach((t) => {
      if (typeof saved[t.key] === 'boolean') t.enabled = saved[t.key]
    })
  } catch {}
})

watch(
  toggles,
  () => {
    const out: Record<string, boolean> = {}
    toggles.forEach((t) => (out[t.key] = t.enabled))
    localStorage.setItem('cttmd-settings', JSON.stringify(out))
  },
  { deep: true }
)
</script>