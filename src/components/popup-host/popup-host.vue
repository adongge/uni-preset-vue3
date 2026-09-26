<template>
  <view class="popup-host">
    <slot />
    <toast />
  </view>
</template>

<script setup lang="ts">
/**
 * 全局弹窗承载组件。
 * 用法：在页面根用 <popup-host> 包裹内容，
 *       之后该页面即可正常使用 useToast()。
 *
 * 未来扩展其他全局弹窗（loading / notify / dialog 等），
 * 在此文件中追加即可，调用方无需改动。
 */
</script>

<style>
/* 透明容器：不影响页面布局 */
.popup-host {
  position: relative;
}
</style>