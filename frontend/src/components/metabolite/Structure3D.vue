<script setup>
import { computed, nextTick, onBeforeUnmount, onMounted, ref, shallowRef, watch } from 'vue'

/**
 * Three-dimensional structure viewer for metabolite MOL2 files.
 *
 * 3Dmol.js is imported lazily so pages that never open a 3D structure do not
 * download the molecular renderer. MOL2 files are served from
 * `public/mol2/{id}.mol2`; the files ship with the Humeta delivery material.
 */

const DISPLAY_MODES = [
  { value: 'ball-stick', label: 'Ball & stick' },
  { value: 'sticks', label: 'Sticks' },
  { value: 'wireframe', label: 'Wireframe' },
  { value: 'space-fill', label: 'Space fill' },
]

const MODEL_STYLES = Object.freeze({
  'ball-stick': {
    stick: { radius: 0.13, colorscheme: 'Jmol' },
    sphere: { scale: 0.26, colorscheme: 'Jmol' },
  },
  sticks: { stick: { radius: 0.16, colorscheme: 'Jmol' } },
  wireframe: { line: { linewidth: 1.2, colorscheme: 'Jmol' } },
  'space-fill': { sphere: { scale: 1, colorscheme: 'Jmol' } },
})

const VIEWER_BACKGROUND = '#fbfdfe'
const ZOOM_STEP = 1.2
// A small zoom-in after fitting makes better use of the compact detail panel.
const FIT_ZOOM = 1.08
// 容器尺寸变化后稍等一帧再同步画布，避免连续拖动时反复重建绘制缓冲
const RESIZE_DEBOUNCE = 60

const props = defineProps({
  metaboliteId: { type: String, required: true },
  metaboliteName: { type: String, default: '' },
})

const hostShell = ref(null)
const displayMode = ref('ball-stick')
const showHydrogens = ref(true)
const status = ref('loading')
const errorMessage = ref('')
const viewer = shallowRef(null)

let loadedMol2 = ''
let requestToken = 0
let isUnmounted = false
let stageResizeObserver = null
let resizeTimer = 0

const canInteract = computed(() => status.value === 'ready')
const stageLabel = computed(
  () => `${props.metaboliteName || props.metaboliteId} three-dimensional structure`,
)

class Mol2NotFoundError extends Error {}

// --- module scoped 3Dmol runtime ------------------------------------------

let viewer3dPromise = null

function importViewer3d() {
  if (!viewer3dPromise) {
    viewer3dPromise = import('3dmol')
      .then((module) => {
        const $3Dmol = module.default?.createViewer ? module.default : module
        if (typeof $3Dmol?.createViewer !== 'function') {
          throw new Error('The 3D molecular renderer is unavailable.')
        }
        return $3Dmol
      })
      .catch((error) => {
        viewer3dPromise = null
        throw error
      })
  }

  return viewer3dPromise
}

// --- MOL2 / WebGL helpers -------------------------------------------------

function hasMol2Atoms(text) {
  // Also guards against servers that answer a missing file with the SPA shell.
  let section = ''

  for (const rawLine of text.split(/\r?\n/)) {
    const line = rawLine.trim()
    if (!line) continue

    if (line.startsWith('@<TRIPOS>')) {
      section = line.slice(9).trim().toUpperCase()
      continue
    }

    if (section === 'ATOM' && line.split(/\s+/).length >= 6) return true
  }

  return false
}

function isWebglAvailable() {
  try {
    const canvas = document.createElement('canvas')
    return Boolean(canvas.getContext('webgl2') || canvas.getContext('webgl'))
  } catch {
    return false
  }
}

// --- asset loading ---------------------------------------------------------

function resolveMol2Url(id) {
  const baseUrl = import.meta.env.BASE_URL.endsWith('/')
    ? import.meta.env.BASE_URL
    : `${import.meta.env.BASE_URL}/`
  const fileName = encodeURIComponent(String(id ?? '').trim().toUpperCase())

  return `${baseUrl}mol2/${fileName}.mol2`
}

async function fetchMol2(id) {
  const response = await fetch(resolveMol2Url(id), { credentials: 'same-origin' })

  if (response.status === 404) throw new Mol2NotFoundError('MOL2 file not found.')
  if (!response.ok) {
    throw new Error(`The 3D structure could not be loaded (HTTP ${response.status}).`)
  }

  return response.text()
}

// --- viewer lifecycle ------------------------------------------------------

