<script setup>
import newDiscoveryIcon from '@/assets/icons/home/new-discovery-optimized.webp'
import metaboliteMonthIcon from '@/assets/icons/home/metabolite-month-optimized.webp'

defineProps({
  to: { type: [String, Object], required: true },
  title: { type: String, required: true },
  description: { type: String, required: true },
  citation: { type: String, required: true },
  icon: { type: String, default: 'network' },
  structure: { type: String, required: true },
  structureAlt: { type: String, default: '化学结构示意图' },
})
</script>

<template>
  <RouterLink class="feature-card" :to="to">
    <span class="feature-card__arrow" aria-hidden="true">
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M7 12h10M13 8l4 4-4 4" />
      </svg>
    </span>

    <div
      class="feature-card__icon"
      :class="`feature-card__icon--${icon}`"
      aria-hidden="true"
    >
      <img
        :src="icon === 'calendar' ? metaboliteMonthIcon : newDiscoveryIcon"
        alt=""
        aria-hidden="true"
      />
    </div>

    <div class="feature-card__copy">
      <h2>{{ title }}</h2>
      <p>{{ description }}</p>
      <cite>{{ citation }}</cite>
    </div>

    <div
      class="feature-card__structure-stage"
      :class="`feature-card__structure-stage--${icon}`"
    >
      <img class="feature-card__structure" :src="structure" :alt="structureAlt" />
    </div>
  </RouterLink>
</template>

<style scoped>
.feature-card {
  position: relative;
  height: 318px;
  overflow: hidden;
  padding: 13px 24px;
  border: 1px solid #dbe6eb;
  border-radius: 6px;
  background: white;
  box-shadow: 0 2px 8px rgba(30, 74, 98, 0.05);
  display: grid;
  grid-template-rows: 62px auto minmax(102px, 1fr);
  justify-items: center;
  color: inherit;
  text-align: center;
  text-decoration: none;
  cursor: pointer;
  transition:
    transform 280ms ease,
    box-shadow 280ms ease,
    border-color 280ms ease;
}

.feature-card::after {
  content: '';
  position: absolute;
  left: -1px;
  right: -1px;
  bottom: -1px;
  height: 12px;
  border-radius: 0 0 6px 6px;
  background: var(--primary-blue);
  transition: height 280ms ease;
}

.feature-card:hover {
  border-color: #b7d3e5;
  box-shadow: 0 8px 24px rgba(20, 80, 120, 0.1);
  transform: translateY(-4px);
}

.feature-card:hover::after {
  height: 13px;
}

.feature-card:active {
  transform: translateY(-2px) scale(0.985);
  transition: transform 100ms ease;
}

.feature-card__arrow {
  position: absolute;
  top: 18px;
  right: 18px;
  width: 36px;
  height: 36px;
  padding: 7px;
  border: 1px solid #94b6c4;
  border-radius: 5px;
  background: white;
  color: #1684a9;
  pointer-events: none;
}

:global(#app .feature-card__arrow) {
  transition:
    background-color var(--humeta-motion-slow) var(--humeta-ease-standard),
    border-color var(--humeta-motion-slow) var(--humeta-ease-standard);
}

.feature-card__arrow svg {
  width: 100%;
  height: 100%;
  fill: none;
  stroke: currentColor;
  stroke-linecap: round;
  stroke-linejoin: round;
  stroke-width: 2;
  transition: transform 220ms ease;
}

:global(#app .feature-card:hover .feature-card__arrow) {
  border-color: #7faec2;
  color: #1684a9;
  background: var(--humeta-blue-100);
}

.feature-card:hover .feature-card__arrow svg {
  transform: translateX(4px);
}

.feature-card__icon {
  --icon-y-offset: 1px;
  width: 52px;
  height: 52px;
  position: relative;
}

.feature-card__icon img {
  position: absolute;
  top: calc((52px - var(--icon-image-height)) / 2 + var(--icon-y-offset));
  left: calc((52px - var(--icon-image-width)) / 2);
  width: var(--icon-image-width);
  height: var(--icon-image-height);
  max-width: none;
  object-fit: contain;
}

.feature-card__icon--network {
  --icon-image-width: 134px;
  --icon-image-height: 89.3333px;
}

.feature-card__icon--calendar {
  --icon-image-width: 126px;
  --icon-image-height: 84px;
}

.feature-card__copy {
  width: 100%;
  align-self: start;
}

.feature-card__copy h2 {
  margin-bottom: 8px;
  color: #173a4d;
  font-size: 18px;
  font-weight: 500;
  line-height: 1.25;
}

.feature-card__copy p,
.feature-card__copy cite {
  display: block;
  color: #647783;
  font-size: 13px;
  line-height: 1.5;
  font-style: normal;
}

.feature-card__copy cite {
  margin-top: 1px;
  color: #738590;
  font-size: 12.5px;
}

.feature-card__structure-stage {
  align-self: end;
  position: relative;
  top: 18px;
  width: 100%;
  height: 168px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.feature-card__structure {
  width: 100%;
  height: 100%;
  max-width: 100%;
  max-height: 100%;
  object-fit: contain;
  transition: transform 300ms ease;
}

.feature-card__structure-stage--network .feature-card__structure {
  position: relative;
  top: 1px;
}

.feature-card__structure-stage--calendar .feature-card__structure {
  max-width: 86.9%;
}

.feature-card:hover .feature-card__structure {
  transform: translateY(-5px);
}

@media (max-width: 1024px) {
  .feature-card {
    height: 318px;
  }
}

@media (max-width: 767px) {
  .feature-card {
    width: 100%;
    height: 322px;
    margin-inline: auto;
    padding: 19px 22px 21px;
    grid-template-rows: 62px auto minmax(100px, 1fr);
  }

  .feature-card__arrow {
    top: 16px;
    right: 16px;
    width: 34px;
    height: 34px;
  }

  .feature-card__icon--network {
    --icon-y-offset: 2px;
    --icon-image-width: 119px;
    --icon-image-height: 79.3333px;
  }

  .feature-card__icon--calendar {
    --icon-y-offset: 2px;
    --icon-image-width: 112px;
    --icon-image-height: 74.6667px;
  }

  .feature-card__copy h2 {
    margin-bottom: 8px;
    font-size: 18px;
  }

  .feature-card__copy p,
  .feature-card__copy cite {
    font-size: 13px;
  }

  .feature-card__structure-stage {
    height: 140px;
  }

  .feature-card__structure {
    max-height: 94%;
  }

}

@media (max-width: 390px) {
  .feature-card__structure-stage--network .feature-card__structure {
    max-height: 88%;
  }
}

@media (prefers-reduced-motion: reduce) {
  .feature-card,
  .feature-card:active,
  .feature-card::after,
  :global(#app .feature-card__arrow),
  .feature-card__arrow svg,
  .feature-card__structure {
    transition: none;
  }

  .feature-card:hover,
  .feature-card:active,
  .feature-card:hover .feature-card__arrow svg,
  .feature-card:hover .feature-card__structure {
    transform: none;
  }
}
</style>
