<script setup lang="ts">
const profile = useAdminProfileStore()
onMounted(() => { if (!profile.loaded) profile.fetch().catch(() => {}) })
</script>

<template>
  <div class="flex items-center gap-3 rounded-xl bg-white/10 p-3">
    <img
      v-if="profile.photoUrl"
      :src="profile.photoUrl"
      alt="Admin"
      class="h-9 w-9 rounded-full object-cover"
    />
    <div
      v-else
      class="flex h-9 w-9 items-center justify-center rounded-full bg-white/20 font-semibold text-white"
    >
      {{ profile.initial }}
    </div>

    <div class="min-w-0 flex-1">
      <p class="truncate text-sm font-semibold text-white">Hello, {{ profile.displayName }}</p>
      <p class="text-xs text-green-400">● Online</p>
    </div>
  </div>
</template>