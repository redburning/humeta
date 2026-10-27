<script setup>
import { nextTick, onBeforeUnmount, onMounted, ref, shallowRef, watch } from 'vue'

const RESULT_PREVIEW_OVERSAMPLING_RATIO = 2
const RESULT_PREVIEW_ZOOM = 1.1

const props = defineProps({
  Kekule: { type: Object, default: null },
  molecule: { type: Object, default: null },
  name: { type: String, default: 'Molecular structure' },
})

const viewerHost = ref(null)
const viewerRef = shallowRef(null)
const renderFailed = ref(false)

let resizeObserver = null
let resizeFrame = 0

function resizeViewer() {
  window.cancelAnimationFrame(resizeFrame)
  resizeFrame = window.requestAnimationFrame(() => {
    viewerRef.value?.resized?.()
    viewerRef.value?.resetDisplay?.()
  })
}

function renderMolecule(molecule) {
  const viewer = viewerRef.value
  if (!viewer || !molecule) {
    renderFailed.value = !molecule
    return
  }

  try {
    renderFailed.value = false
    viewer.setChemObj(molecule)
    resizeViewer()
  } catch {
    renderFailed.value = true
  }
}

function configureHighDensityRendering(viewer) {
  const environmentConfigs = viewer
    .getDisplayerConfigs?.()
    ?.getEnvironment2DConfigs?.()

  environmentConfigs?.setAntialias?.(true)
  environmentConfigs?.setAntialiasBlurRatio?.(0)
  environmentConfigs?.setOverSamplingRatio?.(RESULT_PREVIEW_OVERSAMPLING_RATIO)
}

async function initializeViewer() {
  await nextTick()
  if (!viewerHost.value || !props.Kekule?.ChemWidget?.Viewer2D || !props.molecule) {
    renderFailed.value = true
    return
  }

  try {
    const viewer = new props.Kekule.ChemWidget.Viewer2D(viewerHost.value)
    viewer.setPredefinedSetting('static')
    configureHighDensityRendering(viewer)
    viewer.setAutoSize(false)
    viewer.setAutofit(true)
    viewer.setInitialZoom(RESULT_PREVIEW_ZOOM)
    viewer.setObserveElemResize(false)
    viewer.setDimension('100%', '100%')
    viewerRef.value = viewer

    resizeObserver = new ResizeObserver(resizeViewer)
    resizeObserver.observe(viewerHost.value)
    renderMolecule(props.molecule)
  } catch {
    renderFailed.value = true
  }
}

watch(
  () => props.molecule,
  (molecule) => renderMolecule(molecule),
)

onMounted(initializeViewer)

onBeforeUnmount(() => {
  window.cancelAnimationFrame(resizeFrame)
  resizeObserver?.disconnect()
  resizeObserver = null

  const viewer = viewerRef.value
  if (viewer) {
    viewer.setChemObj(null)
    viewer.finalize()
  }
  viewerRef.value = null
})
</script>

<template>
  <div class="result-viewer">
    <div
      v-show="!renderFailed"
      ref="viewerHost"
      class="result-viewer__host"
      role="img"
      :aria-label="`${name} 2D molecular structure`"
    />
    <div v-if="renderFailed" class="result-viewer__placeholder" role="img" :aria-label="`${name} preview unavailable`">
      <span aria-hidden="true">⌬</span>
      <small>Structure preview unavailable</small>
    </div>
  </div>
</template>

<style scoped>
.result-viewer {
  width: 100%;
  height: 176px;
  overflow: hidden;
  border: 1px solid #d7e5eb;
  border-radius: 4px;
  background: #fff;
}

.result-viewer__host {
  width: 100%;
  height: 100%;
}

.result-viewer__host:deep(.K-Chem-Viewer),
.result-viewer__host:deep(.K-Chem-Obj-Displayer) {
  width: 100% !important;
  height: 100% !important;
  border: 0;
  background: transparent !important;
}

.result-viewer__placeholder {
  width: 100%;
  height: 100%;
  display: grid;
  place-content: center;
  justify-items: center;
  gap: 5px;
  color: #88a0aa;
  background: #fafcfd;
}

.result-viewer__placeholder span {
  font-size: 24px;
}

.result-viewer__placeholder small {
  font-size: 10px;
}
</style>
