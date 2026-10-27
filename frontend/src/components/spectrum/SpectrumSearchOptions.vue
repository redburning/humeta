<script setup>
import { computed, ref } from 'vue'
import { SPECTRUM_LIBRARY_NAME } from '../../data/spectrumSearchData'

const props = defineProps({
  mode: { type: String, required: true },
  modelValue: { type: Object, required: true },
  adductOptions: { type: Array, default: () => [] },
  errors: { type: Object, default: () => ({}) },
})
const emit = defineEmits(['update:modelValue'])
const advancedOpen = ref(false)
const isMs1 = computed(() => props.mode === 'ms1')

function update(field, value) {
  emit('update:modelValue', { ...props.modelValue, [field]: value })
}
</script>

<template>
  <section class="options-card" aria-labelledby="spectrum-options-heading">
    <div class="options-card__heading">
      <span>Search options</span>
      <h2 id="spectrum-options-heading">{{ isMs1 ? 'Mass window settings' : 'Spectral match settings' }}</h2>
    </div>

    <template v-if="isMs1">
      <div class="field">
        <label for="ms1-tolerance">Mass tolerance</label>
        <div class="field__split">
          <input id="ms1-tolerance" type="number" min="0" step="0.01" :value="modelValue.tolerance" :aria-invalid="errors.tolerance ? 'true' : undefined" :aria-describedby="errors.tolerance ? 'ms1-tolerance-error' : undefined" @input="update('tolerance', $event.target.value)" />
          <select aria-label="Mass tolerance unit" :value="modelValue.toleranceUnit" @change="update('toleranceUnit', $event.target.value)"><option value="ppm">ppm</option><option value="Da">Da</option></select>
        </div>
        <p v-if="errors.tolerance" id="ms1-tolerance-error" class="field__error">{{ errors.tolerance }}</p>
      </div>
      <div class="field">
        <label for="ms1-sort">Sort results</label>
        <select id="ms1-sort" :value="modelValue.sortOrder" @change="update('sortOrder', $event.target.value)">
          <option value="mass-error">Mass error</option><option value="name">Name A–Z</option><option value="reference-mz">Reference m/z</option>
        </select>
      </div>
      <div class="field">
        <label for="ms1-page-size">Result page size</label>
        <select id="ms1-page-size" :value="modelValue.pageSize" @change="update('pageSize', Number($event.target.value))"><option :value="4">4</option><option :value="6">6</option><option :value="8">8</option></select>
      </div>
    </template>

    <template v-else>
      <div class="field">
        <label for="ms2-precursor">Precursor m/z</label>
        <input id="ms2-precursor" type="number" min="0" step="0.0001" :value="modelValue.precursorMz" :aria-invalid="errors.precursorMz ? 'true' : undefined" :aria-describedby="errors.precursorMz ? 'ms2-precursor-error' : undefined" @input="update('precursorMz', $event.target.value)" />
        <p v-if="errors.precursorMz" id="ms2-precursor-error" class="field__error">{{ errors.precursorMz }}</p>
      </div>
      <div class="field-row">
        <div class="field">
          <label for="ms2-ion-mode">Ion mode</label>
          <select id="ms2-ion-mode" :value="modelValue.ionMode" @change="update('ionMode', $event.target.value)"><option value="positive">Positive</option><option value="negative">Negative</option></select>
        </div>
        <div class="field">
          <label for="ms2-adduct">Adduct</label>
          <select id="ms2-adduct" :value="modelValue.adduct" @change="update('adduct', $event.target.value)"><option v-for="option in adductOptions" :key="option" :value="option">{{ option }}</option></select>
        </div>
      </div>
      <div class="field">
        <label for="precursor-tolerance">Precursor tolerance</label>
        <div class="field__split"><input id="precursor-tolerance" type="number" min="0" step="0.01" :value="modelValue.precursorTolerance" :aria-invalid="errors.precursorTolerance ? 'true' : undefined" :aria-describedby="errors.precursorTolerance ? 'precursor-tolerance-error' : undefined" @input="update('precursorTolerance', $event.target.value)" /><select aria-label="Precursor tolerance unit" :value="modelValue.precursorToleranceUnit" @change="update('precursorToleranceUnit', $event.target.value)"><option value="ppm">ppm</option><option value="Da">Da</option></select></div>
        <p v-if="errors.precursorTolerance" id="precursor-tolerance-error" class="field__error">{{ errors.precursorTolerance }}</p>
      </div>
      <div class="field">
        <label for="fragment-tolerance">Fragment tolerance</label>
        <div class="field__split"><input id="fragment-tolerance" type="number" min="0" step="0.001" :value="modelValue.fragmentTolerance" :aria-invalid="errors.fragmentTolerance ? 'true' : undefined" :aria-describedby="errors.fragmentTolerance ? 'fragment-tolerance-error' : undefined" @input="update('fragmentTolerance', $event.target.value)" /><select aria-label="Fragment tolerance unit" :value="modelValue.fragmentToleranceUnit" @change="update('fragmentToleranceUnit', $event.target.value)"><option value="Da">Da</option><option value="ppm">ppm</option></select></div>
        <p v-if="errors.fragmentTolerance" id="fragment-tolerance-error" class="field__error">{{ errors.fragmentTolerance }}</p>
      </div>
      <div class="field-row">
        <div class="field"><label for="minimum-matches">Minimum matched peaks</label><input id="minimum-matches" type="number" min="1" step="1" :value="modelValue.minimumMatchedPeaks" :aria-invalid="errors.minimumMatchedPeaks ? 'true' : undefined" :aria-describedby="errors.minimumMatchedPeaks ? 'minimum-matches-error' : undefined" @input="update('minimumMatchedPeaks', $event.target.value)" /><p v-if="errors.minimumMatchedPeaks" id="minimum-matches-error" class="field__error">{{ errors.minimumMatchedPeaks }}</p></div>
        <div class="field"><label for="minimum-score">Minimum score</label><input id="minimum-score" type="number" min="0" max="1" step="0.01" :value="modelValue.minimumScore" :aria-invalid="errors.minimumScore ? 'true' : undefined" :aria-describedby="errors.minimumScore ? 'minimum-score-error' : undefined" @input="update('minimumScore', $event.target.value)" /><p v-if="errors.minimumScore" id="minimum-score-error" class="field__error">{{ errors.minimumScore }}</p></div>
      </div>
      <div class="field"><label for="ms-library">MS Library</label><select id="ms-library" :value="modelValue.library" @change="update('library', $event.target.value)"><option :value="SPECTRUM_LIBRARY_NAME">{{ SPECTRUM_LIBRARY_NAME }}</option></select></div>
      <div class="field-row">
        <div class="field"><label for="ms2-sort">Sort results</label><select id="ms2-sort" :value="modelValue.sortOrder" @change="update('sortOrder', $event.target.value)"><option value="relevance">Match relevance</option><option value="name">Name A–Z</option><option value="precursor-error">Precursor error</option><option value="matched-peaks">Matched peaks</option></select></div>
        <div class="field"><label for="ms2-page-size">Result page size</label><select id="ms2-page-size" :value="modelValue.pageSize" @change="update('pageSize', Number($event.target.value))"><option :value="4">4</option><option :value="6">6</option><option :value="8">8</option></select></div>
      </div>
      <button class="advanced-toggle" type="button" :aria-expanded="advancedOpen" aria-controls="spectrum-advanced-options" @click="advancedOpen = !advancedOpen">Advanced options <span aria-hidden="true">{{ advancedOpen ? '−' : '+' }}</span></button>
      <div v-show="advancedOpen" id="spectrum-advanced-options" class="advanced-options">
        <div class="field-row">
          <div class="field"><label for="minimum-intensity">Minimum relative intensity (%)</label><input id="minimum-intensity" type="number" min="0" max="100" step="0.1" :value="modelValue.minimumRelativeIntensity" :aria-invalid="errors.minimumRelativeIntensity ? 'true' : undefined" :aria-describedby="errors.minimumRelativeIntensity ? 'minimum-intensity-error' : undefined" @input="update('minimumRelativeIntensity', $event.target.value)" /><p v-if="errors.minimumRelativeIntensity" id="minimum-intensity-error" class="field__error">{{ errors.minimumRelativeIntensity }}</p></div>
          <div class="field"><label for="maximum-peaks">Maximum peak count</label><input id="maximum-peaks" type="number" min="2" step="1" :value="modelValue.maximumPeakCount" :aria-invalid="errors.maximumPeakCount ? 'true' : undefined" :aria-describedby="errors.maximumPeakCount ? 'maximum-peaks-error' : undefined" @input="update('maximumPeakCount', $event.target.value)" /><p v-if="errors.maximumPeakCount" id="maximum-peaks-error" class="field__error">{{ errors.maximumPeakCount }}</p></div>
        </div>
        <label class="check-row"><input type="checkbox" :checked="modelValue.removePrecursorPeak" @change="update('removePrecursorPeak', $event.target.checked)" />Remove precursor peak</label>
        <label class="check-row"><input type="checkbox" :checked="modelValue.normalizeSpectrum" @change="update('normalizeSpectrum', $event.target.checked)" />Normalize spectrum before scoring</label>
      </div>
      <p class="algorithm-note" v-if="mode === 'entropy'"><strong>Unweighted entropy similarity</strong>This front-end demonstration uses unweighted entropy similarity. It is not a production spectral-library identification service.</p>
      <p class="algorithm-note" v-else><strong>Dot-product score</strong>Cosine-style scoring uses all cleaned query and reference intensities. Scores are deterministic and bounded from 0 to 1.</p>
    </template>
  </section>
