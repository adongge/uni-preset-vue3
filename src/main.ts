import { createSSRApp } from "vue";
import { createPinia } from "pinia";
import App from "./App.vue";
import { installLoginGuard } from "@/utils/navigate";

export function createApp() {
  const app = createSSRApp(App);
  app.use(createPinia());
  // 必须在 createPinia() 之后调用（守卫内部依赖 Pinia store）
  installLoginGuard();
  return {
    app,
  };
}
