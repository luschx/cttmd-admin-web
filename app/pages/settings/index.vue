<template>
  <div>
    <div class="mb-6">
      <h1 class="text-3xl font-bold text-gray-900">Settings</h1>
      <p class="text-blue-500 text-sm mt-1">System and account configuration</p>
    </div>

    <div class="space-y-5 max-w-2xl">
      <!-- Account -->
      <div class="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
        <h2 class="font-semibold text-gray-900 mb-4">Account</h2>
        <div class="space-y-4">
          <div>
            <label class="block text-sm text-gray-500 mb-1">Admin name</label>
            <input type="text" value="Admin" class="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
          <div>
            <label class="block text-sm text-gray-500 mb-1">Email</label>
            <input type="email" value="admin@cttmd.gov.ph" class="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
          <button class="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl text-sm font-medium transition-colors">
            Save changes
          </button>
        </div>
      </div>

      <!-- Password -->
      <div class="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
        <h2 class="font-semibold text-gray-900 mb-4">Change password</h2>
        <div class="space-y-4">
          <div>
            <label class="block text-sm text-gray-500 mb-1">Current password</label>
            <input type="password" class="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
          <div>
            <label class="block text-sm text-gray-500 mb-1">New password</label>
            <input type="password" class="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
          <div>
            <label class="block text-sm text-gray-500 mb-1">Confirm new password</label>
            <input type="password" class="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
          <button class="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl text-sm font-medium transition-colors">
            Update password
          </button>
        </div>
      </div>

      <!-- System -->
      <div class="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
        <h2 class="font-semibold text-gray-900 mb-4">System</h2>
        <div class="space-y-3">
          <div v-for="item in toggles" :key="item.label" class="flex items-center justify-between">
            <div>
              <div class="text-sm font-medium text-gray-700">{{ item.label }}</div>
              <div class="text-xs text-gray-400">{{ item.description }}</div>
            </div>
            <button @click="item.enabled = !item.enabled" :class="item.enabled ? 'bg-blue-600' : 'bg-gray-200'" class="w-11 h-6 rounded-full transition-colors relative">
              <span :class="item.enabled ? 'translate-x-5' : 'translate-x-1'" class="absolute top-1 w-4 h-4 bg-white rounded-full transition-transform shadow-sm"></span>
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const toggles = reactive([
  { label: 'Live monitoring', description: 'Enable real-time violation updates', enabled: true },
  { label: 'Email notifications', description: 'Send alerts to admin email on new violations', enabled: false },
  { label: 'Auto-settle timeout', description: 'Automatically flag overdue tickets after 30 days', enabled: true },
])
</script>