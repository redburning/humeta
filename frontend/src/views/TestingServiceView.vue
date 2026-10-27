<script setup>
import { computed, nextTick, ref } from 'vue'
import BusinessCategoryTabs from '../components/testing-service/BusinessCategoryTabs.vue'
import ResearchGoalSelector from '../components/testing-service/ResearchGoalSelector.vue'
import ResearchPathRecommendation from '../components/testing-service/ResearchPathRecommendation.vue'
import SampleGuidance from '../components/testing-service/SampleGuidance.vue'
import ServiceContactSection from '../components/testing-service/ServiceContactSection.vue'
import ServiceProjectDetail from '../components/testing-service/ServiceProjectDetail.vue'
import ServiceProjectGrid from '../components/testing-service/ServiceProjectGrid.vue'
import TestingRequestForm from '../components/testing-service/TestingRequestForm.vue'
import TestingServiceFaq from '../components/testing-service/TestingServiceFaq.vue'
import TestingServiceHero from '../components/testing-service/TestingServiceHero.vue'
import FooterSection from '../components/layout/FooterSection.vue'
import HeaderNav from '../components/layout/HeaderNav.vue'
import { useTestingServiceQuery } from '../composables/useTestingServiceQuery'
import {
  findTestingService,
  researchGoalOptions,
  testingServiceCategories,
  testingServiceNotice,
} from '../data/testingServiceData'

const formComponent = ref(null)
const selectedGoalId = ref('')
const detailFocusRequest = ref(0)

const {
  activeCategory,
  activeService,
  categoryId,
  serviceId,
  selectCategory,
  selectSelection,
  selectService,
} = useTestingServiceQuery()

function serviceTitle(reference) {
  return findTestingService(reference.categoryId, reference.serviceId)?.title || ''
}

const decoratedGoals = computed(() => researchGoalOptions.map((goal) => ({
  ...goal,
  associations: [...goal.primary, ...goal.supplemental].map(serviceTitle).filter(Boolean),
  primaryServices: goal.primary.map(serviceTitle).filter(Boolean),
  supplementalServices: goal.supplemental.map(serviceTitle).filter(Boolean),
})))

const selectedGoal = computed(() => (
  decoratedGoals.value.find((goal) => goal.id === selectedGoalId.value) || null
))

function reducedMotionRequested() {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches
}

async function scrollToSection(sectionId) {
  await nextTick()
  document.getElementById(sectionId)?.scrollIntoView({
    behavior: reducedMotionRequested() ? 'auto' : 'smooth',
    block: 'start',
  })
}

function goalTarget(goal) {
  return goal.primary[0] || goal.consultationEntry
}

async function viewGoalServices(goal) {
  const target = goalTarget(goal)
  if (target) await selectSelection(target.categoryId, target.serviceId)
  await scrollToSection('service-capabilities')
}

async function prefillGoal(goal) {
  const target = goalTarget(goal)
  if (target) {
    await selectSelection(target.categoryId, target.serviceId)
    await formComponent.value?.prefill(target.categoryId, target.serviceId)
  }
  await scrollToSection('testing-consultation')
}

async function requestCurrentService() {
  await formComponent.value?.prefill(activeCategory.value.id, activeService.value.id)
  await scrollToSection('testing-consultation')
}

function handleFormSelection(selection) {
  selectSelection(selection.categoryId, selection.serviceId)
}

async function handleServiceSelection(nextServiceId, interactionSource) {
  if (nextServiceId === serviceId.value) return
  await selectService(nextServiceId)
  if (interactionSource === 'service-activation') detailFocusRequest.value += 1
}
</script>

