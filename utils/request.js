// src/utils/request.js

import un, {
  isUnCancel,
  UnError,
  HttpStatusCode,
  UnCancelToken,
} from "@uni-helper/uni-network";

// --- 全局路由取消令牌管理 ---
let currentRouteCancelTokenSource = null;

function setRouteCancelTokenSource(source) {
  currentRouteCancelTokenSource = source;
  if (process.env.NODE_ENV === "development") {
    console.log("🔄 设置新的路由取消令牌源:", source.token);
  }
}

// --- 请求队列/并发控制相关变量 ---
let runningRequests = 0; // 当前正在进行的请求数量
const requestQueue = []; // 请求队列，存放等待执行的请求

/**
 * 尝试从队列中取出并执行下一个请求
 */
function processQueue() {
  if (
    runningRequests < network.defaults.maxConcurrentRequests &&
    requestQueue.length > 0
  ) {
    const { resolve, config } = requestQueue.shift(); // 从队列头部取出一个请求
    runningRequests++; // 增加正在运行的请求数
    if (process.env.NODE_ENV === "development") {
      console.log(
        `🏃‍♂️ 执行队列请求: ${config.url} (当前运行: ${runningRequests}, 队列剩余: ${requestQueue.length})`,
      );
    }
    // 重新发起这个请求，并将其结果传递回之前等待的 Promise
    resolve(network(config));
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

  // --- 新增并发控制配置 ---
  maxConcurrentRequests: 5, // 最大并发请求数量，默认为 5
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
      if (process.env.NODE_ENV === "development") {
        console.log("🔗 请求绑定到自定义取消令牌:", config.url);
      }
    } else if (config.cancelToken === null) {
      if (process.env.NODE_ENV === "development") {
        console.log("❌ 请求禁用路由取消:", config.url);
      }
    }

    if (config.cancelToken) {
      config.cancelToken.throwIfRequested();
    }

    // --- 并发控制逻辑：检查是否达到并发上限 ---
    if (runningRequests >= network.defaults.maxConcurrentRequests) {
      if (process.env.NODE_ENV === "development") {
        console.log(
          `⏸️ 请求进入队列: ${config.url} (当前运行: ${runningRequests}, 队列: ${requestQueue.length})`,
        );
      }
      return new Promise((resolve) => {
        // 将请求信息和 Promise 的 resolve 函数存入队列
        requestQueue.push({ resolve, config });
      });
    } else {
      runningRequests++; // 增加正在运行的请求数
      if (process.env.NODE_ENV === "development") {
        console.log(
          `⬆️ 请求立即执行: ${config.url} (当前运行: ${runningRequests})`,
        );
      }
      return config; // 直接放行
    }
  },
  function (error) {
    // 请求发起前的错误，需要减少运行数并处理队列
    if (runningRequests > 0) {
      // 确保只对已经增加运行数的请求进行减操作
      runningRequests--;
      processQueue(); // 尝试处理队列中的下一个请求
    }

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

    // 无论请求成功还是失败，只要完成了，就减少运行数并处理队列
    runningRequests--;
    processQueue(); // 尝试处理队列中的下一个请求

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

    // 无论请求成功还是失败，只要完成了，就减少运行数并处理队列
    // 注意：重试机制会重新发起请求，这里需要确保在最终失败时才释放名额
    // 如果是重试，则不立即减少 runningRequests，而是等待重试完成或最终失败
    const maxRetryTimes =
      typeof config.retryTimes === "number"
        ? config.retryTimes
        : network.defaults.retryTimes;
    const currentRetryCount = config.currentRetryCount || 0;
    const shouldRetry =
      !isUnCancel(error) &&
      currentRetryCount < maxRetryTimes &&
      (error.code === UnError.ERR_NETWORK ||
        error.code === UnError.ETIMEDOUT ||
        (error.status &&
          error.status >= HttpStatusCode.InternalServerError &&
          error.status < 600));

    if (!shouldRetry) {
      // 只有当不进行重试时才释放名额
      runningRequests--;
      processQueue(); // 尝试处理队列中的下一个请求
    }

    if (!config.hideLoading) {
      uni.hideLoading();
    }

    // --- 重试机制逻辑 ---
    // ... (重试逻辑保持不变，它会在 shouldRetry 为 true 时返回一个 Promise，不会立即进入 finally)
    const retryDelay =
      typeof config.retryDelay === "number"
        ? config.retryDelay
        : network.defaults.retryDelay;

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

    // --- 请求取消逻辑 ---
    if (isUnCancel(error)) {
      console.warn("⚡️ 请求被取消:", error.message);
      return Promise.reject(error);
    }
    // --- 请求取消逻辑结束 ---

    let errorMessage = "网络请求失败，请检查网络！";
    if (error.status) {
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

export default network;

export {
  isUnCancel,
  UnError,
  HttpStatusCode,
  UnCancelToken,
  setRouteCancelTokenSource,
};
