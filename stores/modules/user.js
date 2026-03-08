import { defineStore } from "pinia";
import { silentLogin, phoneLogin, getUserInfo } from "@/api/user";

export const useUserStore = defineStore("user", {
  state: () => ({
    // 从本地存储获取初始数据
    userInfo: uni.getStorageSync("userInfo") || null,
    token: uni.getStorageSync("token") || "",
    tokenExpireTime: uni.getStorageSync("tokenExpireTime") || 0,
    refreshToken: uni.getStorageSync("refreshToken") || "",
    loginPromise: null, // 用于处理并发登录请求
  }),
  getters: {
    // 检查用户是否已登录
    isLoggedIn: (state) => !!state.token,
    // 获取用户姓名，如果未登录则显示默认文本
    userName: (state) => state.userInfo?.nickname || "您还未登录",
    // 获取用户头像，如果未登录则显示默认头像
    userAvatar: (state) => state.userInfo?.avatar || "/static/default-avatar.jpg",
  },
  actions: {
    /**
     * 核心持久化方法：同步更新 State 和 Storage
     * @param {Object} data 需要更新的键值对
     */
    _persist(data) {
      Object.keys(data).forEach((key) => {
        const value = data[key];
        this[key] = value;
        // 显式处理 null/undefined/空字符串
        if (value === null || value === undefined || value === "") {
          uni.removeStorageSync(key);
        } else {
          uni.setStorageSync(key, value);
        }
      });
    },

    /**
     * 解析并转换时间戳为绝对毫秒数
     */
    _formatExpireTime(ts) {
      const num = Number(ts);
      if (num === 0) return 0;
      // 如果数值很小（比如小于 1 年的秒数），判定为相对有效期，累加当前时间
      if (num < 31536000) {
        return Date.now() + num * 1000;
      }
      // 否则判定为绝对时间戳（秒级或毫秒级转换）
      return num < 10000000000 ? num * 1000 : num;
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

    // 统一设置 Token 相关信息
    setTokenInfo(payload) {
      if (!payload) return;

      // 兼容不同后端的字段名
      const token = payload.token || payload.access_token || "";
      const refreshToken = payload.refresh_token || payload.refreshToken || "";
      const rawExpire = payload.expires_in || payload.expire_time || payload.expireTime || 0;

      this._persist({
        token,
        refreshToken,
        tokenExpireTime: this._formatExpireTime(rawExpire),
      });
    },

    // 设置用户信息（例如：登录成功后调用）
    setUserInfo(userInfo) {
      this._persist({ userInfo });
    },

    // 更新用户信息
    updateUserInfo(userInfo) {
      this.userInfo = { ...this.userInfo, ...userInfo };
      uni.setStorageSync("userInfo", this.userInfo);
    },

    // 清除登录状态
    clearUserInfo() {
      this._persist({
        userInfo: null,
        token: "",
        tokenExpireTime: 0,
        refreshToken: "",
      });
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
            this.setTokenInfo(res);
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

        if (res && res.token) {
          this.setTokenInfo(res);
          try {
            const userInfo = await getUserInfo();
            this.setUserInfo(userInfo);
          } catch (err) {
            console.warn("获取用户信息失败", err);
          }
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
