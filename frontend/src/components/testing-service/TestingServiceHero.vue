<script setup>
const emit = defineEmits(['request', 'view-services'])
</script>

<template>
  <section class="testing-hero" aria-labelledby="testing-service-title">
    <div class="page-container testing-hero__inner">
      <div class="testing-hero__copy">
        <p class="testing-hero__eyebrow">RESEARCH SERVICES &amp; PROJECT CONSULTATION</p>
        <h1 id="testing-service-title">我要测</h1>
        <p class="testing-hero__subtitle">从科学问题出发，设计适合你的代谢组学研究方案</p>
        <p class="testing-hero__introduction">
          面向科研机构、临床研究团队和生命科学项目，提供研究设计、样本方案、质谱分析与数据解释咨询。
        </p>
        <div class="testing-hero__actions">
          <button type="button" @click="emit('request')">开始项目咨询</button>
          <a href="#service-capabilities" @click.prevent="emit('view-services')">查看服务能力</a>
        </div>
        <p class="testing-hero__boundary" role="note">
          本页面用于科研项目初步沟通，不提供临床诊断、治疗建议或样本直接下单。
        </p>
      </div>

      <figure class="testing-hero__figure">
        <svg
          viewBox="0 0 560 260"
          role="img"
          aria-labelledby="testing-flow-title testing-flow-description"
        >
          <title id="testing-flow-title">从研究问题到结果解释的项目咨询路径</title>
          <desc id="testing-flow-description">研究问题依次连接样本、质谱数据、结构或代谢物信息与结果解释。</desc>
          <path class="testing-flow__line" d="M64 130 H496" />
          <g class="testing-flow__step" transform="translate(64 130)">
            <circle r="34" />
            <path d="M-12 -5h24M-12 4h16M-12 13h10" />
            <text y="61">研究问题</text>
          </g>
          <g class="testing-flow__step" transform="translate(172 130)">
            <circle r="34" />
            <path d="M-10 -15h20l5 27h-30zM-14 -7h28" />
            <text y="61">样本方案</text>
          </g>
          <g class="testing-flow__step" transform="translate(280 130)">
            <circle r="34" />
            <path d="M-17 10l8-21 9 18 8-12 9 15" />
            <text y="61">质谱数据</text>
          </g>
          <g class="testing-flow__step" transform="translate(388 130)">
            <circle r="34" />
            <path d="M-13 -8l13-8 13 8v16L0 16l-13-8zM0-16v32M-13-8L0 0l13-8" />
            <text y="61">结构与信息</text>
          </g>
          <g class="testing-flow__step" transform="translate(496 130)">
            <circle r="34" />
            <path d="M-16 14V-2M-5 14v-26M6 14V3M17 14v-19" />
            <text y="61">结果解释</text>
          </g>
        </svg>
        <figcaption>研究路径需结合样本、分组、质量控制和预期问题进一步确认。</figcaption>
      </figure>
    </div>
  </section>
</template>

<style scoped>
.testing-hero {
  border-bottom: 1px solid #dbe8eb;
  background: #eef7f7;
}

.testing-hero__inner {
  min-height: 350px;
  display: grid;
  grid-template-columns: minmax(0, 1.08fr) minmax(410px, 0.92fr);
  align-items: center;
  gap: 64px;
  padding-block: 22px 24px;
}

.testing-hero__eyebrow {
  color: #167da4;
  font-size: 12px;
  font-weight: 750;
  letter-spacing: 0.15em;
}

.testing-hero h1 {
  margin-top: 4px;
  color: #173f51;
  font-size: clamp(48px, 5vw, 56px);
  font-weight: 680;
  line-height: 1.08;
}

.testing-hero__subtitle {
  max-width: 720px;
  margin-top: 9px;
  color: #244f61;
  font-size: clamp(24px, 2.2vw, 27px);
  font-weight: 560;
  line-height: 1.4;
}

