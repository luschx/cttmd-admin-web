<template>
  <div class="flex h-screen bg-[#F4F6FB] overflow-hidden">

    <!-- Sidebar -->
    <aside class="w-72 bg-gradient-to-b from-[#0B1A3B] via-[#1B3262] to-[#2952D9] text-white flex flex-col shrink-0">

      <!-- Logo -->
      <div class="flex items-center gap-4 px-7 py-7 border-b border-white/10">
        <img src="/logos/CTTMD_Logo.png" alt="CTTMD logo" class="w-14 h-14 object-contain shrink-0" />
        <div>
          <div class="font-extrabold text-lg tracking-wide leading-tight">CTTMD</div>
          <div class="text-sm text-white/60">Enforcement System</div>
        </div>
      </div>

      <!-- Nav -->
      <nav class="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
        <NuxtLink
          v-for="item in navItems"
          :key="item.to"
          :to="item.to"
          class="flex items-center gap-4 px-5 py-4 rounded-2xl text-base font-semibold transition-colors"
          :class="$route.path.startsWith(item.to)
            ? 'bg-white text-[#2952D9] shadow-[0_4px_16px_rgba(0,0,0,0.25)]'
            : 'text-white/75 hover:bg-white/10 hover:text-white'"
        >
          <component :is="item.icon" class="w-6 h-6 shrink-0" />
          {{ item.label }}
        </NuxtLink>
      </nav>

      <!-- User + popup menu -->
      <div ref="menuRoot" class="relative m-4">
        <Transition
          enter-active-class="transition duration-150 ease-out"
          enter-from-class="opacity-0 translate-y-2"
          enter-to-class="opacity-100 translate-y-0"
          leave-active-class="transition duration-100 ease-in"
          leave-from-class="opacity-100 translate-y-0"
          leave-to-class="opacity-0 translate-y-2"
        >
          <div
            v-if="menuOpen"
            class="absolute bottom-full left-0 right-0 mb-3 bg-white rounded-2xl shadow-[0_8px_32px_rgba(11,26,59,0.4)] p-2"
          >
            <NuxtLink
              to="/settings"
              class="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold text-[#0F1F4D] hover:bg-[#EAF0FF] hover:text-[#2952D9] transition-colors"
              @click="menuOpen = false"
            >
              <Cog6ToothIcon class="w-5 h-5 shrink-0" />
              Settings
            </NuxtLink>

            <div class="my-1 border-t border-[#E8EDF7]"></div>

            <button
              class="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold text-[#E5484D] hover:bg-[#FDECEC] transition-colors"
              @click="handleLogout"
            >
              <ArrowRightOnRectangleIcon class="w-5 h-5 shrink-0" />
              Log out
            </button>
          </div>
        </Transition>

        <button
          class="w-full px-4 py-4 rounded-2xl bg-white/10 hover:bg-white/15 flex items-center gap-3 text-left transition-colors"
          @click="menuOpen = !menuOpen"
        >
          <div class="w-10 h-10 rounded-full bg-white/20 text-white flex items-center justify-center text-base font-bold shrink-0">
            A
          </div>
          <div class="flex-1">
            <div class="text-sm font-semibold">Hello, admin</div>
            <div class="text-xs text-[#34C26B] flex items-center gap-1">
              <span class="w-1.5 h-1.5 rounded-full bg-[#34C26B]"></span> Online
            </div>
          </div>
          <ChevronUpDownIcon class="w-5 h-5 text-white/60 shrink-0" />
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
  Cog6ToothIcon,
  ArrowRightOnRectangleIcon,
  ChevronUpDownIcon,
} from '@heroicons/vue/24/outline'

const navItems = [
  { label: 'Dashboard', to: '/dashboard', icon: HomeIcon },
  { label: 'All violations', to: '/violations', icon: ClipboardDocumentListIcon },
  { label: 'Settlement', to: '/settlement', icon: CurrencyDollarIcon },
  { label: 'Enforcers', to: '/officers', icon: UserGroupIcon },
  { label: 'Reports', to: '/reports', icon: DocumentChartBarIcon },
]

const menuOpen = ref(false)
const menuRoot = ref<HTMLElement | null>(null)

function onClickOutside(e: MouseEvent) {
  if (menuRoot.value && !menuRoot.value.contains(e.target as Node)) {
    menuOpen.value = false
  }
}

onMounted(() => document.addEventListener('click', onClickOutside))
onUnmounted(() => document.removeEventListener('click', onClickOutside))

function handleLogout() {
  menuOpen.value = false
  navigateTo('/login')
}
</script>