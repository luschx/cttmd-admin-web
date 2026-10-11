<template>
  <div>
    <div class="mb-6">
      <h1 class="text-3xl font-bold text-gray-900">Dashboard</h1>
      <p class="text-blue-500 text-sm mt-1">Live violation monitor and statistics</p>
    </div>

    <div class="grid grid-cols-4 gap-4 mb-8">
      <div v-for="stat in statCards" :key="stat.label" class="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
        <div class="flex items-center justify-between mb-2">
          <span class="text-sm text-gray-500">{{ stat.label }}</span>
          <span :class="stat.trend > 0 ? 'text-green-500' : 'text-red-500'" class="text-xs font-semibold">
            {{ stat.trend > 0 ? '↑' : '↓' }} {{ Math.abs(stat.trend) }}%
          </span>
        </div>
        <div class="text-4xl font-bold text-gray-900">{{ stat.value }}</div>
      </div>
    </div>

    <div class="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
      <div class="flex items-center justify-between mb-4">
        <h2 class="text-lg font-semibold text-gray-900">Live violation monitor</h2>
        <div class="flex items-center gap-2 text-sm text-gray-500">
          <span class="w-2 h-2 rounded-full bg-green-500 inline-block"></span> Live
        </div>
      </div>

      <div class="relative mb-4">
        <svg class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-4.35-4.35M17 11A6 6 0 115 11a6 6 0 0112 0z" />
        </svg>
        <input v-model="search" type="text" placeholder="Search by plate number or location..." class="w-full border border-gray-200 rounded-xl pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
      </div>

      <div v-if="loading" class="text-center text-gray-400 text-sm py-6">Loading...</div>

      <table v-else class="w-full text-sm">
        <thead>
          <tr class="text-left text-gray-500 border-b border-gray-100">
            <th class="pb-3 font-medium">Plate</th>
            <th class="pb-3 font-medium">Location</th>
            <th class="pb-3 font-medium">Time</th>
            <th class="pb-3 font-medium">Status</th>
            <th class="pb-3 font-medium">Ticket type</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-gray-50">
          <tr v-for="row in filteredViolations" :key="row.id" class="text-gray-700">
            <td class="py-3 font-medium">{{ row.plate_number }}</td>
            <td class="py-3">{{ row.location }}</td>
            <td class="py-3">{{ new Date(row.datetime).toLocaleTimeString() }}</td>
            <td class="py-3">
              <span :class="statusClass(row.status)" class="px-2 py-1 rounded-full text-xs font-medium">
                {{ row.status }}
              </span>
            </td>
            <td class="py-3">
              <span class="px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-600">
                {{ row.white_paid ? 'White' : 'Yellow' }}
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
const loading = ref(true)
const violations = ref<any[]>([])

const stats = ref({
  total: 0,
  clamped: 0,
  whiteSettled: 0,
  yellowSettled: 0,
})

function pctChange(today: number, yesterday: number) {
  if (yesterday === 0) return today > 0 ? 100 : 0
  return Math.round(((today - yesterday) / yesterday) * 100)
}

const trends = computed(() => {
  const dayKey = (offset: number) => {
    const d = new Date()
    d.setDate(d.getDate() - offset)
    return d.toDateString()
  }
  const count = (key: string, extra?: (v: any) => boolean) =>
    violations.value.filter(v =>
      new Date(v.datetime).toDateString() === key && (!extra || extra(v))
    ).length

  return {
    total: pctChange(count(dayKey(0)), count(dayKey(1))),
    clamped: pctChange(
      count(dayKey(0), v => v.status === 'Clamped'),
      count(dayKey(1), v => v.status === 'Clamped')
    ),
  }
})

const statCards = computed(() => [
  { label: 'Total today', value: stats.value.total, trend: trends.value.total },
  { label: 'Clamped', value: stats.value.clamped, trend: trends.value.clamped },
  { label: 'White settled', value: stats.value.whiteSettled, trend: 0 },
  { label: 'Yellow settled', value: stats.value.yellowSettled, trend: 0 },
])

async function loadViolations() {
  try {
    const data = await $fetch<any[]>('/api/violations')

    violations.value = data
    const today = new Date().toDateString()
    stats.value.total = data.filter(v => new Date(v.datetime).toDateString() === today).length
    stats.value.clamped = data.filter(v => v.status === 'Clamped').length
    stats.value.whiteSettled = data.filter(v => v.white_paid).length
    stats.value.yellowSettled = data.filter(v => v.yellow_paid).length
  } catch (error) {
    console.error(error)
  }

  loading.value = false
}

let timer: ReturnType<typeof setInterval>

onMounted(() => {
  loadViolations()
  timer = setInterval(loadViolations, 5000)
})

onUnmounted(() => clearInterval(timer))

const filteredViolations = computed(() =>
  violations.value.filter(v =>
    v.plate_number.toLowerCase().includes(search.value.toLowerCase()) ||
    (v.location ?? '').toLowerCase().includes(search.value.toLowerCase())
  )
)

function statusClass(status: string) {
  return {
    'Pending': 'bg-yellow-100 text-yellow-700',
    'Clamped': 'bg-blue-100 text-blue-700',
    'Settled': 'bg-green-100 text-green-700',
  }[status] ?? 'bg-gray-100 text-gray-600'
}
</script>