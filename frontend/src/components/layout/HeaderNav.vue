<script setup>
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import BrandLogo from './BrandLogo.vue'

const props = defineProps({
  variant: {
    type: String,
    default: 'hero',
    validator: (value) => ['hero', 'light'].includes(value),
  },
})

const route = useRoute()
const headerRef = ref(null)
const menuToggleRef = ref(null)
const newsToggleRef = ref(null)
const isMenuOpen = ref(false)
const isNewsOpen = ref(false)
let newsOpenedByHover = false

const language = computed(() => (route.query.lang === 'en' ? 'en' : 'zh'))
const isNewsActive = computed(() => route.path === '/news' || route.path.startsWith('/news/'))
const newsVisibleLabels = Object.freeze({
  blog: 'Humeta News',
  upgrade: 'Upgrade Record',
})
const newsLabels = computed(() => (
  language.value === 'en'
    ? { menuAriaLabel: 'News menu', blogAriaLabel: 'Open WeChat Blog', upgradeAriaLabel: 'Open Upgrade Record' }
    : { menuAriaLabel: '新闻菜单', blogAriaLabel: '打开微信博客', upgradeAriaLabel: '打开升级记录' }
))

const navItems = [
  { label: 'Home', to: '/' },
  {
    label: 'Browser',
    to: '/browser',
    matches: (path) => path === '/browser' || path.startsWith('/browser/') || path.startsWith('/metabolites/'),
  },
  { label: 'Spectrum search', static: true },
  { label: 'Structure search', to: '/structure-search' },
  { label: 'About us', to: '/about-us' },
  // Replace this static label with a normal external link once the official company homepage URL is available.
  { label: '我要测', static: true },
]

function isActive(item) {
  return item.matches ? item.matches(route.path) : route.path === item.to
}

function itemTarget(item) {
  if (item.to === '/about-us' && (route.query.lang === 'zh' || route.query.lang === 'en')) {
    return { path: item.to, query: { lang: language.value } }
  }
  return item.to
}

function newsTarget(name) {
  const query = { ...route.query, lang: language.value }
  delete query.page
  return { name, query }
}

function closeMenus() {
  isMenuOpen.value = false
  isNewsOpen.value = false
  newsOpenedByHover = false
}

function toggleNews() {
  if (newsOpenedByHover) {
    newsOpenedByHover = false
    return
  }
  isNewsOpen.value = !isNewsOpen.value
}

function openNewsOnHover() {
  if (!window.matchMedia('(max-width: 767px)').matches) {
    isNewsOpen.value = true
    newsOpenedByHover = true
  }
}

function closeNewsOnHover() {
  if (!window.matchMedia('(max-width: 767px)').matches) {
    isNewsOpen.value = false
    newsOpenedByHover = false
  }
}

function handleDocumentClick(event) {
  if (headerRef.value && !headerRef.value.contains(event.target)) closeMenus()
}

function handleEscape(event) {
  if (event.key !== 'Escape' || (!isMenuOpen.value && !isNewsOpen.value)) return
  const shouldRestoreNewsFocus = isNewsOpen.value
  const shouldRestoreMenuFocus = isMenuOpen.value && window.matchMedia('(max-width: 767px)').matches
  closeMenus()
  if (shouldRestoreMenuFocus) menuToggleRef.value?.focus()
  else if (shouldRestoreNewsFocus) newsToggleRef.value?.focus()
}

watch(() => route.fullPath, closeMenus)

onMounted(() => {
  document.addEventListener('click', handleDocumentClick)
  document.addEventListener('keydown', handleEscape)
})

onBeforeUnmount(() => {
  document.removeEventListener('click', handleDocumentClick)
  document.removeEventListener('keydown', handleEscape)
})
</script>

