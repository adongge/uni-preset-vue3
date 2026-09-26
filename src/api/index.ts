/**
 * API 统一入口
 * 用法：import { api } from '@/api'
 *      api.user.login({ ... })
 *
 * 新增业务模块时：
 *   1. 在 api/ 下新建文件（如 order.ts）并 export 函数与类型
 *   2. 在此处 import * as xxx from './xxx'，再加入 api 对象
 */

import * as user from './user'

export const api = {
  user,
}
