<script setup>
import { onBeforeUnmount, ref } from 'vue'

defineProps({
  disabled: {
    type: Boolean,
    default: false,
  },
})

const emit = defineEmits(['feedback', 'import-file', 'import-smiles'])

const TRYPTOPHAN_SMILES = 'C1=CC=C2C(=C1)C(=CN2)C[C@@H](C(=O)O)N'
const MAX_FILE_SIZE = 2 * 1024 * 1024

const smilesInput = ref(TRYPTOPHAN_SMILES)
const fileInput = ref(null)
const selectedFileName = ref('No file selected')

function importSmiles() {
  const value = smilesInput.value.trim()
  if (!value) {
    emit('feedback', { type: 'error', message: 'Please enter a SMILES string.' })
    return
  }

  emit('import-smiles', value)
}

async function handleFileChange(event) {
  const input = event.target
  const file = input.files?.[0]

  if (!file) {
    selectedFileName.value = 'No file selected'
    return
  }

  selectedFileName.value = file.name
  const extension = file.name.slice(file.name.lastIndexOf('.')).toLowerCase()

  if (!['.mol', '.sdf'].includes(extension)) {
    emit('feedback', { type: 'error', message: 'Please select a MOL or SDF file.' })
    input.value = ''
    return
  }

  if (file.size > MAX_FILE_SIZE) {
    emit('feedback', { type: 'error', message: 'The selected file exceeds the 2 MB limit.' })
    input.value = ''
    return
  }

  try {
    const text = await file.text()
    if (!text.trim()) throw new Error('Invalid MOL data.')

    emit('import-file', {
      fileName: file.name,
      format: extension === '.sdf' ? 'sd' : 'mol',
      text,
    })
  } catch {
    emit('feedback', { type: 'error', message: 'Invalid MOL data.' })
  } finally {
    input.value = ''
  }
}

onBeforeUnmount(() => {
  if (fileInput.value) fileInput.value.value = ''
  selectedFileName.value = 'No file selected'
})
</script>

<template>
  <section class="panel-card" aria-labelledby="structure-import-title">
    <h2 id="structure-import-title">Import structure</h2>

    <div class="form-group">
      <label for="smiles-input">SMILES</label>
      <textarea
        id="smiles-input"
        v-model="smilesInput"
        rows="2"
        :disabled="disabled"
        spellcheck="false"
        placeholder="Enter a SMILES string"
      />
      <button class="action-button" type="button" :disabled="disabled" @click="importSmiles">
        Import SMILES
      </button>
    </div>

    <div class="form-group">
      <label for="mol-file">Local MOL / SDF file</label>
      <label class="file-picker" :class="{ 'file-picker--disabled': disabled }" for="mol-file">
        <span class="file-picker__button">Choose file</span>
        <span class="file-picker__name">{{ selectedFileName }}</span>
      </label>
      <input
        id="mol-file"
        ref="fileInput"
        class="visually-hidden"
        type="file"
        accept=".mol,.sdf,text/plain"
        :disabled="disabled"
        @change="handleFileChange"
      />
      <p class="form-group__hint">Local only · MOL/SDF · maximum 2 MB</p>
    </div>
  </section>
</template>

<style scoped>
.panel-card {
  min-width: 0;
  padding: 16px;
  border: 1px solid var(--structure-border, #d4e2e9);
  border-radius: 6px;
  background: #fff;
  box-shadow: none;
}

.panel-card h2 {
  margin-bottom: 12px;
  color: var(--structure-heading, #173b4d);
  font-size: 17px;
  font-weight: 600;
  line-height: 1.4;
}

.form-group + .form-group {
  margin-top: 16px;
  padding-top: 16px;
  border-top: 1px solid #edf3f6;
}

.form-group > label:first-child {
  display: block;
  margin-bottom: 8px;
  color: #344f5e;
  font-size: 13px;
  font-weight: 700;
}

textarea {
  width: 100%;
  min-width: 0;
  resize: vertical;
  padding: 8px 12px;
  border: 1px solid #cbdde7;
  border-radius: 4px;
  color: #1d3441;
  background: #fbfdfe;
  font-family: inherit;
  font-size: 13px;
  line-height: 1.55;
  overflow-wrap: anywhere;
}

textarea:focus {
  border-color: var(--primary-blue);
  outline: 2px solid rgba(8, 127, 190, 0.12);
}

:global(#app #smiles-input:focus-visible) {
  border-color: var(--primary-blue);
  outline: 2px solid rgba(8, 127, 190, 0.4);
  outline-offset: 2px;
}

textarea:disabled {
  cursor: not-allowed;
  opacity: 0.68;
}

.action-button {
  width: 100%;
  min-height: 36px;
  margin-top: 8px;
  padding: 8px 12px;
  border: 1px solid var(--primary-blue);
  border-radius: 4px;
  color: #fff;
  background: var(--primary-blue);
  font-size: 13px;
  font-weight: 700;
  cursor: pointer;
}

.action-button:disabled {
  cursor: not-allowed;
  opacity: 0.55;
}

.file-picker {
  min-width: 0;
  display: grid;
  grid-template-columns: auto minmax(0, 1fr);
  align-items: stretch;
  border: 1px solid #cbdde7;
  border-radius: 4px;
  overflow: hidden;
  cursor: pointer;
}

.file-picker__button {
  display: grid;
  place-items: center;
  padding: 8px 12px;
  color: #166f9e;
  background: #eaf6fb;
  font-size: 12px;
  font-weight: 700;
  white-space: nowrap;
}

.file-picker__name {
  min-width: 0;
  padding: 8px 12px;
  overflow: hidden;
  color: #6c7e89;
  font-size: 12px;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.file-picker--disabled {
  cursor: not-allowed;
  opacity: 0.58;
}

.form-group__hint {
  margin-top: 4px;
  color: #6e838e;
  font-size: 13px;
  line-height: 1.5;
}

@media (max-width: 767px) {
  .action-button,
  .file-picker {
    min-height: 40px;
  }
}
</style>
