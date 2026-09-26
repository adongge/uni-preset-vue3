import { defineStore } from 'pinia'
import { computed, ref } from 'vue'
import { storage } from '@/utils/storage'
import { TOKEN_KEY } from '@/utils/http/config'

/** 用户信息结构（业务字段按需扩展） */
export interface UserInfo {
  id: number | string
  name: string
  avatar?: string
}

/** 用户信息在 storage 中的 key */
const USER_INFO_KEY = 'USER_INFO'

/**
 * 用户状态 store
 * - token / userInfo / isLoggedIn
 * - 持久化：登录后写入 storage，init() 时自动恢复
 * - 退出时清空 storage 与 store
 */
export const useUserStore = defineStore('user', () => {
  const token = ref<string>('')
  const userInfo = ref<UserInfo | null>(null)

  const isLoggedIn = computed(() => !!token.value)

  /**
   * 从 storage 恢复登录态。
   * 应在 App.vue 的 onLaunch 中调用一次。
   */
  function init() {
    const t = storage.get<string>(TOKEN_KEY)
    if (t) token.value = t

    const u = storage.get<UserInfo>(USER_INFO_KEY)
    if (u) userInfo.value = u
  }

  function setToken(t: string) {
    token.value = t
    if (t) storage.set(TOKEN_KEY, t)
    else storage.remove(TOKEN_KEY)
  }

  function setUserInfo(info: UserInfo | null) {
    userInfo.value = info
    if (info) storage.set(USER_INFO_KEY, info)
    else storage.remove(USER_INFO_KEY)
  }

  /**
   * 登录成功：一次性写入 token 与用户信息。
   */
  function loginSuccess(payload: { token: string; userInfo?: UserInfo }) {
    setToken(payload.token)
    if (payload.userInfo) setUserInfo(payload.userInfo)
  }

  /**
   * 退出登录：清空 token 和用户信息。
   */
  function logout() {
    setToken('')
    setUserInfo(null)
  }

  return {
    token,
    userInfo,
    isLoggedIn,
    init,
    setToken,
    setUserInfo,
    loginSuccess,
    logout,
  }
})
