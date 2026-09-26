<script setup lang="ts">
import { onLaunch, onShow, onHide } from "@dcloudio/uni-app";
import { useAppStore } from '@/stores/app'
import { useUserStore } from '@/stores/user'

const appStore = useAppStore()
const userStore = useUserStore()

onLaunch(() => {
  console.log("App Launch");
  // 初始化系统信息（状态栏、安全区）
  appStore.init()
  // 从 storage 恢复登录态
  userStore.init()
});
onShow(() => {
  console.log("App Show");
});
onHide(() => {
  console.log("App Hide");
});
</script>

<style></style>
