<script setup>
import { onBeforeUnmount, onMounted, ref } from 'vue'

const props = defineProps({
  content: {
    type: Object,
    required: true,
  },
})

const figureRef = ref(null)
const isVisible = ref(false)
let intersectionObserver
let motionQuery

function showFinalState() {
  globalThis.__humetaAboutMissionRevealed = true
  isVisible.value = true
  intersectionObserver?.disconnect()
  intersectionObserver = undefined
}

function handleMotionChange(event) {
  if (event.matches) showFinalState()
}

onMounted(() => {
  motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
  motionQuery.addEventListener?.('change', handleMotionChange)

  if (
    motionQuery.matches ||
    globalThis.__humetaAboutMissionRevealed ||
    !('IntersectionObserver' in window)
  ) {
    showFinalState()
    return
  }

  intersectionObserver = new IntersectionObserver(
    ([entry]) => {
      if (entry.isIntersecting) showFinalState()
    },
    { rootMargin: '0px 0px -8% 0px', threshold: 0.18 },
  )
  intersectionObserver.observe(figureRef.value)
})

onBeforeUnmount(() => {
  intersectionObserver?.disconnect()
  motionQuery?.removeEventListener?.('change', handleMotionChange)
})
</script>

<template>
  <figure ref="figureRef" class="evidence-figure" :class="{ 'evidence-figure--visible': isVisible }">
    <div class="figure-heading">
      <span>Evidence architecture</span>
      <h3>{{ content.title }}</h3>
    </div>

    <svg
      class="evidence-diagram evidence-diagram--desktop"
      viewBox="0 0 660 540"
      role="img"
      :aria-label="content.ariaLabel"
    >
      <defs>
        <linearGradient id="evidence-center" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stop-color="#247f99" />
          <stop offset="1" stop-color="#2c9b8c" />
        </linearGradient>
      </defs>

      <g class="evidence-diagram__connections" aria-hidden="true">
        <path d="M230 185 C268 198 291 222 310 251" />
        <path d="M430 185 C392 198 369 222 350 251" />
        <path d="M330 374 C330 342 330 324 330 306" />
        <path d="M330 305 C318 392 224 430 128 470" />
        <path d="M330 305 C330 374 330 420 330 470" />
        <path d="M330 305 C342 392 436 430 532 470" />
      </g>

      <g
        v-for="(domain, index) in content.domains"
        :key="domain.id"
        class="evidence-domain"
        :class="`evidence-domain--${domain.id}`"
        :style="{ '--domain-order': index }"
      >
        <title>{{ domain.description }}</title>
        <circle v-if="domain.id === 'knowledge'" cx="205" cy="180" r="112" />
        <circle v-else-if="domain.id === 'spectra'" cx="455" cy="180" r="112" />
        <circle v-else cx="330" cy="365" r="112" />
        <text
          v-if="domain.id === 'knowledge'"
          x="177"
          y="157"
          text-anchor="middle"
        >
          <tspan x="177" dy="0">{{ domain.label }}</tspan>
          <tspan x="177" dy="22" class="evidence-domain__hint">{{ domain.shortLabel }}</tspan>
        </text>
        <text
          v-else-if="domain.id === 'spectra'"
          x="483"
          y="157"
          text-anchor="middle"
        >
          <tspan x="483" dy="0">{{ domain.label }}</tspan>
          <tspan x="483" dy="22" class="evidence-domain__hint">{{ domain.shortLabel }}</tspan>
        </text>
        <text v-else x="330" y="397" text-anchor="middle">
          <tspan x="330" dy="0">{{ domain.label }}</tspan>
          <tspan x="330" dy="22" class="evidence-domain__hint">{{ domain.shortLabel }}</tspan>
        </text>
      </g>

      <g class="evidence-center">
        <circle cx="330" cy="278" r="73" />
        <text x="330" y="267" text-anchor="middle">
          <tspan
            v-for="(line, index) in content.center.split('\n')"
            :key="line"
            x="330"
            :dy="index === 0 ? 0 : 20"
          >{{ line }}</tspan>
        </text>
      </g>

      <g
        v-for="(principle, index) in content.principles"
        :key="principle.id"
        class="evidence-principle"
        :style="{ '--principle-order': index }"
        :transform="`translate(${44 + index * 202} 470)`"
      >
        <title>{{ principle.description }}</title>
        <rect width="168" height="45" rx="22.5" />
        <circle cx="22" cy="22.5" r="4" />
        <text x="91" y="27" text-anchor="middle">{{ principle.label }}</text>
      </g>
    </svg>

    <svg
      class="evidence-diagram evidence-diagram--mobile"
      viewBox="0 0 360 670"
      role="img"
      :aria-label="content.ariaLabel"
    >
      <g class="evidence-diagram__connections" aria-hidden="true">
        <path d="M180 102 L180 132" />
        <path d="M180 206 L180 236" />
        <path d="M180 310 L180 352" />
        <path d="M180 432 L180 478" />
        <path d="M180 520 L180 544" />
        <path d="M180 586 L180 610" />
      </g>

      <g
        v-for="(domain, index) in content.domains"
        :key="domain.id"
        class="evidence-domain evidence-domain--mobile"
        :class="`evidence-domain--${domain.id}`"
        :style="{ '--domain-order': index }"
        :transform="`translate(40 ${28 + index * 104})`"
      >
        <title>{{ domain.description }}</title>
        <rect width="280" height="74" rx="37" />
        <circle cx="28" cy="37" r="5" />
        <text x="140" y="34" text-anchor="middle">
          <tspan x="140">{{ domain.label }}</tspan>
          <tspan x="140" dy="19" class="evidence-domain__hint">{{ domain.shortLabel }}</tspan>
        </text>
      </g>

      <g class="evidence-center evidence-center--mobile">
        <rect x="75" y="352" width="210" height="80" rx="40" />
        <text x="180" y="386" text-anchor="middle">
          <tspan
            v-for="(line, index) in content.center.split('\n')"
            :key="line"
            x="180"
            :dy="index === 0 ? 0 : 19"
          >{{ line }}</tspan>
        </text>
      </g>

      <g
        v-for="(principle, index) in content.principles"
        :key="principle.id"
        class="evidence-principle evidence-principle--mobile"
        :style="{ '--principle-order': index }"
        :transform="`translate(55 ${478 + index * 66})`"
      >
        <title>{{ principle.description }}</title>
        <rect width="250" height="42" rx="21" />
        <circle cx="23" cy="21" r="4" />
        <text x="130" y="26" text-anchor="middle">{{ principle.label }}</text>
      </g>
    </svg>

    <p class="sr-only">{{ content.summary }}</p>
    <figcaption>{{ content.caption }}</figcaption>
  </figure>
