<script setup>
import { computed, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import HeaderNav from '../components/layout/HeaderNav.vue'
import FooterSection from '../components/layout/FooterSection.vue'
import NewsCard from '../components/news/NewsCard.vue'
import NewsPagination from '../components/news/NewsPagination.vue'
import BannerGeometricLines from '../components/news/BannerGeometricLines.vue'
import { useNewsLanguage } from '../composables/useNewsLanguage.js'
import { newsArticles } from '../data/newsData.js'

const route = useRoute()
const router = useRouter()
const pageSize = 6
const pageCount = Math.ceil(newsArticles.length / pageSize)
const { language } = useNewsLanguage((lang) => lang === 'en' ? 'WeChat Blog | Humeta' : '微信博客 | Humeta')

const currentPage = computed(() => {
  const rawPage = Array.isArray(route.query.page) ? route.query.page[0] : route.query.page
  if (rawPage === undefined) return 1
  const parsed = Number(rawPage)
  if (!Number.isInteger(parsed)) return 1
  return Math.min(pageCount, Math.max(1, parsed))
})

const visibleArticles = computed(() => {
  const start = (currentPage.value - 1) * pageSize
  return newsArticles.slice(start, start + pageSize)
})

watch(
  () => route.query.page,
  (rawPage) => {
    if (rawPage === undefined) return
    const canonical = String(currentPage.value)
    if (!Array.isArray(rawPage) && rawPage === canonical) return
    router.replace({
      name: 'news-wechat-blog',
      query: { ...route.query, page: canonical, lang: language.value },
      hash: route.hash,
    })
  },
  { immediate: true },
)

function selectPage(page) {
  if (page < 1 || page > pageCount || page === currentPage.value) return
  router.push({
    name: 'news-wechat-blog',
    query: { ...route.query, page: String(page), lang: language.value },
    hash: route.hash,
  })
}
</script>

<template>
  <div class="news-page">
    <HeaderNav variant="light" />

    <section class="news-hero" aria-labelledby="news-hero-title">
      <BannerGeometricLines variant="news" />
      <div class="news-hero__inner">
        <div class="news-hero__content">
          <h1 id="news-hero-title">Humeta News</h1>
          <p>Updates, discoveries and platform developments from Human Metabolome Atlas</p>
        </div>
      </div>
    </section>

    <main id="news-grid" class="news-list" tabindex="-1">
      <div class="news-list__grid">
        <NewsCard
          v-for="article in visibleArticles"
          :key="article.slug"
          :article="article"
          :language="language"
        />
      </div>
      <NewsPagination
        :page="currentPage"
        :page-count="pageCount"
        :language="language"
        @select="selectPage"
      />
    </main>

    <FooterSection variant="compact" />
  </div>
</template>

<style scoped>
.news-page {
  min-height: 100vh;
  overflow-x: clip;
  background: #f7fafc;
}

.news-hero {
  height: 80px;
  position: relative;
  display: flex;
  align-items: center;
  overflow: hidden;
  background: #087fbe;
}

.news-hero__inner {
  position: relative;
  z-index: 2;
  width: min(1220px, calc(100% - 48px));
  height: 100%;
  margin: 0 auto;
  display: flex;
  align-items: center;
}

.news-hero__content {
  max-width: 820px;
}

.news-hero h1 {
  margin: 0;
  color: #fff;
  font-size: 24px;
  font-weight: 600;
  line-height: 1.2;
}

.news-hero p {
  display: none;
}

.news-list {
  width: min(1220px, calc(100% - 48px));
  margin: 0 auto;
  padding: 42px 0 52px;
  outline: none;
}

.news-list__grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  align-items: stretch;
  gap: 26px 24px;
}

.news-list :deep(.news-pagination) { margin-top: 48px; }

@media (max-width: 1099px) {
  .news-list__grid { grid-template-columns: repeat(2, minmax(0, 1fr)); }
}

@media (max-width: 767px) {
  .news-hero {
    height: 70px;
  }

  .news-hero__inner {
    width: calc(100% - 40px);
  }

  .news-hero h1 {
    font-size: 24px;
  }

  .news-list {
    width: calc(100% - 40px);
    padding: 32px 0 40px;
  }
  .news-list__grid { grid-template-columns: minmax(0, 1fr); gap: 22px; }
  .news-list :deep(.news-pagination) { margin-top: 40px; }
}
</style>
