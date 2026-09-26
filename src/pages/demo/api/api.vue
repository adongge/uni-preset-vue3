<template>
  <popup-host>
    <view class="content">
      <view class="title">API 模块化测试</view>

      <view class="section">
        <view class="section-title">登录表单</view>
        <input v-model="username" class="input" placeholder="用户名" />
        <input v-model="password" class="input" placeholder="密码" password />
      </view>

      <view class="section">
        <view class="section-title">操作</view>
        <view class="btn btn-success" hover-class="btn-hover" @click="onLogin">登录</view>
        <view class="btn" hover-class="btn-hover" @click="onGetUserInfo">获取用户信息</view>
        <view class="btn btn-error" hover-class="btn-hover" @click="onLogout">退出登录</view>
      </view>

      <view class="section">
        <view class="section-title">当前 store 状态</view>
        <view class="info">token: {{ user.token || '(空)' }}</view>
        <view class="info">isLoggedIn: {{ user.isLoggedIn }}</view>
        <view class="info">userInfo.name: {{ user.userInfo?.name ?? '(无)' }}</view>
      </view>

      <view class="divider" />

      <view class="section">
        <view class="section-title">导航拦截演示</view>
        <view class="info">钩子触发次数: {{ navTriggerCount }}</view>
        <view class="info">被拦截次数: {{ navBlockedCount }}</view>
        <view class="btn" hover-class="btn-hover" @click="onNavigateDemo">navigate.push('/pages/demo/toast/toast')</view>
      </view>

      <view class="section">
        <view class="section-title">日志</view>
        <view class="log">
          <view v-for="(item, idx) in logs" :key="idx" class="log-item">
            {{ item }}
          </view>
          <view v-if="logs.length === 0" class="log-empty">暂无</view>
        </view>
      </view>
    </view>
  </popup-host>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { onLoad, onUnload } from '@dcloudio/uni-app'
import { api } from '@/api'
import { useUserStore } from '@/stores/user'
import { navigate, beforeNavigate } from '@/utils/navigate'
import { useToast } from '@/composables/useToast'

const username = ref('demo')
const password = ref('123456')
const user = useUserStore()
const toast = useToast()
const logs = ref<string[]>([])

const navTriggerCount = ref(0)
const navBlockedCount = ref(0)
let unregisterNavHook: (() => void) | null = null

function log(msg: string) {
  logs.value.unshift(`[${new Date().toLocaleTimeString()}] ${msg}`)
  if (logs.value.length > 20) logs.value.pop()
}

async function onLogin() {
  log('api.user.login() ...')
  try {
    const result = await api.user.login({
      username: username.value,
      password: password.value,
    })
    log('登录成功: ' + JSON.stringify(result))
    user.loginSuccess(result)
    log('已写入 userStore（持久化到 storage）')
  } catch (e) {
    log('登录失败: ' + (e as Error).message)
  }
}

async function onGetUserInfo() {
  log('api.user.getUserInfo() ...')
  try {
    const info = await api.user.getUserInfo()
    log('用户信息: ' + JSON.stringify(info))
    user.setUserInfo(info)
  } catch (e) {
    log('获取失败: ' + (e as Error).message)
  }
}

async function onLogout() {
  log('api.user.logout() + store.logout() ...')
  try {
    await api.user.logout()
    log('后端退出成功')
  } catch (e) {
    log('后端退出失败（仍将清空本地）: ' + (e as Error).message)
  }
  user.logout()
  log('本地已清空')
}

/* ============ 导航拦截演示 ============ */

onLoad(() => {
  // 拦截跳转到 /pages/demo/toast/toast 的请求：
  // 首次拦截并提示，二次放行
  unregisterNavHook = beforeNavigate((ctx) => {
    if (ctx.type === 'push' && ctx.url === '/pages/demo/toast/toast') {
      navTriggerCount.value++
      if (navTriggerCount.value === 1) {
        navBlockedCount.value++
        toast.show('首次跳转被钩子拦截，再点一次放行')
        return false
      }
    }
  })
})

onUnload(() => {
  unregisterNavHook?.()
  unregisterNavHook = null
})

function onNavigateDemo() {
  log('navigate.push("/pages/demo/toast/toast") ...')
  navigate.push('/pages/demo/toast/toast')
  log('调用返回（是否真跳转看钩子结果）')
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
.input {
  background-color: #f5f5f5;
  padding: 20rpx;
  border-radius: 8rpx;
  margin-bottom: 16rpx;
  font-size: 28rpx;
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
  margin: 16rpx 0 32rpx;
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
.log {
  background-color: #1e1e1e;
  border-radius: 12rpx;
  padding: 20rpx;
  min-height: 200rpx;
}
.log-item {
  font-size: 22rpx;
  color: #d4d4d4;
  line-height: 1.6;
  font-family: monospace;
}
.log-empty {
  font-size: 22rpx;
  color: #666;
  text-align: center;
}
</style>
