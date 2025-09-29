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
    // #ifndef H5
    uni.hideTabBar();
    // #endif
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
  },
  onShow: function () {
    console.log("App Show");
  },
  onHide: function () {
    console.log("App Hide");
  },
  onError: function (err) {
    console.error("App Error:", err);
  },
  onPageNotFound: function (res) {
    console.warn("Page Not Found:", res);
    uni.redirectTo({
      url: "/pages/404/404", // 跳转到 404 页面
    });
  },
};
</script>

<style lang="scss">
/* 每个页面公共css */
@import "@/styles/iconfont/iconfont.css";
@import "@/styles/wot-ui-variable.scss";

/* 导入扩展样式文件 */
@import "@/styles/mixins.scss";
@import "@/styles/utilities.scss";
@import "@/styles/layout.scss";

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
  color: $uni-text-color-grey;
  background-color: $uni-bg-color-grey;
}

uni-tabbar {
  display: none;
}

// 针对性地重置表单组件的样式

/* 移除按钮的默认样式 */
button {
  padding: 0; /* 取消默认 padding */

  /* 规范字体 */
  font-size: 32rpx;
  line-height: 1; /* 取消默认行高 */
  background-color: transparent;

  /* 移除边框、背景色 */
  border: none;
  border-radius: 0; /* 取消默认圆角 */

  /* 避免 iOS 上的点击阴影 */
  -webkit-tap-highlight-color: transparent;
}

/* 避免按钮被点击时的透明度变化 */
button::after {
  border: none;
}

/* 统一输入框的字体和边框 */
input,
textarea {
  font-size: 32rpx;
  border: none;
  outline: none;
}

.z-paging-content-fixed,
.zp-loading-fixed {
  right: var(--window-right) !important;
  left: var(--window-left) !important;
}

.wd-tabbar {
  right: var(--window-right) !important;
  left: var(--window-left) !important;
}
</style>
