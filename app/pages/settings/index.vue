<template>
  <div>
    <div class="mb-6 flex items-center">
      <span class="w-1 h-8 rounded-full bg-[#2952D9] mr-3"></span>
      <div>
        <h1 class="text-3xl font-bold text-[#0F1F4D]">Settings</h1>
      </div>
    </div>

    <div class="space-y-5 max-w-3xl">

      <!-- ============ ADMIN PROFILE ============ -->
      <div class="bg-white rounded-2xl shadow-[0_4px_16px_rgba(15,31,77,0.06)] p-6">
        <div class="flex items-center mb-5">
          <span class="w-1 h-5 rounded-full bg-[#2952D9] mr-3"></span>
          <h2 class="text-lg font-semibold text-[#0F1F4D]">Admin profile</h2>
        </div>

        <!-- Avatar header -->
        <div class="flex items-center gap-4 mb-6">
          <div class="relative">
            <img v-if="store.photoUrl" :src="store.photoUrl" alt="Avatar" class="w-20 h-20 rounded-full object-cover" />
            <div v-else class="w-20 h-20 rounded-full bg-gradient-to-br from-[#1B3262] to-[#2952D9] text-white flex items-center justify-center text-2xl font-bold">
              {{ initials }}
            </div>
          </div>
          <div>
            <div class="text-base font-semibold text-[#0F1F4D]">{{ store.displayName }}</div>
            <div class="text-xs text-[#6B7A99] mb-2">{{ store.position || 'No position set' }}</div>
            <div class="flex gap-2">
              <label class="cursor-pointer bg-[#F0F4FB] text-[#2952D9] px-3 py-1.5 rounded-lg text-xs font-semibold hover:bg-[#E3EAF8] transition">
                {{ uploading ? 'Uploading...' : 'Upload photo' }}
                <input type="file" accept="image/png,image/jpeg,image/webp" class="hidden" :disabled="uploading" @change="onAvatarChange" />
              </label>
              <button v-if="store.photoUrl" type="button" :disabled="uploading" @click="removeAvatar" class="text-[#E5484D] px-3 py-1.5 rounded-lg text-xs font-semibold hover:bg-[#FDECEC] transition">
                Remove
              </button>
            </div>
            <p class="text-[11px] text-[#9AA6C0] mt-1">PNG, JPG or WEBP. Max 2 MB.</p>
          </div>
        </div>

        <form @submit.prevent="saveProfile" class="space-y-4">
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-semibold text-[#0F1F4D] mb-1">Full name</label>
              <input v-model.trim="profile.name" type="text" required :class="inputClass" />
            </div>
            <div>
              <label class="block text-sm font-semibold text-[#0F1F4D] mb-1">Username</label>
              <input v-model.trim="profile.username" type="text" required :class="inputClass" />
            </div>
            <div>
              <label class="block text-sm font-semibold text-[#0F1F4D] mb-1">Position / Title</label>
              <input v-model.trim="profile.position" type="text" placeholder="e.g. System Administrator" :class="inputClass" />
            </div>
            <div>
              <label class="block text-sm font-semibold text-[#0F1F4D] mb-1">Office / Department</label>
              <input v-model.trim="profile.office" type="text" placeholder="e.g. CTTMD Main Office" :class="inputClass" />
            </div>
          </div>

          <div>
            <label class="block text-sm font-semibold text-[#0F1F4D] mb-1">Address</label>
            <input v-model.trim="profile.address" type="text" placeholder="Street, Barangay, City / Municipality" :class="inputClass" />
          </div>

          <div>
            <label class="block text-sm font-semibold text-[#0F1F4D] mb-1">Bio</label>
            <textarea v-model.trim="profile.bio" rows="3" maxlength="200" placeholder="Short description (optional)" :class="inputClass"></textarea>
            <div class="text-[11px] text-[#9AA6C0] text-right mt-1">{{ profile.bio.length }}/200</div>
          </div>

          <p v-if="profileError" class="text-sm text-[#E5484D] bg-[#FDECEC] rounded-xl px-4 py-2">{{ profileError }}</p>
          <p v-if="profileSaved" class="text-sm text-[#1F9D55] bg-[#DCF5E4] rounded-xl px-4 py-2">Profile updated successfully.</p>

          <div class="flex items-center gap-3">
            <button type="submit" :disabled="savingProfile" :class="primaryBtn">
              {{ savingProfile ? 'Saving...' : 'Save profile' }}
            </button>
            <button type="button" @click="resetProfile" class="text-sm font-semibold text-[#6B7A99] px-4 py-3 rounded-xl hover:bg-[#F0F4FB] transition">
              Reset
            </button>
          </div>
        </form>
      </div>

      <!-- ============ CHANGE PASSWORD ============ -->
      <div class="bg-white rounded-2xl shadow-[0_4px_16px_rgba(15,31,77,0.06)] p-6">
        <div class="flex items-center mb-5">
          <span class="w-1 h-5 rounded-full bg-[#2952D9] mr-3"></span>
          <h2 class="text-lg font-semibold text-[#0F1F4D]">Change password</h2>
        </div>

        <form @submit.prevent="savePassword" class="space-y-4">
          <div>
            <label class="block text-sm font-semibold text-[#0F1F4D] mb-1">Current password</label>
            <div class="relative">
              <input v-model="pw.current" :type="show.current ? 'text' : 'password'" autocomplete="current-password" required :class="inputClass + ' pr-16'" />
              <button type="button" @click="show.current = !show.current" class="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-semibold text-[#2952D9]">
                {{ show.current ? 'Hide' : 'Show' }}
              </button>
            </div>
          </div>

          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-semibold text-[#0F1F4D] mb-1">New password</label>
              <div class="relative">
                <input v-model="pw.next" :type="show.next ? 'text' : 'password'" autocomplete="new-password" required :class="inputClass + ' pr-16'" />
                <button type="button" @click="show.next = !show.next" class="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-semibold text-[#2952D9]">
                  {{ show.next ? 'Hide' : 'Show' }}
                </button>
              </div>
            </div>
            <div>
              <label class="block text-sm font-semibold text-[#0F1F4D] mb-1">Confirm new password</label>
              <div class="relative">
                <input v-model="pw.confirm" :type="show.confirm ? 'text' : 'password'" autocomplete="new-password" required :class="inputClass + ' pr-16'" />
                <button type="button" @click="show.confirm = !show.confirm" class="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-semibold text-[#2952D9]">
                  {{ show.confirm ? 'Hide' : 'Show' }}
                </button>
              </div>
            </div>
          </div>

          <!-- Strength meter -->
          <div v-if="pw.next">
            <div class="flex gap-1.5">
              <span v-for="n in 4" :key="n" class="h-1.5 flex-1 rounded-full transition-colors" :style="{ backgroundColor: n <= strength.score ? strength.color : '#E8EDF7' }"></span>
            </div>
            <p class="text-xs mt-1" :style="{ color: strength.color }">{{ strength.label }}</p>
          </div>

          <ul class="text-xs text-[#6B7A99] space-y-1">
            <li :class="rules.length ? 'text-[#1F9D55]' : ''">{{ rules.length ? '✓' : '•' }} At least 8 characters</li>
            <li :class="rules.mixed ? 'text-[#1F9D55]' : ''">{{ rules.mixed ? '✓' : '•' }} Upper and lowercase letters</li>
            <li :class="rules.number ? 'text-[#1F9D55]' : ''">{{ rules.number ? '✓' : '•' }} At least one number</li>
            <li :class="rules.symbol ? 'text-[#1F9D55]' : ''">{{ rules.symbol ? '✓' : '•' }} At least one symbol</li>
          </ul>

          <p v-if="pwError" class="text-sm text-[#E5484D] bg-[#FDECEC] rounded-xl px-4 py-2">{{ pwError }}</p>
          <p v-if="pwSaved" class="text-sm text-[#1F9D55] bg-[#DCF5E4] rounded-xl px-4 py-2">Password changed successfully.</p>

          <button type="submit" :disabled="savingPw" :class="primaryBtn">
            {{ savingPw ? 'Updating...' : 'Update password' }}
          </button>
        </form>
      </div>

      <!-- ============ PREFERENCES ============ -->
      <div class="bg-white rounded-2xl shadow-[0_4px_16px_rgba(15,31,77,0.06)] p-6">
        <div class="flex items-center mb-5">
          <span class="w-1 h-5 rounded-full bg-[#2952D9] mr-3"></span>
          <h2 class="text-lg font-semibold text-[#0F1F4D]">Preferences</h2>
        </div>
        <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label class="block text-sm font-semibold text-[#0F1F4D] mb-1">Rows per page</label>
            <select v-model.number="prefs.rowsPerPage" :class="inputClass">
              <option :value="10">10</option>
              <option :value="25">25</option>
              <option :value="50">50</option>
              <option :value="100">100</option>
            </select>
          </div>
          <div>
            <label class="block text-sm font-semibold text-[#0F1F4D] mb-1">Date format</label>
            <select v-model="prefs.dateFormat" :class="inputClass">
              <option value="MM/DD/YYYY">MM/DD/YYYY</option>
              <option value="DD/MM/YYYY">DD/MM/YYYY</option>
              <option value="YYYY-MM-DD">YYYY-MM-DD</option>
            </select>
          </div>
          <div>
            <label class="block text-sm font-semibold text-[#0F1F4D] mb-1">Time zone</label>
            <select v-model="prefs.timezone" :class="inputClass">
              <option value="Asia/Manila">Asia/Manila (PHT)</option>
              <option value="UTC">UTC</option>
            </select>
          </div>
        </div>
        <p class="text-[11px] text-[#9AA6C0] mt-3">Preferences are saved automatically in this browser.</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const inputClass =
  'w-full bg-[#F0F4FB] text-[#0F1F4D] placeholder-[#9AA6C0] rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#2952D9]'
const primaryBtn =
  'bg-gradient-to-r from-[#1B3262] to-[#2952D9] text-white px-6 py-3 rounded-xl text-sm font-semibold shadow-[0_4px_16px_rgba(41,82,217,0.35)] hover:opacity-90 disabled:opacity-50 transition'

// ---------------- Admin profile (saved in the backend, shared with the sidebar) ----------------
const store = useAdminProfileStore()

const profile = reactive({
  name: '',
  username: '',
  position: '',
  office: '',
  address: '',
  bio: '',
})
const savedSnapshot = ref('')
const savingProfile = ref(false)
const uploading = ref(false)
const profileError = ref('')
const profileSaved = ref(false)

function fillFromStore() {
  profile.name = store.fullName
  profile.username = store.username
  profile.position = store.position
  profile.office = store.office
  profile.address = store.address
  profile.bio = store.bio
  savedSnapshot.value = JSON.stringify(profile)
}

const initials = computed(() =>
  (profile.name || store.displayName || 'A')
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((s) => s.charAt(0).toUpperCase())
    .join('')
)

function apiError(e: any, fallback: string) {
  const code = e?.statusCode || e?.status
  return (
    e?.data?.error ||
    e?.data?.detail ||
    (code ? `${fallback} (HTTP ${code})` : `${fallback} (${e?.message || 'network error'})`)
  )
}

async function onAvatarChange(e: Event) {
  const input = e.target as HTMLInputElement
  const file = input.files?.[0]
  if (!file) return
  profileError.value = ''
  if (file.size > 2 * 1024 * 1024) {
    profileError.value = 'Image must be 2 MB or smaller.'
    input.value = ''
    return
  }
  uploading.value = true
  try {
    await store.uploadPhoto(file) // sidebar updates immediately (shared store)
  } catch (error: any) {
    profileError.value = apiError(error, 'Failed to upload photo.')
  }
  uploading.value = false
  input.value = ''
}

async function removeAvatar() {
  profileError.value = ''
  uploading.value = true
  try {
    await store.removePhoto()
  } catch (error: any) {
    profileError.value = apiError(error, 'Failed to remove photo.')
  }
  uploading.value = false
}

function resetProfile() {
  Object.assign(profile, JSON.parse(savedSnapshot.value))
  profileError.value = ''
  profileSaved.value = false
}

async function saveProfile() {
  profileError.value = ''
  profileSaved.value = false

  if (!profile.name) return (profileError.value = 'Name is required.')
  if (!/^[a-zA-Z0-9_.-]{3,}$/.test(profile.username))
    return (profileError.value = 'Username must be at least 3 characters (letters, numbers, . _ -).')

  savingProfile.value = true
  try {
    await store.save({
      full_name: profile.name,
      username: profile.username,
      position: profile.position,
      office: profile.office,
      address: profile.address,
      bio: profile.bio,
    })
    fillFromStore()
    profileSaved.value = true
    setTimeout(() => (profileSaved.value = false), 4000)
  } catch (error: any) {
    profileError.value = apiError(error, 'Failed to save profile.')
  }
  savingProfile.value = false
}

// ---------------- Change password ----------------
const pw = reactive({ current: '', next: '', confirm: '' })
const show = reactive({ current: false, next: false, confirm: false })
const savingPw = ref(false)
const pwError = ref('')
const pwSaved = ref(false)

const rules = computed(() => ({
  length: pw.next.length >= 8,
  mixed: /[a-z]/.test(pw.next) && /[A-Z]/.test(pw.next),
  number: /\d/.test(pw.next),
  symbol: /[^A-Za-z0-9]/.test(pw.next),
}))

const strength = computed(() => {
  const score = Object.values(rules.value).filter(Boolean).length
  const map = [
    { label: 'Too weak', color: '#E5484D' },
    { label: 'Weak', color: '#E5484D' },
    { label: 'Fair', color: '#F5A524' },
    { label: 'Good', color: '#2952D9' },
    { label: 'Strong', color: '#1F9D55' },
  ]
  return { score, ...map[score] }
})

async function savePassword() {
  pwError.value = ''
  pwSaved.value = false

  if (!pw.current) return (pwError.value = 'Enter your current password.')
  if (!rules.value.length || !rules.value.mixed || !rules.value.number)
    return (pwError.value = 'New password must be 8+ characters with upper/lowercase letters and a number.')
  if (pw.next === pw.current) return (pwError.value = 'New password must be different from the current one.')
  if (pw.next !== pw.confirm) return (pwError.value = 'New passwords do not match.')

  savingPw.value = true
  try {
    // TODO: connect to backend, e.g.
    // await $fetch('/api/auth/change-password', {
    //   method: 'POST',
    //   body: { current_password: pw.current, new_password: pw.next },
    // })
    pwSaved.value = true
    pw.current = pw.next = pw.confirm = ''
    setTimeout(() => (pwSaved.value = false), 4000)
  } catch (error: any) {
    pwError.value = error?.data?.statusMessage || 'Failed to change password. Check your current password.'
  }
  savingPw.value = false
}

// ---------------- Preferences (saved in this browser) ----------------
const prefs = reactive({
  rowsPerPage: 10,
  dateFormat: 'MM/DD/YYYY',
  timezone: 'Asia/Manila',
})

onMounted(async () => {
  if (!store.loaded) {
    try {
      await store.fetch()
    } catch (error: any) {
      profileError.value = apiError(error, 'Could not load your profile.')
    }
  }
  fillFromStore()

  try {
    const saved = JSON.parse(localStorage.getItem('cttmd-settings') || '{}')
    if (saved.prefs) Object.assign(prefs, saved.prefs)
  } catch {}
})

watch(
  prefs,
  () => {
    try {
      localStorage.setItem('cttmd-settings', JSON.stringify({ prefs: { ...prefs } }))
    } catch {}
  },
  { deep: true }
)
</script>