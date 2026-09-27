<template>
  <AppLayout>
    <view class="content">
      <image class="logo" src="/static/logo.png" />
      <view class="title">欢迎使用</view>
      <view class="subtitle">使用微信一键登录，快速开始</view>

      <view
        class="btn"
        :class="{ 'btn-disabled': loading }"
        hover-class="btn-hover"
        @click="onWxLogin"
      >
        {{ loading ? '登录中...' : '微信一键登录' }}
      </view>

      <view class="agreement">登录即表示同意《用户协议》与《隐私政策》</view>
    </view>
  </AppLayout>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { api } from '@/api'
import { WX_PLATFORM_ID } from '@/api/user'
import { useUserStore } from '@/stores/user'
import { useToast } from '@/composables/useToast'
import AppLayout from '@/components/AppLayout/AppLayout.vue'

const user = useUserStore()
const toast = useToast()
const loading = ref(false)

/** 构造带 fromWxLogin 标记的错误，用于区分「已由 http 层提示」的接口错误 */
function wxLoginError(message: string) {
  const err = new Error(message) as Error & { fromWxLogin: boolean }
  err.fromWxLogin = true
  return err
}

/** 调用 uni.login 获取微信临时登录凭证 code */
function getWxCode(): Promise<string> {
  return new Promise<string>((resolve, reject) => {
    uni.login({
      provider: 'weixin',
      success: (res) => {
        if (res.code) resolve(res.code)
        else reject(wxLoginError('未获取到微信登录凭证'))
      },
      fail: (err) => reject(wxLoginError(err.errMsg || '微信登录失败')),
    })
  })
}

/** 拉取并写入用户资料；失败静默（token 已拿到，不阻断登录） */
async function fillUserInfo() {
  try {
    user.setUserInfo(await api.user.getUserInfo())
  } catch {
    /* 接口错误已由 http 层提示，不重复处理 */
  }
}

async function onWxLogin() {
  if (loading.value) return
  loading.value = true
  try {
    // 1. 取微信 code
    const code = await getWxCode()
    // 2. 用 code 换取 token
    const { token } = await api.user.loginByWxCode({ code, platform_id: WX_PLATFORM_ID })
    user.loginSuccess({ token })
    // 3. 补全用户资料
    await fillUserInfo()

    toast.success('登录成功')
    uni.reLaunch({ url: '/pages/index/index' })
  } catch (e) {
    const err = e as Error & { fromWxLogin?: boolean }
    // 接口错误 http 层已自动 toast；这里只补 uni.login 阶段的失败，用户取消授权时静默
    if (err.fromWxLogin && !/cancel|deny/i.test(err.message)) {
      toast.error(err.message)
    }
  } finally {
    loading.value = false
  }
}
</script>

<style>
.content {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 0 80rpx;
}

.logo {
  width: 200rpx;
  height: 200rpx;
  margin-top: 200rpx;
  margin-bottom: 50rpx;
}

.title {
  font-size: 44rpx;
  color: #333;
  font-weight: 600;
}

.subtitle {
  font-size: 28rpx;
  color: #8f8f94;
  margin-top: 16rpx;
}

.btn {
  width: 100%;
  margin-top: 120rpx;
  background-color: #07c160;
  color: #fff;
  font-size: 32rpx;
  border-radius: 12rpx;
  padding: 24rpx 0;
  text-align: center;
}

.btn-disabled {
  opacity: 0.6;
}

.btn-hover {
  opacity: 0.8;
}

.agreement {
  font-size: 24rpx;
  color: #b0b0b0;
  margin-top: 32rpx;
  text-align: center;
}
</style>
