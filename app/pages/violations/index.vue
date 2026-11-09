<template>
  <div>
    <div class="mb-6 flex items-center">
      <span class="w-1 h-8 rounded-full bg-[#2952D9] mr-3"></span>
      <div>
        <h1 class="text-3xl font-bold text-[#0F1F4D]">All violations</h1>
      </div>
    </div>

    <div class="flex gap-3 mb-6">
      <input v-model="search" type="text" placeholder="Search plate or location..." class="flex-1 bg-white text-[#0F1F4D] placeholder-[#9AA6C0] rounded-xl px-4 py-3 text-sm shadow-[0_4px_16px_rgba(15,31,77,0.06)] focus:outline-none focus:ring-2 focus:ring-[#2952D9]" />
      <div class="relative">
        <select v-model="statusFilter" class="appearance-none h-full bg-white text-[#0F1F4D] rounded-xl pl-4 pr-10 py-3 text-sm shadow-[0_4px_16px_rgba(15,31,77,0.06)] focus:outline-none focus:ring-2 focus:ring-[#2952D9] cursor-pointer">
          <option value="">All status</option>
          <option>Unpaid</option>
          <option>Paid</option>
        </select>
        <svg class="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#6B7A99]" viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M5 8l5 5 5-5" />
        </svg>
      </div>
    </div>

    <div class="bg-white rounded-2xl shadow-[0_4px_16px_rgba(15,31,77,0.06)]">
      <div v-if="loading" class="p-10 text-center text-[#9AA6C0] text-sm">Loading...</div>
      <template v-else>
        <table class="w-full text-sm">
          <thead>
            <tr class="text-left text-[#6B7A99] border-b border-[#E8EDF7]">
              <th class="px-6 py-4 font-medium">Plate</th>
              <th class="px-6 py-4 font-medium">Violation</th>
              <th class="px-6 py-4 font-medium">Location</th>
              <th class="px-6 py-4 font-medium">Officer</th>
              <th class="px-6 py-4 font-medium">Date</th>
              <th class="px-6 py-4 font-medium">Status</th>
              <th class="px-6 py-4 font-medium text-right">Action</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-[#F0F4FB]">
            <tr
              v-for="row in paginated"
              :key="row.id"
              class="text-[#3B4A6B] hover:bg-[#F7F9FD] cursor-pointer transition-colors"
              @click="openRow(row)"
            >
              <td class="px-6 py-4 font-semibold text-[#0F1F4D]">{{ row.plate_number }}</td>
              <td class="px-6 py-4">{{ row.violation }}</td>
              <td class="px-6 py-4">{{ row.location }}</td>
              <td class="px-6 py-4">{{ row.officers?.officer_code ?? 'N/A' }}</td>
              <td class="px-6 py-4">{{ row.datetime }}</td>
              <td class="px-6 py-4">
                <span :class="statusClass(row.status)" class="px-3 py-1 rounded-full text-xs font-semibold">
                  {{ row.status }}
                </span>
              </td>
              <td class="px-6 py-4 text-right">
                <button
                  type="button"
                  class="px-4 py-1.5 rounded-lg bg-[#2952D9] text-white text-xs font-semibold hover:bg-[#1F42B8] transition-colors"
                  @click.stop="openRow(row)"
                >
                  View
                </button>
              </td>
            </tr>
            <tr v-if="!paginated.length">
              <td colspan="7" class="px-6 py-10 text-center text-[#9AA6C0]">No violations found</td>
            </tr>
          </tbody>
        </table>

        <!-- Pagination -->
        <div
          v-if="filtered.length"
          class="flex flex-wrap items-center justify-between gap-4 px-6 py-4 border-t border-[#E8EDF7]"
        >
          <div class="flex items-center gap-3 text-xs text-[#6B7A99]">
            <span>Showing {{ rangeStart }}–{{ rangeEnd }} of {{ filtered.length }}</span>
            <div class="relative">
              <select v-model.number="pageSize" class="appearance-none bg-[#F0F4FB] text-[#0F1F4D] rounded-lg pl-3 pr-8 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-[#2952D9] cursor-pointer">
                <option v-for="n in [10, 25, 50, 100]" :key="n" :value="n">{{ n }} / page</option>
              </select>
              <svg class="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#6B7A99]" viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M5 8l5 5 5-5" />
              </svg>
            </div>
          </div>

          <div class="flex items-center gap-1">
            <button
              type="button"
              class="w-9 h-9 rounded-lg text-sm font-semibold text-[#0F1F4D] bg-[#F0F4FB] hover:bg-[#E0E8F8] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              :disabled="page === 1"
              aria-label="Previous page"
              @click="page--"
            >
              &lt;
            </button>

            <template v-for="(p, i) in pageNumbers" :key="i">
              <span v-if="p === '...'" class="w-9 h-9 flex items-center justify-center text-[#9AA6C0]">…</span>
              <button
                v-else
                type="button"
                class="w-9 h-9 rounded-lg text-sm font-semibold transition-colors"
                :class="p === page ? 'bg-[#2952D9] text-white' : 'text-[#3B4A6B] hover:bg-[#F0F4FB]'"
                @click="page = p as number"
              >
                {{ p }}
              </button>
            </template>

            <button
              type="button"
              class="w-9 h-9 rounded-lg text-sm font-semibold text-[#0F1F4D] bg-[#F0F4FB] hover:bg-[#E0E8F8] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              :disabled="page === totalPages"
              aria-label="Next page"
              @click="page++"
            >
              &gt;
            </button>
          </div>
        </div>
      </template>
    </div>

    <!-- Details modal -->
    <Teleport to="body">
      <div
        v-if="selected"
        class="fixed inset-0 z-50 flex items-center justify-center bg-[#0B1A3B]/60 backdrop-blur-sm p-4"
        @click.self="selected = null"
      >
        <div class="bg-white rounded-3xl shadow-[0_8px_32px_rgba(11,26,59,0.35)] w-full max-w-3xl max-h-[90vh] overflow-hidden flex flex-col">

          <!-- Header -->
          <div class="bg-gradient-to-br from-[#0B1A3B] via-[#1B3262] to-[#2952D9] text-white px-8 py-6 flex items-start justify-between">
            <div>
              <div class="text-sm text-white/60">Violation details</div>
              <div class="text-3xl font-bold mt-1">{{ selected.plate_number }}</div>
              <div class="text-sm text-white/70 mt-1">{{ selected.violation }}</div>
            </div>
            <div class="flex items-center gap-3">
              <span :class="statusClass(selected.status)" class="px-3 py-1 rounded-full text-xs font-semibold">
                {{ selected.status }}
              </span>
              <button class="text-white/70 hover:text-white text-2xl leading-none" @click="selected = null">&times;</button>
            </div>
          </div>

          <!-- Body -->
          <div class="p-8 overflow-y-auto space-y-8">

            <div>
              <div class="flex items-center mb-4">
                <span class="w-1 h-5 rounded-full bg-[#2952D9] mr-3"></span>
                <h3 class="text-lg font-semibold text-[#0F1F4D]">Details</h3>
              </div>
              <div class="grid grid-cols-2 gap-4">
                <div v-for="d in details" :key="d.label" class="bg-[#F0F4FB] rounded-2xl px-5 py-4">
                  <div class="text-xs text-[#6B7A99] mb-1">{{ d.label }}</div>
                  <div class="text-sm font-semibold text-[#0F1F4D] break-words">{{ d.value }}</div>
                </div>
              </div>
            </div>

            <div>
              <div class="flex items-center mb-4">
                <span class="w-1 h-5 rounded-full bg-[#2952D9] mr-3"></span>
                <h3 class="text-lg font-semibold text-[#0F1F4D]">Proof images</h3>
                <span class="ml-2 text-xs text-[#6B7A99]">({{ images.length }})</span>
              </div>
              <div v-if="images.length" class="grid grid-cols-2 gap-4">
                <img
                  v-for="(src, i) in images"
                  :key="i"
                  :src="src"
                  alt="Proof"
                  class="w-full h-56 object-cover rounded-2xl cursor-zoom-in bg-[#F0F4FB]"
                  @click="zoom = src"
                />
              </div>
              <div v-else class="bg-[#F0F4FB] rounded-2xl p-8 text-center text-sm text-[#9AA6C0]">
                No images uploaded
              </div>
            </div>

            <div v-if="videos.length">
              <div class="flex items-center mb-4">
                <span class="w-1 h-5 rounded-full bg-[#2952D9] mr-3"></span>
                <h3 class="text-lg font-semibold text-[#0F1F4D]">Video proof</h3>
                <span class="ml-2 text-xs text-[#6B7A99]">({{ videos.length }})</span>
              </div>
              <div class="space-y-4">
                <video
                  v-for="(src, i) in videos"
                  :key="i"
                  :src="src"
                  controls
                  preload="metadata"
                  class="w-full max-h-96 rounded-2xl bg-black"
                ></video>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Image zoom -->
      <div
        v-if="zoom"
        class="fixed inset-0 z-[60] flex items-center justify-center bg-black/80 p-6 cursor-zoom-out"
        @click="zoom = null"
      >
        <img :src="zoom" alt="Proof" class="max-w-full max-h-full rounded-2xl" />
      </div>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
const search = ref('')
const statusFilter = ref('')
const violations = ref<any[]>([])
const loading = ref(true)
const selected = ref<any | null>(null)
const zoom = ref<string | null>(null)
const imagesLoading = ref(false)

// Pagination
const page = ref(1)
const pageSize = ref(10)

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

const totalPages = computed(() => Math.max(1, Math.ceil(filtered.value.length / pageSize.value)))

const paginated = computed(() => {
  const start = (page.value - 1) * pageSize.value
  return filtered.value.slice(start, start + pageSize.value)
})

const rangeStart = computed(() => (filtered.value.length ? (page.value - 1) * pageSize.value + 1 : 0))
const rangeEnd = computed(() => Math.min(page.value * pageSize.value, filtered.value.length))

// Page buttons with ellipsis: 1 ... 4 5 6 ... 100
const pageNumbers = computed<(number | string)[]>(() => {
  const t = totalPages.value
  const c = page.value
  if (t <= 7) return Array.from({ length: t }, (_, i) => i + 1)

  const nums = [...new Set([1, t, c - 1, c, c + 1])]
    .filter((n) => n >= 1 && n <= t)
    .sort((a, b) => a - b)

  const result: (number | string)[] = []
  let prev = 0
  for (const n of nums) {
    if (prev && n - prev > 1) result.push('...')
    result.push(n)
    prev = n
  }
  return result
})

// Go back to page 1 when the filters change
watch([search, statusFilter, pageSize], () => {
  page.value = 1
})

// Keep the page valid if the data shrinks
watch(totalPages, (t) => {
  if (page.value > t) page.value = t
})

// Fields not shown in the details grid
const HIDDEN_KEYS = ['id', 'officers', 'officer_id', 'images', 'videos', 'evidence']

const images = computed<string[]>(() => selected.value?.images ?? [])
const videos = computed<string[]>(() => selected.value?.videos ?? [])

// If the list didn't include media, try the full ticket record
async function openRow(row: any) {
  selected.value = row
  if (row.images?.length || row.videos?.length || !row.transaction_code) return

  imagesLoading.value = true
  try {
    const full = await $fetch<any>(`/api/settlement/${encodeURIComponent(row.transaction_code)}`)
    if (selected.value?.id === row.id) {
      selected.value = { ...row, images: full.images ?? [], videos: full.videos ?? [] }
    }
  } catch (error) {
    console.error(error)
  }
  imagesLoading.value = false
}

const details = computed(() => {
  if (!selected.value) return []
  const row = selected.value
  const list = [{ label: 'Officer', value: row.officers?.officer_code ?? 'N/A' }]
  for (const [key, val] of Object.entries(row)) {
    if (HIDDEN_KEYS.includes(key)) continue
    list.push({ label: formatLabel(key), value: formatValue(key, val) })
  }
  return list
})

function formatLabel(key: string) {
  const s = key.replace(/_/g, ' ')
  return s.charAt(0).toUpperCase() + s.slice(1)
}

function formatValue(key: string, val: any) {
  if (val === null || val === undefined || val === '') return 'N/A'
  if (typeof val === 'boolean') return val ? 'Yes' : 'No'
  if (typeof val === 'object') return JSON.stringify(val)
  return String(val)
}

function statusClass(status: string) {
  return (
    {
      Unpaid: 'bg-[#FDEBC8] text-[#D98A12]',
      Paid: 'bg-[#DCF5E4] text-[#1F9D55]',
    } as Record<string, string>
  )[status] ?? 'bg-[#F0F4FB] text-[#6B7A99]'
}
</script>