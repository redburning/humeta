<script setup>
import { computed } from 'vue'
import ResultsSummaryHeader from '../ResultsSummaryHeader.vue'
import HumetaLoading from '../common/HumetaLoading.vue'
import StructurePagination from './StructurePagination.vue'
import StructureResultCard from './StructureResultCard.vue'
import StructureSearchEmptyState from './StructureSearchEmptyState.vue'

const props = defineProps({
  state: { type: String, default: 'idle' },
  loading: { type: Boolean, default: false },
  modeLabel: { type: String, required: true },
  total: { type: Number, default: 0 },
  results: { type: Array, default: () => [] },
  Kekule: { type: Object, default: null },
  sortOrder: { type: String, required: true },
  currentPage: { type: Number, required: true },
  pageSize: { type: Number, required: true },
})

const hasResultSummary = computed(() => ['success', 'empty'].includes(props.state))
const summaryCount = computed(() => (hasResultSummary.value ? props.total : null))
const summaryContext = computed(() => (
  hasResultSummary.value
    ? `${props.modeLabel} ${props.total === 1 ? 'match' : 'matches'}`
    : props.modeLabel
))

const emit = defineEmits([
  'update:sortOrder',
  'update:currentPage',
  'clear-filters',
  'load-example',
])
</script>

<template>
  <section class="search-results" aria-labelledby="structure-results-title">
    <ResultsSummaryHeader
      :count="summaryCount"
      :context="summaryContext"
      title-id="structure-results-title"
    >
      <template #actions>
        <label class="results-sort" for="results-sort-order">
          <span>Sort results</span>
          <select
            id="results-sort-order"
            :value="sortOrder"
            :disabled="state !== 'success'"
            @change="emit('update:sortOrder', $event.target.value)"
          >
            <option value="relevance">Match relevance</option>
            <option value="name">Name A-Z</option>
            <option value="molecularWeight">Molecular weight</option>
          </select>
        </label>
      </template>
    </ResultsSummaryHeader>

    <HumetaLoading
      v-if="loading"
      class="search-results__loading"
      label="Loading structure search results"
    />
    <div v-else-if="state === 'success'" class="search-results__grid">
      <StructureResultCard
        v-for="result in results"
        :key="result.record.key"
        :Kekule="Kekule"
        :result="result"
      />
    </div>
    <StructureSearchEmptyState
      v-else-if="state !== 'searching'"
      :state="state"
      @clear-filters="emit('clear-filters')"
      @load-example="emit('load-example')"
    />
    <div v-else class="search-results__pending" aria-hidden="true" />

    <StructurePagination
      v-if="state === 'success'"
      :current-page="currentPage"
      :page-size="pageSize"
      :total="total"
      @update:current-page="emit('update:currentPage', $event)"
    />
  </section>
</template>

<style scoped>
.search-results {
  min-width: 0;
  margin-top: 24px;
  padding: 20px;
  border: 1px solid var(--structure-border, #d4e2e9);
  border-radius: 6px;
  background: #fff;
  box-shadow: none;
  scroll-margin-top: 112px;
}

.results-sort {
  flex: 0 0 180px;
  display: grid;
  gap: 4px;
}

.results-sort span {
  color: var(--structure-label, #5d7c8a);
  font-size: 12px;
  font-weight: 600;
}

.results-sort select {
  min-height: 36px;
  padding: 8px;
  border: 1px solid var(--structure-border, #dbe6eb);
  border-radius: 4px;
  color: #355461;
  background: #fbfcfd;
  font-size: 13px;
}

.results-sort select:disabled {
  opacity: 0.55;
}

.search-results__grid {
  min-width: 0;
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 16px 24px;
}

.search-results__loading,
.search-results__pending {
  min-height: 180px;
}

.search-results :deep(.results-summary) {
  gap: 16px;
  margin-bottom: 16px;
  padding-bottom: 12px;
}

.search-results :deep(.results-summary h2) {
  font-size: 20px;
  font-weight: 600;
  line-height: 1.25;
}

.search-results :deep(.results-summary__meta) {
  gap: 8px;
  margin-top: 4px;
  font-size: 13px;
}

.search-results :deep(.results-summary__count) {
  padding: 4px 8px;
  font-size: 12px;
}

.search-results__grid :deep(.structure-result-card__header h3) {
  font-size: 18px;
  font-weight: 600;
}

@media (max-width: 919px) {
  .search-results__grid {
    grid-template-columns: minmax(0, 1fr);
  }
}

@media (max-width: 600px) {
  .search-results {
    padding: 14px;
  }

  .results-sort {
    width: 100%;
  }
}
</style>
