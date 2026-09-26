/**
 * HTTP 类型定义
 */

/** 后端统一响应结构 */
export interface HttpResponse<T = unknown> {
  code: number
  msg: string
  data: T
}

/** 请求方法 */
export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE'

/** 单次请求可覆盖的配置项 */
export interface RequestOptions {
  /** 额外请求头（会与默认头合并） */
  headers?: Record<string, string>
  /** 是否自动 toast 错误，默认 true */
  showError?: boolean
  /** 是否显示 loading，默认 false */
  showLoading?: boolean
  /** loading 文案 */
  loadingText?: string
  /** 超时毫秒数 */
  timeout?: number
  /** 原始响应（不解包 data），用于特殊场景 */
  raw?: boolean
}

/** 错误回调上下文（供拦截器使用） */
export interface HttpErrorContext {
  /** HTTP 状态码（业务异常时可能为 200） */
  statusCode: number
  /** 错误信息（业务 msg 或网络错误描述） */
  message: string
  /** 原始响应体 */
  raw?: unknown
}

/** 上传参数（基于 uni.uploadFile） */
export interface UploadOptions {
  /** 服务端接口地址（不含 baseURL） */
  url: string
  /** 要上传的文件路径 */
  filePath: string
  /** formData 字段名，默认 'file' */
  name?: string
  /** 附加表单字段 */
  formData?: Record<string, string>
  /** 额外请求头 */
  header?: Record<string, string>
  /** 业务成功码，默认 0 */
  successCode?: number
  /** 是否自动 toast 错误，默认 true */
  showError?: boolean
  /** 是否显示 loading，默认 true */
  showLoading?: boolean
  /** loading 文案 */
  loadingText?: string
  /** 上传超时（毫秒），默认 60000 */
  timeout?: number
}

/** 下载参数（基于 uni.downloadFile） */
export interface DownloadOptions {
  /** 文件地址（不含 baseURL） */
  url: string
  /** 额外请求头 */
  header?: Record<string, string>
  /** 是否自动 toast 错误，默认 true */
  showError?: boolean
  /** 是否显示 loading，默认 true */
  showLoading?: boolean
  /** loading 文案 */
  loadingText?: string
  /** 下载超时（毫秒），默认 60000 */
  timeout?: number
}

/** 上传最终返回结构（已解包业务 data） */
export interface UploadResult<T = unknown> {
  /** 业务 data */
  data: T
  /** 后端原始字符串响应 */
  rawText: string
  /** HTTP 状态码 */
  statusCode: number
}

/** 下载返回 */
export interface DownloadResult {
  /** 临时文件路径 */
  tempFilePath: string
  /** HTTP 状态码 */
  statusCode: number
}

/** 拦截器签名（实现见 interceptors.ts） */
export type RequestInterceptorFn = (
  ctx: { url: string; method: string; header: Record<string, string>; data: unknown },
) => Record<string, string> | false | void | Promise<Record<string, string> | false | void>

export type ResponseInterceptorFn = (
  ctx: HttpErrorContext,
) => boolean | void | Promise<boolean | void>