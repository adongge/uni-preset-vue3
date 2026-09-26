/**
 * HTTP 统一入口
 * - 基于 uni.request 封装，跨端统一
 * - 默认注入 token、错误自动 toast
 * - 提供 get/post/put/delete 便捷方法
 */

import { useToast } from '@/composables/useToast'
import {
  BASE_URL,
  SUCCESS_CODE,
  TIMEOUT,
} from './config'
import { requestInterceptors, responseInterceptors } from './interceptors'
import { download, upload } from './upload'
import type {
  HttpMethod,
  HttpResponse,
  RequestOptions,
} from './types'

/* ============ 内部工具 ============ */

/**
 * GET 参数序列化到 URL 上。
 * - null/undefined 跳过
 * - 数组重复键：a=1&a=2
 * - 普通值 encodeURIComponent
 */
function buildQuery(url: string, params?: Record<string, unknown>): string {
  if (!params || Object.keys(params).length === 0) return url
  const parts: string[] = []
  Object.entries(params).forEach(([k, v]) => {
    if (v === undefined || v === null) return
    if (Array.isArray(v)) {
      v.forEach((item) => parts.push(`${encodeURIComponent(k)}=${encodeURIComponent(String(item))}`))
    } else {
      parts.push(`${encodeURIComponent(k)}=${encodeURIComponent(String(v))}`)
    }
  })
  if (parts.length === 0) return url
  return url + (url.includes('?') ? '&' : '?') + parts.join('&')
}

/**
 * 把 url 中可能遗漏的 baseURL 前缀补齐。
 * 支持传入完整 http(s) 的 url（不走 BASE_URL）。
 */
