<script setup>
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'

const props = defineProps({
  content: {
    type: Object,
    required: true,
  },
})

const sectionRef = ref(null)
const wasPreviouslyRevealed = Boolean(globalThis.__humetaAboutStatisticsRevealed)
const values = ref(
  wasPreviouslyRevealed
    ? Object.fromEntries(props.content.items.map((item) => [item.id, item.value]))
    : {},
)
const reducedMotion = ref(false)
let observer
let motionQuery
let animationFrame = 0
let hasEntered = wasPreviouslyRevealed

const formatter = computed(() => new Intl.NumberFormat(props.content.locale))

function finalValues() {
  values.value = Object.fromEntries(props.content.items.map((item) => [item.id, item.value]))
}

function animateValues() {
  window.cancelAnimationFrame(animationFrame)
  if (reducedMotion.value) {
    finalValues()
    return
  }

  const duration = 920
  globalThis.__humetaAboutStatisticsRevealed = true
  const startedAt = performance.now()

  function frame(now) {
    const progress = Math.min(1, (now - startedAt) / duration)
    const eased = 1 - (1 - progress) ** 3
    values.value = Object.fromEntries(
      props.content.items.map((item) => [item.id, Math.round(item.value * eased)]),
    )
    if (progress < 1) animationFrame = window.requestAnimationFrame(frame)
  }

  animationFrame = window.requestAnimationFrame(frame)
}

function displayValue(item) {
  return formatter.value.format(values.value[item.id] ?? 0)
}

function handleMotionChange(event) {
  reducedMotion.value = event.matches
  if (hasEntered) finalValues()
}

watch(
  () => props.content,
  () => {
    if (hasEntered) finalValues()
  },
)

onMounted(() => {
  motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
  reducedMotion.value = motionQuery.matches
  motionQuery.addEventListener?.('change', handleMotionChange)

  if (!('IntersectionObserver' in window) || reducedMotion.value) {
    hasEntered = true
    globalThis.__humetaAboutStatisticsRevealed = true
    finalValues()
    return
  }

  if (hasEntered) {
    finalValues()
    return
  }

  observer = new IntersectionObserver(
    ([entry]) => {
      if (!entry.isIntersecting || hasEntered) return
      hasEntered = true
      animateValues()
      observer.disconnect()
    },
    { threshold: 0.28 },
  )
  observer.observe(sectionRef.value)
})

onBeforeUnmount(() => {
  window.cancelAnimationFrame(animationFrame)
  observer?.disconnect()
  motionQuery?.removeEventListener?.('change', handleMotionChange)
})
</script>

<template>
  <section ref="sectionRef" class="statistics" :aria-label="content.ariaLabel">
    <div class="about-shell">
      <h2>{{ content.title }}</h2>

      <div class="statistics__grid">
        <article v-for="item in content.items" :key="item.id" class="statistic">
          <svg class="statistic__icon" viewBox="0 0 48 48" aria-hidden="true">
            <template v-if="item.icon === 'metabolites'">
              <path d="m13 14 11-6 11 6v13l-11 6-11-6z" />
              <path d="m13 14 11 6 11-6M24 20v13M8 31l6 3M34 34l6-3" />
            </template>
            <template v-else-if="item.icon === 'biospecimens'">
              <path d="M24 7c7 9 12 15 12 23a12 12 0 0 1-24 0c0-8 5-14 12-23Z" />
              <path d="M17 30c1 4 4 6 8 6" />
            </template>
            <template v-else>
              <path d="M7 37h34M9 32v-8M15 32V14M21 32V20M27 32V9M33 32V18M39 32V12" />
              <path d="m8 17 7-5 6 5 6-11 6 8 7-5" />
            </template>
          </svg>
          <strong :aria-label="`${displayValue(item)} ${item.label}`">{{ displayValue(item) }}</strong>
          <p>{{ item.label }}</p>
          <small>{{ item.detail }}</small>
        </article>
      </div>

      <p class="statistics__disclaimer">
        {{ content.disclaimer }}
        <a :href="content.sourceUrl" target="_blank" rel="noreferrer">{{ content.sourceLabel }}</a>
      </p>
    </div>
  </section>
</template>

<style scoped>
.statistics {
  padding: 42px 0 36px;
  border-top: 1px solid #e7eef1;
  background: #fff;
}

.about-shell {
  width: min(1180px, calc(100% - 48px));
  margin: 0 auto;
}

h2 {
  max-width: 780px;
  margin: 0 auto 36px;
  color: #173d49;
  font-size: clamp(23px, 2.1vw, 30px);
  font-weight: 500;
  letter-spacing: -0.02em;
  line-height: 1.35;
  text-align: center;
}

.statistics__grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
}

.statistic {
  min-width: 0;
  padding: 4px clamp(20px, 4vw, 52px) 12px;
  text-align: center;
}

.statistic + .statistic {
  border-left: 1px solid #dce8eb;
}

.statistic__icon {
  display: block;
  width: 42px;
  height: 42px;
  margin: 0 auto 14px;
  fill: none;
  stroke: #73b7ca;
  stroke-linecap: round;
  stroke-linejoin: round;
  stroke-width: 1.55;
}

.statistic strong {
  display: block;
  overflow-wrap: anywhere;
  color: #167da4;
  font-size: clamp(37px, 4.1vw, 58px);
  font-weight: 300;
  font-variant-numeric: tabular-nums;
  letter-spacing: -0.035em;
  line-height: 1;
}

.statistic p {
  margin: 11px 0 0;
  color: #304f5a;
  font-size: 15px;
  line-height: 1.45;
}

.statistic small {
  display: block;
  margin-top: 4px;
  color: #8a9a9f;
  font-size: 11px;
  letter-spacing: 0.03em;
  line-height: 1.4;
}

.statistics__disclaimer {
  max-width: 850px;
  margin: 27px auto 0;
  color: #607780;
  font-size: 12.5px;
  line-height: 1.75;
  text-align: center;
}

.statistics__disclaimer a {
  margin-left: 0.35em;
  color: #147c95;
  text-underline-offset: 3px;
}

@media (max-width: 767px) {
  .statistics {
    padding: 34px 0 32px;
  }

  .about-shell {
    width: calc(100% - 40px);
  }

  h2 {
    margin-bottom: 28px;
    font-size: 22px;
  }

  .statistics__grid {
    grid-template-columns: 1fr;
  }

  .statistic {
    display: grid;
    grid-template-columns: 48px minmax(0, 1fr);
    column-gap: 18px;
    align-items: center;
    padding: 18px 0;
    text-align: left;
  }

  .statistic + .statistic {
    border-top: 1px solid #e0e9ec;
    border-left: 0;
  }

  .statistic__icon {
    grid-row: 1 / span 3;
    width: 42px;
    height: 42px;
    margin: 0;
  }

  .statistic strong {
    font-size: 39px;
  }

  .statistic p,
  .statistic small {
    grid-column: 2;
    margin-top: 4px;
  }

  .statistics__disclaimer {
    margin-top: 24px;
    text-align: left;
  }
}

@media (prefers-reduced-motion: reduce) {
  .statistic strong {
    transition: none;
  }
}
</style>
