<template>
  <AppLayout>
    <view class="content">
      <image class="logo" src="/static/logo.png" />
      <view class="text-area">
        <text class="title">{{ title }}</text>
      </view>

      <view class="user-box">
        <view v-if="user.isLoggedIn" class="user-tip">
          已登录：{{ user.userInfo?.nickname || '用户' }}（id: {{ user.userInfo?.id }}）
        </view>
        <view v-else class="user-tip">未登录</view>
        <view v-if="user.isLoggedIn" class="btn btn-logout" @click="onLogout">退出登录</view>
        <view v-else class="btn btn-login" @click="onGoLogin">微信登录</view>
      </view>

      <view class="btn" @click="onGoDemo">跳转 Toast Demo</view>
      <view class="btn" @click="onGoNetworkDemo">跳转 Network Demo</view>
      <view class="btn" @click="onGoStoreDemo">跳转 Store Demo</view>
      <view class="btn btn-theme" @click="onGoThemeDemo">跳转 Theme Demo</view>
    </view>
  </AppLayout>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useUserStore } from '@/stores/user'
import { useToast } from '@/composables/useToast'
import AppLayout from '@/components/AppLayout/AppLayout.vue'

const title = ref('Hello')
const user = useUserStore()
const toast = useToast()

function onGoLogin() {
  uni.navigateTo({ url: '/pages/login/login' })
}

async function onLogout() {
  const ok = await toast.confirm('确定退出登录吗？')
  if (!ok) return
  user.logout()
  toast.show('已退出登录')
}

function onGoDemo() {
  uni.navigateTo({ url: '/pages/demo/toast/toast' })
}

function onGoNetworkDemo() {
  uni.navigateTo({ url: '/pages/demo/network/network' })
}

function onGoStoreDemo() {
  uni.navigateTo({ url: '/pages/demo/store/store' })
}

function onGoThemeDemo() {
  uni.navigateTo({ url: '/pages/demo/theme/index' })
}
</script>

<style>
.content {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.logo {
  height: 200rpx;
  width: 200rpx;
  margin-top: 200rpx;
  margin-left: auto;
  margin-right: auto;
  margin-bottom: 50rpx;
}

.text-area {
  display: flex;
  justify-content: center;
}

.title {
  font-size: 36rpx;
  color: #8f8f94;
}

.user-box {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.user-tip {
  font-size: 26rpx;
  color: #8f8f94;
  margin-top: 24rpx;
}

.btn-login {
  background-color: #07c160;
}

.btn-logout {
  background-color: #999;
}

.btn-theme {
  background-color: var(--accent-sec);
}

.btn {
  margin-top: 60rpx;
  background-color: #007aff;
  color: #fff;
  font-size: 30rpx;
  border-radius: 12rpx;
  padding: 24rpx 60rpx;
}
</style>