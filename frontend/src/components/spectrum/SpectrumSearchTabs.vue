<script setup>
import { ref } from 'vue'

defineProps({ modelValue: { type: String, required: true } })
const emit = defineEmits(['update:modelValue'])

const modes = Object.freeze([
  { value: 'ms1', label: 'MS1 Exact m/z', hint: 'Find candidates by accurate precursor mass' },
  { value: 'entropy', label: 'MS2 Spectral Entropy', hint: 'Compare spectra with unweighted entropy similarity' },
  { value: 'dot-product', label: 'MS2 Dot Product', hint: 'Compare normalized fragment intensities' },
])
const tabElements = ref([])

function setTabElement(element, index) {
  tabElements.value[index] = element
}

function activate(index) {
  const mode = modes[index]
  if (!mode) return
  emit('update:modelValue', mode.value)
  tabElements.value[index]?.focus()
}

function handleKeydown(event, index) {
  let nextIndex
  if (event.key === 'ArrowRight') nextIndex = (index + 1) % modes.length
  else if (event.key === 'ArrowLeft') nextIndex = (index - 1 + modes.length) % modes.length
  else if (event.key === 'Home') nextIndex = 0
  else if (event.key === 'End') nextIndex = modes.length - 1
  else return
  event.preventDefault()
  activate(nextIndex)
}
</script>

<template>
  <section class="mode-card" aria-labelledby="spectrum-mode-heading">
    <div class="mode-card__intro">
      <span>Search mode</span>
      <h2 id="spectrum-mode-heading">Choose a spectral workflow</h2>
    </div>
    <div class="mode-tabs" role="tablist" aria-label="Spectrum search mode">
      <button
        v-for="(mode, index) in modes"
        :id="`spectrum-tab-${mode.value}`"
        :key="mode.value"
        :ref="(element) => setTabElement(element, index)"
        class="mode-tab"
        :class="{ 'mode-tab--active': modelValue === mode.value }"
        type="button"
        role="tab"
        aria-controls="spectrum-search-panel"
        :aria-selected="modelValue === mode.value"
        :tabindex="modelValue === mode.value ? 0 : -1"
        @click="emit('update:modelValue', mode.value)"
        @keydown="handleKeydown($event, index)"
      >
        <strong>{{ mode.label }}</strong>
        <span>{{ mode.hint }}</span>
      </button>
    </div>
  </section>
</template>

<style scoped>
.mode-card { min-width: 0; display: grid; grid-template-columns: minmax(220px, .72fr) minmax(0, 2.28fr); margin-bottom: 18px; overflow: hidden; border: 1px solid #cfdee6; border-radius: 7px; background: #fff; box-shadow: 0 5px 16px rgba(17, 76, 108, .05); }
.mode-card__intro { padding: 17px 19px; border-right: 1px solid #dce8ed; background: #f4f9fb; }
.mode-card__intro span { color: var(--primary-blue); font-size: 10px; font-weight: 700; letter-spacing: .13em; text-transform: uppercase; }
.mode-card__intro h2 { margin-top: 5px; color: #244756; font-size: 15px; line-height: 1.35; }
.mode-tabs { min-width: 0; display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); }
.mode-tab { min-width: 0; min-height: 76px; padding: 12px 16px; border: 0; border-bottom: 3px solid transparent; color: #647b87; background: #fff; text-align: left; cursor: pointer; }
.mode-tab + .mode-tab { border-left: 1px solid #e2ebef; }
.mode-tab strong, .mode-tab span { display: block; }
.mode-tab strong { color: #2e5262; font-size: 13px; }
.mode-tab span { margin-top: 5px; font-size: 10px; line-height: 1.4; }
.mode-tab:hover { background: #f7fbfd; }
.mode-tab:focus-visible { position: relative; z-index: 1; outline-color: var(--primary-blue); }
.mode-tab--active { border-bottom-color: var(--primary-blue); background: #eef8fc; }
.mode-tab--active strong { color: #006cab; }
@media (max-width: 767px) {
  .mode-card { grid-template-columns: 1fr; }
  .mode-card__intro { padding: 13px 15px; border-right: 0; border-bottom: 1px solid #dce8ed; }
  .mode-tabs { grid-template-columns: 1fr; }
  .mode-tab { min-height: 0; padding: 12px 15px; border-bottom: 0; border-left: 3px solid transparent; }
  .mode-tab + .mode-tab { border-top: 1px solid #e2ebef; border-left-width: 3px; }
  .mode-tab--active { border-left-color: var(--primary-blue) !important; }
}
</style>
