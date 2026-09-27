/**
 * 路由导航工具
 * - 命名空间 navigate：push / replace / switchTab / reLaunch / back
 * - 拦截钩子机制：beforeNavigate(fn) 注册同步钩子，返回 false 中断本次跳转
 * - 钩子按注册顺序执行，任一返回 false 即中断
 * - 注册返回反注册函数，业务方在生命周期结束时清理
 */

/* ============ 类型 ============ */

import { useUserStore } from '@/stores/user'
import { useToast } from '@/composables/useToast'

export type NavType = 'push' | 'replace' | 'switchTab' | 'reLaunch' | 'back'

export interface BeforeNavigateContext {
  type: NavType
  url: string
}

export type BeforeNavigateFn = (ctx: BeforeNavigateContext) => boolean | void

/* ============ 拦截钩子 ============ */

const beforeNavigateHooks: BeforeNavigateFn[] = []

/**
 * 注册导航前拦截钩子。
 * 返回反注册函数，调用即可移除该钩子。
 */
export function beforeNavigate(fn: BeforeNavigateFn): () => void {
  beforeNavigateHooks.push(fn)
  return () => {
    const idx = beforeNavigateHooks.indexOf(fn)
    if (idx >= 0) beforeNavigateHooks.splice(idx, 1)
  }
}

/** 清空所有拦截钩子（仅供测试或重置场景使用） */
export function clearBeforeNavigate(): void {
  beforeNavigateHooks.length = 0
}

function runHooks(ctx: BeforeNavigateContext): boolean {
  for (const hook of beforeNavigateHooks) {
    if (hook(ctx) === false) return false
  }
  return true
}

/* ============ 跳转方法 ============ */

function push(url: string, options?: UniApp.NavigateToOptions) {
  if (!runHooks({ type: 'push', url })) return
  uni.navigateTo({ url, ...options })
}

function replace(url: string, options?: UniApp.RedirectToOptions) {
  if (!runHooks({ type: 'replace', url })) return
  uni.redirectTo({ url, ...options })
}

function switchTab(url: string, options?: UniApp.SwitchTabOptions) {
  if (!runHooks({ type: 'switchTab', url })) return
  uni.switchTab({ url, ...options })
}

function reLaunch(url: string, options?: UniApp.ReLaunchOptions) {
  if (!runHooks({ type: 'reLaunch', url })) return
  uni.reLaunch({ url, ...options })
}

function back(delta = 1) {
  if (!runHooks({ type: 'back', url: '' })) return
  uni.navigateBack({ delta })
}

export const navigate = {
  push,
  replace,
  switchTab,
  reLaunch,
  back,
}

/* ============ 登录守卫 ============ */

/**
 * 不需要登录就能访问的页面路径（精确匹配）。
 * 默认包含所有 demo 页与首页；业务方可调用 addPublicPage 扩展。
 */
const PUBLIC_PAGES = new Set<string>([
  '/pages/index/index',
  '/pages/demo/toast/toast',
  '/pages/demo/network/network',
  '/pages/demo/store/store',
])

/** 注册一个新的公开页（不需要登录） */
export function addPublicPage(url: string): void {
  PUBLIC_PAGES.add(url)
}

/**
 * 注册默认登录守卫钩子：
 * - 未登录时 push 到非公开页 → toast 提示并中断
 * - 仅拦截 push 类型；其它类型由业务方按需处理
 *
 * 应在 createPinia() 之后调用一次（通常在 main.ts 的 createApp 里）。
 */
export function installLoginGuard(): void {
  beforeNavigate((ctx) => {
    if (ctx.type !== 'push') return
    if (PUBLIC_PAGES.has(ctx.url)) return

    const user = useUserStore()
    if (!user.isLoggedIn) {
      useToast().show('请先登录')
      return false
    }
  })
}
