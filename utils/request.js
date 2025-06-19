// src/utils/request.js

import un, {
  isUnCancel,
  UnError,
  HttpStatusCode,
  UnCancelToken,
} from "@uni-helper/uni-network";

// --- 全局路由取消令牌管理 ---
let currentRouteCancelTokenSource = null;

/**
 * 设置当前路由的 CancelTokenSource。由 App.vue 或路由守卫调用。
 * @param {object} source - UnCancelToken.source() 返回的源对象 { token, cancel }
 */
function setRouteCancelTokenSource(source) {
  currentRouteCancelTokenSource = source;
  if (process.env.NODE_ENV === "development") {
    console.log("🔄 设置新的路由取消令牌源:", source.token);
  }
}

// --- 网络请求实例创建 ---
const network = un.create({
  baseURL:
    process.env.NODE_ENV === "development"
      ? "http://localhost:3000/api"
      : "https://prod.api.yourdomain.com/api",
  timeout: 10000,
  header: {
    "Content-Type": "application/json;charset=UTF-8",
  },
  validateStatus: function (status) {
    return (
      (status >= HttpStatusCode.Ok &&
        status < HttpStatusCode.MultipleChoices) ||
      status === HttpStatusCode.NotModified
    );
  },

  retryTimes: 3,
  retryDelay: 1000,
});

// --- 请求拦截器 ---
network.interceptors.request.use(
  function (config) {
    const token = uni.getStorageSync("token");
    if (token) {
      config.header = config.header || {};
      config.header.Authorization = `Bearer ${token}`;
    }

    if (!config.hideLoading) {
      uni.showLoading({
        title: "加载中...",
        mask: true,
      });
    }

    config.currentRetryCount = config.currentRetryCount || 0;

    // --- 路由切换自动取消的核心逻辑 ---
    // 默认将请求绑定到当前的路由取消令牌
    // 如果 config.cancelToken 明确设置为 null，则表示该请求不被路由取消
    // 如果 config.cancelToken 已经是一个自定义的 UnCancelToken 实例，则使用自定义的
    if (config.cancelToken === undefined && currentRouteCancelTokenSource) {
      config.cancelToken = currentRouteCancelTokenSource.token;
      if (process.env.NODE_ENV === "development") {
        console.log("🔗 请求绑定到路由取消令牌:", config.url);
      }
    } else if (
      config.cancelToken !== undefined &&
      config.cancelToken !== null &&
      config.cancelToken instanceof UnCancelToken
    ) {
      // 用户传入了自定义的 cancelToken，使用用户的
      if (process.env.NODE_ENV === "development") {
        console.log("🔗 请求绑定到自定义取消令牌:", config.url);
      }
    } else if (config.cancelToken === null) {
      // 用户明确设置为 null，表示不取消
      if (process.env.NODE_ENV === "development") {
        console.log("❌ 请求禁用路由取消:", config.url);
      }
    }

    if (config.cancelToken) {
      // 在请求发送前检查是否已存在 cancelToken，如果已被取消，则直接抛出错误
      // 避免发送已被取消的请求
      config.cancelToken.throwIfRequested();
    }

    if (process.env.NODE_ENV === "development") {
      console.log("🚀 请求拦截器 -> 请求配置:", config);
    }

    return config;
  },
  function (error) {
    uni.hideLoading();
    console.error("⚠️ 请求拦截器 -> 请求失败:", error);
    uni.showToast({
      title: "网络请求失败，请稍后再试！",
      icon: "none",
    });
    return Promise.reject(error);
  },
);

