/**
 * 主题配置
 * - 定义所有可用的主题（每套主题输出一组 CSS 变量值）
 * - 页面通过 var(--bg) / var(--text) 等引用变量
 * - 切换主题由 data-theme 属性选择器完成（在 App.vue 全局样式中定义）
 */

export type ThemeKey = 'light' | 'dark' | 'warm' | 'cool'

/** 单个主题的 CSS 变量集合 */
export interface ThemeVars {
  '--bg': string
  '--bg-alt': string
  '--surface': string
  '--text': string
  '--text-sec': string
  '--border': string
  '--accent': string
  '--accent-sec': string
  '--mask': string
  '--success': string
  '--warning': string
  '--error': string
  '--name': string
}

/** 主题简要信息（用于选择器展示） */
export interface ThemeMeta {
  key: ThemeKey
  name: string
  accent: string
  bg: string
}

/**
 * 主题字典
 * - key 与 ThemeKey 一一对应
 * - 新增主题：在此追加，并在 ThemeKey 中加入对应字符串字面量
 */
export const themes: Record<ThemeKey, ThemeVars> = {
  // 浅色（默认）
  light: {
    '--bg': '#F8F8F8',
    '--bg-alt': '#FFFFFF',
    '--surface': '#FFFFFF',
    '--text': '#1A1A1A',
    '--text-sec': '#8F8F94',
    '--border': '#E5E5EA',
    '--accent': '#007AFF',
    '--accent-sec': '#5856D6',
    '--mask': 'rgba(0, 0, 0, 0.5)',
    '--success': '#34C759',
    '--warning': '#F0AD4E',
    '--error': '#FF3B30',
    '--name': '浅色',
  },

  // 深色
  dark: {
    '--bg': '#000000',
    '--bg-alt': '#1C1C1E',
    '--surface': '#2C2C2E',
    '--text': '#FFFFFF',
    '--text-sec': '#8E8E93',
    '--border': '#38383A',
    '--accent': '#0A84FF',
    '--accent-sec': '#5E5CE6',
    '--mask': 'rgba(0, 0, 0, 0.7)',
    '--success': '#30D158',
    '--warning': '#FF9F0A',
    '--error': '#FF453A',
    '--name': '深色',
  },

  // 暖色
  warm: {
    '--bg': '#FFF8F0',
    '--bg-alt': '#FFEFE0',
    '--surface': '#FFFFFF',
    '--text': '#5C4B37',
    '--text-sec': '#A0826D',
    '--border': '#F0DCC4',
    '--accent': '#E76F51',
    '--accent-sec': '#D4A373',
    '--mask': 'rgba(92, 75, 55, 0.5)',
    '--success': '#588157',
    '--warning': '#E9C46A',
    '--error': '#E63946',
    '--name': '暖色',
  },

  // 冷色
  cool: {
    '--bg': '#EEF2F5',
    '--bg-alt': '#E1E8ED',
    '--surface': '#FFFFFF',
    '--text': '#2C3E50',
    '--text-sec': '#5D6D7E',
    '--border': '#C8D3DC',
    '--accent': '#3498DB',
    '--accent-sec': '#9B59B6',
    '--mask': 'rgba(44, 62, 80, 0.5)',
    '--success': '#27AE60',
    '--warning': '#F39C12',
    '--error': '#E74C3C',
    '--name': '冷色',
  },
}

/** 默认主题 */
export const DEFAULT_THEME: ThemeKey = 'light'

/**
 * 获取主题变量集合
 * - key 非法时返回默认主题
 */
export function getTheme(key: string | null | undefined): ThemeVars {
  if (key && key in themes) return themes[key as ThemeKey]
  return themes[DEFAULT_THEME]
}

/**
 * 获取主题简要信息列表（用于主题选择器展示）
 */
export function getThemeList(): ThemeMeta[] {
  return (Object.keys(themes) as ThemeKey[]).map((key) => ({
    key,
    name: themes[key]['--name'],
    accent: themes[key]['--accent'],
    bg: themes[key]['--bg'],
  }))
}

/** 判断主题 key 是否合法 */
export function isValidTheme(key: string | null | undefined): key is ThemeKey {
  return !!key && key in themes
}

/**
 * 获取下一个主题（用于循环切换）
 */
export function getNextTheme(current: string | null | undefined): ThemeKey {
  const keys = Object.keys(themes) as ThemeKey[]
  const idx = keys.indexOf(current as ThemeKey)
  const next = keys[(idx + 1) % keys.length]
  return next ?? DEFAULT_THEME
}