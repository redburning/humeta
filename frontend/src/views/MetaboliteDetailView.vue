<script setup>
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import HumetaLoading from '../components/common/HumetaLoading.vue'
import ChemicalDescription from '../components/metabolite/ChemicalDescription.vue'
import DetailContentsNav from '../components/metabolite/DetailContentsNav.vue'
import DetailHero from '../components/metabolite/DetailHero.vue'
import DetailSection from '../components/metabolite/DetailSection.vue'
import PropertyTable from '../components/metabolite/PropertyTable.vue'
import TaxonomyTree from '../components/metabolite/TaxonomyTree.vue'
import FooterSection from '../components/layout/FooterSection.vue'
import HeaderNav from '../components/layout/HeaderNav.vue'
import { useDetailScrollSpy } from '../composables/useDetailScrollSpy'
import { ApiError } from '../services/api/client'
import { getMetaboliteDetail } from '../services/metaboliteService'

const route = useRoute()
const metabolite = ref(null)
const isLoading = ref(false)
const loadError = ref('')
const contentsCollapsed = ref(false)
let activeRequest = 0

const SECTION_IDS = [
  'metabolite-id',
  'general-overview',
  'chemical-description',
  'chemical-taxonomy',
]

const contentsItems = computed(() => {
  const items = [
    { id: 'metabolite-id', label: 'Metabolite ID', icon: 'record', group: 'Identity' },
  ]

  if (metabolite.value?.overview?.description?.length) {
    items.push({ id: 'general-overview', label: 'General Overview', icon: 'overview' })
  }

  items.push(
    { id: 'chemical-description', label: 'Chemical Description', icon: 'chemical', group: 'Chemistry' },
    { id: 'chemical-taxonomy', label: 'Chemical Taxonomy', icon: 'taxonomy' },
  )
  return items
})

const { activeId, scrollToSection, refresh: refreshScrollSpy } = useDetailScrollSpy(SECTION_IDS)

watch(
  () => route.params.id,
  async (id) => {
    const requestId = ++activeRequest
    isLoading.value = true
    loadError.value = ''
    metabolite.value = null

    try {
      const detail = await getMetaboliteDetail(String(id))
      if (requestId !== activeRequest) return

      metabolite.value = detail
      await nextTick()
      if (requestId !== activeRequest) return

      refreshScrollSpy()
      const hashId = route.hash.slice(1)
      if (hashId) scrollToSection(hashId, false)
    } catch (error) {
      if (requestId !== activeRequest) return

      if (error instanceof ApiError && error.code === 404) {
        return
      }

      loadError.value = error instanceof Error ? error.message : 'Unable to load metabolite.'
      console.error('Failed to load metabolite detail', error)
    } finally {
      if (requestId === activeRequest) isLoading.value = false
    }
  },
  { immediate: true },
)

const overviewDescriptionRef = ref(null)
const overviewExpanded = ref(false)
const overviewOverflows = ref(false)
let overviewResizeObserver
let overviewMounted = false

function measureOverviewOverflow() {
  const description = overviewDescriptionRef.value
  if (!description) {
    overviewOverflows.value = false
    return
  }

  const lineHeight = Number.parseFloat(window.getComputedStyle(description).lineHeight)
  if (!Number.isFinite(lineHeight)) {
    overviewOverflows.value = false
    return
  }

  overviewOverflows.value = description.scrollHeight > (lineHeight * 5) + 1
}

function observeOverviewDescription() {
  overviewResizeObserver?.disconnect()
  if (overviewDescriptionRef.value) overviewResizeObserver?.observe(overviewDescriptionRef.value)
  measureOverviewOverflow()
}

function toggleOverviewDescription() {
  overviewExpanded.value = !overviewExpanded.value
}

watch(
  [() => metabolite.value?.id, () => metabolite.value?.overview?.description],
  async () => {
    overviewExpanded.value = false
    await nextTick()
    observeOverviewDescription()
  },
  { flush: 'post' },
)

onMounted(async () => {
  overviewMounted = true
  if (typeof ResizeObserver !== 'undefined') {
    overviewResizeObserver = new ResizeObserver(measureOverviewOverflow)
  }
  await nextTick()
  observeOverviewDescription()
  document.fonts?.ready.then(() => {
    if (overviewMounted) measureOverviewOverflow()
  })
})

onBeforeUnmount(() => {
  overviewMounted = false
  overviewResizeObserver?.disconnect()
})

watch(
  contentsCollapsed,
  async () => {
    await nextTick()
    measureOverviewOverflow()
  },
  { flush: 'post' },
)
</script>

