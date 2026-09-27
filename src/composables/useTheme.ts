import { computed } from 'vue'
import {
  getTheme,
  getThemeList,
  type ThemeKey,
  type ThemeVars,
  type ThemeMeta,
} from '@/config/theme'
import { useThemeStore } from '@/stores/theme'

export interface CurrentThemeInfo {
  key: ThemeKey
  name: string
  accent: string
  bg: string
}

/**
 * 主题 Composable
 * - 提供响应式的主题状态与操作 API
 * - 推荐在 setup 中使用：const { currentTheme, themeVars, setTheme } = useTheme()
 */
export function useTheme() {
  const store = useThemeStore()

  /** 当前主题 key（响应式） */
  const currentTheme = computed<ThemeKey>(() => store.currentTheme)

  /** 当前主题的 CSS 变量集合（响应式） */
  const themeVars = computed<ThemeVars>(() => getTheme(currentTheme.value))

  /** 全部主题的简要信息（用于主题选择器） */
  const themeList = computed<ThemeMeta[]>(() => getThemeList())

  /** 当前主题的简要信息 */
  const currentThemeInfo = computed<CurrentThemeInfo>(() => {
    const v = themeVars.value
    return {
      key: currentTheme.value,
      name: v['--name'],
      accent: v['--accent'],
      bg: v['--bg'],
    }
  })

  /** 切换到指定主题（非法 key 静默忽略） */
  function setTheme(key: string) {
    store.setTheme(key)
  }

  /** 循环切换到下一个主题，返回切换后的 key */
  function toggleTheme(): ThemeKey {
    return store.toggleTheme()
  }

  /** 获取当前主题的背景色（用于同步小程序窗口背景） */
  function getBgColor(): string {
    return themeVars.value['--bg']
  }

  /** 同步主题到小程序窗口背景（微信小程序有效） */
  function syncPageBackground() {
    // #ifdef MP-WEIXIN
    const bg = getBgColor()
    uni.setBackgroundColor({
      backgroundColor: bg,
      backgroundColorTop: bg,
      backgroundColorBottom: bg,
    })
    // #endif
  }

  /**
   * 应用主题：将主题相关的运行时副作用同步出去
   * - 微信小程序：同步窗口背景色
   */
  function applyTheme() {
    syncPageBackground()
  }

  return {
    currentTheme,
    themeVars,
    themeList,
    currentThemeInfo,
    setTheme,
    toggleTheme,
    getBgColor,
    syncPageBackground,
    applyTheme,
  }
}