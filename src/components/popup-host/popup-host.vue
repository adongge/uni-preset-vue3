<template>
  <view class="popup-host" :data-theme="themeStore.currentTheme">
    <slot />
    <toast />
  </view>
</template>

<script setup lang="ts">
import { useThemeStore } from '@/stores/theme'

/**
 * 全局弹窗承载组件（轻量级）。
 * 用法：在页面根用 <popup-host> 包裹内容，
 *       之后该页面即可正常使用 useToast()。
 *
 * 同时承担"主题作用域"职责：
 * 在根 view 上动态绑定 :data-theme，使主题 CSS 变量在此作用域内生效。
 *
 * 与 <AppLayout> 的区别：
 * - <popup-host> 只包含主题作用域 + Toast，适合简单页面
 * - <AppLayout> 额外包含极光背景 + 滚动容器，适合"门面"页面
 *
 * 所有页面均需用 <popup-host> 或 <AppLayout> 包裹以继承主题变量。
 */
const themeStore = useThemeStore()
</script>

<style>
/* 透明容器：不影响页面布局 */
.popup-host {
  position: relative;
  /* 主题切换时背景色、文字色、边框色平滑过渡 */
  transition: background-color 0.3s ease, color 0.3s ease, border-color 0.3s ease;
}
</style>