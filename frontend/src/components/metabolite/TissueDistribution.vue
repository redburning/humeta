<script setup>
import { computed, nextTick, ref, watch } from 'vue'
import { useECharts } from '../../composables/useECharts'
import { createDetailLegend, createDetailTooltip, detailChartTheme } from '../../utils/detailChartTheme'

const props = defineProps({ distribution: { type: Object, required: true } })
const chartRef = ref(null)
const mode = ref('Tissue')
const modeNames = ['Tissue', 'Concentration']
const barGradient = {
  type: 'linear',
  x: 0,
  y: 1,
  x2: 0,
  y2: 0,
  colorStops: [
    { offset: 0, color: '#1F77B4' },
    { offset: 1, color: '#3F91BE' },
  ],
}

const tissueValues = computed(() => props.distribution.modes?.Tissue ?? [])
const concentrationDataset = computed(() => {
  const source = props.distribution.concentration
  const values = Array.isArray(source) ? source : (Array.isArray(source?.values) ? source.values : [])
  const labels = Array.isArray(source?.labels) ? source.labels : props.distribution.labels
  return {
    labels,
    values,
    metric: source?.metric ?? 'Concentration',
    sourceType: source?.sourceType,
    description: source?.description,
  }
})
const hasConcentrationData = computed(() => {
  const { labels, values } = concentrationDataset.value
  return labels.length > 0
    && labels.length === values.length
    && values.every((value) => typeof value === 'number' && Number.isFinite(value))
})
const showChart = computed(() => mode.value === 'Tissue' || hasConcentrationData.value)
const activeDataset = computed(() => {
  const labels = mode.value === 'Tissue' ? props.distribution.labels : concentrationDataset.value.labels
  const values = mode.value === 'Tissue' ? tissueValues.value : concentrationDataset.value.values

  return labels
    .map((label, index) => ({ label, value: values[index] }))
})
const activeLabels = computed(() => activeDataset.value.map((item) => item.label))
const activeValues = computed(() => activeDataset.value.map((item) => item.value))
const metricName = computed(() => (
  mode.value === 'Tissue' ? 'Relative abundance (%)' : concentrationDataset.value.metric
))
const yAxisScale = computed(() => (
  mode.value === 'Tissue'
    ? { min: 0, max: 100, interval: 20 }
    : { min: 0 }
))
const chartAriaLabel = computed(() => (
  mode.value === 'Concentration' && concentrationDataset.value.sourceType === 'demonstration'
    ? 'Demonstration concentration tissue distribution bar chart'
    : `${metricName.value} tissue distribution bar chart`
))
const chartAriaDescription = computed(() => (
  mode.value === 'Concentration' ? concentrationDataset.value.description : undefined
))

const option = computed(() => ({
  animationDuration: 350,
  tooltip: createDetailTooltip({
    trigger: 'axis',
    axisPointer: { type: 'shadow', shadowStyle: { color: 'rgba(8, 127, 190, 0.055)' } },
    valueFormatter: (value) => mode.value === 'Tissue' ? `${value}%` : String(value),
  }),
  legend: createDetailLegend(),
  grid: { left: 54, right: 16, top: 8, bottom: 54 },
  xAxis: {
    type: 'category',
    data: activeLabels.value,
    axisLabel: { ...detailChartTheme.axisLabel, hideOverlap: true, rotate: 28, interval: 0, margin: 13 },
    axisLine: { lineStyle: { color: detailChartTheme.axisLine } },
    axisTick: { show: false },
  },
  yAxis: {
    type: 'value', ...yAxisScale.value,
    axisLabel: { ...detailChartTheme.axisLabel, formatter: (value) => String(value) },
    axisLine: { show: false },
    axisTick: { show: false },
    splitLine: { lineStyle: { color: detailChartTheme.gridLine } },
  },
  dataZoom: [{ type: 'inside', start: 0, end: 100 }],
  series: [{
    type: 'bar',
    name: metricName.value,
    barWidth: '50%',
    barMaxWidth: 36,
    data: activeValues.value,
    itemStyle: { color: barGradient, borderRadius: [3, 3, 0, 0] },
    emphasis: { itemStyle: { color: barGradient } },
  }],
}))

const { resize } = useECharts(chartRef, option)

watch(mode, async () => {
  await nextTick()
  if (showChart.value) resize()
})
</script>

<template>
  <div class="tissue-distribution">
    <div class="tissue-distribution__toolbar">
      <p class="tissue-distribution__metric">{{ metricName }}</p>
      <div class="tissue-distribution__modes" aria-label="Distribution mode">
        <button
          v-for="modeName in modeNames"
          :key="modeName"
          type="button"
          :class="{ 'is-active': mode === modeName }"
          :aria-pressed="mode === modeName"
          @click="mode = modeName"
        >{{ modeName }}</button>
      </div>
    </div>
    <div
      v-show="showChart"
      ref="chartRef"
      class="tissue-distribution__chart"
      role="img"
      :aria-hidden="!showChart"
      :aria-label="chartAriaLabel"
      :aria-description="chartAriaDescription"
    />
    <div v-if="!showChart" class="tissue-distribution__empty" role="status">
      Concentration data are not available for this demonstration record.
    </div>
  </div>
</template>

<style scoped>
.tissue-distribution { min-width: 0; border: 1px solid var(--detail-border, #dce8ef); border-radius: 6px; overflow: hidden; background: #fff; }
.tissue-distribution__toolbar { min-height: 44px; padding: 8px 12px; display: flex; align-items: center; justify-content: space-between; gap: 10px; border-bottom: 1px solid var(--detail-border, #dce8ef); background: #fbfdfe; }
.tissue-distribution__metric { min-width: 0; margin: 0; color: #526b7a; font-size: 14px; font-weight: 600; line-height: 1.4; white-space: nowrap; }
.tissue-distribution__modes { flex: 0 0 auto; display: flex; justify-content: flex-end; gap: 4px; }
.tissue-distribution__modes button { min-width: 82px; height: 28px; padding: 0 12px; border: 1px solid #b9d3df; border-radius: 4px; color: #5b7686; background: #fff; font-size: 12px; cursor: pointer; }
.tissue-distribution__modes button.is-active { border-color: #1687bf; color: #fff; background: #1687bf; }
.tissue-distribution__chart { box-sizing: border-box; width: 100%; height: 320px; padding: 4px 6px 0; }
.tissue-distribution__empty { box-sizing: border-box; width: 100%; height: 320px; padding: 24px; border: 1px solid #dce5ea; display: grid; place-items: center; color: #4e626d; background: #fff; font-size: 12px; line-height: 1.6; text-align: center; }
@media (max-width: 480px) {
  .tissue-distribution__toolbar { padding: 8px 10px; align-items: stretch; flex-direction: column; }
  .tissue-distribution__metric { white-space: normal; }
  .tissue-distribution__modes { width: 100%; }
  .tissue-distribution__modes button { min-width: 0; flex: 1 1 0; }
  .tissue-distribution__chart,
  .tissue-distribution__empty { height: 280px; }
}
</style>

