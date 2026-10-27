<script setup>
const props = defineProps({
  mode: { type: String, required: true },
  compareCharge: { type: Boolean, required: true },
  compareMass: { type: Boolean, required: true },
  similarityThreshold: { type: Number, required: true },
  sortOrder: { type: String, required: true },
  pageSize: { type: Number, required: true },
})

const emit = defineEmits([
  'update:compareCharge',
  'update:compareMass',
  'update:similarityThreshold',
  'update:sortOrder',
  'update:pageSize',
])

function emitNumber(eventName, event) {
  emit(eventName, Number(event.target.value))
}
</script>

<template>
  <section
    :id="`structure-panel-${mode}`"
    class="options-card"
    role="tabpanel"
    :aria-labelledby="`structure-tab-${mode}`"
  >
    <h2>{{ mode === 'similarity' ? 'Demonstration score settings' : 'Structure comparison settings' }}</h2>

    <div v-if="mode === 'similarity'" class="option-stack">
      <div class="threshold-control">
        <div>
          <label for="similarity-threshold">Similarity threshold</label>
          <output for="similarity-threshold">{{ similarityThreshold.toFixed(2) }}</output>
        </div>
        <input
          id="similarity-threshold"
          type="range"
          min="0.5"
          max="1"
          step="0.01"
          :value="similarityThreshold"
          aria-valuemin="0.5"
          aria-valuemax="1"
          :aria-valuenow="similarityThreshold"
          @input="emitNumber('update:similarityThreshold', $event)"
        >
      </div>

      <label class="select-control" for="similarity-sort">
        <span>Sort order</span>
        <select id="similarity-sort" :value="sortOrder" @change="emit('update:sortOrder', $event.target.value)">
          <option value="relevance">Match relevance</option>
          <option value="name">Name A-Z</option>
          <option value="molecularWeight">Molecular weight</option>
        </select>
      </label>
    </div>

    <div v-else class="option-stack">
      <label class="check-control" for="match-charge">
        <input
          id="match-charge"
          type="checkbox"
          :checked="compareCharge"
          @change="emit('update:compareCharge', $event.target.checked)"
        >
        <span>
          <strong>Match charge</strong>
          <small>Compare formal charge during local matching.</small>
        </span>
      </label>

      <label class="check-control" for="match-isotope">
        <input
          id="match-isotope"
          type="checkbox"
          :checked="compareMass"
          @change="emit('update:compareMass', $event.target.checked)"
        >
        <span>
          <strong>Match isotope</strong>
          <small>Compare atom mass numbers when present.</small>
        </span>
      </label>

    </div>

    <label class="select-control select-control--page-size" for="structure-page-size">
      <span>Result page size</span>
      <select id="structure-page-size" :value="pageSize" @change="emitNumber('update:pageSize', $event)">
        <option :value="4">4</option>
        <option :value="6">6</option>
        <option :value="8">8</option>
      </select>
    </label>
  </section>
</template>

<style scoped>
.options-card {
  min-width: 0;
  padding: 16px;
  border: 1px solid var(--structure-border, #d4e2e9);
  border-radius: 6px;
  background: #fff;
  box-shadow: none;
}

.options-card h2 {
  margin-bottom: 12px;
  color: var(--structure-heading, #173b4d);
  font-size: 17px;
  font-weight: 600;
  line-height: 1.4;
}

.option-stack {
  display: grid;
  gap: 12px;
}

.check-control {
  display: flex;
  align-items: flex-start;
  gap: 8px;
  cursor: pointer;
}

.check-control input {
  width: 16px;
  height: 16px;
  margin-top: 1px;
  accent-color: var(--primary-blue);
}

.check-control strong,
.check-control small {
  display: block;
}

.check-control strong,
.threshold-control label,
.select-control > span {
  color: #344f5d;
  font-size: 13px;
  font-weight: 600;
}

.check-control small {
  margin-top: 4px;
  color: #6b8290;
  font-size: 13px;
  line-height: 1.5;
}

.threshold-control > div {
  display: flex;
  justify-content: space-between;
  gap: 12px;
}

.threshold-control output {
  color: #006da9;
  font-size: 13px;
  font-weight: 700;
}

.threshold-control input {
  width: 100%;
  margin-top: 8px;
  accent-color: var(--primary-blue);
}

.select-control {
  display: grid;
  gap: 8px;
}

.select-control select {
  width: 100%;
  min-height: 36px;
  padding: 8px;
  border: 1px solid #cadce5;
  border-radius: 4px;
  color: #324f5c;
  background: #fbfdfe;
  font-size: 13px;
}

.select-control--page-size {
  margin-top: 12px;
  padding-top: 12px;
  border-top: 1px solid var(--structure-divider, #edf2f4);
}

@media (max-width: 767px) {
  .check-control,
  .threshold-control input,
  .select-control select {
    min-height: 40px;
  }
}

</style>
