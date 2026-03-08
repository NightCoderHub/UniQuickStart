// utils/request.js
import { REQUEST_CONFIG, RESPONSE_CODE, REFRESH_TOKEN_URL } from "./constants.js";
import { useUserStore } from "@/stores";

class HttpRequest {
  constructor() {
    // --- 状态管理 ---
    this.loadingCount = 0;
    this.loadingTimer = null;
    this.isLoadingShowing = false;
    this.toastTimer = null;
    this.isRedirecting = false;

    // --- Token 刷新核心变量 ---
    this.isRefreshing = false;
    this.requestsQueue = [];
    this.cachedToken = null; // 内存 Token 缓存，减少对 Store 的频繁访问

    // --- 请求任务管理 (用于取消重复请求) ---
    this.pendingRequests = new Map();
  }

  // ================= UI 交互封装 =================

  /** 统一 Loading 显示逻辑 */
  _showLoading(options = {}) {
    // 如果是重试请求，不重复计数，防止 finally 块多次触发 hideLoading 导致计数错乱
    if (options._isRetry) return;

    if (this.loadingCount === 0 && !this.loadingTimer) {
      this.loadingTimer = setTimeout(() => {
        uni.showLoading({ title: "加载中...", mask: true });
        this.isLoadingShowing = true;
        this.loadingTimer = null;
      }, 300);
    }
    this.loadingCount++;
  }

  /** 统一 Loading 隐藏逻辑 */
  _hideLoading(options) {
    if (options.showLoading) {
      this.loadingCount = Math.max(0, this.loadingCount - 1);
      if (this.loadingTimer) {
        clearTimeout(this.loadingTimer);
        this.loadingTimer = null;
      }
      if (this.isLoadingShowing && this.loadingCount === 0) {
        uni.hideLoading();
        this.isLoadingShowing = false;
      }
    }
  }

  /** 防抖 Toast，避免弹出多个提示 */
  _showToast(title) {
    if (this.toastTimer) clearTimeout(this.toastTimer);
    this.toastTimer = setTimeout(() => {
      uni.showToast({ title, icon: "none", duration: 3000 });
    }, 200);
  }

  // ================= Token 核心优化逻辑 =================

  /** * 执行 Token 刷新
   * 包含：并发锁、请求队列、异常处理
   */
  async _handleRefreshToken(options) {
    const userStore = useUserStore();
    const refreshToken = userStore.refreshToken;

    const isRefreshPath = options.url.includes(REFRESH_TOKEN_URL);
    if (isRefreshPath || !refreshToken) {
      this._handleLogout();
      return Promise.reject({ code: RESPONSE_CODE.UNAUTHORIZED });
    }

    if (this.isRefreshing) {
      return new Promise((resolve) => {
        this.requestsQueue.push((newToken) => {
          if (newToken) {
            // 标记为重试，避免重复 loading 计数
            options._isRetry = true;
            // 统一转换 header，防止大小写冲突
            delete options.header["Authorization"];
            options.header["authorization"] = newToken.startsWith("Bearer ") ? newToken : `Bearer ${newToken}`;
            resolve(this.request(options));
          } else {
            resolve(Promise.reject({ code: RESPONSE_CODE.UNAUTHORIZED }));
          }
        });
      });
    }

    this.isRefreshing = true;
    try {
      const refreshRes = await this._execRefreshTokenRequest(refreshToken);
      userStore.setTokenInfo(refreshRes);
      const newToken = userStore.token;
      this.cachedToken = newToken;

      // 批量唤醒并传入新 token
      this.requestsQueue.forEach((cb) => cb(newToken));
      this.requestsQueue = [];

      // 当前请求也标记为重试并更新 header
      options._isRetry = true;
      delete options.header["Authorization"];
      options.header["authorization"] = newToken.startsWith("Bearer ") ? newToken : `Bearer ${newToken}`;
      return this.request(options);
    } catch (err) {
      this.requestsQueue = [];
      this._handleLogout();
      throw err;
    } finally {
      this.isRefreshing = false;
    }
  }

  /** 原生刷新请求 */
  _execRefreshTokenRequest(refreshToken) {
    return new Promise((resolve, reject) => {
      uni.request({
        url: REFRESH_TOKEN_URL,
        method: "POST",
        data: { refreshToken },
        header: { "content-type": "application/x-www-form-urlencoded" },
        timeout: 15000, // 显式设置 15 秒超时，覆盖默认的 60 秒
        success: (res) => {
          const isSuccess = res.statusCode === 200 && REQUEST_CONFIG.successCodes.includes(res.data.code);
          isSuccess ? resolve(res.data.data) : reject(res);
        },
        fail: reject,
      });
    });
  }

  /** 登出并跳转 */
  _handleLogout(msg = "登录已过期,请重新登录") {
    const userStore = useUserStore();
    userStore.clearUserInfo();
    this.cachedToken = null;
    this._showToast(msg);

    if (!this.isRedirecting) {
      this.isRedirecting = true;
      setTimeout(() => {
        uni.reLaunch({
          url: "/pages/login/index",
          complete: () => {
            this.isRedirecting = false;
          },
        });
      }, 1500);
    }
  }

