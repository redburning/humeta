<script setup>
import BrandLogo from './BrandLogo.vue'
import iphenomeQr from '@/assets/footer/iphenome-qr.png'

const props = defineProps({
  variant: {
    type: String,
    default: 'default',
    validator: (value) => ['default', 'compact', 'home'].includes(value),
  },
})
</script>

<template>
  <footer class="site-footer" :class="`site-footer--${props.variant}`">
    <div class="site-footer__arc" aria-hidden="true" />
    <div class="site-footer__inner page-container">
      <RouterLink to="/" class="footer-brand" aria-label="Humeta 首页">
        <BrandLogo variant="light" class="footer-brand__logo" />
      </RouterLink>

      <div class="site-footer__info">
        <p class="site-footer__title">The Human Metabolome Atlas</p>
        <div class="site-footer__company-info">
          <p>大连市高新技术产业园区兴贤街 36 号</p>
          <p>
            <a href="tel:0411822871171">0411-822871171</a>
            <span aria-hidden="true"> · </span>
            <a href="mailto:marcom@imetabolomics.cn">marcom@imetabolomics.cn</a>
          </p>
        </div>
      </div>

      <img class="footer-qr" :src="iphenomeQr" alt="iPhenome QR Code" />

      <div class="site-footer__meta">
        <p>Database version: HMA 1.0</p>
        <p>Last Update time: 2024-10</p>
        <p>辽 ICP 备 2022002459 号-2</p>
        <p>© 2025 iPhenome Biotech All Rights Reserved</p>
      </div>
    </div>
  </footer>
</template>

