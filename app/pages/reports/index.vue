<template>
  <div>
    <div class="mb-6 flex items-center">
      <span class="w-1 h-8 rounded-full bg-[#2952D9] mr-3"></span>
      <div>
        <h1 class="text-3xl font-bold text-[#0F1F4D]">Reports</h1>
      </div>
    </div>

    <!-- Summary cards -->
    <div class="grid grid-cols-3 gap-4 mb-8">
      <div v-for="card in summary" :key="card.label" class="bg-white rounded-2xl shadow-[0_4px_16px_rgba(15,31,77,0.06)] p-5">
        <p class="text-sm text-[#6B7A99] mb-1">{{ card.label }}</p>
        <p :class="card.color" class="text-4xl font-bold">{{ card.value }}</p>
      </div>
    </div>

    <!-- Charts row 1: monthly bars + settlement donut -->
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-4">
      <div class="lg:col-span-2 bg-white rounded-2xl shadow-[0_4px_16px_rgba(15,31,77,0.06)] p-6">
        <div class="flex items-center justify-between mb-4">
          <div class="flex items-center">
            <span class="w-1 h-5 rounded-full bg-[#2952D9] mr-3"></span>
            <h2 class="text-lg font-semibold text-[#0F1F4D]">Violations per month</h2>
          </div>
          <div class="flex items-center gap-4 text-xs text-[#6B7A99]">
            <span class="flex items-center gap-1.5"><span class="w-3 h-3 rounded-sm bg-[#1F9D55]"></span>Settled</span>
            <span class="flex items-center gap-1.5"><span class="w-3 h-3 rounded-sm bg-[#F5B84B]"></span>Pending</span>
          </div>
        </div>

        <div v-if="!chartRows.length" class="py-16 text-center text-sm text-[#9AA6C0]">No data yet</div>
        <svg v-else :viewBox="`0 0 ${CW} ${CH}`" class="w-full h-auto">
          <g v-for="t in barTicks" :key="t.value">
            <line :x1="PL" :x2="CW - PR" :y1="t.y" :y2="t.y" stroke="#E8EDF7" stroke-width="1" />
            <text :x="PL - 8" :y="t.y + 3" text-anchor="end" font-size="10" fill="#6B7A99">{{ t.label }}</text>
          </g>
          <g v-for="b in bars" :key="b.key">
            <rect :x="b.x" :y="b.settledY" :width="b.w" :height="b.settledH" fill="#1F9D55">
              <title>{{ b.tip }}</title>
            </rect>
            <rect :x="b.x" :y="b.pendingY" :width="b.w" :height="b.pendingH" fill="#F5B84B">
              <title>{{ b.tip }}</title>
            </rect>
            <text :x="b.cx" :y="CH - 14" text-anchor="middle" font-size="10" fill="#6B7A99">{{ b.label }}</text>
          </g>
        </svg>
      </div>

      <div class="bg-white rounded-2xl shadow-[0_4px_16px_rgba(15,31,77,0.06)] p-6">
        <div class="flex items-center mb-4">
          <span class="w-1 h-5 rounded-full bg-[#2952D9] mr-3"></span>
          <h2 class="text-lg font-semibold text-[#0F1F4D]">Settlement rate</h2>
        </div>
        <div class="flex flex-col items-center">
          <svg viewBox="0 0 160 160" class="w-44 h-44">
            <circle cx="80" cy="80" :r="R" fill="none" :stroke="donutTotal ? '#F5B84B' : '#E8EDF7'" stroke-width="20" />
            <circle
              cx="80"
              cy="80"
              :r="R"
              fill="none"
              stroke="#1F9D55"
              stroke-width="20"
              :stroke-dasharray="`${settledLen} ${CIRC}`"
              transform="rotate(-90 80 80)"
            />
            <text x="80" y="82" text-anchor="middle" font-size="26" font-weight="700" fill="#0F1F4D">{{ settledPct }}%</text>
            <text x="80" y="100" text-anchor="middle" font-size="10" fill="#6B7A99">settled</text>
          </svg>
          <div class="mt-4 w-full space-y-2 text-sm">
            <div class="flex items-center justify-between">
              <span class="flex items-center gap-2 text-[#6B7A99]"><span class="w-3 h-3 rounded-sm bg-[#1F9D55]"></span>Settled</span>
              <span class="font-semibold text-[#0F1F4D]">{{ settledTotal.toLocaleString() }}</span>
            </div>
            <div class="flex items-center justify-between">
              <span class="flex items-center gap-2 text-[#6B7A99]"><span class="w-3 h-3 rounded-sm bg-[#F5B84B]"></span>Pending</span>
              <span class="font-semibold text-[#0F1F4D]">{{ pendingTotal.toLocaleString() }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Revenue trend -->
    <div class="bg-white rounded-2xl shadow-[0_4px_16px_rgba(15,31,77,0.06)] p-6 mb-4">
      <div class="flex items-center mb-4">
        <span class="w-1 h-5 rounded-full bg-[#2952D9] mr-3"></span>
        <h2 class="text-lg font-semibold text-[#0F1F4D]">Revenue trend (₱)</h2>
      </div>
      <div v-if="!chartRows.length" class="py-16 text-center text-sm text-[#9AA6C0]">No data yet</div>
      <svg v-else :viewBox="`0 0 ${CW} ${CH}`" class="w-full h-auto">
        <defs>
          <linearGradient id="revFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stop-color="#2952D9" stop-opacity="0.25" />
            <stop offset="100%" stop-color="#2952D9" stop-opacity="0" />
          </linearGradient>
        </defs>
        <g v-for="t in revTicks" :key="t.value">
          <line :x1="PL" :x2="CW - PR" :y1="t.y" :y2="t.y" stroke="#E8EDF7" stroke-width="1" />
          <text :x="PL - 8" :y="t.y + 3" text-anchor="end" font-size="10" fill="#6B7A99">{{ t.label }}</text>
        </g>
        <path :d="areaPath" fill="url(#revFill)" />
        <path :d="linePath" fill="none" stroke="#2952D9" stroke-width="2.5" stroke-linejoin="round" stroke-linecap="round" />
        <g v-for="p in revPoints" :key="p.label">
          <circle :cx="p.x" :cy="p.y" r="4" fill="#fff" stroke="#2952D9" stroke-width="2">
            <title>{{ p.tip }}</title>
          </circle>
          <text :x="p.x" :y="CH - 14" text-anchor="middle" font-size="10" fill="#6B7A99">{{ p.label }}</text>
        </g>
      </svg>
    </div>

    <!-- Calendar -->
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-4">
      <div class="lg:col-span-2 bg-white rounded-2xl shadow-[0_4px_16px_rgba(15,31,77,0.06)] p-6">
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
            <div v-if="!cell" class="h-16"></div>
            <button
              v-else
              type="button"
              class="h-16 rounded-xl p-2 text-left flex flex-col justify-between transition-all hover:ring-2 hover:ring-[#2952D9]/40"
              :class="[
                cell.key === selectedKey ? 'ring-2 ring-[#2952D9]' : '',
                cell.total ? '' : 'bg-[#F7F9FD]',
              ]"
              :style="cellStyle(cell.total)"
              @click="selectedKey = cell.key"
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

      <!-- Selected day -->
      <div class="bg-white rounded-2xl shadow-[0_4px_16px_rgba(15,31,77,0.06)] p-6 flex flex-col">
        <div class="flex items-center mb-1">
          <span class="w-1 h-5 rounded-full bg-[#2952D9] mr-3"></span>
          <h2 class="text-lg font-semibold text-[#0F1F4D]">{{ selectedLabel }}</h2>
        </div>
        <p class="text-xs text-[#6B7A99] mb-4 ml-4">{{ selectedTickets.length }} violation{{ selectedTickets.length === 1 ? '' : 's' }}</p>

        <div v-if="!selectedTickets.length" class="flex-1 flex items-center justify-center text-sm text-[#9AA6C0] py-10">
          No violations on this day
        </div>
        <div v-else class="space-y-3 overflow-y-auto max-h-[420px] pr-1">
          <div v-for="t in selectedTickets" :key="t.id" class="bg-[#F0F4FB] rounded-2xl px-4 py-3">
            <div class="flex items-center justify-between gap-2">
              <span class="font-semibold text-[#0F1F4D] text-sm">{{ t.plate_number }}</span>
              <span
                class="px-2.5 py-0.5 rounded-full text-[10px] font-semibold"
                :class="t.status === 'Paid' ? 'bg-[#DCF5E4] text-[#1F9D55]' : 'bg-[#FDEBC8] text-[#D98A12]'"
              >{{ t.status }}</span>
            </div>
            <div class="text-xs text-[#3B4A6B] mt-1">{{ t.violation }}</div>
            <div class="text-xs text-[#6B7A99] mt-0.5">{{ t.location }}</div>
          </div>
        </div>
      </div>
    </div>

    <!-- Table -->
    <div class="bg-white rounded-2xl shadow-[0_4px_16px_rgba(15,31,77,0.06)] p-6">
      <div class="flex items-center justify-between mb-4">
        <div class="flex items-center">
          <span class="w-1 h-5 rounded-full bg-[#2952D9] mr-3"></span>
          <h2 class="text-lg font-semibold text-[#0F1F4D]">Monthly breakdown</h2>
        </div>
        <button
          @click="exportReport"
          :disabled="!reportRows.length"
          class="bg-[#EAF0FF] text-[#2952D9] hover:bg-[#E3EAFF] disabled:opacity-50 rounded-xl px-4 py-2.5 text-sm font-semibold flex items-center gap-2 transition-colors"
        >
          <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
          </svg>
          Export
        </button>
      </div>
      <table class="w-full text-sm">
        <thead>
          <tr class="text-left text-[#6B7A99] border-b border-[#E8EDF7]">
            <th class="pb-3 font-medium">Month</th>
            <th class="pb-3 font-medium">Total Violations</th>
            <th class="pb-3 font-medium">Settled</th>
            <th class="pb-3 font-medium">Pending</th>
            <th class="pb-3 font-medium">Revenue</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-[#F0F4FB] text-[#3B4A6B]">
          <tr v-for="row in reportRows" :key="row.month" class="hover:bg-[#F7F9FD]">
            <td class="py-3 font-semibold text-[#0F1F4D]">{{ row.month }}</td>
            <td class="py-3">{{ row.total }}</td>
            <td class="py-3 font-semibold text-[#1F9D55]">{{ row.settled }}</td>
            <td class="py-3 font-semibold text-[#D98A12]">{{ row.pending }}</td>
            <td class="py-3 font-semibold text-[#0F1F4D]">₱{{ row.revenue.toLocaleString() }}</td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup lang="ts">
const reportRows = ref<any[]>([])
const tickets = ref<any[]>([])

onMounted(async () => {
  const [reports, list] = await Promise.all([
    $fetch<any[]>('/api/reports').catch((error) => {
      console.error(error)
      return [] as any[]
    }),
    $fetch<any[]>('/api/violations').catch((error) => {
      console.error(error)
      return [] as any[]
    }),
  ])
  reportRows.value = reports
  tickets.value = list
})

const summary = computed(() => {
  const latest = reportRows.value[0]
  return [
    { label: 'Total violations this month', value: latest?.total ?? 0, color: 'text-[#2952D9]' },
    { label: 'Total settled', value: latest?.settled ?? 0, color: 'text-[#1F9D55]' },
    { label: 'Total revenue (₱)', value: (latest?.revenue ?? 0).toLocaleString(), color: 'text-[#0F1F4D]' },
  ]
})

/* ------------------------------------------------------------------ */
/* Charts (plain SVG, no extra library)                                */
/* ------------------------------------------------------------------ */
const CW = 600
const CH = 260
const PL = 48
const PR = 16
const PT = 16
const PB = 36
const plotW = CW - PL - PR
const plotH = CH - PT - PB
const baseY = PT + plotH

// reportRows comes newest-first, charts read oldest -> newest (last 12 months)
const chartRows = computed(() => reportRows.value.slice(0, 12).reverse())

// Round a maximum up so the 4 gridline steps are clean numbers
function niceMax(v: number) {
  const m = Math.max(v, 4)
  const raw = m / 4
  const pow = 10 ** Math.floor(Math.log10(raw))
  const n = raw / pow
  const step = (n <= 1 ? 1 : n <= 2 ? 2 : n <= 5 ? 5 : 10) * pow
  return step * 4
}

function makeTicks(max: number, fmt: (v: number) => string) {
  return Array.from({ length: 5 }, (_, i) => {
    const value = (max / 4) * i
    return { value, label: fmt(value), y: baseY - (value / max) * plotH }
  })
}

// Bar chart (settled + pending stacked)
const barMax = computed(() =>
  niceMax(
    Math.max(
      0,
      ...chartRows.value.map((r) =>
        Math.max(Number(r.total) || 0, (Number(r.settled) || 0) + (Number(r.pending) || 0))
      )
    )
  )
)
const barTicks = computed(() => makeTicks(barMax.value, (v) => String(Math.round(v))))

const bars = computed(() => {
  const n = chartRows.value.length
  if (!n) return []
  const groupW = plotW / n
  const barW = Math.min(36, groupW * 0.55)
  return chartRows.value.map((r, i) => {
    const settled = Number(r.settled) || 0
    const pending = Number(r.pending) || 0
    const sH = (settled / barMax.value) * plotH
    const pH = (pending / barMax.value) * plotH
    return {
      key: String(r.month),
      label: String(r.month),
      cx: PL + i * groupW + groupW / 2,
      x: PL + i * groupW + (groupW - barW) / 2,
      w: barW,
      settledY: baseY - sH,
      settledH: sH,
      pendingY: baseY - sH - pH,
      pendingH: pH,
      tip: `${r.month}: ${settled} settled, ${pending} pending`,
    }
  })
})

// Revenue line
const revMax = computed(() => niceMax(Math.max(0, ...chartRows.value.map((r) => Number(r.revenue) || 0))))
const revTicks = computed(() =>
  makeTicks(revMax.value, (v) => v.toLocaleString('en-US', { notation: 'compact', maximumFractionDigits: 1 }))
)

const revPoints = computed(() => {
  const n = chartRows.value.length
  if (!n) return []
  const groupW = plotW / n
  return chartRows.value.map((r, i) => {
    const rev = Number(r.revenue) || 0
    return {
      x: PL + i * groupW + groupW / 2,
      y: baseY - (rev / revMax.value) * plotH,
      label: String(r.month),
      tip: `${r.month}: ₱${rev.toLocaleString()}`,
    }
  })
})

const linePath = computed(() => revPoints.value.map((p, i) => `${i ? 'L' : 'M'}${p.x} ${p.y}`).join(' '))
const areaPath = computed(() => {
  const pts = revPoints.value
  const first = pts[0]
  const last = pts[pts.length - 1]
  if (!first || !last) return ''
  return `${linePath.value} L${last.x} ${baseY} L${first.x} ${baseY} Z`
})

// Donut
const R = 60
const CIRC = 2 * Math.PI * R
const settledTotal = computed(() => reportRows.value.reduce((s, r) => s + (Number(r.settled) || 0), 0))
const pendingTotal = computed(() => reportRows.value.reduce((s, r) => s + (Number(r.pending) || 0), 0))
const donutTotal = computed(() => settledTotal.value + pendingTotal.value)
const settledLen = computed(() => (donutTotal.value ? (CIRC * settledTotal.value) / donutTotal.value : 0))
const settledPct = computed(() => (donutTotal.value ? Math.round((settledTotal.value / donutTotal.value) * 100) : 0))

/* ------------------------------------------------------------------ */
/* Calendar                                                            */
/* ------------------------------------------------------------------ */
const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

function pad(n: number) {
  return String(n).padStart(2, '0')
}
function dateKey(d: Date) {
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`
}

const now = new Date()
const todayKey = dateKey(now)
const calYear = ref(now.getFullYear())
const calMonth = ref(now.getMonth())
const selectedKey = ref(todayKey)

// Group every ticket by the day it was issued
const ticketsByDay = computed(() => {
  const map = new Map<string, any[]>()
  for (const t of tickets.value) {
    const raw = t.datetime ?? t.date_issued
    if (!raw) continue
    const d = new Date(raw)
    if (isNaN(d.getTime())) continue
    const key = dateKey(d)
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

// Busier days get a stronger blue tint
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
  selectedKey.value = dateKey(d)
}

const selectedTickets = computed(() => ticketsByDay.value.get(selectedKey.value) ?? [])
const selectedLabel = computed(() =>
  new Date(`${selectedKey.value}T00:00:00`).toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
)

/* ------------------------------------------------------------------ */
/* Export                                                              */
/* ------------------------------------------------------------------ */
function exportReport() {
  if (!reportRows.value.length) return

  const header = ['Month', 'Total Violations', 'Settled', 'Pending', 'Revenue (PHP)']
  const lines = reportRows.value.map((r) => [r.month, r.total, r.settled, r.pending, r.revenue])

  const csv = [header, ...lines]
    .map((cols) => cols.map((c) => `"${String(c ?? '').replace(/"/g, '""')}"`).join(','))
    .join('\r\n')

  // \uFEFF makes Excel read the file as UTF-8
  const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `cttmd-report-${new Date().toISOString().slice(0, 10)}.csv`
  a.click()
  URL.revokeObjectURL(url)
}
</script>