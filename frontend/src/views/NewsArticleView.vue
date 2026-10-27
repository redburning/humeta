<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import HeaderNav from '../components/layout/HeaderNav.vue'
import FooterSection from '../components/layout/FooterSection.vue'
import { useNewsLanguage } from '../composables/useNewsLanguage.js'
import { findNewsArticle } from '../data/newsData.js'

const route = useRoute()
const article = computed(() => findNewsArticle(route.params.slug))
const { language } = useNewsLanguage((lang) => {
  const found = findNewsArticle(route.params.slug)
  if (!found) return lang === 'en' ? 'Article not found | Humeta' : '文章不存在 | Humeta'
  return `${found.title[lang]} | Humeta`
})

const categoryLabel = computed(() => {
  if (!article.value) return ''
  if (article.value.category === 'platform') return language.value === 'en' ? 'Platform Update' : '平台动态'
  return language.value === 'en' ? 'Research Insights' : '科研前沿'
})

const authorLabel = computed(() => {
  if (!article.value) return ''
  if (language.value === 'zh') return article.value.author
  return {
    'Humeta 编辑部': 'Humeta Editorial',
    'Humeta 科研内容组': 'Humeta Research Content',
    'Humeta 产品组': 'Humeta Product Team',
    'Humeta 服务组': 'Humeta Service Team',
  }[article.value.author]
})

const formattedDate = computed(() => {
  if (!article.value) return ''
  const date = new Date(article.value.publishedAt)
  return new Intl.DateTimeFormat(language.value === 'en' ? 'en-US' : 'zh-CN', {
    year: 'numeric', month: language.value === 'en' ? 'short' : '2-digit', day: 'numeric',
  }).format(date)
})
</script>

<template>
  <div class="article-page">
    <HeaderNav variant="light" />

    <section class="article-hero" aria-labelledby="article-hero-title">
      <div class="article-hero__inner">
        <p id="article-hero-title">Humeta News</p>
      </div>
    </section>

    <main class="article-main">
      <template v-if="article">
        <article class="article-content">
          <header>
            <p class="article-content__meta">
              <span>{{ categoryLabel }}</span>
              <span aria-hidden="true">|</span>
              <time :datetime="article.publishedAt">{{ formattedDate }}</time>
              <span aria-hidden="true">|</span>
              <span>{{ authorLabel }}</span>
            </p>
            <h1>{{ article.title[language] }}</h1>
            <p class="article-content__summary">{{ article.summary[language] }}</p>
          </header>

          <img class="article-content__cover" :src="article.cover" :alt="article.coverAlt[language]" />
          <div class="article-content__body">
            <p v-for="paragraph in article.body[language]" :key="paragraph">{{ paragraph }}</p>
          </div>

          <RouterLink class="article-content__back" :to="{ name: 'news-wechat-blog', query: { lang: language } }">
            <span aria-hidden="true">←</span>
            {{ language === 'en' ? 'Back to Humeta News' : '返回 Humeta News' }}
          </RouterLink>
        </article>
      </template>

      <section v-else class="article-missing" aria-labelledby="article-missing-title">
        <p class="article-missing__code">404</p>
        <h1 id="article-missing-title">{{ language === 'en' ? 'Article not found' : '文章不存在' }}</h1>
        <p>{{ language === 'en' ? 'The requested local article does not exist or its address has changed.' : '请求的本地文章不存在，或地址已经变更。' }}</p>
        <RouterLink :to="{ name: 'news-wechat-blog', query: { lang: language } }">
          {{ language === 'en' ? 'Return to Humeta News' : '返回 Humeta News' }}
        </RouterLink>
      </section>
    </main>

    <FooterSection variant="compact" />
  </div>
</template>

<style scoped>
.article-page {
  min-height: 100vh;
  overflow-x: clip;
  background: #f7fafc;
}

.article-hero {
  height: 80px;
  background: #087fbe;
}

.article-hero__inner {
  width: 100%;
  height: 100%;
  margin: 0 auto;
  box-sizing: border-box;
  display: flex;
  align-items: center;
  padding: 0 120px;
}

.article-hero p {
  margin: 0;
  color: #fff;
  font-size: 26px;
  font-weight: 600;
  line-height: 1.2;
}

.article-main {
  width: min(840px, calc(100% - 48px));
  min-height: 520px;
  margin: 0 auto;
  padding: 24px 0 80px;
}

.article-content > header {
  max-width: 760px;
}

.article-content h1 {
  margin: 0;
  color: #16324f;
  font-size: 36px;
  font-weight: 600;
  line-height: 1.35;
  letter-spacing: -0.02em;
}

.article-content__meta {
  display: flex;
  flex-wrap: wrap;
  gap: 6px 10px;
  margin: 0 0 16px;
  color: #617684;
  font-size: 14px;
  line-height: 1.5;
}

.article-content__summary {
  margin: 20px 0 24px;
  padding-left: 18px;
  border-left: 3px solid #26a4b4;
  color: #536e7b;
  font-size: 17px;
  line-height: 1.75;
}

.article-content__cover {
  width: 100%;
  max-width: 640px;
  height: auto;
  max-height: 420px;
  display: block;
  margin: 0 auto;
  object-fit: contain;
}

.article-content__body {
  display: grid;
  gap: 24px;
  padding: 24px 0 35px;
  color: #40586a;
  font-size: 16px;
  line-height: 1.9;
}

.article-content__body p { margin: 0; }

.article-content__back {
  width: fit-content;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  color: #087fbe;
  background: transparent;
  text-decoration: none;
}

.article-content__back:hover,
.article-content__back:focus-visible { text-decoration: underline; }

.article-content__back:focus-visible {
  outline: 2px solid #087fbe;
  outline-offset: 3px;
}

.article-missing a {
  min-height: 44px;
  width: fit-content;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 0 16px;
  border: 1px solid #e5eef4;
  color: #087fbe;
  background: white;
  text-decoration: none;
}

.article-missing a:hover,
.article-missing a:focus-visible { border-color: #d5e6ef; background: #f8fbfd; }

.article-missing { padding: 70px 0; text-align: center; }
.article-missing__code { margin: 0; color: #62aebb; font-size: 15px; letter-spacing: .18em; }
.article-missing h1 { margin: 10px 0 12px; color: #17384a; font-size: 34px; }
.article-missing > p:not(.article-missing__code) { margin: 0 0 24px; color: #6d838d; }

@media (max-width: 767px) {
  .article-hero__inner { width: 100%; padding: 0 20px; }
  .article-main { width: calc(100% - 40px); padding: 24px 0 55px; }
  .article-content h1 { font-size: 26px; }
  .article-content__summary { font-size: 15px; }
  .article-content__body { font-size: 16px; }
}
</style>
