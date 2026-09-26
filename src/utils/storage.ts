/**
 * Storage 统一封装
 * - 基于 uni.getStorageSync / setStorageSync（同步，小程序端兼容性好）
 * - JSON 序列化由 uni 内部完成（对象自动 stringify/parse）
 * - 异常安全：读写失败不影响主流程
 * - get 支持默认值
 */

/**
 * 读取存储项。
 * - key 不存在 / 值为空时返回 defaultValue
 * - 读取失败时返回 defaultValue
 */
export function getStorage<T>(key: string, defaultValue?: T): T | undefined {
  try {
    const raw = uni.getStorageSync(key)
    if (raw === '' || raw === null || raw === undefined) return defaultValue
    return raw as T
  } catch {
    return defaultValue
  }
}

/**
 * 写入存储项。返回是否成功。
 */
export function setStorage<T>(key: string, value: T): boolean {
  try {
    uni.setStorageSync(key, value as unknown as string | object)
    return true
  } catch {
    return false
  }
}

/**
 * 删除指定 key。返回是否成功。
 */
export function removeStorage(key: string): boolean {
  try {
    uni.removeStorageSync(key)
    return true
  } catch {
    return false
  }
}

/**
 * 清空所有存储。返回是否成功。
 */
export function clearStorage(): boolean {
  try {
    uni.clearStorageSync()
    return true
  } catch {
    return false
  }
}

/** 统一命名空间入口：推荐使用 storage.get/set 这种调用方式 */
export const storage = {
  get: getStorage,
  set: setStorage,
  remove: removeStorage,
  clear: clearStorage,
}
