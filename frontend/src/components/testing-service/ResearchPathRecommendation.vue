<script setup>
const props = defineProps({
  goal: {
    type: Object,
    default: null,
  },
})

const emit = defineEmits(['view-services', 'prefill'])
</script>

<template>
  <section id="research-path" class="research-path" aria-labelledby="research-path-title">
    <div class="page-container research-path__inner">
      <header>
        <p>RESEARCH PATH GUIDANCE</p>
        <h2 id="research-path-title">研究路径建议</h2>
      </header>

      <div v-if="props.goal" class="research-path__result" role="status" aria-live="polite">
        <dl>
          <div>
            <dt>研究目标</dt>
            <dd>{{ props.goal.title }}</dd>
          </div>
          <div>
            <dt>建议研究方向</dt>
            <dd>{{ props.goal.primaryServices.length ? props.goal.primaryServices.join('、') : '由项目顾问协助梳理技术路线' }}</dd>
          </div>
          <div>
            <dt>可能补充方向</dt>
            <dd>{{ props.goal.supplementalServices.length ? props.goal.supplementalServices.join('、') : '暂不预设具体技术服务' }}</dd>
          </div>
          <div class="research-path__confirmation">
            <dt>开始前需要确认</dt>
            <dd>{{ props.goal.confirmation }}</dd>
          </div>
        </dl>

        <div class="research-path__actions">
          <button type="button" class="research-path__primary" @click="emit('view-services', props.goal)">
            {{ props.goal.primaryServices.length ? '查看相关服务' : '查看咨询入口' }}
          </button>
          <button type="button" @click="emit('prefill', props.goal)">带入咨询表</button>
        </div>
      </div>

      <p v-else class="research-path__empty">
        选择一个研究目标后，这里会根据现有服务目录显示本地确定性映射。建议仅用于初步沟通，不替代正式项目判断。
      </p>
    </div>
  </section>
</template>

<style scoped>
.research-path {
  padding: 64px 0 70px;
  border-top: 1px solid #d4e3e7;
  background: #edf5f6;
}

.research-path__inner > header {
  display: grid;
  grid-template-columns: minmax(230px, 0.7fr) minmax(0, 1.3fr);
  align-items: end;
  gap: 30px;
}

.research-path__inner > header p {
  color: #167ea6;
  font-size: 12px;
  font-weight: 750;
  letter-spacing: 0.14em;
}

.research-path h2 {
  color: #173f51;
  font-size: 34px;
}

.research-path__result,
.research-path__empty {
  margin-top: 30px;
  padding-top: 30px;
  border-top: 1px solid #c8dce2;
}

.research-path__result {
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto;
  align-items: end;
  gap: 40px;
}

.research-path dl {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 26px;
}

.research-path dl > div {
  min-width: 0;
}

.research-path__confirmation {
  grid-column: 1 / -1;
  padding-top: 22px;
  border-top: 1px solid #cfdee2;
}

.research-path dt {
  color: #66808a;
  font-size: 13px;
  font-weight: 700;
}

.research-path dd {
  margin: 8px 0 0;
  color: #284e5d;
  font-size: 16px;
  line-height: 1.7;
}

.research-path__actions {
  display: flex;
  gap: 10px;
}

.research-path__actions button {
  min-height: 48px;
  padding: 0 20px;
  border: 1px solid #77adbf;
  border-radius: 4px;
  color: #176f91;
  background: transparent;
  font-size: 14px;
  font-weight: 700;
  white-space: nowrap;
  cursor: pointer;
}

.research-path__actions .research-path__primary {
  border-color: #087fbe;
  color: white;
  background: #087fbe;
}

.research-path__actions button:hover,
.research-path__actions button:focus-visible {
  border-color: #087fbe;
  background: white;
}

.research-path__actions .research-path__primary:hover,
.research-path__actions .research-path__primary:focus-visible {
  color: white;
  background: #006da7;
}

.research-path__empty {
  color: #5b737d;
  font-size: 15px;
  line-height: 1.8;
}

@media (max-width: 900px) {
  .research-path__result {
    grid-template-columns: 1fr;
  }

  .research-path__actions {
    justify-content: flex-start;
  }
}

@media (max-width: 700px) {
  .research-path {
    padding: 52px 0 56px;
  }

  .research-path__inner > header,
  .research-path dl {
    grid-template-columns: 1fr;
  }

  .research-path__inner > header {
    gap: 8px;
  }

  .research-path h2 {
    font-size: 30px;
  }

  .research-path dl {
    gap: 20px;
  }

  .research-path dl > div,
  .research-path__confirmation {
    grid-column: auto;
    padding-top: 18px;
    border-top: 1px solid #cfdee2;
  }

  .research-path__actions {
    display: grid;
    grid-template-columns: 1fr;
  }
}
</style>
