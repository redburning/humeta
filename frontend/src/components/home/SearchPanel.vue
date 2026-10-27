<script setup>
import { computed, nextTick, onBeforeUnmount, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import {
  createSearchQuery,
  serializeSearchQuery,
} from '../../services/searchService'
import SearchToken from './SearchToken.vue'

const router = useRouter()
const keyword = ref('')
const productType = ref('All Products')
const statusMessage = ref('')
const tokens = ref([])
const isSuggestionsOpen = ref(false)
const activeSuggestionIndex = ref(-1)
const searchShell = ref(null)
const tokenInput = ref(null)
const tokenScroller = ref(null)

/** @type {readonly import('../../types/search').SearchToken[]} */
const recommendedTerms = Object.freeze([
  Object.freeze({ label: 'L-色氨酸', value: 'tryptophan', field: 'name' }),
  Object.freeze({ label: 'L-Tryptophan', value: 'tryptophan', field: 'name' }),
  Object.freeze({ label: 'IPTM10630E', value: 'IPTM10630E', field: 'id' }),
  Object.freeze({ label: 'HMDB0000929', value: 'HMDB0000929', field: 'hmdb' }),
  Object.freeze({ label: 'C00078', value: 'C00078', field: 'kegg' }),
  Object.freeze({ label: 'LMFA07070050', value: 'LMFA07070050', field: 'id' }),
  Object.freeze({ label: 'CHEBI:57589', value: 'CHEBI:57589', field: 'chebi' }),
  Object.freeze({ label: 'C11H12N2O2', value: 'C11H12N2O2', field: 'formula' }),
  Object.freeze({
    label: 'QIVBCDIJIAJPQS-VIFPVBQESA-N',
    value: 'QIVBCDIJIAJPQS-VIFPVBQESA-N',
    field: 'inchikey',
  }),
  Object.freeze({
    label: 'C1=CC=C2C(=C1)C(=CN2)C[C@@H](C(=O)O)N',
    value: 'C1=CC=C2C(=C1)C(=CN2)C[C@@H](C(=O)O)N',
    field: 'smiles',
  }),
])

function normalizeSearchText(value) {
  return value.normalize('NFKC').toLocaleLowerCase()
}

const filteredSuggestions = computed(() => {
  const selectedTerms = new Set(tokens.value.map((token) => token.label))
  const filterTerm = normalizeSearchText(keyword.value.trim())

  return recommendedTerms.filter((term) => (
    !selectedTerms.has(term.label)
    && (
      !filterTerm
      || [term.label, term.value]
        .some((value) => normalizeSearchText(value).includes(filterTerm))
    )
  ))
})

function clearStatus() {
  statusMessage.value = ''
}

function openSuggestions() {
  isSuggestionsOpen.value = true
  activeSuggestionIndex.value = -1
}

function closeSuggestions() {
  isSuggestionsOpen.value = false
  activeSuggestionIndex.value = -1
}

function focusTokenInput() {
  tokenInput.value?.focus()
}

function handleTokenFieldClick() {
  focusTokenInput()
  openSuggestions()
}

function handleInput() {
  clearStatus()
  openSuggestions()
}

function shouldKeepSuggestionsOpen() {
  return window.matchMedia('(min-width: 768px)').matches
}

async function scrollInputIntoView() {
  await nextTick()
  if (!tokenScroller.value) return
  tokenScroller.value.scrollLeft = tokenScroller.value.scrollWidth
}

async function addToken(term) {
  if (!term || tokens.value.some((token) => token.label === term.label)) return

  tokens.value.push(term)
  keyword.value = ''
  clearStatus()
  activeSuggestionIndex.value = -1
  isSuggestionsOpen.value = shouldKeepSuggestionsOpen()
  await scrollInputIntoView()
  focusTokenInput()
  isSuggestionsOpen.value = shouldKeepSuggestionsOpen()
}

async function removeToken(index) {
  tokens.value.splice(index, 1)
  clearStatus()
  isSuggestionsOpen.value = shouldKeepSuggestionsOpen()
  activeSuggestionIndex.value = -1
  await scrollInputIntoView()
  focusTokenInput()
  isSuggestionsOpen.value = shouldKeepSuggestionsOpen()
}

function removeLastToken() {
  if (keyword.value || tokens.value.length === 0) return
  removeToken(tokens.value.length - 1)
}

function moveActiveSuggestion(direction) {
  const optionCount = filteredSuggestions.value.length
  if (!optionCount) {
    activeSuggestionIndex.value = -1
    return
  }

  if (!isSuggestionsOpen.value) isSuggestionsOpen.value = true
  const nextIndex = activeSuggestionIndex.value + direction
  activeSuggestionIndex.value = (nextIndex + optionCount) % optionCount
}

function handleInputKeydown(event) {
  if (event.key === 'Tab') {
    closeSuggestions()
    return
  }

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

  if (event.key === 'Backspace' && !keyword.value) {
    removeLastToken()
    return
  }

  if (event.key !== 'Enter') return

  event.preventDefault()
  const activeSuggestion = filteredSuggestions.value[activeSuggestionIndex.value]
  if (isSuggestionsOpen.value && activeSuggestion) {
    addToken(activeSuggestion)
    return
  }

  submitSearch()
}

function handleDocumentClick(event) {
  if (searchShell.value?.contains(event.target)) return
  closeSuggestions()
}

function submitSearch() {
  statusMessage.value = ''
  closeSuggestions()

  const typedKeyword = keyword.value.trim()
  const queryTerms = tokens.value.map((token) => ({
    keyword: token.label,
    normalizedKeyword: token.value,
    field: token.field,
  }))
  if (typedKeyword) queryTerms.push(createSearchQuery(typedKeyword))

  if (queryTerms.length === 0) return

  if (productType.value === 'Structures') {
    router.push({ name: 'structure-search' })
    return
  }

  if (productType.value === 'Spectra') {
    statusMessage.value = 'Spectrum search is currently unavailable.'
    return
  }

  router.push({
    name: 'browser-search',
    query: serializeSearchQuery(queryTerms),
  })
}

onMounted(() => {
  document.addEventListener('click', handleDocumentClick)
})

onBeforeUnmount(() => {
  document.removeEventListener('click', handleDocumentClick)
})
</script>

<template>
  <div class="search-panel">
    <form class="search-form" role="search" @submit.prevent="submitSearch">
      <div
        ref="searchShell"
        class="token-search-shell"
        @click="handleTokenFieldClick"
      >
        <label class="visually-hidden" for="humeta-search">搜索 Humeta</label>
        <div
          ref="tokenScroller"
          class="token-search"
          :class="{
            'has-multiple-tokens': tokens.length > 1,
            'has-long-token': tokens.some((token) => token.label.length > 32),
          }"
        >
          <SearchToken
            v-for="(token, index) in tokens"
            :key="`${token.field}:${token.label}`"
            :value="token.label"
            removable
            role="group"
            :aria-label="`Search token ${token.label}`"
            data-search-token
            @remove="removeToken(index)"
          />

          <input
            id="humeta-search"
            ref="tokenInput"
            v-model="keyword"
            class="token-search__input"
            type="text"
            name="keyword"
            placeholder="Search Humeta..."
            autocomplete="off"
            role="combobox"
            aria-autocomplete="list"
            aria-controls="humeta-search-suggestions"
            :aria-expanded="isSuggestionsOpen"
            :aria-activedescendant="activeSuggestionIndex >= 0
              ? `humeta-search-suggestion-${activeSuggestionIndex}`
              : undefined"
            @focus="openSuggestions"
            @input="handleInput"
            @keydown="handleInputKeydown"
          />
        </div>

        <div
          v-if="isSuggestionsOpen"
          id="humeta-search-suggestions"
          class="search-suggestions"
          role="listbox"
          aria-label="Search suggestions"
          @mousedown.prevent
        >
          <SearchToken
            v-for="(suggestion, index) in filteredSuggestions"
            :id="`humeta-search-suggestion-${index}`"
            :key="`${suggestion.field}:${suggestion.label}`"
            :value="suggestion.label"
            class="search-suggestions__option"
            :class="{ 'is-active': index === activeSuggestionIndex }"
            role="option"
            :aria-selected="index === activeSuggestionIndex"
            tabindex="-1"
            @mouseenter="activeSuggestionIndex = index"
            @select="addToken(suggestion)"
          />
          <p v-if="filteredSuggestions.length === 0" class="search-suggestions__empty">
            No matching recommended terms.
          </p>
        </div>
      </div>

      <button type="button" class="search-button" @click="submitSearch">
        <span>Search</span>
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <circle cx="10.5" cy="10.5" r="6.5" />
          <path d="m15.5 15.5 5 5" />
        </svg>
      </button>
    </form>

    <p v-if="statusMessage" class="search-status" role="status" aria-live="polite">
      {{ statusMessage }}
    </p>
  </div>
