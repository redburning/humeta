<script setup>
import { computed, nextTick, onBeforeUnmount, onMounted, ref, shallowRef, watch } from 'vue'
import * as echarts from 'echarts/core'
import { BarChart, BoxplotChart, GraphChart, SunburstChart } from 'echarts/charts'
import { GraphicComponent, GridComponent, TooltipComponent } from 'echarts/components'
import { SVGRenderer } from 'echarts/renderers'

echarts.use([
  BarChart,
  BoxplotChart,
  GraphChart,
  SunburstChart,
  GraphicComponent,
  GridComponent,
  TooltipComponent,
  SVGRenderer,
])

const props = defineProps({
  option: {
    type: Object,
    required: true,
  },
  compactOption: {
    type: Object,
    default: null,
  },
  compactBreakpoint: {
    type: Number,
    default: 600,
  },
  chartKey: {
    type: String,
    required: true,
  },
  ariaLabel: {
    type: String,
    required: true,
  },
  summary: {
    type: String,
    required: true,
  },
  fallback: {
    type: String,
    required: true,
  },
  minHeight: {
    type: Number,
    default: 430,
  },
  compactMinHeight: {
    type: Number,
    default: 320,
  },
})

const revealedCharts = globalThis.__humetaAboutRevealedCharts || new Set()
globalThis.__humetaAboutRevealedCharts = revealedCharts

const containerRef = ref(null)
const chart = shallowRef(null)
const failed = ref(false)
const isCompact = ref(false)
const reducedMotion = ref(false)
const isVisible = ref(false)

let resizeObserver
let intersectionObserver
let motionQuery
let resizeFrame = 0

const containerStyle = computed(() => ({
  minHeight: `${isCompact.value ? props.compactMinHeight : props.minHeight}px`,
}))

function activeOption(animate = false) {
  const source = isCompact.value && props.compactOption ? props.compactOption : props.option
  return {
    ...source,
    animation: animate && !reducedMotion.value,
    animationDuration: animate && !reducedMotion.value ? 680 : 0,
    animationDurationUpdate: 0,
    animationEasing: 'cubicOut',
    animationEasingUpdate: 'cubicOut',
  }
}

function applyOption(animate = false) {
  if (!chart.value) return
  chart.value.setOption(activeOption(animate), true)
}

function updateCompactState() {
  if (!containerRef.value) return false
  const nextCompact = window.innerWidth < props.compactBreakpoint
  const changed = nextCompact !== isCompact.value
  isCompact.value = nextCompact
  return changed
}

function handleResize() {
  window.cancelAnimationFrame(resizeFrame)
  resizeFrame = window.requestAnimationFrame(() => {
    const breakpointChanged = updateCompactState()
    chart.value?.resize()
    if (breakpointChanged) applyOption(false)
  })
}

function handleMotionChange(event) {
  reducedMotion.value = event.matches
  if (event.matches && !chart.value) reveal(false)
  applyOption(false)
}

async function initialize(animate = false) {
  await nextTick()
  if (!containerRef.value || chart.value) return

  try {
    updateCompactState()
    const existing = echarts.getInstanceByDom(containerRef.value)
    chart.value = existing || echarts.init(containerRef.value, null, { renderer: 'svg' })
    applyOption(animate)
    containerRef.value.dataset.chartState = 'ready'

    if ('ResizeObserver' in window) {
      resizeObserver = new ResizeObserver(handleResize)
      resizeObserver.observe(containerRef.value)
    }
  } catch {
    failed.value = true
    if (containerRef.value) containerRef.value.dataset.chartState = 'failed'
  }
}

function reveal(animate = true) {
  if (isVisible.value && chart.value) return
  revealedCharts.add(props.chartKey)
  isVisible.value = true
  intersectionObserver?.disconnect()
  intersectionObserver = undefined
  initialize(animate)
}

function dispose() {
  window.cancelAnimationFrame(resizeFrame)
  window.removeEventListener('resize', handleResize)
  resizeObserver?.disconnect()
  resizeObserver = undefined
  intersectionObserver?.disconnect()
  intersectionObserver = undefined
  if (motionQuery?.removeEventListener) {
    motionQuery.removeEventListener('change', handleMotionChange)
  } else {
    motionQuery?.removeListener?.(handleMotionChange)
  }
  chart.value?.dispose()
  chart.value = null
}

watch(
  () => [props.option, props.compactOption, props.ariaLabel],
  () => applyOption(false),
  { deep: true },
)

onMounted(() => {
  motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
  reducedMotion.value = motionQuery.matches
  if (motionQuery.addEventListener) {
    motionQuery.addEventListener('change', handleMotionChange)
  } else {
    motionQuery.addListener?.(handleMotionChange)
  }
  window.addEventListener('resize', handleResize, { passive: true })
  updateCompactState()

  const showImmediately =
    reducedMotion.value || revealedCharts.has(props.chartKey) || !('IntersectionObserver' in window)

  if (showImmediately) {
    isVisible.value = true
    initialize(false)
    return
  }

  containerRef.value.dataset.chartState = 'waiting'
  intersectionObserver = new IntersectionObserver(
    ([entry]) => {
      if (entry.isIntersecting) reveal(true)
    },
    { rootMargin: '0px 0px -8% 0px', threshold: 0.16 },
  )
  intersectionObserver.observe(containerRef.value)
})

onBeforeUnmount(dispose)
</script>

<template>
  <div
    class="about-chart-frame"
    :class="{
      'about-chart-frame--failed': failed,
      'about-chart-frame--visible': isVisible,
    }"
  >
    <div
      ref="containerRef"
      class="about-chart-canvas"
      data-about-chart
      role="img"
      :aria-label="ariaLabel"
      :style="containerStyle"
    />
    <p class="sr-only">{{ summary }}</p>
    <p v-if="failed" class="about-chart-fallback" role="status">{{ fallback }}</p>
  </div>
</template>

<style scoped>
.about-chart-frame {
  position: relative;
  width: 100%;
  opacity: 0;
  transform: translateY(10px);
  transition:
    opacity 480ms ease,
    transform 620ms cubic-bezier(0.22, 1, 0.36, 1);
}

.about-chart-frame--visible {
  opacity: 1;
  transform: none;
}

.about-chart-canvas {
  width: 100%;
}

.about-chart-fallback {
  position: absolute;
  inset: 50% auto auto 50%;
  width: min(88%, 420px);
  margin: 0;
  color: #526b78;
  font-size: 14px;
  line-height: 1.7;
  text-align: center;
  transform: translate(-50%, -50%);
}

.about-chart-frame--failed .about-chart-canvas {
  border: 1px solid #d5e4e9;
  border-radius: 12px;
  background: #f7fbfc;
}

.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
}

@media (prefers-reduced-motion: reduce) {
  .about-chart-frame {
    opacity: 1;
    transform: none;
    transition: none;
  }
}
</style>
