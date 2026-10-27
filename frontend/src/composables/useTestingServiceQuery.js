import { computed, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import {
  findTestingCategory,
  findTestingService,
  testingServiceCategories,
} from '../data/testingServiceData'

const DEFAULT_CATEGORY = 'research'
const DEFAULT_SERVICE = '4a1800'

function scalarQueryValue(value) {
  return typeof value === 'string' ? value : ''
}

export function useTestingServiceQuery() {
  const route = useRoute()
  const router = useRouter()
  const categoryId = ref(DEFAULT_CATEGORY)
  const serviceId = ref(DEFAULT_SERVICE)

  const activeCategory = computed(() => (
    findTestingCategory(categoryId.value) || testingServiceCategories[0]
  ))
  const activeService = computed(() => (
    findTestingService(categoryId.value, serviceId.value) || activeCategory.value.services[0]
  ))

  function normalizedSelection(query) {
    const requestedCategory = scalarQueryValue(query.category)
    const category = findTestingCategory(requestedCategory) || testingServiceCategories[0]
    const requestedService = scalarQueryValue(query.service)
    const service = category.services.find((item) => item.id === requestedService) || category.services[0]
    return { category: category.id, service: service.id }
  }

  function replaceInvalidQuery(query, normalized) {
    if (query.category === normalized.category && query.service === normalized.service) return

    return router.replace({
      path: route.path,
      query: {
        ...query,
        category: normalized.category,
        service: normalized.service,
      },
      hash: route.hash,
    })
  }

  function selectCategory(nextCategoryId) {
    const category = findTestingCategory(nextCategoryId)
    if (!category || category.id === categoryId.value) return

    return router.push({
      path: route.path,
      query: {
        ...route.query,
        category: category.id,
        service: category.services[0].id,
      },
      hash: route.hash,
    })
  }

  function selectService(nextServiceId) {
    const service = activeCategory.value.services.find((item) => item.id === nextServiceId)
    if (!service || service.id === serviceId.value) return

    return router.push({
      path: route.path,
      query: {
        ...route.query,
        category: activeCategory.value.id,
        service: service.id,
      },
      hash: route.hash,
    })
  }

  function selectSelection(nextCategoryId, nextServiceId) {
    const category = findTestingCategory(nextCategoryId)
    const service = findTestingService(nextCategoryId, nextServiceId)
    if (!category || !service) return
    if (category.id === categoryId.value && service.id === serviceId.value) return

    return router.push({
      path: route.path,
      query: {
        ...route.query,
        category: category.id,
        service: service.id,
      },
      hash: route.hash,
    })
  }

  watch(
    () => route.query,
    (query) => {
      const normalized = normalizedSelection(query)
      categoryId.value = normalized.category
      serviceId.value = normalized.service
      replaceInvalidQuery(query, normalized)
    },
    { immediate: true },
  )

  return {
    activeCategory,
    activeService,
    categoryId,
    serviceId,
    selectCategory,
    selectSelection,
    selectService,
  }
}
