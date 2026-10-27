<script setup>
import MirrorSpectrumChart from './MirrorSpectrumChart.vue'

defineProps({
  result: { type: Object, required: true },
  rank: { type: Number, required: true },
  expanded: { type: Boolean, default: false },
})
defineEmits(['compare', 'close-compare', 'use-query'])
</script>

<template>
  <article class="result-card">
    <header class="result-card__header">
      <span class="result-card__rank">#{{ rank }}</span>
      <div class="result-card__identity"><strong>{{ result.record.name }}</strong><small>{{ result.record.nameZh }} · {{ result.record.id }}</small></div>
      <div class="result-card__score"><small>{{ result.algorithm === 'entropy' ? 'Unweighted entropy similarity' : 'Dot-product score' }}</small><strong>{{ result.score.toFixed(4) }}</strong></div>
    </header>
    <div class="result-card__body">
      <dl class="facts">
        <div><dt>Formula</dt><dd>{{ result.record.formula }}</dd></div><div><dt>Precursor m/z</dt><dd>{{ result.record.precursorMz.toFixed(4) }}</dd></div><div><dt>Adduct</dt><dd>{{ result.record.adduct }}</dd></div><div><dt>Ion mode</dt><dd>{{ result.record.polarity }}</dd></div><div><dt>Collision energy</dt><dd>{{ result.record.collisionEnergy }}</dd></div><div><dt>Instrument</dt><dd>{{ result.record.instrument }}</dd></div><div><dt>Library</dt><dd>{{ result.record.library }}</dd></div><div><dt>Matched peaks</dt><dd>{{ result.matchedPairs.length }}</dd></div><div><dt>Precursor delta</dt><dd>{{ result.massError.deltaPpm.toFixed(2) }} ppm</dd></div>
      </dl>
    </div>
    <footer class="result-card__actions">
      <button type="button" :aria-expanded="expanded" @click="$emit(expanded ? 'close-compare' : 'compare')">{{ expanded ? 'Close comparison' : 'Compare spectrum' }}</button>
      <button type="button" @click="$emit('use-query')">Use as query</button>
      <RouterLink v-if="result.record.detailsAvailable" :to="`/metabolites/${result.record.id}`">Details</RouterLink>
      <button v-else type="button" disabled title="Details unavailable">Details unavailable</button>
    </footer>
    <MirrorSpectrumChart v-if="expanded" :result="result" @close="$emit('close-compare')" />
  </article>
</template>

<style scoped>
.result-card { min-width: 0; overflow: hidden; border: 1px solid #cfdee6; border-radius: 6px; background: #fff; box-shadow: 0 4px 13px rgba(20,77,105,.055); }
.result-card__header { min-width: 0; display: grid; grid-template-columns: auto minmax(0, 1fr) minmax(150px, auto); align-items: center; gap: 10px; padding: 11px 13px; border-bottom: 1px solid #dce8ed; background: #f2f8fb; }
.result-card__rank { width: 32px; height: 32px; display: grid; place-items: center; border-radius: 50%; color: #fff; background: var(--primary-blue); font-size: 10px; font-weight: 700; }
.result-card__identity { min-width: 0; }
.result-card__identity strong, .result-card__identity small { display: block; }
.result-card__identity strong { overflow: hidden; color: #135c87; font-size: 14px; text-overflow: ellipsis; white-space: nowrap; }
.result-card__identity small { margin-top: 2px; color: #728792; font-size: 9px; }
.result-card__score { min-width: 0; text-align: right; }
.result-card__score small, .result-card__score strong { display: block; }
.result-card__score small { color: #738892; font-size: 8px; }
.result-card__score strong { margin-top: 2px; color: #24745c; font-size: 18px; }
.result-card__body { padding: 12px 13px; }
.facts { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 1px; background: #e1eaee; }
.facts div { min-width: 0; padding: 7px 8px; background: #fafcfd; }
.facts dt { color: #85949b; font-size: 8px; text-transform: uppercase; }
.facts dd { margin: 3px 0 0; color: #355662; font-size: 9px; font-weight: 700; overflow-wrap: anywhere; }
.result-card__actions { display: flex; flex-wrap: wrap; justify-content: flex-end; gap: 7px; padding: 9px 13px; border-top: 1px solid #e1eaee; }
.result-card__actions button, .result-card__actions a { min-height: 31px; display: inline-grid; place-items: center; padding: 6px 10px; border: 1px solid #77b5d2; border-radius: 3px; color: #0576af; background: #fff; font-size: 9px; font-weight: 700; text-decoration: none; cursor: pointer; }
.result-card__actions button:disabled { color: #8799a1; border-color: #d0dce1; background: #f6f8f9; cursor: not-allowed; }
@media (max-width: 700px) {
  .result-card__header { grid-template-columns: auto minmax(0, 1fr); }
  .result-card__score { grid-column: 1 / -1; padding-top: 7px; border-top: 1px solid #dce8ed; text-align: left; }
  .facts { grid-template-columns: repeat(2, minmax(0, 1fr)); }
  .result-card__actions { justify-content: stretch; }
  .result-card__actions button, .result-card__actions a { flex: 1 1 120px; }
}
@media (max-width: 400px) { .facts { grid-template-columns: 1fr; } }
</style>

