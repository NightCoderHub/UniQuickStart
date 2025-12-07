import App from "./App";
import { createSSRApp } from "vue";
import { createPinia } from "pinia";
import { navigateTo } from "@/utils/util";
// #ifdef H5
// import VConsole from "vconsole";
// new VConsole();
// #endif
uni.$devToast = () => {
  uni.showToast({
    title: "功能开发中",
    icon: "none",
    duration: 1200,
  });
};
uni.$zp = {
  config: {
    "empty-view-img-style": { width: "400rpx", height: "200rpx" },
    "empty-view-img": "/static/empty/img_data_3x.png",
    "empty-view-error-img": "/static/empty/img_network_3x.png",
    "show-refresher-when-reload": true,
    "auto-show-back-to-top": true,
    "safe-area-inset-bottom": true,
  },
};
uni.$navigateTo = navigateTo;
export function createApp() {
  const app = createSSRApp(App);
  const pinia = createPinia();
  app.use(pinia);

  return {
    app,
    pinia,
  };
}
