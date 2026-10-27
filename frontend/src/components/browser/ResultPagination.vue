<script setup>
import { computed, ref, watch } from 'vue'

const props = defineProps({
  currentPage: {
    type: Number,
    default: 1,
  },
  totalPages: {
    type: Number,
    default: 20,
  },
})

const emit = defineEmits({
  'update:currentPage': (value) => Number.isInteger(value),
})

const jumpPage = ref(props.currentPage)

watch(
  () => props.currentPage,
  (value) => {
    jumpPage.value = value
  },
)

const visibleItems = computed(() => {
  const current = props.currentPage
  const total = props.totalPages
  const page = (value) => ({ type: 'page', value, key: `page-${value}`, optional: value !== current && value !== 1 && value !== total })
  const ellipsis = (key) => ({ type: 'ellipsis', key })

  if (total <= 7) return Array.from({ length: total }, (_, index) => page(index + 1))
  if (current <= 4) return [page(1), page(2), page(3), page(4), page(5), ellipsis('ellipsis-right'), page(total)]
  if (current >= total - 3) {
    return [page(1), ellipsis('ellipsis-left'), page(total - 4), page(total - 3), page(total - 2), page(total - 1), page(total)]
  }
  return [page(1), ellipsis('ellipsis-left'), page(current - 1), page(current), page(current + 1), ellipsis('ellipsis-right'), page(total)]
})

function setPage(value) {
  const parsed = Number(value)
  if (!Number.isFinite(parsed)) return
  const nextPage = Math.min(props.totalPages, Math.max(1, Math.round(parsed)))
  jumpPage.value = nextPage
  emit('update:currentPage', nextPage)
}
</script>

<template>
  <nav class="result-pagination" aria-label="Search results pagination">
    <button
      type="button"
      class="result-pagination__arrow"
      aria-label="Previous page"
      :disabled="props.currentPage === 1"
      @click="setPage(props.currentPage - 1)"
    >
      <span class="result-pagination__chevron result-pagination__chevron--left" aria-hidden="true" />
    </button>

    <template v-for="item in visibleItems" :key="item.key">
      <span v-if="item.type === 'ellipsis'" class="result-pagination__ellipsis">...</span>
      <button
        v-else
        type="button"
        class="result-pagination__page"
        :class="{ 'result-pagination__page--optional': item.optional }"
        :aria-current="item.value === props.currentPage ? 'page' : undefined"
        :aria-label="`Page ${item.value}`"
        @click="setPage(item.value)"
      >
        {{ item.value }}
      </button>
    </template>

    <button
      type="button"
      class="result-pagination__arrow"
      aria-label="Next page"
      :disabled="props.currentPage === props.totalPages"
      @click="setPage(props.currentPage + 1)"
    >
      <span class="result-pagination__chevron result-pagination__chevron--right" aria-hidden="true" />
    </button>

    <label class="result-pagination__jump">
      <span>Go to</span>
      <input
        v-model.number="jumpPage"
        type="number"
        min="1"
        :max="props.totalPages"
        aria-label="Go to page"
        @change="setPage(jumpPage)"
        @keydown.enter.prevent="setPage(jumpPage)"
      />
    </label>
  </nav>
</template>

<style scoped>
.result-pagination {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: center;
  gap: 6px;
  margin-top: 20px;
  color: #4c6b79;
  font-size: 13px;
}

.result-pagination button {
  min-width: 38px;
  min-height: 38px;
  display: inline-grid;
  place-items: center;
  padding: 6px 10px;
  border: 1px solid #c4d9e3;
  border-radius: 5px;
  color: #4c6b79;
  background: #fff;
  font: inherit;
  line-height: 1;
  cursor: pointer;
}

.result-pagination__page,
.result-pagination__arrow {
  min-width: 38px;
  min-height: 38px;
}

.result-pagination button:hover:not(:disabled):not([aria-current='page']) {
  border-color: #8bbbd1;
  color: var(--primary-blue);
  background: #f4f9fb;
}

.result-pagination button:focus-visible,
.result-pagination__jump input:focus-visible {
  outline: 2px solid rgba(8, 127, 190, 0.28);
  outline-offset: 2px;
}

.result-pagination__page[aria-current='page'] {
  color: #fff;
  border-color: var(--primary-blue);
  background: var(--primary-blue);
}

.result-pagination__arrow:disabled {
  border-color: #e2ebef;
  color: #a8b6bd;
  background: #fbfcfd;
  cursor: not-allowed;
  opacity: 1;
}

.result-pagination__chevron {
  width: 8px;
  height: 8px;
  border-top: 1.7px solid currentColor;
  border-right: 1.7px solid currentColor;
}

.result-pagination__chevron--left {
  transform: rotate(-135deg);
}

.result-pagination__chevron--right {
  transform: rotate(45deg);
}

.result-pagination__ellipsis {
  min-width: 28px;
  text-align: center;
}

.result-pagination__jump {
  min-height: 38px;
  display: inline-flex;
  align-items: center;
  gap: 6px;
  margin-left: 8px;
  color: #5d7c8a;
  white-space: nowrap;
}

.result-pagination__jump input {
  width: 52px;
  min-height: 38px;
  padding: 6px 8px;
  border: 1px solid #c4d9e3;
  border-radius: 5px;
  color: #4c6b79;
  background: #fff;
  font-size: 13px;
  text-align: center;
}

@media (max-width: 560px) {
  .result-pagination {
    gap: 4px;
  }

  .result-pagination__page--optional,
  .result-pagination__ellipsis {
    display: none;
  }

  .result-pagination__jump {
    margin-left: 4px;
  }

  .result-pagination__jump span {
    display: none;
  }
}
</style>
