<script setup>
import { computed, ref } from 'vue'
import { useSpectrumChart } from '../../composables/useSpectrumChart'

const props = defineProps({
  peaks: { type: Array, required: true },
  title: { type: String, default: 'Query spectrum' },
})

const chartElement = ref(null)
const option = computed(() => {
  const values = props.peaks.map(([mz]) => mz)
  const minimumMz = values.length ? Math.max(0, Math.floor(Math.min(...values) / 10) * 10 - 5) : 0
  const maximumMz = values.length ? Math.ceil(Math.max(...values) / 10) * 10 + 5 : 100
  return {
    animation: false,
    tooltip: {
      trigger: 'item',
      formatter: ({ value }) => `m/z ${Number(value[0]).toFixed(4)}<br/>Relative intensity: ${Number(value[1]).toFixed(2)}%`,
    },
    grid: { left: 58, right: 18, top: 22, bottom: 70 },
    xAxis: {
      type: 'value', min: minimumMz, max: maximumMz, name: 'm/z', nameLocation: 'middle', nameGap: 30,
      axisLabel: { color: '#687c87', fontSize: 9 },
      axisLine: { lineStyle: { color: '#8799a2' } },
      splitLine: { show: false },
      nameTextStyle: { color: '#566d78', fontSize: 10 },
    },
    yAxis: {
      type: 'value', min: 0, max: 110, name: 'Relative intensity (%)', nameLocation: 'middle', nameGap: 40,
      axisLabel: { color: '#687c87', fontSize: 9, formatter: '{value}%' },
      axisLine: { show: true, lineStyle: { color: '#8799a2' } },
      splitLine: { lineStyle: { color: '#edf2f4' } },
      nameTextStyle: { color: '#566d78', fontSize: 10 },
    },
    dataZoom: [
      { type: 'inside', xAxisIndex: 0, filterMode: 'none' },
      { type: 'slider', xAxisIndex: 0, height: 16, bottom: 14, borderColor: '#cbdce4', fillerColor: 'rgba(8,127,190,.15)', handleStyle: { color: '#087fbe' } },
    ],
    series: [{
      name: props.title,
      type: 'bar',
      barWidth: 3,
      data: props.peaks.map(([mz, intensity]) => ({ value: [mz, intensity], itemStyle: { color: '#087fbe' } })),
      emphasis: { itemStyle: { color: '#ef8d36' } },
    }],
  }
})

const { downloadPng, resetZoom } = useSpectrumChart(chartElement, option)
</script>

<template>
  <section class="query-chart" aria-labelledby="query-spectrum-chart-title">
    <div class="query-chart__heading">
      <div>
        <span>Query spectrum</span>
        <h3 id="query-spectrum-chart-title">{{ title }}</h3>
      </div>
      <div class="query-chart__tools">
        <button type="button" @click="resetZoom">Reset zoom</button>
        <button type="button" @click="downloadPng('humeta-query-spectrum.png')">Download PNG</button>
      </div>
    </div>
    <div ref="chartElement" class="query-chart__canvas" role="img" :aria-label="`${title}, ${peaks.length} peaks. A data table follows.`" />
    <details class="peak-table">
      <summary>Accessible peak table ({{ peaks.length }})</summary>
      <div class="peak-table__scroll">
        <table>
          <thead><tr><th scope="col">Peak</th><th scope="col">m/z</th><th scope="col">Relative intensity</th></tr></thead>
          <tbody><tr v-for="([mz, intensity], index) in peaks" :key="`${mz}-${index}`"><td>{{ index + 1 }}</td><td>{{ mz.toFixed(4) }}</td><td>{{ intensity.toFixed(2) }}%</td></tr></tbody>
        </table>
      </div>
    </details>
  </section>
</template>

<style scoped>
.query-chart { min-width: 0; margin-top: 14px; padding: 14px; border: 1px solid #d4e3e9; border-radius: 5px; background: #fff; }
.query-chart__heading { display: flex; align-items: flex-start; justify-content: space-between; gap: 14px; margin-bottom: 7px; }
.query-chart__heading span { color: var(--primary-blue); font-size: 9px; font-weight: 700; letter-spacing: .12em; text-transform: uppercase; }
.query-chart__heading h3 { margin-top: 4px; color: #244f61; font-size: 14px; }
.query-chart__tools { display: flex; flex-wrap: wrap; justify-content: flex-end; gap: 6px; }
.query-chart__tools button { min-height: 30px; padding: 5px 9px; border: 1px solid #91bfd3; border-radius: 3px; color: #14749f; background: #fff; font-size: 9px; font-weight: 700; cursor: pointer; }
.query-chart__canvas { width: 100%; height: 300px; }
.peak-table { margin-top: 7px; border-top: 1px solid #e2ebef; }
.peak-table summary { padding: 9px 2px 3px; color: #5d7480; font-size: 10px; font-weight: 700; cursor: pointer; }
.peak-table__scroll { max-height: 210px; overflow: auto; }
.peak-table table { width: 100%; border-collapse: collapse; font-size: 10px; }
.peak-table th, .peak-table td { padding: 6px 8px; border-bottom: 1px solid #edf2f4; text-align: left; }
.peak-table th { position: sticky; top: 0; color: #4e6875; background: #f3f8fa; }
@media (max-width: 600px) {
  .query-chart { padding: 10px; }
  .query-chart__heading { display: grid; }
  .query-chart__tools { justify-content: flex-start; }
  .query-chart__canvas { height: 250px; }
}
</style>