.testing-hero__introduction {
  max-width: 700px;
  margin-top: 8px;
  color: #536d78;
  font-size: 15.5px;
  line-height: 1.65;
}

.testing-hero__actions {
  display: flex;
  align-items: center;
  gap: 24px;
  margin-top: 16px;
}

.testing-hero__actions button {
  min-height: 48px;
  padding: 0 24px;
  border: 1px solid #087fbe;
  border-radius: 4px;
  color: white;
  background: #087fbe;
  font-size: 14px;
  font-weight: 700;
  cursor: pointer;
}

.testing-hero__actions button:hover,
.testing-hero__actions button:focus-visible {
  background: #006da7;
}

.testing-hero__actions a {
  color: #176f91;
  font-size: 14px;
  font-weight: 700;
  text-underline-offset: 5px;
}

.testing-hero__boundary {
  max-width: 760px;
  margin-top: 14px;
  padding-left: 13px;
  border-left: 2px solid #78b4c4;
  color: #617983;
  font-size: 12.5px;
  line-height: 1.55;
}

.testing-hero__figure {
  min-width: 0;
  margin: 0;
}

.testing-hero__figure svg {
  width: 100%;
  height: auto;
  display: block;
  overflow: visible;
}

.testing-flow__line {
  fill: none;
  stroke: #a9cad3;
  stroke-width: 1.5;
  stroke-dasharray: 4 6;
  animation: testing-flow-reveal 800ms ease-out both;
}

.testing-flow__step circle {
  fill: rgba(255, 255, 255, 0.7);
  stroke: #8ebcc8;
  stroke-width: 1.5;
}

.testing-flow__step path {
  fill: none;
  stroke: #3c879e;
  stroke-width: 1.6;
  stroke-linecap: round;
  stroke-linejoin: round;
}

.testing-flow__step text {
  fill: #496c79;
  font-size: 13px;
  font-weight: 650;
  text-anchor: middle;
}

.testing-flow__step {
  opacity: 0;
  animation: testing-flow-step 450ms ease-out forwards;
}

.testing-flow__step:nth-of-type(2) { animation-delay: 90ms; }
.testing-flow__step:nth-of-type(3) { animation-delay: 160ms; }
.testing-flow__step:nth-of-type(4) { animation-delay: 230ms; }
.testing-flow__step:nth-of-type(5) { animation-delay: 300ms; }
.testing-flow__step:nth-of-type(6) { animation-delay: 370ms; }

.testing-hero__figure figcaption {
  max-width: 480px;
  margin: 4px auto 0;
  color: #687f87;
  font-size: 13px;
  line-height: 1.65;
  text-align: center;
}

@keyframes testing-flow-reveal {
  from { opacity: 0; }
  to { opacity: 1; }
}

@keyframes testing-flow-step {
  from { opacity: 0; }
  to { opacity: 1; }
}

@media (max-width: 1024px) {
  .testing-hero__inner {
    grid-template-columns: minmax(0, 1.1fr) minmax(330px, 0.9fr);
    gap: 34px;
  }
}

@media (max-width: 800px) {
  .testing-hero__inner {
    grid-template-columns: 1fr;
    gap: 30px;
    padding-block: 34px 42px;
  }

  .testing-hero__figure {
    max-width: 620px;
    margin-inline: auto;
  }
}

@media (max-width: 560px) {
  .testing-hero h1 {
    font-size: 45px;
  }

  .testing-hero__subtitle {
    font-size: 24px;
  }

  .testing-hero__actions {
    align-items: stretch;
    flex-direction: column;
    gap: 14px;
  }

  .testing-hero__actions button {
    width: 100%;
  }

  .testing-hero__actions a {
    min-height: 44px;
    display: flex;
    align-items: center;
    justify-content: center;
  }

}

@media (prefers-reduced-motion: reduce) {
  .testing-flow__line,
  .testing-flow__step {
    opacity: 1;
    animation: none;
  }
}
</style>
