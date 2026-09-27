<template>
  <AppLayout>
    <view class="content">
      <view class="title">主题切换测试</view>

      <!-- 当前主题信息 -->
      <view class="section">
        <view class="section-title">当前主题</view>
        <view class="info">
          <text class="info-label">key：</text>
          <text class="info-value">{{ currentTheme }}</text>
        </view>
        <view class="info">
          <text class="info-label">name：</text>
          <text class="info-value">{{ currentThemeInfo.name }}</text>
        </view>
        <view class="info">
          <text class="info-label">bg：</text>
          <text class="info-value">{{ themeVars['--bg'] }}</text>
        </view>
        <view class="info">
          <text class="info-label">text：</text>
          <text class="info-value">{{ themeVars['--text'] }}</text>
        </view>
      </view>

      <!-- 主题选择 -->
      <view class="section">
        <view class="section-title">选择主题</view>
        <view class="theme-grid">
          <view
            v-for="t in themeList"
            :key="t.key"
            class="theme-card"
            :class="{ active: t.key === currentTheme }"
            hover-class="theme-card-hover"
            :hover-stay-time="50"
            @click="onSelect(t.key)"
          >
            <view class="theme-preview" :style="{ background: t.bg, borderColor: t.accent }">
              <view class="theme-accent" :style="{ background: t.accent }"></view>
            </view>
            <text class="theme-name">{{ t.name }}</text>
            <text v-if="t.key === currentTheme" class="theme-check">✓ 当前</text>
          </view>
        </view>
      </view>

      <!-- 快捷操作 -->
      <view class="section">
        <view class="section-title">快捷操作</view>
        <view class="btn" hover-class="btn-hover" @click="onToggle">toggleTheme() 下一个主题</view>
        <view class="btn btn-success" hover-class="btn-hover" @click="onApply">applyTheme() 同步窗口背景</view>
        <view class="btn btn-warn" hover-class="btn-hover" @click="onReset">重置为浅色</view>
      </view>

      <!-- 主题元素预览 -->
      <view class="section">
        <view class="section-title">主题元素预览</view>
        <view class="preview-card">
          <view class="preview-title">示例卡片标题</view>
          <view class="preview-text">主文字：使用 var(--text)</view>
          <view class="preview-text-sec">次要文字：使用 var(--text-sec)</view>
          <view class="preview-border">边框示例：使用 var(--border)</view>
          <view class="preview-buttons">
            <view class="preview-btn primary">主按钮</view>
            <view class="preview-btn success">成功</view>
            <view class="preview-btn warn">警告</view>
            <view class="preview-btn error">失败</view>
          </view>
        </view>
      </view>

      <!-- 注意事项 -->
      <view class="section">
        <view class="section-title">使用说明</view>
        <view class="tip">
          · 切换主题后会自动持久化到 storage，下次启动自动应用
        </view>
        <view class="tip">
          · 主题通过 :data-theme 属性选择器 + CSS 变量实现
        </view>
        <view class="tip">
          · 页面根用 &lt;AppLayout&gt; 或 &lt;popup-host&gt; 包裹以继承主题变量
        </view>
        <view class="tip">
          · &lt;AppLayout&gt; 内置极光背景（aurora）+ 滚动容器 + Toast
        </view>
        <view class="tip">
          · 在小程序端可用 applyTheme() 同步窗口背景色
        </view>
      </view>
    </view>
  </AppLayout>
</template>

<script setup lang="ts">
import { useTheme } from '@/composables/useTheme'
import AppLayout from '@/components/AppLayout/AppLayout.vue'
import type { ThemeKey } from '@/config/theme'

const { currentTheme, currentThemeInfo, themeVars, themeList, setTheme, toggleTheme, applyTheme } = useTheme()

function onSelect(key: ThemeKey) {
  setTheme(key)
}

function onToggle() {
  toggleTheme()
}

function onApply() {
  applyTheme()
}

function onReset() {
  setTheme('light')
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
  color: var(--text);
  font-weight: 600;
  text-align: center;
  margin: 20rpx 0 40rpx;
}
.section {
  margin-bottom: 40rpx;
}
.section-title {
  font-size: 28rpx;
  color: var(--text-sec);
  margin-bottom: 16rpx;
  padding-left: 8rpx;
}
.info {
  font-size: 26rpx;
  color: var(--text);
  margin-bottom: 8rpx;
  padding: 12rpx 16rpx;
  background-color: var(--bg-alt);
  border: 1rpx solid var(--border);
  border-radius: 8rpx;
  font-family: monospace;
}
.info-label {
  color: var(--text-sec);
}
.info-value {
  color: var(--accent);
  font-weight: 500;
}

/* 主题卡片 */
.theme-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 20rpx;
}
.theme-card {
  background-color: var(--bg-alt);
  border: 2rpx solid var(--border);
  border-radius: 12rpx;
  padding: 20rpx;
  display: flex;
  flex-direction: column;
  align-items: center;
}
.theme-card.active {
  border-color: var(--accent);
  background-color: var(--surface);
}
.theme-card-hover {
  opacity: 0.7;
}
.theme-preview {
  width: 100%;
  height: 80rpx;
  border-radius: 8rpx;
  border: 1rpx solid var(--border);
  margin-bottom: 12rpx;
  display: flex;
  align-items: center;
  justify-content: center;
}
.theme-accent {
  width: 40rpx;
  height: 40rpx;
  border-radius: 50%;
}
.theme-name {
  font-size: 28rpx;
  color: var(--text);
  font-weight: 500;
}
.theme-check {
  font-size: 22rpx;
  color: var(--accent);
  margin-top: 4rpx;
}

/* 按钮 */
.btn {
  background-color: var(--accent);
  color: #fff;
  font-size: 30rpx;
  border-radius: 12rpx;
  padding: 24rpx 0;
  text-align: center;
  margin-bottom: 16rpx;
}
.btn-success {
  background-color: var(--success);
}
.btn-warn {
  background-color: var(--warning);
}
.btn-error {
  background-color: var(--error);
}
.btn-hover {
  opacity: 0.8;
}

/* 预览卡片 */
.preview-card {
  background-color: var(--bg-alt);
  border: 1rpx solid var(--border);
  border-radius: 16rpx;
  padding: 32rpx;
}
.preview-title {
  font-size: 32rpx;
  color: var(--text);
  font-weight: 600;
  margin-bottom: 20rpx;
}
.preview-text {
  font-size: 28rpx;
  color: var(--text);
  margin-bottom: 12rpx;
}
.preview-text-sec {
  font-size: 26rpx;
  color: var(--text-sec);
  margin-bottom: 12rpx;
}
.preview-border {
  font-size: 26rpx;
  color: var(--text);
  border-top: 1rpx solid var(--border);
  border-bottom: 1rpx solid var(--border);
  padding: 16rpx 0;
  margin: 16rpx 0;
}
.preview-buttons {
  display: flex;
  flex-wrap: wrap;
  gap: 12rpx;
  margin-top: 16rpx;
}
.preview-btn {
  font-size: 24rpx;
  color: #fff;
  padding: 12rpx 24rpx;
  border-radius: 8rpx;
}
.preview-btn.primary {
  background-color: var(--accent);
}
.preview-btn.success {
  background-color: var(--success);
}
.preview-btn.warn {
  background-color: var(--warning);
}
.preview-btn.error {
  background-color: var(--error);
}

/* 提示 */
.tip {
  font-size: 26rpx;
  color: var(--text-sec);
  margin-bottom: 12rpx;
  padding-left: 8rpx;
  line-height: 1.5;
}
</style>