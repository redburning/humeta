<script setup>
import { ref } from 'vue'
import { testingServiceFaqs } from '../../data/testingServiceData'

const openFaqId = ref('')

function toggleFaq(faqId) {
  openFaqId.value = openFaqId.value === faqId ? '' : faqId
}
</script>

<template>
  <section class="testing-faq" aria-labelledby="testing-faq-title">
    <div class="testing-faq__heading">
      <h3 id="testing-faq-title">常见问题</h3>
      <p>快速了解样本、隐私与正式沟通边界。</p>
    </div>

    <div class="testing-faq__list">
      <article v-for="(faq, index) in testingServiceFaqs" :key="faq.id">
        <h4>
          <button
            :id="`testing-faq-button-${faq.id}`"
            type="button"
            :aria-expanded="openFaqId === faq.id"
            :aria-controls="`testing-faq-panel-${faq.id}`"
            @click="toggleFaq(faq.id)"
            @keydown.enter.prevent="toggleFaq(faq.id)"
            @keydown.space.prevent="toggleFaq(faq.id)"
          >
            <span class="testing-faq__number" aria-hidden="true">{{ String(index + 1).padStart(2, '0') }}</span>
            <span>{{ faq.question }}</span>
            <i aria-hidden="true">{{ openFaqId === faq.id ? '−' : '+' }}</i>
          </button>
        </h4>
        <div
          v-show="openFaqId === faq.id"
          :id="`testing-faq-panel-${faq.id}`"
          class="testing-faq__answer"
          role="region"
          :aria-labelledby="`testing-faq-button-${faq.id}`"
        >
          <p>{{ faq.answer }}</p>
        </div>
      </article>
    </div>
  </section>
</template>

<style scoped>
.testing-faq {
  padding-block: 24px 28px;
  border-top: 1px solid var(--testing-line, #dce7ec);
  border-bottom: 1px solid var(--testing-line, #dce7ec);
}

.testing-faq__heading {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 24px;
  margin-bottom: 7px;
}

.testing-faq__heading h3 {
  margin: 0;
  color: #183f51;
  font-size: 22px;
}

.testing-faq__heading p {
  color: #71858f;
  font-size: 13.5px;
  line-height: 1.6;
  text-align: right;
}

.testing-faq__list article + article {
  border-top: 1px solid #e3ecef;
}

.testing-faq h4 {
  margin: 0;
  font-size: inherit;
}

.testing-faq button {
  width: 100%;
  min-height: 58px;
  display: grid;
  grid-template-columns: 34px minmax(0, 1fr) 28px;
  align-items: center;
  gap: 12px;
  padding: 8px 0;
  border: 0;
  color: #315564;
  background: transparent;
  text-align: left;
  cursor: pointer;
}

.testing-faq button:hover,
.testing-faq button:focus-visible,
.testing-faq button[aria-expanded='true'] {
  color: #176e94;
  background: #f7fbfc;
}

.testing-faq__number {
  color: #89aab8;
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.08em;
}

.testing-faq button > span:nth-child(2) {
  font-size: 15px;
  font-weight: 700;
  line-height: 1.5;
}

.testing-faq button i {
  width: 28px;
  height: 28px;
  display: grid;
  place-items: center;
  border: 0;
  color: #1684b2;
  font-style: normal;
  font-size: 16px;
}

.testing-faq__answer {
  padding: 0 40px 18px 46px;
  color: #657c87;
  background: transparent;
  font-size: 14px;
  line-height: 1.75;
}

@media (max-width: 800px) {
  .testing-faq {
    padding-block: 18px 19px;
  }

  .testing-faq__heading {
    align-items: start;
    flex-direction: column;
    gap: 7px;
  }

  .testing-faq__heading p {
    text-align: left;
  }

  .testing-faq button {
    min-height: 54px;
    grid-template-columns: 24px minmax(0, 1fr) 28px;
    gap: 9px;
    padding-inline: 0;
  }

  .testing-faq__answer {
    padding: 0 0 13px 33px;
    font-size: 14px;
  }

  .testing-faq__heading p {
    font-size: 13px;
  }
}
</style>
