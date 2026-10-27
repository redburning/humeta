<script setup>
import HumetaEcosystemGraphic from './HumetaEcosystemGraphic.vue'

defineProps({
  content: {
    type: Object,
    required: true,
  },
  chartContent: {
    type: Object,
    required: true,
  },
})
</script>

<template>
  <section class="editorial-section editorial-section--white">
    <div class="about-shell editorial-grid editorial-grid--welcome">
      <HumetaEcosystemGraphic :content="chartContent" />
      <div class="editorial-copy">
        <p class="editorial-copy__eyebrow">{{ content.eyebrow }}</p>
        <h2>{{ content.title }}</h2>
        <p v-for="paragraph in content.paragraphs" :key="paragraph">{{ paragraph }}</p>
      </div>
    </div>
  </section>
</template>

<style scoped>
.editorial-section {
  padding: 80px 0 86px;
}

.editorial-section--white {
  background: #fff;
}

.about-shell {
  width: min(1240px, calc(100% - 48px));
  margin: 0 auto;
}

.editorial-grid {
  display: grid;
  align-items: center;
  gap: clamp(54px, 7vw, 104px);
}

.editorial-grid--welcome {
  grid-template-columns: minmax(0, 1.13fr) minmax(0, 0.87fr);
}

.editorial-copy__eyebrow {
  margin: 0 0 9px !important;
  color: #5aa3b1 !important;
  font-size: 10px !important;
  font-weight: 700;
  letter-spacing: 0.12em;
  line-height: 1.4 !important;
  text-transform: uppercase;
}

.editorial-copy h2 {
  position: relative;
  margin: 0 0 30px;
  padding-bottom: 20px;
  color: #18354a;
  font-size: clamp(28px, 2.75vw, 39px);
  font-weight: 500;
  letter-spacing: -0.03em;
  line-height: 1.25;
}

.editorial-copy h2::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 0;
  width: 54px;
  height: 2px;
  background: #50b5c1;
}

.editorial-copy p {
  margin: 0;
  color: #4b606c;
  font-size: 15.5px;
  line-height: 1.78;
}

.editorial-copy p + p {
  margin-top: 17px;
}

@media (max-width: 860px) {
  .editorial-section {
    padding: 64px 0 68px;
  }

  .about-shell {
    width: calc(100% - 40px);
  }

  .editorial-grid--welcome {
    grid-template-columns: 1fr;
  }

  .editorial-grid {
    gap: 44px;
  }
}

@media (max-width: 480px) {
  .editorial-section {
    padding-block: 48px 52px;
  }

  .editorial-grid {
    gap: 32px;
  }

  .editorial-copy h2 {
    margin-bottom: 27px;
    font-size: 30px;
  }

  .editorial-copy p {
    font-size: 15px;
    line-height: 1.72;
  }
}
</style>
