import App from "./App";
import { createSSRApp } from "vue";
import { createPinia } from "pinia";
export function createApp() {
  const app = createSSRApp(App);
  const pinia = createPinia();
  app.use(pinia);

  // 添加全局开发中提示方法
  app.config.globalProperties.$devToast = () => {
    uni.showToast({
      title: "功能开发中，敬请期待",
      icon: "none",
      duration: 1200,
    });
  };

  return {
    app,
    pinia,
  };
}