<template>
  <div class="metabolite-page">
    <HeaderNav variant="light" />

    <template v-if="metabolite">
      <DetailHero :metabolite="metabolite" />

      <main class="detail-layout" :class="{ 'detail-layout--contents-collapsed': contentsCollapsed }">
        <div class="detail-layout__content">
          <DetailSection id="metabolite-id" title="Metabolite ID" icon="record" :active="activeId === 'metabolite-id'">
            <PropertyTable :fields="metabolite.identifiers" />
          </DetailSection>

          <DetailSection v-if="metabolite.overview?.description?.length" id="general-overview" title="Overview" icon="overview" :active="activeId === 'general-overview'">
            <div class="overview">
              <p
                id="metabolite-overview-description"
                ref="overviewDescriptionRef"
                class="overview__description"
                :class="{ 'overview__description--collapsed': !overviewExpanded }"
              ><template v-for="(paragraph, index) in metabolite.overview.description" :key="`${metabolite.id}-${index}`"><span>{{ paragraph }}</span><br v-if="index < metabolite.overview.description.length - 1"></template></p>
              <button
                v-if="overviewOverflows"
                type="button"
                class="overview__toggle"
                :aria-label="overviewExpanded ? 'Show less' : 'Show more'"
                :aria-expanded="overviewExpanded"
                aria-controls="metabolite-overview-description"
                :title="overviewExpanded ? 'Show less' : 'Show more'"
                @click="toggleOverviewDescription"
              >
                <svg viewBox="0 0 14 14" aria-hidden="true">
                  <path v-if="overviewExpanded" d="m3.5 8.5 3.5-3 3.5 3" />
                  <path v-else d="m3.5 5.5 3.5 3 3.5-3" />
                </svg>
              </button>
            </div>
          </DetailSection>

          <DetailSection id="chemical-description" title="Chemical Descriptors" icon="chemical" :active="activeId === 'chemical-description'">
            <ChemicalDescription :description="metabolite.chemicalDescription" />
          </DetailSection>

          <DetailSection id="chemical-taxonomy" title="Chemical Taxonomy" icon="taxonomy" :active="activeId === 'chemical-taxonomy'">
            <TaxonomyTree :trees="metabolite.taxonomy" />
          </DetailSection>
        </div>

        <DetailContentsNav
          class="detail-layout__contents"
          :items="contentsItems"
          :active-id="activeId"
          @navigate="scrollToSection"
          @mode-change="contentsCollapsed = $event"
        />
      </main>
    </template>

    <main v-else-if="isLoading" class="detail-loading">
      <HumetaLoading label="Loading metabolite" />
    </main>

    <main v-else class="not-found">
      <div class="not-found__icon" aria-hidden="true">?</div>
      <h1>{{ loadError ? 'Unable to load metabolite' : 'Metabolite not found' }}</h1>
      <p>{{ loadError || `No metabolite record is available for “${route.params.id}”.` }}</p>
      <RouterLink to="/browser">Return to Browser</RouterLink>
    </main>

    <FooterSection variant="compact" />
  </div>
</template>

<style scoped>
.metabolite-page {
  --detail-text-primary: #16324f;
  --detail-text-secondary: #718899;
  --detail-text-muted: #718899;
  --detail-border: #dce8ef;
  --detail-panel-muted: #f7fafc;
  --detail-font-section-title: 16px;
  --detail-font-field-label: 12px;
  --detail-font-field-value: 14px;
  --detail-font-metadata: 12px;
  --detail-overview-line-height: 1.68;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  overflow-x: clip;
  color: var(--detail-text-primary);
  background: #f3f7f9;
  font-family: Arial, "Microsoft YaHei", "微软雅黑", sans-serif;
}

.detail-layout {
  width: min(1560px, calc(100% - 48px));
  margin: 0 auto 20px;
  display: grid;
  grid-template-columns: minmax(0, 1fr) 260px;
  gap: 24px;
  align-items: start;
}

.detail-layout--contents-collapsed {
  grid-template-columns: minmax(0, 1fr) 68px;
}

.detail-layout__content {
  min-width: 0;
  display: grid;
  gap: 12px;
}

.detail-layout__contents {
  grid-column: 2;
  grid-row: 1;
}

.overview {
  width: 100%;
  color: #344f5d;
  font-size: 14px;
  line-height: var(--detail-overview-line-height);
}

#metabolite-id :deep(.detail-section__body) {
  padding: 16px 18px;
}

#experimental-spectra :deep(.detail-section__body),
#biofluid-concentration :deep(.detail-section__body),
#dynamic-trajectory :deep(.detail-section__body) {
  padding-top: 12px;
}

