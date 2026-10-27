<script setup>
const props = defineProps({
  goals: {
    type: Array,
    required: true,
  },
  modelValue: {
    type: String,
    default: '',
  },
})

const emit = defineEmits(['update:modelValue'])
</script>

<template>
  <section id="research-goals" class="research-goals" aria-labelledby="research-goals-title">
    <div class="page-container">
      <header class="research-goals__heading">
        <p>START WITH THE RESEARCH QUESTION</p>
        <h2 id="research-goals-title">你的研究目标是什么？</h2>
        <p>
          先选择希望解决的研究问题，页面将展示可能适合的研究方向。最终方案仍需结合样本、分组和项目目标进一步确认。
        </p>
      </header>

      <div class="research-goals__options" aria-label="研究目标选择">
        <button
          v-for="goal in props.goals"
          :key="goal.id"
          type="button"
          :aria-pressed="props.modelValue === goal.id"
          :class="{ 'research-goal--active': props.modelValue === goal.id }"
          @click="emit('update:modelValue', goal.id)"
        >
          <span class="research-goal__number">{{ goal.number }}</span>
          <span class="research-goal__copy">
            <strong>{{ goal.title }}</strong>
            <span>{{ goal.description }}</span>
            <small v-if="goal.associations.length">可能关联：{{ goal.associations.join('、') }}</small>
            <small v-else>下一步：请项目顾问协助判断</small>
          </span>
          <span class="research-goal__state">
            {{ props.modelValue === goal.id ? '已选择' : '选择此目标' }}
          </span>
        </button>
      </div>
    </div>
  </section>
</template>

<style scoped>
.research-goals {
  padding: 96px 0 92px;
  background: #fffdfa;
}

.research-goals__heading {
  max-width: 800px;
}

.research-goals__heading > p:first-child {
  color: #167ea6;
  font-size: 12px;
  font-weight: 750;
  letter-spacing: 0.14em;
}

.research-goals__heading h2 {
  margin-top: 10px;
  color: #173f51;
  font-size: clamp(34px, 3.5vw, 43px);
  line-height: 1.2;
}

.research-goals__heading > p:last-child {
  max-width: 740px;
  margin-top: 18px;
  color: #536d78;
  font-size: 16px;
  line-height: 1.8;
}

.research-goals__options {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 0;
  margin-top: 44px;
  border-top: 1px solid #cbdde3;
  border-bottom: 1px solid #cbdde3;
}

.research-goals__options button {
  min-width: 0;
  min-height: 246px;
  display: grid;
  grid-template-rows: auto 1fr auto;
  gap: 20px;
  padding: 27px 25px 23px;
  border: 0;
  border-left: 1px solid #d7e5e9;
  color: #536d78;
  background: transparent;
  text-align: left;
  cursor: pointer;
  transition: background-color 180ms ease, box-shadow 180ms ease;
}

.research-goals__options button:first-child {
  border-left: 0;
}

.research-goals__options button:hover,
.research-goals__options button:focus-visible {
  background: #f4fafb;
}

.research-goals__options .research-goal--active {
  background: #eef7f9;
  box-shadow: inset 0 -4px #1687b2;
}

.research-goal__number {
  color: #70aabc;
  font-size: 13px;
  font-weight: 750;
  letter-spacing: 0.08em;
}

.research-goal__copy {
  display: block;
}

.research-goal__copy strong {
  display: block;
  color: #244d5e;
  font-size: 20px;
  line-height: 1.4;
}

.research-goal__copy > span {
  display: block;
  margin-top: 11px;
  font-size: 15px;
  line-height: 1.72;
}

.research-goal__copy small {
  display: block;
  margin-top: 15px;
  color: #607983;
  font-size: 13px;
  line-height: 1.65;
}

.research-goal__state {
  display: flex;
  align-items: center;
  gap: 8px;
  color: #247592;
  font-size: 13px;
  font-weight: 700;
}

.research-goal__state::before {
  content: '';
  width: 8px;
  height: 8px;
  border: 1px solid currentColor;
  border-radius: 50%;
}

.research-goal--active .research-goal__state::before {
  background: currentColor;
  box-shadow: inset 0 0 0 2px #eef7f9;
}

@media (max-width: 1100px) {
  .research-goals__options {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .research-goals__options button {
    min-height: 220px;
    border-bottom: 1px solid #d7e5e9;
  }

  .research-goals__options button:nth-child(odd) {
    border-left: 0;
  }

  .research-goals__options button:nth-last-child(-n + 2) {
    border-bottom: 0;
  }
}

@media (max-width: 640px) {
  .research-goals {
    padding: 68px 0 64px;
  }

  .research-goals__heading h2 {
    font-size: 32px;
  }

  .research-goals__heading > p:last-child {
    font-size: 15.5px;
  }

  .research-goals__options {
    grid-template-columns: 1fr;
    margin-top: 32px;
  }

  .research-goals__options button,
  .research-goals__options button:nth-child(odd) {
    min-height: 0;
    grid-template-columns: 38px minmax(0, 1fr);
    grid-template-rows: auto auto;
    gap: 13px 8px;
    padding: 22px 4px;
    border-left: 0;
    border-bottom: 1px solid #d7e5e9;
  }

  .research-goals__options button:last-child {
    border-bottom: 0;
  }

  .research-goal__number {
    grid-row: 1 / 3;
  }

  .research-goal__state {
    grid-column: 2;
  }
}

@media (prefers-reduced-motion: reduce) {
  .research-goals__options button {
    transition: none;
  }
}
</style>
