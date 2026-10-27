<script setup>
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import { useECharts } from '../../composables/useECharts'
import { createDetailLegend, createDetailTooltip, detailChartTheme } from '../../utils/detailChartTheme'
import { formatDetailLabel } from '../../utils/detailFieldPresentation'
import DetailFieldValue from './DetailFieldValue.vue'

const props = defineProps({ trajectory: { type: Object, required: true } })
const chartRef = ref(null)
const compactDenseXAxis = ref(false)
let axisResizeObserver

function updateAxisDensity() {
  compactDenseXAxis.value = props.trajectory.x.length > 7 && chartRef.value?.clientWidth <= 520
}

const ariaLabel = computed(() => {
  const points = props.trajectory.x
    .map((label, index) => `${label}: ${props.trajectory.values[index]}`)
    .join('; ')
  return `${props.trajectory.title} line chart. X axis labels and values: ${points}. Y axis range ${props.trajectory.yAxis.min} to ${props.trajectory.yAxis.max}, tick interval ${props.trajectory.yAxis.interval}.`
})
const option = computed(() => ({
  animationDuration: 350,
  tooltip: createDetailTooltip({ trigger: 'axis' }),
  legend: createDetailLegend(),
  grid: { left: 52, right: 18, top: 20, bottom: compactDenseXAxis.value ? 62 : 38 },
  xAxis: {
    type: 'category',
    boundaryGap: false,
    data: props.trajectory.x,
    axisLabel: {
      ...detailChartTheme.axisLabel,
      hideOverlap: true,
      interval: 0,
      ...(compactDenseXAxis.value ? { rotate: 52, align: 'right' } : {}),
    },
    axisLine: { lineStyle: { color: detailChartTheme.axisLine } },
  },
  yAxis: {
    type: 'value',
    min: props.trajectory.yAxis.min,
    max: props.trajectory.yAxis.max,
    interval: props.trajectory.yAxis.interval,
    axisLabel: { ...detailChartTheme.axisLabel },
    splitLine: { lineStyle: { color: detailChartTheme.gridLine } },
  },
  series: [{ type: 'line', data: props.trajectory.values, symbol: 'circle', symbolSize: 7, smooth: 0.08, lineStyle: { color: props.trajectory.color, width: 2 }, itemStyle: { color: '#fff', borderColor: props.trajectory.color, borderWidth: 2 } }],
}))
useECharts(chartRef, option)

onMounted(() => {
  updateAxisDensity()
  if ('ResizeObserver' in window) {
    axisResizeObserver = new ResizeObserver(updateAxisDensity)
    axisResizeObserver.observe(chartRef.value)
  }
})

onBeforeUnmount(() => {
  axisResizeObserver?.disconnect()
})
</script>

<template>
  <article class="trajectory-card">
    <h3>{{ props.trajectory.title }}</h3>
    <div ref="chartRef" class="trajectory-card__chart" role="img" :aria-label="ariaLabel" />
    <div v-if="props.trajectory.tags?.length" class="trajectory-card__tags"><span v-for="tag in props.trajectory.tags" :key="tag">{{ tag }}</span></div>
    <dl class="trajectory-card__meta">
      <div
        v-for="item in props.trajectory.metadata"
        :key="item.label"
        :class="{ 'trajectory-card__meta-row--statuses': Array.isArray(item.values) }"
      >
        <dt :title="formatDetailLabel(item.label)">{{ formatDetailLabel(item.label) }}</dt>
        <dd><DetailFieldValue :value="item.values ?? item.value" /></dd>
      </div>
    </dl>
  </article>
</template>

<style scoped>
.trajectory-card { min-width: 0; border: 1px solid var(--detail-border, #dce8ef); border-radius: 6px; overflow: hidden; background: #fff; }
.trajectory-card h3 { min-height: 48px; padding: 9px 14px; border-bottom: 1px solid var(--detail-border, #dce8ef); display: flex; align-items: center; color: #16324f; background: #f8fbfd; font-size: 13px; font-weight: 600; line-height: 1.35; }
.trajectory-card__chart { width: 100%; height: 270px; }
.trajectory-card__tags { padding: 0 12px 11px; display: flex; flex-wrap: wrap; gap: 5px; }
.trajectory-card__tags span { padding: 4px 8px; border: 1px solid #cadcdf; border-radius: 12px; color: #55717a; background: #f2f7f8; font-size: 12px; }
.trajectory-card__meta { margin: 0; display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); border-top: 1px solid #dfe7eb; }
.trajectory-card__meta > div { min-width: 0; min-height: 36px; display: grid; grid-template-columns: 120px minmax(0, 1fr); }
.trajectory-card__meta > .trajectory-card__meta-row--statuses { grid-column: 1 / -1; grid-template-columns: 120px minmax(0, 1fr); }
.trajectory-card__meta dt, .trajectory-card__meta dd { min-width: 0; margin: 0; padding: 7px 10px; border-right: 1px solid #e2e8ec; border-bottom: 1px solid #e2e8ec; font-size: var(--detail-font-field-value, 13px); line-height: 1.4; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.trajectory-card__meta dt { color: #718899; background: #f5f9fb; font-size: var(--detail-font-field-label, 12px); font-weight: 600; } .trajectory-card__meta dd { color: #16324f; font-weight: 500; }
@media (max-width: 580px) { .trajectory-card__meta { grid-template-columns: 1fr; } .trajectory-card__meta > div, .trajectory-card__meta > .trajectory-card__meta-row--statuses { grid-template-columns: 118px minmax(0, 1fr); } }
</style>

