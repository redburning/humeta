<script setup>
import {
  computed,
  nextTick,
  onBeforeUnmount,
  ref,
  shallowRef,
  watch,
} from 'vue'
import { useRoute, useRouter } from 'vue-router'
import FooterSection from '../components/layout/FooterSection.vue'
import HeaderNav from '../components/layout/HeaderNav.vue'
import KekuleStructureEditor from '../components/structure/KekuleStructureEditor.vue'
import StructureDataPreview from '../components/structure/StructureDataPreview.vue'
import StructureImportPanel from '../components/structure/StructureImportPanel.vue'
import StructureSearchActions from '../components/structure/StructureSearchActions.vue'
import StructureSearchOptions from '../components/structure/StructureSearchOptions.vue'
import StructureSearchResults from '../components/structure/StructureSearchResults.vue'
import StructureSearchTabs from '../components/structure/StructureSearchTabs.vue'
import { useDelayedLoading } from '../composables/useDelayedLoading'
import { useLocalStructureSearch } from '../composables/useLocalStructureSearch'

const MODE_LABELS = Object.freeze({
  exact: 'Exact structure',
  substructure: 'Substructure',
  similarity: 'Similarity',
})
const VALID_MODES = new Set(Object.keys(MODE_LABELS))
const EMPTY_SUMMARY = Object.freeze({
  hasStructure: false,
  atomCount: 0,
  bondCount: 0,
  moleculeCount: 0,
  smiles: '',
  molfile: '',
})

const route = useRoute()
const router = useRouter()
const editorRef = ref(null)
const resultsRef = ref(null)
const kekuleRef = shallowRef(null)
const isEditorReady = ref(false)
const feedback = ref({ type: 'info', message: '' })
const summary = ref({ ...EMPTY_SUMMARY })
const mode = ref('substructure')
const compareCharge = ref(true)
const compareMass = ref(false)
const similarityThreshold = ref(0.7)
const sortOrder = ref('relevance')
const pageSize = ref(6)
const currentPage = ref(1)
const searchState = ref('idle')
const searchResults = shallowRef([])
const isStructureSearching = computed(() => searchState.value === 'searching')
const { visibleLoading } = useDelayedLoading(isStructureSearching)

const { clearCache, initialize, search } = useLocalStructureSearch()

let searchToken = 0
let searchFrame = 0
let isUnmounted = false

const feedbackClass = computed(() => `feedback-bar--${feedback.value.type}`)
const modeLabel = computed(() => MODE_LABELS[mode.value])
const sortedResults = computed(() => {
  const results = [...searchResults.value]

  if (sortOrder.value === 'name') {
    return results.sort((left, right) => left.record.name.localeCompare(right.record.name))
  }

  if (sortOrder.value === 'molecularWeight') {
    return results.sort((left, right) => left.record.molecularWeight - right.record.molecularWeight)
  }

  if (mode.value === 'similarity') {
    return results.sort((left, right) => right.record.demoSimilarity - left.record.demoSimilarity)
  }

  return results
})
const visibleResults = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value
  return sortedResults.value.slice(start, start + pageSize.value)
})

function setFeedback(payload) {
  feedback.value = payload
}

function resetSearchState() {
  searchToken += 1
  window.cancelAnimationFrame(searchFrame)
  searchResults.value = []
  searchState.value = 'idle'
  currentPage.value = 1
}

function handleReady() {
  const Kekule = editorRef.value?.getKekule?.()
  if (!Kekule) {
    handleInitializationError()
    return
  }

  try {
    const datasetStatus = initialize(Kekule)
    if (datasetStatus.availableCount !== 8 || datasetStatus.errors.length) {
      throw new Error('The local demonstration dataset could not be prepared.')
    }

    kekuleRef.value = Kekule
    isEditorReady.value = true
    setFeedback({ type: 'info', message: '' })
  } catch (error) {
    isEditorReady.value = false
    setFeedback({ type: 'error', message: error.message || 'Local dataset initialization failed.' })
  }
}

function handleInitializationError() {
  isEditorReady.value = false
  setFeedback({ type: 'error', message: 'Kekule.js initialization failed.' })
}