<template>
  <header ref="headerRef" class="site-header" :class="`site-header--${props.variant}`">
    <div class="site-header__inner page-container">
      <RouterLink to="/" class="brand" aria-label="Humeta 首页">
        <BrandLogo :variant="props.variant === 'hero' ? 'light' : 'dark'" class="brand__logo" />
      </RouterLink>

      <button
        ref="menuToggleRef"
        class="menu-toggle"
        type="button"
        :aria-label="isMenuOpen ? '关闭导航菜单' : '打开导航菜单'"
        :aria-expanded="isMenuOpen"
        aria-controls="main-navigation"
        @click.stop="isMenuOpen = !isMenuOpen"
      >
        <span />
        <span />
        <span />
      </button>

      <nav id="main-navigation" class="main-nav" :class="{ 'main-nav--open': isMenuOpen }" aria-label="主导航">
        <template v-for="item in navItems.slice(0, 4)" :key="item.to || item.label">
          <span
            v-if="item.static"
            class="main-nav__link main-nav__label"
            data-nav-placeholder
          >
            {{ item.label }}
          </span>
          <RouterLink
            v-else
            :to="itemTarget(item)"
            class="main-nav__link"
            :class="{ 'main-nav__item--active': isActive(item) }"
            :aria-current="isActive(item) ? 'page' : undefined"
            @click="closeMenus"
          >
            {{ item.label }}
          </RouterLink>
        </template>

        <div
          class="news-nav"
          :class="{ 'news-nav--open': isNewsOpen, 'main-nav__item--active': isNewsActive }"
          @mouseenter="openNewsOnHover"
          @mouseleave="closeNewsOnHover"
        >
          <button
            id="news-menu-button"
            ref="newsToggleRef"
            type="button"
            class="main-nav__link news-nav__toggle"
            :aria-label="newsLabels.menuAriaLabel"
            :aria-expanded="isNewsOpen"
            aria-controls="news-submenu"
            :aria-current="isNewsActive ? 'page' : undefined"
            @click.stop="toggleNews"
            @keydown.enter.prevent.stop="toggleNews"
            @keydown.space.prevent.stop="toggleNews"
          >
            <span>News</span>
            <span class="news-nav__chevron" aria-hidden="true" />
          </button>

          <div
            id="news-submenu"
            class="news-submenu"
            aria-labelledby="news-menu-button"
          >
            <RouterLink
              :to="newsTarget('news-wechat-blog')"
              :aria-label="newsLabels.blogAriaLabel"
              :class="{ 'news-submenu__active': route.name === 'news-wechat-blog' || route.name === 'news-article' }"
              @click="closeMenus"
            >
              {{ newsVisibleLabels.blog }}
            </RouterLink>
            <RouterLink
              :to="newsTarget('news-upgrade-record')"
              :aria-label="newsLabels.upgradeAriaLabel"
              :class="{ 'news-submenu__active': route.name === 'news-upgrade-record' }"
              @click="closeMenus"
            >
              {{ newsVisibleLabels.upgrade }}
            </RouterLink>
          </div>
        </div>

        <template v-for="item in navItems.slice(4)" :key="item.to || item.label">
          <span
            v-if="item.static"
            class="main-nav__link main-nav__label"
            data-nav-placeholder
          >
            {{ item.label }}
          </span>
          <RouterLink
            v-else
            :to="itemTarget(item)"
            class="main-nav__link"
            :class="{ 'main-nav__item--active': isActive(item) }"
            :aria-current="isActive(item) ? 'page' : undefined"
            @click="closeMenus"
          >
            {{ item.label }}
          </RouterLink>
        </template>
      </nav>
    </div>
  </header>
</template>

<style scoped>
.site-header {
  position: relative;
  z-index: 40;
  height: var(--header-height);
  background: transparent;
}

.site-header--light {
  height: 60px;
  border-bottom: 1px solid #edf2f5;
  background: white;
}

