import { defineStore } from 'pinia'
import { ref } from 'vue'

/** 安全区（来自 uni.getSystemInfoSync 的 safeArea 字段） */
export interface SafeArea {
  top: number
  bottom: number
  left: number
  right: number
}

/** uni.getNetworkType 返回值归一化后的网络类型 */
export type NetworkType = 'unknown' | 'none' | 'wifi' | '2g' | '3g' | '4g' | '5g'

/**
 * 全局 UI 状态 store
 * - 状态栏高度 / 安全区 / 网络类型
 * - 调用 init() 从 uni 系统 API 同步读取（小程序端兼容性好）
 * - 网络类型变化是异步的，业务方可在 onLaunch 里监听 uni.onNetworkStatusChange 后调 setNetworkType
 */
export const useAppStore = defineStore('app', () => {
  const statusBarHeight = ref(0)
  const safeArea = ref<SafeArea>({ top: 0, bottom: 0, left: 0, right: 0 })
  const networkType = ref<NetworkType>('unknown')
  const initialized = ref(false)

  /**
   * 从 uni.getSystemInfoSync 读取状态栏、安全区。
   * 失败时静默忽略，保持默认值。
   */
  function init() {
    try {
      const sys = uni.getSystemInfoSync()
      statusBarHeight.value = sys.statusBarHeight ?? 0
      const sa = sys.safeArea
      safeArea.value = {
        top: sa?.top ?? 0,
        bottom: sa?.bottom ?? 0,
        left: sa?.left ?? 0,
        right: sa?.right ?? 0,
      }
      initialized.value = true
    } catch {
      /* 读取失败保持默认值 */
    }
  }

  function setStatusBarHeight(h: number) {
    statusBarHeight.value = h
  }

  function setSafeArea(area: SafeArea) {
    safeArea.value = { ...area }
  }

  function setNetworkType(t: NetworkType) {
    networkType.value = t
  }

  return {
    statusBarHeight,
    safeArea,
    networkType,
    initialized,
    init,
    setStatusBarHeight,
    setSafeArea,
    setNetworkType,
  }
})
