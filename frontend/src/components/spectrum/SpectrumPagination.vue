<script setup>
import { computed } from 'vue'

const props = defineProps({
  currentPage: { type: Number, required: true },
  pageSize: { type: Number, required: true },
  total: { type: Number, required: true },
})
const emit = defineEmits(['update:currentPage'])
const pageCount = computed(() => Math.max(1, Math.ceil(props.total / props.pageSize)))
</script>

<template>
  <nav v-if="pageCount > 1" class="pagination" aria-label="Spectrum result pages">
    <button type="button" :disabled="currentPage === 1" aria-label="Previous page" @click="emit('update:currentPage', currentPage - 1)">Previous</button>
    <button
      v-for="page in pageCount"
      :key="page"
      type="button"
      :class="{ 'pagination__current': page === currentPage }"
      :aria-current="page === currentPage ? 'page' : undefined"
      :aria-label="`Page ${page}`"
      @click="emit('update:currentPage', page)"
    >{{ page }}</button>
    <button type="button" :disabled="currentPage === pageCount" aria-label="Next page" @click="emit('update:currentPage', currentPage + 1)">Next</button>
  </nav>
</template>

<style scoped>
.pagination { display: flex; flex-wrap: wrap; justify-content: center; align-items: center; gap: 6px; margin-top: 18px; }
.pagination button { min-width: 34px; min-height: 32px; padding: 6px 10px; border: 1px solid #c9dce5; border-radius: 4px; color: #526c78; background: #fff; font-size: 11px; cursor: pointer; }
.pagination button:hover:not(:disabled), .pagination button:focus-visible { color: var(--primary-blue); border-color: #78b8d4; background: #f1f9fc; }
.pagination button:disabled { opacity: .45; cursor: not-allowed; }
.pagination .pagination__current { color: #fff; border-color: var(--primary-blue); background: var(--primary-blue); }
</style>

