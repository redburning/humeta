<script setup>
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import {
  DEFAULT_BROWSER_PRODUCT_TYPE,
  normalizeBrowserProductType,
} from '../../data/browserSearchOptions'
import { searchFieldLabel } from '../../data/searchFieldLabels'
import { parseSearchKeyword } from '../../services/searchParser'
import { getSearchSuggestions } from '../../services/searchSuggestion'
import {
  clearSearchHistory,
  getSearchHistory,
  SEARCH_HISTORY_STORAGE_KEY,
  SEARCH_HISTORY_UPDATED_EVENT,
} from '../../services/searchHistory'

const SEARCH_PLACEHOLDERS = Object.freeze([
  'Search by metabolite name',
  'Search by HMDB identifier',
  'Search by molecular formula',
  'Search by KEGG ID',
])
const PLACEHOLDER_ROTATION_INTERVAL = 2800
const SUGGESTION_DEBOUNCE_MS = 180

const props = defineProps({
  keyword: {
    type: String,
    default: '',
  },
  productType: {
    type: String,
    default: DEFAULT_BROWSER_PRODUCT_TYPE,
  },
  variant: {
    type: String,
    default: 'results',
    validator: (value) => ['landing', 'results'].includes(value),
  },
})

const emit = defineEmits({
  search: (payload) => (
    typeof payload?.keyword === 'string'
    && typeof payload.productType === 'string'
  ),
})

const inputRef = ref(null)
const searchFormRef = ref(null)
const localKeyword = ref(props.keyword)
const localProductType = ref(normalizeBrowserProductType(props.productType))
const placeholderIndex = ref(0)
const isDropdownOpen = ref(false)
const activeSuggestionIndex = ref(-1)
const recentSearches = ref([])
const suggestions = ref([])
let placeholderTimer = null
let suggestionTimer = null
let suggestionRequestId = 0
let componentUnmounted = false

const visibleSuggestions = computed(() => (
  isDropdownOpen.value && localKeyword.value.trim() ? suggestions.value : []
))
const isHistoryVisible = computed(() => (
  isDropdownOpen.value && !localKeyword.value.trim()
))
const visibleHistory = computed(() => (
  isHistoryVisible.value ? recentSearches.value : []
))
const activeDropdownItems = computed(() => (
  visibleSuggestions.value.length > 0 ? visibleSuggestions.value : visibleHistory.value
))
const hasDropdown = computed(() => (
  visibleSuggestions.value.length > 0 || isHistoryVisible.value
))
const activeListboxId = computed(() => (
  visibleSuggestions.value.length > 0
    ? 'browser-search-suggestions'
    : visibleHistory.value.length > 0
      ? 'browser-search-history-list'
      : 'browser-search-history'
))

const detectedTypeLabel = computed(() => {
  const keyword = localKeyword.value.trim()
  if (!keyword) return ''

  return searchFieldLabel(parseSearchKeyword(keyword).field)
})

const activePlaceholder = computed(() => SEARCH_PLACEHOLDERS[placeholderIndex.value])

function stopPlaceholderRotation() {
  if (placeholderTimer === null) return
  window.clearInterval(placeholderTimer)
  placeholderTimer = null
}

function startPlaceholderRotation() {
  if (
    placeholderTimer !== null
    || localKeyword.value
    || window.matchMedia('(prefers-reduced-motion: reduce)').matches
  ) return

  placeholderTimer = window.setInterval(() => {
    placeholderIndex.value = (placeholderIndex.value + 1) % SEARCH_PLACEHOLDERS.length
  }, PLACEHOLDER_ROTATION_INTERVAL)
}

watch(
  () => props.keyword,
  (value) => {
    localKeyword.value = value
  },
)

watch(
  () => props.productType,
  (value) => {
    localProductType.value = normalizeBrowserProductType(value)
  },
)

watch(localKeyword, (value) => {
  if (value) stopPlaceholderRotation()
  else startPlaceholderRotation()
  scheduleSuggestions(value)
}, { immediate: true })