// --- 响应拦截器 ---
network.interceptors.response.use(
  function (response) {
    const config = response.config || {};
    if (!config.hideLoading) {
      uni.hideLoading();
    }

    if (process.env.NODE_ENV === "development") {
      console.log("✅ 响应拦截器 -> 响应数据:", response.data);
    }

    const resData = response.data;
    if (
      resData &&
      typeof resData === "object" &&
      (resData.code === 200 || resData.code === HttpStatusCode.Ok)
    ) {
      return response;
    } else {
      const errorMsg = (resData && resData.msg) || "服务器忙，请稍后再试";
      console.error(
        "❌ 响应拦截器 -> 业务错误:",
        errorMsg,
        "完整响应:",
        response,
      );
      uni.showToast({
        title: errorMsg,
        icon: "none",
        duration: 2000,
      });

      if (resData && resData.code === 401) {
        uni.removeStorageSync("token");
        uni.showToast({
          title: "登录过期，请重新登录",
          icon: "none",
          duration: 1500,
          complete: function () {
            uni.navigateTo({ url: "/pages/login/login" });
          },
        });
      }

      return Promise.reject(
        new UnError(
          errorMsg,
          String((resData && resData.code) || "BUSINESS_ERROR"),
          config,
          response.task,
          response,
        ),
      );
    }
  },
  function (error) {
    const config = error.config || {};
    if (!config.hideLoading) {
      uni.hideLoading();
    }

    // --- 重试机制逻辑 ---
    const maxRetryTimes =
      typeof config.retryTimes === "number"
        ? config.retryTimes
        : network.defaults.retryTimes;
    const currentRetryCount = config.currentRetryCount || 0;
    const retryDelay =
      typeof config.retryDelay === "number"
        ? config.retryDelay
        : network.defaults.retryDelay;

    const shouldRetry =
      !isUnCancel(error) && // 确保不是取消请求
      currentRetryCount < maxRetryTimes &&
      (error.code === UnError.ERR_NETWORK ||
        error.code === UnError.ETIMEDOUT ||
        (error.status &&
          error.status >= HttpStatusCode.InternalServerError &&
          error.status < 600));

    if (shouldRetry) {
      config.currentRetryCount++;
      console.warn(
        `♻️ 请求失败，正在重试第 ${config.currentRetryCount} 次，URL: ${config.url}`,
      );

      return new Promise((resolve) => {
        setTimeout(() => {
          resolve(network(config));
        }, retryDelay * config.currentRetryCount);
      });
    }
    // --- 重试机制逻辑结束 ---

    // 如果不重试，则处理并抛出错误
    let errorMessage = "网络请求失败，请检查网络！";
    // --- 请求取消逻辑 ---
    // 如果是取消请求，直接返回 Promise.reject(error)，不再显示 toast
    if (isUnCancel(error)) {
      console.warn("⚡️ 请求被取消:", error.message);
      return Promise.reject(error); // 继续向下传递取消信息
    }
    // --- 请求取消逻辑结束 ---
    else if (error.status) {
      switch (error.status) {
        case HttpStatusCode.BadRequest:
          errorMessage = "请求参数错误 (400)";
          break;
        case HttpStatusCode.Unauthorized:
          errorMessage = "未授权 (401)，请重新登录";
          break;
        case HttpStatusCode.Forbidden:
          errorMessage = "无权限访问 (403)";
          break;
        case HttpStatusCode.NotFound:
          errorMessage = "请求资源不存在 (404)";
          break;
        case HttpStatusCode.InternalServerError:
          errorMessage = "服务器内部错误 (500)";
          break;
        case HttpStatusCode.BadGateway:
          errorMessage = "网关错误 (502)";
          break;
        case HttpStatusCode.ServiceUnavailable:
          errorMessage = "服务不可用 (503)";
          break;
        case HttpStatusCode.GatewayTimeout:
          errorMessage = "网关超时 (504)";
          break;
        default:
          errorMessage = `HTTP 错误：${error.status}`;
          break;
      }
    } else if (error.code === UnError.ETIMEDOUT) {
      errorMessage = "请求超时，请稍后再试！";
    } else if (error.code === UnError.ERR_NETWORK) {
      errorMessage = "网络连接异常，请检查网络设置！";
    } else if (error.message) {
      errorMessage = error.message;
    }

    console.error("🚨 响应拦截器 -> 响应失败:", error);
    uni.showToast({
      title: errorMessage,
      icon: "none",
      duration: 2000,
    });
    return Promise.reject(error);
  },
);

// 4. 导出配置好的网络请求实例和 UnCancelToken
export default network;

// 导出 UnCancelToken 和 setRouteCancelTokenSource，供 App.vue 使用
export {
  isUnCancel,
  UnError,
  HttpStatusCode,
  UnCancelToken,
  setRouteCancelTokenSource,
};