</template>

<style scoped>
.evidence-figure {
  width: 100%;
  max-width: 760px;
  min-width: 0;
  margin: 0 auto;
}

.figure-heading {
  text-align: center;
}

.figure-heading span {
  color: #65a8b5;
  font-size: 10px;
  font-weight: 700;
  letter-spacing: 0.14em;
  text-transform: uppercase;
}

.figure-heading h3 {
  margin: 7px 0 0;
  color: #244c58;
  font-size: 16px;
  font-weight: 600;
  line-height: 1.4;
}

.evidence-diagram {
  display: block;
  width: 100%;
  height: auto;
  overflow: visible;
}

.evidence-diagram--mobile {
  display: none;
}

.evidence-diagram__connections path {
  fill: none;
  stroke: #a8cbd1;
  stroke-dasharray: 5 7;
  stroke-linecap: round;
  stroke-width: 1.4;
  stroke-dashoffset: 170;
  transition: stroke-dashoffset 900ms cubic-bezier(0.22, 1, 0.36, 1) 280ms;
}

.evidence-domain,
.evidence-center,
.evidence-principle {
  opacity: 0;
  transition: opacity 520ms ease calc(90ms + var(--domain-order, 0) * 90ms);
}

.evidence-domain circle,
.evidence-domain--mobile rect {
  fill: rgba(255, 255, 255, 0.56);
  stroke-width: 2;
}

.evidence-domain--knowledge circle,
.evidence-domain--knowledge rect {
  stroke: #5ca9bf;
}

.evidence-domain--spectra circle,
.evidence-domain--spectra rect {
  stroke: #5db49e;
}

.evidence-domain--structure circle,
.evidence-domain--structure rect {
  stroke: #7b8fbd;
}

.evidence-domain--knowledge circle,
.evidence-domain--knowledge rect,
.evidence-domain--knowledge > circle:first-of-type {
  fill: rgba(85, 169, 192, 0.13);
}

.evidence-domain--spectra circle,
.evidence-domain--spectra rect,
.evidence-domain--spectra > circle:first-of-type {
  fill: rgba(79, 177, 153, 0.13);
}

.evidence-domain--structure circle,
.evidence-domain--structure rect,
.evidence-domain--structure > circle:first-of-type {
  fill: rgba(117, 137, 187, 0.13);
}

.evidence-domain text {
  fill: #294f5d;
  font-size: 14px;
  font-weight: 650;
}

.evidence-domain__hint {
  fill: #759096;
  font-size: 10px;
  font-weight: 500;
}

.evidence-center circle,
.evidence-center rect {
  fill: url(#evidence-center);
  stroke: rgba(255, 255, 255, 0.9);
  stroke-width: 5;
}

.evidence-center text {
  fill: #fff;
  font-size: 13px;
  font-weight: 700;
  letter-spacing: 0.01em;
}

.evidence-principle {
  transition-delay: calc(480ms + var(--principle-order) * 95ms);
}

.evidence-principle rect {
  fill: rgba(255, 255, 255, 0.78);
  stroke: #bdd4d8;
  stroke-width: 1;
}

.evidence-principle circle {
  fill: #2f91a0;
}

.evidence-principle text {
  fill: #3c626d;
  font-size: 11px;
  font-weight: 650;
}

.evidence-figure--visible .evidence-diagram__connections path {
  stroke-dashoffset: 0;
}

.evidence-figure--visible .evidence-domain,
.evidence-figure--visible .evidence-center,
.evidence-figure--visible .evidence-principle {
  opacity: 1;
}

figcaption {
  max-width: 650px;
  margin: -4px auto 0;
  color: #687f87;
  font-size: 12.5px;
  line-height: 1.7;
  text-align: center;
}

.sr-only {
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

@media (max-width: 600px) {
  .evidence-figure {
    max-width: 390px;
  }

  .figure-heading h3 {
    font-size: 15px;
  }

  .evidence-diagram--desktop {
    display: none;
  }

  .evidence-diagram--mobile {
    display: block;
    margin-top: 8px;
  }

  .evidence-domain--mobile text {
    font-size: 13px;
  }

  .evidence-center--mobile text {
    font-size: 12.5px;
  }

  .evidence-principle--mobile text {
    font-size: 11.5px;
  }

  figcaption {
    margin-top: 5px;
    text-align: left;
  }
}

@media (prefers-reduced-motion: reduce) {
  .evidence-diagram__connections path {
    stroke-dashoffset: 0;
    transition: none;
  }

  .evidence-domain,
  .evidence-center,
  .evidence-principle {
    opacity: 1;
    transition: none;
  }
}
</style>
