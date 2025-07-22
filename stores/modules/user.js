import { defineStore } from "pinia";

export const useUserStore = defineStore("user", {
  state: () => ({
    // 从本地存储获取初始数据
    userInfo: uni.getStorageSync("userInfo") || null,
    token: uni.getStorageSync("token") || "",
    refreshToken: uni.getStorageSync("refreshToken") || "",
  }),
  getters: {
    // 检查用户是否已登录
    isLoggedIn: (state) => !!state.userInfo,
    // 获取用户姓名，如果未登录则显示默认文本
    userName: (state) => state.userInfo?.nickname || "您还未登录",
    // 获取用户星级评分，如果未登录则显示默认文本
    userRating: (state) => state.userInfo?.rating || "N/A",
    // 获取用户完单率，如果未登录则显示默认文本
    userCompletion: (state) => state.userInfo?.completion || "N/A",
    // 获取用户头像，如果未登录则显示默认头像
    userAvatar: (state) =>
      state.userInfo?.avatar || "/static/default-avatar.jpg",
  },
  actions: {
    // 设置用户信息（例如：登录成功后调用）
    setUserInfo(data) {
      this.userInfo = data;
      uni.setStorageSync("userInfo", data);
    },
    // 设置token
    setToken(token) {
      this.token = token;
      uni.setStorageSync("token", token);
    },
    // 设置刷新token
    setRefreshToken(refreshToken) {
      this.refreshToken = refreshToken;
      uni.setStorageSync("refreshToken", refreshToken);
    },
    // 清除用户信息和token（例如：登出时调用）
    clearUserInfo() {
      this.userInfo = null;
      this.token = "";
      this.refreshToken = "";
      uni.removeStorageSync("userInfo");
      uni.removeStorageSync("token");
      uni.removeStorageSync("refreshToken");
    },
  },
});
