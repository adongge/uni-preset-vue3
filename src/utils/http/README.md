# src/utils/http

> 基于 `uni.request` 封装的统一 HTTP 请求工具，支持基础请求、文件上传/下载、拦截器、自动错误提示。

## 目录

- [概览](#概览)
- [文件清单](#文件清单)
- [公共 API 速查](#公共-api-速查)
- [快速开始](#快速开始)
- [基础请求](#基础请求)
- [配置项](#配置项-requestoptions)
- [文件上传](#文件上传)
- [文件下载](#文件下载)
- [拦截器](#拦截器)
- [错误处理](#错误处理)
- [配置常量](#配置常量)
- [完整示例](#完整示例)

## 概览

- **位置**：`src/utils/http/`
- **依赖**：`@/composables/useToast`（错误/loading 提示）、`uni.*` 原生 API
- **设计**：零运行时依赖，跨端统一（小程序 / H5 / APP）
- **业务约定**：响应结构 `{ code, msg, data }`，业务成功码 `0`
- **页面集成前提**：需要在页面根用 `<popup-host>` 包裹内容（详见 `src/components/popup-host/`），否则 toast/loading 不渲染。HTTP 模块的自动错误提示依赖于此。

## 文件清单

| 文件 | 职责 |
|---|---|
| `index.ts` | 主入口，导出 `request`/`get`/`post`/`put`/`del`/`upload`/`download` 与 `http` 命名空间对象 |
| `config.ts` | 配置常量（BASE_URL、TIMEOUT、SUCCESS_CODE、TOKEN_KEY、超时） |
| `types.ts` | 全部类型定义（HttpResponse、RequestOptions、UploadOptions、DownloadOptions 等） |
| `interceptors.ts` | 请求/响应拦截器注册表与默认拦截器（自动注入 token） |
| `upload.ts` | `upload` / `download` 函数实现 |

## 公共 API 速查

### `http.*` 命名空间（推荐）

```ts
import { http } from '@/utils/http'

http.get<T>(url, params?, options?)
http.post<T>(url, data?, options?)
http.put<T>(url, data?, options?)
http.del<T>(url, params?, options?)
http.request<T>({ method, url, data, options })
http.upload<T>(opts)
http.download(opts)
```

### 具名导出

```ts
import {
  request, get, post, put, del,    // 基础方法
  upload, download,                // 文件
  http,                            // 命名空间对象
  requestInterceptors,             // 请求拦截器数组（可 push 自定义拦截器）
  responseInterceptors,            // 响应拦截器数组
  BASE_URL, TIMEOUT, SUCCESS_CODE, TOKEN_KEY,  // 配置常量
} from '@/utils/http'
```

## 快速开始

```ts
import { http } from '@/utils/http'

const user = await http.get<User>('/api/users/1')
```

## 基础请求

```ts
// GET（query 自动拼接到 URL）
const list = await http.get<User[]>('/api/users', { page: 1, size: 20 })

// POST / PUT
await http.post('/api/login', { username, password })
await http.put('/api/users/1', { name: '张三' })

// DELETE
await http.del('/api/users/1')

// 泛型：返回值自动推断
const user = await http.get<User>('/api/users/1')
user.name  // 类型安全
```

## 配置项（RequestOptions）

```ts
await http.get('/x', params, {
  showError: false,    // 关闭自动错误 toast，默认 true
  showLoading: true,   // 自动显示 loading，默认 false
  loadingText: '加载中...',
  timeout: 5000,       // 覆盖默认超时
  headers: { 'X-Custom': '1' },
  raw: true,           // 返回完整响应 {code,msg,data} 而非解包 data
})
```

| 字段 | 类型 | 默认 | 说明 |
|---|---|---|---|
| `headers` | `Record<string, string>` | — | 合并到默认 header |
| `showError` | `boolean` | `true` | 失败时是否自动 toast |
| `showLoading` | `boolean` | `false` | 是否显示 loading |
| `loadingText` | `string` | `'加载中...'` | loading 文案 |
| `timeout` | `number` | `15000` | 超时毫秒 |
| `raw` | `boolean` | `false` | true 时不解包 data |

## 文件上传

```ts
// 1. 选文件
const { tempFilePaths } = await uni.chooseImage({ count: 1 })

// 2. 上传
const res = await http.upload<{ url: string }>({
  url: '/api/upload',
  filePath: tempFilePaths[0],
  name: 'file',                              // formData 字段名
  formData: { biz: 'avatar' },               // 附加表单字段
  showLoading: true,
  loadingText: '上传中...',
})

console.log(res.data)        // 已解包的业务 data
console.log(res.statusCode)  // HTTP 状态码
```

| 字段 | 类型 | 默认 | 说明 |
|---|---|---|---|
| `url` | `string` | 必填 | 接口地址（不含 BASE_URL） |
| `filePath` | `string` | 必填 | 要上传的文件路径 |
| `name` | `string` | `'file'` | formData 字段名 |
| `formData` | `Record<string, string>` | — | 附加表单字段 |
| `header` | `Record<string, string>` | — | 额外 header（自动注入 token） |
| `successCode` | `number` | `0` | 业务成功码 |
| `showError` | `boolean` | `true` | 失败时自动 toast |
| `showLoading` | `boolean` | `true` | 显示 loading |
| `loadingText` | `string` | `'上传中...'` | loading 文案 |
| `timeout` | `number` | `60000` | 上传超时 |

## 文件下载

```ts
const { tempFilePath, statusCode } = await http.download({
  url: 'https://example.com/a.pdf',
  showLoading: true,
  loadingText: '下载中...',
})

// 可配合 uni.saveFile 持久化
// await uni.saveFile({ tempFilePath })
```

## 拦截器

模块默认注册了一个请求拦截器：从 `storage.get(TOKEN_KEY)` 读取 token，注入 `Authorization: Bearer xxx`。

### 自定义请求拦截器

```ts
import { requestInterceptors } from '@/utils/http'

// 追加；返回对象会合并到 header；返回 false 中断请求
requestInterceptors.push((ctx) => {
  ctx.header['X-Trace-Id'] = generateTraceId()
  // return false  // 中断
})
```

### 自定义响应拦截器

```ts
import { responseInterceptors } from '@/utils/http'

// 业务错误处理：返回 true 表示已处理，跳过默认 toast
responseInterceptors.push(({ statusCode, message }) => {
  if (statusCode === 401) {
    storage.remove(TOKEN_KEY)
    uni.reLaunch({ url: '/pages/login/login' })
    return true
  }
})
```

## 错误处理

### 触发自动 toast 的条件

- HTTP 状态码非 2xx
- 业务响应 `code !== SUCCESS_CODE` 且无自定义响应拦截器处理

### 错误对象结构

抛出 `Error`，上面额外挂载：

```ts
{
  message: string        // 友好提示文案
  statusCode?: number    // HTTP 状态码（业务错误时也可能为 200）
  code?: number          // 业务错误码（仅业务错误时有）
  raw?: unknown          // 原始响应体
}
```

### 静默模式

```ts
try {
  await http.get('/x', undefined, { showError: false })
} catch (e) {
  // 错误仍抛出，只是不再自动 toast
}
```

### 网络错误文案

| 状态码 | 文案 |
|---|---|
| 无 statusCode | `网络异常，请检查网络后重试` |
| `5xx` | `服务器异常，请稍后重试` |
| `401` | `登录已过期，请重新登录` |
| `403` | `没有访问权限` |
| `404` | `请求的资源不存在` |
| `4xx` | `请求失败 (xxx)` |

## 配置常量

`src/utils/http/config.ts`

| 常量 | 默认值 | 说明 |
|---|---|---|
| `BASE_URL` | `http://159.75.188.17:18001` | 后端服务地址 |
| `TIMEOUT` | `15000` | 普通请求超时（ms） |
| `SUCCESS_CODE` | `0` | 业务成功码 |
| `TOKEN_KEY` | `_DATA_` | token 在 storage 中的 key |
| `UPLOAD_TIMEOUT` | `60000` | 上传超时（ms） |
| `DOWNLOAD_TIMEOUT` | `60000` | 下载超时（ms） |

修改 `BASE_URL`、`SUCCESS_CODE`、`TOKEN_KEY` 等常量即可全局生效，无需改业务代码。

## 完整示例

```ts
import { http, TOKEN_KEY } from '@/utils/http'
import { storage } from '@/utils/storage'

async function loginAndFetch() {
  // 1. 登录
  const { token } = await http.post<{ token: string }>('/api/login', {
    username: 'demo',
    password: '123456',
  })
  storage.set(TOKEN_KEY, token)   // 之后所有请求自动带上（推荐走 userStore.loginSuccess）

  // 2. 拉取用户信息
  const user = await http.get<User>('/api/me')

  // 3. 上传头像
  const { tempFilePaths: [path] } = await uni.chooseImage({ count: 1 })
  await http.upload({ url: '/api/avatar', filePath: path })

  return user
}
```