/**
 * HTTP 配置
 * 通过修改此文件中的常量来调整默认行为
 */

/** 后端服务地址 */
export const BASE_URL = 'http://127.0.0.1:18001'

/** 默认请求超时（毫秒） */
export const TIMEOUT = 15000

/** 业务成功码：后端约定 code === 0 表示成功 */
export const SUCCESS_CODE = 0

/** 鉴权 token 在 storage 中的 key */
export const TOKEN_KEY = '_DATA_'

/** 上传/下载默认超时（毫秒，相对较长） */
export const UPLOAD_TIMEOUT = 60000
export const DOWNLOAD_TIMEOUT = 60000