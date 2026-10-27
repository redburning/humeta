<script setup>
import { computed, nextTick, onBeforeUnmount, ref, shallowRef, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import FooterSection from '../components/layout/FooterSection.vue'
import HeaderNav from '../components/layout/HeaderNav.vue'
import Ms1SearchPanel from '../components/spectrum/Ms1SearchPanel.vue'
import Ms2SpectrumInput from '../components/spectrum/Ms2SpectrumInput.vue'
import SpectrumQuerySummary from '../components/spectrum/SpectrumQuerySummary.vue'
import SpectrumSearchActions from '../components/spectrum/SpectrumSearchActions.vue'
import SpectrumSearchOptions from '../components/spectrum/SpectrumSearchOptions.vue'
import SpectrumSearchResults from '../components/spectrum/SpectrumSearchResults.vue'
import SpectrumSearchTabs from '../components/spectrum/SpectrumSearchTabs.vue'
import { useLocalSpectrumSearch } from '../composables/useLocalSpectrumSearch'
import { useSpectrumParser } from '../composables/useSpectrumParser'
import { SPECTRUM_LIBRARY_NAME, TRYPTOPHAN_EXAMPLE } from '../data/spectrumSearchData'

const VALID_MODES = new Set(['ms1', 'entropy', 'dot-product'])
const MODE_LABELS = Object.freeze({
  ms1: 'MS1 Exact m/z',
  entropy: 'Unweighted entropy similarity',
  'dot-product': 'Dot-product score',
})
const ADDUCTS = Object.freeze({
  positive: Object.freeze(['[M+H]+', '[M+Na]+', '[M+NH4]+']),
  negative: Object.freeze(['[M-H]-', '[M+Cl]-']),
})
const DEFAULT_MS1 = Object.freeze({
  queryMz: '', polarity: 'positive', adduct: '[M+H]+', tolerance: 10, toleranceUnit: 'ppm', sortOrder: 'mass-error', pageSize: 4,
})
const DEFAULT_MS2 = Object.freeze({
  precursorMz: '', ionMode: 'positive', adduct: '[M+H]+', precursorTolerance: 10, precursorToleranceUnit: 'ppm',
  fragmentTolerance: 0.02, fragmentToleranceUnit: 'Da', minimumMatchedPeaks: 3, minimumScore: 0.6,
  library: SPECTRUM_LIBRARY_NAME, pageSize: 4, sortOrder: 'relevance', minimumRelativeIntensity: 1,
  maximumPeakCount: 200, removePrecursorPeak: false, normalizeSpectrum: true,
})

const route = useRoute()
const router = useRouter()
const resultsElement = ref(null)
const queryElement = ref(null)
const mode = ref('entropy')
const ms1Parameters = ref({ ...DEFAULT_MS1 })
const ms2Parameters = ref({ ...DEFAULT_MS2 })
const inputMethod = ref('paste')
const peakText = ref('')
const rawPeaks = shallowRef([])
const inputMetadata = ref({})
const inputErrors = ref([])
const feedback = ref({ type: 'info', message: '' })
const searchState = ref('idle')
const searchResults = shallowRef([])
const currentPage = ref(1)
let searchToken = 0
let searchTimer = 0
let isUnmounted = false

const { cleanSpectrum, calculateSearchWindow, searchMs1, searchMs2 } = useLocalSpectrumSearch()
const { parsePlainPeakList, parseSpectrumFile, serializePeaks } = useSpectrumParser()

const isMs1 = computed(() => mode.value === 'ms1')
const activeParameters = computed(() => isMs1.value ? ms1Parameters.value : ms2Parameters.value)
const activeAdductOptions = computed(() => ADDUCTS[isMs1.value ? ms1Parameters.value.polarity : ms2Parameters.value.ionMode])
const cleanedQuery = computed(() => cleanSpectrum(rawPeaks.value, {
  minimumRelativeIntensity: Number(ms2Parameters.value.minimumRelativeIntensity),
  maximumPeakCount: Number(ms2Parameters.value.maximumPeakCount),
  removePrecursorPeak: ms2Parameters.value.removePrecursorPeak,
  precursorMz: Number(ms2Parameters.value.precursorMz),
  precursorExclusionDa: ms2Parameters.value.fragmentToleranceUnit === 'ppm'
    ? Number(ms2Parameters.value.precursorMz) * Number(ms2Parameters.value.fragmentTolerance) / 1e6
    : Number(ms2Parameters.value.fragmentTolerance),
}))

function positiveNumberError(value, label) {
  const number = Number(value)
  if (value === '' || value === null || value === undefined) return `${label} is required.`
  if (!Number.isFinite(number) || number <= 0) return `${label} must be a finite positive number.`
  return ''
}

const ms1Errors = computed(() => ({
  queryMz: positiveNumberError(ms1Parameters.value.queryMz, 'Exact m/z'),
  tolerance: positiveNumberError(ms1Parameters.value.tolerance, 'Mass tolerance'),
}))
const ms2Errors = computed(() => {
  const parameters = ms2Parameters.value
  const errors = {
    precursorMz: positiveNumberError(parameters.precursorMz, 'Precursor m/z'),
    precursorTolerance: positiveNumberError(parameters.precursorTolerance, 'Precursor tolerance'),
    fragmentTolerance: positiveNumberError(parameters.fragmentTolerance, 'Fragment tolerance'),
    minimumMatchedPeaks: '', minimumScore: '', minimumRelativeIntensity: '', maximumPeakCount: '',
  }
  if (!Number.isInteger(Number(parameters.minimumMatchedPeaks)) || Number(parameters.minimumMatchedPeaks) < 1) errors.minimumMatchedPeaks = 'Minimum matched peaks must be a positive integer.'
  if (!Number.isFinite(Number(parameters.minimumScore)) || Number(parameters.minimumScore) < 0 || Number(parameters.minimumScore) > 1) errors.minimumScore = 'Minimum score must be between 0 and 1.'
  if (!Number.isFinite(Number(parameters.minimumRelativeIntensity)) || Number(parameters.minimumRelativeIntensity) < 0 || Number(parameters.minimumRelativeIntensity) > 100) errors.minimumRelativeIntensity = 'Minimum relative intensity must be between 0 and 100.'
  if (!Number.isInteger(Number(parameters.maximumPeakCount)) || Number(parameters.maximumPeakCount) < 2) errors.maximumPeakCount = 'Maximum peak count must be an integer of at least 2.'
  return errors
})
const canSearch = computed(() => {
  const errors = isMs1.value ? ms1Errors.value : ms2Errors.value
  return !Object.values(errors).some(Boolean) && (isMs1.value || rawPeaks.value.length >= 2)
})

const spectrumStatistics = computed(() => {
  if (!rawPeaks.value.length) return { peakCount: 0, basePeakMz: '', maximumMz: '', totalIntensity: '' }
  const basePeak = rawPeaks.value.reduce((best, peak) => peak[1] > best[1] ? peak : best, rawPeaks.value[0])
  return {
    peakCount: rawPeaks.value.length,
    basePeakMz: Number(basePeak[0]).toFixed(4),
    maximumMz: Math.max(...rawPeaks.value.map(([mz]) => mz)).toFixed(4),
    totalIntensity: rawPeaks.value.reduce((sum, [, intensity]) => sum + intensity, 0).toFixed(2),
  }
})
const querySummary = computed(() => {
  if (isMs1.value) {
    const queryMz = Number(ms1Parameters.value.queryMz)
    const tolerance = Number(ms1Parameters.value.tolerance)
    const valid = !ms1Errors.value.queryMz && !ms1Errors.value.tolerance
    const window = valid ? calculateSearchWindow(queryMz, tolerance, ms1Parameters.value.toleranceUnit) : null
    return {
      queryMz: valid ? queryMz.toFixed(4) : '',
      polarity: ms1Parameters.value.polarity,
      adduct: ms1Parameters.value.adduct,
      tolerance: `${ms1Parameters.value.tolerance} ${ms1Parameters.value.toleranceUnit}`,
      searchWindow: window ? `${window.minimum.toFixed(6)} – ${window.maximum.toFixed(6)} m/z` : '—',
    }
  }
  return {
    ...spectrumStatistics.value,
    precursorMz: ms2Parameters.value.precursorMz,
    ionMode: ms2Parameters.value.ionMode,
    adduct: ms2Parameters.value.adduct,
  }
})
const queryLine = computed(() => {
  if (isMs1.value) return `${querySummary.value.queryMz || 'No m/z'} · ${ms1Parameters.value.polarity} · ${ms1Parameters.value.adduct} · ${ms1Parameters.value.tolerance} ${ms1Parameters.value.toleranceUnit}`
  return `${MODE_LABELS[mode.value]} · precursor ${ms2Parameters.value.precursorMz || '—'} · fragment tolerance ${ms2Parameters.value.fragmentTolerance} ${ms2Parameters.value.fragmentToleranceUnit} · minimum ${ms2Parameters.value.minimumMatchedPeaks} peaks`
})

const sortedResults = computed(() => {
  const results = [...searchResults.value]
  const sortOrder = activeParameters.value.sortOrder
  if (sortOrder === 'name') return results.sort((a, b) => a.record.name.localeCompare(b.record.name))
  if (sortOrder === 'reference-mz') return results.sort((a, b) => a.record.precursorMz - b.record.precursorMz)
  if (sortOrder === 'precursor-error') return results.sort((a, b) => Math.abs(a.massError.deltaPpm) - Math.abs(b.massError.deltaPpm))
  if (sortOrder === 'matched-peaks') return results.sort((a, b) => b.matchedPairs.length - a.matchedPairs.length || b.score - a.score)
  if (sortOrder === 'mass-error') return results.sort((a, b) => Math.abs(a.deltaPpm) - Math.abs(b.deltaPpm))
  return results.sort((a, b) => b.score - a.score || Math.abs(a.massError.deltaPpm) - Math.abs(b.massError.deltaPpm))
})
const visibleResults = computed(() => {
  const start = (currentPage.value - 1) * Number(activeParameters.value.pageSize)
  return sortedResults.value.slice(start, start + Number(activeParameters.value.pageSize))
})

function clearResults() {
  searchToken += 1
  window.clearTimeout(searchTimer)
  searchResults.value = []
  searchState.value = 'idle'
  currentPage.value = 1
}

function setFeedback(type, message) {
  feedback.value = { type, message }
}

function resetMs2Input() {
  peakText.value = ''
  rawPeaks.value = []
  inputMetadata.value = {}
  inputErrors.value = []
}

function resetCurrentMode() {
  if (isMs1.value) ms1Parameters.value = { ...DEFAULT_MS1 }
  else {
    ms2Parameters.value = { ...DEFAULT_MS2 }
    inputMethod.value = 'paste'
    resetMs2Input()
  }
  clearResults()
  setFeedback('info', '')
}

function updateMs1(field, value) {
  ms1Parameters.value = { ...ms1Parameters.value, [field]: value }
}

function updateMs1Polarity(polarity) {
  ms1Parameters.value = { ...ms1Parameters.value, polarity, adduct: ADDUCTS[polarity][0] }
}

function updateMs2Parameters(parameters) {
  const ionChanged = parameters.ionMode !== ms2Parameters.value.ionMode
  ms2Parameters.value = {
    ...parameters,
    adduct: ionChanged ? ADDUCTS[parameters.ionMode][0] : parameters.adduct,
  }
}

function updateActiveParameters(parameters) {
  if (isMs1.value) ms1Parameters.value = parameters
  else updateMs2Parameters(parameters)
}

function applyParsedSpectrum(parsed, sourceMetadata = {}) {
  if (parsed.errors.length) {
    inputErrors.value = parsed.errors
    setFeedback('error', parsed.errors[0].message)
    return false
  }
  rawPeaks.value = parsed.peaks.map(([mz, intensity]) => [mz, intensity])
  peakText.value = serializePeaks(parsed.peaks)
  inputErrors.value = []
  inputMetadata.value = { ...sourceMetadata, ...parsed.metadata, format: parsed.format }
  const nextParameters = { ...ms2Parameters.value }
  if (Number.isFinite(parsed.metadata.precursorMz) && parsed.metadata.precursorMz > 0) nextParameters.precursorMz = parsed.metadata.precursorMz
  if (parsed.metadata.ionMode && ADDUCTS[parsed.metadata.ionMode]) {
    nextParameters.ionMode = parsed.metadata.ionMode
    nextParameters.adduct = ADDUCTS[parsed.metadata.ionMode].includes(parsed.metadata.adduct)
      ? parsed.metadata.adduct
      : ADDUCTS[parsed.metadata.ionMode][0]
  } else if (parsed.metadata.adduct && activeAdductOptions.value.includes(parsed.metadata.adduct)) nextParameters.adduct = parsed.metadata.adduct
  ms2Parameters.value = nextParameters
  clearResults()
  const warning = parsed.warnings[0]
  setFeedback(warning ? 'info' : 'success', warning || `${parsed.peaks.length} peaks loaded locally.`)
  return true
}

function parsePastedPeaks() {
  applyParsedSpectrum(parsePlainPeakList(peakText.value), { title: 'Pasted peak list' })
}

function loadTryptophanExample() {
  const parsed = { peaks: TRYPTOPHAN_EXAMPLE.peaks, errors: [], warnings: [], metadata: { title: TRYPTOPHAN_EXAMPLE.title, precursorMz: TRYPTOPHAN_EXAMPLE.precursorMz, ionMode: TRYPTOPHAN_EXAMPLE.ionMode, adduct: TRYPTOPHAN_EXAMPLE.adduct }, format: 'plain' }
  applyParsedSpectrum(parsed)
  ms2Parameters.value = { ...ms2Parameters.value, precursorMz: TRYPTOPHAN_EXAMPLE.precursorMz, ionMode: TRYPTOPHAN_EXAMPLE.ionMode, adduct: TRYPTOPHAN_EXAMPLE.adduct }
}

async function handleFile(file) {
  if (file.size > 2 * 1024 * 1024) {
    inputErrors.value = [{ line: 0, message: 'The local file exceeds the 2 MB limit.' }]
    setFeedback('error', 'The local file exceeds the 2 MB limit.')
    return
  }
  try {
    const text = await file.text()
    applyParsedSpectrum(parseSpectrumFile({ name: file.name, size: file.size, text }), { fileName: file.name })
  } catch {
    inputErrors.value = [{ line: 0, message: 'The local file could not be read.' }]
    setFeedback('error', 'The local file could not be read.')
  }
}

function clearSpectrumInput() {
  resetMs2Input()
  clearResults()
  setFeedback('info', '')
}

async function executeSearch() {
  if (!canSearch.value) {
    searchState.value = 'error'
    setFeedback('error', 'Review the inline query errors before searching.')
    return
  }

  const activeToken = ++searchToken
  searchState.value = 'searching'
  searchResults.value = []
  currentPage.value = 1
  setFeedback('info', 'Searching the local deterministic demonstration data.')
  await nextTick()
  await new Promise((resolve) => { searchTimer = window.setTimeout(resolve, 35) })
  if (isUnmounted || activeToken !== searchToken) return

  try {
    const matches = isMs1.value
      ? searchMs1(ms1Parameters.value)
      : searchMs2(rawPeaks.value, ms2Parameters.value, mode.value)
    if (activeToken !== searchToken) return
    searchResults.value = matches
    searchState.value = matches.length ? 'success' : 'empty'
    setFeedback(matches.length ? 'success' : 'info', matches.length ? `${matches.length} local ${matches.length === 1 ? 'match' : 'matches'} found.` : 'No local demonstration matches found.')
    await nextTick()
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    resultsElement.value?.scrollIntoView({ behavior: reducedMotion ? 'auto' : 'smooth', block: 'start' })
  } catch (error) {
    searchState.value = 'error'
    setFeedback('error', error.message || 'The local search could not be completed.')
  }
}

async function useAsQuery(record) {
  peakText.value = serializePeaks(record.peaks)
  rawPeaks.value = record.peaks.map(([mz, intensity]) => [mz, intensity])
  inputMetadata.value = { title: `${record.name} local demonstration reference`, format: 'library' }
  inputErrors.value = []
  inputMethod.value = 'paste'
  ms2Parameters.value = { ...ms2Parameters.value, precursorMz: record.precursorMz, ionMode: record.polarity, adduct: record.adduct }
  clearResults()
  setFeedback('success', `${record.name} reference spectrum loaded as the local query.`)
  await nextTick()
  queryElement.value?.scrollIntoView({ behavior: 'auto', block: 'start' })
}

function handleUserModeChange(nextMode) {
  if (!VALID_MODES.has(nextMode) || nextMode === mode.value) return
  router.push({ query: { ...route.query, mode: nextMode } })
}

watch(
  () => route.query.mode,
  (routeMode) => {
    const normalized = VALID_MODES.has(routeMode) ? routeMode : 'entropy'
    if (routeMode !== normalized) {
      router.replace({ query: { ...route.query, mode: normalized } })
      return
    }
    if (mode.value === normalized) return
    mode.value = normalized
    resetCurrentMode()
  },
  { immediate: true },
)

watch(
  () => ms1Parameters.value.polarity,
  (polarity) => {
    if (!ADDUCTS[polarity].includes(ms1Parameters.value.adduct)) updateMs1('adduct', ADDUCTS[polarity][0])
  },
)

watch(
  () => ms2Parameters.value.ionMode,
  (ionMode) => {
    if (!ADDUCTS[ionMode].includes(ms2Parameters.value.adduct)) ms2Parameters.value = { ...ms2Parameters.value, adduct: ADDUCTS[ionMode][0] }
  },
)

watch(
  () => isMs1.value
    ? [ms1Parameters.value.queryMz, ms1Parameters.value.polarity, ms1Parameters.value.adduct, ms1Parameters.value.tolerance, ms1Parameters.value.toleranceUnit].join('|')
    : [rawPeaks.value.map((peak) => peak.join(':')).join(','), ms2Parameters.value.precursorMz, ms2Parameters.value.ionMode, ms2Parameters.value.adduct, ms2Parameters.value.precursorTolerance, ms2Parameters.value.precursorToleranceUnit, ms2Parameters.value.fragmentTolerance, ms2Parameters.value.fragmentToleranceUnit, ms2Parameters.value.minimumMatchedPeaks, ms2Parameters.value.minimumScore, ms2Parameters.value.minimumRelativeIntensity, ms2Parameters.value.maximumPeakCount, ms2Parameters.value.removePrecursorPeak, ms2Parameters.value.normalizeSpectrum].join('|'),
  () => { if (searchState.value !== 'idle') clearResults() },
)

watch(
  () => [activeParameters.value.sortOrder, activeParameters.value.pageSize],
  () => { currentPage.value = 1 },
)

watch(
  () => sortedResults.value.length,
  (total) => {
    const lastPage = Math.max(1, Math.ceil(total / Number(activeParameters.value.pageSize)))
    if (currentPage.value > lastPage) currentPage.value = lastPage
  },
)

onBeforeUnmount(() => {
  isUnmounted = true
  searchToken += 1
  window.clearTimeout(searchTimer)
  searchResults.value = []
  rawPeaks.value = []
})
</script>

<template>
  <div class="spectrum-page">
    <HeaderNav variant="light" />

    <section class="spectrum-banner">
      <div class="spectrum-banner__inner page-container">
        <p class="spectrum-banner__kicker">MASS SPECTRAL DATABASE</p>
        <h1>Spectrum search</h1>
        <p>Search accurate mass and tandem spectra in the Humeta local demonstration library</p>
      </div>
    </section>

    <nav class="breadcrumb page-container" aria-label="Breadcrumb">
      <RouterLink to="/">Home</RouterLink><span aria-hidden="true">/</span><span aria-current="page">Spectrum search</span>
    </nav>

    <main class="spectrum-main page-container">
      <p class="local-note">Searches are performed entirely in this browser against a local deterministic demonstration dataset. No production backend or spectral library is connected, no spectrum or file is uploaded, and results must not be used for formal metabolite identification.</p>
      <SpectrumSearchTabs :model-value="mode" @update:model-value="handleUserModeChange" />

      <div id="spectrum-search-panel" ref="queryElement" class="workspace" role="tabpanel" :aria-labelledby="`spectrum-tab-${mode}`">
        <div class="workspace__query">
          <Ms1SearchPanel
            v-if="isMs1"
            :query-mz="ms1Parameters.queryMz"
            :polarity="ms1Parameters.polarity"
            :adduct="ms1Parameters.adduct"
            :adduct-options="activeAdductOptions"
            :error="ms1Errors.queryMz"
            @update:query-mz="updateMs1('queryMz', $event)"
            @update:polarity="updateMs1Polarity"
            @update:adduct="updateMs1('adduct', $event)"
          />
          <Ms2SpectrumInput
            v-else
            :input-method="inputMethod"
            :peak-text="peakText"
            :errors="inputErrors"
            :display-peaks="cleanedQuery.displayPeaks"
            @update:input-method="inputMethod = $event"
            @update:peak-text="peakText = $event"
            @load-example="loadTryptophanExample"
            @parse="parsePastedPeaks"
            @clear="clearSpectrumInput"
            @file="handleFile"
          />

          <SpectrumSearchActions :can-search="canSearch" :searching="searchState === 'searching'" @reset="resetCurrentMode" @search="executeSearch" />
          <div v-if="feedback.message" class="feedback" :class="`feedback--${feedback.type}`" :role="feedback.type === 'error' ? 'alert' : 'status'" aria-live="polite"><span aria-hidden="true">{{ feedback.type === 'error' ? '!' : 'i' }}</span><p>{{ feedback.message }}</p></div>
        </div>

        <aside class="workspace__sidebar" aria-label="Spectrum search settings and query summary">
          <SpectrumSearchOptions :mode="mode" :model-value="activeParameters" :adduct-options="activeAdductOptions" :errors="isMs1 ? ms1Errors : ms2Errors" @update:model-value="updateActiveParameters" />
          <SpectrumQuerySummary :mode="mode" :summary="querySummary" :metadata="inputMetadata" />
        </aside>
      </div>

      <div ref="resultsElement">
        <SpectrumSearchResults
          :mode="mode"
          :state="searchState"
          :results="visibleResults"
          :total="sortedResults.length"
          :current-page="currentPage"
          :page-size="Number(activeParameters.pageSize)"
          :query-line="queryLine"
          @update:current-page="currentPage = $event"
          @use-query="useAsQuery"
        />
      </div>
    </main>
    <FooterSection variant="compact" />
  </div>
</template>

<style scoped>
.spectrum-page { min-width: 0; min-height: 100vh; display: flex; flex-direction: column; overflow-x: hidden; color: #243d49; background: #f3f7f9; }
.spectrum-banner { position: relative; overflow: hidden; color: #fff; background: linear-gradient(108deg, #004f98 0%, #0787c8 58%, #0064aa 100%); }
.spectrum-banner::before, .spectrum-banner::after { content: ''; position: absolute; border: 1px solid rgba(160,231,255,.16); border-radius: 50%; pointer-events: none; }
.spectrum-banner::before { width: 560px; height: 220px; right: -70px; top: -145px; transform: rotate(-9deg); }
.spectrum-banner::after { width: 360px; height: 180px; right: 14%; bottom: -154px; }
.spectrum-banner__inner { position: relative; z-index: 1; padding-block: 34px 38px; }
.spectrum-banner__kicker { margin: 0 0 7px !important; color: #b7ecff !important; font-size: 10px !important; font-weight: 700; letter-spacing: .15em; }
.spectrum-banner h1 { font-size: clamp(30px, 3.2vw, 42px); font-weight: 600; line-height: 1.15; }
.spectrum-banner p { margin-top: 7px; color: rgba(255,255,255,.83); font-size: 13px; }
.breadcrumb { display: flex; align-items: center; gap: 8px; padding-block: 14px; color: #738793; font-size: 11px; }
.breadcrumb a { color: var(--primary-blue); }
.spectrum-main { flex: 1 0 auto; padding-bottom: 44px; }
.local-note { margin-bottom: 14px; padding: 9px 12px; border-left: 3px solid #71afca; color: #617a85; background: #eaf4f8; font-size: 11px; line-height: 1.5; }
.workspace { min-width: 0; display: grid; align-items: start; gap: 18px; }
.workspace__query, .workspace__sidebar { min-width: 0; }
.workspace__sidebar { display: grid; gap: 14px; }
.feedback { min-width: 0; display: flex; align-items: center; gap: 8px; margin-top: 11px; padding: 8px 10px; border: 1px solid #cbe0e9; border-radius: 4px; color: #496977; background: #f2f8fa; font-size: 11px; }
.feedback > span { width: 16px; height: 16px; flex: 0 0 auto; display: grid; place-items: center; border: 1px solid currentColor; border-radius: 50%; font-size: 9px; font-weight: 700; }
.feedback--success { color: #267957; border-color: #c9e6d8; background: #f2faf6; }
.feedback--error { color: #a23e3e; border-color: #eccdcd; background: #fff6f6; }
@media (min-width: 1024px) { .workspace { grid-template-columns: minmax(0, 2.12fr) minmax(300px, 1fr); } }
@media (max-width: 767px) {
  .spectrum-banner__inner { padding-block: 26px 29px; }
  .spectrum-banner p { max-width: 340px; font-size: 12px; line-height: 1.5; }
  .breadcrumb { padding-block: 12px; }
  .spectrum-main { padding-bottom: 28px; }
}
</style>
