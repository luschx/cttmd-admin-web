<template>
  <div>
    <div class="mb-6">
      <h1 class="text-3xl font-bold text-gray-900">All violations</h1>
      <p class="text-blue-500 text-sm mt-1">Complete list of all recorded violations</p>
    </div>

    <div class="flex gap-3 mb-6">
      <div class="relative flex-1">
        <svg class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-4.35-4.35M17 11A6 6 0 115 11a6 6 0 0112 0z" />
        </svg>
        <input v-model="search" type="text" placeholder="Search..." class="w-full border border-gray-200 rounded-xl pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
      </div>
      <select v-model="statusFilter" class="border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
        <option value="">All status</option>
        <option>Pending</option>
        <option>Clamped</option>
        <option>Settled</option>
      </select>
      <button class="border border-gray-200 rounded-xl px-4 py-2.5 text-sm flex items-center gap-2 hover:bg-gray-50">
        <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2a1 1 0 01-.293.707L13 13.414V19a1 1 0 01-.553.894l-4 2A1 1 0 017 21v-7.586L3.293 6.707A1 1 0 013 6V4z" />
        </svg>
        Filter
      </button>
    </div>

    <div class="bg-white rounded-2xl border border-gray-100 shadow-sm">
      <div v-if="loading" class="p-10 text-center text-gray-400 text-sm">Loading...</div>
      <table v-else class="w-full text-sm">
        <thead>
          <tr class="text-left text-gray-500 border-b border-gray-100">
            <th class="px-6 py-4 font-medium">Plate</th>
            <th class="px-6 py-4 font-medium">Location</th>
            <th class="px-6 py-4 font-medium">Officer</th>
            <th class="px-6 py-4 font-medium">Date</th>
            <th class="px-6 py-4 font-medium">Status</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-gray-50">
          <tr v-for="row in filtered" :key="row.id" class="text-gray-700 hover:bg-gray-50">
            <td class="px-6 py-4 font-medium">{{ row.plate_number }}</td>
            <td class="px-6 py-4">{{ row.location }}</td>
            <td class="px-6 py-4">{{ row.officers?.officer_code ?? 'N/A' }}</td>
            <td class="px-6 py-4">{{ new Date(row.datetime).toLocaleString() }}</td>
            <td class="px-6 py-4">
              <span :class="statusClass(row.status)" class="px-3 py-1 rounded-full text-xs font-medium">
                {{ row.status }}
              </span>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup lang="ts">

const search = ref('')
const statusFilter = ref('')
const violations = ref<any[]>([])
const loading = ref(true)

onMounted(async () => {
  try {
    violations.value = await $fetch<any[]>('/api/violations')
  } catch (error) {
    console.error(error)
  }
  loading.value = false
})

const filtered = computed(() =>
  violations.value.filter(v => {
    const matchSearch =
      v.plate_number.toLowerCase().includes(search.value.toLowerCase()) ||
      (v.location ?? '').toLowerCase().includes(search.value.toLowerCase())
    const matchStatus = !statusFilter.value || v.status === statusFilter.value
    return matchSearch && matchStatus
  })
)

function statusClass(status: string) {
  return {
    'Pending': 'bg-yellow-100 text-yellow-700',
    'Clamped': 'bg-blue-100 text-blue-700',
    'Settled': 'bg-green-100 text-green-700',
  }[status] ?? 'bg-gray-100 text-gray-600'
}
</script>