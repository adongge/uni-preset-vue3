import { http } from '@/utils/http'

/* ============ 类型定义 ============ */

/**
 * 用户信息
 * 字段依据后端 /api/user/update 的 UpdateIn 结构推导，待联调按 /api/user/info 实际返回修正
 */
export interface UserInfo {
  id: number
  /** 昵称 */
  nickname?: string
  /** 性别：0 女生，1 男生，2 未知 */
  gender?: number
  /** 出生年份（后端存出生年份用于计算年龄） */
  age?: number
  /** 城市信息 */
  city?: Record<string, unknown>
}

/** 平台 id（后端 platform_id），当前固定为 1 */
export const WX_PLATFORM_ID = 1

/** 微信小程序登录入参 */
export interface WxLoginParams {
  /** uni.login 返回的临时登录凭证 */
  code: string
  /** 平台 id */
  platform_id: number
}

/** 微信小程序登录返回 */
export interface WxLoginResult {
  /** 登录令牌，请求头以 Authorization: Bearer <token> 携带 */
  token: string
  /** 过期时间 */
  expire: number
  /** 用户 id */
  id: number
  /** 是否初始化：0 未初始化，1 已初始化 */
  initialized: number
  /** 用户 AES 密钥 */
  key: string
}

/** 修改用户信息入参 */
export interface UserUpdateParams {
  nickname?: string
  /** 性别：0 女生，1 男生，2 未知 */
  gender?: number
  /** 出生年份 */
  age?: number
  city?: Record<string, unknown>
}

/* ============ 接口定义 ============ */

/** 微信小程序登录：用 uni.login 拿到的 code 换取 token */
export function loginByWxCode(params: WxLoginParams): Promise<WxLoginResult> {
  return http.post<WxLoginResult>('/api/user/login', params)
}

/** 获取当前用户信息 */
export function getUserInfo(): Promise<UserInfo> {
  return http.get<UserInfo>('/api/user/info')
}

/** 修改用户信息 */
export function updateUserInfo(params: UserUpdateParams): Promise<unknown> {
  return http.post<unknown>('/api/user/update', params)
}

/** 获取用户最新 AES key */
export function getLastKey(): Promise<unknown> {
  return http.get<unknown>('/api/user/last_key')
}
