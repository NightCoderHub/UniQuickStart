import App from "./App";
import { createSSRApp } from "vue";
import { createPinia } from "pinia";
import { navigateTo } from "@/utils/util";
import { dictHelper } from "@/utils/dictUtil.js";
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
    "empty-view-style": { "margin-top": "-300rpx" },
    "empty-view-img-style": { width: "400rpx", height: "400rpx" },
    "empty-view-img": "/static/empty/content.png",
    "empty-view-error-img": "/static/empty/network.png",
    "empty-view-text": "暂无内容",
    "show-refresher-when-reload": true,
    "auto-show-back-to-top": true,
    "safe-area-inset-bottom": true,
  },
};
uni.$navigateTo = navigateTo;
uni.$dict = dictHelper;
export function createApp() {
  const app = createSSRApp(App);
  const pinia = createPinia();
  app.use(pinia);

  return {
    app,
    pinia,
  };
}
