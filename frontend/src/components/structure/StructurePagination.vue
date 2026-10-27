<script setup>
import { computed } from 'vue'

const props = defineProps({
  currentPage: { type: Number, required: true },
  pageSize: { type: Number, required: true },
  total: { type: Number, required: true },
})

const emit = defineEmits(['update:currentPage'])
const pageCount = computed(() => Math.ceil(props.total / props.pageSize))
const pages = computed(() => Array.from({ length: pageCount.value }, (_, index) => index + 1))
</script>

<template>
  <nav v-if="pageCount > 1" class="pagination" aria-label="Structure search result pages">
    <button
      class="pagination__direction"
      type="button"
      :disabled="currentPage === 1"
      aria-label="Previous page"
      @click="emit('update:currentPage', currentPage - 1)"
    >
      <svg viewBox="0 0 20 20" aria-hidden="true">
        <path d="m12.5 4.5-5.5 5.5 5.5 5.5" />
      </svg>
    </button>
    <button
      v-for="page in pages"
      :key="page"
      type="button"
      :class="{ 'pagination__page--current': page === currentPage }"
      :aria-current="page === currentPage ? 'page' : undefined"
      :aria-label="`Page ${page}`"
      @click="emit('update:currentPage', page)"
    >
      {{ page }}
    </button>
    <button
      class="pagination__direction"
      type="button"
      :disabled="currentPage === pageCount"
      aria-label="Next page"
      @click="emit('update:currentPage', currentPage + 1)"
    >
      <svg viewBox="0 0 20 20" aria-hidden="true">
        <path d="m7.5 4.5 5.5 5.5-5.5 5.5" />
      </svg>
    </button>
  </nav>
</template>

<style scoped>
.pagination {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 6px;
  margin-top: 20px;
}

.pagination button {
  min-width: 38px;
  min-height: 38px;
  display: inline-grid;
  place-items: center;
  padding: 6px 10px;
  border: 1px solid #c4d9e3;
  border-radius: 5px;
  color: #4c6b79;
  background: #fff;
  font-size: 13px;
  line-height: 1;
  cursor: pointer;
}

.pagination button:hover:not(:disabled):not(.pagination__page--current) {
  border-color: #8bbbd1;
  color: var(--primary-blue, #087fbe);
  background: #f4f9fb;
}

.pagination button:focus-visible {
  outline: 2px solid rgba(8, 127, 190, 0.28);
  outline-offset: 2px;
}

.pagination__direction {
  padding: 0;
}

.pagination__direction svg {
  width: 17px;
  height: 17px;
  fill: none;
  stroke: currentColor;
  stroke-width: 1.7;
  stroke-linecap: round;
  stroke-linejoin: round;
}

.pagination .pagination__page--current {
  color: #fff;
  border-color: var(--primary-blue);
  background: var(--primary-blue);
}

.pagination button:disabled {
  border-color: #e2ebef;
  color: #a8b6bd;
  background: #fbfcfd;
  cursor: not-allowed;
  opacity: 1;
}
</style>
