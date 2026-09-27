/**
 * HTTP 拦截器
 * - requestInterceptors：请求发出前调用，可修改 header 或返回 false 中断请求
 * - responseInterceptors：业务/网络错误时调用，返回 true 表示已处理
 *
 * 默认注册两个：
 * 1. 请求拦截：自动从 storage 读取 token，注入 Authorization 头
 * 2. 响应拦截：占位（toast 由 request 主流程统一处理，避免重复）
 */

import { storage } from '@/utils/storage'
import { TOKEN_KEY } from '@/config'
import type { RequestInterceptorFn, ResponseInterceptorFn } from './types'

export const requestInterceptors: RequestInterceptorFn[] = []

export const responseInterceptors: ResponseInterceptorFn[] = []

/* ============ 默认请求拦截器：注入 token ============ */

requestInterceptors.push((ctx) => {
  const token = storage.get<string>(TOKEN_KEY)
  if (token) {
    ctx.header['Authorization'] = `Bearer ${token}`
  }
})