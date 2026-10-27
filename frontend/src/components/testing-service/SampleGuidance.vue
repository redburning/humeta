<script setup>
import { ref } from 'vue'
import { sampleGuidance, sampleGuidanceNotice } from '../../data/testingServiceData'

const isOpen = ref(false)

function toggle() {
  isOpen.value = !isOpen.value
}
</script>

<template>
  <section class="sample-guidance" aria-labelledby="sample-guidance-title">
    <h3 id="sample-guidance-title" class="visually-hidden">通用样本准备说明</h3>
    <button
      id="sample-guidance-button"
      class="sample-guidance__toggle"
      type="button"
      :aria-expanded="isOpen"
      aria-controls="sample-guidance-panel"
      @click="toggle"
      @keydown.enter.prevent="toggle"
      @keydown.space.prevent="toggle"
    >
      <span>
        <strong>查看通用样本准备说明</strong>
        <small>仅用于前期沟通参考，不构成正式送样标准</small>
      </span>
      <i aria-hidden="true">{{ isOpen ? '−' : '+' }}</i>
    </button>

    <div
      v-show="isOpen"
      id="sample-guidance-panel"
      class="sample-guidance__panel"
      role="region"
      aria-labelledby="sample-guidance-button"
    >
      <dl>
        <div v-for="item in sampleGuidance" :key="item.id">
          <dt>{{ item.name }}</dt>
          <dd>{{ item.guidance }}</dd>
        </div>
      </dl>
      <p><strong>统一提示：</strong>{{ sampleGuidanceNotice }}</p>
    </div>
  </section>
</template>

<style scoped>
.sample-guidance {
  background: transparent;
}

.sample-guidance__toggle {
  width: 100%;
  min-height: 64px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 20px;
  padding: 9px 0;
  border: 0;
  color: #315666;
  background: transparent;
  text-align: left;
  cursor: pointer;
}

.sample-guidance__toggle:hover,
.sample-guidance__toggle:focus-visible,
.sample-guidance__toggle[aria-expanded='true'] {
  color: #176e94;
  background: #f2f8f9;
}

.sample-guidance__toggle > span {
  display: grid;
  gap: 3px;
}

.sample-guidance__toggle strong {
  color: #244d5e;
  font-size: 16px;
}

.sample-guidance__toggle small {
  color: #758a94;
  font-size: 13px;
  line-height: 1.45;
}

.sample-guidance__toggle i {
  width: 30px;
  height: 30px;
  flex: 0 0 auto;
  display: grid;
  place-items: center;
  border: 0;
  color: #0f83b2;
  font-style: normal;
  font-size: 18px;
}

.sample-guidance__panel {
  padding: 5px 0 14px;
  border-top: 1px solid #dbe8ed;
}

.sample-guidance__panel dl {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 0 18px;
}

.sample-guidance__panel dl > div {
  min-width: 0;
  padding: 10px 0;
  border-top: 1px solid #e2ecef;
}

.sample-guidance__panel dt {
  color: #31596a;
  font-size: 14px;
  font-weight: 700;
}

.sample-guidance__panel dd {
  margin-top: 5px;
  color: #657c87;
  font-size: 13.5px;
  line-height: 1.7;
}

.sample-guidance__panel > p {
  margin-top: 11px;
  padding: 9px 11px;
  border-left: 2px solid #6faec8;
  color: #607984;
  background: #eaf4f8;
  font-size: 13px;
  line-height: 1.65;
}

@media (max-width: 620px) {
  .sample-guidance__toggle {
    min-height: 62px;
  }

  .sample-guidance__panel dl {
    grid-template-columns: 1fr;
  }

  .sample-guidance__toggle small,
  .sample-guidance__panel dt,
  .sample-guidance__panel dd,
  .sample-guidance__panel > p {
    font-size: 13px;
  }
}
</style>
