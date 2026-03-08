import { storeToRefs } from "pinia";
import { useUserStore } from "@/stores";

export const useAuth = () => {
  const userStore = useUserStore();
  const { isLoggedIn, userInfo, token } = storeToRefs(userStore);

  /**
   * 初始化授权状态
   * 在小程序中尝试静默登录
   */
  const initAuth = async () => {
    // #ifdef MP-WEIXIN
    try {
      // wxSilentLogin 内部有并发锁，安全调用
      const res = await userStore.wxSilentLogin();
      if (res && res.needPhone) {
        const from = encodeURIComponent(buildFromUrl());
        uni.navigateTo({
          url: `/pages/login/index?from=${from}`,
        });
      } else if (res && res.error) {
        // 走到这里说明发生了异常（包括断网、500错误等）
        // 记录日志供排查
        console.warn("静默登录失败，服务器异常或网络不佳:", res.error);

        // 给出轻提示，安抚用户，但不阻断页面停留
        uni.showToast({
          title: "服务器开小差了，请稍后再试", // 或者 '系统繁忙'
          icon: "none",
          duration: 2000,
        });
      }
    } catch (error) {
      console.error("Silent login failed in useAuth:", error);
    }
    // #endif
  };

  const buildFromUrl = () => {
    try {
      const pages = getCurrentPages?.();
      const current = pages?.[pages.length - 1];
      if (!current) return "/pages/index/index";
      // vue3 小程序：可能存在 $page.fullPath
      const fullPath = current.$page?.fullPath;
      if (fullPath) return fullPath.startsWith("/") ? fullPath : `/${fullPath}`;
      // 回退：route + options
      const route = current.route?.startsWith("/") ? current.route : `/${current.route || "pages/index/index"}`;
      const opts = current.options || {};
      const query = Object.keys(opts)
        .map((k) => `${encodeURIComponent(k)}=${encodeURIComponent(opts[k])}`)
        .join("&");
      return query ? `${route}?${query}` : route;
    } catch (e) {
      console.error("Error building from URL:", e);
      return "/pages/index/index";
    }
  };

  /**
   * 检查是否登录，未登录则跳转
   * @param {boolean} redirect 是否自动跳转登录页
   * @returns {boolean}
   */
  const checkLogin = (redirect = true) => {
    if (!isLoggedIn.value) {
      if (redirect) {
        const from = encodeURIComponent(buildFromUrl());
        uni.navigateTo({
          url: `/pages/login/index?from=${from}`,
        });
      }
      return false;
    }
    return true;
  };

  return {
    userStore,
    isLoggedIn,
    userInfo,
    token,
    initAuth,
    checkLogin,
  };
};