function currentModelStyle() {
  const style = MODEL_STYLES[displayMode.value] || MODEL_STYLES['ball-stick']
  // 3Dmol keeps a reference to the style object, so hand it a fresh copy.
  return JSON.parse(JSON.stringify(style))
}

function applyStyle() {
  const instance = viewer.value
  if (!instance) return

  instance.setStyle({}, currentModelStyle())
  instance.render()
}

function fitView() {
  const instance = viewer.value
  if (!instance) return

  instance.zoomTo()
  if (FIT_ZOOM !== 1) instance.zoom(FIT_ZOOM)
  instance.render()
}

function loadModel() {
  const instance = viewer.value
  if (!instance || !loadedMol2) return false

  instance.removeAllModels()

  const model = instance.addModel(loadedMol2, 'mol2')
  const atoms = model?.selectedAtoms?.({}) ?? []
  if (!atoms.length) {
    status.value = 'empty'
    return false
  }

  if (!showHydrogens.value) {
    const hydrogens = model.selectedAtoms({ elem: 'H' })
    if (hydrogens.length) model.removeAtoms(hydrogens)
  }

  applyStyle()
  fitView()
  status.value = 'ready'
  return true
}

function createViewer($3Dmol) {
  const shell = hostShell.value
  if (!shell) throw new Error('The 3D viewer container is unavailable.')

  releaseViewer()

  const instance = $3Dmol.createViewer(shell, {
    backgroundColor: VIEWER_BACKGROUND,
    antialias: true,
  })
  if (!instance) throw new Error('The 3D viewer could not be created.')

  viewer.value = instance
  loadModel()
}

function releaseViewer() {
  const instance = viewer.value
  const shell = hostShell.value
  viewer.value = null
  if (!instance) return

  const canvases = shell ? Array.from(shell.querySelectorAll('canvas')) : []

  try {
    instance.removeAllSurfaces()
    instance.removeAllModels()
    instance.clear()
  } catch (error) {
    console.error('Failed to release the 3D viewer', error)
  }

  // 3Dmol does not dispose its WebGL context, so release it explicitly to
  // avoid exhausting the browser context limit while browsing metabolites.
  for (const canvas of canvases) {
    try {
      const context = canvas.getContext('webgl2') || canvas.getContext('webgl')
      context?.getExtension('WEBGL_lose_context')?.loseContext()
    } catch {
      // Context cleanup is best effort.
    }
  }

  shell?.replaceChildren()
}

function resizeViewer() {
  const instance = viewer.value
  const shell = hostShell.value
  if (!instance || !shell) return
  if (!shell.clientWidth || !shell.clientHeight) return

  instance.resize()
  instance.render()
}

function scheduleViewerResize() {
  if (resizeTimer) return
  resizeTimer = window.setTimeout(() => {
    resizeTimer = 0
    resizeViewer()
  }, RESIZE_DEBOUNCE)
}

async function loadStructure(id) {
  const token = ++requestToken
  status.value = 'loading'
  errorMessage.value = ''
  loadedMol2 = ''

  try {
    const [$3Dmol, text] = await Promise.all([importViewer3d(), fetchMol2(id)])
    if (isUnmounted || token !== requestToken) return

    if (!isWebglAvailable()) {
      throw new Error('This browser does not support WebGL, so the 3D structure cannot be displayed.')
    }

    if (!hasMol2Atoms(text)) {
      status.value = 'empty'
      return
    }

    loadedMol2 = text

    await nextTick()
    if (isUnmounted || token !== requestToken) return

    if (viewer.value) {
      loadModel()
    } else {
      createViewer($3Dmol)
    }
  } catch (error) {
    if (isUnmounted || token !== requestToken) return

    if (error instanceof Mol2NotFoundError) {
      status.value = 'empty'
      return
    }

    status.value = 'error'
    errorMessage.value = error instanceof Error ? error.message : 'The 3D structure could not be loaded.'
    console.error('Failed to load the 3D structure', error)
  }
}

function zoomIn() {
  if (!canInteract.value) return
  const instance = viewer.value
  if (!instance) return

  instance.zoom(ZOOM_STEP)
  instance.render()
}

function zoomOut() {
  if (!canInteract.value) return
  const instance = viewer.value
  if (!instance) return

  instance.zoom(1 / ZOOM_STEP)
  instance.render()
}

function resetView() {
  if (!canInteract.value) return
  const instance = viewer.value
  if (!instance) return

  const quaternion = instance.rotationGroup?.quaternion
  if (quaternion) {
    if (typeof quaternion.identity === 'function') quaternion.identity()
    else quaternion.set(0, 0, 0, 1)
  }

  fitView()
}

