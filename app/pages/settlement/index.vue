<template>
  <div>
    <div class="mb-6 flex items-center justify-between gap-4">
      <div class="flex items-center">
        <span class="w-1 h-8 rounded-full bg-[#2952D9] mr-3"></span>
        <div>
          <h1 class="text-3xl font-bold text-[#0F1F4D]">
            {{ showHistory ? 'Settlement history' : 'Process settlement' }}
          </h1>
        </div>
      </div>

      <div class="flex items-center gap-3">
        <!-- Back button (only while viewing History) -->
        <button
          v-if="showHistory"
          type="button"
          class="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold bg-white text-[#3B4A6B] shadow-[0_4px_16px_rgba(15,31,77,0.06)] hover:bg-[#F0F4FB] transition-colors"
          @click="showHistory = false"
        >
          <svg class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M19 12H5" />
            <path d="M12 19l-7-7 7-7" />
          </svg>
          Back
        </button>

        <!-- History toggle (click again to go back too) -->
        <button
          type="button"
          class="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold shadow-[0_4px_16px_rgba(15,31,77,0.06)] transition-colors"
          :class="showHistory ? 'bg-[#2952D9] text-white hover:bg-[#1F42B8]' : 'bg-white text-[#2952D9] hover:bg-[#F0F4FB]'"
          @click="showHistory = !showHistory"
        >
          <svg class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="12" cy="12" r="9" />
            <path d="M12 7v5l3 2" />
          </svg>
          History
        </button>
      </div>
    </div>

    <div class="mb-6">
      <input
        v-model="search"
        type="text"
        placeholder="Search transaction code, plate or location..."
        class="w-full bg-white text-[#0F1F4D] placeholder-[#9AA6C0] rounded-xl px-4 py-3 text-sm shadow-[0_4px_16px_rgba(15,31,77,0.06)] focus:outline-none focus:ring-2 focus:ring-[#2952D9]"
      />
    </div>

    <div class="bg-white rounded-2xl shadow-[0_4px_16px_rgba(15,31,77,0.06)]">
      <div v-if="listLoading" class="p-10 text-center text-[#9AA6C0] text-sm">Loading...</div>
      <div v-else-if="!filtered.length" class="p-10 text-center text-[#9AA6C0] text-sm">
        {{ showHistory ? 'No paid violations yet' : 'No unpaid violations' }}
      </div>
      <template v-else>
        <table class="w-full text-sm">
          <thead>
            <tr class="text-left text-[#6B7A99] border-b border-[#E8EDF7]">
              <th class="px-6 py-4 font-medium">Transaction</th>
              <th class="px-6 py-4 font-medium">Plate</th>
              <th class="px-6 py-4 font-medium">Violation</th>
              <th class="px-6 py-4 font-medium">Location</th>
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
              @click="openRecord(row)"
            >
              <td class="px-6 py-4 text-[#2952D9] font-medium">{{ row.transaction_code ?? '—' }}</td>
              <td class="px-6 py-4 font-semibold text-[#0F1F4D]">{{ row.plate_number }}</td>
              <td class="px-6 py-4">{{ row.violation }}</td>
              <td class="px-6 py-4">{{ row.location }}</td>
              <td class="px-6 py-4">{{ row.datetime }}</td>
              <td class="px-6 py-4">
                <span
                  class="px-3 py-1 rounded-full text-xs font-semibold"
                  :class="showHistory ? 'bg-[#DCF5E4] text-[#1F9D55]' : 'bg-[#FDEBC8] text-[#D98A12]'"
                >
                  {{ showHistory ? 'Paid' : 'Unpaid' }}
                </span>
              </td>
              <td class="px-6 py-4 text-right">
                <button
                  type="button"
                  class="px-4 py-1.5 rounded-lg bg-[#2952D9] text-white text-xs font-semibold hover:bg-[#1F42B8] transition-colors"
                  @click.stop="openRecord(row)"
                >
                  View
                </button>
              </td>
            </tr>
          </tbody>
        </table>

        <!-- Pagination -->
        <div class="flex flex-wrap items-center justify-between gap-4 px-6 py-4 border-t border-[#E8EDF7]">
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

    <!-- Settlement modal -->
    <Teleport to="body">
      <div
        v-if="modalOpen"
        class="fixed inset-0 z-50 flex items-center justify-center bg-[#0B1A3B]/60 backdrop-blur-sm p-4"
        @click.self="closeModal"
      >
        <div class="bg-white rounded-3xl shadow-[0_8px_32px_rgba(11,26,59,0.35)] w-full max-w-3xl max-h-[90vh] overflow-hidden flex flex-col">

          <div v-if="recordLoading" class="p-16 text-center text-[#9AA6C0] text-sm">Loading record...</div>

          <template v-else-if="record">
            <div class="bg-gradient-to-br from-[#0B1A3B] via-[#1B3262] to-[#2952D9] text-white px-8 py-6 flex items-start justify-between">
              <div>
                <div class="text-sm text-white/60">Violation record</div>
                <div class="text-3xl font-bold mt-1">{{ record.txCode }}</div>
              </div>
              <div class="flex items-center gap-3">
                <span :class="record.paid ? 'bg-[#DCF5E4] text-[#1F9D55]' : 'bg-[#FDEBC8] text-[#D98A12]'" class="px-3 py-1 rounded-full text-xs font-semibold">
                  {{ record.paid ? 'Paid' : 'Unpaid' }}
                </span>
                <button class="text-white/70 hover:text-white text-2xl leading-none" @click="closeModal">&times;</button>
              </div>
            </div>

            <div class="p-8 overflow-y-auto space-y-6">
              <div class="grid grid-cols-2 gap-4">
                <div class="bg-[#F0F4FB] rounded-2xl p-5">
                  <h3 class="text-xs font-semibold text-[#6B7A99] uppercase tracking-wider mb-4">Vehicle Details</h3>
                  <div class="space-y-3 text-sm">
                    <div class="flex justify-between gap-4"><span class="text-[#6B7A99]">Plate Number</span><span class="font-semibold text-[#0F1F4D]">{{ record.plate }}</span></div>
                    <div class="flex justify-between gap-4"><span class="text-[#6B7A99]">Vehicle</span><span class="font-semibold text-[#0F1F4D]">{{ record.vehicle }}</span></div>
                    <div class="flex justify-between gap-4"><span class="text-[#6B7A99]">Violation</span><span class="font-semibold text-[#E5484D]">{{ record.violation }}</span></div>
                    <div class="flex justify-between gap-4"><span class="text-[#6B7A99]">Fine</span><span class="font-semibold text-[#0F1F4D]">₱{{ record.fine }}</span></div>
                  </div>
                </div>

                <div class="bg-[#F0F4FB] rounded-2xl p-5">
                  <h3 class="text-xs font-semibold text-[#6B7A99] uppercase tracking-wider mb-4">Apprehension Details</h3>
                  <div class="space-y-3 text-sm">
                    <div class="flex justify-between gap-4"><span class="text-[#6B7A99]">Date & Time</span><span class="font-semibold text-[#0F1F4D] text-right">{{ record.datetime }}</span></div>
                    <div class="flex justify-between gap-4"><span class="text-[#6B7A99]">Location</span><span class="font-semibold text-[#0F1F4D] text-right">{{ record.location }}</span></div>
                    <div class="flex justify-between gap-4"><span class="text-[#6B7A99]">Officer</span><span class="font-semibold text-[#0F1F4D] text-right">{{ record.officer }}</span></div>
                    <div v-if="record.datePaid" class="flex justify-between gap-4"><span class="text-[#6B7A99]">Date Paid</span><span class="font-semibold text-[#0F1F4D] text-right">{{ record.datePaid }}</span></div>
                  </div>
                </div>
              </div>

              <div v-if="evidenceImages.length">
                <div class="flex items-center mb-4">
                  <span class="w-1 h-5 rounded-full bg-[#2952D9] mr-3"></span>
                  <h3 class="text-lg font-semibold text-[#0F1F4D]">Proof images</h3>
                </div>
                <div class="grid grid-cols-3 gap-3">
                  <img v-for="(src, i) in evidenceImages" :key="i" :src="src" alt="Proof" class="w-full h-32 object-cover rounded-2xl bg-[#F0F4FB]" />
                </div>
              </div>

              <div v-if="evidenceVideos.length">
                <div class="flex items-center mb-4">
                  <span class="w-1 h-5 rounded-full bg-[#2952D9] mr-3"></span>
                  <h3 class="text-lg font-semibold text-[#0F1F4D]">Video proof</h3>
                </div>
                <div class="space-y-3">
                  <video
                    v-for="(src, i) in evidenceVideos"
                    :key="i"
                    :src="src"
                    controls
                    preload="metadata"
                    class="w-full max-h-72 rounded-2xl bg-black"
                  ></video>
                </div>
              </div>

              <p v-if="errorMsg" class="text-sm text-[#E5484D] bg-[#FDECEC] rounded-xl px-4 py-2">{{ errorMsg }}</p>

              <div class="flex gap-3">
                <button
                  class="flex-1 bg-[#F0F4FB] text-[#3B4A6B] font-semibold py-3 rounded-xl hover:bg-[#E3EAFF] transition-colors"
                  :disabled="paying"
                  @click="closeModal"
                >
                  Close
                </button>
                <button
                  v-if="!record.paid"
                  class="flex-1 bg-gradient-to-r from-[#1F9D55] to-[#34C26B] text-white font-semibold py-3 rounded-xl shadow-[0_4px_16px_rgba(31,157,85,0.35)] hover:opacity-90 disabled:opacity-60 transition"
                  :disabled="paying"
                  @click="markPaid"
                >
                  {{ paying ? 'Saving...' : 'Mark as paid' }}
                </button>
              </div>
            </div>
          </template>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
