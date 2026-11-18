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

    <!-- Map + calendar: equal-size cards -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4 items-stretch">
      <!-- Map -->
      <div class="bg-white rounded-2xl shadow-[0_4px_16px_rgba(15,31,77,0.06)] p-6 flex flex-col">
        <div class="flex items-center justify-between mb-4">
          <div class="flex items-center">
            <span class="w-1 h-5 rounded-full bg-[#2952D9] mr-3"></span>
            <h2 class="text-lg font-semibold text-[#0F1F4D]">Violation map</h2>
          </div>
          <div class="flex items-center gap-1.5 text-xs text-[#6B7A99]">
            <span class="w-3 h-3 rounded-full bg-[#2952D9]"></span>
            {{ mappedCount }} detected
          </div>
        </div>
        <div ref="mapEl" class="w-full flex-1 min-h-[360px] rounded-xl overflow-hidden relative z-0"></div>
      </div>

      <!-- Calendar -->
      <div class="bg-white rounded-2xl shadow-[0_4px_16px_rgba(15,31,77,0.06)] p-6 flex flex-col">
        <div class="flex flex-wrap items-center justify-between gap-3 mb-4">
          <div class="flex items-center">
            <span class="w-1 h-5 rounded-full bg-[#2952D9] mr-3"></span>
            <h2 class="text-lg font-semibold text-[#0F1F4D]">Violation calendar</h2>
          </div>
          <div class="flex items-center gap-1">
            <button type="button" class="w-9 h-9 rounded-lg text-sm font-semibold text-[#0F1F4D] bg-[#F0F4FB] hover:bg-[#E0E8F8] transition-colors" aria-label="Previous month" @click="prevMonth">&lt;</button>
            <span class="min-w-[140px] text-center text-sm font-semibold text-[#0F1F4D]">{{ monthLabel }}</span>
            <button type="button" class="w-9 h-9 rounded-lg text-sm font-semibold text-[#0F1F4D] bg-[#F0F4FB] hover:bg-[#E0E8F8] transition-colors" aria-label="Next month" @click="nextMonth">&gt;</button>
            <button type="button" class="ml-2 px-3 h-9 rounded-lg text-xs font-semibold text-[#2952D9] bg-[#EAF0FF] hover:bg-[#E3EAFF] transition-colors" @click="goToday">Today</button>
          </div>
        </div>

        <div class="flex flex-wrap gap-x-6 gap-y-1 mb-4 text-xs text-[#6B7A99]">
          <span>Total: <b class="text-[#0F1F4D]">{{ monthTotals.total }}</b></span>
          <span>Paid: <b class="text-[#1F9D55]">{{ monthTotals.paid }}</b></span>
          <span>Unpaid: <b class="text-[#D98A12]">{{ monthTotals.unpaid }}</b></span>
        </div>

        <div class="grid grid-cols-7 gap-1.5 mb-1.5">
          <div v-for="w in WEEKDAYS" :key="w" class="text-center text-xs font-medium text-[#6B7A99] py-1">{{ w }}</div>
        </div>
        <div class="grid grid-cols-7 gap-1.5">
          <template v-for="(cell, i) in calendarCells" :key="i">
            <div v-if="!cell" class="h-14"></div>
            <button
              v-else
              type="button"
              :disabled="cell.key > todayKey"
              class="h-14 rounded-xl p-1.5 text-left flex flex-col justify-between transition-all hover:ring-2 hover:ring-[#2952D9]/40 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:ring-0"
              :class="[
                cell.key === activeDate ? 'ring-2 ring-[#2952D9]' : '',
                cell.total ? '' : 'bg-[#F7F9FD]',
              ]"
              :style="cellStyle(cell.total)"
              @click="onPickDate(cell.key)"
            >
              <span
                class="text-xs font-semibold"
                :class="cell.key === todayKey ? 'bg-[#2952D9] text-white rounded-full w-5 h-5 flex items-center justify-center' : 'text-[#0F1F4D]'"
              >{{ cell.day }}</span>
              <span v-if="cell.total" class="flex items-center gap-1 text-[10px] font-semibold text-[#0F1F4D]">
                {{ cell.total }}
                <span v-if="cell.paid" class="w-1.5 h-1.5 rounded-full bg-[#1F9D55]"></span>
                <span v-if="cell.unpaid" class="w-1.5 h-1.5 rounded-full bg-[#D98A12]"></span>
              </span>
            </button>
          </template>
        </div>
      </div>
    </div>

    <!-- Live monitor: full width -->
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
            <th class="pb-3 font-medium">Paid at</th>
            <th class="pb-3 font-medium">Transaction</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-[#F0F4FB]">
          <tr
            v-for="row in pagedViolations"
            :key="row.id"
            tabindex="0"
            class="text-[#3B4A6B] hover:bg-[#F7F9FD] cursor-pointer focus:outline-none focus:bg-[#F0F4FB]"
            @click="selectedId = row.id"
            @keydown.enter="selectedId = row.id"
          >
            <td class="py-3 font-semibold text-[#0F1F4D]">{{ row.plate_number }}</td>
            <td class="py-3">{{ row.location }}</td>
            <td class="py-3">{{ new Date(row.datetime).toLocaleTimeString() }}</td>
            <td class="py-3">
              <span :class="statusClass(row.status)" class="px-2.5 py-1 rounded-full text-xs font-semibold">
                {{ row.status }}
              </span>
            </td>
            <td class="py-3 text-[#1F9D55] font-medium">
              <template v-if="row.status === 'Paid' && row.paid_at">{{ formatDateTime(row.paid_at) }}</template>
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

    <!-- Ticket details modal -->
    <Teleport to="body">
      <div
        v-if="selected"
        class="fixed inset-0 z-[2000] flex items-center justify-center bg-[#0F1F4D]/40 p-4"
        @click.self="selectedId = null"
      >
        <div class="w-full max-w-md bg-white rounded-2xl shadow-[0_12px_40px_rgba(15,31,77,0.25)] p-6">
          <div class="flex items-start justify-between mb-5">
            <div>
              <p class="text-xs text-[#6B7A99] mb-1">Violation details</p>
              <h3 class="text-2xl font-bold text-[#0F1F4D]">{{ selected.plate_number }}</h3>
            </div>
            <button
              type="button"
              class="w-8 h-8 rounded-lg bg-[#F0F4FB] text-[#6B7A99] hover:bg-[#E0E8F8] font-bold"
              aria-label="Close"
              @click="selectedId = null"
            >✕</button>
          </div>

          <dl class="space-y-3 text-sm">
            <div class="flex justify-between gap-4">
              <dt class="text-[#6B7A99]">Status</dt>
              <dd>
                <span :class="statusClass(selected.status)" class="px-2.5 py-1 rounded-full text-xs font-semibold">
                  {{ selected.status }}
                </span>
              </dd>
            </div>
            <div class="flex justify-between gap-4">
              <dt class="text-[#6B7A99]">Location</dt>
              <dd class="text-right font-medium text-[#0F1F4D]">{{ selected.location || '—' }}</dd>
            </div>
            <div class="flex justify-between gap-4">
              <dt class="text-[#6B7A99]">Detected</dt>
              <dd class="text-right font-medium text-[#0F1F4D]">{{ formatDateTime(selected.datetime) }}</dd>
            </div>
            <div v-if="selected.status === 'Paid' && selected.paid_at" class="flex justify-between gap-4">
              <dt class="text-[#6B7A99]">Paid at</dt>
              <dd class="text-right font-medium text-[#1F9D55]">{{ formatDateTime(selected.paid_at) }}</dd>
            </div>
            <div class="flex justify-between gap-4">
              <dt class="text-[#6B7A99]">Transaction</dt>
              <dd>
                <span class="px-2.5 py-1 rounded-full text-xs font-semibold bg-[#EAF0FF] text-[#2952D9]">
                  {{ selected.transaction_code ?? '—' }}
                </span>
              </dd>
            </div>
          </dl>
        </div>
      </div>
    </Teleport>
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

const todayKey = ref(toKey(new Date()))
const pickedDate = ref<string | null>(null)
const activeDate = computed(() => pickedDate.value ?? todayKey.value)
const isToday = computed(() => activeDate.value === todayKey.value)

function onPickDate(value: string) {
  pickedDate.value = !value || value === todayKey.value ? null : value
}

function eventTime(v: any) {
  return v.paid_at ?? v.datetime
}

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
  initMap()
  window.addEventListener('keydown', onKeydown)
})