function handleStructureChange(nextSummary) {
  const previousSignature = [
    summary.value.atomCount,
    summary.value.bondCount,
    summary.value.moleculeCount,
    summary.value.smiles,
  ].join('|')
  const nextSignature = [
    nextSummary.atomCount,
    nextSummary.bondCount,
    nextSummary.moleculeCount,
    nextSummary.smiles,
  ].join('|')

  summary.value = nextSummary
  if (searchState.value !== 'idle' && previousSignature !== nextSignature) resetSearchState()
  if (nextSummary.moleculeCount > 1) {
    setFeedback({ type: 'info', message: 'Only the first molecule will be used.' })
  }
}

function runEditorAction(action, successMessage = '') {
  if (!isEditorReady.value || !editorRef.value) {
    setFeedback({ type: 'error', message: 'Kekule.js is not ready yet.' })
    return null
  }

  try {
    const result = action(editorRef.value)
    if (result?.multiple) {
      setFeedback({ type: 'info', message: 'Only the first molecule will be used.' })
    } else if (successMessage) {
      setFeedback({ type: 'success', message: successMessage })
    } else {
      setFeedback({ type: 'info', message: '' })
    }
    return result
  } catch (error) {
    setFeedback({ type: 'error', message: error.message || 'The requested action failed.' })
    return null
  }
}

function loadExample() {
  resetSearchState()
  runEditorAction((editor) => editor.loadExample(), 'Tryptophan example loaded. Select Search structure to compare it.')
}

function clearStructure() {
  runEditorAction((editor) => editor.clearStructure())
  summary.value = { ...EMPTY_SUMMARY }
  resetSearchState()
  setFeedback({ type: 'info', message: '' })
}

function importSmiles(value) {
  resetSearchState()
  runEditorAction((editor) => editor.importSmiles(value), 'SMILES imported.')
}

function importMol(value) {
  const result = runEditorAction((editor) => editor.importMol(value), 'MOL data imported.')
  if (result) resetSearchState()
}

function importFile(payload) {
  const result = runEditorAction(
    (editor) => editor.importMol(payload.text, payload.format),
    `${payload.fileName} imported locally.`,
  )
  if (result) resetSearchState()
}

function exportSmiles() {
  const smiles = runEditorAction((editor) => editor.exportSmiles())
  if (smiles) setFeedback({ type: 'success', message: 'SMILES exported to the preview.' })
}

function exportMol() {
  const molfile = runEditorAction((editor) => editor.downloadMol())
  if (molfile) setFeedback({ type: 'success', message: 'humeta-structure.mol downloaded.' })
}

function handleUserModeChange(nextMode) {
  if (!VALID_MODES.has(nextMode) || nextMode === mode.value) return
  router.push({ query: { ...route.query, mode: nextMode } })
}

function clearFilters() {
  compareCharge.value = true
  compareMass.value = false
  similarityThreshold.value = 0.7
  sortOrder.value = 'relevance'
  pageSize.value = 6
  resetSearchState()
}

function scrollToResults() {
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  resultsRef.value?.scrollIntoView({
    behavior: reducedMotion ? 'auto' : 'smooth',
    block: 'start',
  })
}

async function executeSearch({ scroll = true } = {}) {
  if (!isEditorReady.value || !editorRef.value) {
    setFeedback({ type: 'error', message: 'Kekule.js is not ready yet.' })
    return
  }

  const molecules = editorRef.value.getCurrentMolecules?.() || []
  const queryMolecule = molecules[0]
  if (!queryMolecule?.getNodeCount?.()) {
    setFeedback({ type: 'error', message: 'Draw or import a structure first.' })
    return
  }

  const activeToken = ++searchToken
  currentPage.value = 1
  searchResults.value = []
  searchState.value = 'searching'
  if (molecules.length > 1) {
    setFeedback({ type: 'info', message: 'Only the first molecule will be used.' })
  } else {
    setFeedback({ type: 'info', message: 'Comparing against the local demonstration dataset.' })
  }

  await nextTick()
  await new Promise((resolve) => {
    searchFrame = window.requestAnimationFrame(resolve)
  })
  if (isUnmounted || activeToken !== searchToken) return

  try {
    const matches = search(queryMolecule, {
      mode: mode.value,
      compareCharge: compareCharge.value,
      compareMass: compareMass.value,
      similarityThreshold: similarityThreshold.value,
    })
    if (activeToken !== searchToken) return

    searchResults.value = matches
    searchState.value = matches.length ? 'success' : 'empty'
    setFeedback({
      type: matches.length ? 'success' : 'info',
      message: matches.length
        ? `${matches.length} local ${matches.length === 1 ? 'match' : 'matches'} found.`
        : 'No local matches found. Try another mode or structure.',
    })
  } catch (error) {
    if (activeToken !== searchToken) return
    searchResults.value = []
    searchState.value = 'error'
    setFeedback({ type: 'error', message: error.message || 'Structure search could not be completed.' })
  }

  if (scroll) {
    await nextTick()
    scrollToResults()
  }
}

