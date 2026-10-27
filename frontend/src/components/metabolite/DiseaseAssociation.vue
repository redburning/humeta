<script setup>
import { ref } from 'vue'

const props = defineProps({
  association: { type: Object, required: true },
  metaboliteId: { type: String, required: true },
  fullscreen: { type: Boolean, default: false },
})

const diseaseAssociationHtmlSrc = `${import.meta.env.BASE_URL}visualizations/disease-association/4-aminohippuric-acid.html?viewer_pane=1&bilingual=2`
const diseaseAssociationFrame = ref(null)
const visualizationLanguage = ref('en')

function sendVisualizationLanguage() {
  diseaseAssociationFrame.value?.contentWindow?.postMessage(
    {
      type: 'humeta:disease-association:set-language',
      language: visualizationLanguage.value,
    },
    window.location.origin,
  )
}

function setVisualizationLanguage(language) {
  if (language !== 'zh' && language !== 'en') return
  visualizationLanguage.value = language
  sendVisualizationLanguage()
}
</script>

<template>
  <div
    class="disease-association"
    :class="{ 'disease-association--fullscreen': props.fullscreen }"
  >
    <div class="disease-association__title-row">
      <h3>{{ props.association.title }}</h3>

      <div
        class="disease-association__language"
        role="group"
        aria-label="Disease Association visualization language"
      >
        <button
          type="button"
          :class="{ 'is-active': visualizationLanguage === 'zh' }"
          :aria-pressed="visualizationLanguage === 'zh'"
          @click="setVisualizationLanguage('zh')"
        >
          中文
        </button>
        <button
          type="button"
          :class="{ 'is-active': visualizationLanguage === 'en' }"
          :aria-pressed="visualizationLanguage === 'en'"
          @click="setVisualizationLanguage('en')"
        >
          English
        </button>
      </div>
    </div>

    <div class="disease-association__viewer">
      <iframe
        ref="diseaseAssociationFrame"
        class="disease-association__frame"
        :src="diseaseAssociationHtmlSrc"
        title="Metabolite-Disease Association Pairs Database visualization"
        loading="lazy"
        scrolling="no"
        @load="sendVisualizationLanguage"
      />
    </div>
  </div>
</template>

<style scoped>
.disease-association__title-row {
  position: relative;
  min-width: 0;
  margin: 0 0 10px;
  padding-right: 134px;
}

.disease-association__title-row h3 {
  min-width: 0;
  margin: 0;
  color: #3c535f;
  font-size: 16px;
  font-weight: 600;
}

.disease-association__language {
  position: absolute;
  top: 50%;
  right: 0;
  height: 30px;
  display: inline-flex;
  align-items: stretch;
  overflow: hidden;
  border: 1px solid #bdd5e2;
  border-radius: 4px;
  background: #f5fafc;
  transform: translateY(-50%);
}

.disease-association__language button {
  min-width: 54px;
  height: 28px;
  padding: 0 10px;
  border: 0;
  border-right: 1px solid #bdd5e2;
  color: #087fbe;
  background: transparent;
  font: inherit;
  font-size: 12px;
  font-weight: 500;
  line-height: 28px;
  cursor: pointer;
}

.disease-association__language button:last-child {
  min-width: 66px;
  border-right: 0;
}

.disease-association__language button:hover:not(.is-active) {
  background: #eaf4f8;
}

.disease-association__language button.is-active {
  color: #fff;
  background: #087fbe;
}

.disease-association__language button:focus-visible {
  position: relative;
  z-index: 1;
  outline: 2px solid #8ab9ce;
  outline-offset: -3px;
}

.disease-association__viewer {
  box-sizing: border-box;
  width: min(100%, 960px);
  min-height: 0;
  margin-inline: auto;
  aspect-ratio: 1;
  overflow: hidden;
  border: 1px solid var(--detail-border, #dce8ef);
  border-radius: 6px;
  background: #000;
}

.disease-association__frame {
  display: block;
  width: 100%;
  height: 100%;
  border: 0;
  background: #fff;
}

.disease-association--fullscreen {
  height: calc(100vh - 84px);
  min-height: 0;
  display: flex;
  flex-direction: column;
}

.disease-association--fullscreen .disease-association__viewer {
  width: min(100%, calc(100vh - 113px));
  height: auto;
  min-height: 0;
  margin: auto;
  aspect-ratio: 1;
  flex: 0 1 auto;
}

@media (max-width: 520px) {
  .disease-association__language {
    top: 1px;
    transform: none;
  }
}
</style>