<style scoped>
.site-footer {
  position: relative;
  min-height: 116px;
  overflow: hidden;
  background: linear-gradient(106deg, #00498f 0%, #0784c9 52%, #005aa8 100%);
  color: white;
}

.site-footer::after {
  content: '';
  position: absolute;
  right: -7%;
  top: -205px;
  width: 700px;
  height: 330px;
  border: 1px solid rgba(133, 228, 255, 0.22);
  border-radius: 50%;
  transform: rotate(-7deg);
  pointer-events: none;
}

.site-footer__arc {
  position: absolute;
  left: -140px;
  top: -128px;
  width: 560px;
  height: 275px;
  border: 1px solid rgba(146, 232, 255, 0.16);
  border-radius: 50%;
  background: linear-gradient(135deg, rgba(126, 222, 255, 0.13), rgba(0, 53, 123, 0.32));
  transform: rotate(12deg);
  pointer-events: none;
}

.site-footer--home {
  min-height: 92px;
  overflow: hidden;
  background: linear-gradient(104deg, #075e9e 0%, #087fbe 58%, #0667a9 100%);
}

.site-footer--home::after {
  display: block;
  right: -100px;
  top: -218px;
  width: 660px;
  height: 330px;
  border-color: rgba(157, 229, 255, 0.16);
  transform: rotate(-8deg);
}

.site-footer--home .site-footer__arc {
  left: -160px;
  top: -172px;
  width: 520px;
  height: 260px;
  border-color: rgba(164, 231, 255, 0.13);
  background: transparent;
}

.site-footer__inner {
  position: relative;
  z-index: 2;
  min-height: 116px;
  display: grid;
  grid-template-columns: 1fr minmax(0, 1.4fr) 56px 239px;
  align-items: center;
  column-gap: 24px;
}

.site-footer--compact,
.site-footer--compact .site-footer__inner {
  min-height: 92px;
}

.site-footer--home .site-footer__inner {
  min-height: 92px;
}

.site-footer--home .footer-brand {
  width: 133px;
  height: 44px;
}

.footer-brand {
  display: flex;
  align-items: center;
  width: 145px;
  height: 48px;
  padding: 0;
  border: 0;
  border-radius: 0;
  background: transparent !important;
  box-shadow: none;
}

.footer-brand__logo {
  display: block;
  width: 100%;
  height: 100%;
  pointer-events: none;
}

.site-footer__title {
  margin: 0;
  color: rgba(255, 255, 255, 0.84);
  font-size: 14px;
  line-height: 1.35;
  text-align: center;
}

.site-footer__info {
  min-width: 0;
  position: relative;
  top: 8px;
  text-align: center;
}

.site-footer__company-info {
  margin-top: 2px;
  color: rgba(255, 255, 255, 0.76);
  font-size: 11px;
  line-height: 1.35;
}

.site-footer__company-info p {
  margin: 0;
  white-space: nowrap;
}

.site-footer__company-info a {
  color: inherit;
  text-decoration: none;
}

.site-footer__company-info a:hover {
  color: #fff;
  text-decoration: underline;
  text-underline-offset: 2px;
}

.footer-qr {
  display: block;
  width: 56px;
  height: 56px;
  aspect-ratio: 1;
  object-fit: contain;
}

.site-footer__meta {
  justify-self: end;
  color: rgba(255, 255, 255, 0.78);
  font-size: 11px;
  line-height: 1.4;
  text-align: right;
}

.site-footer__meta p {
  margin: 0;
}

@media (min-width: 768px) {
  .site-footer__info {
    justify-self: end;
    width: max-content;
  }
}

@media (max-width: 1199px) {
  .site-footer__inner {
    grid-template-columns: minmax(133px, 0.65fr) minmax(0, 1.55fr) 52px minmax(215px, 1.2fr);
    column-gap: 16px;
  }

  .site-footer__company-info {
    font-size: 10.5px;
  }

  .site-footer__meta {
    justify-self: start;
    font-size: 10px;
    text-align: right;
  }

  .footer-qr {
    width: 52px;
    height: 52px;
  }
}

@media (max-width: 767px) {
  .site-footer__inner {
    min-height: 0;
    height: 208px;
    grid-template-columns: minmax(0, 1fr) 48px;
    grid-template-rows: 50.6667px 59px minmax(0, 1fr);
    justify-items: center;
    column-gap: 12px;
    row-gap: 0;
    padding: 30px 0 18px;
  }

  .site-footer--home,
  .site-footer--home .site-footer__inner {
    min-height: 0;
    height: 208px;
  }

  .site-footer--compact,
  .site-footer--compact .site-footer__inner {
    min-height: 0;
    height: 177px;
  }

  .site-footer--compact .site-footer__inner {
    grid-template-rows: 45px 55px minmax(0, 1fr);
    padding: 24px 0 6px;
  }

  .footer-brand {
    grid-column: 1 / -1;
    grid-row: 1;
    width: 135px;
    height: 45px;
  }

  .site-footer__title {
    font-size: 13px;
    line-height: 15.2px;
  }

  .site-footer__info {
    grid-column: 1 / -1;
    grid-row: 2;
    width: 100%;
    height: 100%;
    padding-top: 15.6px;
    top: 0;
  }

  .site-footer--compact .site-footer__info {
    padding-top: 14px;
  }

  .site-footer__company-info {
    margin-top: 0;
    font-size: 10.5px;
    line-height: 14px;
  }

  .site-footer__meta {
    grid-column: 1;
    grid-row: 3;
    width: 100%;
    font-size: 10.5px;
    line-height: 12.5px;
    text-align: center;
  }

  .site-footer--compact .site-footer__company-info {
    font-size: 10px;
    line-height: 12.5px;
  }

  .site-footer--compact .site-footer__meta {
    font-size: 10px;
    line-height: 11.5px;
  }

  .footer-qr {
    grid-column: 2;
    grid-row: 3;
    width: 48px;
    height: 48px;
  }

  .site-footer--compact .site-footer__inner {
    grid-template-columns: minmax(0, 1fr) 46px;
    column-gap: 10px;
  }

  .site-footer--compact .footer-qr {
    width: 46px;
    height: 46px;
  }

  .site-footer__arc {
    left: -280px;
  }

  .site-footer::after {
    right: -430px;
  }
}
</style>
