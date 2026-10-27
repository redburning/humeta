<script setup>
import { computed, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
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
import { metaboliteResults } from '../data/metaboliteResults'
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

const keyword = computed(() => queryValue(route.query.q).trim())
const productType = computed(() => normalizeBrowserProductType(queryValue(route.query.type)))

const rawMatches = computed(() => {
  const term = keyword.value.toLocaleLowerCase()

  if (!term) return []

  return metaboliteResults.filter((result) => {
    return [result.name, result.chineseName, result.id, result.cas]
      .some((value) => String(value).toLocaleLowerCase().includes(term))
  })
})

const deduplicatedResults = computed(() => deduplicateMetaboliteResults(rawMatches.value))
const resultCount = computed(() => deduplicatedResults.value.length)
const totalPages = computed(() => Math.ceil(resultCount.value / RESULTS_PER_PAGE))
const currentPage = computed(() => normalizePage(parsePageQuery(route.query.page), totalPages.value))
const visibleResults = computed(() => (
  paginateResults(deduplicatedResults.value, currentPage.value, RESULTS_PER_PAGE)
))

watch(
  [() => route.query.q, () => route.query.page, totalPages, () => route.query.type],
  ([, rawPage, , rawType]) => {
    if (!keyword.value) {
      router.replace({ name: 'browser' })
      return
    }

    const normalizedPage = currentPage.value
    const isPageCanonical = normalizedPage === 1
      ? rawPage === undefined
      : typeof rawPage === 'string' && rawPage === String(normalizedPage)
    const normalizedType = productType.value
    const isTypeCanonical = normalizedType === DEFAULT_BROWSER_PRODUCT_TYPE
      ? rawType === undefined
      : typeof rawType === 'string' && rawType === normalizedType

    if (isPageCanonical && isTypeCanonical) return

    const query = { ...route.query }
    if (normalizedPage === 1) delete query.page
    else query.page = String(normalizedPage)
    if (normalizedType === DEFAULT_BROWSER_PRODUCT_TYPE) delete query.type
    else query.type = normalizedType

    router.replace({ name: 'browser-search', query })
  },
  { immediate: true },
)

function handleSearch({ keyword: nextKeyword, productType: nextProductType }) {
  const query = { q: nextKeyword }
  const type = browserProductTypeQueryValue(nextProductType)
  if (type) query.type = type

  router.push({
    name: 'browser-search',
    query,
  })
}

function changePage(page) {
  const normalizedPage = normalizePage(page, totalPages.value)
  const query = { q: keyword.value }
  const type = browserProductTypeQueryValue(productType.value)
  if (type) query.type = type
  if (normalizedPage > 1) query.page = String(normalizedPage)

  router.push({
    name: 'browser-search',
    query,
  })
}
</script>

<template>
  <div class="browser-results-page">
    <HeaderNav variant="light" />
    <BrowserHero
      variant="results"
      :keyword="keyword"
      :product-type="productType"
      @search="handleSearch"
    />

    <main class="browser-results">
      <div class="browser-results__inner">
        <ResultsSummaryHeader
          :count="resultCount"
          context="matched for"
          :query="keyword"
        />

        <section
          v-if="visibleResults.length"
          class="browser-results__grid"
          aria-label="Metabolite search results"
        >
          <MetaboliteResultCard
            v-for="result in visibleResults"
            :key="result.key"
            :result="result"
          />
        </section>

        <section v-else class="browser-results__empty" aria-live="polite">
          <div class="browser-results__empty-icon" aria-hidden="true" />
          <h2>No matching metabolites found.</h2>
          <p>Try a different metabolite name or identifier.</p>
        </section>

        <ResultPagination
          v-if="totalPages > 1"
          class="browser-results__pagination"
          :current-page="currentPage"
          :total-pages="totalPages"
          @update:current-page="changePage"
        />
      </div>
    </main>

    <FooterSection />
  </div>
</template>

<style scoped>
.browser-results-page {
  --browser-content-width: 1240px;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  overflow-x: hidden;
  background: #f3f7f9;
}

.browser-results {
  flex: 1 0 auto;
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
  gap: 20px 24px;
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

@media (max-width: 1199px) {
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
    gap: 20px;
  }

  .browser-results__empty {
    min-height: 360px;
    padding-inline: 16px;
  }

}

@media (max-width: 600px) {
  .browser-results__inner {
    padding: 14px;
  }
}
</style>
