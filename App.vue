<script>
import { setupUpdateManager } from "@/utils/updateManager.js";
import { useDeviceStore } from "@/stores";
import { useAuth } from "@/composables/useAuth";
import { useUserStore } from "@/stores";
import { usePrivacyStore } from "@/stores/modules/privacy.js";

export default {
  onLaunch: function () {
    console.log("App Launch");
    setupUpdateManager();
    // 初始化设备信息
    const deviceStore = useDeviceStore();
    deviceStore.initSystemInfo();
    deviceStore.setNetworkStatus(uni.getNetworkType());

    const privacyStore = usePrivacyStore();
    privacyStore.refreshFromStorage();
    const privacyAgreed = privacyStore.isAgreed;
    const browsingMode = privacyStore.isBrowsing; // 获取浏览模式状态

    if (privacyAgreed || browsingMode) {
      console.log("用户已同意隐私协议或处于浏览模式，直接进入主界面。");
      // 检查当前页面是否是隐私协议页面，如果是，则导航回主页
      let pages = getCurrentPages();
      if (pages.length > 0) {
        let currentPage = pages[pages.length - 1];
        if (currentPage && currentPage.route === "pages/privacy/privacy") {
          uni.reLaunch({
            url: "/pages/index/index",
          });
        }
      }
    } else {
      console.log("用户尚未同意隐私协议且未进入浏览模式，跳转到隐私协议页面。");
      // 如果未同意且未进入浏览模式，跳转到隐私协议页面
      uni.reLaunch({
        url: "/pages/privacy/privacy",
      });
      return;
    }

    // #ifdef MP-WEIXIN
    // 仅在已同意隐私且非浏览模式时尝试静默登录
    if (privacyAgreed && !browsingMode) {
      const { initAuth } = useAuth();
      initAuth();
    }
    // #endif
    uni.onNetworkStatusChange((res) => {
      deviceStore.setNetworkStatus(res);
      const privacyStore = usePrivacyStore();
      privacyStore.refreshFromStorage();
      const agreed = privacyStore.isAgreed;
      const browsing = privacyStore.isBrowsing;
      const userStore = useUserStore();
      if (agreed && !browsing && !userStore.isLoggedIn && !userStore.loginPromise) {
        const { initAuth } = useAuth();
        initAuth();
      }
    });

    // #ifdef H5
    uni.preloadPage({ url: "/pages/technician-list/technician-list" });
    uni.preloadPage({ url: "/pages/community-feed/community-feed" });
    uni.preloadPage({ url: "/pages/me/index" });
    // #endif
  },
  onShow: function () {
    console.log("App Show");
    const privacyStore = usePrivacyStore();
    privacyStore.refreshFromStorage();
    const agreed = privacyStore.isAgreed;
    const browsing = privacyStore.isBrowsing;
    // #ifdef MP-WEIXIN
    if (agreed && !browsing) {
      const userStore = useUserStore();
      if (!userStore.isLoggedIn && !userStore.loginPromise) {
        const { initAuth } = useAuth();
        initAuth();
      }
    }
    // #endif
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

// @import url("//at.alicdn.com/t/c/font_4957471_j8quuzccvfp.css");
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
