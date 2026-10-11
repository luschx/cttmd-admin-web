<template>
  <div class="flex h-screen bg-gray-50 overflow-hidden">

    <!-- Sidebar -->
    <aside class="w-60 bg-white border-r border-gray-100 flex flex-col shrink-0">

      <!-- Logo -->
      <div class="flex items-center gap-3 px-5 py-5 border-b border-gray-100">
        <div class="w-9 h-9 bg-gray-100 rounded-full flex items-center justify-center shrink-0">
          <span class="text-xs text-gray-400 leading-none text-center" style="font-size:7px">LOGO</span>
        </div>
        <div>
          <div class="font-bold text-gray-900 text-sm leading-tight">CTTMD</div>
          <div class="text-xs text-gray-400">Enforcement System</div>
        </div>
      </div>

      <!-- Nav -->
      <nav class="flex-1 px-3 py-4 space-y-1">
        <NuxtLink
          v-for="item in navItems"
          :key="item.to"
          :to="item.to"
          class="flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-colors"
          :class="$route.path.startsWith(item.to)
            ? 'bg-blue-600 text-white'
            : 'text-gray-600 hover:bg-gray-100'"
        >
          <component :is="item.icon" class="w-5 h-5 shrink-0" />
          {{ item.label }}
        </NuxtLink>
      </nav>

      <!-- User -->
      <div class="px-4 py-4 border-t border-gray-100 flex items-center gap-3">
        <div class="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center text-sm font-bold shrink-0">
          A
        </div>
        <span class="text-sm text-gray-700 flex-1">Hello, admin</span>
        <button @click="handleLogout" class="text-gray-400 hover:text-gray-600">
          <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h6a2 2 0 012 2v1" />
          </svg>
        </button>
      </div>
    </aside>

    <!-- Main -->
    <main class="flex-1 overflow-y-auto p-8">
      <slot />
    </main>
  </div>
</template>

<script setup lang="ts">
import {
  HomeIcon,
  ClipboardDocumentListIcon,
  CurrencyDollarIcon,
  UserGroupIcon,
  DocumentChartBarIcon,
  Cog6ToothIcon
} from '@heroicons/vue/24/outline'

const navItems = [
  { label: 'Dashboard', to: '/dashboard', icon: HomeIcon },
  { label: 'All violations', to: '/violations', icon: ClipboardDocumentListIcon },
  { label: 'Settlement', to: '/settlement', icon: CurrencyDollarIcon },
  { label: 'Officers', to: '/officers', icon: UserGroupIcon },
  { label: 'Reports', to: '/reports', icon: DocumentChartBarIcon },
  { label: 'Settings', to: '/settings', icon: Cog6ToothIcon },
]

function handleLogout() {
  navigateTo('/login')
}
</script>