onUnmounted(() => {
  clearInterval(timer)
  geoStopped = true
  map?.remove()
  window.removeEventListener('keydown', onKeydown)
})

// ---- list ----
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

// ---- ticket details modal ----
const selectedId = ref<string | number | null>(null)

// looked up from the live list so status/payment updates show while the modal is open
const selected = computed(() =>
  selectedId.value == null ? null : violations.value.find(v => v.id === selectedId.value) ?? null
)

function formatDateTime(value: string) {
  return new Date(value).toLocaleString('en-US', {
    year: 'numeric', month: 'short', day: 'numeric',
    hour: 'numeric', minute: '2-digit', second: '2-digit',
  })
}

function onKeydown(e: KeyboardEvent) {
  if (e.key === 'Escape') selectedId.value = null
}

/* ------------------------------------------------------------------ */
/* Calendar                                                            */
/* ------------------------------------------------------------------ */
const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

function pad(n: number) {
  return String(n).padStart(2, '0')
}

const calYear = ref(new Date().getFullYear())
const calMonth = ref(new Date().getMonth())

const ticketsByDay = computed(() => {
  const map = new Map<string, any[]>()
  for (const t of violations.value) {
    const raw = t.datetime ?? t.date_issued
    if (!raw) continue
    const d = new Date(raw)
    if (isNaN(d.getTime())) continue
    const key = toKey(d)
    const list = map.get(key)
    if (list) list.push(t)
    else map.set(key, [t])
  }
  return map
})