</template>

<style scoped>
.search-panel {
  position: relative;
  z-index: 4;
  width: min(1120px, calc(100% - 48px));
  margin: 40px auto 0;
}

.search-form {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 210px;
  height: 62px;
  border: 1px solid #dbe6eb;
  border-radius: 6px;
  background: white;
  box-shadow: 0 4px 14px rgba(20, 60, 90, 0.08);
}

.token-search-shell {
  position: relative;
  min-width: 0;
  height: 100%;
  border-radius: 5px 0 0 5px;
  background: white;
}

.token-search {
  width: 100%;
  height: 100%;
  min-width: 0;
  display: flex;
  align-items: center;
  gap: 8px;
  overflow-x: auto;
  overflow-y: hidden;
  padding: 0 20px;
  border-radius: inherit;
  scrollbar-width: none;
  cursor: text;
}

.token-search::-webkit-scrollbar {
  display: none;
}

.token-search-shell:focus-within .token-search {
  box-shadow: inset 0 0 0 2px rgba(0, 126, 188, 0.4);
}

.token-search__input,
.search-button {
  min-width: 0;
  height: 100%;
  border: 0;
  border-radius: 0;
  font: inherit;
}

.token-search__input {
  flex: 1 0 150px;
  width: 150px;
  padding: 0 8px 0 0;
  color: var(--text-dark);
  background: transparent;
  font-size: 16px;
}

