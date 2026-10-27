<script setup>
defineProps({
  canSearch: { type: Boolean, default: false },
  disabled: { type: Boolean, default: false },
  searching: { type: Boolean, default: false },
})

const emit = defineEmits(['search', 'load-example', 'clear'])
</script>

<template>
  <div class="search-actions" aria-label="Structure search actions">
    <button
      class="search-actions__primary"
      type="button"
      :disabled="disabled || !canSearch || searching"
      @click="emit('search')"
    >
      <span aria-hidden="true">⌕</span>
      {{ searching ? 'Searching locally...' : 'Search structure' }}
    </button>
    <button type="button" :disabled="disabled" @click="emit('load-example')">
      Load Tryptophan Example
    </button>
    <button type="button" :disabled="disabled" @click="emit('clear')">Clear</button>
  </div>
</template>

<style scoped>
.search-actions {
  min-width: 0;
  display: grid;
  grid-template-columns: minmax(190px, 1.5fr) repeat(2, minmax(0, 1fr));
  gap: 8px;
  margin-bottom: 8px;
}

.search-actions button {
  min-width: 0;
  min-height: 44px;
  padding: 8px 12px;
  border: 1px solid var(--structure-border, #dbe6eb);
  border-radius: 4px;
  color: #3f5d6a;
  background: #fff;
  font-size: 13px;
  font-weight: 700;
  white-space: nowrap;
  cursor: pointer;
}

.search-actions .search-actions__primary {
  color: #fff;
  border-color: var(--humeta-brand-primary);
  background: var(--humeta-brand-primary);
  font-size: 13px;
}

.search-actions__primary span {
  margin-right: 4px;
  font-size: 16px;
}

.search-actions button:hover:not(:disabled) {
  border-color: #cfdde3;
  color: #365563;
  background: #f8fbfc;
}

.search-actions .search-actions__primary:hover:not(:disabled) {
  color: #fff;
  border-color: var(--humeta-brand-hover);
  background: var(--humeta-brand-hover);
}

.search-actions button:disabled {
  cursor: not-allowed;
  opacity: 0.52;
}

.search-actions .search-actions__primary:disabled {
  border-color: var(--structure-border, #dbe6eb);
  color: #3f5d6a;
  background: var(--structure-border, #dbe6eb);
  opacity: 1;
}

@media (max-width: 700px) {
  .search-actions {
    grid-template-columns: 1fr 1fr;
  }

  .search-actions__primary {
    grid-column: 1 / -1;
  }
}

@media (max-width: 480px) {
  .search-actions {
    grid-template-columns: 1fr;
  }

  .search-actions__primary {
    grid-column: auto;
  }
}
</style>