<template>
  <div class="testing-service-page">
    <HeaderNav variant="light" />
    <TestingServiceHero
      @request="requestCurrentService"
      @view-services="scrollToSection('service-capabilities')"
    />

    <main>
      <ResearchGoalSelector
        v-model="selectedGoalId"
        :goals="decoratedGoals"
      />

      <ResearchPathRecommendation
        :goal="selectedGoal"
        @view-services="viewGoalServices"
        @prefill="prefillGoal"
      />

      <section id="service-capabilities" class="service-capabilities" aria-labelledby="service-explorer-title">
        <div class="page-container">
          <header class="service-capabilities__heading">
            <div>
              <p>SERVICE CAPABILITIES</p>
              <h2 id="service-explorer-title">服务能力与技术方向</h2>
            </div>
            <p>
              在现有 3 个正式业务方向和 14 项服务中进一步了解可能适合的技术路径。具体范围仍需结合项目目标确认。
            </p>
          </header>

          <BusinessCategoryTabs
            :categories="testingServiceCategories"
            :model-value="categoryId"
            @update:model-value="selectCategory"
          />

          <p class="visually-hidden" role="status" aria-live="polite">
            当前业务方向：{{ activeCategory.label }}；当前项目：{{ activeService.title }}。
          </p>

          <div class="service-capabilities__body">
            <ServiceProjectGrid
              :active-service-id="serviceId"
              :category="activeCategory"
              @select="handleServiceSelection"
            />
            <ServiceProjectDetail
              :category="activeCategory"
              :focus-request="detailFocusRequest"
              :service="activeService"
              @request="requestCurrentService"
            />
          </div>
        </div>
      </section>

      <section id="testing-consultation" class="consultation-section" aria-label="项目咨询表">
        <div class="page-container">
          <p class="consultation-section__notice" role="note">
            <strong>内容待确认：</strong>{{ testingServiceNotice }}
          </p>
          <TestingRequestForm
            ref="formComponent"
            :categories="testingServiceCategories"
            :initial-category-id="categoryId"
            :initial-service-id="serviceId"
            @selection-change="handleFormSelection"
          />
        </div>
      </section>

      <section class="faq-support" aria-labelledby="faq-support-title">
        <div class="page-container faq-support__inner">
          <header class="faq-support__heading">
            <p>QUESTIONS &amp; SAMPLE GUIDANCE</p>
            <h2 id="faq-support-title">FAQ 与样本准备说明</h2>
            <p>常见问题和通用样本提示用于前期沟通，正式要求以项目确认方案为准。</p>
          </header>
          <TestingServiceFaq />
          <SampleGuidance />
        </div>
      </section>
    </main>

    <ServiceContactSection @request="requestCurrentService" />
    <FooterSection variant="compact" />
  </div>
</template>

<style scoped>
.testing-service-page {
  --testing-ink: #173f51;
  --testing-text: #536d78;
  --testing-muted: #6c828b;
  --testing-blue: #087fbe;
  --testing-line: #d3e2e7;
  --testing-soft: #edf5f6;
  --testing-surface: #fffdfa;
  --testing-radius: 5px;
  min-width: 0;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  color: var(--testing-text);
  background: #fffdfa;
}

.testing-service-page main {
  min-width: 0;
}

.service-capabilities {
  padding: 88px 0 80px;
  scroll-margin-top: 76px;
  background: #fffdfa;
}

.service-capabilities__heading {
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(340px, 0.74fr);
  align-items: end;
  gap: 54px;
}

.service-capabilities__heading > div > p,
.faq-support__heading > p:first-child {
  color: #167ea6;
  font-size: 12px;
  font-weight: 750;
  letter-spacing: 0.14em;
}

.service-capabilities__heading h2,
.faq-support__heading h2 {
  margin-top: 10px;
  color: var(--testing-ink);
  font-size: clamp(34px, 3.4vw, 42px);
  line-height: 1.22;
}

.service-capabilities__heading > p,
.faq-support__heading > p:last-child {
  color: var(--testing-text);
  font-size: 15px;
  line-height: 1.8;
}

.service-capabilities__body {
  display: grid;
  grid-template-columns: minmax(250px, 28%) minmax(0, 72%);
  min-height: 520px;
  border-top: 1px solid var(--testing-line);
  border-bottom: 1px solid var(--testing-line);
}

.consultation-section {
  padding: 84px 0 88px;
  scroll-margin-top: 76px;
  background: #edf5f6;
}

.consultation-section__notice {
  max-width: 1040px;
  margin: 0 auto 20px;
  padding: 13px 16px;
  border-left: 2px solid #6eaabd;
  color: #5d7580;
  background: rgba(255, 255, 255, 0.58);
  font-size: 13px;
  line-height: 1.7;
}

.consultation-section__notice strong {
  color: #315d6f;
}

.faq-support {
  padding: 80px 0 72px;
  background: #fffdfa;
}

.faq-support__inner {
  max-width: 1040px;
}

.faq-support__heading {
  max-width: 760px;
  margin-bottom: 34px;
}

.faq-support__heading > p:last-child {
  margin-top: 16px;
}

@media (max-width: 1024px) {
  .service-capabilities__body {
    grid-template-columns: minmax(225px, 30%) minmax(0, 70%);
  }
}

@media (max-width: 800px) {
  .service-capabilities,
  .consultation-section,
  .faq-support {
    padding-block: 64px;
  }

  .service-capabilities__heading {
    grid-template-columns: 1fr;
    gap: 18px;
  }

  .service-capabilities__body {
    grid-template-columns: 1fr;
    min-height: 0;
  }
}

@media (max-width: 560px) {
  .service-capabilities,
  .consultation-section,
  .faq-support {
    padding-block: 56px;
  }

  .service-capabilities__heading h2,
  .faq-support__heading h2 {
    font-size: 31px;
  }
}
</style>
