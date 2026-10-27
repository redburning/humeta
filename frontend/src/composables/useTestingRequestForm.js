import { reactive, ref } from 'vue'

function initialForm(categoryId, serviceId) {
  return {
    businessCategory: categoryId,
    serviceId,
    name: '',
    organization: '',
    phone: '',
    email: '',
    requirements: '',
    preferredTime: '',
    privacyConfirmed: false,
    sampleType: '',
    estimatedSampleCount: '',
    groupCount: '',
    needsAnalysis: '',
    researchDirection: '',
    currentResearchStage: '',
    existingDataTypes: '',
    expectedProblem: '',
    projectStage: '',
    partnerType: '',
    cooperationMode: '',
    researchFoundation: '',
  }
}

function hasValue(value) {
  return String(value || '').trim().length > 0
}

const dynamicFieldNames = [
  'sampleType',
  'estimatedSampleCount',
  'groupCount',
  'needsAnalysis',
  'researchDirection',
  'currentResearchStage',
  'existingDataTypes',
  'expectedProblem',
  'projectStage',
  'partnerType',
  'cooperationMode',
  'researchFoundation',
  'preferredTime',
]

export function useTestingRequestForm(categoryId, serviceId) {
  const form = reactive(initialForm(categoryId, serviceId))
  const errors = reactive({})
  const statusMessage = ref('')

  function clearErrors() {
    Object.keys(errors).forEach((key) => delete errors[key])
  }

  function clearDynamicFields() {
    dynamicFieldNames.forEach((field) => {
      form[field] = ''
    })
  }

  function validate() {
    clearErrors()

    if (!hasValue(form.name)) errors.name = '请填写姓名。'
    if (!hasValue(form.organization)) errors.organization = '请填写单位或机构。'

    if (!hasValue(form.phone) && !hasValue(form.email)) {
      errors.phone = '联系电话和邮箱至少填写一项。'
      errors.email = '联系电话和邮箱至少填写一项。'
    } else if (hasValue(form.email) && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) {
      errors.email = '请输入格式有效的邮箱地址。'
    }

    if (!hasValue(form.requirements)) errors.requirements = '请填写项目需求说明。'
    if (!form.privacyConfirmed) errors.privacyConfirmed = '请确认隐私与演示声明。'

    statusMessage.value = Object.keys(errors).length
      ? `表单中有 ${Object.keys(errors).length} 项需要检查。`
      : ''

    return { valid: Object.keys(errors).length === 0, errors }
  }

  function prefill(nextCategoryId, nextServiceId) {
    if (form.businessCategory !== nextCategoryId) clearDynamicFields()
    form.businessCategory = nextCategoryId
    form.serviceId = nextServiceId
    clearErrors()
    statusMessage.value = '已根据当前项目预填业务方向和具体项目。'
  }

  function reset(nextCategoryId, nextServiceId) {
    Object.assign(form, initialForm(nextCategoryId, nextServiceId))
    clearErrors()
    statusMessage.value = '表单已重置，未发送或保存任何信息。'
  }

  return {
    clearDynamicFields,
    clearErrors,
    errors,
    form,
    prefill,
    reset,
    statusMessage,
    validate,
  }
}
