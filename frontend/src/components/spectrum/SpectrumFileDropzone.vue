<script setup>
import { ref } from 'vue'

const props = defineProps({
  disabled: { type: Boolean, default: false },
  hasError: { type: Boolean, default: false },
})
const emit = defineEmits(['select'])
const fileInput = ref(null)
const dragging = ref(false)

function openPicker() {
  if (props.disabled) return
  fileInput.value?.click()
}

function submitFile(file) {
  if (props.disabled) return
  if (file) emit('select', file)
  if (fileInput.value) fileInput.value.value = ''
}

function handleInput(event) {
  submitFile(event.target.files?.[0])
}

function handleDrop(event) {
  dragging.value = false
  submitFile(event.dataTransfer?.files?.[0])
}

function handleKeydown(event) {
  if (event.target !== event.currentTarget) return
  if (event.key !== 'Enter' && event.key !== ' ') return
  event.preventDefault()
  openPicker()
}
</script>

<template>
  <div
    class="dropzone"
    :class="{ 'dropzone--dragging': dragging, 'dropzone--disabled': disabled }"
    role="group"
    :tabindex="disabled ? -1 : 0"
    aria-label="Choose or drop a local spectrum file"
    @click="openPicker"
    @keydown="handleKeydown"
    @dragenter.prevent="dragging = true"
    @dragover.prevent="dragging = true"
    @dragleave.prevent="dragging = false"
    @drop.prevent="handleDrop"
  >
    <label class="visually-hidden" for="spectrum-file-input">Local spectrum file</label>
    <input id="spectrum-file-input" ref="fileInput" class="visually-hidden" type="file" accept=".txt,.csv,.tsv,.mgf,.msp,text/plain,text/csv" :disabled="disabled" :aria-invalid="hasError ? 'true' : undefined" :aria-describedby="hasError ? 'spectrum-file-errors' : undefined" @change="handleInput" />
    <span class="dropzone__icon" aria-hidden="true">⇧</span>
    <strong>Drop a local spectrum file here</strong>
    <p>TXT, CSV, TSV, MGF, or MSP · maximum 2 MB</p>
    <button type="button" :disabled="disabled" @click.stop="openPicker">Choose file</button>
  </div>
</template>

<style scoped>
.dropzone { min-height: 185px; display: grid; place-content: center; justify-items: center; gap: 7px; padding: 20px; border: 1px dashed #93b9c9; border-radius: 5px; color: #5d7480; background: #fbfdfe; text-align: center; cursor: pointer; }
.dropzone:hover, .dropzone:focus-visible, .dropzone--dragging { border-color: var(--primary-blue); background: #f1f9fc; outline: 2px solid rgba(8, 127, 190, .2); outline-offset: 2px; }
.dropzone--disabled { opacity: .55; cursor: not-allowed; }
.dropzone__icon { width: 36px; height: 36px; display: grid; place-items: center; border-radius: 50%; color: #fff; background: var(--primary-blue); font-size: 20px; }
.dropzone strong { color: #315b6d; font-size: 13px; }
.dropzone p { color: #84959d; font-size: 10px; }
.dropzone button { margin-top: 4px; min-height: 34px; padding: 7px 16px; border: 1px solid var(--primary-blue); border-radius: 4px; color: var(--primary-blue); background: #fff; font-size: 11px; font-weight: 700; cursor: pointer; }
</style>
