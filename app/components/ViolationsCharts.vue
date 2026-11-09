<template>
  <div class="grid grid-cols-3 gap-4 mb-8">
    <div class="col-span-2 bg-white rounded-2xl p-5 shadow-[0_4px_16px_rgba(15,31,77,0.06)]">
      <h3 class="text-sm font-semibold text-[#0F1F4D] mb-3">Tickets per hour</h3>
      <div class="h-60"><Bar :data="hourlyData" :options="barOptions" /></div>
    </div>

    <div class="bg-white rounded-2xl p-5 shadow-[0_4px_16px_rgba(15,31,77,0.06)]">
      <h3 class="text-sm font-semibold text-[#0F1F4D] mb-3">Paid vs Unpaid</h3>
      <div class="h-60"><Doughnut :data="statusData" :options="doughnutOptions" /></div>
    </div>

    <div class="col-span-2 bg-white rounded-2xl p-5 shadow-[0_4px_16px_rgba(15,31,77,0.06)]">
      <h3 class="text-sm font-semibold text-[#0F1F4D] mb-3">Last 7 days: created vs settled</h3>
      <div class="h-60"><Line :data="trendData" :options="lineOptions" /></div>
    </div>

    <div class="bg-white rounded-2xl p-5 shadow-[0_4px_16px_rgba(15,31,77,0.06)]">
      <h3 class="text-sm font-semibold text-[#0F1F4D] mb-3">Top violations (7 days)</h3>
      <div class="h-60"><Bar :data="typeData" :options="horizontalOptions" /></div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Bar, Doughnut, Line } from 'vue-chartjs'
import {
  Chart as ChartJS, BarElement, ArcElement, LineElement, PointElement,
  CategoryScale, LinearScale, Tooltip, Legend, Filler,
} from 'chart.js'

ChartJS.register(BarElement, ArcElement, LineElement, PointElement, CategoryScale, LinearScale, Tooltip, Legend, Filler)

const props = defineProps<{ violations: any[]; date: string }>()

const BLUE = '#2952D9'
const GREEN = '#1F9D55'
const ORANGE = '#E8962E'

function toKey(value: string | Date) {
  const d = new Date(value)
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

// 7 day keys ending at the selected date
const weekKeys = computed(() => {
  const base = new Date(props.date + 'T00:00:00')
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(base)
    d.setDate(base.getDate() - (6 - i))
    return toKey(d)
  })
})

const dayTickets = computed(() => props.violations.filter(v => toKey(v.datetime) === props.date))

const hourlyData = computed(() => {
  const counts = Array(24).fill(0)
  dayTickets.value.forEach(v => counts[new Date(v.datetime).getHours()]++)
  return {
    labels: counts.map((_, h) => `${String(h).padStart(2, '0')}:00`),
    datasets: [{ label: 'Tickets', data: counts, backgroundColor: BLUE, borderRadius: 4 }],
  }
})

const statusData = computed(() => ({
  labels: ['Paid', 'Unpaid'],
  datasets: [{
    data: [
      dayTickets.value.filter(v => v.status === 'Paid').length,
      dayTickets.value.filter(v => v.status === 'Unpaid').length,
    ],
    backgroundColor: [GREEN, ORANGE],
    borderWidth: 0,
  }],
}))

const trendData = computed(() => ({
  labels: weekKeys.value.map(k => k.slice(5)),
  datasets: [
    {
      label: 'Created',
      data: weekKeys.value.map(k => props.violations.filter(v => toKey(v.datetime) === k).length),
      borderColor: BLUE, backgroundColor: 'rgba(41,82,217,0.1)', fill: true, tension: 0.3,
    },
    {
      label: 'Settled',
      data: weekKeys.value.map(k => props.violations.filter(v => v.paid_at && toKey(v.paid_at) === k).length),
      borderColor: GREEN, backgroundColor: 'rgba(31,157,85,0.1)', fill: true, tension: 0.3,
    },
  ],
}))

const typeData = computed(() => {
  const counts: Record<string, number> = {}
  props.violations
    .filter(v => weekKeys.value.includes(toKey(v.datetime)))
    .forEach(v => {
      const name = typeof v.violation === 'string' ? v.violation : (v.violation?.name ?? 'Unknown')
      counts[name] = (counts[name] ?? 0) + 1
    })
  const top = Object.entries(counts).sort((a, b) => b[1] - a[1]).slice(0, 5)
  return {
    labels: top.map(([name]) => name),
    datasets: [{ label: 'Tickets', data: top.map(([, n]) => n), backgroundColor: BLUE, borderRadius: 4 }],
  }
})

const common = { responsive: true, maintainAspectRatio: false, animation: { duration: 300 } }
const yInt = { beginAtZero: true, ticks: { precision: 0 } }

const barOptions = { ...common, plugins: { legend: { display: false } }, scales: { y: yInt } }
const horizontalOptions = { ...common, indexAxis: 'y' as const, plugins: { legend: { display: false } }, scales: { x: yInt } }
const lineOptions = { ...common, scales: { y: yInt } }
const doughnutOptions = { ...common, cutout: '65%', plugins: { legend: { position: 'bottom' as const } } }
</script>