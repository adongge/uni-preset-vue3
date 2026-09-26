import { http } from '@/utils/http'

/* ============ 类型定义 ============ */

export interface UserInfo {
  id: number | string
  name: string
  avatar?: string
}

export interface LoginParams {
  username: string
  password: string
}

export interface LoginResult {
  token: string
  userInfo?: UserInfo
}

/* ============ 接口定义 ============ */

/** 登录 */
export function login(params: LoginParams): Promise<LoginResult> {
  return http.post<LoginResult>('/api/auth/login', params)
}

/** 退出登录 */
export function logout(): Promise<void> {
  return http.post<void>('/api/auth/logout')
}

/** 获取当前用户信息 */
export function getUserInfo(): Promise<UserInfo> {
  return http.get<UserInfo>('/api/user/info')
}
