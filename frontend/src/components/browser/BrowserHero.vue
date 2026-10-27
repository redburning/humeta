<script setup>
import BrowserSearchPanel from './BrowserSearchPanel.vue'
import { DEFAULT_BROWSER_PRODUCT_TYPE } from '../../data/browserSearchOptions'

const props = defineProps({
  keyword: {
    type: String,
    default: '',
  },
  productType: {
    type: String,
    default: DEFAULT_BROWSER_PRODUCT_TYPE,
  },
  variant: {
    type: String,
    default: 'landing',
    validator: (value) => ['landing', 'results'].includes(value),
  },
})

const emit = defineEmits(['search'])
</script>

<template>
  <section
    class="browser-hero"
    :class="`browser-hero--${props.variant}`"
    :aria-labelledby="props.variant === 'results' ? 'browser-search-title' : undefined"
    :aria-label="props.variant === 'landing' ? 'Browser search' : undefined"
  >
    <img
      v-if="props.variant === 'landing'"
      class="browser-hero__scene"
      src="/images/hero-metabolism.svg"
      alt=""
      aria-hidden="true"
    />
    <div v-if="props.variant === 'results'" class="browser-hero__grid" aria-hidden="true" />
    <div class="browser-hero__inner">
      <h1 v-if="props.variant === 'results'" id="browser-search-title">Search Humeta</h1>
      <BrowserSearchPanel
        :keyword="props.keyword"
        :product-type="props.productType"
        :variant="props.variant"
        @search="emit('search', $event)"
      />
    </div>
  </section>
</template>

<style scoped>
.browser-hero {
  position: relative;
  z-index: 1;
  overflow: visible;
}

.browser-hero--landing {
  min-height: 76px;
  color: white;
  background: var(--humeta-hero-gradient);
}

.browser-hero--results {
  min-height: 194px;
  color: white;
  background: var(--humeta-hero-gradient);
}

.browser-hero--results::after {
  content: '';
  position: absolute;
  inset: 0;
  background: linear-gradient(110deg, rgba(65, 184, 219, 0.4), transparent 48%, rgba(0, 71, 145, 0.25));
  pointer-events: none;
}

.browser-hero__scene {
  position: absolute;
  z-index: 0;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  object-position: center;
  opacity: 0.1;
  pointer-events: none;
}

.browser-hero__grid {
  position: absolute;
  inset: 0;
  opacity: 0.16;
  background-image:
    linear-gradient(rgba(255, 255, 255, 0.2) 1px, transparent 1px),
    linear-gradient(90deg, rgba(255, 255, 255, 0.2) 1px, transparent 1px);
  background-size: 48px 48px;
  mask-image: linear-gradient(90deg, transparent, black 18%, black 82%, transparent);
  pointer-events: none;
}

.browser-hero--results .browser-hero__grid {
  opacity: 0.14;
  background-image:
    linear-gradient(rgba(255, 255, 255, 0.22) 1px, transparent 1px),
    linear-gradient(90deg, rgba(255, 255, 255, 0.22) 1px, transparent 1px);
}

.browser-hero__inner {
  position: relative;
  z-index: 2;
  width: min(900px, calc(100% - 48px));
  margin-inline: auto;
}

.browser-hero--landing .browser-hero__inner {
  width: min(1180px, calc(100% - 48px));
  min-height: 76px;
  padding-block: 5px;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.browser-hero--results .browser-hero__inner {
  padding-top: 46px;
}

h1 {
  margin-bottom: 22px;
  color: inherit;
  font-size: clamp(27px, 2.2vw, 34px);
  font-weight: 500;
  line-height: 1.2;
  text-align: center;
}

.browser-hero--results :deep(.browser-search-form) {
  margin-inline: auto;
}

@media (max-width: 1199px) {
  .browser-hero--landing,
  .browser-hero--landing .browser-hero__inner {
    min-height: 74px;
  }

  .browser-hero--landing .browser-hero__inner {
    padding-block: 4px;
  }
}

@media (max-width: 767px) {
  .browser-hero--landing {
    min-height: 74px;
  }

  .browser-hero--results {
    min-height: 230px;
  }

  .browser-hero__inner {
    width: calc(100% - 40px);
  }

  .browser-hero--landing .browser-hero__inner {
    width: calc(100% - 40px);
    min-height: 74px;
    padding-block: 4px;
  }

  .browser-hero--results .browser-hero__inner {
    padding-top: 34px;
  }

  h1 {
    margin-bottom: 20px;
    font-size: 27px;
  }

}

@media (max-width: 560px) {
  .browser-hero--landing {
    min-height: 122px;
  }

  .browser-hero--landing .browser-hero__inner {
    min-height: 122px;
    padding-block: 4px;
  }

  .browser-hero--results {
    min-height: 270px;
  }
}
</style>
