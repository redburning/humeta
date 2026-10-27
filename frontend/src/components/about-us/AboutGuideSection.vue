<script setup>
import { computed, ref } from 'vue'
import { contactDetails } from '../../data/aboutUsData.js'
import HumetaGuideNetwork from './HumetaGuideNetwork.vue'

const props = defineProps({
  content: {
    type: Object,
    required: true,
  },
  chartContent: {
    type: Object,
    required: true,
  },
  sources: {
    type: Array,
    required: true,
  },
})

const primarySourceIds = new Set(['hmdb-statistics', 'chebi-release-253', 'msi-reporting'])
const primarySources = computed(() => props.sources.filter((source) => primarySourceIds.has(source.id)))
const secondarySources = computed(() => props.sources.filter((source) => !primarySourceIds.has(source.id)))
const sourcesExpanded = ref(false)

function toggleSources() {
  sourcesExpanded.value = !sourcesExpanded.value
}
</script>

<template>
  <section id="guide" class="guide-section">
    <div class="about-shell">
      <div class="guide-grid">
        <div class="guide-copy">
          <p class="guide-copy__eyebrow">{{ content.eyebrow }}</p>
          <h2>{{ content.title }}</h2>
          <p class="guide-copy__intro">{{ content.introduction }}</p>

          <ol class="guide-list">
            <li v-for="entry in content.entries" :key="entry.number" class="guide-row">
              <span class="guide-row__number">{{ entry.number }}</span>
              <span class="guide-row__copy">
                <strong>{{ entry.label }}</strong>
                <span>{{ entry.description }}</span>
              </span>
            </li>
          </ol>
        </div>

        <HumetaGuideNetwork :content="chartContent" />
      </div>
    </div>
  </section>

  <section class="sources-section" aria-labelledby="about-sources-title">
    <div class="about-shell">
        <div class="sources-section__heading">
          <h2 id="about-sources-title">{{ content.sourcesTitle }}</h2>
          <p>{{ content.sourcesIntroduction }}</p>
        </div>

        <div class="sources-method">
          <p>
            <strong>{{ content.sourcesVerifiedLabel }}</strong>
            <time :datetime="sources[0]?.accessed">{{ sources[0]?.accessed }}</time>
          </p>
          <p>{{ content.sourcesMethodSummary }}</p>
          <p>{{ content.sourcesOwnership }}</p>
        </div>

        <ol class="source-list source-list--primary">
          <li v-for="source in primarySources" :key="source.id">
            <a :href="source.url" target="_blank" rel="noreferrer">
              {{ source.name }} <span aria-hidden="true">↗</span>
              <span class="sr-only">— {{ content.sourceLinkLabel }}</span>
            </a>
            <p>{{ source.usage }}</p>
            <small v-if="source.citation">{{ source.citation }}</small>
            <small>{{ source.accessed }}</small>
          </li>
        </ol>

        <button
          class="sources-disclosure"
          type="button"
          :aria-expanded="sourcesExpanded"
          aria-controls="about-all-sources"
          @click="toggleSources"
          @keydown.enter.prevent="toggleSources"
          @keydown.space.prevent="toggleSources"
        >
          <span>{{ sourcesExpanded ? content.hideSourcesLabel : content.viewSourcesLabel }}</span>
          <span aria-hidden="true">{{ sourcesExpanded ? '−' : '+' }}</span>
        </button>

        <div id="about-all-sources" v-show="sourcesExpanded" class="sources-disclosed">
          <ol class="source-list source-list--secondary">
            <li v-for="source in secondarySources" :key="source.id">
              <a :href="source.url" target="_blank" rel="noreferrer">
                {{ source.name }} <span aria-hidden="true">↗</span>
                <span class="sr-only">— {{ content.sourceLinkLabel }}</span>
              </a>
              <p>{{ source.usage }}</p>
              <small v-if="source.citation">{{ source.citation }}</small>
              <small>{{ source.accessed }}</small>
            </li>
          </ol>

          <ol class="source-list source-list--mobile-all">
            <li v-for="source in sources" :key="source.id">
              <a :href="source.url" target="_blank" rel="noreferrer">
                {{ source.name }} <span aria-hidden="true">↗</span>
                <span class="sr-only">— {{ content.sourceLinkLabel }}</span>
              </a>
              <p>{{ source.usage }}</p>
              <small v-if="source.citation">{{ source.citation }}</small>
              <small>{{ source.accessed }}</small>
            </li>
          </ol>
        </div>
    </div>
  </section>

  <aside class="about-prefooter" :aria-label="content.prefooterLabel">
    <div class="about-shell guide-meta">
      <section>
        <h2>{{ content.boundaryTitle }}</h2>
        <p>{{ content.boundary }}</p>
      </section>
      <section>
        <h2>{{ content.citationTitle }}</h2>
        <p>{{ content.citation }}</p>
      </section>

      <address class="contact">
        <h2>{{ content.contactTitle }}</h2>
        <div class="contact__columns">
          <div class="contact__primary">
            <strong>{{ contactDetails.brand }}</strong>
            <span>{{ content.contact.positioning }}</span>
            <a :href="`tel:${contactDetails.phone}`">{{ contactDetails.phone }}</a>
          </div>
          <div class="contact__secondary">
            <a :href="`mailto:${contactDetails.email}`">{{ contactDetails.email }}</a>
            <span class="contact__address">
              <span v-for="line in content.contact.addressLines" :key="line">{{ line }}</span>
            </span>
            <small>{{ content.contact.note }}</small>
          </div>
        </div>
      </address>
    </div>
  </aside>
