<script setup>
const props = defineProps({ metabolite: { type: Object, required: true } })
</script>

<template>
  <section class="detail-hero" aria-labelledby="metabolite-title">
    <div class="detail-hero__inner">
      <div class="detail-hero__copy">
        <h1 id="metabolite-title">
          <span class="detail-hero__name">{{ props.metabolite.name }}</span>
          <span class="detail-hero__name-zh" lang="zh-CN">{{ props.metabolite.chineseName }}</span>
        </h1>
      </div>
    </div>
  </section>
</template>

<style scoped>
.detail-hero {
  box-sizing: border-box;
  position: relative;
  overflow: hidden;
  width: min(1560px, calc(100% - 48px));
  height: 74px;
  margin: 0 auto 12px;
  background: #087fbe;
}

.detail-hero::before,
.detail-hero::after {
  content: '';
  position: absolute;
  z-index: 0;
  height: 1px;
  border-radius: 999px;
  pointer-events: none;
  transform-origin: right center;
}

.detail-hero::before {
  top: 10px;
  right: clamp(50px, 3.8vw, 64px);
  width: clamp(106px, 8vw, 118px);
  background: rgba(255, 255, 255, 0.18);
  transform: rotate(-8.5deg);
}

.detail-hero::after {
  top: 31px;
  right: clamp(56px, 4.3vw, 70px);
  width: clamp(180px, 13vw, 196px);
  background: rgba(255, 255, 255, 0.26);
  transform: rotate(-11deg);
}

.detail-hero__inner {
  box-sizing: border-box;
  position: relative;
  z-index: 1;
  height: 74px;
  padding: 10px 32px;
  display: flex;
  align-items: center;
}

.detail-hero__copy {
  min-width: 0;
}

.detail-hero h1 {
  margin: 0;
  color: #fff;
  line-height: 1;
}

.detail-hero__name,
.detail-hero__name-zh {
  display: block;
  font-size: 20px;
  line-height: 1.15;
  overflow-wrap: anywhere;
}

.detail-hero__name {
  font-weight: 600;
  letter-spacing: -0.012em;
}

.detail-hero__name-zh {
  margin-top: 4px;
  color: rgba(255, 255, 255, 0.9);
  font-weight: 500;
  letter-spacing: 0.015em;
}

@media (max-width: 700px) {
  .detail-hero {
    width: calc(100% - 28px);
    height: 76px;
  }

  .detail-hero__inner {
    height: 76px;
    padding: 10px 20px;
  }

  .detail-hero::before {
    top: 14px;
    right: 17px;
    width: 56px;
    background: rgba(255, 255, 255, 0.16);
    transform: rotate(-7deg);
  }

  .detail-hero::after {
    top: 35px;
    right: 23px;
    width: 90px;
    background: rgba(255, 255, 255, 0.22);
    transform: rotate(-10deg);
  }
}
</style>

