<template>
  <div>
    <div class="relative bg-white rounded-2xl border-2 border-dashed border-[#C9D3EA] overflow-hidden touch-none">
      <canvas
        ref="canvas"
        class="w-full h-44 cursor-crosshair"
        @pointerdown="start"
        @pointermove="move"
        @pointerup="end"
        @pointerleave="end"
        @pointercancel="end"
      ></canvas>
      <div
        v-if="empty"
        class="pointer-events-none absolute inset-0 flex items-center justify-center text-sm text-[#9AA6C0]"
      >
        Sign here
      </div>
    </div>
    <div class="flex justify-end mt-2">
      <button
        type="button"
        class="px-4 py-1.5 rounded-lg bg-[#F0F4FB] text-[#0F1F4D] text-xs font-semibold hover:bg-[#E0E8F8] transition-colors"
        @click="clear"
      >
        Clear
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
// v-model gives a PNG data URL, or '' when the pad is empty.
const model = defineModel<string>({ default: '' })

const canvas = ref<HTMLCanvasElement | null>(null)
const empty = ref(true)
let drawing = false
let ctx: CanvasRenderingContext2D | null = null

function setup() {
  const c = canvas.value
  if (!c) return
  const ratio = window.devicePixelRatio || 1
  const rect = c.getBoundingClientRect()
  c.width = rect.width * ratio
  c.height = rect.height * ratio
  ctx = c.getContext('2d')
  if (!ctx) return
  ctx.scale(ratio, ratio)
  ctx.lineWidth = 2.5
  ctx.lineCap = 'round'
  ctx.lineJoin = 'round'
  ctx.strokeStyle = '#0F1F4D'
}

function pos(e: PointerEvent) {
  const rect = canvas.value!.getBoundingClientRect()
  return { x: e.clientX - rect.left, y: e.clientY - rect.top }
}

function start(e: PointerEvent) {
  if (!ctx) return
  drawing = true
  canvas.value?.setPointerCapture(e.pointerId)
  const { x, y } = pos(e)
  ctx.beginPath()
  ctx.moveTo(x, y)
  ctx.lineTo(x + 0.01, y + 0.01) // makes a dot on a simple tap
  ctx.stroke()
  empty.value = false
}

function move(e: PointerEvent) {
  if (!drawing || !ctx) return
  const { x, y } = pos(e)
  ctx.lineTo(x, y)
  ctx.stroke()
}

function end() {
  if (!drawing) return
  drawing = false
  if (canvas.value && !empty.value) model.value = canvas.value.toDataURL('image/png')
}

function clear() {
  const c = canvas.value
  if (!c || !ctx) return
  ctx.clearRect(0, 0, c.width, c.height)
  empty.value = true
  model.value = ''
}

onMounted(setup)
</script>