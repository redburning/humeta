<script setup>
import { computed, nextTick, ref, watch } from 'vue'
import { useTestingRequestForm } from '../../composables/useTestingRequestForm'
import TestingSuccessDialog from './TestingSuccessDialog.vue'

const props = defineProps({
  categories: {
    type: Array,
    required: true,
  },
  initialCategoryId: {
    type: String,
    required: true,
  },
  initialServiceId: {
    type: String,
    required: true,
  },
})

const emit = defineEmits(['selection-change'])

const {
  clearDynamicFields,
  errors,
  form,
  prefill: prefillForm,
  reset,
  statusMessage,
  validate,
} = useTestingRequestForm(props.initialCategoryId, props.initialServiceId)

const optionalOpen = ref(false)
const successOpen = ref(false)
const resetConfirmationOpen = ref(false)
const nameInput = ref(null)
const organizationInput = ref(null)
const phoneInput = ref(null)
const emailInput = ref(null)
const requirementsInput = ref(null)
const privacyInput = ref(null)
const confirmResetButton = ref(null)
const cancelResetButton = ref(null)
let resetReturnFocus = null

const errorCount = computed(() => Object.keys(errors).length)

const selectedCategory = computed(() => (
  props.categories.find((category) => category.id === form.businessCategory) || props.categories[0]
))
const serviceOptions = computed(() => selectedCategory.value.services)

watch(
  () => [props.initialCategoryId, props.initialServiceId],
  ([categoryId, serviceId]) => {
    prefillForm(categoryId, serviceId)
  },
)

function fieldDescription(field, hintId = '') {
  return [hintId, errors[field] ? `testing-form-${field}-error` : ''].filter(Boolean).join(' ') || undefined
}

function updateCategory() {
  clearDynamicFields()
  form.serviceId = selectedCategory.value.services[0].id
  statusMessage.value = `已切换为${selectedCategory.value.label}，具体项目和补充字段已更新。`
  emit('selection-change', {
    categoryId: form.businessCategory,
    serviceId: form.serviceId,
  })
}

function updateService() {
  statusMessage.value = `已切换具体项目为${serviceOptions.value.find((service) => service.id === form.serviceId)?.title || ''}。`
  emit('selection-change', {
    categoryId: form.businessCategory,
    serviceId: form.serviceId,
  })
}

function toggleOptional() {
  optionalOpen.value = !optionalOpen.value
}

async function focusFirstError() {
  await nextTick()
  const fieldOrder = [
    ['name', nameInput],
    ['organization', organizationInput],
    ['phone', phoneInput],
    ['email', emailInput],
    ['requirements', requirementsInput],
    ['privacyConfirmed', privacyInput],
  ]
  const target = fieldOrder.find(([field]) => errors[field])
  target?.[1].value?.focus()
}

async function submitForm() {
  const result = validate()
  if (!result.valid) {
    await focusFirstError()
    return
  }

  statusMessage.value = '表单验证已完成，信息未发送、未上传、未保存。'
  successOpen.value = true
}

async function prefill(categoryId, serviceId) {
  prefillForm(categoryId, serviceId)
  await nextTick()
}

async function requestReset() {
  resetReturnFocus = document.activeElement
  successOpen.value = false
  resetConfirmationOpen.value = true
  await nextTick()
  confirmResetButton.value?.focus()
}

async function cancelReset() {
  resetConfirmationOpen.value = false
  await nextTick()
  resetReturnFocus?.focus?.()
  resetReturnFocus = null
}

async function confirmReset() {
  reset(props.initialCategoryId, props.initialServiceId)
  optionalOpen.value = false
  resetConfirmationOpen.value = false
  resetReturnFocus = null
  await nextTick()
  nameInput.value?.focus()
}

function handleResetDialogKeydown(event) {
  if (event.key === 'Escape') {
    event.preventDefault()
    cancelReset()
    return
  }

  if (event.key !== 'Tab') return
  const buttons = [confirmResetButton.value, cancelResetButton.value].filter(Boolean)
  const currentIndex = buttons.indexOf(document.activeElement)
  const nextIndex = event.shiftKey
    ? (currentIndex <= 0 ? buttons.length - 1 : currentIndex - 1)
    : (currentIndex === buttons.length - 1 ? 0 : currentIndex + 1)
  event.preventDefault()
  buttons[nextIndex]?.focus()
}