watch([suggestions, localKeyword], () => {
  activeSuggestionIndex.value = -1
})

function clearSuggestionTimer() {
  if (suggestionTimer === null) return
  window.clearTimeout(suggestionTimer)
  suggestionTimer = null
}

function scheduleSuggestions(value) {
  const keyword = value.trim()
  clearSuggestionTimer()
  suggestionRequestId += 1
  suggestions.value = []

  if (!keyword) return

  const requestId = suggestionRequestId
  suggestionTimer = window.setTimeout(async () => {
    suggestionTimer = null

    try {
      const items = await getSearchSuggestions(keyword)
      if (componentUnmounted || requestId !== suggestionRequestId) return
      suggestions.value = items
    } catch (error) {
      if (componentUnmounted || requestId !== suggestionRequestId) return
      suggestions.value = []
      console.error('Failed to load search suggestions', error)
    }
  }, SUGGESTION_DEBOUNCE_MS)
}

onMounted(() => {
  refreshHistory()
  startPlaceholderRotation()
  document.addEventListener('pointerdown', handleDocumentPointerDown)
  window.addEventListener('storage', handleStorageChange)
  window.addEventListener(SEARCH_HISTORY_UPDATED_EVENT, refreshHistory)
})

onBeforeUnmount(() => {
  componentUnmounted = true
  clearSuggestionTimer()
  stopPlaceholderRotation()
  document.removeEventListener('pointerdown', handleDocumentPointerDown)
  window.removeEventListener('storage', handleStorageChange)
  window.removeEventListener(SEARCH_HISTORY_UPDATED_EVENT, refreshHistory)
})

function refreshHistory() {
  recentSearches.value = getSearchHistory()
}

function handleStorageChange(event) {
  if (event.key === SEARCH_HISTORY_STORAGE_KEY || event.key === null) refreshHistory()
}

function openSuggestions() {
  if (!localKeyword.value.trim()) refreshHistory()

  isDropdownOpen.value = true
}

function closeSuggestions() {
  isDropdownOpen.value = false
  activeSuggestionIndex.value = -1
}

function handleDocumentPointerDown(event) {
  if (searchFormRef.value?.contains(event.target)) return
  closeSuggestions()
}

function handleKeywordInput() {
  activeSuggestionIndex.value = -1
  openSuggestions()
}

function suggestionSourceLabel(suggestion) {
  const isSynonym = suggestion.category === 'Metabolite'
    && suggestion.label.normalize('NFKC').toLocaleLowerCase()
      !== suggestion.value.normalize('NFKC').toLocaleLowerCase()

  return isSynonym ? 'Synonym' : suggestion.category
}

async function focusActiveSuggestion() {
  await nextTick()
  if (activeSuggestionIndex.value < 0) return
  document.getElementById(`browser-search-entry-${activeSuggestionIndex.value}`)
    ?.scrollIntoView({ block: 'nearest' })
}

async function moveActiveSuggestion(direction) {
  if (!isDropdownOpen.value) openSuggestions()
  const count = activeDropdownItems.value.length
  if (count === 0) return

  if (activeSuggestionIndex.value < 0) {
    activeSuggestionIndex.value = direction > 0 ? 0 : count - 1
  } else {
    activeSuggestionIndex.value = (activeSuggestionIndex.value + direction + count) % count
  }

  await focusActiveSuggestion()
}

function executeSuggestion(suggestion) {
  if (!suggestion) return

  localKeyword.value = suggestion.label
  closeSuggestions()
  emit('search', {
    keyword: suggestion.label,
    normalizedKeyword: suggestion.value,
    field: suggestion.field,
    productType: normalizeBrowserProductType(localProductType.value),
  })
}

function executeHistory(historyItem) {
  if (!historyItem) return

  localKeyword.value = historyItem.keyword
  closeSuggestions()
  emit('search', {
    keyword: historyItem.keyword,
    normalizedKeyword: historyItem.normalizedKeyword,
    field: historyItem.field,
    productType: normalizeBrowserProductType(localProductType.value),
  })
}

