<script setup>
import { computed, ref, watch } from 'vue'

const props = defineProps({
  result: {
    type: Object,
    required: true,
  },
  explanation: {
    type: Object,
    default: null,
  },
})

const structureImageFailed = ref(false)

watch(
  () => props.result.structureImage,
  () => {
    structureImageFailed.value = false
  },
)

const hasStructureImage = computed(() => (
  Boolean(props.result.structureImage) && !structureImageFailed.value
))

const MATCH_TYPE_LABELS = Object.freeze({
  exact: 'Exact',
  identifier: 'Identifier',
  alias: 'Alias',
  fuzzy: 'Fuzzy',
})

const matchDescription = computed(() => {
  if (!props.explanation) return ''

  const matchType = MATCH_TYPE_LABELS[props.explanation.matchType]
  return matchType
    ? `${props.explanation.primaryMatch} · ${matchType}`
    : props.explanation.primaryMatch
})

const alsoMatched = computed(() => {
  if (!props.explanation) return []
  return props.explanation.matchedFields.filter((field) => (
    field !== props.explanation.primaryMatch
  ))
})

const fields = [
  { label: 'Chinese Name:', key: 'chineseName' },
  { label: 'Molecular Formula:', key: 'formula' },
  { label: 'Molecular Weight:', key: 'monoisotopicMw' },
  { label: 'Category:', key: 'category' },
  { label: 'SMILES:', key: 'smiles' },
]
</script>

<template>
  <article class="result-card">
    <header class="result-card__header">
      <span class="result-card__id">{{ props.result.id }}</span>
      <h3>{{ props.result.name }}</h3>

      <RouterLink
        :to="`/metabolites/${props.result.id}`"
        class="result-card__details"
        :aria-label="`View details for ${props.result.name} ${props.result.id}`"
      >
        Details
      </RouterLink>
    </header>

    <div v-if="props.explanation" class="result-card__explanation">
      <p>Matched by: {{ matchDescription }}</p>
      <p v-if="alsoMatched.length">Also matched: {{ alsoMatched.join(', ') }}</p>
    </div>

    <div class="result-card__content">
      <dl class="result-card__facts">
        <div
          v-for="field in fields"
          :key="field.key"
          class="result-card__row"
          :class="{ 'result-card__row--smiles': field.key === 'smiles' }"
        >
          <dt>{{ field.label }}</dt>
          <dd :title="field.key === 'smiles' ? props.result[field.key] : undefined">
            {{ props.result[field.key] }}
          </dd>
        </div>
      </dl>

      <div class="result-card__structure" role="img" :aria-label="`${props.result.name} 2D molecular structure`">
        <img
          v-if="hasStructureImage"
          :src="props.result.structureImage"
          alt=""
          aria-hidden="true"
          @error="structureImageFailed = true"
        />
        <span v-else class="result-card__structure-empty">No structure image</span>
      </div>
    </div>
  </article>
</template>

<style scoped>
.result-card {
  min-width: 0;
  height: auto;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  border: 1px solid var(--structure-border, #dbe6eb);
  border-radius: 6px;
  background: #fff;
  box-shadow: none;
}

.result-card__header {
  min-width: 0;
  display: grid;
  grid-template-columns: auto minmax(0, 1fr) auto;
  align-items: center;
  gap: 11px;
  padding: 11px 14px;
  border-bottom: 1px solid var(--structure-divider, #edf2f4);
  background: #f5fafc;
}

.result-card__id {
  flex: 0 0 auto;
  padding: 6px 9px;
  border-radius: 4px;
  color: #fff;
  background: var(--deep-blue, #004f98);
  font-size: 13px;
  font-weight: 600;
  line-height: 1.2;
  text-align: center;
  white-space: nowrap;
}

.result-card__header h3 {
  min-width: 0;
  margin: 0;
  overflow: hidden;
  color: var(--structure-heading, #173b4d);
  font-size: 18px;
  font-weight: 600;
  line-height: 1.3;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.result-card__explanation {
  margin: 0;
  padding: 8px 14px 0;
  color: #617684;
  font-family: inherit;
  font-size: 12px;
  font-weight: 400;
  line-height: 1.35;
  overflow-wrap: anywhere;
}

.result-card__explanation p {
  margin: 0;
  color: inherit;
  font: inherit;
}

.result-card__explanation p + p {
  margin-top: 2px;
}

.result-card__details {
  min-width: 82px;
  min-height: 38px;
  display: inline-grid;
  place-items: center;
  padding: 6px 13px;
  border: 1px solid var(--primary-blue, #087fbe);
  border-radius: 4px;
  color: var(--primary-blue, #087fbe);
  background: #fff;
  font-size: 13px;
  font-weight: 600;
  line-height: 1;
  text-decoration: none;
}

.result-card__details:hover,
.result-card__details:focus-visible {
  background: #f1f8fb;
}

.result-card__content {
  min-width: 0;
  flex: 1;
  display: grid;
  grid-template-columns: minmax(0, 1.85fr) minmax(132px, 1fr);
  align-items: start;
  gap: 16px;
  padding: 16px 14px;
}

.result-card__facts {
  min-width: 0;
  display: grid;
  align-content: start;
  gap: 7px;
  margin: 0;
}

.result-card__row {
  min-width: 0;
  display: flex;
  align-items: baseline;
  flex-wrap: nowrap;
  gap: 4px;
  font-size: 14px;
  line-height: 1.55;
}

.result-card__row--smiles {
  align-items: stretch;
  flex-direction: column;
  gap: 2px;
}

.result-card__row dt {
  flex: 0 0 auto;
  color: #667f8b;
  font-weight: 500;
}

.result-card__row dd {
  min-width: 0;
  flex: 1 1 auto;
  overflow: hidden;
  margin: 0;
  color: #294b5b;
  font-weight: 500;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.result-card__row--smiles dd {
  box-sizing: border-box;
  width: 100%;
  max-width: 100%;
  padding: 6px 8px;
  overflow: visible;
  border: 1px solid #e4edf1;
  border-radius: 4px;
  color: #4d6672;
  background: #f7fafb;
  font: 13px/1.55 Consolas, "SFMono-Regular", monospace;
  overflow-wrap: anywhere;
  text-overflow: clip;
  white-space: normal;
  word-break: break-all;
}

.result-card__structure {
  position: relative;
  box-sizing: border-box;
  width: 100%;
  height: 120px;
  overflow: hidden;
  justify-self: end;
  align-self: start;
  border: 1px solid #d7e5eb;
  border-radius: 4px;
  background: #fff;
}

.result-card__structure img {
  position: absolute;
  inset: 8px;
  width: calc(100% - 16px);
  height: calc(100% - 16px);
  object-fit: contain;
}

.result-card__structure-empty {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #8aa0ab;
  font-size: 12px;
  letter-spacing: 0.02em;
}

@media (max-width: 700px) {
  .result-card__header {
    padding: 12px 14px;
  }

  .result-card__content {
    grid-template-columns: 1fr;
    gap: 18px;
    padding: 16px 14px;
  }

  .result-card__structure {
    max-width: none;
    height: clamp(140px, 42vw, 168px);
    justify-self: stretch;
  }

}
</style>
