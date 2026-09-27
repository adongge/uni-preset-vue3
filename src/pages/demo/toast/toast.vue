<template>
  <AppLayout>
    <view class="content">
      <view class="title">Toast 组件测试</view>

      <!-- show / success / error -->
      <view class="section">
        <view class="section-title">show / success / error</view>
        <view class="btn" hover-class="btn-hover" @click="onShow">普通 Toast</view>
        <view class="btn" hover-class="btn-hover" @click="onShowDuration">自定义时长 5s</view>
        <view class="btn btn-success" hover-class="btn-hover" @click="onSuccess">成功 Toast</view>
        <view class="btn btn-error" hover-class="btn-hover" @click="onError">失败 Toast</view>
        <view class="btn" hover-class="btn-hover" @click="onQueue">连续 Toast（队列）</view>
      </view>

      <!-- alert -->
      <view class="section">
        <view class="section-title">alert</view>
        <view class="btn" hover-class="btn-hover" @click="onAlert">基础 Alert</view>
        <view class="btn" hover-class="btn-hover" @click="onAlertTitle">带标题 Alert</view>
        <view class="btn" hover-class="btn-hover" @click="onAlertConfirm">自定义按钮 Alert</view>
        <view class="btn" hover-class="btn-hover" @click="onAlertMask">点击遮罩关闭</view>
      </view>

      <!-- confirm -->
      <view class="section">
        <view class="section-title">confirm</view>
        <view class="btn" hover-class="btn-hover" @click="onConfirm">基础 Confirm</view>
        <view class="btn" hover-class="btn-hover" @click="onConfirmTitle">带标题 Confirm</view>
        <view class="btn" hover-class="btn-hover" @click="onConfirmCustom">自定义按钮 Confirm</view>
        <view class="btn" hover-class="btn-hover" @click="onConfirmNoCancel">Confirm 隐藏取消</view>
        <view class="btn" hover-class="btn-hover" @click="onConfirmMask">点击遮罩视为取消</view>
      </view>

      <!-- loading -->
      <view class="section">
        <view class="section-title">loading</view>
        <view class="btn" hover-class="btn-hover" @click="onLoading">默认 Loading</view>
        <view class="btn" hover-class="btn-hover" @click="onLoadingText">自定义文字 Loading</view>
        <view class="btn" hover-class="btn-hover" @click="onHide">手动关闭</view>
      </view>

      <!-- 综合场景 -->
      <view class="section">
        <view class="section-title">综合场景</view>
        <view class="btn" hover-class="btn-hover" @click="onAsync">异步请求（loading + success）</view>
        <view class="btn btn-error" hover-class="btn-hover" @click="onDeleteFlow">删除流程（confirm + loading + success）</view>
      </view>
    </view>
  </AppLayout>
</template>

<script setup lang="ts">
import { useToast } from '@/composables/useToast'
import AppLayout from '@/components/AppLayout/AppLayout.vue'

const toast = useToast()

// ============ show / success / error ============

function onShow() {
  toast.show('这是一条普通提示')
}

function onShowDuration() {
  toast.show('这条会显示 5 秒', { duration: 5000 })
}

function onSuccess() {
  toast.success('操作成功')
}

function onError() {
  toast.error('操作失败')
}

function onQueue() {
  toast.show('第一条提示')
  toast.success('第二条 - 成功')
  toast.error('第三条 - 失败')
}

// ============ alert ============

async function onAlert() {
  await toast.alert('这是一个简单的 Alert 弹窗')
  console.log('[alert 基础] 用户已确认')
}

async function onAlertTitle() {
  await toast.alert('请阅读用户协议后继续操作', {
    title: '提示',
  })
  console.log('[alert 带标题] 用户已确认')
}

async function onAlertConfirm() {
  await toast.alert('服务协议', {
    title: '提示',
    confirmText: '我同意',
  })
  console.log('[alert 自定义按钮] 用户同意')
}

async function onAlertMask() {
  await toast.alert('点击遮罩也可以关闭（视为确认）', {
    title: '提示',
    maskClickClose: true,
  })
  console.log('[alert 点击遮罩] 已关闭')
}

// ============ confirm ============

async function onConfirm() {
  const ok = await toast.confirm('确认执行此操作吗？')
  console.log('[confirm 基础]', ok ? '确定' : '取消')
}

async function onConfirmTitle() {
  const ok = await toast.confirm('该操作不可恢复，请谨慎', {
    title: '警告',
  })
  console.log('[confirm 带标题]', ok ? '确定' : '取消')
}

async function onConfirmCustom() {
  const ok = await toast.confirm('确认删除这条数据吗？', {
    title: '删除确认',
    confirmText: '删除',
    cancelText: '再想想',
  })
  console.log('[confirm 自定义按钮]', ok ? '删除' : '取消')
}

async function onConfirmNoCancel() {
  // showCancel: false 时 confirm 退化为单按钮弹窗
  const ok = await toast.confirm('确定继续吗？', {
    showCancel: false,
    confirmText: '继续',
  })
  console.log('[confirm 隐藏取消]', ok ? '继续' : '取消')
}

async function onConfirmMask() {
  const ok = await toast.confirm('点击遮罩视为取消', {
    maskClickClose: true,
  })
  console.log('[confirm 点击遮罩]', ok ? '确定' : '取消（遮罩）')
}

// ============ loading ============

function onLoading() {
  toast.loading()
}

function onLoadingText() {
  toast.loading('正在上传文件...')
}

function onHide() {
  toast.hide()
}

// ============ 综合场景 ============

async function onAsync() {
  toast.loading('请求中...')
  await sleep(2000)
  toast.hide()
  toast.success('请求成功')
}

async function onDeleteFlow() {
  // 第一步：confirm 确认
  const ok = await toast.confirm('确认删除这条数据吗？', {
    title: '删除确认',
    confirmText: '删除',
    cancelText: '再想想',
  })
  if (!ok) {
    toast.show('已取消删除')
    return
  }

  // 第二步：loading 模拟请求
  toast.loading('删除中...')
  await sleep(1500)

  // 第三步：结果提示
  toast.hide()
  toast.success('删除成功')
}

function sleep(ms: number) {
  return new Promise<void>((resolve) => setTimeout(resolve, ms))
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
  margin: 20rpx 0 40rpx;
}
.section {
  margin-bottom: 40rpx;
}
.section-title {
  font-size: 28rpx;
  color: #999;
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
.btn-success {
  background-color: #34c759;
}
.btn-error {
  background-color: #ff3b30;
}
.btn-hover {
  opacity: 0.8;
}
</style>