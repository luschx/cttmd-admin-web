<template>
  <div class="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-slate-100">
    <div class="bg-white rounded-2xl shadow-lg w-full max-w-md px-10 py-10">

      <div class="flex flex-col items-center mb-6">
        <div class="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-2">
          <span class="text-xs text-gray-400 text-center leading-tight">City of<br>Buenavista<br>Logo</span>
        </div>
      </div>

      <h1 class="text-2xl font-bold text-center text-gray-900 mb-8">Admin Login</h1>

      <div class="space-y-5">
        <div>
          <label class="block text-sm font-semibold text-gray-700 mb-1">Username</label>
          <input
            v-model="username"
            type="text"
            placeholder="Enter your username"
            class="w-full border border-gray-200 bg-gray-50 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label class="block text-sm font-semibold text-gray-700 mb-1">Password</label>
          <div class="relative">
            <input
              v-model="password"
              :type="showPassword ? 'text' : 'password'"
              placeholder="••••••••••"
              class="w-full border border-gray-200 bg-gray-50 rounded-xl px-4 py-3 pr-12 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              @keyup.enter="handleLogin"
            />
            <button
              type="button"
              @click="showPassword = !showPassword"
              class="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 text-xs"
            >
              {{ showPassword ? 'Hide' : 'Show' }}
            </button>
          </div>
        </div>

        <p v-if="errorMsg" class="text-sm text-red-500">{{ errorMsg }}</p>

        <button
          @click="handleLogin"
          :disabled="loading"
          class="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white font-semibold py-3 rounded-xl transition-colors"
        >
          {{ loading ? 'Logging in...' : 'Log in' }}
        </button>

        <div class="text-center">
          <a href="#" class="text-blue-600 text-sm font-medium hover:underline">Forgot password?</a>
        </div>
      </div>

      <div class="mt-8 pt-6 border-t border-gray-100 text-center">
        <p class="text-xs text-blue-500">Access is restricted to authorized CTTMD office administrators only.</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: false })

const username = ref('')
const password = ref('')
const showPassword = ref(false)
const errorMsg = ref('')
const loading = ref(false)

const { login } = useAuth()

async function handleLogin() {
  errorMsg.value = ''
  loading.value = true
  try {
    await login(username.value, password.value)
    await navigateTo('/dashboard')
  } catch (e: any) {
    errorMsg.value = e?.data?.statusMessage || 'Sayop ang username o password'
  } finally {
    loading.value = false
  }
}
</script>