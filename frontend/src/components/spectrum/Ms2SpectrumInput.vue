<script setup>
import { ref } from 'vue'
import SpectrumChart from './SpectrumChart.vue'
import SpectrumFileDropzone from './SpectrumFileDropzone.vue'
import SpectrumPastePanel from './SpectrumPastePanel.vue'

defineProps({
  inputMethod: { type: String, required: true },
  peakText: { type: String, required: true },
  errors: { type: Array, default: () => [] },
  displayPeaks: { type: Array, default: () => [] },
})
const emit = defineEmits(['update:inputMethod', 'update:peakText', 'load-example', 'parse', 'clear', 'file'])
const inputTabElements = ref([])
const inputMethods = ['paste', 'file']

function setInputTab(element, index) {
  inputTabElements.value[index] = element
}

function activateInputMethod(index) {
  emit('update:inputMethod', inputMethods[index])
  inputTabElements.value[index]?.focus()
}

function handleInputTabKeydown(event, index) {
  let nextIndex
  if (event.key === 'ArrowRight') nextIndex = (index + 1) % inputMethods.length
  else if (event.key === 'ArrowLeft') nextIndex = (index - 1 + inputMethods.length) % inputMethods.length
  else if (event.key === 'Home') nextIndex = 0
  else if (event.key === 'End') nextIndex = inputMethods.length - 1
  else return
  event.preventDefault()
  activateInputMethod(nextIndex)
}
</script>

<template>
  <section class="ms2-input" aria-labelledby="ms2-input-heading">
    <div class="panel-heading">
      <span>Spectrum query</span>
      <h2 id="ms2-input-heading">Local MS/MS input</h2>
      <p>Paste a peak list or read one local file. Your spectrum remains in this browser session.</p>
    </div>

    <div class="input-tabs" role="tablist" aria-label="Spectrum input method">
      <button
        id="spectrum-input-paste-tab"
        :ref="(element) => setInputTab(element, 0)"
        type="button"
        role="tab"
        aria-controls="spectrum-input-paste-panel"
        :aria-selected="inputMethod === 'paste'"
        :tabindex="inputMethod === 'paste' ? 0 : -1"
        :class="{ 'input-tabs__active': inputMethod === 'paste' }"
        @click="emit('update:inputMethod', 'paste')"
        @keydown="handleInputTabKeydown($event, 0)"
      >Paste Peaks</button>
      <button
        id="spectrum-input-file-tab"
        :ref="(element) => setInputTab(element, 1)"
        type="button"
        role="tab"
        aria-controls="spectrum-input-file-panel"
        :aria-selected="inputMethod === 'file'"
        :tabindex="inputMethod === 'file' ? 0 : -1"
        :class="{ 'input-tabs__active': inputMethod === 'file' }"
        @click="emit('update:inputMethod', 'file')"
        @keydown="handleInputTabKeydown($event, 1)"
      >File Upload</button>
    </div>

    <div v-if="inputMethod === 'paste'" id="spectrum-input-paste-panel" class="input-panel" role="tabpanel" aria-labelledby="spectrum-input-paste-tab">
      <SpectrumPastePanel
        :model-value="peakText"
        :errors="errors"
        @update:model-value="$emit('update:peakText', $event)"
        @load-example="$emit('load-example')"
        @parse="$emit('parse')"
        @clear="$emit('clear')"
      />
    </div>
    <div v-else id="spectrum-input-file-panel" class="input-panel" role="tabpanel" aria-labelledby="spectrum-input-file-tab">
      <SpectrumFileDropzone :has-error="errors.length > 0" @select="$emit('file', $event)" />
      <ul v-if="errors.length" id="spectrum-file-errors" class="file-errors" role="alert">
        <li v-for="item in errors" :key="`${item.line}-${item.message}`">{{ item.message }}</li>
      </ul>
    </div>

    <SpectrumChart v-if="displayPeaks.length" :peaks="displayPeaks" />
    <div v-else class="chart-placeholder">
      <span aria-hidden="true">⌁</span>
      <strong>Paste a peak list or import a local spectrum file.</strong>
      <p>Your spectrum remains in this browser session.</p>
    </div>
  </section>
</template>

<style scoped>
.ms2-input { min-width: 0; padding: 20px; border: 1px solid #cfdee6; border-radius: 7px; background: #fff; box-shadow: 0 6px 18px rgba(17,76,108,.055); }
.panel-heading > span { color: var(--primary-blue); font-size: 10px; font-weight: 700; letter-spacing: .12em; text-transform: uppercase; }
.panel-heading h2 { margin-top: 4px; color: #183f51; font-size: 20px; }
.panel-heading p { margin-top: 5px; color: #748994; font-size: 11px; line-height: 1.5; }
.input-tabs { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); margin-top: 17px; border: 1px solid #d0dfe6; border-radius: 5px 5px 0 0; overflow: hidden; }
.input-tabs button { min-height: 40px; border: 0; color: #6a7e88; background: #f5f8fa; font-size: 11px; font-weight: 700; cursor: pointer; }
.input-tabs button + button { border-left: 1px solid #d0dfe6; }
.input-tabs .input-tabs__active { color: var(--primary-blue); background: #fff; box-shadow: inset 0 -2px var(--primary-blue); }
.input-panel { min-width: 0; padding: 14px; border: 1px solid #d0dfe6; border-top: 0; border-radius: 0 0 5px 5px; }
.file-errors { margin-top: 9px; padding: 8px 10px 8px 25px; border-left: 3px solid #c86b6b; color: #9d3f3f; background: #fff5f5; font-size: 10px; }
.chart-placeholder { min-height: 260px; display: grid; place-content: center; justify-items: center; gap: 7px; margin-top: 14px; border: 1px dashed #c7dce6; border-radius: 5px; color: #81929a; background: #fbfdfe; text-align: center; }
.chart-placeholder > span { width: 38px; height: 38px; display: grid; place-items: center; border: 1px solid #91bdcf; border-radius: 50%; color: var(--primary-blue); font-size: 22px; }
.chart-placeholder strong { color: #4d6b78; font-size: 12px; }
.chart-placeholder p { font-size: 10px; }
@media (max-width: 600px) { .ms2-input { padding: 14px; } .input-panel { padding: 10px; } }
</style>
