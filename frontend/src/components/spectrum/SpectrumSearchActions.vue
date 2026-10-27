<script setup>
defineProps({
  canSearch: { type: Boolean, default: false },
  searching: { type: Boolean, default: false },
})
defineEmits(['reset', 'search'])
</script>

<template>
  <div class="search-actions">
    <button type="button" class="search-actions__secondary" @click="$emit('reset')">↺ Reset current mode</button>
    <button type="button" class="search-actions__primary" :disabled="!canSearch || searching" @click="$emit('search')">
      {{ searching ? 'Searching local library…' : '⌕ Search spectrum' }}
    </button>
  </div>
</template>

<style scoped>
.search-actions { display: grid; grid-template-columns: minmax(0, .72fr) minmax(0, 1.28fr); gap: 10px; margin-top: 14px; }
.search-actions button { min-height: 42px; padding: 8px 13px; border-radius: 4px; font-size: 11px; font-weight: 700; cursor: pointer; }
.search-actions__secondary { border: 1px solid #8dbed3; color: #176f99; background: #fff; }
.search-actions__primary { border: 1px solid var(--primary-blue); color: #fff; background: var(--primary-blue); }
.search-actions button:hover:not(:disabled) { filter: brightness(.97); }
.search-actions button:disabled { opacity: .5; cursor: not-allowed; }
@media (max-width: 520px) { .search-actions { grid-template-columns: 1fr; } }
</style>

