<script setup>
import { computed, ref, watch } from 'vue'
import ScientificSectionIcon from '../icons/ScientificSectionIcon.vue'
import diseaseAssociationIds from '../../data/diseaseAssociationIds.json'

const RESPONSIVE_IFRAME_STYLES = `
  html, body {
    width: 100%;
    height: 100%;
    margin: 0 !important;
    padding: 0 !important;
    overflow: hidden !important;
    background: #fff;
  }

  #htmlwidget_container,
  .girafe.html-widget,
  .girafe_container_std {
    width: 100% !important;
    height: 100% !important;
    margin: 0 !important;
    padding: 0 !important;
  }

  .girafe svg.ggiraph-svg {
    width: 100% !important;
    height: 100% !important;
    display: block;
  }
`

const props = defineProps({
  metaboliteId: { type: String, required: true },
  metaboliteName: { type: String, default: '' },
})

const associationIds = new Set(diseaseAssociationIds)
const normalizedId = computed(() => props.metaboliteId.trim().toUpperCase())
const hasAssociation = computed(() => associationIds.has(normalizedId.value))
const isFrameReady = ref(false)

const iframeSrc = computed(() => {
  if (!hasAssociation.value) return ''

  const baseUrl = import.meta.env.BASE_URL.endsWith('/')
    ? import.meta.env.BASE_URL
    : `${import.meta.env.BASE_URL}/`

  return `${baseUrl}disease-association/${encodeURIComponent(normalizedId.value)}.html`
})

watch(iframeSrc, () => {
  isFrameReady.value = false
})

function handleFrameLoad(event) {
  const frame = event.target

  try {
    const frameDocument = frame.contentDocument
    if (frameDocument?.head && !frameDocument.getElementById('mdap-responsive-style')) {
      const style = frameDocument.createElement('style')
      style.id = 'mdap-responsive-style'
      style.textContent = RESPONSIVE_IFRAME_STYLES
      frameDocument.head.appendChild(style)
    }
  } catch {
    // Cross-origin frames cannot be adjusted; keep the embedded page as-is.
  }

  isFrameReady.value = true
}
</script>

<template>
  <div class="disease-association mdap">
    <template v-if="hasAssociation">
      <div class="mdap__frame-wrap">
        <iframe
          :src="iframeSrc"
          class="mdap__frame"
          :title="`${props.metaboliteName || props.metaboliteId} disease association network`"
          loading="lazy"
          scrolling="no"
          allowfullscreen
          @load="handleFrameLoad"
        />
        <div
          v-if="!isFrameReady"
          class="mdap__loading"
          role="status"
          aria-live="polite"
        >
          <span class="mdap__spinner" aria-hidden="true" />
          <span>Loading disease association network…</span>
        </div>
      </div>
      <p class="mdap__hint">
        Click a disease node to view its details and PubMed references.
        <a class="mdap__open" :href="iframeSrc" target="_blank" rel="noopener noreferrer">Open in new tab</a>
      </p>
    </template>

    <div v-else class="mdap__empty" role="status">
      <ScientificSectionIcon class="mdap__empty-icon" name="disease" :size="30" />
      <p>No disease association data is available for this metabolite.</p>
    </div>
  </div>
</template>

<style scoped>
.mdap {
  display: grid;
  gap: 10px;
}

.mdap__frame-wrap {
  position: relative;
  width: 100%;
  max-height: 760px;
  aspect-ratio: 1;
  overflow: hidden;
  border: 1px solid var(--detail-border, #dce8ef);
  border-radius: 4px;
  background: #fff;
}

.mdap__frame {
  width: 100%;
  height: 100%;
  display: block;
  border: 0;
  background: #fff;
}

.mdap__loading {
  position: absolute;
  inset: 0;
  display: grid;
  place-content: center;
  justify-items: center;
  gap: 12px;
  color: var(--detail-text-secondary, #718899);
  background: #fff;
  font-size: 13px;
  text-align: center;
}

.mdap__spinner {
  width: 28px;
  height: 28px;
  border: 2px solid #d7e6ee;
  border-top-color: var(--primary-blue, #087fbe);
  border-radius: 50%;
  animation: mdap-spin 0.8s linear infinite;
}

@keyframes mdap-spin {
  to {
    transform: rotate(360deg);
  }
}

.mdap__hint {
  margin: 0;
  color: var(--detail-text-secondary, #718899);
  font-size: 12px;
  line-height: 1.5;
}

.mdap__open {
  margin-left: 4px;
  color: var(--primary-blue, #087fbe);
  text-underline-offset: 2px;
}

.mdap__empty {
  min-height: 180px;
  padding: 24px;
  display: grid;
  place-content: center;
  justify-items: center;
  gap: 10px;
  border: 1px dashed var(--detail-border, #dce8ef);
  border-radius: 4px;
  color: var(--detail-text-secondary, #718899);
  background: var(--detail-panel-muted, #f7fafc);
  text-align: center;
}

.mdap__empty-icon {
  color: #8da6b3;
}

.mdap__empty p {
  margin: 0;
  font-size: 13px;
  line-height: 1.6;
}

@media (prefers-reduced-motion: reduce) {
  .mdap__spinner {
    animation: none;
  }
}
</style>