watch(
  () => route.query.mode,
  (queryMode) => {
    const normalizedMode = typeof queryMode === 'string' && VALID_MODES.has(queryMode)
      ? queryMode
      : 'substructure'

    if (queryMode !== normalizedMode) {
      router.replace({ query: { ...route.query, mode: normalizedMode } })
    }

    if (mode.value !== normalizedMode) {
      mode.value = normalizedMode
      sortOrder.value = 'relevance'
      resetSearchState()
      if (isEditorReady.value) setFeedback({ type: 'info', message: '' })
    }
  },
  { immediate: true },
)

watch([compareCharge, compareMass, similarityThreshold], () => {
  currentPage.value = 1
  if (searchState.value === 'success' || searchState.value === 'empty') {
    executeSearch({ scroll: false })
  }
})

watch([sortOrder, pageSize], () => {
  currentPage.value = 1
})

watch(
  () => sortedResults.value.length,
  (total) => {
    const maximumPage = Math.max(1, Math.ceil(total / pageSize.value))
    if (currentPage.value > maximumPage) currentPage.value = maximumPage
  },
)

onBeforeUnmount(() => {
  isUnmounted = true
  searchToken += 1
  window.cancelAnimationFrame(searchFrame)
  clearCache()
  searchResults.value = []
  kekuleRef.value = null
})
</script>

<template>
  <div class="structure-page">
    <HeaderNav variant="light" />

    <section class="structure-banner">
      <div class="structure-banner__inner page-container">
        <h1>Structure search</h1>
        <p>Choose a comparison method and search the Humeta demonstration dataset</p>
      </div>
    </section>

    <main class="structure-main page-container">
      <StructureSearchTabs :model-value="mode" @update:model-value="handleUserModeChange" />

      <div class="workspace-grid">
        <section class="editor-card" aria-label="Chemical structure editor">
          <StructureSearchActions
            :can-search="summary.hasStructure"
            :disabled="!isEditorReady"
            :searching="searchState === 'searching'"
            @clear="clearStructure"
            @load-example="loadExample"
            @search="executeSearch()"
          />

          <KekuleStructureEditor
            ref="editorRef"
            @initialization-error="handleInitializationError"
            @ready="handleReady"
            @structure-change="handleStructureChange"
          />

          <div
            v-if="feedback.message && !['success', 'empty'].includes(searchState)"
            class="feedback-bar"
            :class="feedbackClass"
            :role="feedback.type === 'error' ? 'alert' : 'status'"
            aria-live="polite"
          >
            <span aria-hidden="true">{{ feedback.type === 'error' ? '!' : 'i' }}</span>
            <p>{{ feedback.message }}</p>
          </div>
        </section>

        <aside class="structure-sidebar" aria-label="Search settings and structure data">
          <StructureSearchOptions
            :mode="mode"
            :compare-charge="compareCharge"
            :compare-mass="compareMass"
            :similarity-threshold="similarityThreshold"
            :sort-order="sortOrder"
            :page-size="pageSize"
            @update:compare-charge="compareCharge = $event"
            @update:compare-mass="compareMass = $event"
            @update:similarity-threshold="similarityThreshold = $event"
            @update:sort-order="sortOrder = $event"
            @update:page-size="pageSize = $event"
          />

          <StructureImportPanel
            :disabled="!isEditorReady"
            @feedback="setFeedback"
            @import-file="importFile"
            @import-smiles="importSmiles"
          />

          <StructureDataPreview
            :summary="summary"
            @feedback="setFeedback"
          />
        </aside>
      </div>

      <div ref="resultsRef">
        <StructureSearchResults
          :Kekule="kekuleRef"
          :current-page="currentPage"
          :mode-label="modeLabel"
          :loading="visibleLoading"
          :page-size="pageSize"
          :results="visibleResults"
          :sort-order="sortOrder"
          :state="searchState"
          :total="sortedResults.length"
          @clear-filters="clearFilters"
          @load-example="loadExample"
          @update:current-page="currentPage = $event"
          @update:sort-order="sortOrder = $event"
        />
      </div>
    </main>

    <FooterSection variant="compact" />
  </div>
</template>