defineExpose({ prefill })
</script>

<template>
  <section class="request-form-section" aria-labelledby="testing-request-title">
    <header class="request-form-section__heading">
      <span>PROJECT CONSULTATION</span>
      <h2 id="testing-request-title">开始项目咨询</h2>
      <p>请提供能够帮助我们理解研究问题的基本信息。提交后仍需进一步沟通，以确认技术路线、样本要求和正式项目范围。</p>
    </header>

    <div v-if="errorCount" class="request-form__error-summary" role="alert" tabindex="0">
      <strong>请检查表单</strong>
      <span>{{ statusMessage }}</span>
    </div>

    <form class="request-form" novalidate @submit.prevent="submitForm">
      <fieldset class="request-form__business">
        <legend>A. 项目方向</legend>
        <div class="request-form__grid">
          <div class="form-field">
            <label for="testing-form-category">业务方向</label>
            <select id="testing-form-category" v-model="form.businessCategory" @change="updateCategory">
              <option v-for="category in props.categories" :key="category.id" :value="category.id">{{ category.label }}</option>
            </select>
          </div>
          <div class="form-field">
            <label for="testing-form-service">具体项目</label>
            <select id="testing-form-service" v-model="form.serviceId" @change="updateService">
              <option v-for="service in serviceOptions" :key="service.id" :value="service.id">{{ service.title }}</option>
            </select>
          </div>
        </div>
      </fieldset>

      <fieldset class="request-form__contact">
        <legend>B. 联系信息</legend>
        <div class="request-form__grid">
          <div class="form-field" :class="{ 'form-field--error': errors.name }">
            <label for="testing-form-name">姓名 <span aria-hidden="true">*</span></label>
            <input
              id="testing-form-name"
              ref="nameInput"
              v-model="form.name"
              type="text"
              autocomplete="name"
              aria-required="true"
              :aria-invalid="Boolean(errors.name)"
              :aria-describedby="fieldDescription('name')"
            />
            <p v-if="errors.name" id="testing-form-name-error" class="form-error"><span aria-hidden="true">!</span>{{ errors.name }}</p>
          </div>

          <div class="form-field" :class="{ 'form-field--error': errors.organization }">
            <label for="testing-form-organization">单位或机构 <span aria-hidden="true">*</span></label>
            <input
              id="testing-form-organization"
              ref="organizationInput"
              v-model="form.organization"
              type="text"
              autocomplete="organization"
              aria-required="true"
              :aria-invalid="Boolean(errors.organization)"
              :aria-describedby="fieldDescription('organization')"
            />
            <p v-if="errors.organization" id="testing-form-organization-error" class="form-error"><span aria-hidden="true">!</span>{{ errors.organization }}</p>
          </div>

          <div class="form-field" :class="{ 'form-field--error': errors.phone }">
            <label for="testing-form-phone">联系电话</label>
            <input
              id="testing-form-phone"
              ref="phoneInput"
              v-model="form.phone"
              type="tel"
              autocomplete="tel"
              :aria-invalid="Boolean(errors.phone)"
              :aria-describedby="fieldDescription('phone', 'testing-form-contact-hint')"
            />
            <p v-if="errors.phone" id="testing-form-phone-error" class="form-error"><span aria-hidden="true">!</span>{{ errors.phone }}</p>
          </div>

          <div class="form-field" :class="{ 'form-field--error': errors.email }">
            <label for="testing-form-email">邮箱</label>
            <input
              id="testing-form-email"
              ref="emailInput"
              v-model="form.email"
              type="email"
              autocomplete="email"
              :aria-invalid="Boolean(errors.email)"
              :aria-describedby="fieldDescription('email', 'testing-form-contact-hint')"
            />
            <p v-if="errors.email" id="testing-form-email-error" class="form-error"><span aria-hidden="true">!</span>{{ errors.email }}</p>
          </div>
        </div>
        <p id="testing-form-contact-hint" class="form-hint">联系电话和邮箱至少填写一项；当前页面不会发送这些信息。</p>
      </fieldset>

      <fieldset class="request-form__requirements">
        <legend>C. 项目需求</legend>
        <div class="form-field" :class="{ 'form-field--error': errors.requirements }">
          <label for="testing-form-requirements">项目需求说明 <span aria-hidden="true">*</span></label>
          <textarea
            id="testing-form-requirements"
            ref="requirementsInput"
            v-model="form.requirements"
            rows="3"
            aria-required="true"
            :aria-invalid="Boolean(errors.requirements)"
            :aria-describedby="fieldDescription('requirements', 'testing-form-requirements-hint')"
          ></textarea>
          <p id="testing-form-requirements-hint" class="form-hint">请勿填写临床隐私、可识别个人身份的信息或其他敏感数据。</p>
          <p v-if="errors.requirements" id="testing-form-requirements-error" class="form-error"><span aria-hidden="true">!</span>{{ errors.requirements }}</p>
        </div>
      </fieldset>

      <div class="request-form__optional">
        <button
          id="testing-optional-button"
          type="button"
          :aria-expanded="optionalOpen"
          aria-controls="testing-optional-panel"
          @click="toggleOptional"
          @keydown.enter.prevent="toggleOptional"
          @keydown.space.prevent="toggleOptional"
        >
          <span>
            <strong>D. 补充项目信息（选填）</strong>
            <small>根据业务方向填写样本、研究阶段或合作基础</small>
          </span>
          <i aria-hidden="true">{{ optionalOpen ? '−' : '+' }}</i>
        </button>

        <div
          v-show="optionalOpen"
          id="testing-optional-panel"
          role="region"
          aria-labelledby="testing-optional-button"
        >
          <fieldset v-if="form.businessCategory === 'research'">
            <legend>科研服务产品补充信息</legend>
            <div class="request-form__grid">
              <div class="form-field">
                <label for="testing-form-sample-type">样本类型</label>
                <select id="testing-form-sample-type" v-model="form.sampleType">
                  <option value="">请选择或暂不确定</option>
                  <option>血清/血浆</option><option>尿液及其他体液</option><option>组织</option>
                  <option>细胞/微生物</option><option>粪便/肠道内容物</option><option>植物及特殊样本</option>
                </select>
              </div>
              <div class="form-field">
                <label for="testing-form-sample-count">预计样本数量</label>
                <input id="testing-form-sample-count" v-model="form.estimatedSampleCount" type="text" aria-describedby="testing-form-sample-count-hint" />
                <p id="testing-form-sample-count-hint" class="form-hint">自由填写，不自动判断是否达标。</p>
              </div>
              <div class="form-field"><label for="testing-form-group-count">分组数量</label><input id="testing-form-group-count" v-model="form.groupCount" type="text" /></div>
              <div class="form-field">
                <label for="testing-form-analysis">是否需要数据分析</label>
                <select id="testing-form-analysis" v-model="form.needsAnalysis">
                  <option value="">暂不确定</option><option>需要进一步沟通</option><option>已有分析计划</option><option>仅咨询检测相关内容</option>
                </select>
              </div>
              <div class="form-field form-field--full"><label for="testing-form-preferred-time-research">期望沟通时间</label><input id="testing-form-preferred-time-research" v-model="form.preferredTime" type="text" /></div>
            </div>
          </fieldset>

          <fieldset v-else-if="form.businessCategory === 'solution'">
            <legend>行业解决方案补充信息</legend>
            <div class="request-form__grid">
              <div class="form-field"><label for="testing-form-research-direction">研究方向</label><input id="testing-form-research-direction" v-model="form.researchDirection" type="text" /></div>
              <div class="form-field">
                <label for="testing-form-research-stage">当前研究阶段</label>
                <select id="testing-form-research-stage" v-model="form.currentResearchStage"><option value="">请选择或暂不确定</option><option>研究构思</option><option>方案准备</option><option>数据采集</option><option>数据分析</option><option>成果整合</option></select>
              </div>
              <div class="form-field"><label for="testing-form-existing-data">已有数据类型</label><input id="testing-form-existing-data" v-model="form.existingDataTypes" type="text" /></div>
              <div class="form-field"><label for="testing-form-expected-problem">期望解决的问题</label><textarea id="testing-form-expected-problem" v-model="form.expectedProblem" rows="3"></textarea></div>
              <div class="form-field form-field--full"><label for="testing-form-preferred-time-solution">期望沟通时间</label><input id="testing-form-preferred-time-solution" v-model="form.preferredTime" type="text" /></div>
            </div>
          </fieldset>

          <fieldset v-else>
            <legend>临床转化合作补充信息</legend>
            <div class="request-form__grid">
              <div class="form-field"><label for="testing-form-project-stage">项目当前阶段</label><input id="testing-form-project-stage" v-model="form.projectStage" type="text" /></div>
              <div class="form-field"><label for="testing-form-partner-type">合作单位类型</label><input id="testing-form-partner-type" v-model="form.partnerType" type="text" /></div>
              <div class="form-field"><label for="testing-form-cooperation-mode">预期合作方式</label><input id="testing-form-cooperation-mode" v-model="form.cooperationMode" type="text" /></div>
              <div class="form-field"><label for="testing-form-research-foundation">已有研究基础</label><textarea id="testing-form-research-foundation" v-model="form.researchFoundation" rows="3"></textarea></div>
              <div class="form-field form-field--full"><label for="testing-form-preferred-time-clinical">期望沟通时间</label><input id="testing-form-preferred-time-clinical" v-model="form.preferredTime" type="text" /></div>
            </div>
            <p class="request-form__clinical-note">临床转化需求仍需研究、伦理、注册和合规边界评估，本表单不构成临床诊断服务承诺。</p>
          </fieldset>
        </div>
      </div>

      <div class="request-form__privacy" :class="{ 'request-form__privacy--error': errors.privacyConfirmed }">
        <label>
          <input
            ref="privacyInput"
            v-model="form.privacyConfirmed"
            type="checkbox"
            aria-required="true"
            :aria-invalid="Boolean(errors.privacyConfirmed)"
            :aria-describedby="errors.privacyConfirmed ? 'testing-form-privacyConfirmed-error testing-form-privacy-hint' : 'testing-form-privacy-hint'"
          />
          <span>E. 隐私确认 — 我已了解：当前为前端演示，所填写的信息不会发送、上传或保存。 <strong aria-hidden="true">*</strong></span>
        </label>
        <p id="testing-form-privacy-hint">我已确认表单不包含患者姓名、身份证号、病历号等可识别个人信息；刷新或关闭页面后，表单内容不会恢复。</p>
        <p v-if="errors.privacyConfirmed" id="testing-form-privacyConfirmed-error" class="form-error"><span aria-hidden="true">!</span>{{ errors.privacyConfirmed }}</p>
      </div>

      <p class="request-form__status" role="status" aria-live="polite">{{ statusMessage }}</p>

      <div class="request-form__actions">
        <button type="submit" class="request-form__submit">提交演示需求</button>
        <button type="button" class="request-form__reset" @click="requestReset">重置表单</button>
      </div>
    </form>

    <div v-if="resetConfirmationOpen" class="reset-dialog__backdrop">
      <section
        class="reset-dialog"
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="testing-reset-title"
        aria-describedby="testing-reset-description"
        @keydown="handleResetDialogKeydown"
      >
        <span aria-hidden="true">!</span>
        <h2 id="testing-reset-title">确认重置表单？</h2>
        <p id="testing-reset-description">此操作会清空当前页面中已填写的内容，且无法恢复。</p>
        <div>
          <button ref="confirmResetButton" type="button" @click="confirmReset">确认重置</button>
          <button ref="cancelResetButton" type="button" @click="cancelReset">取消</button>
        </div>
      </section>
    </div>

    <TestingSuccessDialog
      :open="successOpen"
      @close="successOpen = false"
      @request-reset="requestReset"
    />
  </section>