watch(
  () => props.metaboliteId,
  (id) => {
    void loadStructure(id)
  },
)

watch(showHydrogens, () => {
  if (status.value === 'ready') loadModel()
})

watch(displayMode, () => {
  if (status.value === 'ready') applyStyle()
})

onMounted(() => {
  if (typeof ResizeObserver !== 'undefined' && hostShell.value) {
    stageResizeObserver = new ResizeObserver(scheduleViewerResize)
    stageResizeObserver.observe(hostShell.value)
  }

  void loadStructure(props.metaboliteId)
})

onBeforeUnmount(() => {
  isUnmounted = true
  requestToken += 1

  if (resizeTimer) {
    window.clearTimeout(resizeTimer)
    resizeTimer = 0
  }
  stageResizeObserver?.disconnect()
  stageResizeObserver = null

  releaseViewer()
})
</script>

<template>
  <div class="structure3d">
    <div class="structure3d__stage">
      <div
        ref="hostShell"
        class="structure3d__canvas"
        role="img"
        :aria-label="stageLabel"
      />

      <div v-if="status === 'loading'" class="structure3d__overlay" role="status" aria-live="polite">
        <span class="structure3d__spinner" aria-hidden="true" />
        <span>Loading 3D structure…</span>
      </div>

      <div
        v-else-if="status === 'empty' || status === 'error'"
        class="structure3d__overlay structure3d__overlay--message"
        role="status"
      >
        <svg class="structure3d__empty-icon" viewBox="0 0 24 24" aria-hidden="true">
          <circle cx="12" cy="12" r="9" />
          <path d="M12 8v8M8 12h8" />
        </svg>
        <p>{{ status === 'empty' ? 'No 3D structure is available for this metabolite.' : errorMessage }}</p>
      </div>
    </div>

    <div v-if="status !== 'empty' && status !== 'error'" class="structure3d__controls">
      <div class="structure3d__group">
        <span class="structure3d__group-title">Display</span>
        <div class="structure3d__modes" role="group" aria-label="3D representation">
          <button
            v-for="mode in DISPLAY_MODES"
            :key="mode.value"
            type="button"
            class="structure3d__mode"
            :class="{ 'is-active': displayMode === mode.value }"
            :aria-pressed="displayMode === mode.value"
            :disabled="status === 'loading'"
            @click="displayMode = mode.value"
          >
            {{ mode.label }}
          </button>
        </div>
      </div>

      <label class="structure3d__toggle">
        <input v-model="showHydrogens" type="checkbox" :disabled="status === 'loading'" />
        <span>Hydrogens</span>
      </label>

      <div class="structure3d__zoom" role="group" aria-label="3D view controls">
        <button
          type="button"
          class="structure3d__zoom-button"
          title="Zoom in"
          aria-label="Zoom in"
          :disabled="!canInteract"
          @click="zoomIn"
        >
          <svg viewBox="0 0 16 16" aria-hidden="true">
            <circle cx="7" cy="7" r="4.6" />
            <path d="M10.4 10.4 13.5 13.5M7 4.9v4.2M4.9 7h4.2" />
          </svg>
        </button>
        <button
          type="button"
          class="structure3d__zoom-button"
          title="Zoom out"
          aria-label="Zoom out"
          :disabled="!canInteract"
          @click="zoomOut"
        >
          <svg viewBox="0 0 16 16" aria-hidden="true">
            <circle cx="7" cy="7" r="4.6" />
            <path d="M10.4 10.4 13.5 13.5M4.9 7h4.2" />
          </svg>
        </button>
        <button
          type="button"
          class="structure3d__zoom-button"
          title="Reset view"
          aria-label="Reset view"
          :disabled="!canInteract"
          @click="resetView"
        >
          <svg viewBox="0 0 16 16" aria-hidden="true">
            <path d="M12.6 7.2a4.7 4.7 0 1 1-1.5-3.3M12.8 2.4v3.2h-3.2" />
          </svg>
        </button>
      </div>

      <p class="structure3d__hint">Drag to rotate<br />Scroll to zoom</p>
    </div>
  </div>
</template>

<style scoped>
.structure3d {
  min-height: 330px;
  padding: 10px 14px 10px 12px;
  display: flex;
  gap: 14px;
  background: #fbfdfe;
  white-space: normal;
}

.structure3d__stage {
  position: relative;
  flex: 1 1 auto;
  min-width: 0;
  min-height: 308px;
  border: 1px solid #e3edf3;
  border-radius: 4px;
  overflow: hidden;
  background: #fbfdfe;
}

