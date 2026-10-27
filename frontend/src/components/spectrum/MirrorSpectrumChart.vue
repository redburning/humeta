<script setup>
import { computed, ref } from 'vue'
import { useSpectrumChart } from '../../composables/useSpectrumChart'

const props = defineProps({ result: { type: Object, required: true } })
defineEmits(['close'])

const chartElement = ref(null)
const matchedQuery = computed(() => new Set(props.result.matchedPairs.map((pair) => pair.queryMz.toFixed(4))))
const matchedReference = computed(() => new Set(props.result.matchedPairs.map((pair) => pair.referenceMz.toFixed(4))))
const option = computed(() => {
  const allMz = [...props.result.queryDisplayPeaks, ...props.result.referenceDisplayPeaks].map(([mz]) => mz)
  const minimumMz = Math.max(0, Math.floor(Math.min(...allMz) / 10) * 10 - 5)
  const maximumMz = Math.ceil(Math.max(...allMz) / 10) * 10 + 5
  return {
    animation: false,
    tooltip: {
      trigger: 'item',
      formatter: ({ seriesName, value }) => `${seriesName}<br/>m/z ${Number(value[0]).toFixed(4)}<br/>Relative intensity: ${Math.abs(Number(value[1])).toFixed(2)}%`,
    },
    grid: { left: 58, right: 18, top: 20, bottom: 70 },
    xAxis: {
      type: 'value', min: minimumMz, max: maximumMz, name: 'm/z', nameLocation: 'middle', nameGap: 30,
      axisLabel: { color: '#687c87', fontSize: 9 }, axisLine: { lineStyle: { color: '#526974' } }, splitLine: { show: false },
    },
    yAxis: {
      type: 'value', min: -110, max: 110, name: 'Relative intensity (%)', nameLocation: 'middle', nameGap: 42,
      axisLabel: { color: '#687c87', fontSize: 9, formatter: (value) => `${Math.abs(value)}%` },
      axisLine: { show: true, lineStyle: { color: '#526974' } }, splitLine: { lineStyle: { color: '#edf2f4' } },
    },
    dataZoom: [
      { type: 'inside', xAxisIndex: 0, filterMode: 'none' },
      { type: 'slider', xAxisIndex: 0, height: 16, bottom: 14, borderColor: '#cbdce4', fillerColor: 'rgba(8,127,190,.15)', handleStyle: { color: '#087fbe' } },
    ],
    series: [
      {
        name: 'Query', type: 'bar', barWidth: 3,
        data: props.result.queryDisplayPeaks.map(([mz, intensity]) => ({ value: [mz, intensity], itemStyle: { color: matchedQuery.value.has(mz.toFixed(4)) ? '#087fbe' : 'rgba(8,127,190,.28)' } })),
      },
      {
        name: 'Reference', type: 'bar', barWidth: 3,
        data: props.result.referenceDisplayPeaks.map(([mz, intensity]) => ({ value: [mz, -intensity], itemStyle: { color: matchedReference.value.has(mz.toFixed(4)) ? '#ef8d36' : 'rgba(239,141,54,.28)' } })),
      },
    ],
  }
})

const { downloadPng, resetZoom } = useSpectrumChart(chartElement, option)
</script>

