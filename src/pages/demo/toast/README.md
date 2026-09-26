# src/pages/demo/toast

> useToast 全部 API 的可交互演示页面。

## 概览

- **位置**：`src/pages/demo/toast/toast.vue`
- **入口**：首页"跳转 Toast Demo"按钮 → `uni.navigateTo('/pages/demo/toast/toast')`
- **演示范围**：`useToast()` 全部公开方法
- **集成前提**：页面根用 `<popup-host>` 包裹，否则弹窗不渲染

## 演示场景速查

| 分组 | 覆盖能力 |
|---|---|
| show / success / error | 普通 toast、自定义时长、连续队列（自动按序显示） |
| alert | 基础 / 带标题 / 自定义按钮 / 遮罩点击关闭 |
| confirm | 基础 / 带标题 / 自定义按钮 / 隐藏取消 / 遮罩视为取消 |
| loading | 默认 / 自定义文案 / 手动关闭 |
| 综合场景 | 异步请求（loading → success）、删除流程（confirm → loading → success） |

## 联动

- HTTP 模块（[src/utils/http/README.md](../../../utils/http/README.md)）的自动错误 toast 复用同一个 `<toast />` 组件
- 所有 demo 页面共用同一份 `<popup-host>` 承载方式
