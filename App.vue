<script>
import { setupUpdateManager } from "@/utils/updateManager.js";
export default {
  onLaunch: function () {
    console.log("App Launch");
    setupUpdateManager();
    const privacyAgreed = uni.getStorageSync("privacy_policy_agreed");
    if (privacyAgreed) {
      console.log("用户已同意隐私协议，直接进入主界面。");
      // 检查当前页面是否是隐私协议页面，如果是，则导航回主页
      let pages = getCurrentPages();
      let currentPage = pages[pages.length - 1];
      if (currentPage && currentPage.route === "pages/privacy/privacy") {
        uni.reLaunch({
          url: "/pages/index/index",
        });
      }
    } else {
      console.log("用户尚未同意隐私协议，跳转到隐私协议页面。");
      // 如果未同意，跳转到隐私协议页面
      uni.reLaunch({
        url: "/pages/privacy/privacy",
      });
    }
  },
  onShow: function () {
    console.log("App Show");
    console.log("plus.runtime", plus.runtime);
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

<style>
/*每个页面公共css */
</style>
