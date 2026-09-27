/**
 * 全局配置
 * - 所有全局常量统一在此定义，业务代码通过 @/config 引用
 * - 主题相关配置见 @/config/theme
 */

/** 应用版本号（与 manifest.json 的 versionName 保持一致） */
export const VERSION = '1.0.0'

/** 后端服务地址 */
export const BASE_URL = 'http://127.0.0.1:18001'

/** 默认请求超时（毫秒） */
export const TIMEOUT = 15000

/** 业务成功码：后端约定 code === 0 表示成功 */
export const SUCCESS_CODE = 0

/** 鉴权 token 在 storage 中的 key */
export const TOKEN_KEY = '_DATA_'

/** 平台 id（后端 platform_id）：微信小程序 = 1 */
export const WX_PLATFORM_ID = 1

/** 上传/下载默认超时（毫秒，相对较长） */
export const UPLOAD_TIMEOUT = 60000
export const DOWNLOAD_TIMEOUT = 60000
