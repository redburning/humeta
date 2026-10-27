import { nextTick } from 'vue'
import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'
import BrowserView from '../views/BrowserView.vue'

function normalizeBilingualLanguage(to) {
  const language = Array.isArray(to.query.lang) ? to.query.lang[0] : to.query.lang
  if ((language === 'zh' || language === 'en') && !Array.isArray(to.query.lang)) return true

  return {
    path: to.path,
    query: { ...to.query, lang: 'zh' },
    hash: to.hash,
    replace: true,
  }
}

const routes = [
  { path: '/', name: 'home', component: HomeView, meta: { title: '人体代谢组图谱', documentLang: 'zh-CN' } },
  { path: '/browser', name: 'browser', component: BrowserView, meta: { title: 'Browser', documentLang: 'en' } },
  {
    path: '/browser/search',
    name: 'browser-search',
    redirect: (to) => ({
      name: 'browser',
      query: to.query,
      hash: to.hash,
      replace: true,
    }),
  },
  {
    path: '/metabolites/:id',
    name: 'metabolite-detail',
    component: () => import('../views/MetaboliteDetailView.vue'),
    meta: { title: 'Metabolite Detail', documentLang: 'en' },
  },
  {
    path: '/structure-search',
    name: 'structure-search',
    component: () => import('../views/StructureSearchView.vue'),
    meta: { title: 'Structure search', documentLang: 'en' },
  },
  {
    path: '/news',
    name: 'news',
    redirect: (to) => ({ path: '/news/wechat-blog', query: to.query, hash: to.hash }),
  },
  {
    path: '/news/wechat-blog',
    name: 'news-wechat-blog',
    component: () => import('../views/NewsWechatBlogView.vue'),
    meta: { title: 'News', manageTitleLocally: true, manageLangLocally: true },
    beforeEnter: normalizeBilingualLanguage,
  },
  {
    path: '/news/wechat-blog/:slug',
    name: 'news-article',
    component: () => import('../views/NewsArticleView.vue'),
    meta: { title: 'News article', manageTitleLocally: true, manageLangLocally: true },
    beforeEnter: normalizeBilingualLanguage,
  },
  {
    path: '/news/upgrade-record',
    name: 'news-upgrade-record',
    component: () => import('../views/NewsUpgradeRecordView.vue'),
    meta: { title: 'Upgrade Record', manageTitleLocally: true, manageLangLocally: true },
    beforeEnter: normalizeBilingualLanguage,
  },
  {
    path: '/about-us',
    name: 'about-us',
    component: () => import('../views/AboutUsView.vue'),
    meta: { title: 'About us', manageLangLocally: true },
    beforeEnter: normalizeBilingualLanguage,
  },
  {
    path: '/about',
    redirect: (to) => ({ path: '/about-us', query: to.query, hash: to.hash }),
  },
  {
    path: '/:pathMatch(.*)*',
    name: 'not-found',
    component: () => import('../views/NotFoundView.vue'),
    meta: { title: 'Page Not Found', documentLang: 'en' },
  },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior(to, from, savedPosition) {
    if (savedPosition) return savedPosition
    if (to.hash) {
      let targetId
      try {
        targetId = decodeURIComponent(to.hash.slice(1))
      } catch {
        targetId = to.hash.slice(1)
      }
      const target = document.getElementById(targetId)
      if (target) return { el: target, top: 112, behavior: 'smooth' }
      return { top: 0 }
    }
    if (
      to.name === 'news-wechat-blog'
      && from.name === 'news-wechat-blog'
      && to.query.page !== from.query.page
    ) {
      return { el: '#news-grid', top: 96, behavior: 'smooth' }
    }
    return { top: 0 }
  },
})

router.afterEach(async (to) => {
  if (to.meta.manageTitleLocally && to.meta.manageLangLocally) return

  await nextTick()
  if (router.currentRoute.value.fullPath !== to.fullPath) return

  if (!to.meta.manageLangLocally) document.documentElement.lang = to.meta.documentLang
  if (!to.meta.manageTitleLocally) document.title = `${to.meta.title} | Humeta`
})

export default router
