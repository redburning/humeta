<script setup>
defineProps({
  mode: { type: String, required: true },
  summary: { type: Object, required: true },
  metadata: { type: Object, default: () => ({}) },
})
</script>

<template>
  <section class="summary-card" aria-labelledby="query-summary-heading">
    <div class="summary-card__heading"><span>Query summary</span><h2 id="query-summary-heading">Current local query</h2></div>
    <dl v-if="mode === 'ms1'" class="summary-list">
      <div><dt>Query m/z</dt><dd>{{ summary.queryMz || '—' }}</dd></div>
      <div><dt>Polarity</dt><dd>{{ summary.polarity }}</dd></div>
      <div><dt>Adduct</dt><dd>{{ summary.adduct }}</dd></div>
      <div><dt>Tolerance</dt><dd>{{ summary.tolerance }}</dd></div>
      <div class="summary-list__wide"><dt>Search window</dt><dd>{{ summary.searchWindow }}</dd></div>
    </dl>
    <dl v-else class="summary-list">
      <div><dt>Peak count</dt><dd>{{ summary.peakCount || 0 }}</dd></div>
      <div><dt>Base peak</dt><dd>{{ summary.basePeakMz || '—' }}</dd></div>
      <div><dt>Precursor m/z</dt><dd>{{ summary.precursorMz || '—' }}</dd></div>
      <div><dt>Ion mode</dt><dd>{{ summary.ionMode }}</dd></div>
      <div><dt>Adduct</dt><dd>{{ summary.adduct }}</dd></div>
      <div><dt>Maximum m/z</dt><dd>{{ summary.maximumMz || '—' }}</dd></div>
      <div class="summary-list__wide"><dt>Total raw intensity</dt><dd>{{ summary.totalIntensity || '—' }}</dd></div>
    </dl>
    <div v-if="metadata.fileName || metadata.title" class="metadata">
      <h3>Input metadata</h3>
      <p v-if="metadata.fileName"><span>File</span>{{ metadata.fileName }}</p>
      <p v-if="metadata.format"><span>Format</span>{{ metadata.format.toUpperCase() }}</p>
      <p v-if="metadata.title"><span>Title</span>{{ metadata.title }}</p>
      <p v-if="metadata.charge"><span>Charge</span>{{ metadata.charge }}</p>
    </div>
  </section>
</template>

<style scoped>
.summary-card { min-width: 0; padding: 17px; border: 1px solid #cfdee6; border-radius: 7px; background: #fff; box-shadow: 0 5px 15px rgba(18,74,103,.045); }
.summary-card__heading { margin-bottom: 11px; }
.summary-card__heading span { color: var(--primary-blue); font-size: 9px; font-weight: 700; letter-spacing: .12em; text-transform: uppercase; }
.summary-card__heading h2 { margin-top: 4px; color: #2c5363; font-size: 16px; }
.summary-list { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); border-top: 1px solid #e2ebef; border-left: 1px solid #e2ebef; }
.summary-list div { min-width: 0; padding: 8px; border-right: 1px solid #e2ebef; border-bottom: 1px solid #e2ebef; }
.summary-list__wide { grid-column: 1 / -1; }
.summary-list dt { color: #85949b; font-size: 8px; text-transform: uppercase; }
.summary-list dd { margin: 3px 0 0; color: #2e5666; font-size: 10px; font-weight: 700; overflow-wrap: anywhere; }
.metadata { margin-top: 12px; padding-top: 10px; border-top: 1px solid #e1eaee; }
.metadata h3 { color: #45636f; font-size: 10px; }
.metadata p { display: grid; grid-template-columns: 55px minmax(0, 1fr); gap: 7px; margin-top: 6px; color: #526b77; font-size: 9px; overflow-wrap: anywhere; }
.metadata span { color: #8a989e; }
</style>