</template>

<style scoped>
.request-form-section {
  position: relative;
  max-width: 1040px;
  margin-inline: auto;
  border: 1px solid var(--testing-line, #cbdfe7);
  border-radius: var(--testing-radius, 5px);
  background: var(--testing-surface, white);
}

.request-form-section__heading {
  padding: 40px 46px 30px;
}

.request-form-section__heading > span {
  color: var(--primary-blue);
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 0.13em;
}

.request-form-section__heading h2 {
  margin-top: 9px;
  color: #183f51;
  font-size: clamp(34px, 3.4vw, 42px);
}

.request-form-section__heading p {
  max-width: 760px;
  margin-top: 16px;
  color: #6d838d;
  font-size: 15.5px;
  line-height: 1.75;
}

.request-form {
  display: block;
}

.request-form__error-summary {
  display: flex;
  align-items: baseline;
  gap: 12px;
  margin: 0 46px 4px;
  padding: 13px 15px;
  border-left: 3px solid #aa4444;
  color: #843737;
  background: #fff5f3;
  font-size: 13px;
}

.request-form fieldset {
  min-width: 0;
  margin: 0;
  padding: 27px 46px 30px;
  border: 0;
  border-top: 1px solid #e2ebef;
}

.request-form__business {
  border-right: 0 !important;
}

.request-form legend {
  padding: 0;
  color: #335d6e;
  font-size: 16px;
  font-weight: 700;
}

.request-form__grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 20px 24px;
  margin-top: 17px;
}

