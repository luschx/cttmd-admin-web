<template>
  <div>
    <div class="mb-6 flex items-center">
      <span class="w-1 h-8 rounded-full bg-[#2952D9] mr-3"></span>
      <div>
        <h1 class="text-3xl font-bold text-[#0F1F4D]">Dashboard</h1>
      </div>
    </div>

    <div class="grid grid-cols-3 gap-4 mb-8">
      <div v-for="stat in statCards" :key="stat.label" class="bg-white rounded-2xl p-5 shadow-[0_4px_16px_rgba(15,31,77,0.06)]">
        <div class="flex items-center justify-between mb-2">
          <span class="text-sm text-[#6B7A99]">{{ stat.label }}</span>
          <span
            v-if="stat.trend !== null"
            :class="stat.trend > 0 ? 'text-[#1F9D55]' : 'text-[#E5484D]'"
            class="text-xs font-semibold"
          >
            {{ stat.trend > 0 ? '↑' : '↓' }} {{ Math.abs(stat.trend) }}%
          </span>
        </div>
        <div :class="stat.color" class="text-4xl font-bold">{{ stat.value }}</div>
      </div>
    </div>

    <ClientOnly>
      <ViolationCharts :violations="violations" :date="activeDate" />
    </ClientOnly>

    <div class="bg-white rounded-2xl shadow-[0_4px_16px_rgba(15,31,77,0.06)] p-6">
      <div class="flex items-center justify-between mb-4">
        <div class="flex items-center">
          <h2 class="text-lg font-semibold text-[#0F1F4D]">
            {{ isToday ? 'Live violation monitor' : 'Violations on ' + activeDate }}
          </h2>
        </div>

        <div class="flex items-center gap-3">
          <button
            v-if="!isToday"
            @click="pickedDate = null"
            class="text-sm font-medium text-[#2952D9] bg-[#EAF0FF] px-3 py-1 rounded-full hover:bg-[#DCE6FF]"
          >
            Back to today
          </button>

          <input
            type="date"
            :value="activeDate"
            :max="todayKey"
            @change="onPickDate(($event.target as HTMLInputElement).value)"
            class="bg-[#F0F4FB] text-[#0F1F4D] text-sm rounded-xl px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-[#2952D9]"
          />

          <div
            v-if="isToday"
            class="flex items-center gap-2 text-sm font-medium text-[#1F9D55] bg-[#E3F6EA] px-3 py-1 rounded-full"
          >
            <span class="w-2 h-2 rounded-full bg-[#34C26B] inline-block animate-pulse"></span> Live
          </div>
          <div v-else class="text-sm font-medium text-[#6B7A99] bg-[#F0F4FB] px-3 py-1 rounded-full">
            History
          </div>
        </div>
      </div>

      <div class="relative mb-4">
        <svg class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#2952D9]" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-4.35-4.35M17 11A6 6 0 115 11a6 6 0 0112 0z" />
        </svg>
        <input v-model="search" type="text" placeholder="Search by plate number or location..." class="w-full bg-[#F0F4FB] text-[#0F1F4D] placeholder-[#9AA6C0] rounded-xl pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#2952D9]" />
      </div>

      <div v-if="loading" class="text-center text-[#9AA6C0] text-sm py-6">Loading...</div>

      <div v-else-if="filteredViolations.length === 0" class="text-center text-[#9AA6C0] text-sm py-10">
        No tickets for this day.
      </div>

      <table v-else class="w-full text-sm">
        <thead>
          <tr class="text-left text-[#6B7A99] border-b border-[#E8EDF7]">
            <th class="pb-3 font-medium">Plate</th>
            <th class="pb-3 font-medium">Location</th>
            <th class="pb-3 font-medium">Time</th>
            <th class="pb-3 font-medium">Status</th>
            <th class="pb-3 font-medium">Transaction</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-[#F0F4FB]">
          <tr v-for="row in pagedViolations" :key="row.id" class="text-[#3B4A6B] hover:bg-[#F7F9FD]">
            <td class="py-3 font-semibold text-[#0F1F4D]">{{ row.plate_number }}</td>
            <td class="py-3">{{ row.location }}</td>
            <td class="py-3">{{ new Date(eventTime(row)).toLocaleTimeString() }}</td>
            <td class="py-3">
              <span :class="statusClass(row.status)" class="px-2.5 py-1 rounded-full text-xs font-semibold">
                {{ row.status }}
              </span>
            </td>
            <td class="py-3">
              <span class="px-2.5 py-1 rounded-full text-xs font-semibold bg-[#EAF0FF] text-[#2952D9]">
                {{ row.transaction_code ?? '—' }}
              </span>
            </td>
          </tr>
        </tbody>
      </table>

      <div v-if="!loading && filteredViolations.length > 0" class="flex items-center justify-between mt-4 text-sm text-[#6B7A99]">
        <span>
          Showing {{ pageStart + 1 }}–{{ Math.min(pageStart + pageSize, filteredViolations.length) }}
          of {{ filteredViolations.length }}
        </span>

        <div v-if="totalPages > 1" class="flex items-center gap-2">
          <button
            @click="page--"
            :disabled="page === 1"
            class="w-8 h-8 rounded-lg bg-[#F0F4FB] text-[#2952D9] font-bold hover:bg-[#EAF0FF] disabled:opacity-40 disabled:cursor-not-allowed"
          >
            &lt;
          </button>
          <span class="px-2 font-medium text-[#0F1F4D]">{{ page }} / {{ totalPages }}</span>
          <button
            @click="page++"
            :disabled="page === totalPages"
            class="w-8 h-8 rounded-lg bg-[#F0F4FB] text-[#2952D9] font-bold hover:bg-[#EAF0FF] disabled:opacity-40 disabled:cursor-not-allowed"
          >
            &gt;
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const search = ref('')
const loading = ref(true)
const violations = ref<any[]>([])

const stats = ref({
  total: 0,
  unpaid: 0,
  ticketSettled: 0,
})

// ---- date handling (local time, YYYY-MM-DD) ----
function toKey(value: string | Date) {
  const d = new Date(value)
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${d.getFullYear()}-${m}-${day}`
}

// refreshed on every poll, so the list rolls over to a new day automatically
const todayKey = ref(toKey(new Date()))
// null = follow today; set = user picked a past date from the calendar
const pickedDate = ref<string | null>(null)
const activeDate = computed(() => pickedDate.value ?? todayKey.value)
const isToday = computed(() => activeDate.value === todayKey.value)

function onPickDate(value: string) {
  pickedDate.value = !value || value === todayKey.value ? null : value
}

// time shown for a ticket: settled time if paid, else created time
function eventTime(v: any) {
  return v.paid_at ?? v.datetime
}

// ticket belongs to a day if it was created OR settled on that day
function belongsToDay(v: any, key: string) {
  if (toKey(v.datetime) === key) return true
  return !!v.paid_at && toKey(v.paid_at) === key
}

// ---- stats ----
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
  const count = (key: string) =>
    violations.value.filter(v => new Date(v.datetime).toDateString() === key).length

  return {
    total: pctChange(count(dayKey(0)), count(dayKey(1))),
  }
})

const statCards = computed(() => [
  { label: 'Total today', value: stats.value.total, trend: trends.value.total as number | null, color: 'text-[#2952D9]' },
  { label: 'Unpaid', value: stats.value.unpaid, trend: null as number | null, color: 'text-[#E8962E]' },
  { label: 'Ticket settled', value: stats.value.ticketSettled, trend: null as number | null, color: 'text-[#1F9D55]' },
])

async function loadViolations() {
  todayKey.value = toKey(new Date())

  try {
    const data = await $fetch<any[]>('/api/violations')

    violations.value = data
    const today = new Date().toDateString()
    stats.value.total = data.filter(v => new Date(v.datetime).toDateString() === today).length
    stats.value.unpaid = data.filter(v => v.status === 'Unpaid').length
    stats.value.ticketSettled = data.filter(v => v.status === 'Paid').length
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

// ---- list: selected day only, search, newest first ----
const filteredViolations = computed(() => {
  const q = search.value.toLowerCase()
  return violations.value
    .filter(v => belongsToDay(v, activeDate.value))
    .filter(v =>
      v.plate_number.toLowerCase().includes(q) ||
      (v.location ?? '').toLowerCase().includes(q)
    )
    .sort((a, b) => new Date(eventTime(b)).getTime() - new Date(eventTime(a)).getTime())
})

// ---- pagination ----
const pageSize = 10
const page = ref(1)
const totalPages = computed(() => Math.max(1, Math.ceil(filteredViolations.value.length / pageSize)))
const pageStart = computed(() => (page.value - 1) * pageSize)
const pagedViolations = computed(() =>
  filteredViolations.value.slice(pageStart.value, pageStart.value + pageSize)
)

watch([search, activeDate], () => { page.value = 1 })
watch(totalPages, (n) => { if (page.value > n) page.value = n })

function statusClass(status: string) {
  return {
    'Unpaid': 'bg-[#FDEBC8] text-[#D98A12]',
    'Paid': 'bg-[#DCF5E4] text-[#1F9D55]',
  }[status] ?? 'bg-[#F0F4FB] text-[#6B7A99]'
}
</script>