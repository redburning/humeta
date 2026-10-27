<script setup>
import { computed, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import HumetaLoading from '../components/common/HumetaLoading.vue'
import BrowserHero from '../components/browser/BrowserHero.vue'
import MetaboliteResultCard from '../components/browser/MetaboliteResultCard.vue'
import ResultPagination from '../components/browser/ResultPagination.vue'
import FooterSection from '../components/layout/FooterSection.vue'
import HeaderNav from '../components/layout/HeaderNav.vue'
import ResultsSummaryHeader from '../components/ResultsSummaryHeader.vue'
import {
  browserProductTypeQueryValue,
  DEFAULT_BROWSER_PRODUCT_TYPE,
  normalizeBrowserProductType,
} from '../data/browserSearchOptions'
import {
  browseMetabolites,
  createSearchQuery,
  parseSearchRouteQuery,
  searchMetabolites,
  serializeSearchQuery,
} from '../services/searchService'
import { buildSearchExplanation } from '../services/searchExplanation'
import { saveSearch } from '../services/searchHistory'
import { parseSearchKeyword } from '../services/searchParser'
import { useDelayedLoading } from '../composables/useDelayedLoading'
import {
  deduplicateMetaboliteResults,
  normalizePage,
  paginateResults,
  parsePageQuery,
} from '../utils/browserSearchResults'

const RESULTS_PER_PAGE = 4

const route = useRoute()
const router = useRouter()

function queryValue(value) {
  if (Array.isArray(value)) return value[0] ?? ''
  return typeof value === 'string' ? value : ''
}

const searchQueries = computed(() => {
  const queries = parseSearchRouteQuery(route.query.keyword, route.query.field)

  if (route.query.field !== undefined) return queries
  return queries.map((query) => {
    const parsedQuery = parseSearchKeyword(query.keyword)
    return createSearchQuery(query.keyword, parsedQuery.field)
  })
})
const keyword = computed(() => searchQueries.value.map((query) => query.keyword).join(' '))
const hasQuery = computed(() => searchQueries.value.length > 0)
const productType = computed(() => normalizeBrowserProductType(queryValue(route.query.type)))
const isLoadingPreview = computed(() => (
  import.meta.env.DEV && queryValue(route.query.loadingPreview) === '1'
))
const rawMatches = ref([])
const browseResult = ref(null)
const isSearchLoading = ref(false)
const searchError = ref('')
const hasLoadedResults = ref(false)
const { visibleLoading } = useDelayedLoading(isSearchLoading)
let activeSearchRequest = 0

watch(
  [searchQueries, () => (hasQuery.value ? 0 : parsePageQuery(route.query.page))],
  async ([queries, requestedPage]) => {
    const requestId = ++activeSearchRequest
    isSearchLoading.value = true
    searchError.value = ''

    try {
      if (queries.length === 0) {
        const pageResult = await browseMetabolites(requestedPage || 1, RESULTS_PER_PAGE)
        if (requestId !== activeSearchRequest) return

        browseResult.value = pageResult
        rawMatches.value = []
        hasLoadedResults.value = true
        return
      }

      const results = await searchMetabolites(queries)
      if (requestId !== activeSearchRequest) return

      browseResult.value = null
      rawMatches.value = results
      hasLoadedResults.value = true
      if (results.length === 0) return

      const completedQueries = [...queries].reverse()
      completedQueries.forEach((query) => {
        saveSearch({ ...query, label: query.keyword })
      })
    } catch (error) {
      if (requestId !== activeSearchRequest) return

      rawMatches.value = []
      browseResult.value = null
      hasLoadedResults.value = false
      searchError.value = error instanceof Error ? error.message : 'Unable to load metabolites.'
      console.error('Failed to load metabolite search results', error)
    } finally {
      if (requestId === activeSearchRequest) isSearchLoading.value = false
    }
  },
  { immediate: true },
)

const deduplicatedResults = computed(() => deduplicateMetaboliteResults(
  hasQuery.value ? rawMatches.value : (browseResult.value?.items ?? []),
))
const resultCount = computed(() => (
  hasQuery.value
    ? deduplicatedResults.value.length
    : (browseResult.value?.total ?? 0)
))
const totalPages = computed(() => (
  hasQuery.value
    ? Math.ceil(resultCount.value / RESULTS_PER_PAGE)
    : (browseResult.value?.totalPages ?? Math.ceil(resultCount.value / RESULTS_PER_PAGE))
))
const currentPage = computed(() => normalizePage(parsePageQuery(route.query.page), totalPages.value))
const visibleResults = computed(() => (
  hasQuery.value
    ? paginateResults(deduplicatedResults.value, currentPage.value, RESULTS_PER_PAGE)
    : deduplicatedResults.value
))
const explainedResults = computed(() => visibleResults.value.map((result) => ({
  result,
  explanation: hasQuery.value
    ? buildSearchExplanation(result, searchQueries.value)
    : null,
})))

watch(
  [
    () => route.query.keyword,
    () => route.query.field,
    () => route.query.page,
    totalPages,
    hasLoadedResults,
    () => route.query.type,
  ],
  ([rawKeyword, rawField, rawPage, , loaded, rawType]) => {
    if (!loaded) return

    const normalizedPage = currentPage.value
    const isSearchCanonical = hasQuery.value
      ? rawKeyword !== undefined && rawField !== undefined
      : rawKeyword === undefined && rawField === undefined
    const isPageCanonical = normalizedPage === 1
      ? rawPage === undefined
      : typeof rawPage === 'string' && rawPage === String(normalizedPage)
    const normalizedType = productType.value
    const isTypeCanonical = normalizedType === DEFAULT_BROWSER_PRODUCT_TYPE
      ? rawType === undefined
      : typeof rawType === 'string' && rawType === normalizedType

    if (isSearchCanonical && isPageCanonical && isTypeCanonical) return

    const query = {
      ...(isLoadingPreview.value ? { loadingPreview: '1' } : {}),
      ...(hasQuery.value ? serializeSearchQuery(searchQueries.value) : {}),
    }
    const type = browserProductTypeQueryValue(normalizedType)
    if (type) query.type = type
    if (normalizedPage > 1) query.page = String(normalizedPage)

    router.replace({ name: 'browser', query, hash: route.hash })
  },
  { immediate: true },
)

function handleSearch({
  keyword: nextKeyword,
  normalizedKeyword,
  field,
  productType: nextProductType,
}) {
  const query = {}
  if (nextKeyword) {
    Object.assign(
      query,
      serializeSearchQuery(createSearchQuery(nextKeyword, field, normalizedKeyword)),
    )
  }
  const type = browserProductTypeQueryValue(nextProductType)
  if (type) query.type = type

  router.push({
    name: 'browser',
    query,
  })
}

function changePage(page) {
  const normalizedPage = normalizePage(page, totalPages.value)
  const query = hasQuery.value ? serializeSearchQuery(searchQueries.value) : {}
  const type = browserProductTypeQueryValue(productType.value)
  if (type) query.type = type
  if (normalizedPage > 1) query.page = String(normalizedPage)

  router.push({
    name: 'browser',
    query,
  })
}
</script>

<template>
  <div class="browser-page">
    <HeaderNav variant="light" />

    <main class="browser-page__main">
      <BrowserHero
        variant="landing"
        :keyword="keyword"
        :product-type="productType"
        @search="handleSearch"
      />

      <section class="browser-results" aria-label="Browser search results">
        <div class="browser-results__inner">
          <HumetaLoading
            v-if="isLoadingPreview"
            class="browser-results__preview"
            label="Loading"
          />

          <template v-else>
            <ResultsSummaryHeader
              :title="hasQuery ? 'Search results' : 'Browse results'"
              :count="resultCount"
              :context="hasQuery ? 'matched for' : 'available in Browser'"
              :query="hasQuery ? keyword : null"
            />

            <HumetaLoading
              v-if="visibleLoading"
              class="browser-results__loading"
              label="Loading search results"
            />

            <section
              v-else-if="explainedResults.length"
              class="browser-results__grid"
              aria-label="Metabolite search results"
            >
              <MetaboliteResultCard
                v-for="item in explainedResults"
                :key="item.result.key"
                :result="item.result"
                :explanation="item.explanation"
              />
            </section>

            <section v-else-if="!isSearchLoading" class="browser-results__empty" aria-live="polite">
              <div class="browser-results__empty-icon" aria-hidden="true" />
              <template v-if="searchError">
                <h2>Unable to load metabolites.</h2>
                <p>{{ searchError }}</p>
              </template>
              <template v-else>
                <h2>No matching metabolites found.</h2>
                <p>Try a different metabolite name or identifier.</p>
              </template>
            </section>

            <div v-else class="browser-results__pending" aria-hidden="true" />

            <ResultPagination
              v-if="!isSearchLoading && !visibleLoading && totalPages > 1"
              class="browser-results__pagination"
              :current-page="currentPage"
              :total-pages="totalPages"
              @update:current-page="changePage"
            />
          </template>
        </div>
      </section>
    </main>

    <FooterSection variant="compact" />
  </div>
</template>

<style scoped>
.browser-page {
  --browser-content-width: 1240px;
  width: 100%;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  overflow-x: hidden;
  background: white;
}

.browser-page__main {
  min-width: 0;
  width: 100%;
  flex: 1 1 auto;
  background: #f4f8fa;
}

.browser-results {
  padding: 24px 0 44px;
}

.browser-results__inner {
  width: min(var(--browser-content-width), calc(100% - 48px));
  margin-inline: auto;
  padding: 20px 20px 18px;
  border: 1px solid #e6eef2;
  border-radius: 6px;
  background: #fff;
  box-shadow: none;
}

.browser-results__grid {
  min-width: 0;
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 24px;
}

.browser-results__empty {
  min-height: 420px;
  display: grid;
  place-content: center;
  justify-items: center;
  gap: 10px;
  color: #788791;
  text-align: center;
}

.browser-results__loading,
.browser-results__pending {
  min-height: 220px;
}

.browser-results__preview {
  min-height: 300px;
}

.browser-results__empty-icon {
  position: relative;
  width: 42px;
  height: 42px;
  margin-bottom: 4px;
  border: 2px solid #9cc8dc;
  border-radius: 50%;
}

.browser-results__empty-icon::after {
  content: '';
  position: absolute;
  right: -9px;
  bottom: -6px;
  width: 16px;
  height: 2px;
  border-radius: 2px;
  background: #9cc8dc;
  transform: rotate(45deg);
}

.browser-results__empty h2 {
  color: #3f5968;
  font-size: 20px;
}

.browser-results__empty p {
  font-size: 13px;
}

.browser-results__pagination {
  margin-top: 20px;
}

.browser-results__pagination :deep(.result-pagination__jump) {
  display: none;
}

@media (max-width: 919px) {
  .browser-results__grid {
    grid-template-columns: minmax(0, 1fr);
  }
}

@media (max-width: 767px) {
  .browser-results {
    padding: 24px 0 28px;
  }

  .browser-results__inner {
    width: calc(100% - 40px);
  }

  .browser-results__grid {
    gap: 24px;
  }

  .browser-results__empty {
    min-height: 360px;
    padding-inline: 16px;
  }

  .browser-results__preview {
    min-height: 220px;
  }
}

@media (max-width: 600px) {
  .browser-results__inner {
    padding: 14px;
  }
}
</style>