const search = ref('')
const allViolations = ref<any[]>([])
const listLoading = ref(true)
const showHistory = ref(false)

// Pagination
const page = ref(1)
const pageSize = ref(10)

const modalOpen = ref(false)
const record = ref<any>(null)
const recordLoading = ref(false)
const paying = ref(false)
const errorMsg = ref('')

function toRecord(t: any) {
  return {
    id: t.id,
    txCode: t.transaction_code,
    plate: t.plate_number,
    vehicle: t.vehicle_type || '—',
    violation: t.violation || '—',
    fine: t.fine_amount,
    datetime: t.date_issued,
    location: t.location,
    officer: t.enforcer_badge ? `${t.enforcer_name} - ${t.enforcer_badge}` : 'N/A',
    paid: t.status === 'paid',
    datePaid: t.date_paid,
    images: t.images ?? [],
    videos: t.videos ?? [],
  }
}

async function loadList() {
  try {
    allViolations.value = await $fetch<any[]>('/api/violations')
  } catch (error) {
    console.error(error)
  }
  listLoading.value = false
}

onMounted(loadList)

// Unpaid by default, Paid when History is on
const filtered = computed(() => {
  const s = search.value.toLowerCase()
  const wanted = showHistory.value ? 'Paid' : 'Unpaid'
  return allViolations.value.filter(
    (v) =>
      v.status === wanted &&
      ((v.plate_number ?? '').toLowerCase().includes(s) ||
        (v.transaction_code ?? '').toLowerCase().includes(s) ||
        (v.location ?? '').toLowerCase().includes(s))
  )
})

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

