<script setup>
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import * as echarts from 'echarts/core'
import { EffectScatterChart, ScatterChart } from 'echarts/charts'
import { useECharts } from '../../composables/useECharts'
import { createDetailLegend, createDetailTooltip, detailChartTheme } from '../../utils/detailChartTheme'
import { formatDetailLabel } from '../../utils/detailFieldPresentation'
import DetailFieldValue from './DetailFieldValue.vue'

echarts.use([EffectScatterChart, ScatterChart])

const props = defineProps({ concentration: { type: Object, required: true } })
const chartRef = ref(null)
const reducedMotion = ref(typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches)
const tooltipViewportMargin = 8
const tooltipPointGap = 16
let motionQuery

const unit = computed(() => (
  props.concentration.unit
  || props.concentration.metadata.find((item) => item.label.replace(':', '').toLowerCase() === 'unit')?.value
  || 'nmol/L'
))

const humetaBlue = computed(() => (
  typeof document === 'undefined'
    ? '#087fbe'
    : getComputedStyle(document.documentElement).getPropertyValue('--primary-blue').trim() || '#087fbe'
))

const curvePoints = computed(() => {
  const points = props.concentration.curve?.map((point) => [Number(point.position), Number(point.value)]) ?? []
  return points.length >= 2 && points.every(([x, y]) => Number.isFinite(x) && Number.isFinite(y) && y > 0)
    ? points
    : []
})

const scale = computed(() => ({
  type: props.concentration.yScale?.type || 'log',
  min: Number(props.concentration.yScale?.min ?? 0.1),
  max: Number(props.concentration.yScale?.max ?? 10000000),
}))

const highlightPoint = computed(() => {
  const index = Number(props.concentration.highlightIndex)
  const point = Number.isInteger(index) ? curvePoints.value[index] : null
  if (!point) return null

  return {
    index,
    x: point[0],
    y: point[1],
    kind: props.concentration.sourceType || 'demonstration',
    title: props.concentration.metric || 'Concentration',
  }
})

function formatConcentration(value) {
  return Number(value).toLocaleString(undefined, {
    maximumFractionDigits: 4,
  })
}

function withOpacity(color, opacity) {
  const hex = /^#([\da-f]{2})([\da-f]{2})([\da-f]{2})$/i.exec(color)
  if (!hex) return color
  return `rgba(${parseInt(hex[1], 16)}, ${parseInt(hex[2], 16)}, ${parseInt(hex[3], 16)}, ${opacity})`
}

const superscriptCharacters = {
  '-': '⁻', 0: '⁰', 1: '¹', 2: '²', 3: '³', 4: '⁴',
  5: '⁵', 6: '⁶', 7: '⁷', 8: '⁸', 9: '⁹',
}

function formatPowerOfTen(value) {
  const exponent = Math.log10(Number(value))
  const roundedExponent = Math.round(exponent)
  if (!Number.isFinite(exponent) || Math.abs(exponent - roundedExponent) > 1e-8) return ''
  const superscript = String(roundedExponent).split('').map((character) => superscriptCharacters[character]).join('')
  return `10${superscript}`
}

const formattedHighlightValue = computed(() => highlightPoint.value?.y.toLocaleString(undefined, {
  maximumFractionDigits: 4,
}))

const highlightAriaLabel = computed(() => (
  highlightPoint.value
    ? `${highlightPoint.value.title} ${formattedHighlightValue.value} ${unit.value}.`
    : ''
))

const highlightSeriesType = computed(() => (reducedMotion.value ? 'scatter' : 'effectScatter'))

function positionTooltip(point, _params, _dom, _rect, size) {
  const chartBounds = chartRef.value?.getBoundingClientRect()
  if (!chartBounds) return point

  const [contentWidth, contentHeight] = size.contentSize
  const pointViewportX = chartBounds.left + point[0]
  const pointViewportY = chartBounds.top + point[1]
  const maxViewportX = Math.max(tooltipViewportMargin, window.innerWidth - contentWidth - tooltipViewportMargin)
  const maxViewportY = Math.max(tooltipViewportMargin, window.innerHeight - contentHeight - tooltipViewportMargin)
  const fitsOnRight = pointViewportX + tooltipPointGap + contentWidth <= window.innerWidth - tooltipViewportMargin
  const fitsOnLeft = pointViewportX - tooltipPointGap - contentWidth >= tooltipViewportMargin

  let viewportX
  let viewportY

  if (fitsOnRight || fitsOnLeft) {
    viewportX = fitsOnRight
      ? pointViewportX + tooltipPointGap
      : pointViewportX - contentWidth - tooltipPointGap
    viewportY = pointViewportY - (contentHeight / 2)

    if (viewportY < tooltipViewportMargin) {
      viewportY = pointViewportY + tooltipPointGap
    }
    if (viewportY + contentHeight > window.innerHeight - tooltipViewportMargin) {
      viewportY = pointViewportY - contentHeight - tooltipPointGap
    }
  } else {
    // On narrow screens neither side may fit; vertical placement preserves the pulse itself.
    viewportX = pointViewportX - (contentWidth / 2)
    const fitsAbove = pointViewportY - contentHeight - tooltipPointGap >= tooltipViewportMargin
    viewportY = fitsAbove
      ? pointViewportY - contentHeight - tooltipPointGap
      : pointViewportY + tooltipPointGap
  }

  viewportX = Math.max(tooltipViewportMargin, Math.min(viewportX, maxViewportX))
  viewportY = Math.max(tooltipViewportMargin, Math.min(viewportY, maxViewportY))

  // ECharts still expects chart-local coordinates here and converts them for the body-mounted tooltip.
  return [viewportX - chartBounds.left, viewportY - chartBounds.top]
}

