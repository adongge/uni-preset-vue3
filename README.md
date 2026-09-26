# uni-preset-vue3

uni-app + Vue 3 + TypeScript 多端小程序模板项目，内置 HTTP 封装、Pinia 状态管理、Storage 封装、Toast 组件、导航守卫等基础设施。

## 作为模板使用

通过 [degit](https://github.com/Rich-Harris/degit) 拉取本模板（不携带 git 历史）：

```bash
npx degit adongge/uni-preset-vue3 my-app
```

拉取后初始化：

```bash
cd my-app
npm install
git init               # 拉取的模板不含 .git，需要自己初始化
npm run dev:h5         # 或 npm run dev:mp-weixin
```

## 开发命令

```bash
npm install
npm run dev:h5           # H5
npm run dev:mp-weixin    # 微信小程序
npm run type-check       # 仅类型检查
```

## 模块文档

| 模块 | 路径 | 说明 |
|---|---|---|
| HTTP 请求 | [src/utils/http/README.md](./src/utils/http/README.md) | 统一请求封装，含上传/下载/拦截器 |
| Toast 演示 | [src/pages/demo/toast/README.md](./src/pages/demo/toast/README.md) | useToast 全部 API 的可交互演示 |
| Storage | [src/utils/storage.ts](./src/utils/storage.ts) | 同步 storage 封装，类型化 + 异常安全 |
| Store | [src/stores/](./src/stores/) | Pinia 全局状态：appStore（系统信息）、userStore（登录态） |
| API 模块 | [src/api/](./src/api/) | 按业务聚合的接口（api.user.login 等） |
| 工具函数 | [src/utils/helpers.ts](./src/utils/helpers.ts) | 防抖/节流/深拷贝/时间格式化/空值判断 |
| 导航工具 | [src/utils/navigate.ts](./src/utils/navigate.ts) | 跳转封装 + 拦截钩子 + 登录守卫 |

## 基础设施用法速查

### Toast（弹窗）

```ts
import { useToast } from '@/composables/useToast'
const toast = useToast()

toast.show('提示')
toast.success('成功')
await toast.confirm('确认删除吗？')   // 返回 boolean
toast.loading()                      // 调用 toast.hide() 关闭
```

页面根需用 `<popup-host>` 包裹，否则不渲染。

### HTTP

详见 [src/utils/http/README.md](./src/utils/http/README.md)。

### Storage

```ts
import { storage } from '@/utils/storage'

storage.set('key', { a: 1 })
const v = storage.get<{ a: number }>('key', { a: 0 })  // 支持默认值
storage.remove('key')
storage.clear()
```

### Store（Pinia）

```ts
import { useAppStore } from '@/stores/app'
import { useUserStore } from '@/stores/user'

// appStore：系统信息（状态栏、安全区、网络类型）
const app = useAppStore()
app.init()                       // App.onLaunch 已自动调用
app.setNetworkType('wifi')

// userStore：登录态（token + 用户信息）
const user = useUserStore()
user.init()                      // App.onLaunch 已自动调用：从 storage 恢复
user.loginSuccess({ token, userInfo })   // 写入自动持久化到 storage
user.logout()                    // 清空 token + userInfo
```

`App.onLaunch` 中已自动调用 `appStore.init()` + `userStore.init()`。

### API 模块

```ts
import { api } from '@/api'

await api.user.login({ username, password })
await api.user.getUserInfo()
await api.user.logout()
```

新增业务：
1. 在 `src/api/` 下新建文件（如 `order.ts`），export 函数与类型
2. 在 `src/api/index.ts` 加入：`import * as order from './order'` → 加入 `api` 对象

### 工具函数

```ts
import { helpers } from '@/utils/helpers'

helpers.debounce(fn, 300)
helpers.throttle(fn, 1000)
helpers.deepClone(obj)
helpers.formatTime(new Date(), 'YYYY-MM-DD HH:mm')
helpers.formatDate(ts)
helpers.isEmpty(value)
```

### 导航工具（含登录守卫）

```ts
import { navigate, beforeNavigate, addPublicPage } from '@/utils/navigate'

navigate.push('/pages/order/order')
navigate.back()

// 注册拦截钩子（返回反注册函数）
const unregister = beforeNavigate((ctx) => {
  if (ctx.type === 'push' && ctx.url.startsWith('/pages/admin/')) {
    return false   // 中断
  }
})
onUnload(unregister)

// 注册新公开页（不需登录）
addPublicPage('/pages/about/about')
```

**登录守卫**：`main.ts` 已调用 `installLoginGuard()`，未登录时 push 到非公开页会被拦截并 toast "请先登录"。默认公开页：首页 + 所有 demo 页。

## 目录结构

```
src/
├── api/                 # 按业务聚合的接口（api.user.login 等）
├── components/          # 公共组件（popup-host / toast）
│   ├── popup-host/      # 全局弹窗承载组件（页面根使用）
│   └── toast/           # Toast 组件本体
├── composables/         # 组合式工具（useToast 等）
├── pages/
│   ├── index/           # 首页
│   └── demo/            # 演示页面（业务与演示分离）
│       ├── toast/       # useToast 四态演示
│       ├── http/        # HTTP 封装演示
│       ├── store/       # appStore / userStore 演示
│       └── api/         # API 调用 + 登录链路 + 导航拦截演示
├── static/              # 静态资源
├── stores/              # Pinia 全局状态（appStore / userStore）
└── utils/
    ├── http/            # HTTP 请求封装（详见模块 README）
    ├── helpers.ts       # 通用工具函数（防抖/节流/格式化等）
    ├── navigate.ts      # 导航工具 + 拦截钩子 + 登录守卫
    └── storage.ts       # Storage 同步封装
```

## 类型检查

```bash
npm run type-check   # vue-tsc --noEmit
```
