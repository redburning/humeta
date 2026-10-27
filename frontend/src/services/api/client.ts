import axios from 'axios'
import type { AxiosRequestConfig } from 'axios'

/**
 * 后端统一响应结构：{ code, msg?, data? }
 */
export interface ApiResult<T> {
  code: number
  msg?: string
  data?: T
}

export class ApiError extends Error {
  readonly code: number

  constructor(message: string, code: number) {
    super(message)
    this.name = 'ApiError'
    this.code = code
  }
}

const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL as string | undefined) ?? '/api'

const http = axios.create({
  baseURL: API_BASE_URL,
  timeout: 20000,
  headers: { Accept: 'application/json' },
})

function isApiResult<T>(payload: unknown): payload is ApiResult<T> {
  return typeof payload === 'object' && payload !== null && 'code' in payload
}

function unwrap<T>(payload: unknown): T {
  if (!isApiResult<T>(payload)) return payload as T

  if (payload.code !== 200) {
    throw new ApiError(payload.msg ?? 'Request failed', payload.code)
  }
  return payload.data as T
}

async function request<T>(config: AxiosRequestConfig): Promise<T> {
  try {
    const response = await http.request<unknown>(config)
    return unwrap<T>(response.data)
  } catch (error) {
    if (error instanceof ApiError) throw error
    if (axios.isAxiosError(error)) {
      const payload = error.response?.data
      const message = isApiResult<unknown>(payload) && payload.msg
        ? payload.msg
        : error.message
      throw new ApiError(message, error.response?.status ?? 0)
    }
    throw error
  }
}

export const apiClient = {
  get<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
    return request<T>({ ...config, method: 'GET', url })
  },
  post<T>(url: string, data?: unknown, config?: AxiosRequestConfig): Promise<T> {
    return request<T>({ ...config, method: 'POST', url, data })
  },
}
