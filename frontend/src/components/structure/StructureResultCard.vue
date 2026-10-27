<script setup>
import StructureResultViewer from './StructureResultViewer.vue'

defineProps({
  result: { type: Object, required: true },
  Kekule: { type: Object, default: null },
})

function getMatchStatusLabel(match) {
  if (typeof match.score === 'number') return 'Similarity match'
  if (match.matchedAtomCount !== undefined) return 'Substructure matched'
  return 'Exact structure matched'
}
</script>

<template>
  <article class="structure-result-card">
    <header class="structure-result-card__header">
      <span class="structure-result-card__id">{{ result.record.id }}</span>
      <h3>{{ result.record.name }}</h3>
      <RouterLink
        v-if="result.record.detailAvailable"
        class="structure-result-card__details"
        :to="`/metabolites/${result.record.id}`"
        :aria-label="`View details for ${result.record.name}`"
      >
        Details
      </RouterLink>
      <button
        v-else
        class="structure-result-card__details"
        type="button"
        disabled
        title="Detail page unavailable for demo record"
        :aria-label="`Detail page unavailable for ${result.record.name} demo record`"
      >
        Details
      </button>
    </header>

    <div class="structure-result-card__body">
      <dl class="structure-result-card__facts">
        <div v-if="result.record.chineseName">
          <dt>Chinese Name:</dt>
          <dd>{{ result.record.chineseName }}</dd>
        </div>
        <div v-if="result.record.formula">
          <dt>Molecular Formula:</dt>
          <dd>{{ result.record.formula }}</dd>
        </div>
        <div v-if="typeof result.record.molecularWeight === 'number'">
          <dt>Molecular Weight:</dt>
          <dd>{{ result.record.molecularWeight.toFixed(2) }}</dd>
        </div>
        <div v-if="result.record.category">
          <dt>Category:</dt>
          <dd>{{ result.record.category }}</dd>
        </div>
        <div v-if="result.record.smiles" class="structure-result-card__smiles">
          <dt>SMILES:</dt>
          <dd>{{ result.record.smiles }}</dd>
        </div>
      </dl>

      <StructureResultViewer
        :Kekule="Kekule"
        :molecule="result.molecule"
        :name="result.record.name"
      />
    </div>

    <footer class="structure-result-card__band">
      <span>{{ getMatchStatusLabel(result.match) }}</span>
      <strong v-if="typeof result.match.score === 'number'">
        Score: {{ result.match.score.toFixed(2) }}
      </strong>
      <strong v-else-if="result.match.matchedAtomCount !== undefined">
        {{ result.match.matchedAtomCount }} atoms · {{ result.match.matchedBondCount }} bonds
      </strong>
    </footer>
  </article>
</template>

<style scoped>
.structure-result-card {
  min-width: 0;
  height: 100%;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  border: 1px solid var(--structure-border, #dbe6eb);
  border-radius: 6px;
  background: #fff;
  box-shadow: none;
}

.structure-result-card__header {
  min-width: 0;
  display: grid;
  grid-template-columns: auto minmax(0, 1fr) auto;
  align-items: center;
  gap: 11px;
  padding: 11px 14px;
  border-bottom: 1px solid var(--structure-divider, #edf2f4);
  background: #f5fafc;
}

.structure-result-card__id {
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

.structure-result-card__header h3 {
  min-width: 0;
  margin: 0;
  color: var(--structure-heading, #173b4d);
  font-size: 22px;
  font-weight: 650;
  line-height: 1.3;
  overflow-wrap: anywhere;
}

.structure-result-card__details {
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

.structure-result-card__details:hover:not(:disabled) {
  background: #f1f8fb;
}

.structure-result-card__details:disabled {
  border-color: #e5edf1;
  color: #9aaab2;
  background: #fcfdfd;
  cursor: not-allowed;
}

.structure-result-card__body {
  min-width: 0;
  flex: 1;
  display: grid;
  grid-template-columns: minmax(0, 1fr) 220px;
  align-items: start;
  gap: 20px;
  padding: 16px 14px;
}

.structure-result-card__facts {
  min-width: 0;
  display: grid;
  align-content: start;
  gap: 7px;
  margin: 0;
}

.structure-result-card__facts > div {
  min-width: 0;
  display: flex;
  align-items: baseline;
  flex-wrap: wrap;
  gap: 4px;
  font-size: 14px;
  line-height: 1.55;
}

.structure-result-card__facts dt {
  color: #667f8b;
  font-weight: 500;
}

.structure-result-card__facts dd {
  min-width: 0;
  margin: 0;
  color: #294b5b;
  font-weight: 500;
  overflow-wrap: anywhere;
}

.structure-result-card__facts > .structure-result-card__smiles {
  align-items: flex-start;
}

.structure-result-card__smiles dd {
  flex: 1 1 320px;
  color: #4d6672;
  font: 13px/1.55 Consolas, "SFMono-Regular", monospace;
  overflow-wrap: anywhere;
}

.structure-result-card__body :deep(.result-viewer) {
  width: 100%;
  max-width: 220px;
  height: 184px;
  justify-self: end;
  align-self: start;
}

.structure-result-card__band {
  min-height: 40px;
  margin-top: auto;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  padding: 7px 14px;
  border-top: 1px solid var(--structure-divider, #edf2f4);
  color: #365563;
  background: #eef7fa;
  font-size: 13px;
  line-height: 1.4;
}

.structure-result-card__band span,
.structure-result-card__band strong {
  font-weight: 500;
}

.structure-result-card__band strong {
  text-align: right;
}

@media (max-width: 700px) {
  .structure-result-card__header {
    grid-template-columns: auto minmax(0, 1fr);
    padding: 12px 14px;
  }

  .structure-result-card__details {
    grid-column: 1 / -1;
    width: 100%;
    min-height: 44px;
  }

  .structure-result-card__body {
    grid-template-columns: 1fr;
    gap: 18px;
    padding: 16px 14px;
  }

  .structure-result-card__body :deep(.result-viewer) {
    max-width: none;
    height: 190px;
    justify-self: stretch;
  }

  .structure-result-card__band {
    align-items: flex-start;
    flex-wrap: wrap;
    gap: 6px 14px;
    padding-inline: 14px;
  }
}
</style>