.form-field {
  min-width: 0;
}

.form-field--full {
  grid-column: 1 / -1;
}

.form-field label {
  display: block;
  margin-bottom: 7px;
  color: #476471;
  font-size: 13.5px;
  font-weight: 700;
}

.form-field label span,
.request-form__privacy strong {
  color: #aa3f3f;
}

.form-field input,
.form-field select,
.form-field textarea {
  width: 100%;
  min-height: 48px;
  padding: 11px 13px;
  border: 1px solid #cbdce4;
  border-radius: 5px;
  color: #324f5c;
  background: white;
  font-size: 14px;
}

.form-field textarea {
  min-height: 118px;
  resize: vertical;
  line-height: 1.6;
}

.form-field input:focus,
.form-field select:focus,
.form-field textarea:focus {
  border-color: #1689ba;
  outline: 2px solid rgba(22, 137, 186, 0.2);
  outline-offset: 1px;
}

.form-field--error input,
.form-field--error textarea,
.request-form__privacy--error {
  border-color: #b94e4e;
}

.form-hint {
  margin-top: 6px;
  color: #71868f;
  font-size: 12.5px;
  line-height: 1.6;
}

.request-form fieldset > .form-hint {
  margin-top: 6px;
}

.form-error {
  display: flex;
  align-items: flex-start;
  gap: 5px;
  margin-top: 6px;
  color: #9c3636;
  font-size: 12.5px;
  line-height: 1.55;
}

