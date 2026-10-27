<script setup>
import { computed, ref } from 'vue'
import { useECharts } from '../../composables/useECharts'
import { createDetailLegend, createDetailTooltip, detailChartTheme } from '../../utils/detailChartTheme'

const props = defineProps({
  peaks: { type: Array, required: true },
  color: { type: String, default: '#167fbd' },
  title: { type: String, required: true },
})

const chartRef = ref(null)
const option = computed(() => {
  const xValues = props.peaks.map((peak) => peak[0])
  return {
    animation: false,
    tooltip: createDetailTooltip({
      trigger: 'item',
      formatter: ({ value }) => `m/z ${value[0]}<br/>Relative Intensity: ${value[1]}%`,
    }),
    legend: createDetailLegend(),
    grid: { left: 48, right: 12, top: 18, bottom: 36 },
    xAxis: {
      type: 'value', name: 'm/z', nameLocation: 'middle', nameGap: 26,
      min: Math.floor(Math.min(...xValues) / 20) * 20,
      max: Math.ceil(Math.max(...xValues) / 20) * 20,
      axisLine: { lineStyle: { color: detailChartTheme.axisLine } },
      axisTick: { lineStyle: { color: detailChartTheme.axisTick } },
      axisLabel: { ...detailChartTheme.axisLabel, hideOverlap: true },
      splitLine: { show: false },
      nameTextStyle: { ...detailChartTheme.axisName },
    },
    yAxis: {
      type: 'value', min: 0, max: 110, name: 'Relative Intensity', nameLocation: 'middle', nameGap: 34,
      axisLabel: {
        ...detailChartTheme.axisLabel,
        hideOverlap: true,
        formatter: (value) => (value > 100 ? '' : `${value}%`),
      },
      axisLine: { show: true, lineStyle: { color: detailChartTheme.axisLine } },
      splitLine: { lineStyle: { color: detailChartTheme.gridLine } },
      nameTextStyle: { ...detailChartTheme.axisName },
    },
    series: [{
      name: props.title,
      type: 'bar',
      barWidth: 1.5,
      data: props.peaks.map(([mz, intensity]) => ({
        value: [mz, intensity],
        itemStyle: { color: props.color },
        label: {
          show: intensity >= 50,
          position: 'top',
          color: '#40515c',
          fontSize: 8,
          formatter: String(mz),
        },
      })),
      emphasis: { itemStyle: { color: '#ef8d36' } },
    }],
  }
})

useECharts(chartRef, option, { renderer: 'svg' })
</script>

<template><div ref="chartRef" class="mass-spectrum-chart" role="img" :aria-label="`${props.title} mass spectrum chart`" /></template>

<style scoped>
.mass-spectrum-chart { width: 100%; height: 300px; }
@media (max-width: 480px) { .mass-spectrum-chart { height: 250px; } }
</style>

