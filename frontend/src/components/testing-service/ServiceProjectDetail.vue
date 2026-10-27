<script setup>
import { nextTick, ref, watch } from 'vue'
import { deliverables } from '../../data/testingServiceData'

const props = defineProps({
  category: {
    type: Object,
    required: true,
  },
  service: {
    type: Object,
    required: true,
  },
  focusRequest: {
    type: Number,
    default: 0,
  },
})

const emit = defineEmits(['request'])
const titleElement = ref(null)

watch(
  () => props.focusRequest,
  async (focusRequest, previousFocusRequest) => {
    if (focusRequest === previousFocusRequest) return
    await nextTick()
    titleElement.value?.focus({ preventScroll: true })
  },
)
</script>

<template>
  <article id="testing-service-detail" class="service-detail" aria-labelledby="selected-service-title">
    <header class="service-detail__header">
      <p>当前项目 · {{ props.category.label }}</p>
      <div class="service-detail__title-row">
        <h3 id="selected-service-title" ref="titleElement" tabindex="-1">{{ props.service.title }}</h3>
        <button type="button" @click="emit('request')">{{ props.category.cta }}</button>
      </div>
    </header>

    <p class="service-detail__summary">{{ props.service.summary }}</p>

    <div class="service-detail__content">
      <section class="service-detail__scenarios" aria-labelledby="service-scenarios-title">
        <h4 id="service-scenarios-title">适合回答的问题</h4>
        <ul>
          <li v-for="scenario in props.service.scenarios.slice(0, 3)" :key="scenario">{{ scenario }}</li>
        </ul>
      </section>

      <section class="service-detail__information" aria-labelledby="service-information-title">
        <h4 id="service-information-title">开始前需要确认</h4>
        <ul>
          <li v-for="item in props.service.information.slice(0, 3)" :key="item">{{ item }}</li>
        </ul>
      </section>

      <section class="service-detail__deliverables" aria-labelledby="service-deliverables-title">
        <h4 id="service-deliverables-title">可能交付</h4>
        <ul>
          <li v-for="item in deliverables" :key="item.id">{{ item.title }}</li>
        </ul>
        <p>不同服务的实际交付存在差异，具体内容以双方确认的项目方案为准。</p>
      </section>
    </div>

    <aside class="service-detail__notice">
      <strong>内容边界</strong>
      <ul>
        <li v-for="note in props.service.notes" :key="note">{{ note }}</li>
      </ul>
      <p>{{ props.service.verificationNote }}；具体内容以正式项目方案为准。</p>
    </aside>

  </article>
</template>

<style scoped>
.service-detail {
  min-width: 0;
  background: #fffdfa;
}

.service-detail__header {
  padding: 34px 38px 0;
}

.service-detail__header > p {
  color: #1682b0;
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 0.08em;
}

.service-detail__title-row {
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto;
  align-items: center;
  gap: 18px;
  margin-top: 8px;
}

.service-detail__header h3 {
  margin: 0;
  color: #173f51;
  font-size: clamp(27px, 2.5vw, 31px);
  line-height: 1.3;
}

.service-detail__summary {
  max-width: 880px;
  padding: 16px 38px 26px;
  color: #526c77;
  font-size: 16px;
  line-height: 1.78;
}

.service-detail__title-row button {
  min-height: 48px;
  padding: 0 22px;
  border: 1px solid #087fbe;
  border-radius: 5px;
  color: white;
  background: #087fbe;
  font-size: 14px;
  font-weight: 700;
  cursor: pointer;
}

.service-detail__title-row button:hover,
.service-detail__title-row button:focus-visible {
  background: #006ca5;
}

.service-detail__content {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 0 38px;
  margin-inline: 38px;
  border-top: 1px solid var(--testing-line, #dce7ec);
}

.service-detail__content section {
  min-width: 0;
  padding: 24px 0;
}

.service-detail h4 {
  margin: 0 0 13px;
  color: #31596a;
  font-size: 16px;
}

.service-detail__content ul,
.service-detail__notice ul {
  margin: 0;
  padding-left: 18px;
}

.service-detail__content li,
.service-detail__notice li {
  color: #637984;
  font-size: 14px;
  line-height: 1.65;
}

.service-detail__content li + li,
.service-detail__notice li + li {
  margin-top: 5px;
}

.service-detail__deliverables {
  grid-column: 1 / -1;
  border-top: 1px solid #e5edef;
}

.service-detail__deliverables ul {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 9px 18px;
  padding: 0;
  list-style: none;
}

.service-detail__deliverables li {
  position: relative;
  padding-left: 13px;
}

.service-detail__deliverables li::before {
  content: '';
  position: absolute;
  left: 0;
  top: 0.58em;
  width: 5px;
  height: 5px;
  border-radius: 50%;
  background: #2192bd;
}

.service-detail__deliverables p {
  margin-top: 14px;
  color: #718690;
  font-size: 13px;
  line-height: 1.65;
}

.service-detail__header h3:focus-visible {
  outline: 2px solid #45a4bd;
  outline-offset: 5px;
}

.service-detail__notice {
  display: grid;
  grid-template-columns: auto minmax(0, 1fr);
  align-items: start;
  gap: 7px 16px;
  margin: 0 38px 34px;
  padding: 15px 17px;
  border-left: 2px solid #6faec8;
  color: #5e7782;
  background: #eaf4f8;
}

.service-detail__notice strong {
  color: #365f70;
  font-size: 14px;
}

.service-detail__notice ul {
  margin: 5px 0 0;
  padding: 0;
  display: flex;
  flex-wrap: wrap;
  gap: 4px 18px;
  list-style: none;
}

.service-detail__notice li {
  position: relative;
  padding-left: 10px;
}

.service-detail__notice li::before {
  content: '·';
  position: absolute;
  left: 0;
  color: #3c819c;
  font-weight: 700;
}

.service-detail__notice li + li {
  margin-top: 0;
}

.service-detail__notice p {
  grid-column: 2;
  margin-top: 0;
  color: #607b87;
  font-size: 13px;
  line-height: 1.65;
}

@media (max-width: 800px) {
  .service-detail__header,
  .service-detail__summary {
    padding-inline: 20px;
  }

  .service-detail__title-row {
    grid-template-columns: 1fr;
    gap: 10px;
  }

  .service-detail__header h3 {
    padding-right: 0;
  }

  .service-detail__content {
    grid-template-columns: 1fr;
    margin-inline: 20px;
  }

  .service-detail__content section + section {
    border-top: 1px solid #e5edef;
  }

  .service-detail__content section {
    padding-block: 14px;
  }

  .service-detail__deliverables ul {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .service-detail__deliverables {
    grid-column: auto;
  }

  .service-detail__notice {
    grid-template-columns: 1fr;
    margin: 0 20px 28px;
    padding-block: 14px;
  }

  .service-detail__notice p {
    grid-column: auto;
  }

  .service-detail__title-row button {
    width: 100%;
  }

  .service-detail__header {
    padding-top: 28px;
  }
}

</style>
