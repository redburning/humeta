<script setup>
defineProps({
  state: { type: String, default: 'idle' },
})

const emit = defineEmits(['clear-filters', 'load-example'])
</script>

<template>
  <div
    class="result-state"
    :class="`result-state--${state}`"
    :role="state === 'error' ? 'alert' : 'status'"
    :aria-busy="state === 'searching' ? 'true' : undefined"
  >
    <span class="result-state__icon" aria-hidden="true">
      {{ state === 'error' ? '!' : state === 'searching' ? '…' : '⌬' }}
    </span>
    <h3 v-if="state === 'searching'">Searching local demonstration data...</h3>
    <h3 v-else-if="state === 'empty'">No matching structures were found in the local demonstration dataset.</h3>
    <h3 v-else-if="state === 'error'">Structure search could not be completed.</h3>
    <h3 v-else>Draw or import a structure, choose a search mode, and start searching.</h3>
    <p v-if="state !== 'searching'">All drawing and comparison stays in this browser session.</p>

    <div v-if="state === 'empty' || state === 'error'" class="result-state__actions">
      <button type="button" @click="emit('clear-filters')">Clear filters</button>
      <button type="button" @click="emit('load-example')">Load Tryptophan Example</button>
    </div>
  </div>
</template>

<style scoped>
.result-state {
  min-height: 180px;
  display: grid;
  place-content: center;
  justify-items: center;
  gap: 10px;
  padding: 28px 24px;
  color: var(--structure-label, #5d7c8a);
  background: transparent;
  text-align: center;
}

.result-state__icon {
  width: 32px;
  height: 32px;
  display: grid;
  place-items: center;
  border: 1px solid #d7e2e7;
  border-radius: 50%;
  color: #8aa0aa;
  background: #fafcfd;
  font-size: 16px;
}

.result-state h3 {
  max-width: 560px;
  color: #395966;
  font-size: 16px;
  font-weight: 600;
  line-height: 1.5;
}

.result-state p {
  color: #718893;
  font-size: 13px;
  line-height: 1.5;
}

.result-state--idle,
.result-state--empty {
  min-height: 160px;
  padding: 20px 24px;
}

.result-state--error {
  background: transparent;
}

.result-state--error .result-state__icon,
.result-state--error h3 {
  color: #a03f3f;
}

.result-state__actions {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 8px;
  margin-top: 5px;
}

.result-state__actions button {
  min-height: 38px;
  padding: 7px 11px;
  border: 1px solid #91bfd3;
  border-radius: 4px;
  color: #0875ad;
  background: #fff;
  font-size: 13px;
  font-weight: 700;
  cursor: pointer;
}
</style>
