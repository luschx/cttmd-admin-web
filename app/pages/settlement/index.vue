<template>
  <div>
    <div class="mb-6">
      <h1 class="text-3xl font-bold text-gray-900">Process settlement</h1>
      <p class="text-blue-500 text-sm mt-1">Search by transaction code or plate number</p>
    </div>

    <div class="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 mb-5">
      <div class="flex gap-3">
        <input
          v-model="txCode"
          type="text"
          placeholder="Transaction code or plate (e.g., TX-20261011-1620 or ABC123)"
          class="flex-1 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          @keyup.enter="retrieve"
        />
        <button
          @click="retrieve"
          :disabled="loading"
          class="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl text-sm font-medium transition-colors disabled:opacity-50"
        >
          {{ loading ? 'Retrieving...' : 'Retrieve record' }}
        </button>
      </div>
    </div>

    <div v-if="!record" class="bg-white rounded-2xl border border-gray-100 shadow-sm p-16 flex flex-col items-center text-center">
      <h3 class="font-semibold text-gray-700 mb-1">No record selected</h3>
      <p class="text-sm text-gray-400">Enter a transaction code or plate number above</p>
    </div>

    <div v-else>
      <div class="bg-blue-600 rounded-2xl p-6 mb-5">
        <p class="text-blue-200 text-sm mb-1">Violation record found</p>
        <h2 class="text-3xl font-bold text-white">{{ record.txCode }}</h2>
      </div>

      <div class="grid grid-cols-2 gap-4 mb-5">
        <div class="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <h3 class="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-4">Vehicle Details</h3>
          <div class="space-y-3 text-sm">
            <div class="flex justify-between">
              <span class="text-gray-500">Plate Number</span>
              <span class="font-medium">{{ record.plate }}</span>
            </div>
            <div class="flex justify-between">
              <span class="text-gray-500">Vehicle</span>
              <span class="font-medium">{{ record.vehicle }}</span>
            </div>
            <div class="flex justify-between">
              <span class="text-gray-500">Violation</span>
              <span class="font-medium text-red-500">{{ record.violation }}</span>
            </div>
            <div class="flex justify-between">
              <span class="text-gray-500">Fine</span>
              <span class="font-medium">₱{{ record.fine }}</span>
            </div>
          </div>
        </div>

        <div class="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <h3 class="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-4">Apprehension Details</h3>
          <div class="space-y-3 text-sm">
            <div class="flex justify-between">
              <span class="text-gray-500">Date & Time</span>
              <span class="font-medium">{{ record.datetime }}</span>
            </div>
            <div class="flex justify-between">
              <span class="text-gray-500">Location</span>
              <span class="font-medium">{{ record.location }}</span>
            </div>
            <div class="flex justify-between">
              <span class="text-gray-500">Officer</span>
              <span class="font-medium">{{ record.officer }}</span>
            </div>
            <div v-if="record.datePaid" class="flex justify-between">
              <span class="text-gray-500">Date Paid</span>
              <span class="font-medium">{{ record.datePaid }}</span>
            </div>
          </div>
        </div>
      </div>

      <div class="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
        <h3 class="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-4">Ticket Settlement</h3>
        <div class="flex items-center justify-between border border-gray-100 rounded-xl p-4">
          <div>
            <div class="font-medium text-sm">Violation ticket</div>
            <div class="text-xs text-gray-400">{{ record.txCode }}</div>
          </div>
          <div class="flex items-center gap-3">
            <span :class="record.paid ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-500'" class="px-3 py-1 rounded-full text-xs font-medium">
              {{ record.paid ? 'Paid' : 'Unpaid' }}
            </span>
            <button
              v-if="!record.paid"
              @click="markPaid"
              :disabled="paying"
              class="bg-blue-600 hover:bg-blue-700 text-white rounded-xl px-4 py-2 text-sm font-medium disabled:opacity-50"
            >
              {{ paying ? 'Saving...' : 'Mark as paid' }}
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const txCode = ref('')
const record = ref<any>(null)
const loading = ref(false)
const paying = ref(false)

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
    evidence: t.evidence ?? [],
  }
}

async function retrieve() {
  const key = txCode.value.trim()
  if (!key) return

  loading.value = true
  record.value = null

  try {
    const data = await $fetch<any>(`/api/settlement/${encodeURIComponent(key)}`)
    record.value = toRecord(data)
  } catch (error) {
    alert('No record found for that transaction code or plate number.')
  }
  loading.value = false
}

async function markPaid() {
  if (!record.value) return
  paying.value = true
  try {
    const data = await $fetch<any>(`/api/tickets/${record.value.id}/pay`, { method: 'POST' })
    record.value = toRecord(data)
  } catch (error: any) {
    alert(error?.data?.statusMessage || error.message)
  }
  paying.value = false
}
</script>