.site-header__inner {
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.site-header--light .site-header__inner {
  width: min(1810px, calc(100% - 100px));
}

.brand {
  height: 100%;
  display: flex;
  align-items: center;
  flex: 0 0 auto;
}

.brand__logo {
  display: block;
  width: 100%;
  height: 50px;
  pointer-events: none;
}

.site-header--hero .brand,
.site-header--light .brand {
  width: 160px;
}

.site-header--hero .brand__logo,
.site-header--light .brand__logo {
  width: 100%;
}

.main-nav {
  display: flex;
  align-items: center;
  gap: 34px;
}

.main-nav__link {
  position: relative;
  min-height: 42px;
  display: flex;
  align-items: center;
  padding: 10px 0;
  border: 0;
  color: rgba(255, 255, 255, 0.94);
  background: none;
  font: inherit;
  font-size: 16px;
  font-weight: 400;
  line-height: 1;
  text-decoration: none;
  white-space: nowrap;
  cursor: pointer;
  transition: color var(--humeta-motion-base) var(--humeta-ease-standard);
}

.main-nav__link::after {
  content: '';
  position: absolute;
  left: 50%;
  bottom: 2px;
  width: 100%;
  height: 2px;
  background: rgba(255, 255, 255, 0.92);
  opacity: 0;
  transform: translateX(-50%) scaleX(0);
  transform-origin: center;
  transition:
    opacity var(--humeta-motion-base) var(--humeta-ease-standard),
    transform var(--humeta-motion-slow) var(--humeta-ease-out);
}

.main-nav__link:hover,
.main-nav__link:focus-visible {
  color: #fff;
}

.main-nav__link:hover::after,
.main-nav__link:focus-visible::after {
  opacity: 0.72;
  transform: translateX(-50%) scaleX(1);
}

.main-nav__label,
.main-nav__label:hover,
.main-nav__label:active {
  color: rgba(255, 255, 255, 0.94);
  cursor: default;
}

.main-nav__label::after {
  display: none;
}

.main-nav__item--active > .main-nav__link::after,
.main-nav__link.main-nav__item--active::after {
  opacity: 1;
  transform: translateX(-50%) scaleX(1);
}

.main-nav__item--active > .main-nav__link,
.main-nav__link.main-nav__item--active {
  color: #fff;
  font-weight: 500;
}

.main-nav__link:active {
  color: rgba(215, 246, 255, 0.78);
  transform: none;
  transition-duration: var(--humeta-motion-fast);
}

.main-nav__link:active::after {
  background: rgba(215, 246, 255, 0.82);
  opacity: 1;
}

.site-header--light .main-nav__link {
  color: #60717d;
}

.site-header--light .main-nav__link::after {
  background: var(--primary-blue);
}

.site-header--light .main-nav__link:hover,
.site-header--light .main-nav__link:focus-visible,
.site-header--light .main-nav__item--active,
.site-header--light .main-nav__item--active > .main-nav__link {
  color: var(--primary-blue);
}

.site-header--light .main-nav__link:active {
  color: var(--humeta-action-pressed);
}

.site-header--light .main-nav__link:active::after {
  background: var(--humeta-action-pressed);
}

.site-header--light .main-nav__label,
.site-header--light .main-nav__label:hover,
.site-header--light .main-nav__label:active {
  color: #60717d;
}

.news-nav {
  position: relative;
  display: flex;
  align-items: center;
}

.news-nav__toggle {
  gap: 8px;
}

.news-nav__chevron {
  width: 7px;
  height: 7px;
  border-right: 1.5px solid currentColor;
  border-bottom: 1.5px solid currentColor;
  transform: translateY(-2px) rotate(45deg);
  transition: transform var(--humeta-motion-slow) var(--humeta-ease-out);
}

.news-nav--open .news-nav__chevron {
  transform: translateY(2px) rotate(225deg);
}

.news-submenu {
  position: absolute;
  z-index: 50;
  top: calc(100% - 1px);
  left: 50%;
  width: 188px;
  display: grid;
  padding: 5px 0;
  border: 1px solid #d5e5eb;
  border-radius: 2px;
  background: rgba(255, 255, 255, 0.99);
  box-shadow: 0 8px 18px rgba(15, 70, 95, 0.11);
  opacity: 0;
  visibility: hidden;
  pointer-events: none;
  transform: translate(-50%, -5px);
  transition: opacity 150ms ease, transform 150ms ease, visibility 0s linear 150ms;
}

.news-nav--open .news-submenu {
  opacity: 1;
  visibility: visible;
  pointer-events: auto;
  transform: translate(-50%, 0);
  transition-delay: 0s;
}

.news-submenu a {
  min-height: 46px;
  display: flex;
  align-items: center;
  padding: 0 18px;
  color: #455e6d;
  font-size: 14px;
  text-decoration: none;
  transition:
    color var(--humeta-motion-base) var(--humeta-ease-standard),
    background-color var(--humeta-motion-base) var(--humeta-ease-standard);
}

.news-submenu a:hover,
.news-submenu a:focus-visible,
.news-submenu__active {
  color: #006ea8;
  background: #eaf7fa;
}

.news-submenu a:active {
  color: var(--humeta-action-pressed);
  background: color-mix(in srgb, var(--humeta-blue-100) 84%, var(--humeta-action) 16%);
  transition-duration: var(--humeta-motion-fast);
}

.news-submenu a:focus-visible,
.main-nav__link:focus-visible,
.menu-toggle:focus-visible {
  outline: 2px solid var(--humeta-focus-ring);
  outline-offset: 2px;
}

.menu-toggle {
  display: none;
}

@media (max-width: 1024px) {
  .site-header--light .site-header__inner {
    width: calc(100% - 48px);
  }

  .site-header--hero .brand,
  .site-header--light .brand { width: 144px; }

  .brand__logo { height: 48px; }
}

@media (max-width: 900px) {
  .main-nav { gap: 11px; }
  .main-nav__link { font-size: 13px; }
}

@media (max-width: 767px) {
  .site-header { height: 64px; }
  .site-header--light .site-header__inner { width: calc(100% - 40px); }

  .menu-toggle {
    width: 44px;
    height: 44px;
    padding: 10px;
    border: 1px solid rgba(255, 255, 255, 0.3);
    border-radius: 8px;
    display: flex;
    flex-direction: column;
    justify-content: center;
    gap: 5px;
    background: rgba(2, 78, 150, 0.25);
    cursor: pointer;
    transition:
      border-color var(--humeta-motion-base) var(--humeta-ease-standard),
      background-color var(--humeta-motion-base) var(--humeta-ease-standard);
  }

  .menu-toggle span {
    width: 100%;
    height: 2px;
    background: white;
  }

  .site-header--light .menu-toggle {
    border-color: rgba(8, 127, 190, 0.24);
    background: rgba(8, 127, 190, 0.06);
  }

  .site-header--light .menu-toggle span { background: var(--deep-blue); }

  .menu-toggle:hover { background: rgba(2, 78, 150, 0.34); }
  .menu-toggle:active {
    background: rgba(2, 78, 150, 0.46);
    transform: none;
    transition-duration: var(--humeta-motion-fast);
  }

  .site-header--light .menu-toggle:hover {
    border-color: rgba(8, 127, 190, 0.42);
    background: rgba(8, 127, 190, 0.1);
  }

  .site-header--light .menu-toggle:active {
    border-color: rgba(8, 127, 190, 0.56);
    background: rgba(8, 127, 190, 0.16);
  }

  .main-nav {
    position: absolute;
    z-index: 30;
    top: 58px;
    left: 20px;
    right: 20px;
    max-height: calc(100vh - 78px);
    overflow-y: auto;
    display: grid;
    gap: 0;
    padding: 8px;
    border: 1px solid rgba(255, 255, 255, 0.24);
    border-radius: 10px;
    background: rgba(0, 70, 139, 0.98);
    box-shadow: 0 16px 40px rgba(0, 35, 86, 0.24);
    opacity: 0;
    visibility: hidden;
    pointer-events: none;
    transform: translateY(-8px);
    transition: opacity 180ms ease, transform 180ms ease, visibility 0s linear 180ms;
  }

  .main-nav--open {
    opacity: 1;
    visibility: visible;
    pointer-events: auto;
    transform: translateY(0);
    transition-delay: 0s;
  }

  .main-nav__link {
    width: 100%;
    min-height: 44px;
    padding: 12px 14px;
    border-radius: 6px;
    justify-content: space-between;
    text-align: left;
  }

  .main-nav__link::after { display: none; }
  .main-nav__link:hover,
  .main-nav__link:focus-visible { background: rgba(255, 255, 255, 0.1); }

  .main-nav__item--active > .main-nav__link,
  .main-nav__link.main-nav__item--active {
    color: #fff;
    background: rgba(255, 255, 255, 0.14);
  }

  .main-nav__link:active {
    background: rgba(255, 255, 255, 0.2);
  }

  .news-nav { display: block; }

  .news-submenu {
    position: static;
    width: 100%;
    max-height: 0;
    padding: 0;
    border: 0;
    border-radius: 0;
    overflow: hidden;
    background: rgba(255, 255, 255, 0.08);
    box-shadow: none;
    opacity: 1;
    visibility: hidden;
    pointer-events: none;
    transform: none;
    transition: max-height 180ms ease;
  }

  .news-nav--open .news-submenu {
    max-height: 104px;
    visibility: visible;
    pointer-events: auto;
    transform: none;
  }

  .news-submenu a {
    min-height: 48px;
    padding-left: 28px;
    color: rgba(255, 255, 255, 0.9);
  }

  .news-submenu a:hover,
  .news-submenu a:focus-visible,
  .news-submenu__active {
    color: white;
    background: rgba(255, 255, 255, 0.12);
  }

  .site-header--light .main-nav {
    border-color: #dce8ef;
    background: rgba(255, 255, 255, 0.99);
  }

  .site-header--light .main-nav__link { color: #596973; }
  .site-header--light .main-nav__link:hover,
  .site-header--light .main-nav__link:focus-visible,
  .site-header--light .main-nav__item--active,
  .site-header--light .main-nav__item--active > .main-nav__link {
    color: var(--primary-blue);
    background: rgba(8, 127, 190, 0.07);
  }

  .site-header--light .main-nav__link:active {
    color: var(--humeta-action-pressed);
    background: rgba(8, 127, 190, 0.14);
  }

  .site-header--light .news-submenu { background: #f3f8fa; }
  .site-header--light .news-submenu a { color: #526875; }
  .site-header--light .news-submenu a:hover,
  .site-header--light .news-submenu a:focus-visible,
  .site-header--light .news-submenu__active {
    color: var(--primary-blue);
    background: #e5f3f7;
  }

  .main-nav__label:hover,
  .main-nav__label:active {
    background: transparent;
  }

  .site-header--light .main-nav__label:hover,
  .site-header--light .main-nav__label:active {
    color: #596973;
    background: transparent;
  }

}

@media (prefers-reduced-motion: reduce) {
  .main-nav,
  .main-nav__link,
  .main-nav__link::after,
  .news-submenu,
  .news-nav__chevron,
  .menu-toggle { transition: none; }
}
</style>