.overview__description {
  margin: 0;
  overflow-wrap: anywhere;
}

.overview__description--collapsed {
  display: -webkit-box;
  overflow: hidden;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 5;
}

.overview__toggle {
  width: 30px;
  height: 30px;
  margin: 6px 0 0 auto;
  padding: 0;
  border: 1px solid #d2dee5;
  border-radius: 50%;
  display: grid;
  place-items: center;
  color: #087fbe;
  background: transparent;
  cursor: pointer;
}

.overview__toggle:hover,
.overview__toggle:focus-visible {
  border-color: #9dbdcc;
  background: rgba(8, 127, 190, 0.06);
}

.overview__toggle:focus-visible {
  outline: 2px solid #8ab9ce;
  outline-offset: 2px;
}

.overview__toggle svg {
  width: 14px;
  height: 14px;
  fill: none;
  stroke: currentColor;
  stroke-linecap: round;
  stroke-linejoin: round;
  stroke-width: 1.5;
}

.metabolite-page :deep(.spectrum-card h3),
.metabolite-page :deep(.concentration-card h3),
.metabolite-page :deep(.trajectory-card h3) {
  min-height: 48px;
  padding: 9px 14px;
  color: var(--detail-text-primary);
}

#experimental-spectra :deep(.spectrum-card h3),
#biofluid-concentration :deep(.concentration-card h3),
#dynamic-trajectory :deep(.trajectory-card h3) {
  margin: 0;
  min-height: 40px;
}

.metabolite-page :deep(.spectrum-card__meta dt),
.metabolite-page :deep(.concentration-card__meta dt),
.metabolite-page :deep(.trajectory-card__meta dt) {
  padding: 8px 10px;
  color: var(--detail-text-secondary);
  background: #f3f7f9;
  font-size: var(--detail-font-field-label);
  font-weight: 600;
}

.metabolite-page :deep(.spectrum-card__meta dd),
.metabolite-page :deep(.concentration-card__meta dd),
.metabolite-page :deep(.trajectory-card__meta dd) {
  padding: 8px 10px;
  color: var(--detail-text-primary);
  font-size: var(--detail-font-field-value);
}

.metabolite-page :deep(.disease-association > h3),
.metabolite-page :deep(.disease-association__list h3),
.metabolite-page :deep(.pathway h3) {
  color: var(--detail-text-primary);
}

.metabolite-page :deep(.disease-association__list) {
  margin-top: 10px;
}

.metabolite-page :deep(.disease-association__list h3) {
  margin-top: 0;
}

.metabolite-page :deep(.pathway > p) {
  margin-top: 10px;
  color: #718899;
  font-size: 11px;
  line-height: 1.6;
}

.detail-loading {
  width: min(760px, calc(100% - 40px));
  min-height: 480px;
  margin: 0 auto;
  flex: 1;
  display: grid;
  place-items: center;
}

.not-found {
  width: min(760px, calc(100% - 40px));
  min-height: 480px;
  margin: 0 auto;
  flex: 1;
  display: grid;
  place-content: center;
  justify-items: center;
  gap: 10px;
  text-align: center;
}

.not-found__icon {
  width: 46px;
  height: 46px;
  border: 2px solid #9bc6d9;
  border-radius: 50%;
  display: grid;
  place-items: center;
  color: #4f9abe;
  font-size: 22px;
}

.not-found h1 { color: #225f83; font-size: 24px; }
.not-found p { color: #71838d; font-size: 12px; }
.not-found a { margin-top: 5px; padding: 8px 14px; border: 1px solid #1686bd; border-radius: 3px; color: #fff; background: #1686bd; font-size: 11px; text-decoration: none; }

@media (max-width: 1100px) {
  .metabolite-page :deep(.concentration-card h3),
  .metabolite-page :deep(.trajectory-card h3) {
    min-height: 58px;
  }
}

@media (max-width: 900px) {

  .detail-layout {
    display: flex;
    flex-direction: column;
  }

  .detail-layout__contents {
    order: -1;
    width: 100%;
  }

  .detail-layout__content {
    width: 100%;
  }
}

@media (min-width: 901px) and (max-width: 1100px) {
  .detail-layout,
  .detail-layout--contents-collapsed {
    grid-template-columns: minmax(0, 1fr) 68px;
    gap: 14px;
  }
}

@media (max-width: 767px) {
  .detail-layout { width: calc(100% - 28px); gap: 12px; margin-bottom: 14px; }
  .detail-layout__content { gap: 12px; }
}
</style>

