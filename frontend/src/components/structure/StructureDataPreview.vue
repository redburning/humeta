<script setup>
import { onBeforeUnmount, ref } from 'vue'

const props = defineProps({
  summary: {
    type: Object,
    required: true,
  },
})

const emit = defineEmits(['feedback'])

const copyLabel = ref('Copy')
let copyTimer = 0

async function copySmiles() {
  if (!props.summary.smiles) return

  try {
    await navigator.clipboard.writeText(props.summary.smiles)
    copyLabel.value = 'Copied'
    emit('feedback', { type: 'success', message: 'Copied.' })
    window.clearTimeout(copyTimer)
    copyTimer = window.setTimeout(() => {
      copyLabel.value = 'Copy'
    }, 1600)
  } catch {
    emit('feedback', { type: 'error', message: 'Unable to copy SMILES.' })
  }
}

function handleMolPreviewEnter(event) {
  const details = event.currentTarget.closest('details')
  if (details) details.open = !details.open
}

onBeforeUnmount(() => window.clearTimeout(copyTimer))
</script>

<template>
  <section class="preview-card" aria-labelledby="structure-preview-title">
    <h2 id="structure-preview-title">Structure data</h2>

    <div v-if="summary.hasStructure" class="summary-grid">
      <div>
        <span>Structure status</span>
        <strong class="status-present"><i />Loaded</strong>
      </div>
      <div>
        <span>Atom count</span>
        <strong>{{ summary.atomCount }}</strong>
      </div>
      <div>
        <span>Bond count</span>
        <strong>{{ summary.bondCount }}</strong>
      </div>
    </div>

    <div v-else class="empty-state">
      <span class="empty-state__mark" aria-hidden="true">⌬</span>
      <p>No structure loaded</p>
    </div>

    <div class="data-block">
      <div class="data-block__heading">
        <span>SMILES</span>
        <button type="button" :disabled="!summary.smiles" @click="copySmiles">{{ copyLabel }}</button>
      </div>
      <p :class="{ 'data-block__placeholder': !summary.smiles }">
        {{ summary.smiles || 'SMILES will appear here.' }}
      </p>
    </div>

    <details v-if="summary.molfile" class="mol-preview">
      <summary @keydown.enter.prevent="handleMolPreviewEnter">MOL text preview</summary>
      <pre>{{ summary.molfile }}</pre>
    </details>
  </section>
</template>

<style scoped>
.preview-card {
  min-width: 0;
  padding: 16px;
  border: 1px solid var(--structure-border, #d4e2e9);
  border-radius: 6px;
  background: #fff;
  box-shadow: none;
}

.preview-card h2 {
  margin-bottom: 12px;
  color: var(--structure-heading, #173b4d);
  font-size: 17px;
  font-weight: 600;
  line-height: 1.4;
}

.summary-grid {
  display: grid;
  grid-template-columns: 1.4fr 1fr 1fr;
  border: 1px solid #dce8ee;
  border-radius: 5px;
  overflow: hidden;
}

.summary-grid > div {
  min-width: 0;
  padding: 8px;
  background: #f8fbfc;
}

.summary-grid > div + div {
  border-left: 1px solid #dce8ee;
}

.summary-grid span,
.summary-grid strong {
  display: block;
}

.summary-grid span {
  margin-bottom: 4px;
  color: #7a8d98;
  font-size: 12px;
}

.summary-grid strong {
  color: #244554;
  font-size: 13px;
}

.status-present {
  display: flex !important;
  align-items: center;
  gap: 5px;
}

.status-present i {
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: #2ca66f;
}

.empty-state {
  min-height: 64px;
  display: grid;
  place-content: center;
  justify-items: center;
  gap: 4px;
  padding: 8px;
  color: var(--structure-label, #5d7c8a);
  background: transparent;
  font-size: 13px;
  line-height: 1.5;
  text-align: center;
}

.empty-state__mark {
  color: #8ea8b4;
  font-size: 20px;
}

.data-block {
  min-width: 0;
  margin-top: 12px;
}

.data-block__heading {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 8px;
  color: #445e6c;
  font-size: 13px;
  font-weight: 700;
}

.data-block__heading button {
  padding: 4px 8px;
  border: 0;
  color: var(--primary-blue);
  background: transparent;
  font-size: 12px;
  cursor: pointer;
}

.data-block__heading button:disabled {
  color: #9eabb2;
  cursor: default;
}

.data-block p {
  min-height: 48px;
  padding: 8px;
  border: 1px solid #d8e5eb;
  border-radius: 4px;
  color: #294755;
  background: #f8fbfc;
  font: 11px/1.55 Consolas, "SFMono-Regular", monospace;
  overflow-wrap: anywhere;
}

.data-block .data-block__placeholder {
  color: #91a0a8;
  font-family: inherit;
  font-size: 13px;
  line-height: 1.5;
}

.mol-preview {
  min-width: 0;
  margin-top: 12px;
  border: 1px solid #d8e5eb;
  border-radius: 4px;
  overflow: hidden;
}

.mol-preview summary {
  padding: 8px;
  color: #3e5e6e;
  background: #f4f9fb;
  font-size: 12px;
  font-weight: 700;
  cursor: pointer;
}

.mol-preview pre {
  max-width: 100%;
  max-height: 220px;
  margin: 0;
  padding: 8px;
  overflow: auto;
  color: #405866;
  background: #fff;
  font: 10px/1.5 Consolas, "SFMono-Regular", monospace;
  white-space: pre;
}

@media (max-width: 420px) {
  .summary-grid {
    grid-template-columns: 1fr;
  }

  .summary-grid > div + div {
    border-top: 1px solid #dce8ee;
    border-left: 0;
  }
}

@media (max-width: 767px) {
  .data-block__heading button,
  .mol-preview summary {
    min-height: 40px;
  }

  .data-block__heading button {
    min-width: 40px;
  }
}
</style>
