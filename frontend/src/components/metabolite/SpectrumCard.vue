<script setup>
import { formatDetailLabel } from '../../utils/detailFieldPresentation'
import DetailFieldValue from './DetailFieldValue.vue'
import MassSpectrumChart from './MassSpectrumChart.vue'

const props = defineProps({ spectrum: { type: Object, required: true } })
</script>

<template>
  <article class="spectrum-card">
    <h3>
      <svg viewBox="0 0 20 20" aria-hidden="true"><path d="M3 16V9m3 7V5m3 11v-4m3 4V3m3 13V8m2 8H2" /></svg>
      {{ props.spectrum.title }}
    </h3>
    <MassSpectrumChart :peaks="props.spectrum.peaks" :color="props.spectrum.color" :title="props.spectrum.title" />
    <dl class="spectrum-card__meta">
      <div v-for="item in props.spectrum.metadata" :key="item.label">
        <dt :title="formatDetailLabel(item.label)">{{ formatDetailLabel(item.label) }}</dt><dd><DetailFieldValue :value="item.value" /></dd>
      </div>
    </dl>
  </article>
</template>

<style scoped>
.spectrum-card {
  min-width: 0;
  height: 100%;
  border: 1px solid var(--detail-border, #dce8ef);
  border-radius: 6px;
  overflow: hidden;
  background: #fff;
}

.spectrum-card h3 {
  min-height: 48px;
  padding: 9px 14px;
  border-bottom: 1px solid var(--detail-border, #dce8ef);
  display: flex;
  align-items: center;
  gap: 9px;
  color: #334d59;
  background: #f8fbfd;
  font-size: 16px;
  font-weight: 600;
}

.spectrum-card h3 svg {
  width: 18px; height: 18px; fill: none; stroke: #47778b; stroke-width: 1.4; stroke-linecap: round;
}

.spectrum-card__meta {
  margin: 0;
  display: grid;
  grid-template-columns: minmax(0, 1fr);
  border-top: 1px solid #dfe7eb;
}

.spectrum-card__meta > div {
  min-width: 0;
  min-height: 32px;
  display: grid;
  grid-template-columns: 132px minmax(0, 1fr);
}

.spectrum-card__meta dt,
.spectrum-card__meta dd {
  min-width: 0;
  margin: 0;
  padding: 7px 10px;
  border-right: 1px solid #e2e8ec;
  border-bottom: 1px solid #e2e8ec;
  font-size: var(--detail-font-field-value, 13px);
  line-height: 1.4;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.spectrum-card__meta dt { color: #718899; background: #f5f9fb; font-size: var(--detail-font-field-label, 12px); font-weight: 600; }
.spectrum-card__meta dd { color: #16324f; font-weight: 500; }

@media (max-width: 580px) {
  .spectrum-card__meta { grid-template-columns: 1fr; }
  .spectrum-card__meta > div { grid-template-columns: 118px minmax(0, 1fr); }
}
</style>

