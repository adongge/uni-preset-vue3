/**
 * 文件上传 / 下载
 * - 基于 uni.uploadFile / uni.downloadFile
 * - 自动注入 baseURL、token
 * - 上传返回解析后的业务 data
 * - 下载返回临时文件路径
 *
 * 注意：小程序端 uni.uploadFile / uni.downloadFile 不暴露进度回调，
 * 如需进度条请直接使用原生 API 或扩展本模块。
 */

import { useToast } from '@/composables/useToast'
import {
  BASE_URL,
  DOWNLOAD_TIMEOUT,
  SUCCESS_CODE,
  TOKEN_KEY,
  UPLOAD_TIMEOUT,
} from './config'
import type {
  DownloadOptions,
  DownloadResult,
  HttpResponse,
  UploadOptions,
  UploadResult,
} from './types'

function resolveUrl(url: string): string {
  if (/^https?:\/\//i.test(url)) return url
  return BASE_URL + (url.startsWith('/') ? url : '/' + url)
}

function getToken(): string {
  try {
    return uni.getStorageSync(TOKEN_KEY) || ''
  } catch {
    return ''
  }
}

/* ============ 上传 ============ */

export function upload<T = unknown>(opts: UploadOptions): Promise<UploadResult<T>> {
  const {
    url,
    filePath,
    name = 'file',
    formData,
    header,
    successCode = SUCCESS_CODE,
    showError = true,
    showLoading = true,
    loadingText = '上传中...',
    timeout = UPLOAD_TIMEOUT,
  } = opts

  const toast = useToast()
  if (showLoading) toast.loading(loadingText)

  const finalHeader: Record<string, string> = { ...(header ?? {}) }
  const token = getToken()
  if (token && !finalHeader['Authorization']) {
    finalHeader['Authorization'] = `Bearer ${token}`
  }

  return new Promise<UploadResult<T>>((resolve, reject) => {
    uni.uploadFile({
      url: resolveUrl(url),
      filePath,
      name,
      formData,
      header: finalHeader,
      timeout,
      success: (res) => {
        if (showLoading) toast.hide()
        // 上传成功 → 尝试按业务响应解析
        const rawText = typeof res.data === 'string' ? res.data : ''
        let body: unknown = null
        try {
          body = rawText ? JSON.parse(rawText) : null
        } catch {
          // 非 JSON：直接视为 data
          body = { code: successCode, msg: '', data: rawText as unknown }
        }
        const wrapped = body as HttpResponse<T> | null
        if (wrapped && typeof wrapped === 'object' && 'code' in wrapped) {
          if (wrapped.code !== successCode) {
            const message = wrapped.msg || '上传失败'
            if (showError) toast.error(message)
            const err = new Error(message)
            ;(err as Error & { code: number; raw: unknown }).code = wrapped.code
            ;(err as Error & { code: number; raw: unknown }).raw = wrapped
            reject(err)
            return
          }
          resolve({ data: wrapped.data, rawText, statusCode: res.statusCode })
          return
        }
        // 非包装结构 → 整体视为 data
        resolve({ data: body as T, rawText, statusCode: res.statusCode })
      },
      fail: (err) => {
        if (showLoading) toast.hide()
        const message = err.errMsg || '上传失败'
        if (showError) toast.error(message)
        reject(new Error(message))
      },
    })
  })
}

/* ============ 下载 ============ */

export function download(opts: DownloadOptions): Promise<DownloadResult> {
  const {
    url,
    header,
    showError = true,
    showLoading = true,
    loadingText = '下载中...',
    timeout = DOWNLOAD_TIMEOUT,
  } = opts

  const toast = useToast()
  if (showLoading) toast.loading(loadingText)

  const finalHeader: Record<string, string> = { ...(header ?? {}) }
  const token = getToken()
  if (token && !finalHeader['Authorization']) {
    finalHeader['Authorization'] = `Bearer ${token}`
  }

  return new Promise<DownloadResult>((resolve, reject) => {
    uni.downloadFile({
      url: resolveUrl(url),
      header: finalHeader,
      timeout,
      success: (res) => {
        if (showLoading) toast.hide()
        if (res.statusCode >= 200 && res.statusCode < 300) {
          resolve({ tempFilePath: res.tempFilePath, statusCode: res.statusCode })
        } else {
          const message = `下载失败 (${res.statusCode})`
          if (showError) toast.error(message)
          reject(new Error(message))
        }
      },
      fail: (err) => {
        if (showLoading) toast.hide()
        const message = err.errMsg || '下载失败'
        if (showError) toast.error(message)
        reject(new Error(message))
      },
    })
  })
}