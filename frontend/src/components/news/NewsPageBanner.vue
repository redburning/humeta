<script setup>
defineProps({
  title: { type: String, required: true },
  language: { type: String, required: true },
  headingTag: { type: String, default: 'h1' },
  visuallyHiddenTitle: { type: Boolean, default: false },
})

defineEmits(['select-language'])
</script>

<template>
  <section class="news-banner" aria-labelledby="news-banner-title">
    <div class="news-banner__pattern" aria-hidden="true">
      <span class="news-banner__molecule news-banner__molecule--one" />
      <span class="news-banner__molecule news-banner__molecule--two" />
      <span class="news-banner__orbit" />
    </div>
    <div class="news-banner__inner">
      <component
        :is="headingTag"
        id="news-banner-title"
        class="news-banner__title"
        :class="{ 'news-banner__title--hidden': visuallyHiddenTitle }"
      >
        {{ title }}
      </component>
      <div class="news-banner__languages" :aria-label="language === 'en' ? 'Switch news language' : '切换新闻语言'">
        <button
          type="button"
          :class="{ 'news-banner__language--active': language === 'zh' }"
          :aria-pressed="language === 'zh'"
          @click="$emit('select-language', 'zh')"
        >中文</button>
        <span aria-hidden="true">/</span>
        <button
          type="button"
          :class="{ 'news-banner__language--active': language === 'en' }"
          :aria-pressed="language === 'en'"
          @click="$emit('select-language', 'en')"
        >EN</button>
      </div>
    </div>
  </section>
</template>

<style scoped>
.news-banner {
  position: relative;
  min-height: 82px;
  overflow: hidden;
  border-bottom: 1px solid #d9e9ed;
  background: linear-gradient(100deg, #d8f0f1 0%, #eaf6f3 49%, #dcecf4 100%);
}

.news-banner__inner {
  position: relative;
  z-index: 2;
  width: min(1220px, calc(100% - 48px));
  min-height: 82px;
  margin: 0 auto;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 24px;
}

.news-banner__title {
  margin: 0;
  color: #124f6a;
  font-size: clamp(22px, 2vw, 29px);
  font-weight: 600;
  letter-spacing: -0.02em;
}

.news-banner__title--hidden {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
}

.news-banner__languages {
  display: flex;
  align-items: center;
  gap: 7px;
  padding: 4px 7px;
  color: #7a9ca9;
  background: rgba(255, 255, 255, 0.52);
}

.news-banner__languages button {
  min-width: 40px;
  min-height: 34px;
  padding: 0 7px;
  border: 0;
  color: #678692;
  background: transparent;
  font: inherit;
  font-size: 12px;
  cursor: pointer;
}

.news-banner__languages button:hover,
.news-banner__languages button:focus-visible,
.news-banner__languages .news-banner__language--active {
  color: #006f9e;
  font-weight: 700;
}

.news-banner__languages button:focus-visible {
  outline: 2px solid #148eaf;
  outline-offset: 1px;
}

.news-banner__pattern {
  position: absolute;
  inset: 0;
  opacity: 0.34;
}

.news-banner__molecule {
  position: absolute;
  width: 54px;
  height: 47px;
  border: 1px solid #5aaabc;
  clip-path: polygon(25% 0, 75% 0, 100% 50%, 75% 100%, 25% 100%, 0 50%);
}

.news-banner__molecule::after {
  content: '';
  position: absolute;
  inset: 8px;
  border: 1px solid #68b3b8;
  clip-path: inherit;
}

.news-banner__molecule--one { left: 14%; top: 17px; }
.news-banner__molecule--two { right: 25%; top: -12px; transform: scale(1.45); }

.news-banner__orbit {
  position: absolute;
  right: 5%;
  top: -75px;
  width: 280px;
  height: 170px;
  border: 1px solid #3c9fae;
  border-radius: 50%;
  transform: rotate(-10deg);
}

@media (max-width: 767px) {
  .news-banner,
  .news-banner__inner { min-height: 72px; }
  .news-banner__inner { width: calc(100% - 40px); }
  .news-banner__title { font-size: 21px; }
  .news-banner__molecule--one { left: 34%; }
  .news-banner__orbit { right: -120px; }
}
</style>