</template>

<style scoped>
.guide-section {
  padding: 80px 0 76px;
  background: #eef5f6;
}

.about-shell {
  width: min(1240px, calc(100% - 48px));
  margin: 0 auto;
}

.guide-grid {
  display: grid;
  grid-template-columns: minmax(0, 0.91fr) minmax(0, 1.09fr);
  align-items: center;
  gap: clamp(54px, 7vw, 104px);
}

.guide-grid :deep(.network-figure) {
  width: 100%;
  max-width: 650px;
  min-width: 0;
}

.guide-copy__eyebrow {
  margin: 0 0 9px;
  color: #5aa3b1;
  font-size: 10px;
  font-weight: 700;
  letter-spacing: 0.12em;
  line-height: 1.4;
  text-transform: uppercase;
}

.guide-copy h2 {
  position: relative;
  margin: 0 0 30px;
  padding-bottom: 20px;
  color: #183c48;
  font-size: clamp(28px, 2.75vw, 39px);
  font-weight: 500;
  letter-spacing: -0.03em;
  line-height: 1.25;
}

.guide-copy h2::after {
  position: absolute;
  bottom: 0;
  left: 0;
  width: 54px;
  height: 2px;
  background: #4caeb9;
  content: '';
}

.guide-copy__intro,
.sources-section__heading p {
  margin: 0;
  color: #4b626a;
  font-size: 15px;
  line-height: 1.76;
}

.guide-list {
  padding: 0;
  margin: 28px 0 0;
  border-top: 1px solid #cddde1;
  list-style: none;
}

.guide-row {
  display: grid;
  grid-template-columns: 42px minmax(0, 1fr);
  align-items: start;
  gap: 16px;
  padding: 14px 0;
  border-bottom: 1px solid #cddde1;
}

.guide-row__number {
  padding-top: 3px;
  color: #65aab7;
  font-size: 11px;
  letter-spacing: 0.08em;
}

.guide-row__copy {
  display: grid;
  gap: 4px;
}

.guide-row__copy strong {
  color: #285363;
  font-size: 14px;
  font-weight: 650;
}

.guide-row__copy span {
  color: #61777e;
  font-size: 12.5px;
  line-height: 1.62;
}

.about-prefooter {
  border-top: 1px solid #d5e1e5;
  background: #f5f8fa;
}

.guide-meta {
  display: grid;
  grid-template-columns: minmax(0, 1.13fr) minmax(0, 1fr) minmax(0, 1.2fr);
  gap: 0;
  padding-block: 42px 40px;
}

.guide-meta > * + * {
  padding-left: clamp(26px, 3vw, 42px);
  border-left: 1px solid #d4e0e4;
}

.guide-meta > *:not(:last-child) {
  padding-right: clamp(26px, 3vw, 42px);
}

.guide-meta h2,
.sources-section h2 {
  margin: 0 0 10px;
  color: #214958;
  font-size: 16px;
  font-style: normal;
  font-weight: 650;
  letter-spacing: -0.01em;
  line-height: 1.4;
}

.guide-meta p {
  margin: 0;
  color: #526a73;
  font-size: 13.5px;
  line-height: 1.75;
}

.contact {
  margin: 0;
  min-width: 0;
  color: #526a73;
  font-size: 13.5px;
  font-style: normal;
  line-height: 1.65;
}

.contact__columns {
  display: grid;
  grid-template-columns: minmax(0, 0.86fr) minmax(0, 1.14fr);
  gap: clamp(18px, 2vw, 28px);
}

.contact__primary,
.contact__secondary,
.contact__address {
  display: grid;
  align-content: start;
  gap: 5px;
  min-width: 0;
}

.contact strong {
  color: #1d4655;
  font-size: 16px;
  line-height: 1.45;
}

.contact a {
  width: fit-content;
  max-width: 100%;
  color: #147c95;
  overflow-wrap: anywhere;
  text-decoration-thickness: 1px;
  text-underline-offset: 3px;
}

.contact small {
  margin-top: 8px;
  color: #647a82;
  font-size: 12px;
  line-height: 1.65;
}

.sources-section {
  padding: 58px 0 54px;
  border-top: 1px solid #dce6e9;
  background: #fff;
}