</template>

<style scoped>
.options-card { min-width: 0; padding: 17px; border: 1px solid #cfdee6; border-radius: 7px; background: #fff; box-shadow: 0 5px 15px rgba(18,74,103,.045); }
.options-card__heading { margin-bottom: 13px; padding-bottom: 11px; border-bottom: 1px solid #e1eaee; }
.options-card__heading span { color: var(--primary-blue); font-size: 9px; font-weight: 700; letter-spacing: .12em; text-transform: uppercase; }
.options-card__heading h2 { margin-top: 4px; color: #2c5363; font-size: 16px; }
.field { min-width: 0; display: grid; gap: 5px; margin-top: 11px; }
.field-row { min-width: 0; display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 8px; }
.field label { color: #5b717c; font-size: 9px; font-weight: 700; }
.field input, .field select { width: 100%; min-width: 0; min-height: 36px; padding: 6px 8px; border: 1px solid #c6d9e2; border-radius: 4px; color: #355461; background: #fff; font-size: 10px; }
.field__split { min-width: 0; display: grid; grid-template-columns: minmax(0, 1fr) 82px; }
.field__split input { border-radius: 4px 0 0 4px; }
.field__split select { border-left: 0; border-radius: 0 4px 4px 0; }
.field__error { color: #a23e3e; font-size: 9px; line-height: 1.4; }
.advanced-toggle { width: 100%; min-height: 36px; display: flex; justify-content: space-between; align-items: center; margin-top: 14px; padding: 7px 9px; border: 0; border-top: 1px solid #e1eaee; border-bottom: 1px solid #e1eaee; color: #41616f; background: #f8fbfc; font-size: 10px; font-weight: 700; cursor: pointer; }
.advanced-options { padding-top: 3px; }
.check-row { display: flex; align-items: flex-start; gap: 7px; margin-top: 10px; color: #526b77; font-size: 10px; line-height: 1.4; }
.check-row input { width: 15px; height: 15px; margin: 0; accent-color: var(--primary-blue); }
.algorithm-note { display: grid; gap: 3px; margin-top: 13px; padding: 9px 10px; border-left: 2px solid #6ab4d2; color: #6a808a; background: #f0f7fa; font-size: 9px; line-height: 1.5; }
.algorithm-note strong { color: #2b6077; }
@media (max-width: 430px) { .field-row { grid-template-columns: 1fr; } }
</style>