  // ================= 请求流程控制 =================

  async request(options) {
    // 1. 合并配置
    const finalOptions = this._prepareOptions(options);

    // 2. 执行预检（主动刷新逻辑）
    const interceptedOptions = await this._requestInterceptor(finalOptions);

    // 3. 处理竞态取消 (abortOld)
    const abortKey = this._handleAbort(interceptedOptions);

    try {
      const response = await this._executeRequest(interceptedOptions, abortKey);
      return await this._responseInterceptor(response, interceptedOptions);
    } catch (error) {
      return this._errorInterceptor(error, interceptedOptions);
    } finally {
      this._hideLoading(interceptedOptions);
    }
  }

  _prepareOptions(options) {
    let url = options.url || "";
    if (url && !url.startsWith("http")) url = REQUEST_CONFIG.baseURL + url;
    return {
      ...REQUEST_CONFIG,
      ...options,
      url,
      showLoading: options.showLoading ?? REQUEST_CONFIG.showLoading ?? false,
      header: { ...REQUEST_CONFIG.header, ...(options.header || {}) },
    };
  }

  /** 请求拦截：注入 Token & 预检过期 */
  async _requestInterceptor(options) {
    const userStore = useUserStore();

    // 排除不需要 Token 的白名单
    const whiteList = ["/login", REFRESH_TOKEN_URL];
    const isWhiteList = whiteList.some((url) => options.url.includes(url));

    if (!isWhiteList && userStore.token) {
      // 1. 预检过期
      const BUFFER = 5 * 60 * 1000;
      if (userStore.tokenExpireTime && Date.now() + BUFFER > userStore.tokenExpireTime) {
        return await this._handleRefreshToken(options);
      }

      // 2. 注入 Token (统一小写)
      const token = this.cachedToken || userStore.token;
      options.header["authorization"] = token.startsWith("Bearer ") ? token : `Bearer ${token}`;
    }

    if (options.showLoading) this._showLoading(options);
    return options;
  }

  /** 响应拦截：处理业务 Code 和 401 */
  async _responseInterceptor(response, options) {
    const { statusCode, data } = response;

    // 业务成功直接返回
    if (statusCode === 200 && REQUEST_CONFIG.successCodes.includes(data.code)) {
      return data.data;
    }

    // 被动刷新逻辑：仅在 code 为 401 且重试次数 < 1 时触发
    if (data.code === RESPONSE_CODE.UNAUTHORIZED) {
      options._retryCount = options._retryCount || 0;
      if (options._retryCount < 1) {
        options._retryCount++;
        return await this._handleRefreshToken(options);
      } else {
        // 已重试过一次依然 401，说明 Token 刷新也救不了，强制登出
        this._handleLogout("登录状态失效，请重新登录");
        throw { code: data.code, message: "授权失败" };
      }
    }

    // 其他错误处理...
    this._showToast(data.msg || "请求失败");
    throw { code: data.code, message: data.msg };
  }

  /** 错误拦截：处理取消请求和网络异常 */
  _errorInterceptor(error) {
    const isAborted = error.errMsg?.includes("abort") || error.isAbort;
    if (isAborted) {
      return Promise.reject({ code: -1, message: "Request aborted", isAbort: true });
    }
    if (error.code) return Promise.reject(error);

    this._showToast("网络连接异常,请稍后再试");
    return Promise.reject({ code: 0, message: "网络连接异常", originalError: error });
  }

  _handleAbort(options) {
    let abortKey = options.abortKey;
    if (!abortKey && options.abortOld) {
      abortKey = `${options.method || "GET"}:${options.url}`;
    }
    if (abortKey && this.pendingRequests.has(abortKey)) {
      this.pendingRequests.get(abortKey).abort();
      this.pendingRequests.delete(abortKey);
    }
    return abortKey;
  }

  _executeRequest(options, abortKey) {
    return new Promise((resolve, reject) => {
      const requestTask = uni.request({
        ...options,
        success: (res) => {
          if (abortKey) this.pendingRequests.delete(abortKey);
          resolve(res);
        },
        fail: (err) => {
          if (abortKey) this.pendingRequests.delete(abortKey);
          reject(err);
        },
      });
      if (abortKey && requestTask) this.pendingRequests.set(abortKey, requestTask);
    });
  }
}

// 导出单例对象
const httpInstance = new HttpRequest();
const http = {
  request: (opts) => httpInstance.request(opts),
  get: (url, params, opts) => httpInstance.request({ url, method: "GET", data: params, ...opts }),
  post: (url, data, opts) => httpInstance.request({ url, method: "POST", data, ...opts }),
  put: (url, data, opts) => httpInstance.request({ url, method: "PUT", data, ...opts }),
  delete: (url, data, opts) => httpInstance.request({ url, method: "DELETE", data, ...opts }),
};

export default http;
