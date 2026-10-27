<script setup>
const props = defineProps({
  queryMz: { type: [String, Number], required: true },
  polarity: { type: String, required: true },
  adduct: { type: String, required: true },
  adductOptions: { type: Array, required: true },
  error: { type: String, default: '' },
})
defineEmits(['update:queryMz', 'update:polarity', 'update:adduct'])
</script>

<template>
  <section class="ms1-panel" aria-labelledby="ms1-query-heading">
    <div class="panel-heading">
      <span>Accurate mass query</span>
      <h2 id="ms1-query-heading">MS1 query parameters</h2>
      <p>Enter an observed precursor m/z and compare it with supported local reference ions.</p>
    </div>
    <div class="ms1-form">
      <div class="field field--wide">
        <label for="ms1-query-mz">Exact m/z</label>
        <input
          id="ms1-query-mz"
          type="number"
          min="0"
          step="0.0001"
          inputmode="decimal"
          :value="props.queryMz"
          placeholder="205.0970"
          :aria-invalid="error ? 'true' : undefined"
          :aria-describedby="error ? 'ms1-query-error' : 'ms1-query-help'"
          @input="$emit('update:queryMz', $event.target.value)"
        />
        <p id="ms1-query-help">Use a finite positive observed m/z value.</p>
        <p v-if="error" id="ms1-query-error" class="field__error" role="alert">{{ error }}</p>
      </div>
      <div class="field">
        <label for="ms1-polarity">Polarity mode</label>
        <select id="ms1-polarity" :value="polarity" @change="$emit('update:polarity', $event.target.value)">
          <option value="positive">Positive</option>
          <option value="negative">Negative</option>
        </select>
      </div>
      <div class="field">
        <label for="ms1-adduct">Adduct ion</label>
        <select id="ms1-adduct" :value="adduct" @change="$emit('update:adduct', $event.target.value)">
          <option v-for="option in adductOptions" :key="option" :value="option">{{ option }}</option>
        </select>
      </div>
    </div>
    <div class="ms1-panel__note">
      <strong>Local reference-ion matching</strong>
      <p>This demonstration compares the observed m/z directly with reference precursor m/z values stored for supported polarity/adduct pairs.</p>
    </div>
  </section>
</template>

<style scoped>
.ms1-panel { min-width: 0; padding: 20px; border: 1px solid #cfdee6; border-radius: 7px; background: #fff; box-shadow: 0 6px 18px rgba(17,76,108,.055); }
.panel-heading > span { color: var(--primary-blue); font-size: 10px; font-weight: 700; letter-spacing: .12em; text-transform: uppercase; }
.panel-heading h2 { margin-top: 4px; color: #183f51; font-size: 20px; }
.panel-heading p { margin-top: 5px; color: #748994; font-size: 11px; line-height: 1.5; }
.ms1-form { display: grid; grid-template-columns: minmax(0, 1.2fr) repeat(2, minmax(150px, .8fr)); gap: 12px; margin-top: 18px; }
.field { min-width: 0; display: grid; align-content: start; gap: 6px; }
.field label { color: #46616d; font-size: 10px; font-weight: 700; }
.field input, .field select { width: 100%; min-width: 0; min-height: 39px; padding: 7px 9px; border: 1px solid #c8dbe4; border-radius: 4px; color: #355461; background: #fff; font-size: 11px; }
.field p { color: #8a999f; font-size: 9px; line-height: 1.4; }
.field .field__error { color: #a23e3e; }
.ms1-panel__note { margin-top: 22px; padding: 13px 14px; border-left: 3px solid #70b7d2; color: #5d7580; background: #f2f8fa; }
.ms1-panel__note strong { color: #315b6d; font-size: 11px; }
.ms1-panel__note p { margin-top: 4px; font-size: 10px; line-height: 1.55; }
@media (max-width: 720px) { .ms1-form { grid-template-columns: 1fr; } }
@media (max-width: 600px) { .ms1-panel { padding: 14px; } }
</style>