<style scoped>
.structure-page {
  --structure-heading: #173b4d;
  --structure-label: #5d7c8a;
  --structure-border: #dbe6eb;
  --structure-divider: #edf2f4;
  min-width: 0;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  overflow-x: hidden;
  background: #f3f7f9;
}

.structure-banner {
  position: relative;
  overflow: hidden;
  color: #fff;
  background: var(--humeta-hero-gradient);
}

.structure-banner::before,
.structure-banner::after {
  content: '';
  position: absolute;
  border: 1px solid rgba(160, 231, 255, 0.16);
  border-radius: 50%;
  pointer-events: none;
}

.structure-banner::before {
  width: 560px;
  height: 220px;
  right: -70px;
  top: -145px;
  transform: rotate(-9deg);
}

.structure-banner::after {
  width: 360px;
  height: 180px;
  right: 14%;
  bottom: -154px;
}

.structure-banner__inner {
  position: relative;
  z-index: 1;
  padding-block: 8px 9px;
}

.structure-banner h1 {
  font-size: clamp(25px, 2.5vw, 33px);
  font-weight: 600;
  line-height: 1.15;
}

.structure-banner p {
  margin-top: 7px;
  color: rgba(255, 255, 255, 0.83);
  font-size: 13px;
}

.structure-main {
  flex: 1 0 auto;
  max-width: 1240px;
  padding-bottom: 44px;
}

.structure-main :deep(.mode-card) {
  margin-bottom: 0;
  border-bottom-right-radius: 0;
  border-bottom-left-radius: 0;
}

.workspace-grid {
  min-width: 0;
  display: grid;
  grid-template-columns: minmax(0, 1fr);
  align-items: start;
  gap: 0;
}

.editor-card {
  min-width: 0;
  padding: 20px;
  border: 1px solid var(--structure-border);
  border-top: 0;
  border-bottom: 0;
  border-radius: 0;
  background: #fff;
  box-shadow: none;
}

.feedback-bar {
  min-width: 0;
  display: flex;
  align-items: center;
  gap: 7px;
  margin-top: 11px;
  padding: 7px 9px;
  border: 1px solid #d7e4e9;
  border-radius: 4px;
  color: #5c7581;
  background: #f7fafb;
  font-size: 13px;
  line-height: 1.45;
}

.feedback-bar > span {
  width: 14px;
  height: 14px;
  flex: 0 0 auto;
  display: grid;
  place-items: center;
  border: 1px solid currentColor;
  border-radius: 50%;
  opacity: 0.72;
  font-size: 10px;
  font-weight: 700;
}

.feedback-bar--success {
  color: #557567;
  border-color: #dbe8e2;
  background: #f8fbf9;
}

.feedback-bar--error {
  color: #a23e3e;
  border-color: #eccdcd;
  background: #fff6f6;
}

.structure-sidebar {
  min-width: 0;
  display: grid;
  gap: 0;
}

.structure-sidebar :deep(.options-card) {
  border-radius: 6px 6px 0 0;
}

.structure-sidebar :deep(.panel-card) {
  border-radius: 0;
}

.structure-sidebar :deep(.preview-card) {
  border-radius: 0 0 6px 6px;
}

.structure-sidebar :deep(.preview-card),
.structure-sidebar :deep(.panel-card) {
  border-top: 0;
}

.structure-main :deep(.search-results) {
  margin-top: 0;
  border-top-left-radius: 0;
  border-top-right-radius: 0;
}

.structure-page :deep(.result-state--idle),
.structure-page :deep(.result-state--empty) {
  min-height: 144px;
  padding-block: 12px;
}

@media (min-width: 920px) {
  .workspace-grid {
    grid-template-columns: minmax(0, 2.7fr) minmax(260px, 1fr);
    align-items: stretch;
    column-gap: 16px;
  }

  .editor-card {
    display: flex;
    flex-direction: column;
  }

  .structure-sidebar {
    height: 100%;
  }

  .structure-sidebar :deep(.options-card) {
    border-top: 0;
  }

  .editor-card :deep(.editor-shell) {
    height: auto;
    min-height: 360px;
    flex: 1 1 auto;
  }
}

@media (max-width: 767px) {
  .structure-banner__inner {
    padding-block: 8px 9px;
  }

  .structure-banner p {
    max-width: 330px;
    font-size: 12px;
    line-height: 1.5;
  }

  .structure-main {
    padding-bottom: 28px;
  }

  .editor-card {
    padding: 13px;
  }
}
</style>