function handleClearHistory() {
  clearSearchHistory()
  refreshHistory()
}

function handleInputKeydown(event) {
  if (event.key === 'ArrowDown') {
    event.preventDefault()
    moveActiveSuggestion(1)
    return
  }

  if (event.key === 'ArrowUp') {
    event.preventDefault()
    moveActiveSuggestion(-1)
    return
  }

  if (event.key === 'Escape') {
    event.preventDefault()
    closeSuggestions()
    return
  }

  if (event.key !== 'Enter') return

  event.preventDefault()
  const activeItem = activeDropdownItems.value[activeSuggestionIndex.value]
  if (activeItem && visibleSuggestions.value.length > 0) executeSuggestion(activeItem)
  else if (activeItem) executeHistory(activeItem)
  else submitSearch()
}

function submitSearch() {
  const keyword = localKeyword.value.trim()

  localKeyword.value = keyword
  closeSuggestions()
  emit('search', {
    keyword,
    productType: normalizeBrowserProductType(localProductType.value),
  })
}
</script>

<template>
  <form
    ref="searchFormRef"
    class="browser-search-form"
    :class="[
      `browser-search-form--${props.variant}`,
      {
        'has-detection': detectedTypeLabel,
        'has-suggestions': hasDropdown,
      },
    ]"
    role="search"
    @submit.prevent="submitSearch"
  >
    <label class="visually-hidden" for="browser-keyword">Search Humeta metabolites</label>
    <input
      id="browser-keyword"
      ref="inputRef"
      v-model="localKeyword"
      type="search"
      name="q"
      :placeholder="activePlaceholder"
      autocomplete="off"
      aria-autocomplete="list"
      :aria-controls="hasDropdown ? activeListboxId : undefined"
      :aria-expanded="hasDropdown"
      :aria-activedescendant="activeSuggestionIndex >= 0
        ? `browser-search-entry-${activeSuggestionIndex}`
        : undefined"
      @focus="openSuggestions"
      @input="handleKeywordInput"
      @keydown="handleInputKeydown"
    />

    <p
      v-if="detectedTypeLabel"
      class="browser-search-detection"
      role="status"
      aria-live="polite"
    >
      <span>Detected:</span> {{ detectedTypeLabel }}
    </p>

    <ul
      v-if="visibleSuggestions.length"
      id="browser-search-suggestions"
      class="browser-search-suggestions"
      role="listbox"
      aria-label="Search suggestions"
      @mousedown.prevent
    >
      <li v-for="(suggestion, index) in visibleSuggestions" :key="`${suggestion.field}:${suggestion.label}`">
        <button
          :id="`browser-search-entry-${index}`"
          type="button"
          class="browser-search-suggestions__option"
          role="option"
          :aria-selected="index === activeSuggestionIndex"
          :class="{ 'is-active': index === activeSuggestionIndex }"
          @mouseenter="activeSuggestionIndex = index"
          @click="executeSuggestion(suggestion)"
        >
          <span class="browser-search-suggestions__source">
            {{ suggestionSourceLabel(suggestion) }}
          </span>
          <span class="browser-search-suggestions__label">{{ suggestion.label }}</span>
        </button>
      </li>
    </ul>

    <section
      v-else-if="isHistoryVisible"
      id="browser-search-history"
      class="browser-search-suggestions browser-search-history"
      aria-labelledby="browser-search-history-title"
      @mousedown.prevent
    >
      <header class="browser-search-history__header">
        <h2 id="browser-search-history-title">Recent searches</h2>
        <button
          type="button"
          class="browser-search-history__clear"
          :disabled="visibleHistory.length === 0"
          @click="handleClearHistory"
        >
          Clear
        </button>
      </header>
      <ul
        v-if="visibleHistory.length"
        id="browser-search-history-list"
        role="listbox"
        aria-label="Recent searches"
      >
        <li v-for="(historyItem, index) in visibleHistory" :key="`${historyItem.field}:${historyItem.keyword}`">
          <button
            :id="`browser-search-entry-${index}`"
            type="button"
            class="browser-search-suggestions__option browser-search-history__item"
            role="option"
            :aria-selected="index === activeSuggestionIndex"
            :class="{ 'is-active': index === activeSuggestionIndex }"
            @mouseenter="activeSuggestionIndex = index"
            @click="executeHistory(historyItem)"
          >
            <span class="browser-search-history__content">
              <span
                class="browser-search-history__value"
                :class="{
                  'browser-search-history__value--structure': historyItem.field === 'inchikey' || historyItem.field === 'smiles',
                  'browser-search-history__value--smiles': historyItem.field === 'smiles',
                }"
                :title="historyItem.keyword"
              >
                {{ historyItem.keyword }}
              </span>
              <span class="browser-search-history__field">
                {{ searchFieldLabel(historyItem.field) }}
              </span>
            </span>
          </button>
        </li>
      </ul>
      <p v-else class="browser-search-history__empty">No recent searches</p>
    </section>

    <button type="submit" class="browser-search-button">
      <span>Search</span>
      <span class="browser-search-button__icon" aria-hidden="true">
        <svg viewBox="0 0 24 24" focusable="false">
          <circle cx="10" cy="10" r="6.4" />
          <path d="m14.8 14.8 5.2 5.2" />
        </svg>
      </span>
    </button>
  </form>