const option = computed(() => ({
  animationDuration: reducedMotion.value ? 0 : 350,
  tooltip: createDetailTooltip({
    trigger: 'axis',
    renderMode: 'html',
    appendTo: 'body',
    confine: false,
    position: positionTooltip,
    className: 'humeta-concentration-tooltip',
    enterable: false,
    extraCssText: 'max-width:min(280px, calc(100vw - 24px));white-space:normal;box-sizing:border-box;overflow-wrap:anywhere;z-index:20;',
    formatter: (items) => {
      const item = items.find((candidate) => candidate.seriesName === 'Concentration marker')
        || items.find((candidate) => candidate.seriesName === (props.concentration.metric || 'Concentration'))
        || items[0]
      const value = Array.isArray(item.value) ? item.value[1] : item.value
      return `<strong>${props.concentration.title}</strong><br/>${props.concentration.metric || 'Concentration'}<br/>${formatConcentration(value)} ${unit.value}`
    },
  }),
  legend: createDetailLegend(),
  grid: { left: 54, right: 18, top: 24, bottom: 24 },
  xAxis: {
    type: 'value',
    min: curvePoints.value[0]?.[0] ?? 0,
    max: curvePoints.value.at(-1)?.[0] ?? 1,
    axisLabel: { ...detailChartTheme.axisLabel, show: false },
    axisTick: { show: false },
    axisLine: { lineStyle: { color: detailChartTheme.axisLine } },
    splitLine: { show: false },
  },
  yAxis: {
    type: scale.value.type,
    logBase: 10,
    name: unit.value,
    min: scale.value.min,
    max: scale.value.max,
    axisLabel: {
      ...detailChartTheme.axisLabel,
      formatter: formatPowerOfTen,
      showMinLabel: true,
      showMaxLabel: true,
    },
    nameTextStyle: { ...detailChartTheme.axisName },
    minorTick: { show: false },
    splitLine: { lineStyle: { color: detailChartTheme.gridLine } },
  },
  series: [
    {
      name: props.concentration.metric || 'Concentration',
      type: 'line', smooth: 0.36, showSymbol: false, symbol: 'circle', symbolSize: 6,
      data: curvePoints.value,
      lineStyle: { color: props.concentration.color, width: 2 },
      itemStyle: { color: props.concentration.color, borderColor: '#fff', borderWidth: 1 },
      emphasis: { scale: 1.5 },
    },
    ...(highlightPoint.value ? [{
      name: 'Concentration marker',
      type: highlightSeriesType.value,
      coordinateSystem: 'cartesian2d',
      data: [[highlightPoint.value.x, highlightPoint.value.y]],
      symbol: 'circle',
      symbolSize: 10,
      z: 8,
      showEffectOn: 'render',
      rippleEffect: {
        period: 5,
        scale: 3.6,
        brushType: 'stroke',
        number: 2,
        color: withOpacity(humetaBlue.value, 0.34),
      },
      itemStyle: {
        color: humetaBlue.value,
        borderColor: '#fff',
        borderWidth: 2,
      },
      emphasis: { scale: 1.2 },
    }] : []),
  ],
}))
const { chart } = useECharts(chartRef, option)

function syncChartDiagnostics() {
  if (!chart.value || !chartRef.value || !highlightPoint.value) return
  const renderedSeries = chart.value.getOption().series.find((series) => series.name === 'Concentration marker')
  const highlightPixel = chart.value.convertToPixel(
    { xAxisIndex: 0, yAxisIndex: 0 },
    [highlightPoint.value.x, highlightPoint.value.y],
  )
  const isMonotonic = curvePoints.value.every((point, index, points) => index === 0 || point[1] >= points[index - 1][1])

  chartRef.value.dataset.highlightSeries = renderedSeries?.type ?? ''
  chartRef.value.dataset.highlightCount = String(renderedSeries?.data?.length ?? 0)
  chartRef.value.dataset.highlightKind = highlightPoint.value.kind
  chartRef.value.dataset.highlightIndex = String(highlightPoint.value.index)
  chartRef.value.dataset.highlightX = String(highlightPoint.value.x)
  chartRef.value.dataset.highlightY = String(highlightPoint.value.y)
  chartRef.value.dataset.highlightPixelX = String(highlightPixel[0])
  chartRef.value.dataset.highlightPixelY = String(highlightPixel[1])
  chartRef.value.dataset.curvePointCount = String(curvePoints.value.length)
  chartRef.value.dataset.curveMonotonic = String(isMonotonic)
  chartRef.value.dataset.sourceType = props.concentration.sourceType || ''
  chartRef.value.dataset.unit = unit.value
  chartRef.value.dataset.yScale = scale.value.type
  chartRef.value.dataset.yMin = String(scale.value.min)
  chartRef.value.dataset.yMax = String(scale.value.max)
}

