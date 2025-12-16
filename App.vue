<script>
import { setupUpdateManager } from "@/utils/updateManager.js";
import { useDeviceStore } from "@/stores";
export default {
  onLaunch: function () {
    console.log("App Launch");
    setupUpdateManager();
    // 初始化设备信息
    const deviceStore = useDeviceStore();
    deviceStore.initSystemInfo();
    deviceStore.setNetworkStatus(uni.getNetworkType());

    // #ifndef MP-WEIXIN
    const privacyAgreed = uni.getStorageSync("privacy_policy_agreed");
    const browsingMode = uni.getStorageSync("browsing_mode"); // 获取浏览模式状态

    if (privacyAgreed || browsingMode) {
      console.log("用户已同意隐私协议或处于浏览模式，直接进入主界面。");
      // 检查当前页面是否是隐私协议页面，如果是，则导航回主页
      let pages = getCurrentPages();
      let currentPage = pages[pages.length - 1];
      if (currentPage && currentPage.route === "pages/privacy/privacy") {
        uni.reLaunch({
          url: "/pages/index/index",
        });
      }
    } else {
      console.log("用户尚未同意隐私协议且未进入浏览模式，跳转到隐私协议页面。");
      // 如果未同意且未进入浏览模式，跳转到隐私协议页面
      uni.reLaunch({
        url: "/pages/privacy/privacy",
      });
    }
    // #endif
  },
  onShow: function () {
    uni.hideTabBar();
    console.log("App Show");
  },
  onHide: function () {
    console.log("App Hide");
  },
  onError: function (err) {
    console.error("App Error:", err);
  },
};
</script>

<style lang="scss">
@import "@/style/iconfont/iconfont.css";
@import "@/style/wot-ui-variable.scss";

// @import url("//at.alicdn.com/t/c/font_4957471_a7eiz08441o.css");
::-webkit-scrollbar {
  display: none;
  width: 0;
  height: 0;
  color: transparent;
}

view,
scroll-view {
  box-sizing: border-box;
}

:root,
page {
  color: $uni-text-color;
  background-color: #f7f8fa;
}

uni-tabbar {
  display: none;
}

.wd-tabbar.is-fixed {
  right: var(--window-right) !important;
  left: var(--window-left) !important;
}

.z-paging-content-fixed,
.zp-loading-fixed {
  position: fixed;
  right: var(--window-right) !important;
  left: var(--window-left) !important;
  width: auto;
  height: auto;
}

/* 每个页面公共css */
</style>