const calendarCells = computed(() => {
  const first = new Date(calYear.value, calMonth.value, 1)
  const daysInMonth = new Date(calYear.value, calMonth.value + 1, 0).getDate()
  const cells: ({ key: string; day: number; total: number; paid: number; unpaid: number } | null)[] = []

  for (let i = 0; i < first.getDay(); i++) cells.push(null)
  for (let day = 1; day <= daysInMonth; day++) {
    const key = `${calYear.value}-${pad(calMonth.value + 1)}-${pad(day)}`
    const list = ticketsByDay.value.get(key) ?? []
    const paid = list.filter((t) => t.status === 'Paid').length
    cells.push({ key, day, total: list.length, paid, unpaid: list.length - paid })
  }
  return cells
})

const maxDay = computed(() => Math.max(1, ...calendarCells.value.map((c) => c?.total ?? 0)))

const monthTotals = computed(() =>
  calendarCells.value.reduce(
    (acc, c) => {
      if (c) {
        acc.total += c.total
        acc.paid += c.paid
        acc.unpaid += c.unpaid
      }
      return acc
    },
    { total: 0, paid: 0, unpaid: 0 }
  )
)

const monthLabel = computed(() =>
  new Date(calYear.value, calMonth.value, 1).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
)

function cellStyle(total: number) {
  if (!total) return {}
  const alpha = 0.1 + 0.35 * (total / maxDay.value)
  return { backgroundColor: `rgba(41, 82, 217, ${alpha.toFixed(2)})` }
}

function prevMonth() {
  if (calMonth.value === 0) {
    calMonth.value = 11
    calYear.value--
  } else {
    calMonth.value--
  }
}
function nextMonth() {
  if (calMonth.value === 11) {
    calMonth.value = 0
    calYear.value++
  } else {
    calMonth.value++
  }
}
function goToday() {
  const d = new Date()
  calYear.value = d.getFullYear()
  calMonth.value = d.getMonth()
  pickedDate.value = null
}

/* ------------------------------------------------------------------ */
/* Map (Leaflet + OpenStreetMap)                                       */
/* ------------------------------------------------------------------ */
const mapEl = ref<HTMLElement | null>(null)
const mappedCount = ref(0)
const geoVersion = ref(0)

const DEFAULT_CENTER: [number, number] = [8.9475, 125.5406] // Butuan City
const GEO_SUFFIX = ', Butuan City, Philippines'
const GEO_KEY = 'cttmd-geocache-v1'

let L: any = null
let map: any = null
let markerLayer: any = null
let lastFitKey = ''
let geoStopped = false

const geoCache: Record<string, [number, number] | null> = {}
const geoQueue: string[] = []
let geoRunning = false

