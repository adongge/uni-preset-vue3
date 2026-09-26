<template>
  <popup-host>
    <view class="content">
      <view class="title">Store 测试（appStore）</view>

      <view class="section">
        <view class="section-title">当前状态</view>
        <view class="info">statusBarHeight: {{ app.statusBarHeight }}</view>
        <view class="info">safeArea.top: {{ app.safeArea.top }}</view>
        <view class="info">safeArea.bottom: {{ app.safeArea.bottom }}</view>
        <view class="info">networkType: {{ app.networkType }}</view>
        <view class="info">initialized: {{ app.initialized }}</view>
      </view>

      <view class="section">
        <view class="section-title">appStore 操作</view>
        <view class="btn" hover-class="btn-hover" @click="onInit">init() - 读取系统信息</view>
        <view class="btn" hover-class="btn-hover" @click="onSetWifi">setNetworkType('wifi')</view>
        <view class="btn" hover-class="btn-hover" @click="onSetNone">setNetworkType('none')</view>
      </view>

      <view class="divider" />

      <view class="section">
        <view class="section-title">userStore 状态</view>
        <view class="info">token: {{ user.token || '(空)' }}</view>
        <view class="info">isLoggedIn: {{ user.isLoggedIn }}</view>
        <view class="info">userInfo.name: {{ user.userInfo?.name ?? '(无)' }}</view>
        <view class="info">userInfo.id: {{ user.userInfo?.id ?? '(无)' }}</view>
      </view>

      <view class="section">
        <view class="section-title">userStore 操作</view>
        <view class="btn" hover-class="btn-hover" @click="onUserInit">init() - 从 storage 恢复</view>
        <view class="btn btn-success" hover-class="btn-hover" @click="onMockLogin">模拟登录</view>
        <view class="btn btn-error" hover-class="btn-hover" @click="onLogout">退出登录</view>
      </view>
    </view>
  </popup-host>
</template>

<script setup lang="ts">
import { useAppStore } from '@/stores/app'
import { useUserStore } from '@/stores/user'

const app = useAppStore()
const user = useUserStore()

function onInit() {
  app.init()
}

function onSetWifi() {
  app.setNetworkType('wifi')
}

function onSetNone() {
  app.setNetworkType('none')
}

function onUserInit() {
  user.init()
}

function onMockLogin() {
  user.loginSuccess({
    token: 'mock-token-' + Date.now(),
    userInfo: { id: 1, name: '张三' },
  })
}

function onLogout() {
  user.logout()
}
</script>

<style>
.content {
  padding: 40rpx;
  display: flex;
  flex-direction: column;
}
.title {
  font-size: 40rpx;
  color: #333;
  font-weight: 600;
  text-align: center;
  margin-bottom: 32rpx;
}
.section {
  margin-bottom: 32rpx;
}
.section-title {
  font-size: 28rpx;
  color: #666;
  margin-bottom: 16rpx;
  padding-left: 8rpx;
}
.info {
  font-size: 26rpx;
  color: #333;
  margin-bottom: 8rpx;
  padding: 12rpx 16rpx;
  background-color: #f5f5f5;
  border-radius: 8rpx;
  font-family: monospace;
}
.btn {
  background-color: #007aff;
  color: #fff;
  font-size: 30rpx;
  border-radius: 12rpx;
  padding: 24rpx 0;
  text-align: center;
  margin-bottom: 16rpx;
}
.btn-success {
  background-color: #34c759;
}
.btn-error {
  background-color: #ff3b30;
}
.btn-hover {
  opacity: 0.8;
}
.divider {
  height: 1rpx;
  background-color: #e0e0e0;
  margin: 32rpx 0;
}
</style>
