<template>
  <div class="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#0B1A3B] via-[#1B3262] to-[#2952D9] px-4">
    <div class="bg-white rounded-3xl shadow-[0_8px_32px_rgba(11,26,59,0.35)] w-full max-w-md px-10 py-10">

      <div class="flex flex-col items-center mb-6">
        <img src="/logos/CTTMD_Logo.png" alt="CTTMD logo" class="w-24 h-24 object-contain mb-2" />
      </div>

      <div class="flex items-center justify-center mb-8">
        <h1 class="text-2xl font-bold text-[#0F1F4D]">Admin Login</h1>
      </div>

      <div class="space-y-5">
        <div>
          <label class="block text-sm font-semibold text-[#0F1F4D] mb-1">Username</label>
          <input
            v-model="username"
            type="text"
            placeholder="Enter your username"
            class="w-full bg-[#F0F4FB] text-[#0F1F4D] placeholder-[#9AA6C0] rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#2952D9]"
          />
        </div>

        <div>
          <label class="block text-sm font-semibold text-[#0F1F4D] mb-1">Password</label>
          <div class="relative">
            <input
              v-model="password"
              :type="showPassword ? 'text' : 'password'"
              placeholder="••••••••••"
              class="w-full bg-[#F0F4FB] text-[#0F1F4D] placeholder-[#9AA6C0] rounded-xl px-4 py-3 pr-14 text-sm focus:outline-none focus:ring-2 focus:ring-[#2952D9]"
              @keyup.enter="handleLogin"
            />
            <button
              type="button"
              @click="showPassword = !showPassword"
              class="absolute right-4 top-1/2 -translate-y-1/2 text-[#6B7A99] hover:text-[#2952D9] text-xs font-medium"
            >
              {{ showPassword ? 'Hide' : 'Show' }}
            </button>
          </div>
        </div>

        <p v-if="errorMsg" class="text-sm text-[#E5484D] bg-[#FDECEC] rounded-xl px-4 py-2">{{ errorMsg }}</p>

        <button
          @click="handleLogin"
          :disabled="loading"
          class="w-full bg-gradient-to-r from-[#1B3262] to-[#2952D9] hover:opacity-90 disabled:opacity-60 text-white font-semibold py-3 rounded-xl shadow-[0_4px_16px_rgba(41,82,217,0.35)] transition"
        >
          {{ loading ? 'Logging in...' : 'Log in' }}
        </button>

        <div class="text-center">
          <a href="#" class="text-[#2952D9] text-sm font-medium hover:underline">Forgot password?</a>
        </div>
      </div>

      <div class="mt-8 pt-6 border-t border-[#E8EDF7] text-center">
        <p class="text-xs text-[#6B7A99]">Access is restricted to authorized CTTMD office administrators only.</p>
      </div>
    </div>

    <!-- Loading screen (shown after a successful login, before the dashboard opens) -->
    <Transition
      enter-active-class="transition-opacity duration-300"
      enter-from-class="opacity-0"
      enter-to-class="opacity-100"
    >
      <div
        v-if="showSplash"
        class="fixed inset-0 z-50 flex flex-col items-center justify-center bg-gradient-to-br from-[#0B1A3B] via-[#1B3262] to-[#2952D9] px-6"
      >
        <!-- Logo with a spinning ring -->
        <div class="relative w-40 h-40 flex items-center justify-center mb-8">
          <span class="absolute inset-0 rounded-full border-4 border-white/15"></span>
          <span class="absolute inset-0 rounded-full border-4 border-transparent border-t-white animate-spin"></span>
          <span class="absolute inset-3 rounded-full bg-white/10 animate-pulse"></span>
          <img src="/logos/CTTMD_Logo.png" alt="CTTMD logo" class="relative w-24 h-24 object-contain" />
        </div>

        <h2 class="text-2xl font-bold text-white mb-1">Welcome back</h2>
        <p class="text-sm text-white/70 mb-8 h-5">{{ splashMessage }}</p>

        <!-- Progress bar -->
        <div class="w-64 h-2 rounded-full bg-white/15 overflow-hidden">
          <div
            class="h-full rounded-full bg-white transition-[width] duration-100 ease-linear"
            :style="{ width: progress + '%' }"
          ></div>
        </div>
        <p class="mt-3 text-xs text-white/50">{{ Math.round(progress) }}%</p>
      </div>
    </Transition>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: false })

// How long the loading screen stays visible (milliseconds). Change this to adjust.
const SPLASH_MS = 3000

const username = ref('')
const password = ref('')
const showPassword = ref(false)
const errorMsg = ref('')
const loading = ref(false)

const showSplash = ref(false)
const progress = ref(0)
let timer: ReturnType<typeof setInterval> | undefined

const splashMessage = computed(() => {
  if (progress.value < 35) return 'Verifying your account...'
  if (progress.value < 70) return 'Loading your data...'
  return 'Preparing your dashboard...'
})

const { login } = useAuth()

function runSplash(): Promise<void> {
  showSplash.value = true
  progress.value = 0
  const start = Date.now()

  return new Promise((resolve) => {
    timer = setInterval(() => {
      const elapsed = Date.now() - start
      progress.value = Math.min(100, (elapsed / SPLASH_MS) * 100)
      if (elapsed >= SPLASH_MS) {
        if (timer) clearInterval(timer)
        resolve()
      }
    }, 50)
  })
}

async function handleLogin() {
  if (loading.value) return
  errorMsg.value = ''
  loading.value = true
  try {
    await login(username.value, password.value)
    await runSplash()
    await navigateTo('/dashboard')
  } catch (e: any) {
    showSplash.value = false
    errorMsg.value = e?.data?.statusMessage || 'Sayop ang username o password'
    loading.value = false
  }
}

onBeforeUnmount(() => {
  if (timer) clearInterval(timer)
})
</script>