</template>

<style scoped>
.browser-search-form {
  --browser-search-detection-top: 36px;
  --browser-search-detection-left: 24px;
  --browser-search-detection-right: 214px;
  --browser-search-controls-width: 190px;
  position: relative;
  display: grid;
  grid-template-columns: minmax(0, 1fr) 190px;
  width: min(820px, 100%);
  min-height: 56px;
  overflow: hidden;
  border: 1px solid #cddde6;
  border-radius: 5px;
  background: white;
  box-shadow: 0 8px 20px rgba(16, 81, 119, 0.1);
}

.browser-search-form.has-suggestions {
  z-index: 20;
  overflow: visible;
}

.browser-search-form.has-suggestions .browser-search-button {
  border-radius: 0 4px 4px 0;
}

input,
.browser-search-button {
  min-width: 0;
  min-height: 56px;
  border: 0;
  border-radius: 0;
  font: inherit;
}

input {
  width: 100%;
  padding: 0 24px;
  color: #16324f;
  background: white;
  font-size: 16px;
}

input::placeholder {
  color: #94a4ae;
}

.browser-search-form.has-detection input {
  padding-bottom: 16px;
}

.browser-search-detection {
  position: absolute;
  z-index: 1;
  top: var(--browser-search-detection-top);
  right: var(--browser-search-detection-right);
  left: var(--browser-search-detection-left);
  margin: 0;
  overflow: hidden;
  color: #617684;
  font-family: inherit;
  font-size: 12px;
  font-weight: 400;
  line-height: 1;
  pointer-events: none;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.browser-search-detection span {
  color: inherit;
  font: inherit;
}

.browser-search-suggestions {
  position: absolute;
  z-index: 30;
  top: calc(100% + 6px);
  right: var(--browser-search-controls-width);
  left: 0;
  max-height: 292px;
  overflow-x: hidden;
  overflow-y: auto;
  margin: 0;
  padding: 0;
  border: 1px solid #d4e2e9;
  border-radius: 4px;
  background: #fff;
  box-shadow: none;
  font-family: inherit;
  list-style: none;
}

.browser-search-suggestions li {
  margin: 0;
  padding: 0;
}

.browser-search-suggestions li + li {
  border-top: 1px solid #edf2f4;
}

.browser-search-suggestions__option {
  width: 100%;
  min-width: 0;
  display: grid;
  grid-template-columns: 82px minmax(0, 1fr);
  align-items: baseline;
  gap: 10px;
  padding: 9px 12px;
  border: 0;
  border-radius: 0;
  color: #294b5b;
  background: #fff;
  font: inherit;
  text-align: left;
  cursor: pointer;
}

.browser-search-suggestions__option:hover,
.browser-search-suggestions__option.is-active,
.browser-search-suggestions__option:focus-visible {
  color: #087fbe;
  background: #f5fafc;
  outline: 0;
}

.browser-search-history__header {
  min-height: 40px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  padding: 10px 24px;
  border-bottom: 1px solid #dce7ec;
}

.browser-search-history__header h2 {
  margin: 0;
  color: #617684;
  font: inherit;
  font-size: 12px;
  font-weight: 600;
  letter-spacing: normal;
  line-height: 1.4;
}

.browser-search-history__clear {
  margin: 0;
  padding: 2px 0;
  border: 0;
  border-radius: 0;
  color: #617684;
  background: transparent;
  font: inherit;
  font-size: 12px;
  font-weight: 400;
  line-height: 1.4;
  cursor: pointer;
}

.browser-search-history__clear:hover,
.browser-search-history__clear:focus-visible {
  color: #087fbe;
  outline: 0;
  text-decoration: underline;
  text-underline-offset: 2px;
}

.browser-search-history__clear:disabled {
  color: #9aabb4;
  cursor: default;
  text-decoration: none;
}

.browser-search-history {
  padding: 0;
  background: #fff;
}

.browser-search-history ul {
  margin: 0;
  padding: 0;
  list-style: none;
}

.browser-search-history__item {
  height: 52px;
  min-height: 52px;
  grid-template-columns: minmax(0, 1fr);
  align-items: center;
  gap: 0;
  padding: 8px 24px;
  color: #16324f;
}

.browser-search-history__content {
  min-width: 0;
  display: grid;
  gap: 1px;
}

.browser-search-history__value {
  min-width: 0;
  overflow: hidden;
  color: #16324f;
  font-family: inherit;
  font-size: 14px;
  font-weight: 500;
  line-height: 1.3;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.browser-search-history__value--structure {
  font-family: ui-monospace, "SFMono-Regular", Consolas, "Liberation Mono", monospace;
}

.browser-search-history__field {
  min-width: 0;
  overflow: hidden;
  color: #617684;
  font-family: inherit;
  font-size: 12px;
  font-weight: 400;
  line-height: 1.3;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.browser-search-history__item:hover,
.browser-search-history__item.is-active,
.browser-search-history__item:focus-visible {
  color: #16324f;
  background: #f7fafc;
  box-shadow: none;
}

.browser-search-history__item:hover .browser-search-history__value,
.browser-search-history__item.is-active .browser-search-history__value,
.browser-search-history__item:focus-visible .browser-search-history__value {
  color: #16324f;
}

.browser-search-history__empty {
  margin: 0;
  padding: 14px 24px;
  color: #617684;
  font-family: inherit;
  font-size: 12px;
  font-weight: 400;
  line-height: 1.4;
}

.browser-search-suggestions__source {
  color: #6b7e89;
  font-size: 12px;
  font-weight: 400;
  line-height: 1.4;
  white-space: nowrap;
}

.browser-search-suggestions__label {
  min-width: 0;
  color: inherit;
  font-size: 14px;
  font-weight: 400;
  line-height: 1.4;
  overflow-wrap: anywhere;
  word-break: break-word;
}

input:focus {
  outline: 0;
  box-shadow: inset 0 0 0 2px var(--humeta-focus-ring);
}

.browser-search-button {
  padding: 0 24px;
  color: white;
  background: var(--humeta-brand-primary);
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: background-color 160ms ease;
}

.browser-search-button:hover,
.browser-search-button:focus-visible {
  background: var(--humeta-brand-hover);
}

.browser-search-form--results {
  transition:
    border-color var(--humeta-motion-base) var(--humeta-ease-standard),
    box-shadow var(--humeta-motion-base) var(--humeta-ease-standard);
}

.browser-search-form--results:hover {
  border-color: color-mix(in srgb, var(--humeta-action) 24%, #cddde6);
}

.browser-search-form--results:focus-within {
  border-color: color-mix(in srgb, var(--humeta-action) 56%, #cddde6);
  box-shadow:
    0 0 0 2px var(--humeta-focus-ring),
    0 8px 20px rgba(16, 81, 119, 0.1);
}

.browser-search-form--results .browser-search-button {
  position: relative;
  display: grid;
  grid-template-columns: minmax(0, 1fr) 52px;
  align-items: center;
  padding: 0;
}

.browser-search-form--results .browser-search-button:active:not(:disabled) > span {
  transform: translateY(1px);
}

.browser-search-form--results .browser-search-button__icon {
  width: 52px;
}

.browser-search-form--landing {
  --browser-search-detection-top: 44px;
  --browser-search-detection-right: 218px;
  --browser-search-controls-width: 194px;
  grid-template-columns: minmax(0, 1fr) 194px;
  width: 100%;
  height: 66px;
  min-height: 66px;
  box-sizing: border-box;
  border-color: var(--border-color);
  border-radius: 8px;
  box-shadow: 0 6px 20px rgba(7, 94, 158, 0.07);
  transition:
    border-color var(--humeta-motion-base) var(--humeta-ease-standard),
    box-shadow var(--humeta-motion-base) var(--humeta-ease-standard);
}

.browser-search-form--landing.has-suggestions .browser-search-button {
  border-radius: 0 7px 7px 0;
}

.browser-search-form--landing:hover {
  border-color: color-mix(in srgb, var(--humeta-action) 24%, var(--border-color));
}

.browser-search-form--landing:focus-within {
  border-color: color-mix(in srgb, var(--humeta-action) 56%, var(--border-color));
  box-shadow:
    0 0 0 2px var(--humeta-focus-ring),
    0 6px 20px rgba(7, 94, 158, 0.07);
}

.browser-search-form--landing input,
.browser-search-form--landing .browser-search-button {
  height: 100%;
  min-height: 0;
}

.browser-search-form--landing input::placeholder {
  color: #7a909f;
}

.browser-search-form--landing .browser-search-button {
  position: relative;
  display: grid;
  grid-template-columns: minmax(0, 1fr) 60px;
  align-items: center;
  padding: 0;
  background: var(--humeta-brand-primary);
}

.browser-search-form--landing .browser-search-button > span:first-child,
.browser-search-button__icon {
  transition: transform var(--humeta-motion-fast) var(--humeta-ease-out);
}

:global(#app .browser-search-form--landing .browser-search-button:active:not(:disabled)) {
  transform: none;
}

.browser-search-form--landing .browser-search-button:active:not(:disabled) > span:first-child,
.browser-search-form--landing .browser-search-button:active:not(:disabled) .browser-search-button__icon {
  transform: translateY(1px);
}

.browser-search-form--landing .browser-search-button:hover,
.browser-search-form--landing .browser-search-button:focus-visible {
  background: var(--humeta-brand-hover);
}

.browser-search-button__icon {
  position: relative;
  width: 60px;
  height: 100%;
  display: grid;
  place-items: center;
  transition:
    background-color var(--humeta-motion-base) var(--humeta-ease-standard),
    transform var(--humeta-motion-fast) var(--humeta-ease-out);
}

.browser-search-button__icon::before {
  content: '';
  position: absolute;
  top: 18px;
  bottom: 18px;
  left: 0;
  width: 1px;
  background: rgba(255, 255, 255, 0.24);
}

.browser-search-button__icon:hover {
  background: var(--humeta-action-pressed);
}

.browser-search-button__icon svg {
  width: 21px;
  height: 21px;
  fill: none;
  stroke: currentColor;
  stroke-linecap: round;
  stroke-width: 1.8;
}

:global(#app .browser-search-form--landing input:focus),
:global(#app .browser-search-form--landing input:focus-visible) {
  outline: 0;
  box-shadow: none;
}

:global(#app .browser-search-form--results input:focus),
:global(#app .browser-search-form--results input:focus-visible) {
  outline: 0;
  box-shadow: none;
}

:global(#app .browser-search-form--landing .browser-search-button:focus-visible) {
  outline: 0;
}

@media (max-width: 900px) {
  .browser-search-form--landing {
    --browser-search-detection-right: 208px;
    --browser-search-controls-width: 184px;
    grid-template-columns: minmax(0, 1fr) 184px;
  }

  .browser-search-form--landing input {
    padding-inline: 20px;
  }

}

@media (max-width: 560px) {
  .browser-search-form--results {
    --browser-search-detection-top: 36px;
    --browser-search-detection-left: 20px;
    --browser-search-detection-right: 20px;
    grid-template-columns: minmax(0, 1fr);
    height: auto;
    min-height: 0;
    gap: 0;
    overflow: hidden;
    border: 1px solid #cddde6;
    background: white;
    box-shadow: 0 4px 16px rgba(7, 94, 158, 0.06);
  }

  .browser-search-form--results,
  .browser-search-form--landing {
    --browser-search-controls-width: 0px;
  }

  .browser-search-form--results.has-suggestions .browser-search-button {
    border-radius: 0 0 4px 4px;
  }

  .browser-search-form--landing.has-suggestions .browser-search-button {
    border-radius: 0 0 7px 7px;
  }

  .browser-search-suggestions__option {
    grid-template-columns: 72px minmax(0, 1fr);
    gap: 8px;
    padding: 9px 10px;
  }

  .browser-search-history__item {
    height: 56px;
    min-height: 56px;
    grid-template-columns: minmax(0, 1fr);
    gap: 0;
    padding: 4px 24px;
  }

  .browser-search-history__value {
    display: block;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    line-height: 1.15;
  }

  .browser-search-history__value--smiles {
    display: -webkit-box;
    overflow: hidden;
    overflow-wrap: anywhere;
    text-overflow: clip;
    white-space: normal;
    word-break: break-word;
    -webkit-box-orient: vertical;
    -webkit-line-clamp: 2;
  }

  .browser-search-history__field {
    line-height: 1.15;
  }

  .browser-search-form--results input {
    grid-column: 1 / -1;
    height: 56px;
    min-height: 56px;
    padding-inline: 20px;
    border: 0;
    border-bottom: 1px solid #cddde6;
    border-radius: 0;
    box-shadow: none;
  }

  .browser-search-form--results .browser-search-button {
    height: 56px;
    min-height: 56px;
    border: 0;
    border-radius: 0;
    box-shadow: none;
  }

  .browser-search-form--landing {
    --browser-search-detection-top: 36px;
    --browser-search-detection-left: 20px;
    --browser-search-detection-right: 20px;
    grid-template-columns: minmax(0, 1fr);
    height: auto;
    min-height: 0;
    gap: 0;
    overflow: hidden;
    border: 1px solid var(--border-color);
    border-radius: 8px;
    background: white;
    box-shadow: 0 4px 16px rgba(7, 94, 158, 0.06);
  }

  .browser-search-form--landing input {
    grid-column: 1 / -1;
    height: 56px;
    min-height: 56px;
    padding-inline: 20px;
    border: 0;
    border-bottom: 1px solid var(--border-color);
    border-radius: 0;
  }

  .browser-search-form--landing .browser-search-button {
    height: 56px;
    min-height: 56px;
    box-shadow: none;
  }

  .browser-search-form--landing .browser-search-button {
    grid-template-columns: minmax(0, 1fr) 52px;
    border-radius: 0;
  }

  .browser-search-button__icon {
    width: 52px;
  }

  .browser-search-button__icon::before {
    top: 13px;
    bottom: 13px;
  }
}
</style>
