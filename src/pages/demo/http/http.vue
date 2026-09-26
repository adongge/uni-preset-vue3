<template>
  <popup-host>
    <view class="content">
      <view class="title">HTTP 封装测试</view>
      <view class="subtitle">baseURL: {{ baseUrl }}</view>

      <!-- 基础请求 -->
      <view class="section">
        <view class="section-title">基础请求（mock URL，会触发自动错误 toast）</view>
        <view class="btn" hover-class="btn-hover" @click="onGet">GET 请求</view>
        <view class="btn" hover-class="btn-hover" @click="onPost">POST 请求</view>
        <view class="btn" hover-class="btn-hover" @click="onPut">PUT 请求</view>
        <view class="btn" hover-class="btn-hover" @click="onDelete">DELETE 请求</view>
        <view class="btn" hover-class="btn-hover" @click="onSilent">静默错误（showError:false）</view>
        <view class="btn" hover-class="btn-hover" @click="onWithLoading">带 loading 的请求</view>
      </view>

      <!-- 文件上传 -->
      <view class="section">
        <view class="section-title">文件上传</view>
        <view class="btn" hover-class="btn-hover" @click="onPickAndUpload">选图并上传</view>
      </view>

      <!-- 文件下载 -->
      <view class="section">
        <view class="section-title">文件下载（公开资源，可成功）</view>
        <view class="btn" hover-class="btn-hover" @click="onDownload">下载百度 favicon</view>
      </view>

      <!-- 日志 -->
      <view class="section">
        <view class="section-title">最近日志</view>
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
import { http, BASE_URL } from '@/utils/http'
import { useToast } from '@/composables/useToast'

const baseUrl = BASE_URL
const toast = useToast()
const logs = ref<string[]>([])

function log(msg: string) {
  logs.value.unshift(`[${new Date().toLocaleTimeString()}] ${msg}`)
  if (logs.value.length > 20) logs.value.pop()
}

interface UserInfo {
  id: number
  name: string
}

/* ============ 基础请求示例 ============ */

async function onGet() {
  log('GET /api/users/1 ...')
  try {
    // 演示泛型：返回类型为 UserInfo
    const user = await http.get<UserInfo>('/api/users/1')
    log('GET 成功: ' + JSON.stringify(user))
    toast.success('GET 成功')
  } catch (e) {
    log('GET 失败: ' + (e as Error).message)
  }
}

async function onPost() {
  log('POST /api/users ...')
  try {
    const user = await http.post<UserInfo>('/api/users', {
      name: '张三',
      age: 18,
    })
    log('POST 成功: ' + JSON.stringify(user))
    toast.success('POST 成功')
  } catch (e) {
    log('POST 失败: ' + (e as Error).message)
  }
}

async function onPut() {
  log('PUT /api/users/1 ...')
  try {
    const user = await http.put<UserInfo>('/api/users/1', { name: '李四' })
    log('PUT 成功: ' + JSON.stringify(user))
    toast.success('PUT 成功')
  } catch (e) {
    log('PUT 失败: ' + (e as Error).message)
  }
}

async function onDelete() {
  log('DELETE /api/users/1 ...')
  try {
    await http.del('/api/users/1')
    log('DELETE 成功')
    toast.success('DELETE 成功')
  } catch (e) {
    log('DELETE 失败: ' + (e as Error).message)
  }
}

async function onSilent() {
  log('GET /api/users/1 (showError:false) ...')
  try {
    await http.get('/api/users/1', undefined, { showError: false })
    log('完成（但有错误未提示）')
  } catch (e) {
    // 错误仍抛出，只是不再自动 toast
    log('错误被捕获（无自动 toast）: ' + (e as Error).message)
  }
}

async function onWithLoading() {
  log('POST with loading ...')
  try {
    await http.post('/api/users', { name: '王五' }, {
      showLoading: true,
      loadingText: '提交中...',
    })
    log('完成')
  } catch {
    // loading 已自动关闭
    log('请求结束（loading 自动关闭）')
  }
}

/* ============ 上传示例 ============ */

async function onPickAndUpload() {
  let tempFilePath: string
  try {
    const choose = await uni.chooseImage({ count: 1 })
    tempFilePath = choose.tempFilePaths[0]
  } catch {
    log('取消选图')
    return
  }

  log('upload /api/upload ...')
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

/* ============ 下载示例 ============ */

async function onDownload() {
  log('download https://www.baidu.com/favicon.ico ...')
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
.btn {
  background-color: #007aff;
  color: #fff;
  font-size: 30rpx;
  border-radius: 12rpx;
  padding: 24rpx 0;
  text-align: center;
  margin-bottom: 16rpx;
}
.btn-hover {
  opacity: 0.8;
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