function detachChartListener(instance) {
  instance?.off('finished', syncChartDiagnostics)
}

watch(chart, (instance, previousInstance) => {
  detachChartListener(previousInstance)
  instance?.on('finished', syncChartDiagnostics)
  window.requestAnimationFrame(syncChartDiagnostics)
})

function handleMotionChange(event) {
  reducedMotion.value = event.matches
}

onMounted(() => {
  motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
  motionQuery.addEventListener?.('change', handleMotionChange)
})

onBeforeUnmount(() => {
  detachChartListener(chart.value)
  motionQuery?.removeEventListener?.('change', handleMotionChange)
})
</script>

<template>
  <article class="concentration-card" :data-source-type="props.concentration.sourceType">
    <h3><span :style="{ backgroundColor: props.concentration.color }" />{{ props.concentration.title }}</h3>
    <div
      ref="chartRef"
      class="concentration-card__chart"
      role="img"
      :aria-label="highlightPoint ? `${props.concentration.title} local demonstration concentration curve. Logarithmic scale from 10 to the power of minus 1 through 10 to the power of 7 ${unit}. ${highlightAriaLabel}` : `${props.concentration.title} concentration chart.`"
    />
    <div v-if="highlightPoint" class="concentration-card__highlight-key" aria-hidden="true">
      <span />{{ highlightPoint.title }}
    </div>
    <div v-if="props.concentration.tags?.length" class="concentration-card__tags">
      <span v-for="tag in props.concentration.tags" :key="tag">{{ tag }}</span>
    </div>
    <dl class="concentration-card__meta">
      <div
        v-for="item in props.concentration.metadata"
        :key="item.label"
        :class="{ 'concentration-card__meta-row--statuses': Array.isArray(item.value) }"
        :data-metadata-label="item.label"
      >
        <dt :title="formatDetailLabel(item.label)">{{ formatDetailLabel(item.label) }}</dt>
        <dd><DetailFieldValue :value="item.value" /></dd>
      </div>
    </dl>
  </article>
</template>

<style scoped>
.concentration-card { min-width: 0; border: 1px solid var(--detail-border, #dce8ef); border-radius: 6px; overflow: hidden; background: #fff; }
.concentration-card h3 { min-height: 48px; padding: 9px 14px; border-bottom: 1px solid var(--detail-border, #dce8ef); display: flex; align-items: center; gap: 9px; color: #334d59; background: #f8fbfd; font-size: 16px; font-weight: 600; }
.concentration-card h3 > span { width: 9px; height: 9px; border-radius: 50%; }
.concentration-card__chart { width: 100%; height: 290px; }
.concentration-card__highlight-key { min-height: 24px; margin: -2px 12px 8px; display: flex; align-items: center; gap: 6px; color: #607681; font-size: 12.5px; line-height: 1.35; }
.concentration-card__highlight-key span { width: 8px; height: 8px; border: 2px solid #fff; border-radius: 50%; background: var(--primary-blue, #087fbe); box-shadow: 0 0 0 1px rgba(8, 127, 190, 0.25); }
.concentration-card__tags { padding: 0 12px 11px; display: flex; flex-wrap: wrap; gap: 5px; }
.concentration-card__tags span { padding: 4px 8px; border: 1px solid #cadcdf; border-radius: 12px; color: #55717a; background: #f2f7f8; font-size: 12px; }
.concentration-card__meta { margin: 0; display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); border-top: 1px solid #dfe7eb; }
.concentration-card__meta > div { min-width: 0; min-height: 38px; display: grid; grid-template-columns: 120px minmax(0, 1fr); }
.concentration-card__meta > .concentration-card__meta-row--statuses { grid-column: 1 / -1; grid-template-columns: 120px minmax(0, 1fr); }
.concentration-card__meta dt, .concentration-card__meta dd { min-width: 0; margin: 0; padding: 7px 10px; border-right: 1px solid #e2e8ec; border-bottom: 1px solid #e2e8ec; font-size: var(--detail-font-field-value, 13px); line-height: 1.4; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.concentration-card__meta dt { color: #718899; background: #f5f9fb; font-size: var(--detail-font-field-label, 12px); font-weight: 600; } .concentration-card__meta dd { color: #16324f; font-weight: 500; }
:global(.humeta-concentration-tooltip[style*="visibility: hidden"]) { display: none !important; }
@media (max-width: 580px) { .concentration-card__meta { grid-template-columns: 1fr; } .concentration-card__meta > div, .concentration-card__meta > .concentration-card__meta-row--statuses { grid-template-columns: 118px minmax(0, 1fr); } }
</style>

