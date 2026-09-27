<template>
  <view class="aurora-bg">
    <view class="aurora a1" :style="a1Style"></view>
    <view class="aurora a2" :style="a2Style"></view>
    <view class="aurora a3" :style="a3Style"></view>
  </view>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useThemeStore } from '@/stores/theme'
import type { ThemeKey } from '@/config/theme'

/**
 * 极光背景组件
 * - 3 个 radial-gradient 模糊光斑 + 浮动动画
 * - 颜色跟随主题（每个主题一套同色系配色）
 * - pointer-events: none，不拦截点击
 * - 固定定位，z-index: 0，最底层
 */

const themeStore = useThemeStore()

/**
 * 每个主题下的 3 个光斑颜色（[start, end] 用于 radial-gradient）
 * 设计原则：与主题色调协调，深色主题用暗色光斑避免过亮
 */
const auroraColors: Record<
  ThemeKey,
  { a1: [string, string]; a2: [string, string]; a3: [string, string] }
> = {
  // 浅色：橙蓝绿（原 ootd 配色）
  light: {
    a1: ['#FFD6CC', '#FFA07A'],
    a2: ['#C8D8FF', '#9BB5F0'],
    a3: ['#D4F0DE', '#A8DFC0'],
  },
  // 深色：暗橙暗蓝暗绿
  dark: {
    a1: ['#5B3B33', '#3B2620'],
    a2: ['#2A3B5B', '#1E2A3B'],
    a3: ['#2B4A37', '#1E3326'],
  },
  // 暖色：橙米棕
  warm: {
    a1: ['#FFD9B8', '#E6A88A'],
    a2: ['#F5D4B0', '#D4A57F'],
    a3: ['#E8D4B8', '#C8B098'],
  },
  // 冷色：浅蓝浅紫青绿
  cool: {
    a1: ['#C8DCE8', '#9BB5C8'],
    a2: ['#D8D4E8', '#B0A8C8'],
    a3: ['#D4E8E0', '#A8C8B8'],
  },
}

/** 深色主题下降低光斑透明度，避免在深背景上过亮 */
const auroraOpacity: Record<ThemeKey, number> = {
  light: 0.55,
  dark: 0.4,
  warm: 0.55,
  cool: 0.5,
}

const current = computed(() => auroraColors[themeStore.currentTheme])

function gradient(start: string, end: string): string {
  return `radial-gradient(circle, ${start} 0%, ${end} 100%)`
}

const a1Style = computed(() => ({
  background: gradient(current.value.a1[0], current.value.a1[1]),
  opacity: String(auroraOpacity[themeStore.currentTheme]),
}))
const a2Style = computed(() => ({
  background: gradient(current.value.a2[0], current.value.a2[1]),
  opacity: String(auroraOpacity[themeStore.currentTheme]),
}))
const a3Style = computed(() => ({
  background: gradient(current.value.a3[0], current.value.a3[1]),
  opacity: String(auroraOpacity[themeStore.currentTheme]),
}))
</script>

<style>
.aurora-bg {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 0;
  overflow: hidden;
  pointer-events: none;
}

.aurora {
  position: absolute;
  border-radius: 50%;
  filter: blur(90rpx);
  animation: aurora-float 20s ease-in-out infinite;
}

.a1 {
  width: 520rpx;
  height: 420rpx;
  top: -120rpx;
  right: -80rpx;
  animation-delay: 0s;
}

.a2 {
  width: 480rpx;
  height: 400rpx;
  bottom: -140rpx;
  left: -100rpx;
  animation-delay: -7s;
}

.a3 {
  width: 340rpx;
  height: 340rpx;
  top: 35%;
  left: 25%;
  animation-delay: -14s;
}

@keyframes aurora-float {
  0%,
  100% {
    transform: translate(0, 0) scale(1);
  }
  33% {
    transform: translate(40rpx, -30rpx) scale(1.05);
  }
  66% {
    transform: translate(-30rpx, 40rpx) scale(0.96);
  }
}
</style>