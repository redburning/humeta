import { apiClient } from './api/client'
import type { SuggestionItem } from '../types/search'

const MAX_SUGGESTIONS = 8

/**
 * 从后端获取搜索框联想项。
 *
 * 后端会按「精确 > 前缀 > 包含」以及「名称 > 编号」的规则排序，
 * 并把同名代谢物的 Humeta 编号作为上下文候选一起返回。
 */
export async function getSearchSuggestions(
  keyword: string,
  limit = MAX_SUGGESTIONS,
): Promise<SuggestionItem[]> {
  const trimmedKeyword = keyword.trim()
  if (!trimmedKeyword) return []

  return apiClient.get<SuggestionItem[]>('/metabolites/suggestions', {
    params: { keyword: trimmedKeyword, limit },
  })
}
