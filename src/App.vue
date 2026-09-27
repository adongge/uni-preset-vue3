<script setup lang="ts">
import { onLaunch, onShow, onHide } from "@dcloudio/uni-app";
import { useAppStore } from '@/stores/app'
import { useUserStore } from '@/stores/user'
import { useThemeStore } from '@/stores/theme'

const appStore = useAppStore()
const userStore = useUserStore()
const themeStore = useThemeStore()

onLaunch(() => {
  console.log("App Launch");
  // 初始化系统信息（状态栏、安全区）
  appStore.init()
  // 从 storage 恢复登录态
  userStore.init()
  // 从 storage 恢复主题（必须在所有页面渲染前完成）
  themeStore.init()
});
onShow(() => {
  console.log("App Show");
});
onHide(() => {
  console.log("App Hide");
});
</script>

<style>
/* ============ 主题 CSS 变量定义 ============
 * 修复 ootd 项目中 CSS 变量未赋值的缺陷：
 * 通过属性选择器 [data-theme="xxx"] 为每套主题定义变量。
 * 实际作用域由 popup-host 或 AppLayout 根 view 上动态绑定的 :data-theme 提供。
 * 所有页面应使用 <popup-host> 或 <AppLayout> 包裹以继承主题变量。
 */

/* page 默认值：未加载完主题时使用浅色，避免闪烁 */
page {
  --bg: #F8F8F8;
  --bg-alt: #FFFFFF;
  --surface: #FFFFFF;
  --text: #1A1A1A;
  --text-sec: #8F8F94;
  --border: #E5E5EA;
  --accent: #007AFF;
  --accent-sec: #5856D6;
  --mask: rgba(0, 0, 0, 0.5);
  --success: #34C759;
  --warning: #F0AD4E;
  --error: #FF3B30;

  background-color: var(--bg);
  color: var(--text);
  /* 主题切换时窗口背景平滑过渡 */
  transition: background-color 0.3s ease, color 0.3s ease;
}

/* 浅色 */
[data-theme="light"] {
  --bg: #F8F8F8;
  --bg-alt: #FFFFFF;
  --surface: #FFFFFF;
  --text: #1A1A1A;
  --text-sec: #8F8F94;
  --border: #E5E5EA;
  --accent: #007AFF;
  --accent-sec: #5856D6;
  --mask: rgba(0, 0, 0, 0.5);
  --success: #34C759;
  --warning: #F0AD4E;
  --error: #FF3B30;
}

/* 深色 */
[data-theme="dark"] {
  --bg: #000000;
  --bg-alt: #1C1C1E;
  --surface: #2C2C2E;
  --text: #FFFFFF;
  --text-sec: #8E8E93;
  --border: #38383A;
  --accent: #0A84FF;
  --accent-sec: #5E5CE6;
  --mask: rgba(0, 0, 0, 0.7);
  --success: #30D158;
  --warning: #FF9F0A;
  --error: #FF453A;
}

/* 暖色 */
[data-theme="warm"] {
  --bg: #FFF8F0;
  --bg-alt: #FFEFE0;
  --surface: #FFFFFF;
  --text: #5C4B37;
  --text-sec: #A0826D;
  --border: #F0DCC4;
  --accent: #E76F51;
  --accent-sec: #D4A373;
  --mask: rgba(92, 75, 55, 0.5);
  --success: #588157;
  --warning: #E9C46A;
  --error: #E63946;
}

/* 冷色 */
[data-theme="cool"] {
  --bg: #EEF2F5;
  --bg-alt: #E1E8ED;
  --surface: #FFFFFF;
  --text: #2C3E50;
  --text-sec: #5D6D7E;
  --border: #C8D3DC;
  --accent: #3498DB;
  --accent-sec: #9B59B6;
  --mask: rgba(44, 62, 80, 0.5);
  --success: #27AE60;
  --warning: #F39C12;
  --error: #E74C3C;
}
</style>