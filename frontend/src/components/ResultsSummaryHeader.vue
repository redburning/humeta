<script setup>
import { computed } from 'vue'

const props = defineProps({
  title: {
    type: String,
    default: 'Search results',
  },
  titleId: {
    type: String,
    default: undefined,
  },
  count: {
    type: Number,
    default: null,
  },
  context: {
    type: String,
    required: true,
  },
  query: {
    type: String,
    default: null,
  },
})

const countLabel = computed(() => {
  if (props.count === null) return ''
  return `${props.count} ${props.count === 1 ? 'result' : 'results'}`
})
</script>

<template>
  <header class="results-summary">
    <div class="results-summary__content">
      <h2 :id="props.titleId">{{ props.title }}</h2>
      <p class="results-summary__meta" aria-live="polite">
        <span v-if="props.count !== null" class="results-summary__count">
          {{ countLabel }}
        </span>
        <span class="results-summary__context">
          {{ props.context }}
          <span v-if="props.query !== null" class="results-summary__query">“{{ props.query }}”</span>
        </span>
      </p>
    </div>

    <slot name="actions" />
  </header>
</template>

<style scoped>
.results-summary {
  min-width: 0;
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 20px;
  margin-bottom: 16px;
  padding-bottom: 14px;
  border-bottom: 1px solid var(--structure-divider, #edf2f4);
}

.results-summary__content {
  min-width: 0;
}

h2 {
  color: var(--structure-heading, #173a4d);
  font-size: 24px;
  font-weight: 650;
  line-height: 1.2;
  letter-spacing: -0.01em;
}

.results-summary__meta {
  min-width: 0;
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 7px;
  margin-top: 7px;
  color: var(--structure-label, #5d7686);
  font-size: 14px;
  font-weight: 400;
  line-height: 1.45;
}

.results-summary__count {
  flex: 0 0 auto;
  padding: 4px 9px;
  border: 1px solid #c9e1ee;
  border-radius: 4px;
  color: #087fbe;
  background: #e8f3fa;
  font-size: 14px;
  font-weight: 700;
  line-height: 1;
  white-space: nowrap;
}

.results-summary__context {
  min-width: 0;
}

.results-summary__query {
  color: #344f5d;
  font-weight: 500;
}

@media (max-width: 600px) {
  .results-summary {
    align-items: stretch;
    display: grid;
    grid-template-columns: minmax(0, 1fr);
    justify-content: stretch;
  }

  h2 {
    font-size: 22px;
    font-weight: 600;
  }

  .results-summary__count {
    font-size: 14px;
  }
}
</style>