.form-error > span {
  width: 15px;
  height: 15px;
  flex: 0 0 auto;
  display: grid;
  place-items: center;
  border: 1px solid currentColor;
  border-radius: 50%;
  font-size: 8px;
  font-weight: 700;
}

.request-form__optional {
  border-top: 1px solid #e2ebef;
  background: #f7fafb;
}

.request-form__optional > button {
  width: 100%;
  min-height: 72px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 20px;
  padding: 12px 46px;
  border: 0;
  color: #315666;
  background: transparent;
  text-align: left;
  cursor: pointer;
}

.request-form__optional > button:hover,
.request-form__optional > button:focus-visible,
.request-form__optional > button[aria-expanded='true'] {
  background: #edf7fa;
}

.request-form__optional > button > span {
  display: grid;
  gap: 3px;
}

.request-form__optional > button strong {
  color: #285364;
  font-size: 15px;
}

.request-form__optional > button small {
  color: #718690;
  font-size: 12.5px;
}

.request-form__optional > button i {
  width: 30px;
  height: 30px;
  flex: 0 0 auto;
  display: grid;
  place-items: center;
  border: 0;
  color: #0f83b2;
  background: transparent;
  font-style: normal;
  font-size: 18px;
}

.request-form__optional [role='region'] {
  border-top: 1px solid #dce7ec;
}

.request-form__optional fieldset {
  border-bottom: 0;
}

.request-form__clinical-note {
  margin-top: 12px;
  padding: 9px 11px;
  border-left: 3px solid #70afca;
  color: #5f7883;
  background: #eaf4f8;
  font-size: 12.5px;
  line-height: 1.6;
}

.request-form__privacy {
  margin: 24px 46px 0;
  padding: 14px 16px;
  border: 0;
  border-left: 2px solid #8ebdce;
  background: #f2f8fa;
}

