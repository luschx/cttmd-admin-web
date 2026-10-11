<template>
  <div>
    <div class="mb-6">
      <h1 class="text-3xl font-bold text-gray-900">Reports</h1>
      <p class="text-blue-500 text-sm mt-1">Summary of violations and settlements</p>
    </div>

    <!-- Summary cards -->
    <div class="grid grid-cols-3 gap-4 mb-8">
      <div v-for="card in summary" :key="card.label" class="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
        <p class="text-sm text-gray-500 mb-1">{{ card.label }}</p>
        <p class="text-3xl font-bold text-gray-900">{{ card.value }}</p>
      </div>
    </div>

    <!-- Table -->
    <div class="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
      <div class="flex items-center justify-between mb-4">
        <h2 class="font-semibold text-gray-900">Monthly breakdown</h2>
        <button class="border border-gray-200 rounded-xl px-4 py-2 text-sm hover:bg-gray-50 flex items-center gap-2">
          <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
          </svg>
          Export
        </button>
      </div>
      <table class="w-full text-sm">
        <thead>
          <tr class="text-left text-gray-400 border-b border-gray-100">
            <th class="pb-3 font-medium">Month</th>
            <th class="pb-3 font-medium">Total Violations</th>
            <th class="pb-3 font-medium">Settled</th>
            <th class="pb-3 font-medium">Pending</th>
            <th class="pb-3 font-medium">Revenue</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-gray-50 text-gray-700">
          <tr v-for="row in reportRows" :key="row.month">
            <td class="py-3 font-medium">{{ row.month }}</td>
            <td class="py-3">{{ row.total }}</td>
            <td class="py-3 text-green-600">{{ row.settled }}</td>
            <td class="py-3 text-yellow-600">{{ row.pending }}</td>
            <td class="py-3">₱{{ row.revenue.toLocaleString() }}</td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup lang="ts">
const reportRows = ref<any[]>([])

onMounted(async () => {
  try {
    reportRows.value = await $fetch<any[]>('/api/reports')
  } catch (error) {
    console.error(error)
  }
})

const summary = computed(() => {
  const latest = reportRows.value[0]
  return [
    { label: 'Total violations this month', value: latest?.total ?? 0 },
    { label: 'Total settled', value: latest?.settled ?? 0 },
    { label: 'Total revenue (₱)', value: (latest?.revenue ?? 0).toLocaleString() },
  ]
})
</script>