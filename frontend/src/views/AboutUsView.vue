<script setup>
import { computed, onBeforeUnmount, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import HeaderNav from '../components/layout/HeaderNav.vue'
import FooterSection from '../components/layout/FooterSection.vue'
import AboutLanguageSwitch from '../components/about-us/AboutLanguageSwitch.vue'
import AboutStatistics from '../components/about-us/AboutStatistics.vue'
import AboutWelcomeSection from '../components/about-us/AboutWelcomeSection.vue'
import AboutPhilosophySection from '../components/about-us/AboutPhilosophySection.vue'
import AboutDevelopmentSection from '../components/about-us/AboutDevelopmentSection.vue'
import AboutGuideSection from '../components/about-us/AboutGuideSection.vue'
import { aboutUsContent } from '../data/aboutUsData.js'
import { aboutChartContent } from '../data/aboutUsCharts.js'
import { aboutUsSources } from '../data/aboutUsScientificData.js'

const route = useRoute()
const router = useRouter()
const activeLanguage = computed(() => (route.query.lang === 'en' ? 'en' : 'zh'))
const content = computed(() => aboutUsContent[activeLanguage.value])
const chartContent = computed(() => aboutChartContent[activeLanguage.value])
const localizedSources = computed(() =>
  aboutUsSources.map((source) => ({
    ...source,
    usage: source.usage[activeLanguage.value],
  })),
)

let previousDocumentLanguage

function selectLanguage(language) {
  if (language === activeLanguage.value) return

  router.push({
    name: 'about-us',
    query: { ...route.query, lang: language },
    hash: route.hash,
  })
}

function syncDocumentLanguage() {
  document.documentElement.lang = content.value.documentLanguage
}

onMounted(() => {
  previousDocumentLanguage = document.documentElement.lang
  syncDocumentLanguage()
})

watch(activeLanguage, () => {
  if (previousDocumentLanguage !== undefined) syncDocumentLanguage()
})

onBeforeUnmount(() => {
  if (previousDocumentLanguage !== undefined) document.documentElement.lang = previousDocumentLanguage
})
</script>

<template>
  <div class="about-page" :lang="content.documentLanguage">
    <HeaderNav variant="light" />

    <header class="about-page__masthead">
      <div class="about-shell about-page__masthead-inner">
        <div>
          <h1>{{ content.pageTitle }}</h1>
          <p>{{ content.pageKicker }}</p>
        </div>
        <AboutLanguageSwitch
          :language="activeLanguage"
          :labels="content.languageSwitch"
          @select="selectLanguage"
        />
      </div>
    </header>

    <main>
      <AboutStatistics :content="content.statistics" />
      <AboutWelcomeSection :content="content.welcome" :chart-content="chartContent.ecosystem" />
      <AboutPhilosophySection :content="content.philosophy" :chart-content="chartContent.philosophy" />
      <AboutDevelopmentSection :content="content.development" :chart-content="chartContent.development" />
      <AboutGuideSection
        :content="content.guides"
        :chart-content="chartContent.guides"
        :sources="localizedSources"
      />
    </main>

    <FooterSection variant="compact" />
  </div>
</template>

<style scoped>
.about-page {
  min-height: 100vh;
  overflow-x: clip;
  background: #fff;
}

.about-shell {
  width: min(1240px, calc(100% - 48px));
  margin: 0 auto;
}

.about-page__masthead {
  border-top: 1px solid #edf2f5;
  border-bottom: 1px solid #e2ebef;
  background: #fff;
}

.about-page__masthead-inner {
  min-height: 86px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 28px;
}

.about-page__masthead h1 {
  margin: 0;
  color: #18354a;
  font-size: clamp(25px, 2.3vw, 32px);
  font-weight: 500;
  letter-spacing: -0.025em;
}

.about-page__masthead p {
  margin: 5px 0 0;
  color: #819198;
  font-size: 10.5px;
  letter-spacing: 0.075em;
  line-height: 1.4;
  text-transform: uppercase;
}

@media (max-width: 767px) {
  .about-shell {
    width: calc(100% - 40px);
  }

  .about-page__masthead-inner {
    min-height: 105px;
  }

  .about-page__masthead-inner > div {
    max-width: 68%;
  }

  .about-page__masthead h1 {
    font-size: 24px;
  }

  .about-page__masthead p {
    font-size: 9px;
    letter-spacing: 0.055em;
  }
}
</style>