.structure3d__canvas {
  position: absolute;
  inset: 0;
}

.structure3d__overlay {
  position: absolute;
  inset: 0;
  padding: 16px;
  display: grid;
  place-content: center;
  justify-items: center;
  gap: 10px;
  color: var(--detail-text-secondary, #718899);
  background: #fbfdfe;
  font-size: 12px;
  line-height: 1.6;
  text-align: center;
}

.structure3d__overlay--message p {
  margin: 0;
  max-width: 320px;
  overflow-wrap: anywhere;
}

.structure3d__empty-icon {
  width: 28px;
  height: 28px;
  fill: none;
  stroke: #9db6c4;
  stroke-width: 1.4;
  stroke-linecap: round;
}

.structure3d__spinner {
  width: 26px;
  height: 26px;
  border: 2px solid #d7e6ee;
  border-top-color: var(--primary-blue, #087fbe);
  border-radius: 50%;
  animation: structure3d-spin 0.8s linear infinite;
}

@keyframes structure3d-spin {
  to {
    transform: rotate(360deg);
  }
}

.structure3d__controls {
  flex: 0 0 132px;
  display: flex;
  flex-direction: column;
  gap: 10px;
  padding: 2px 0;
  min-width: 0;
}

.structure3d__group {
  display: grid;
  gap: 6px;
}

.structure3d__group-title {
  color: var(--detail-text-secondary, #718899);
  font-size: 11px;
  font-weight: 600;
}

.structure3d__modes {
  display: grid;
  gap: 4px;
}

.structure3d__mode {
  min-height: 26px;
  padding: 4px 8px;
  border: 1px solid #d7e3ea;
  border-radius: 4px;
  color: #4d6b7c;
  background: #fff;
  font-family: inherit;
  font-size: 11px;
  text-align: left;
  cursor: pointer;
}

.structure3d__mode:hover:enabled {
  border-color: #a9c8d7;
  background: #f2f9fc;
}

.structure3d__mode.is-active {
  border-color: #1686bd;
  color: #0a6a99;
  background: #eaf6fb;
  font-weight: 600;
}

.structure3d__mode:focus-visible,
.structure3d__zoom-button:focus-visible {
  outline: 2px solid #8ab9ce;
  outline-offset: 1px;
}

.structure3d__mode:disabled {
  opacity: 0.5;
  cursor: default;
}

.structure3d__toggle {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  color: #4d6b7c;
  font-size: 11px;
  cursor: pointer;
}

.structure3d__toggle input {
  width: 13px;
  height: 13px;
  margin: 0;
  accent-color: #1686bd;
}

.structure3d__zoom {
  display: flex;
  gap: 6px;
}

.structure3d__zoom-button {
  width: 28px;
  height: 28px;
  padding: 0;
  border: 1px solid #d7e3ea;
  border-radius: 4px;
  display: grid;
  place-items: center;
  color: #356a7f;
  background: #fff;
  cursor: pointer;
}

.structure3d__zoom-button:hover:enabled {
  border-color: #a9c8d7;
  background: #eaf6fb;
}

.structure3d__zoom-button:disabled {
  opacity: 0.45;
  cursor: not-allowed;
}

.structure3d__zoom-button svg {
  width: 16px;
  height: 16px;
  fill: none;
  stroke: currentColor;
  stroke-width: 1.3;
  stroke-linecap: round;
  stroke-linejoin: round;
}

.structure3d__hint {
  margin: auto 0 0;
  color: #8ba3b2;
  font-size: 10px;
  line-height: 1.6;
}

@media (max-width: 900px) {
  .structure3d {
    flex-direction: column;
    gap: 10px;
    padding: 10px;
  }

  .structure3d__stage {
    flex: none;
    height: 300px;
    min-height: 0;
  }

  .structure3d__controls {
    flex: none;
    flex-direction: row;
    flex-wrap: wrap;
    align-items: center;
    gap: 8px 14px;
    padding: 0;
  }

  .structure3d__group {
    gap: 4px;
  }

  .structure3d__modes {
    display: flex;
    flex-wrap: wrap;
    gap: 5px;
  }

  .structure3d__hint {
    margin: 0;
  }
}

@media (max-width: 640px) {
  .structure3d__stage {
    height: 260px;
  }

  .structure3d__mode {
    padding: 3px 7px;
  }

  .structure3d__hint {
    flex-basis: 100%;
  }
}

@media (prefers-reduced-motion: reduce) {
  .structure3d__spinner {
    animation-duration: 2s;
  }
}
</style>
