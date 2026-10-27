<script setup>
defineProps({
  milestones: { type: Array, required: true },
  language: { type: String, required: true },
})

function formatDate(dateValue, language) {
  const date = new Date(`${dateValue}T00:00:00+08:00`)
  return new Intl.DateTimeFormat(language === 'en' ? 'en-US' : 'zh-CN', {
    year: 'numeric', month: language === 'en' ? 'long' : 'long', day: 'numeric',
  }).format(date)
}
</script>

<template>
  <ol class="upgrade-timeline" :aria-label="language === 'en' ? 'Humeta development milestones' : 'Humeta 开发里程碑'">
    <li v-for="(milestone, index) in milestones" :key="`${milestone.date}-${milestone.title.en}`" class="upgrade-timeline__item">
      <span class="upgrade-timeline__dot" :class="{ 'upgrade-timeline__dot--foundation': index === milestones.length - 1 }" aria-hidden="true" />
      <time :datetime="milestone.date">{{ formatDate(milestone.date, language) }}</time>
      <article class="upgrade-timeline__card">
        <h2>{{ milestone.title[language] }}</h2>
        <ul>
          <li v-for="item in milestone.items[language]" :key="item">{{ item }}</li>
        </ul>
      </article>
    </li>
  </ol>
</template>

<style scoped>
.upgrade-timeline {
  position: relative;
  margin: 0;
  padding: 0 0 0 30px;
  list-style: none;
}

.upgrade-timeline::before {
  content: '';
  position: absolute;
  top: 9px;
  bottom: 28px;
  left: 8px;
  width: 2px;
  background: #8ec9e4;
}

.upgrade-timeline__item {
  position: relative;
  padding: 0 0 26px;
}

.upgrade-timeline__dot {
  position: absolute;
  top: 4px;
  left: -27px;
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background: #087fbe;
}

.upgrade-timeline__dot--foundation { background: #087fbe; }

.upgrade-timeline time {
  display: block;
  margin: 0 0 7px;
  color: #617684;
  font-size: 13px;
  font-weight: 500;
  line-height: 1.4;
}

.upgrade-timeline__card {
  padding: 18px 20px;
  border: 1px solid #dce8ef;
  border-radius: 5px;
  background: white;
}

.upgrade-timeline__card h2 {
  margin: 0 0 9px;
  max-width: 860px;
  color: #16324f;
  font-size: 16px;
  font-weight: 600;
  line-height: 1.4;
}

.upgrade-timeline__card ul {
  display: grid;
  gap: 6px;
  margin: 0;
  max-width: 860px;
  padding-left: 18px;
  color: #526b7a;
  font-size: 14px;
  font-weight: 400;
  line-height: 1.7;
  overflow-wrap: anywhere;
}

.upgrade-timeline__card li::marker { color: #087fbe; }

@media (max-width: 767px) {
  .upgrade-timeline { padding-left: 25px; }
  .upgrade-timeline::before { top: 8px; bottom: 26px; left: 6px; }
  .upgrade-timeline__dot { left: -24px; }
  .upgrade-timeline__card { padding: 17px 16px; }
  .upgrade-timeline__card h2 { max-width: 100%; font-size: 16px; }
  .upgrade-timeline__card ul { max-width: 100%; font-size: 13.5px; }
}
</style>
