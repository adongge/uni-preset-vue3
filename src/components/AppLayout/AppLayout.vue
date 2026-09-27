<template>
  <view class="app-layout" :data-theme="themeStore.currentTheme">
    <!-- 极光装饰背景（底层） -->
    <AuroraBackground />

    <!-- 滚动内容区 -->
    <view class="viewport">
      <view class="screen">
        <slot />
      </view>
    </view>

    <!-- 全局弹窗（顶层） -->
    <Toast />
  </view>
</template>

<script setup lang="ts">
import { useThemeStore } from '@/stores/theme'
import AuroraBackground from '@/components/AuroraBackground/AuroraBackground.vue'
import Toast from '@/components/toast/toast.vue'

/**
 * 应用布局组件 - 页面根容器
 *
 * 三层结构（z-index 0 / 1 / toast 内部）：
 *   1. AuroraBackground：极光装饰背景（pointer-events: none）
 *   2. viewport.screen：可滚动内容区
 *   3. Toast：全局弹窗（由 toast 组件自身控制 z-index）
 *
 * 主题作用域：
 *   在根 view 上动态绑定 :data-theme，使主题 CSS 变量在此作用域内生效
 *
 * 使用方式：与 popup-host 等价，作为页面根容器
 *   <AppLayout>
 *     <view>...页面内容...</view>
 *   </AppLayout>
 */
const themeStore = useThemeStore()
</script>

<style>
.app-layout {
  position: relative;
  width: 100%;
  height: 100vh;
  overflow: hidden;
  background-color: var(--bg);
  color: var(--text);
  font-family: system-ui, -apple-system, sans-serif;
  /* 主题切换时背景与文字平滑过渡 */
  transition: background-color 0.3s ease, color 0.3s ease;
}

.viewport {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 1;
}

.screen {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  overflow-x: hidden;
  overflow-y: auto;
  -webkit-overflow-scrolling: touch;
}
</style>