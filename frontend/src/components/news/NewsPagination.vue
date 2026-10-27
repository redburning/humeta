<script setup>
defineProps({
  page: { type: Number, required: true },
  pageCount: { type: Number, required: true },
  language: { type: String, required: true },
})

defineEmits(['select'])
</script>

<template>
  <nav class="news-pagination" :aria-label="language === 'en' ? 'News pagination' : '新闻分页'">
    <button
      type="button"
      :disabled="page === 1"
      :aria-disabled="page === 1"
      :aria-label="language === 'en' ? 'Previous page' : '上一页'"
      @click="$emit('select', page - 1)"
    >
      <span aria-hidden="true">‹</span>
    </button>
    <button
      v-for="pageNumber in pageCount"
      :key="pageNumber"
      type="button"
      :class="{ 'news-pagination__current': pageNumber === page }"
      :aria-current="pageNumber === page ? 'page' : undefined"
      :aria-label="language === 'en' ? `Page ${pageNumber}` : `第 ${pageNumber} 页`"
      @click="$emit('select', pageNumber)"
    >
      {{ pageNumber }}
    </button>
    <button
      type="button"
      :disabled="page === pageCount"
      :aria-disabled="page === pageCount"
      :aria-label="language === 'en' ? 'Next page' : '下一页'"
      @click="$emit('select', page + 1)"
    >
      <span aria-hidden="true">›</span>
    </button>
  </nav>
</template>

<style scoped>
.news-pagination {
  display: flex;
  justify-content: center;
  gap: 6px;
}

.news-pagination button {
  box-sizing: border-box;
  width: 32px;
  height: 32px;
  min-width: 32px;
  min-height: 32px;
  padding: 0;
  border: 1px solid #dce8ef;
  border-radius: 4px;
  color: #587384;
  background: #fff;
  font: inherit;
  font-size: 13px;
  cursor: pointer;
}

.news-pagination button:hover:not(:disabled),
.news-pagination button:focus-visible:not(:disabled) {
  border-color: #87b9d0;
  color: var(--humeta-blue-900);
  background: #f2f8fb;
}

.news-pagination button:focus-visible {
  outline: 2px solid #1598b5;
  outline-offset: 2px;
}

.news-pagination .news-pagination__current {
  border-color: #087fbe;
  color: #fff;
  background: #087fbe;
}

.news-pagination button:disabled {
  color: #a8b8c1;
  background: #f8fafb;
  cursor: not-allowed;
}
</style>
