import App from "./App";
import { createSSRApp } from "vue";
import { createPinia } from "pinia";
import { navigateTo } from "@/utils/util";
// #ifdef H5
import VConsole from "vconsole";
new VConsole();
// #endif
uni.$devToast = () => {
  uni.showToast({
    title: "功能开发中",
    icon: "none",
    duration: 1200,
  });
};
uni.$navigateTo = navigateTo;
// #ifndef MP-WEIXIN
uni.loadFontFace({
  family: "PingFangSC-Medium",
  source: 'url("/static/fonts/PingFangSC-Medium.woff2")',
});

uni.loadFontFace({
  family: "PingFangSC",
  source: 'url("/static/fonts/PingFangSC-Regular.woff2")',
});
// #endif
export function createApp() {
  const app = createSSRApp(App);
  const pinia = createPinia();
  app.use(pinia);

  return {
    app,
    pinia,
  };
}