.token-search__input::placeholder {
  color: #8fa1ad;
  opacity: 1;
}

.token-search__input:focus,
.token-search__input:focus-visible {
  outline: 0;
}

:global(#app .token-search__input:focus),
:global(#app .token-search__input:focus-visible) {
  box-shadow: none;
}

.search-suggestions {
  position: absolute;
  z-index: 20;
  top: calc(100% + 8px);
  left: 0;
  width: 100%;
  max-width: 100%;
  max-height: 150px;
  display: flex;
  flex-wrap: wrap;
  align-content: flex-start;
  gap: 12px;
  overflow-x: hidden;
  overflow-y: auto;
  padding: 18px;
  border: 1px solid #b7d9ea;
  border-radius: 6px;
  background: white;
}

.search-suggestions__option {
  margin: 0;
}

.search-suggestions__option.is-long {
  flex: 1 0 100%;
  width: 100%;
}

.search-suggestions__option:hover,
.search-suggestions__option.is-active {
  border-color: #087fbe;
  color: #087fbe;
  background: #fff;
}

.search-suggestions__empty {
  flex: 1 0 100%;
  margin: 0;
  padding: 12px 10px;
  color: #6f838f;
  font-size: 13px;
}

.search-button {
  position: relative;
  display: grid;
  grid-template-columns: 1fr 60px;
  align-items: center;
  padding: 0;
  border-radius: 0 5px 5px 0;
  color: white;
  background: var(--primary-blue);
  font-size: 15.5px;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 180ms ease;
}

.search-button::after {
  content: '';
  position: absolute;
  top: 18px;
  right: 60px;
  bottom: 18px;
  width: 1px;
  background: rgba(255, 255, 255, 0.22);
}

.search-button:hover,
.search-button:focus-visible {
  background: #066da5;
}

.search-button svg {
  width: 22px;
  height: 22px;
  margin: auto;
  fill: none;
  stroke: white;
  stroke-linecap: round;
  stroke-width: 1.8;
}

.search-status {
  width: fit-content;
  max-width: 100%;
  margin: 8px 0 0 auto;
  padding: 7px 10px;
  border: 1px solid rgba(219, 230, 235, 0.92);
  border-radius: 4px;
  color: #425b68;
  background: rgba(255, 255, 255, 0.94);
  font-size: 12.5px;
  line-height: 1.45;
}

@media (max-width: 1024px) {
  .search-panel {
    width: min(940px, calc(100% - 48px));
    margin-top: 38px;
  }

  .search-form {
    grid-template-columns: minmax(0, 1fr) 190px;
  }

}

@media (max-width: 767px) {
  .search-panel {
    width: 100%;
    margin-top: 30px;
  }

  .search-form {
    height: auto;
    grid-template-columns: 1fr;
    gap: 9px;
    border: 0;
    background: transparent;
    box-shadow: none;
  }

  .token-search-shell {
    width: 100%;
    height: 62px;
    border: 1px solid #dbe6eb;
    border-radius: 6px;
  }

  .token-search {
    padding-inline: 14px;
  }

  .token-search__input {
    flex-basis: 132px;
    width: 132px;
    font-size: 15px;
  }

  .token-search.has-multiple-tokens .token-search__input {
    flex-basis: 22px;
    width: 22px;
  }

  .token-search.has-long-token .token-search__input {
    flex-basis: 22px;
    width: 22px;
  }

  .token-search.has-multiple-tokens .token-search__input::placeholder {
    color: transparent;
  }

  .token-search.has-long-token .token-search__input::placeholder {
    color: transparent;
  }

  .search-button {
    width: 100%;
    height: 50px;
    border: 1px solid #dbe6eb;
    border-radius: 6px;
    box-shadow: none;
  }

  .search-button {
    grid-template-columns: 1fr 60px;
  }

  .search-button::after {
    top: 14px;
    bottom: 14px;
  }

  .search-suggestions {
    max-height: 226px;
  }

  .search-status {
    margin-right: auto;
    text-align: center;
  }
}
</style>