.request-form__privacy label {
  display: flex;
  align-items: flex-start;
  gap: 10px;
  color: #476874;
  font-size: 13.5px;
  font-weight: 700;
  line-height: 1.6;
  cursor: pointer;
}

.request-form__privacy input {
  width: 18px;
  height: 18px;
  flex: 0 0 auto;
  margin-top: 1px;
  accent-color: #087fbe;
}

.request-form__privacy > p:not(.form-error) {
  margin: 6px 0 0 28px;
  color: #718790;
  font-size: 12.5px;
  line-height: 1.6;
}

.request-form__status {
  margin: 12px 46px 0;
  color: #287359;
  font-size: 12.5px;
}

.request-form__status:empty {
  display: none;
}

.request-form__actions {
  display: flex;
  gap: 10px;
  padding: 18px 46px 36px;
}

.request-form__actions button {
  min-height: 48px;
  padding: 0 22px;
  border-radius: 5px;
  font-size: 14px;
  font-weight: 700;
  cursor: pointer;
}

.request-form__submit {
  border: 1px solid #087fbe;
  color: white;
  background: #087fbe;
}

.request-form__reset {
  border: 1px solid #aac9d5;
  color: #3a6171;
  background: white;
}

.reset-dialog__backdrop {
  position: fixed;
  z-index: 1001;
  inset: 0;
  display: grid;
  place-items: center;
  padding: 20px;
  background: rgba(0, 36, 72, 0.54);
}

.reset-dialog {
  width: min(430px, 100%);
  padding: 27px;
  border: 1px solid #c8dce5;
  border-radius: 9px;
  color: #405e6a;
  background: white;
  box-shadow: 0 24px 70px rgba(0, 44, 86, 0.3);
  text-align: center;
}

.reset-dialog > span {
  width: 46px;
  height: 46px;
  display: grid;
  place-items: center;
  margin: 0 auto 13px;
  border: 1px solid #d1a365;
  border-radius: 50%;
  color: #95611d;
  background: #fff8ed;
  font-weight: 700;
}

.reset-dialog h2 {
  color: #244d5f;
  font-size: 21px;
}

.reset-dialog p {
  margin-top: 9px;
  color: #687f89;
  font-size: 13px;
  line-height: 1.65;
}

.reset-dialog > div {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 9px;
  margin-top: 20px;
}

.reset-dialog button {
  min-height: 48px;
  border: 1px solid #a8c8d4;
  border-radius: 5px;
  color: #376071;
  background: white;
  font-size: 13px;
  font-weight: 700;
  cursor: pointer;
}

.reset-dialog button:first-child {
  border-color: #9b5252;
  color: white;
  background: #9b5252;
}

@media (max-width: 800px) {
  .request-form-section__heading {
    align-items: start;
    flex-direction: column;
    gap: 10px;
    padding-inline: 17px;
    padding-block: 14px;
  }

  .request-form-section__heading ul {
    justify-content: flex-start;
  }

  .request-form fieldset,
  .request-form__optional > button {
    padding-inline: 20px;
  }

  .request-form fieldset {
    padding-block: 16px 18px;
  }

  .request-form__grid {
    gap: 11px;
    margin-top: 10px;
  }

  .request-form__grid {
    grid-template-columns: 1fr;
  }

  .form-field--full {
    grid-column: auto;
  }

  .request-form__privacy,
  .request-form__status,
  .request-form__error-summary {
    margin-inline: 20px;
  }

  .request-form__privacy {
    margin-top: 14px;
    padding-block: 10px;
  }

  .request-form__actions {
    display: grid;
    grid-template-columns: 1fr;
    padding-inline: 20px;
    padding-block: 10px 14px;
  }

  .request-form__optional > button {
    min-height: 58px;
  }

  .reset-dialog > div {
    grid-template-columns: 1fr;
  }

  .request-form-section__heading > span {
    font-size: 12px;
  }

  .request-form-section__heading p,
  .form-field label,
  .form-hint,
  .form-error,
  .request-form__optional > button small,
  .request-form__privacy label,
  .request-form__privacy > p:not(.form-error),
  .request-form__status,
  .request-form__actions button,
  .request-form__clinical-note {
    font-size: 13px;
  }
}

</style>
