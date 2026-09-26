<template>
  <!-- 遮罩层 + 弹窗容器 -->
  <view v-if="state.visible" class="t-mask" :class="maskClass" @click="onMaskClick">
    <view class="t-box" :class="boxClass" @click.stop>
      <!-- loading 模式 -->
      <view v-if="state.mode === 'loading'" class="t-loading-body">
        <view class="t-spinner"></view>
        <text v-if="state.content" class="t-loading-text">{{ state.content }}</text>
      </view>

      <!-- toast 模式（轻提示） -->
      <view v-else-if="state.mode === 'toast'" class="t-toast-body">
        <text class="t-toast-text">{{ state.content }}</text>
      </view>

      <!-- alert / confirm 模式 -->
      <view v-else class="t-dialog">
        <text v-if="state.title" class="t-dialog-title">{{ state.title }}</text>
        <text class="t-dialog-msg">{{ state.content }}</text>
        <view class="t-dialog-btns">
          <view
            v-if="state.showCancel"
            class="t-btn t-btn-cancel"
            hover-class="t-btn-hover"
            :hover-stay-time="50"
            @click="onCancel"
          >
            <text>{{ state.cancelText }}</text>
          </view>
          <view
            class="t-btn t-btn-confirm"
            hover-class="t-btn-hover"
            :hover-stay-time="50"
            @click="onConfirm"
          >
            <text>{{ state.confirmText }}</text>
          </view>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { toastState } from '@/composables/useToast'

const state = toastState

const maskClass = computed(() => ({
  't-mask-transparent': state.mode === 'toast' || state.mode === 'loading',
}))

const boxClass = computed(() => `t-box-${state.mode}`)

function onMaskClick() {
  // toast / loading 不响应遮罩点击
  if (state.mode !== 'alert' && state.mode !== 'confirm') return
  if (!state.maskClickClose) return
  // 视为取消
  onCancel()
}

function onConfirm() {
  if (state._resolve) {
    state._resolve(true)
    state._resolve = null
  }
  hide()
}

function onCancel() {
  if (state._resolve) {
    state._resolve(false)
    state._resolve = null
  }
  hide()
}

function hide() {
  state.visible = false
  // 清理内容，避免下次打开时短暂闪现
  // mode/title/content 由下次调用时覆盖
}
</script>

<style>
/* ========== 遮罩 ========== */
.t-mask {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  z-index: 9999;
  display: flex;
  align-items: center;
  justify-content: center;
}
.t-mask-transparent {
  background-color: rgba(0, 0, 0, 0);
}

/* ========== 容器 ========== */
.t-box {
  background-color: #fff;
  border-radius: 16rpx;
  min-width: 480rpx;
  max-width: 640rpx;
  overflow: hidden;
  animation: t-pop-in 0.18s ease-out;
}
@keyframes t-pop-in {
  from {
    opacity: 0;
    transform: scale(0.9);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}

/* ========== toast 模式 ========== */
.t-box-toast {
  background-color: rgba(0, 0, 0, 0.75);
  padding: 24rpx 32rpx;
  max-width: 560rpx;
}
.t-toast-body {
  display: flex;
  justify-content: center;
}
.t-toast-text {
  color: #fff;
  font-size: 28rpx;
  line-height: 1.5;
  text-align: center;
  word-break: break-all;
}

/* ========== loading 模式 ========== */
.t-box-loading {
  background-color: rgba(0, 0, 0, 0.7);
  padding: 40rpx 60rpx;
  display: flex;
  flex-direction: column;
  align-items: center;
}
.t-loading-body {
  display: flex;
  flex-direction: column;
  align-items: center;
}
.t-spinner {
  width: 48rpx;
  height: 48rpx;
  border: 4rpx solid rgba(255, 255, 255, 0.3);
  border-top-color: #fff;
  border-radius: 50%;
  animation: t-spin 0.8s linear infinite;
}
.t-loading-text {
  margin-top: 20rpx;
  color: #fff;
  font-size: 26rpx;
}
@keyframes t-spin {
  to {
    transform: rotate(360deg);
  }
}

/* ========== dialog 模式（alert / confirm） ========== */
.t-dialog {
  padding: 40rpx 40rpx 0;
  display: flex;
  flex-direction: column;
  align-items: center;
}
.t-dialog-title {
  font-size: 32rpx;
  font-weight: 600;
  color: #333;
  margin-bottom: 20rpx;
  text-align: center;
}
.t-dialog-msg {
  font-size: 28rpx;
  color: #666;
  line-height: 1.5;
  text-align: center;
  word-break: break-all;
  white-space: pre-wrap;
  padding: 0 8rpx 40rpx;
}
.t-dialog-btns {
  display: flex;
  flex-direction: row;
  width: 100%;
  border-top: 1rpx solid #eee;
}
.t-btn {
  flex: 1;
  padding: 28rpx 0;
  text-align: center;
  font-size: 30rpx;
  display: flex;
  justify-content: center;
  align-items: center;
}
.t-btn-cancel {
  color: #666;
  border-right: 1rpx solid #eee;
  position: relative;
}
.t-btn-confirm {
  color: #007aff;
  font-weight: 500;
}
.t-btn-hover {
  background-color: #f5f5f5;
}
</style>