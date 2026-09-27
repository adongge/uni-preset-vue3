<template>
  <popup-host>
    <view class="content">
      <image class="logo" src="/static/logo.png" />
      <view class="text-area">
        <text class="title">{{ title }}</text>
      </view>
      <view class="btn" @click="onGoDemo">跳转 Toast Demo</view>
      <view class="btn" @click="onGoNetworkDemo">跳转 Network Demo</view>
      <view class="btn" @click="onGoStoreDemo">跳转 Store Demo</view>
    </view>
  </popup-host>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const title = ref('Hello')

function onGoDemo() {
  uni.navigateTo({ url: '/pages/demo/toast/toast' })
}

function onGoNetworkDemo() {
  uni.navigateTo({ url: '/pages/demo/network/network' })
}

function onGoStoreDemo() {
  uni.navigateTo({ url: '/pages/demo/store/store' })
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

.btn {
  margin-top: 60rpx;
  background-color: #007aff;
  color: #fff;
  font-size: 30rpx;
  border-radius: 12rpx;
  padding: 24rpx 60rpx;
}
</style>