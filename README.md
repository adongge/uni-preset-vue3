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
| Store | [src/stores/](./src/stores/) | Pinia 全局状态：appStore（系统信息）、userStore（登录态）、themeStore（主题） |
| 主题 | [src/config/theme.ts](./src/config/theme.ts) + [src/composables/useTheme.ts](./src/composables/useTheme.ts) | 多主题切换（CSS 变量方案），4 套主题可选 |
| 页面布局 | [src/components/AppLayout/](./src/components/AppLayout/) | 极光背景 + 滚动容器 + Toast 的页面根组件（替代 popup-host 提供完整布局） |
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

### 主题（多套 CSS 变量）

```ts
import { useTheme } from '@/composables/useTheme'

const { currentTheme, themeList, setTheme, toggleTheme, applyTheme } = useTheme()

currentTheme.value       // 'light' | 'dark' | 'warm' | 'cool'
setTheme('dark')         // 设置指定主题
toggleTheme()            // 循环切换到下一个主题
applyTheme()             // 同步小程序窗口背景色（仅 MP-WEIXIN 生效）

// 或直接操作 store
import { useThemeStore } from '@/stores/theme'
const themeStore = useThemeStore()
themeStore.init()        // 从 storage 恢复（App.onLaunch 已自动调用）
```

**机制**：

- `src/config/theme.ts` 定义 4 套主题（浅色 / 深色 / 暖色 / 冷色），每套主题是一组 CSS 变量值
- `App.vue` 的全局 `<style>` 通过 `[data-theme="xxx"]` 属性选择器为每套主题赋值变量
- `<popup-host>` 组件在根 view 上动态绑定 `:data-theme="themeStore.currentTheme"`，从而把当前主题的作用域延伸到页面内
- 主题切换时 `page` 与 `popup-host` 的 background-color / color / border-color 会以 0.3s ease 平滑过渡

**页面使用要求**：

- 页面根必须用 `<AppLayout>` 或 `<popup-host>` 包裹，否则主题变量不会生效（它们都是主题作用域的载体）
- **`<AppLayout>`**：完整布局，包含极光背景（AuroraBackground）+ 滚动容器（Viewport）+ Toast。适合需要"门面效果"的页面（首页 / 主题演示页）
- **`<popup-host>`**：轻量级，只包含主题作用域 + Toast。适合内容为主的简单页面
- 在样式中直接用 `var(--bg)` / `var(--text)` / `var(--accent)` 等 12 个主题变量

**内置变量列表**：`--bg` / `--bg-alt` / `--surface` / `--text` / `--text-sec` / `--border` / `--accent` / `--accent-sec` / `--mask` / `--success` / `--warning` / `--error`

新增主题：在 `src/config/theme.ts` 的 `themes` 字典追加，并在 `ThemeKey` 类型中加入对应字符串字面量即可，App.vue 全局样式同步追加对应 `[data-theme="xxx"]` 块。

### API 模块

```ts
import { api } from '@/api'
import { WX_PLATFORM_ID } from '@/api/user'

// 微信小程序登录：用 uni.login 拿到的 code 换取 token
const { token } = await api.user.loginByWxCode({ code, platform_id: WX_PLATFORM_ID })

// 获取 / 修改当前用户信息
await api.user.getUserInfo()
await api.user.updateUserInfo({ nickname: '张三' })
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

**登录守卫**：`main.ts` 已调用 `installLoginGuard()`，未登录时 push 到非公开页会被拦截并 toast "请先登录"。默认公开页：首页 + 登录页 + 所有 demo 页。

### 微信登录

```ts
// 登录页：pages/login/login.vue 已实现完整流程
// uni.login 取 code → loginByWxCode 换 token → loginSuccess 写入 store → reLaunch 首页

// 业务方在自己的页面中触发登录：
import { useUserStore } from '@/stores/user'

const user = useUserStore()
user.isLoggedIn                    // 登录态判断
user.loginSuccess({ token })       // 登录成功后写入（自动持久化）
user.logout()                      // 退出登录
```

微信登录需要在小程序后台配置合法域名，并在 `src/manifest.json` 的 `mp-weixin.appid` 填入真实 appid。

## 目录结构

```
src/
├── api/                 # 按业务聚合的接口（api.user.login 等）
├── components/          # 公共组件
│   ├── AppLayout/       # 页面根组件：极光背景 + 滚动容器 + Toast（替代 popup-host 提供完整布局）
│   ├── AuroraBackground/  # 极光装饰背景（3 个模糊光斑 + 浮动动画，颜色跟随主题）
│   ├── Viewport/        # 滚动容器
│   ├── popup-host/      # 轻量级页面根：主题作用域 + Toast（向后兼容）
│   └── toast/           # Toast 组件本体
├── composables/         # 组合式工具（useToast / useTheme 等）
├── config/              # 全局配置（主题字典 theme.ts）
├── pages/
│   ├── index/           # 首页（用 AppLayout 展示门面效果）
│   ├── login/           # 微信一键登录（uni.login code 换 token）
│   └── demo/            # 演示页面（业务与演示分离）
│       ├── toast/       # useToast 四态演示
│       ├── http/        # HTTP 封装演示
│       ├── store/       # appStore / userStore 演示
│       └── theme/       # 主题切换演示（4 套主题可切换 + 极光背景）
├── static/              # 静态资源
├── stores/              # Pinia 全局状态（appStore / userStore / themeStore）
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
