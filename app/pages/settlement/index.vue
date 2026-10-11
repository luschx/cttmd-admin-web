<template>
  <div>
    <div class="mb-6">
      <h1 class="text-3xl font-bold text-gray-900">Process settlement</h1>
      <p class="text-blue-500 text-sm mt-1">Search and process ticket settlements</p>
    </div>

    <div class="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 mb-5">
      <div class="flex gap-3">
        <input
          v-model="txCode"
          type="text"
          placeholder="Enter transaction code (e.g., TX-00000)"
          class="flex-1 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          @keyup.enter="retrieve"
        />
        <button
          @click="retrieve"
          :disabled="loading"
          class="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl text-sm font-medium flex items-center gap-2 transition-colors disabled:opacity-50"
        >
          <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-4.35-4.35M17 11A6 6 0 115 11a6 6 0 0112 0z" />
          </svg>
          {{ loading ? 'Retrieving...' : 'Retrieve record' }}
        </button>
      </div>
    </div>

    <div v-if="!record" class="bg-white rounded-2xl border border-gray-100 shadow-sm p-16 flex flex-col items-center text-center">
      <div class="w-14 h-14 rounded-full bg-gray-100 flex items-center justify-center mb-4">
        <svg xmlns="http://www.w3.org/2000/svg" class="w-6 h-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-4.35-4.35M17 11A6 6 0 115 11a6 6 0 0112 0z" />
        </svg>
      </div>
      <h3 class="font-semibold text-gray-700 mb-1">No record selected</h3>
      <p class="text-sm text-gray-400">Enter a transaction code above to retrieve violation details</p>
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
              <span class="text-gray-500">Brand</span>
              <span class="font-medium">{{ record.brand }}</span>
            </div>
            <div class="flex justify-between">
              <span class="text-gray-500">Color</span>
              <span class="font-medium">{{ record.color }}</span>
            </div>
            <div class="flex justify-between">
              <span class="text-gray-500">Violation</span>
              <span class="font-medium text-red-500">{{ record.violation }}</span>
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
          </div>
        </div>
      </div>

      <div class="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
        <h3 class="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-4">Ticket Settlement</h3>
        <div class="space-y-3">
          <div class="flex items-center justify-between border border-gray-100 rounded-xl p-4">
            <div class="flex items-center gap-3">
              <div class="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <div>
                <div class="font-medium text-sm">White ticket</div>
                <div class="text-xs text-gray-400">Standard violation ticket</div>
              </div>
            </div>
            <div class="flex items-center gap-3">
              <span :class="record.whitePaid ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-500'" class="px-3 py-1 rounded-full text-xs font-medium">
                {{ record.whitePaid ? 'Paid' : 'Unpaid' }}
              </span>
              <button @click="markPaid('white')" class="border border-gray-200 rounded-xl px-4 py-2 text-sm font-medium hover:bg-gray-50 transition-colors">
                Mark white as paid
              </button>
            </div>
          </div>

          <div class="flex items-center justify-between border border-yellow-100 bg-yellow-50 rounded-xl p-4">
            <div class="flex items-center gap-3">
              <div class="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5 text-yellow-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <div>
                <div class="font-medium text-sm">Yellow ticket</div>
                <div class="text-xs text-gray-400">Warning citation</div>
              </div>
            </div>
            <div class="flex items-center gap-3">
              <span :class="record.yellowPaid ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-500'" class="px-3 py-1 rounded-full text-xs font-medium">
                {{ record.yellowPaid ? 'Paid' : 'Unpaid' }}
              </span>
              <button @click="markPaid('yellow')" class="bg-yellow-400 hover:bg-yellow-500 text-white rounded-xl px-4 py-2 text-sm font-medium transition-colors">
                Mark yellow as paid
              </button>
            </div>
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

async function retrieve() {
  const key = txCode.value.trim().toUpperCase()
  if (!key) return

  loading.value = true
  record.value = null

  let data: any
  try {
    data = await $fetch<any>(`/api/settlement/${encodeURIComponent(key)}`)
  } catch (error) {
    alert('No record found for that transaction code.')
    loading.value = false
    return
  }

  record.value = {
    id: data.id,
    txCode: data.tx_code,
    plate: data.plate_number,
    vehicle: data.vehicle,
    brand: data.brand,
    color: data.color,
    violation: data.violation_type,
    datetime: new Date(data.datetime).toLocaleString(),
    location: data.location,
    officer: data.officers
      ? `${data.officers.name} - ${data.officers.officer_code}`
      : 'N/A',
    whitePaid: data.white_paid,
    yellowPaid: data.yellow_paid,
  }

  loading.value = false
}

async function markPaid(type: 'white' | 'yellow') {
  if (!record.value) return

  const field = type === 'white' ? 'white_paid' : 'yellow_paid'
  const newValue = type === 'white' ? !record.value.whitePaid : !record.value.yellowPaid

  try {
    await $fetch(`/api/violations/${record.value.id}/paid`, {
      method: 'PATCH',
      body: { field, value: newValue },
    })
  } catch (error: any) {
    alert(error?.data?.statusMessage || error.message)
    return
  }

  if (type === 'white') record.value.whitePaid = newValue
  else record.value.yellowPaid = newValue
}
</script>