function resolveUrl(url: string): string {
  if (/^https?:\/\//i.test(url)) return url
  return BASE_URL + (url.startsWith('/') ? url : '/' + url)
}

/* ============ 错误信息归一化 ============ */

function resolveErrorMessage(statusCode: number, raw: unknown): string {
  if (!statusCode) return '网络异常，请检查网络后重试'
  if (statusCode >= 500) return '服务器异常，请稍后重试'
  if (statusCode === 401) return '登录已过期，请重新登录'
  if (statusCode === 403) return '没有访问权限'
  if (statusCode === 404) return '请求的资源不存在'
  if (statusCode >= 400) return `请求失败 (${statusCode})`

  // 业务错误：尽量取后端 msg
  if (raw && typeof raw === 'object') {
    const m = (raw as Record<string, unknown>).msg
    if (typeof m === 'string' && m.trim()) return m
  }
  if (typeof raw === 'string' && raw.trim()) return raw
  return '请求失败'
}

/* ============ 核心 request ============ */

export interface RequestParams {
  method: HttpMethod
  url: string
  data?: unknown
  options?: RequestOptions
}

/**
 * 统一请求方法。
 * - 默认自动 toast 错误
 * - 默认解包 data，返回业务数据
 * - options.raw=true 时返回完整 HttpResponse
 */
export async function request<T = unknown>({
  method,
  url,
  data,
  options = {},
}: RequestParams): Promise<T> {
  const showError = options.showError ?? true
  const showLoading = options.showLoading ?? false
  const loadingText = options.loadingText ?? '加载中...'
  const timeout = options.timeout ?? TIMEOUT
  const isRaw = options.raw === true

  const toast = useToast()
  if (showLoading) toast.loading(loadingText)

  // 1. 拼接最终 URL（GET 拼接 query，其它原样）
  const finalUrl = method === 'GET'
    ? buildQuery(resolveUrl(url), data as Record<string, unknown> | undefined)
    : resolveUrl(url)

  // 2. 默认 header
  const header: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers ?? {}),
  }

  // 3. 执行请求拦截器
  try {
    for (const fn of requestInterceptors) {
      const result = await fn({ url: finalUrl, method, header, data })
      if (result === false) {
        if (showLoading) toast.hide()
        throw new Error('请求被拦截器中止')
      }
      if (result) Object.assign(header, result)
    }
  } catch (err) {
    if (showLoading) toast.hide()
    throw err
  }

  // 4. 调用 uni.request
  let res: UniApp.RequestSuccessCallbackResult
  try {
    res = await new Promise<UniApp.RequestSuccessCallbackResult>((resolve, reject) => {
      uni.request({
        url: finalUrl,
        method,
        header,
        data: method === 'GET' ? undefined : (data as string | object | undefined),
        timeout,
        success: (r) => resolve(r),
        fail: (e) => reject(e),
      })
    })
  } catch (err) {
    // 网络层错误（连不上、超时、DNS 等）：fail 回调直接抛出会绕过后续处理
    if (showLoading) toast.hide()
    const failErr = err as { errMsg?: string }
    const message = failErr.errMsg || '网络异常，请检查网络后重试'
    if (showError) toast.error(message)
    const wrapped = new Error(message) as Error & { statusCode: number; raw: unknown }
    wrapped.statusCode = 0
    wrapped.raw = failErr
    throw wrapped
  }

  if (showLoading) toast.hide()

  // 5. HTTP 状态码非 2xx → 错误
  if (res.statusCode < 200 || res.statusCode >= 300) {
    const message = resolveErrorMessage(res.statusCode, res.data)
    if (showError) toast.error(message)
    const err = new Error(message)
    ;(err as Error & { statusCode: number; raw: unknown }).statusCode = res.statusCode
    ;(err as Error & { statusCode: number; raw: unknown }).raw = res.data
    throw err
  }

  // 6. 业务码判断
  const body = res.data as HttpResponse<T> | T
  const isWrapped = body !== null
    && typeof body === 'object'
    && 'code' in (body as Record<string, unknown>)
    && 'msg' in (body as Record<string, unknown>)

  if (isWrapped) {
    const wrapped = body as HttpResponse<T>
    if (wrapped.code !== SUCCESS_CODE) {
      const message = wrapped.msg || resolveErrorMessage(res.statusCode, wrapped)
      // 触发响应拦截器（供业务方扩展：如 401 跳转登录）
      let handled = false
      for (const fn of responseInterceptors) {
        const r = await fn({ statusCode: res.statusCode, message, raw: wrapped })
        if (r === true) {
          handled = true
          break
        }
      }
      if (showError && !handled) toast.error(message)
      const err = new Error(message)
      ;(err as Error & { code: number; raw: unknown }).code = wrapped.code
      ;(err as Error & { code: number; raw: unknown }).raw = wrapped
      throw err
    }
    return isRaw ? (wrapped as unknown as T) : wrapped.data
  }

  // 非包装响应：直接返回
  return (isRaw ? (res.data as unknown as T) : (res.data as T))
}

/* ============ 便捷方法 ============ */

export function get<T = unknown>(
  url: string,
  params?: Record<string, unknown>,
  options?: RequestOptions,
): Promise<T> {
  return request<T>({ method: 'GET', url, data: params, options })
}

export function post<T = unknown>(
  url: string,
  data?: unknown,
  options?: RequestOptions,
): Promise<T> {
  return request<T>({ method: 'POST', url, data, options })
}

export function put<T = unknown>(
  url: string,
  data?: unknown,
  options?: RequestOptions,
): Promise<T> {
  return request<T>({ method: 'PUT', url, data, options })
}

export function del<T = unknown>(
  url: string,
  params?: Record<string, unknown>,
  options?: RequestOptions,
): Promise<T> {
  return request<T>({ method: 'DELETE', url, data: params, options })
}

/* ============ 重导出 ============ */

export { BASE_URL, TIMEOUT, SUCCESS_CODE, TOKEN_KEY } from './config'
export { requestInterceptors, responseInterceptors } from './interceptors'
export { upload, download } from './upload'
export type {
  HttpResponse,
  RequestOptions,
  UploadOptions,
  DownloadOptions,
  UploadResult,
  DownloadResult,
} from './types'

/** 统一命名空间入口：推荐使用 http.get/post/... 这种调用方式 */
export const http = {
  request,
  get,
  post,
  put,
  del,
  upload,
  download,
}