<template>
  <AppLayout>
    <view class="content">
      <view class="title">网络 & API 测试</view>
      <view class="subtitle">baseURL: {{ baseUrl }}</view>

      <!-- HTTP 工具：基础请求 -->
      <view class="section">
        <view class="section-title">HTTP 工具 · 基础请求</view>
        <view class="btn" hover-class="btn-hover" @click="onGet">GET 请求</view>
        <view class="btn" hover-class="btn-hover" @click="onPost">POST 请求</view>
        <view class="btn" hover-class="btn-hover" @click="onPut">PUT 请求</view>
        <view class="btn" hover-class="btn-hover" @click="onDelete">DELETE 请求</view>
        <view class="btn" hover-class="btn-hover" @click="onSilent">静默错误（showError:false）</view>
        <view class="btn" hover-class="btn-hover" @click="onWithLoading">带 loading 的请求</view>
      </view>

      <!-- HTTP 工具：上传/下载 -->
      <view class="section">
        <view class="section-title">HTTP 工具 · 上传/下载</view>
        <view class="btn" hover-class="btn-hover" @click="onPickAndUpload">选图并上传</view>
        <view class="btn" hover-class="btn-hover" @click="onDownload">下载百度 favicon</view>
      </view>

      <!-- API 模块：登录表单 -->
      <view class="section">
        <view class="section-title">API 模块 · 登录表单</view>
        <input v-model="username" class="input" placeholder="用户名" />
        <input v-model="password" class="input" placeholder="密码" password />
      </view>

      <!-- API 模块：操作 -->
      <view class="section">
        <view class="section-title">API 模块 · 操作</view>
        <view class="btn btn-success" hover-class="btn-hover" @click="onLogin">登录</view>
        <view class="btn" hover-class="btn-hover" @click="onGetUserInfo">获取用户信息</view>
        <view class="btn btn-error" hover-class="btn-hover" @click="onLogout">退出登录</view>
      </view>

      <!-- API 模块：store 状态 -->
      <view class="section">
        <view class="section-title">API 模块 · 当前 store 状态</view>
        <view class="info">token: {{ user.token || '(空)' }}</view>
        <view class="info">isLoggedIn: {{ user.isLoggedIn }}</view>
        <view class="info">userInfo.name: {{ user.userInfo?.name ?? '(无)' }}</view>
      </view>

      <!-- 导航拦截 -->
      <view class="divider" />
      <view class="section">
        <view class="section-title">导航拦截演示</view>
        <view class="info">钩子触发次数: {{ navTriggerCount }}</view>
        <view class="info">被拦截次数: {{ navBlockedCount }}</view>
        <view class="btn" hover-class="btn-hover" @click="onNavigateDemo">navigate.push('/pages/demo/toast/toast')</view>
      </view>

      <!-- 共享日志 -->
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
  </AppLayout>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { onLoad, onUnload } from '@dcloudio/uni-app'
import { api } from '@/api'
import { useUserStore } from '@/stores/user'
import { navigate, beforeNavigate } from '@/utils/navigate'
import { useToast } from '@/composables/useToast'
import { http, BASE_URL } from '@/utils/http'
import AppLayout from '@/components/AppLayout/AppLayout.vue'

const baseUrl = BASE_URL
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
  if (logs.value.length > 30) logs.value.pop()
}

interface UserInfo {
  id: number
  name: string
}

/* ============ HTTP 工具示例 ============ */

async function onGet() {
  log('HTTP GET /api/users/1 ...')
  try {
    const u = await http.get<UserInfo>('/api/users/1')
    log('GET 成功: ' + JSON.stringify(u))
    toast.success('GET 成功')
  } catch (e) {
    log('GET 失败: ' + (e as Error).message)
  }
}

async function onPost() {
  log('HTTP POST /api/users ...')
  try {
    const u = await http.post<UserInfo>('/api/users', {
      name: '张三',
      age: 18,
    })
    log('POST 成功: ' + JSON.stringify(u))
    toast.success('POST 成功')
  } catch (e) {
    log('POST 失败: ' + (e as Error).message)
  }
}

async function onPut() {
  log('HTTP PUT /api/users/1 ...')
  try {
    const u = await http.put<UserInfo>('/api/users/1', { name: '李四' })
    log('PUT 成功: ' + JSON.stringify(u))
    toast.success('PUT 成功')
  } catch (e) {
    log('PUT 失败: ' + (e as Error).message)
  }
}

async function onDelete() {
  log('HTTP DELETE /api/users/1 ...')
  try {
    await http.del('/api/users/1')
    log('DELETE 成功')
    toast.success('DELETE 成功')
  } catch (e) {
    log('DELETE 失败: ' + (e as Error).message)
  }
}

async function onSilent() {
  log('HTTP GET /api/users/1 (showError:false) ...')
  try {
    await http.get('/api/users/1', undefined, { showError: false })
    log('完成（但有错误未提示）')
  } catch (e) {
    log('错误被捕获（无自动 toast）: ' + (e as Error).message)
  }
}

async function onWithLoading() {
  log('HTTP POST with loading ...')
  try {
    await http.post('/api/users', { name: '王五' }, {
      showLoading: true,
      loadingText: '提交中...',
    })
    log('完成')
  } catch {
    log('请求结束（loading 自动关闭）')
  }
}

async function onPickAndUpload() {
  let tempFilePath: string
  try {
    const choose = await uni.chooseImage({ count: 1 })
    tempFilePath = choose.tempFilePaths[0]
  } catch {
    log('取消选图')
    return
  }

  log('HTTP upload /api/upload ...')
  try {
    const res = await http.upload<{ url: string }>({
      url: '/api/upload',
      filePath: tempFilePath,
      name: 'file',
      formData: { biz: 'avatar' },
    })
    log('上传成功: ' + JSON.stringify(res.data))
    toast.success('上传成功')
  } catch (e) {
    log('上传失败: ' + (e as Error).message)
  }
}

async function onDownload() {
  log('HTTP download https://www.baidu.com/favicon.ico ...')
  try {
    const res = await http.download({
      url: 'https://www.baidu.com/favicon.ico',
      showLoading: true,
      loadingText: '下载中...',
    })
    log('下载成功 → tempFilePath: ' + res.tempFilePath)
    toast.success('下载成功')
  } catch (e) {
    log('下载失败: ' + (e as Error).message)
  }
}

/* ============ API 模块示例 ============ */

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
  margin-bottom: 8rpx;
}
.subtitle {
  font-size: 22rpx;
  color: #999;
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