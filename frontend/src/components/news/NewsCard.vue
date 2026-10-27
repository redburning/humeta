<script setup>
import { computed } from 'vue'

const props = defineProps({
  article: { type: Object, required: true },
  language: { type: String, required: true },
})

const categoryLabel = computed(() => {
  if (props.article.category === 'platform') return props.language === 'en' ? 'Platform Update' : '平台动态'
  return props.language === 'en' ? 'Research Insights' : '科研前沿'
})

const formattedDate = computed(() => {
  const date = new Date(props.article.publishedAt)
  if (props.language === 'en') {
    const day = new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', year: 'numeric' }).format(date)
    const time = new Intl.DateTimeFormat('en-GB', { hour: '2-digit', minute: '2-digit', hour12: false }).format(date)
    return `${day} · ${time}`
  }
  const datePart = new Intl.DateTimeFormat('zh-CN', { year: 'numeric', month: '2-digit', day: '2-digit' })
    .format(date).replaceAll('/', '-')
  const time = new Intl.DateTimeFormat('zh-CN', { hour: '2-digit', minute: '2-digit', hour12: false }).format(date)
  return `${datePart} ${time}`
})
</script>

<template>
  <article class="news-card">
    <RouterLink
      class="news-card__link"
      :to="{ name: 'news-article', params: { slug: article.slug }, query: { lang: language } }"
      :aria-label="article.title[language]"
    >
      <div class="news-card__cover">
        <img :src="article.cover" :alt="article.coverAlt[language]" loading="lazy" />
      </div>
      <div class="news-card__body">
        <div class="news-card__info">
          <span class="news-card__category">{{ categoryLabel }}</span>
          <p class="news-card__meta">
            <time :datetime="article.publishedAt">{{ formattedDate }}</time>
          </p>
        </div>
        <h2>{{ article.title[language] }}</h2>
        <p class="news-card__summary">{{ article.summary[language] }}</p>
      </div>
    </RouterLink>
  </article>
</template>

<style scoped>
.news-card {
  box-sizing: border-box;
  height: auto;
  min-height: 300px;
  min-width: 0;
  border: 1px solid #dce8ef;
  border-radius: 6px;
  overflow: hidden;
  background: #fff;
  transition:
    transform 250ms ease,
    box-shadow 250ms ease,
    border-color 250ms ease;
}

.news-card:hover {
  border-color: #b7d3e5;
  transform: translateY(-3px);
  box-shadow: 0 6px 20px rgba(20, 80, 120, 0.08);
}

.news-card__link {
  height: 100%;
  display: flex;
  flex-direction: column;
  color: inherit;
  text-decoration: none;
}

.news-card__link:focus-visible {
  outline: 3px solid #0e91b2;
  outline-offset: -3px;
}

.news-card__cover {
  box-sizing: border-box;
  position: relative;
  flex: 0 0 140px;
  height: 140px;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  border-bottom: 1px solid #dce8ef;
  background: #f2f7f9;
}

.news-card__cover img {
  width: 100%;
  height: 100%;
  display: block;
  object-fit: contain;
}

.news-card__category {
  box-sizing: border-box;
  flex: 0 0 auto;
  min-height: 24px;
  display: flex;
  align-items: center;
  padding: 3px 8px;
  border: 1px solid #d5e6ef;
  border-radius: 4px;
  color: #1677b8;
  background: transparent;
  font-size: 12px;
  font-weight: 500;
  line-height: 1.2;
}

.news-card__body {
  box-sizing: border-box;
  flex: 1 1 auto;
  min-height: 0;
  display: flex;
  flex-direction: column;
  padding: 20px 20px 24px;
}

.news-card__info {
  flex: 0 0 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 5px;
}

.news-card__meta {
  margin: 0;
  color: #617684;
  font-size: 12px;
  line-height: 1.45;
  white-space: nowrap;
}

.news-card h2 {
  min-height: 1.45em;
  display: -webkit-box;
  margin: 0;
  overflow: hidden;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
  color: #16324f;
  font-size: 17px;
  font-weight: 600;
  line-height: 1.45;
}

.news-card__summary {
  min-height: 47.6px;
  display: -webkit-box;
  margin: 5px 0 0;
  overflow: hidden;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
  color: #617684;
  font-size: 14px;
  font-weight: 400;
  line-height: 1.6;
}

@media (prefers-reduced-motion: reduce) {
  .news-card { transition: none; }
  .news-card:hover { transform: none; }
}
</style>