.sources-section__heading {
  display: grid;
  grid-template-columns: minmax(180px, 0.36fr) minmax(0, 1fr);
  gap: 34px;
  align-items: start;
}

.sources-section__heading p {
  max-width: 760px;
  color: #526a73;
  font-size: 13.5px;
  line-height: 1.7;
}

.sources-section__heading h2 {
  margin: 0;
  font-size: 20px;
}

.sources-method {
  display: grid;
  grid-template-columns: minmax(150px, 0.34fr) minmax(0, 1fr) minmax(0, 1fr);
  gap: 24px;
  margin-top: 20px;
  padding: 16px 0;
  border-top: 1px solid #cfdee2;
  border-bottom: 1px solid #cfdee2;
}

.sources-method p {
  margin: 0;
  color: #526b74;
  font-size: 12.5px;
  line-height: 1.68;
}

.sources-method strong,
.sources-method time {
  display: block;
}

.sources-method strong {
  color: #325b68;
  font-weight: 650;
}

.sources-method time {
  margin-top: 3px;
  color: #147c95;
  font-variant-numeric: tabular-nums;
}

.source-list {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 0;
  padding: 0;
  margin: 14px 0 0;
  list-style: none;
  counter-reset: source;
}

.source-list--mobile-all {
  display: none;
}

.source-list li {
  min-width: 0;
  padding: 15px 18px 15px 0;
  border-bottom: 1px solid #cfdee2;
  counter-increment: source;
}

.source-list li:not(:nth-child(3n + 1)) {
  padding-left: 18px;
  border-left: 1px solid #cfdee2;
}

.source-list a {
  color: #1c6f83;
  font-size: 12.5px;
  font-weight: 650;
  line-height: 1.55;
  overflow-wrap: anywhere;
  text-underline-offset: 3px;
}

.source-list p {
  margin: 6px 0 0;
  color: #596f77;
  font-size: 12.5px;
  line-height: 1.62;
}

.source-list small {
  display: block;
  margin-top: 5px;
  color: #6d7f85;
  font-size: 11.5px;
  line-height: 1.55;
  overflow-wrap: anywhere;
}

.sources-disclosure {
  display: flex;
  width: 100%;
  min-height: 48px;
  align-items: center;
  justify-content: center;
  gap: 12px;
  margin-top: 16px;
  padding: 0 18px;
  border: 1px solid #bdd2d7;
  border-radius: 4px;
  background: transparent;
  color: #23697a;
  font: inherit;
  font-size: 12.5px;
  font-weight: 650;
  cursor: pointer;
}

.sources-disclosure:hover,
.sources-disclosure:focus-visible {
  border-color: #66aeba;
  background: rgba(255, 255, 255, 0.52);
}

.sources-disclosed {
  padding-top: 2px;
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

@media (max-width: 860px) {
  .guide-section {
    padding: 64px 0 58px;
  }

  .about-shell {
    width: calc(100% - 40px);
  }

  .guide-grid {
    grid-template-columns: 1fr;
    gap: 46px;
  }

  .guide-meta {
    grid-template-columns: 1fr;
    padding-block: 38px 36px;
  }

  .guide-meta > * + * {
    margin-top: 26px;
    padding-top: 26px;
    padding-left: 0;
    border-top: 1px solid #d4e0e4;
    border-left: 0;
  }

  .guide-meta > *:not(:last-child) {
    padding-right: 0;
  }

  .source-list {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .sources-method {
    grid-template-columns: minmax(130px, 0.5fr) minmax(0, 1fr);
  }

  .sources-method p:last-child {
    grid-column: 1 / -1;
  }

  .source-list li:not(:nth-child(3n + 1)) {
    padding-left: 0;
    border-left: 0;
  }

  .source-list li:nth-child(even) {
    padding-left: 18px;
    border-left: 1px solid #cfdee2;
  }
}

@media (max-width: 560px) {
  .guide-section {
    padding-block: 48px 56px;
  }

  .guide-copy h2 {
    font-size: 30px;
  }

  .guide-grid {
    gap: 36px;
  }

  .contact__columns,
  .sources-section__heading,
  .source-list,
  .sources-method {
    grid-template-columns: 1fr;
  }

  .sources-section {
    padding-block: 46px 44px;
  }

  .contact__columns {
    gap: 5px;
  }

  .contact__secondary {
    margin-top: 0;
  }

  .sources-section__heading {
    gap: 2px;
  }

  .sources-method {
    gap: 11px;
    margin-top: 16px;
  }

  .sources-method p:last-child {
    grid-column: auto;
  }

  .source-list--primary,
  .source-list--secondary {
    display: none;
  }

  .source-list--mobile-all {
    display: grid;
  }

  .sources-disclosure {
    justify-content: space-between;
    margin-top: 13px;
  }

  .source-list li,
  .source-list li:nth-child(even),
  .source-list li:not(:nth-child(3n + 1)) {
    padding: 14px 0;
    border-right: 0;
    border-left: 0;
  }
}
</style>
