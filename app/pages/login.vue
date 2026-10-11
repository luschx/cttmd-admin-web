<template>
  <div class="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-slate-100">
    <div class="bg-white rounded-2xl shadow-lg w-full max-w-md px-10 py-10">

      <!-- Logo -->
      <div class="flex flex-col items-center mb-6">
        <div class="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-2">
          <span class="text-xs text-gray-400 text-center leading-tight">City of<br>Buenavista<br>Logo</span>
        </div>
      </div>

      <!-- Title -->
      <h1 class="text-2xl font-bold text-center text-gray-900 mb-8">Admin Login</h1>

      <!-- Form -->
      <div class="space-y-5">
        <div>
          <label class="block text-sm font-semibold text-red-500 mb-1">Username</label>
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
            />
            <button
              type="button"
              @click="showPassword = !showPassword"
              class="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              <svg v-if="showPassword" xmlns="http://www.w3.org/2000/svg" class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-5 0-9-4-9-7s4-7 9-7a10.05 10.05 0 011.875.175M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <svg v-else xmlns="http://www.w3.org/2000/svg" class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0M2.458 12C3.732 7.943 7.523 5 12 5c4.477 0 8.268 2.943 9.542 7-1.274 4.057-5.065 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
            </button>
          </div>
        </div>

        <button
          @click="handleLogin"
          class="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-xl transition-colors"
        >
          Log in
        </button>

        <div class="text-center">
          <a href="#" class="text-blue-600 text-sm font-medium hover:underline">Forgot password?</a>
        </div>
      </div>

      <!-- Footer -->
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

function handleLogin() {
  navigateTo('/dashboard')
}
</script>