// Back to page 1 when the search, view or page size changes
watch([search, showHistory, pageSize], () => {
  page.value = 1
})

// Keep the page valid if the data shrinks (e.g. after marking a ticket as paid)
watch(totalPages, (t) => {
  if (page.value > t) page.value = t
})

const evidenceImages = computed<string[]>(() => record.value?.images ?? [])
const evidenceVideos = computed<string[]>(() => record.value?.videos ?? [])

async function openRecord(row: any) {
  errorMsg.value = ''
  record.value = null
  modalOpen.value = true
  recordLoading.value = true
  try {
    const key = row.transaction_code ?? row.plate_number
    const data = await $fetch<any>(`/api/settlement/${encodeURIComponent(key)}`)
    record.value = toRecord(data)
  } catch (error) {
    modalOpen.value = false
    alert('Failed to load record.')
  }
  recordLoading.value = false
}

function closeModal() {
  if (paying.value) return
  modalOpen.value = false
}

async function markPaid() {
  if (!record.value) return
  paying.value = true
  errorMsg.value = ''
  try {
    const prev = record.value
    const data = await $fetch<any>(`/api/tickets/${prev.id}/pay`, { method: 'POST' })
    record.value = { ...toRecord(data), images: prev.images, videos: prev.videos }
    // Keep the ticket in the list but flip it to Paid so it moves to History
    allViolations.value = allViolations.value.map((v) =>
      v.id === prev.id ? { ...v, status: 'Paid' } : v
    )
  } catch (error: any) {
    errorMsg.value = error?.data?.statusMessage || error.message
  }
  paying.value = false
}
</script>