// Use real coordinates from the ticket if the API provides them
function directCoords(v: any): [number, number] | null {
  const lat = v.latitude ?? v.lat
  const lng = v.longitude ?? v.lng ?? v.lon
  if (lat == null || lng == null) return null
  const a = Number(lat)
  const b = Number(lng)
  return Number.isFinite(a) && Number.isFinite(b) ? [a, b] : null
}

function coordsFor(v: any): [number, number] | null {
  return directCoords(v) ?? geoCache[(v.location ?? '').trim().toLowerCase()] ?? null
}

// Fallback: geocode the location text via Nominatim (1 request / sec), cached
async function runGeoQueue() {
  if (geoRunning) return
  geoRunning = true
  while (geoQueue.length && !geoStopped) {
    const key = geoQueue.shift()!
    try {
      const res = await $fetch<any[]>('https://nominatim.openstreetmap.org/search', {
        params: { q: key + GEO_SUFFIX, format: 'json', limit: 1 },
      })
      geoCache[key] = res?.[0] ? [Number(res[0].lat), Number(res[0].lon)] : null
    } catch {
      geoCache[key] = null
    }
    try { localStorage.setItem(GEO_KEY, JSON.stringify(geoCache)) } catch {}
    geoVersion.value++
    await new Promise((r) => setTimeout(r, 1100))
  }
  geoRunning = false
}

function queueGeocode(list: any[]) {
  for (const v of list) {
    const key = (v.location ?? '').trim().toLowerCase()
    if (!key || directCoords(v) || key in geoCache || geoQueue.includes(key)) continue
    geoQueue.push(key)
  }
  runGeoQueue()
}

function esc(s: any) {
  return String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]!))
}

async function initMap() {
  if (!mapEl.value) return
  L = (await import('leaflet')).default
  await import('leaflet/dist/leaflet.css')

  try { Object.assign(geoCache, JSON.parse(localStorage.getItem(GEO_KEY) || '{}')) } catch {}

  map = L.map(mapEl.value).setView(DEFAULT_CENTER, 13)
  L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
  }).addTo(map)
  markerLayer = L.layerGroup().addTo(map)

  setTimeout(() => map?.invalidateSize(), 200)
  queueGeocode(filteredViolations.value)
  renderMarkers()
}

function renderMarkers() {
  if (!map || !L) return
  markerLayer.clearLayers()

  // one pin per location
  const groups = new Map<string, { c: [number, number]; location: string; items: any[] }>()
  for (const v of filteredViolations.value) {
    const c = coordsFor(v)
    if (!c) continue
    const key = `${c[0].toFixed(5)},${c[1].toFixed(5)}`
    const g = groups.get(key)
    if (g) g.items.push(v)
    else groups.set(key, { c, location: v.location, items: [v] })
  }

  const pts: [number, number][] = []
  let count = 0

  for (const g of groups.values()) {
    pts.push(g.c)
    count += g.items.length

    const icon = L.divIcon({
      className: '',
      iconSize: [34, 34],
      iconAnchor: [17, 34],
      popupAnchor: [0, -34],
      html: `
        <div style="width:34px;height:34px;background:#2952D9;border:2px solid #fff;
          border-radius:50% 50% 50% 0;transform:rotate(-45deg);
          box-shadow:0 2px 6px rgba(0,0,0,.35);display:flex;align-items:center;justify-content:center;">
          <span style="transform:rotate(45deg);color:#fff;font-weight:700;font-size:13px;">${g.items.length}</span>
        </div>`,
    })

    L.marker(g.c, { icon })
      .bindPopup(
        `<b>${esc(g.location)}</b><br>${g.items.length} violation${g.items.length === 1 ? '' : 's'} detected`
      )
      .addTo(markerLayer)
  }
  mappedCount.value = count

  // re-fit only when the selected day changes, not on every 5s poll
  const fitKey = activeDate.value + '|' + (pts.length ? 'y' : 'n')
  if (pts.length && fitKey !== lastFitKey) {
    map.fitBounds(L.latLngBounds(pts).pad(0.2), { maxZoom: 16 })
    lastFitKey = fitKey
  }
}

watch(filteredViolations, (list) => {
  queueGeocode(list)
  renderMarkers()
})
watch(geoVersion, renderMarkers)
</script>