/**
 * 通用工具函数
 * - debounce / throttle：高频触发场景下的执行控制
 * - deepClone：基于 JSON 的深拷贝（不支持函数 / Date / RegExp / 循环引用）
 * - formatTime / formatDate：时间格式化
 * - isEmpty：空值判断
 */

/* ============ 防抖 / 节流 ============ */

type AnyFn = (...args: any[]) => any

/**
 * 防抖：N ms 内多次调用只执行最后一次。
 */
export function debounce<T extends AnyFn>(fn: T, delay = 300): T {
  let timer: ReturnType<typeof setTimeout> | null = null
  return ((...args: any[]) => {
    if (timer) clearTimeout(timer)
    timer = setTimeout(() => {
      timer = null
      fn(...args)
    }, delay)
  }) as T
}

/**
 * 节流：N ms 内最多执行一次（首次立即执行，后续按 interval 收敛）。
 */
export function throttle<T extends AnyFn>(fn: T, interval = 300): T {
  let last = 0
  let timer: ReturnType<typeof setTimeout> | null = null
  return ((...args: any[]) => {
    const now = Date.now()
    const remaining = interval - (now - last)
    if (remaining <= 0) {
      if (timer) {
        clearTimeout(timer)
        timer = null
      }
      last = now
      fn(...args)
    } else if (!timer) {
      timer = setTimeout(() => {
        last = Date.now()
        timer = null
        fn(...args)
      }, remaining)
    }
  }) as T
}

/* ============ 深拷贝 ============ */

/**
 * 基于 JSON 的深拷贝。
 * 不支持：函数、undefined、Symbol、Date、RegExp、Map、Set、循环引用。
 * 业务对象（纯 JSON 结构）足够使用。
 */
export function deepClone<T>(obj: T): T {
  return JSON.parse(JSON.stringify(obj))
}

/* ============ 时间格式化 ============ */

function pad2(n: number): string {
  return String(n).padStart(2, '0')
}

/**
 * 按 fmt 格式化时间。
 * - date 支持 Date 对象、时间戳（ms）、可解析的字符串
 * - fmt 支持占位符：YYYY / MM / DD / HH / mm / ss
 * - 默认 'YYYY-MM-DD HH:mm:ss'
 * - 无效 date 返回 ''
 */
export function formatTime(
  date: Date | number | string,
  fmt = 'YYYY-MM-DD HH:mm:ss',
): string {
  const d = date instanceof Date ? date : new Date(date)
  if (Number.isNaN(d.getTime())) return ''

  const map: Record<string, string> = {
    YYYY: String(d.getFullYear()),
    MM: pad2(d.getMonth() + 1),
    DD: pad2(d.getDate()),
    HH: pad2(d.getHours()),
    mm: pad2(d.getMinutes()),
    ss: pad2(d.getSeconds()),
  }
  return fmt.replace(/YYYY|MM|DD|HH|mm|ss/g, (m) => map[m] ?? m)
}

/** 仅日期 YYYY-MM-DD */
export function formatDate(date: Date | number | string): string {
  return formatTime(date, 'YYYY-MM-DD')
}

/* ============ 空值判断 ============ */

/**
 * 空值判断：
 * - null / undefined / '' / [] / {} 返回 true
 * - 数字 0、布尔 false 不视为空
 */
export function isEmpty(value: unknown): boolean {
  if (value === null || value === undefined) return true
  if (typeof value === 'string') return value.length === 0
  if (Array.isArray(value)) return value.length === 0
  if (typeof value === 'object') return Object.keys(value).length === 0
  return false
}

/* ============ 命名空间入口 ============ */

export const helpers = {
  debounce,
  throttle,
  deepClone,
  formatTime,
  formatDate,
  isEmpty,
}
