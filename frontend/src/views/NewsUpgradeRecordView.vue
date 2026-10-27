<script setup>
import HeaderNav from '../components/layout/HeaderNav.vue'
import FooterSection from '../components/layout/FooterSection.vue'
import UpgradeTimeline from '../components/news/UpgradeTimeline.vue'
import BannerGeometricLines from '../components/news/BannerGeometricLines.vue'
import { useNewsLanguage } from '../composables/useNewsLanguage.js'
import { timelineMilestones } from '../data/newsData.js'

const { language } = useNewsLanguage((lang) => lang === 'en' ? 'Upgrade Record | Humeta' : '升级记录 | Humeta')
</script>

<template>
  <div class="upgrade-page">
    <HeaderNav variant="light" />
    <section class="upgrade-hero" aria-labelledby="upgrade-hero-title">
      <BannerGeometricLines variant="milestone" />
      <div class="upgrade-hero__inner">
        <h1 id="upgrade-hero-title">
          {{ language === 'en' ? 'Milestones of Humeta Growth' : 'Humeta 成长里程碑' }}
        </h1>
      </div>
    </section>

    <main class="upgrade-main">
      <p class="upgrade-main__note">
        {{ language === 'en'
          ? 'Development milestones verified against repository history and current implementation.'
          : '以下开发里程碑均可由仓库历史与当前实现核验。' }}
      </p>
      <UpgradeTimeline :milestones="timelineMilestones" :language="language" />
    </main>

    <FooterSection variant="compact" />
  </div>
</template>

<style scoped>
.upgrade-page {
  min-height: 100vh;
  overflow-x: clip;
  background: #f7fafc;
}

.upgrade-hero {
  height: 80px;
  position: relative;
  overflow: hidden;
  background: #087fbe;
}

.upgrade-hero__inner {
  position: relative;
  z-index: 2;
  width: min(1120px, calc(100% - 48px));
  height: 100%;
  margin: 0 auto;
  display: flex;
  align-items: center;
}

.upgrade-hero h1 {
  margin: 0;
  color: #fff;
  font-size: 26px;
  font-weight: 600;
  line-height: 1.2;
}

.upgrade-main {
  width: min(1120px, calc(100% - 48px));
  margin: 0 auto;
  padding: 36px 0 72px;
}

.upgrade-main__note {
  margin: 0 0 24px 30px;
  color: #718899;
  font-size: 13px;
  line-height: 1.6;
}

@media (max-width: 767px) {
  .upgrade-hero {
    height: 74px;
  }

  .upgrade-hero__inner {
    width: calc(100% - 40px);
  }

  .upgrade-hero h1 {
    font-size: 23px;
  }

  .upgrade-main {
    width: calc(100% - 40px);
    padding: 30px 0 50px;
  }
  .upgrade-main__note { margin: 0 0 20px 25px; font-size: 12.5px; }
}
</style>
