<script setup>
import { computed, ref, watch } from 'vue'
import Ms1ResultTable from './Ms1ResultTable.vue'
import Ms2ResultCard from './Ms2ResultCard.vue'
import SpectrumEmptyState from './SpectrumEmptyState.vue'
import SpectrumPagination from './SpectrumPagination.vue'

const props = defineProps({
  mode: { type: String, required: true },
  state: { type: String, required: true },
  results: { type: Array, required: true },
  total: { type: Number, required: true },
  currentPage: { type: Number, required: true },
  pageSize: { type: Number, required: true },
  queryLine: { type: String, default: '' },
})
const emit = defineEmits(['update:currentPage', 'use-query'])
const expandedId = ref('')
const isMs1 = computed(() => props.mode === 'ms1')
const title = computed(() => isMs1.value ? 'Local demonstration candidates' : 'Local demonstration spectral matches')

watch(
  () => [props.mode, props.currentPage, props.results.map((result) => result.record.id).join('|')],
  () => { expandedId.value = '' },
)
</script>

<template>
  <section class="results" aria-labelledby="spectrum-results-heading">
    <header class="results__header">
      <div><span>{{ isMs1 ? 'Accurate mass results' : 'Spectral-library results' }}</span><h2 id="spectrum-results-heading">{{ title }}</h2><p aria-live="polite">{{ state === 'success' ? `${total} local ${total === 1 ? 'match' : 'matches'}` : queryLine }}</p></div>
      <p v-if="state === 'success'" class="results__query">{{ queryLine }}</p>
    </header>

    <SpectrumEmptyState v-if="state === 'idle'" title="Build a local query to begin" :message="isMs1 ? 'Enter an exact m/z and select Search spectrum.' : 'Paste peaks or read a local file, then select Search spectrum.'" />
    <SpectrumEmptyState v-else-if="state === 'searching'" title="Searching the local demonstration data" message="Scoring deterministic candidates in this browser session." />
    <SpectrumEmptyState v-else-if="state === 'empty'" :title="isMs1 ? 'No local demonstration candidates matched' : 'No local demonstration spectral matches'" :message="isMs1 ? 'No local demonstration candidates matched the current m/z window.' : 'Adjust the precursor window, score, matched-peak, or fragment settings and try again.'" />
    <SpectrumEmptyState v-else-if="state === 'error'" title="The local search could not be completed" message="Review the inline query errors and try again." />

    <template v-else-if="state === 'success'">
      <Ms1ResultTable v-if="isMs1" :results="results" :rank-offset="(currentPage - 1) * pageSize" />
      <div v-else class="results__cards">
        <Ms2ResultCard
          v-for="(result, index) in results"
          :key="result.record.id"
          :result="result"
          :rank="(currentPage - 1) * pageSize + index + 1"
          :expanded="expandedId === result.record.id"
          @compare="expandedId = result.record.id"
          @close-compare="expandedId = ''"
          @use-query="emit('use-query', result.record)"
        />
      </div>
      <SpectrumPagination :current-page="currentPage" :page-size="pageSize" :total="total" @update:current-page="emit('update:currentPage', $event)" />
    </template>
  </section>
</template>

<style scoped>
.results { min-width: 0; margin-top: 22px; padding: 20px; border: 1px solid #cfdee6; border-radius: 7px; background: #fff; box-shadow: 0 6px 18px rgba(17,76,108,.05); scroll-margin-top: 80px; }
.results__header { display: flex; align-items: flex-end; justify-content: space-between; gap: 20px; margin-bottom: 15px; padding-bottom: 13px; border-bottom: 1px solid #dce7ec; }
.results__header span { color: var(--primary-blue); font-size: 9px; font-weight: 700; letter-spacing: .12em; text-transform: uppercase; }
.results__header h2 { margin-top: 4px; color: #1d4557; font-size: 20px; }
.results__header p { margin-top: 4px; color: #71858f; font-size: 10px; }
.results__query { max-width: 48%; text-align: right; }
.results__cards { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 13px; }
.results__cards > :only-child { grid-column: 1 / -1; }
@media (max-width: 1100px) { .results__cards { grid-template-columns: 1fr; } }
@media (max-width: 600px) {
  .results { padding: 14px; }
  .results__header { display: grid; align-items: stretch; }
  .results__query { max-width: none; text-align: left; }
}
</style>
