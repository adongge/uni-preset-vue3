import { defineStore } from 'pinia'
import { ref } from 'vue'
import { storage } from '@/utils/storage'
import { DEFAULT_THEME, isValidTheme, getNextTheme, type ThemeKey } from '@/config/theme'

/** 主题在 storage 中的 key */
export const THEME_STORAGE_KEY = 'APP_THEME'

/**
 * 主题状态 store
 * - currentTheme：当前主题 key
 * - init()：从 storage 恢复（App.onLaunch 中调用）
 * - setTheme(key)：设置主题 + 持久化
 * - toggleTheme()：循环切换到下一个主题
 */
export const useThemeStore = defineStore('theme', () => {
  const currentTheme = ref<ThemeKey>(DEFAULT_THEME)

  /**
   * 从 storage 恢复主题。非法或缺失时回退为默认主题。
   * 应在 App.vue 的 onLaunch 中调用一次。
   */
  function init() {
    const stored = storage.get<string>(THEME_STORAGE_KEY)
    currentTheme.value = isValidTheme(stored) ? stored : DEFAULT_THEME
  }

  /**
   * 设置主题。非法 key 会被忽略。
   */
  function setTheme(key: string) {
    if (!isValidTheme(key)) return
    currentTheme.value = key
    storage.set(THEME_STORAGE_KEY, key)
  }

  /**
   * 切换到下一个主题（按 themes 字典顺序循环）。
   * 返回切换后的主题 key。
   */
  function toggleTheme(): ThemeKey {
    const next = getNextTheme(currentTheme.value)
    setTheme(next)
    return next
  }

  return {
    currentTheme,
    init,
    setTheme,
    toggleTheme,
  }
})