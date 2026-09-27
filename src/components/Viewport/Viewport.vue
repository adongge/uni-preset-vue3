<template>
  <view class="viewport">
    <view class="screen">
      <slot />
    </view>
  </view>
</template>

<script setup lang="ts">
/**
 * 滚动容器组件
 * - 在父容器内铺满（absolute 满父）
 * - 内部 .screen 提供纵向滚动 + 弹性滚动
 * - 通常被 AppLayout 使用
 */
</script>

<style>
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