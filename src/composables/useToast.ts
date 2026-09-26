import { reactive } from 'vue'

/**
 * 弹窗模式
 * - toast:   轻提示，自动消失（队列）
 * - alert:   单按钮弹窗（Promise）
 * - confirm: 确认/取消弹窗（Promise<boolean>）
 * - loading: 加载中（覆盖式）
 */
export type ToastMode = 'toast' | 'alert' | 'confirm' | 'loading'

export interface ToastState {
  visible: boolean
  mode: ToastMode
  title: string
  content: string
  showCancel: boolean
  confirmText: string
  cancelText: string
  maskClickClose: boolean
  /** alert/confirm 模式下用于 resolve 结果；外部不应直接使用 */
  _resolve: ((value?: any) => void) | null
}

export interface ToastOptions {
  title?: string
  confirmText?: string
  cancelText?: string
  showCancel?: boolean
  maskClickClose?: boolean
}

interface ToastItem {
  content: string
  duration: number
}

interface ToastBundle {
  state: ToastState
  queue: ToastItem[]
  timer: ReturnType<typeof setTimeout> | null
}

const KEY = '__uniapp_toast__'

/**
 * 通过 globalThis 缓存整个 bundle，确保无论 useToast.ts 模块被加载多少次，
 * 都拿到同一份 state/queue/timer（解决 mp-weixin 编译下多模块实例问题）。
 */
function getBundle(): ToastBundle {
  const g = globalThis as unknown as Record<string, ToastBundle | undefined>
  if (!g[KEY]) {
    g[KEY] = {
      state: reactive<ToastState>({
        visible: false,
        mode: 'toast',
        title: '',
        content: '',
        showCancel: false,
        confirmText: '确定',
        cancelText: '取消',
        maskClickClose: false,
        _resolve: null,
      }),
      queue: [],
      timer: null,
    }
  }
  return g[KEY]!
}

/** 模块级单例状态，供 toast.vue 组件直接引用 */
export const toastState = getBundle().state

// ============ toast 队列 ============

function clearToastTimer() {
  const b = getBundle()
  if (b.timer) {
    clearTimeout(b.timer)
    b.timer = null
  }
}

function clearToastQueue() {
  getBundle().queue.length = 0
  clearToastTimer()
}

/**
 * 显示队列中的下一个 toast。
 * 队列空且当前为 toast 模式时，关闭弹窗。
 */
function showNextToast() {
  clearToastTimer()
  const b = getBundle()
  if (b.queue.length === 0) {
    if (toastState.mode === 'toast') {
      toastState.visible = false
    }
    return
  }
  const item = b.queue.shift()!
  toastState.mode = 'toast'
  toastState.content = item.content
  toastState.title = ''
  toastState.showCancel = false
  toastState.maskClickClose = false
  toastState.visible = true
  b.timer = setTimeout(() => {
    showNextToast()
  }, item.duration)
}

/**
 * 把 toast 加入队列。
 * - 当前无显示：立即开始
 * - 当前是 toast 模式：等待当前 toast 结束自动切换
 * - 当前是 alert/confirm/loading：等待其关闭后由 hide() 触发
 */
function pushToast(content: string, duration: number) {
  const b = getBundle()
  b.queue.push({ content, duration })
  if (!toastState.visible) {
    showNextToast()
  }
}

// ============ API 实现 ============

function show(content: string, options: { duration?: number } = {}) {
  pushToast(content, options.duration ?? 2000)
}

function success(content: string, options: { duration?: number } = {}) {
  pushToast('✓ ' + content, options.duration ?? 2000)
}

function error(content: string, options: { duration?: number } = {}) {
  pushToast('✗ ' + content, options.duration ?? 2000)
}

function alert(content: string, options: ToastOptions = {}): Promise<boolean> {
  return new Promise((resolve) => {
    clearToastQueue()
    // 打断上一个未完成的 Promise（避免泄漏）
    if (toastState._resolve) {
      toastState._resolve(undefined)
      toastState._resolve = null
    }
    toastState.mode = 'alert'
    toastState.content = content
    toastState.title = options.title ?? ''
    toastState.confirmText = options.confirmText ?? '确定'
    toastState.cancelText = options.cancelText ?? '取消'
    toastState.showCancel = false
    toastState.maskClickClose = options.maskClickClose ?? false
    toastState._resolve = resolve
    toastState.visible = true
  })
}

function confirm(content: string, options: ToastOptions = {}): Promise<boolean> {
  return new Promise((resolve) => {
    clearToastQueue()
    if (toastState._resolve) {
      toastState._resolve(undefined)
      toastState._resolve = null
    }
    toastState.mode = 'confirm'
    toastState.content = content
    toastState.title = options.title ?? ''
    toastState.confirmText = options.confirmText ?? '确定'
    toastState.cancelText = options.cancelText ?? '取消'
    toastState.showCancel = options.showCancel ?? true
    toastState.maskClickClose = options.maskClickClose ?? false
    toastState._resolve = resolve
    toastState.visible = true
  })
}

function loading(content: string = '加载中...') {
  clearToastQueue()
  // 打断上一个未完成的 Promise
  if (toastState._resolve) {
    toastState._resolve(undefined)
    toastState._resolve = null
  }
  toastState.mode = 'loading'
  toastState.content = content
  toastState.title = ''
  toastState.showCancel = false
  toastState.maskClickClose = false
  toastState._resolve = null
  toastState.visible = true
}

/**
 * 隐藏当前弹窗。
 * - alert/confirm: 若有未 resolve 的 Promise，以 undefined resolve
 * - loading: 直接关闭
 * - toast 队列中若有剩余，自动继续显示
 */
function hide() {
  const pendingResolve = toastState._resolve
  toastState._resolve = null
  toastState.visible = false
  if (pendingResolve) {
    pendingResolve(undefined)
  }
  // 若队列中还有，自动显示下一个
  if (getBundle().queue.length > 0) {
    showNextToast()
  }
}

export function useToast() {
  return {
    show,
    success,
    error,
    alert,
    confirm,
    loading,
    hide,
  }
}