<script setup>
import HeaderNav from '../layout/HeaderNav.vue'
import SearchPanel from './SearchPanel.vue'
import homeHeroBg from '@/assets/images/home/home-hero-bg-optimized.webp'
</script>

<template>
  <section
    class="hero-section"
    aria-labelledby="hero-title"
    :style="{ backgroundImage: `url(${homeHeroBg})` }"
  >
    <HeaderNav />

    <div class="hero-content page-container">
      <div class="hero-heading">
        <h1 id="hero-title">人体代谢组图谱数据库</h1>
        <p class="hero-heading__subtitle">The Human Metabolome Atlas Database</p>
      </div>

      <SearchPanel />
    </div>
  </section>
</template>

<style scoped>
.hero-section {
  position: relative;
  min-height: 528px;
  overflow: hidden;
  color: white;
  background-color: #087fc3;
  background-repeat: no-repeat;
  background-size: cover;
  background-position: center 48%;
}

.hero-section::after {
  content: '';
  position: absolute;
  z-index: 2;
  inset: 0;
  background: rgba(0, 70, 130, 0.1);
  pointer-events: none;
}

.hero-content {
  position: relative;
  z-index: 3;
  padding-top: 64px;
}

.hero-heading {
  text-align: center;
}

.hero-heading h1 {
  color: white;
  font-family: "Microsoft YaHei", "微软雅黑", Arial, sans-serif;
  font-size: clamp(48px, 4vw, 58px);
  font-weight: 700;
  line-height: 1.08;
  letter-spacing: 0.01em;
}

.hero-heading__subtitle {
  margin-top: 16px;
  color: rgba(255, 255, 255, 0.88);
  font-family: Arial, sans-serif;
  font-size: clamp(22px, 1.8vw, 26px);
  font-weight: 500;
  line-height: 1.2;
  letter-spacing: 0.005em;
}

@media (max-width: 1024px) {
  .hero-section {
    min-height: 506px;
    background-position: center center;
  }

  .hero-content {
    padding-top: 52px;
  }

  .hero-heading h1 {
    font-size: clamp(40px, 4.6875vw, 48px);
  }

  .hero-heading__subtitle {
    margin-top: clamp(12px, 1.3672vw, 14px);
    font-size: clamp(19px, 2.1484vw, 22px);
  }
}

@media (max-width: 767px) {
  .hero-section {
    min-height: clamp(500px, 133vw, 546px);
  }

  .hero-content {
    padding-top: 34px;
  }

  .hero-heading h1 {
    font-size: clamp(30px, 7.91vw, 34px);
    white-space: nowrap;
  }

  .hero-heading__subtitle {
    margin-top: 10px;
    font-size: clamp(16px, 4.19vw, 18px);
  }
}

@media (max-width: 350px) {
  .hero-heading h1 {
    font-size: 28px;
    white-space: normal;
  }
}
</style>
