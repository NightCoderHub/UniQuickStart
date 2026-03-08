import { defineStore } from "pinia";
import { silentLogin, phoneLogin, getUserInfo } from "@/api/user";

export const useUserStore = defineStore("user", {
  state: () => ({
    // 从本地存储获取初始数据
    userInfo: uni.getStorageSync("userInfo") || null,
    token: uni.getStorageSync("token") || "",
    refreshToken: uni.getStorageSync("refreshToken") || "",
    loginPromise: null, // 用于处理并发登录请求
  }),
  getters: {
    // 检查用户是否已登录
    isLoggedIn: (state) => !!state.token,
    // 获取用户姓名，如果未登录则显示默认文本
    userName: (state) => state.userInfo?.nickname || "您还未登录",
    // 获取用户星级评分，如果未登录则显示默认文本
    userRating: (state) => state.userInfo?.rating || "N/A",
    // 获取用户完单率，如果未登录则显示默认文本
    userCompletion: (state) => state.userInfo?.completion || "N/A",
    // 获取用户头像，如果未登录则显示默认头像
    userAvatar: (state) => state.userInfo?.avatar || "/static/default-avatar.jpg",
  },
  actions: {
    parseTokenPayload(payload) {
      if (!payload) return { token: "" };
      if (typeof payload === "string") return { token: payload };
      const token = payload.token || "";
      const refreshToken = payload.refresh_token || payload.refreshToken || "";
      return { token, refreshToken };
    },
    async verifyToken() {
      if (!this.token) return false;
      try {
        await getUserInfo();
        return true;
      } catch (err) {
        console.warn("Token 验证失败", err);
        // 若为401（登录态失效），清理本地用户信息，避免状态不一致
        if (err && err.code === 401) {
          try {
            this.clearUserInfo();
          } catch (e) {
            console.warn("清理用户信息失败", e);
            uni.removeStorageSync("userInfo");
            uni.removeStorageSync("token");
            uni.removeStorageSync("refreshToken");
          }
        }
        return false;
      }
    },
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
    // 更新用户信息
    updateProfile(userInfo) {
      this.userInfo = { ...this.userInfo, ...userInfo };
      uni.setStorageSync("userInfo", this.userInfo);
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

    // 静默登录 (wx.login)
    async wxSilentLogin({ force = false } = {}) {
      if (this.token && !force) {
        const valid = await this.verifyToken();
        if (valid) return { success: true };
      }

      // 如果已有正在进行的登录请求，直接返回该 promise
      if (this.loginPromise) return this.loginPromise;

      this.loginPromise = (async () => {
        try {
          // 1. 获取微信 code
          const { code } = await uni.login({ provider: "weixin" });
          if (!code) throw new Error("获取微信 code 失败");

          // 2. 调用后端接口
          const res = await silentLogin({ loginCode: code });
          // 3. 处理结果
          if (res && res.token) {
            const { token, refreshToken } = this.parseTokenPayload(res);
            this.setToken(token);
            if (refreshToken) this.setRefreshToken(refreshToken);
            try {
              const userInfo = await getUserInfo();
              this.setUserInfo(userInfo);
            } catch (err) {
              console.warn("获取用户信息失败", err);
            }
            return { success: true };
          } else if (res && res.needLogin) {
            // 需要手机号登录，静默登录失败，但不报错
            return { success: false, needPhone: true };
          } else {
            // 其他情况
            return { success: false, error: "Unknown response" };
          }
        } catch (error) {
          console.error("静默登录失败", error);
          return { success: false, error };
        } finally {
          this.loginPromise = null;
        }
      })();

      return this.loginPromise;
    },

    // 手机号快捷登录
    async handlePhoneLogin(phoneCode) {
      try {
        // 1. 获取微信 loginCode (用于后端绑定 openid)
        const { code: loginCode } = await uni.login({ provider: "weixin", onlyAuthorize: true });

        if (!loginCode) throw new Error("获取微信 code 失败");

        // 2. 调用手机号登录接口
        const res = await phoneLogin({
          phoneCode,
          loginCode,
        });

        if (res) {
          const { token, refreshToken } = this.parseTokenPayload(res);
          this.setToken(token);
          if (refreshToken) this.setRefreshToken(refreshToken);
          const userInfo = await getUserInfo();
          this.setUserInfo(userInfo);
          return { success: true };
        }
        return { success: false };
      } catch (e) {
        console.error("手机号登录失败", e);
        throw e;
      }
    },
  },
});
