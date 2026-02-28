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
      // silentLogin 内部有并发锁，安全调用
      const res = await userStore.silentLogin();
      if (res && res.needPhone) {
        const from = encodeURIComponent(buildFromUrl());
        uni.navigateTo({
          url: `/pages/login/index?from=${from}`,
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