<template>
  <section class="mirror" aria-labelledby="mirror-title">
    <div class="mirror__heading">
      <div>
        <span>Spectrum comparison</span>
        <h4 id="mirror-title">Query vs {{ result.record.name }}</h4>
      </div>
      <div class="mirror__tools">
        <button type="button" @click="resetZoom">Reset zoom</button>
        <button type="button" @click="downloadPng(`humeta-mirror-${result.record.id}.png`)">Download PNG</button>
        <button type="button" @click="$emit('close')">Close comparison</button>
      </div>
    </div>
    <dl class="mirror__summary">
      <div><dt>Algorithm</dt><dd>{{ result.algorithm === 'entropy' ? 'Unweighted entropy similarity' : 'Dot-product score' }}</dd></div>
      <div><dt>Score</dt><dd>{{ result.score.toFixed(4) }}</dd></div>
      <div><dt>Matched peaks</dt><dd>{{ result.matchedPairs.length }}</dd></div>
      <div><dt>Precursor delta</dt><dd>{{ result.massError.deltaPpm.toFixed(2) }} ppm</dd></div>
    </dl>
    <div ref="chartElement" class="mirror__canvas" role="img" :aria-label="`Mirror spectrum comparing the query with ${result.record.name}. Query peaks point upward and reference peaks point downward.`" />
    <details class="mirror__table">
      <summary>Accessible matched-peak table ({{ result.matchedPairs.length }})</summary>
      <div>
        <table>
          <thead><tr><th scope="col">Query m/z</th><th scope="col">Reference m/z</th><th scope="col">Delta Da</th><th scope="col">Query intensity</th><th scope="col">Reference intensity</th></tr></thead>
          <tbody><tr v-for="pair in result.matchedPairs" :key="`${pair.queryMz}-${pair.referenceMz}`"><td>{{ pair.queryMz.toFixed(4) }}</td><td>{{ pair.referenceMz.toFixed(4) }}</td><td>{{ pair.deltaDa.toFixed(6) }}</td><td>{{ pair.queryIntensity.toFixed(2) }}</td><td>{{ pair.referenceIntensity.toFixed(2) }}</td></tr></tbody>
        </table>
      </div>
    </details>
  </section>
</template>

<style scoped>
.mirror { min-width: 0; margin: 0 13px 13px; padding: 13px; border: 1px solid #cfe0e8; border-radius: 4px; background: #fbfdfe; }
.mirror__heading { display: flex; align-items: flex-start; justify-content: space-between; gap: 12px; }
.mirror__heading span { color: var(--primary-blue); font-size: 9px; font-weight: 700; letter-spacing: .1em; text-transform: uppercase; }
.mirror__heading h4 { margin-top: 3px; color: #2d5364; font-size: 13px; }
.mirror__tools { display: flex; flex-wrap: wrap; justify-content: flex-end; gap: 5px; }
.mirror__tools button { min-height: 29px; padding: 5px 8px; border: 1px solid #8dbed3; border-radius: 3px; color: #176f99; background: #fff; font-size: 9px; font-weight: 700; cursor: pointer; }
.mirror__summary { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 7px; margin-top: 10px; }
.mirror__summary div { min-width: 0; padding: 7px 8px; border-left: 2px solid #79b8d4; background: #eef7fa; }
.mirror__summary dt { color: #758993; font-size: 8px; text-transform: uppercase; }
.mirror__summary dd { margin: 3px 0 0; color: #315968; font-size: 10px; font-weight: 700; overflow-wrap: anywhere; }
.mirror__canvas { width: 100%; height: 330px; margin-top: 8px; }
.mirror__table { margin-top: 7px; border-top: 1px solid #e2ebef; }
.mirror__table summary { padding: 9px 2px 3px; color: #5d7480; font-size: 10px; font-weight: 700; cursor: pointer; }
.mirror__table > div { max-height: 190px; overflow: auto; }
.mirror__table table { width: 100%; border-collapse: collapse; font-size: 9px; }
.mirror__table th, .mirror__table td { padding: 6px 7px; border-bottom: 1px solid #edf2f4; text-align: left; white-space: nowrap; }
.mirror__table th { position: sticky; top: 0; color: #4e6875; background: #f3f8fa; }
@media (max-width: 700px) {
  .mirror__heading { display: grid; }
  .mirror__tools { justify-content: flex-start; }
  .mirror__summary { grid-template-columns: repeat(2, minmax(0, 1fr)); }
  .mirror__canvas { height: 270px; }
}
@media (max-width: 420px) { .mirror__summary { grid-template-columns: 1fr; } }
</style>
