<template>
  <div>
    <div class="mb-6">
      <h1 class="text-3xl font-bold text-gray-900">All violations</h1>
      <p class="text-blue-500 text-sm mt-1">Complete list of all recorded violations</p>
    </div>

    <div class="flex gap-3 mb-6">
      <input v-model="search" type="text" placeholder="Search plate or location..." class="flex-1 border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
      <select v-model="statusFilter" class="border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
        <option value="">All status</option>
        <option>Unpaid</option>
        <option>Paid</option>
      </select>
    </div>

    <div class="bg-white rounded-2xl border border-gray-100 shadow-sm">
      <div v-if="loading" class="p-10 text-center text-gray-400 text-sm">Loading...</div>
      <table v-else class="w-full text-sm">
        <thead>
          <tr class="text-left text-gray-500 border-b border-gray-100">
            <th class="px-6 py-4 font-medium">Plate</th>
            <th class="px-6 py-4 font-medium">Violation</th>
            <th class="px-6 py-4 font-medium">Location</th>
            <th class="px-6 py-4 font-medium">Officer</th>
            <th class="px-6 py-4 font-medium">Date</th>
            <th class="px-6 py-4 font-medium">Status</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-gray-50">
          <tr v-for="row in filtered" :key="row.id" class="text-gray-700 hover:bg-gray-50">
            <td class="px-6 py-4 font-medium">{{ row.plate_number }}</td>
            <td class="px-6 py-4">{{ row.violation }}</td>
            <td class="px-6 py-4">{{ row.location }}</td>
            <td class="px-6 py-4">{{ row.officers?.officer_code ?? 'N/A' }}</td>
            <td class="px-6 py-4">{{ row.datetime }}</td>
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
  violations.value.filter((v) => {
    const s = search.value.toLowerCase()
    const matchSearch =
      v.plate_number.toLowerCase().includes(s) ||
      (v.location ?? '').toLowerCase().includes(s)
    const matchStatus = !statusFilter.value || v.status === statusFilter.value
    return matchSearch && matchStatus
  })
)

function statusClass(status: string) {
  return (
    {
      Unpaid: 'bg-yellow-100 text-yellow-700',
      Paid: 'bg-green-100 text-green-700',
    } as Record<string, string>
  )[status] ?? 'bg-gray-100 text-gray-600'
}
</script>