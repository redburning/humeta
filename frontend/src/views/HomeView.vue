<script setup>
import HeroSection from '../components/home/HeroSection.vue'
import FeatureCard from '../components/home/FeatureCard.vue'
import FooterSection from '../components/layout/FooterSection.vue'

const features = [
  {
    id: 'new-discovery',
    to: { name: 'news-wechat-blog', query: { lang: 'zh' } },
    title: 'New discovery',
    description: '3-sucCA (3-Succinylated cholic acid) 琥珀酰胆酸',
    citation: 'Cell. 2024 May 23;187(11):2717-2734.e33',
    icon: 'network',
    structure: '/images/structure-succca.svg',
    structureAlt: '3-sucCA 化学结构示意图',
  },
  {
    id: 'metabolite-month',
    to: { name: 'news-wechat-blog', query: { lang: 'zh' } },
    title: 'Metabolite of the month',
    description: 'N-Lactoyl-Phenylalanine N-乳酸酰苯丙氨酸',
    citation: 'Nature. 2022 Jun;606(7915):785-790.',
    icon: 'calendar',
    structure: '/images/structure-lacphe.svg',
    structureAlt: 'N-Lactoyl-Phenylalanine 化学结构示意图',
  },
]
</script>

<template>
  <main class="home-page">
    <HeroSection />

    <section class="recommendations" aria-label="推荐内容">
      <div class="hexagon-cluster hexagon-cluster--left" aria-hidden="true">
        <span v-for="item in 10" :key="`left-${item}`" />
      </div>
      <div class="hexagon-cluster hexagon-cluster--right" aria-hidden="true">
        <span v-for="item in 8" :key="`right-${item}`" />
      </div>

      <div class="feature-grid page-container">
        <FeatureCard
          v-for="feature in features"
          :key="feature.id"
          v-bind="feature"
        />
      </div>
    </section>

    <FooterSection variant="home" />
  </main>
</template>

<style scoped>
.home-page {
  min-height: 100vh;
  overflow: hidden;
}

.recommendations {
  position: relative;
  min-height: 406px;
  overflow: hidden;
  padding: 36px 24px 52px;
  background: #fff;
  display: flex;
  align-items: flex-start;
}

.feature-grid {
  position: relative;
  z-index: 2;
  width: min(100%, 718px);
  max-width: 718px;
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 345px));
  justify-content: center;
  gap: 28px;
}

.hexagon-cluster {
  position: absolute;
  z-index: 1;
  display: grid;
  grid-template-columns: repeat(4, 54px);
  gap: 3px;
  opacity: 0.08;
  pointer-events: none;
}

.hexagon-cluster span {
  position: relative;
  width: 54px;
  height: 61px;
  background: #168fbd;
  clip-path: polygon(25% 6.7%, 75% 6.7%, 100% 50%, 75% 93.3%, 25% 93.3%, 0 50%);
}

.hexagon-cluster span::after {
  content: '';
  position: absolute;
  inset: 1px;
  background: #fff;
  clip-path: inherit;
}

.hexagon-cluster span:nth-child(3n + 1) {
  background: #73c1de;
}

.hexagon-cluster span:nth-child(4n + 2)::after {
  background: #eaf5fa;
}

.hexagon-cluster--left {
  left: -45px;
  bottom: -20px;
  transform: rotate(-1deg);
}

.hexagon-cluster--left span:nth-child(1),
.hexagon-cluster--left span:nth-child(2),
.hexagon-cluster--left span:nth-child(5) {
  visibility: hidden;
}

.hexagon-cluster--right {
  right: -38px;
  top: -30px;
}

.hexagon-cluster--right span:nth-child(4),
.hexagon-cluster--right span:nth-child(7),
.hexagon-cluster--right span:nth-child(8) {
  visibility: hidden;
}

@media (max-width: 1024px) {
  .recommendations {
    min-height: auto;
    padding-block: 34px 48px;
  }

  .feature-grid {
    gap: 28px;
  }

  .hexagon-cluster {
    opacity: 0.06;
  }

  .hexagon-cluster--left {
    left: -74px;
    bottom: -42px;
    transform: rotate(-1deg) scale(0.78);
  }

  .hexagon-cluster--right {
    right: -70px;
    top: -48px;
    transform: scale(0.78);
  }
}

@media (max-width: 768px) {
  .recommendations {
    padding: 32px 20px 44px;
  }

  .feature-grid {
    width: min(100%, 345px);
    grid-template-columns: 1fr;
    gap: 20px;
  }

  .hexagon-cluster {
    display: none;
  }
}
</style>
