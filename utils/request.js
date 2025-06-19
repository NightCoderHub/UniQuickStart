// src/utils/request.js

import un, {
  isUnCancel,
  UnError,
  HttpStatusCode,
  UnCancelToken,
} from "@uni-helper/uni-network";

// --- 全局路由取消令牌管理 ---
let currentRouteCancelTokenSource = null;

export function setRouteCancelTokenSource(source) {
  currentRouteCancelTokenSource = source;
  if (process.env.NODE_ENV === "development") {
    console.log("🔄 设置新的路由取消令牌源:", source.token);
  }
}

// --- 请求队列/并发控制相关变量 ---
let runningRequests = 0;
const requestQueue = [];

/**
 * 尝试从队列中取出并执行下一个请求
 */
function processQueue() {
  if (
    runningRequests < network.defaults.maxConcurrentRequests &&
    requestQueue.length > 0
  ) {
    const { resolve, config } = requestQueue.shift();
    runningRequests++;
    if (process.env.NODE_ENV === "development") {
      console.log(
        `🏃‍♂️ 执行队列请求: ${config.url || config.filePath} (当前运行: ${runningRequests}, 队列剩余: ${requestQueue.length})`,
      );
    }
    resolve(network(config));
  }
}

// --- 错误消息映射表 ---
const ERROR_MESSAGES = {
  // HTTP 状态码错误
  [HttpStatusCode.BadRequest]: "请求参数有误，请检查后重试 (400)",
  [HttpStatusCode.Unauthorized]: "登录信息已过期，请重新登录 (401)",
  [HttpStatusCode.Forbidden]: "您没有访问权限 (403)",
  [HttpStatusCode.NotFound]: "请求的资源不存在 (404)",
  [HttpStatusCode.MethodNotAllowed]: "请求方法不允许 (405)",
  [HttpStatusCode.InternalServerError]: "服务器开小差了，请稍后再试 (500)",
  [HttpStatusCode.BadGateway]: "网关错误 (502)",
  [HttpStatusCode.ServiceUnavailable]: "服务暂时不可用，请稍后再试 (503)",
  [HttpStatusCode.GatewayTimeout]: "网络连接超时，请稍后再试 (504)",

  // UnError 内部错误码
  [UnError.ERR_NETWORK]: "网络连接异常，请检查网络设置",
  [UnError.ETIMEDOUT]: "请求超时，请检查网络或稍后再试",
  [UnError.CANCELED]: "请求已取消", // 由 isUnCancel(error) 判断，但这里也做个映射

  // 自定义业务错误码 (假设后端有这样的错误码)
  BUSINESS_ERROR: "业务处理失败，请稍后再试", // 通用业务错误
  10001: "用户名或密码错误", // 示例业务码
  10002: "验证码不正确", // 示例业务码
  // ... 更多自定义业务码
};

/**
 * 获取用户友好的错误提示
 * @param {Object} error - 错误对象
 * @param {Object} config - 请求配置对象
 * @param {Object} responseData - 如果是业务错误，可能包含后端返回的 data
 * @returns {string} 用户友好的错误提示
 */
function getUserFriendlyErrorMessage(error, config, responseData = null) {
  let message = "未知错误，请联系客服"; // 默认兜底消息

  if (isUnCancel(error)) {
    // 请求被取消的错误
    message = ERROR_MESSAGES[UnError.CANCELED] || "请求已取消";
  } else if (error instanceof UnError) {
    // uni-network 抛出的 UnError 实例
    if (error.code === UnError.ERR_NETWORK) {
      message = ERROR_MESSAGES[UnError.ERR_NETWORK];
    } else if (error.code === UnError.ETIMEDOUT) {
      message = ERROR_MESSAGES[UnError.ETIMEDOUT];
    } else if (error.status) {
      // 带有 HTTP 状态码的 UnError
      message = ERROR_MESSAGES[error.status] || `HTTP 错误：${error.status}`;
    } else if (error.code && ERROR_MESSAGES[error.code]) {
      // 检查是否是自定义业务错误码（通过 error.code 传递的业务码）
      message = ERROR_MESSAGES[error.code];
    } else {
      // 其他 UnError，尝试使用其 message
      message = error.message;
    }
  } else if (error.statusCode) {
    // 某些情况下，error 直接是 uni 的响应对象，包含 statusCode
    message =
      ERROR_MESSAGES[error.statusCode] || `HTTP 错误：${error.statusCode}`;
  } else if (responseData && responseData.code) {
    // 业务错误，从后端返回的数据中获取 code
    message =
      ERROR_MESSAGES[responseData.code] ||
      responseData.msg ||
      ERROR_MESSAGES.BUSINESS_ERROR;
  } else if (error.message) {
    // 最后的兜底，使用 error 对象的 message 属性
    message = error.message;
  }

  // 避免显示内部或不友好的错误信息给用户
  if (message.includes("timeout of") || message.includes("network error")) {
    message =
      ERROR_MESSAGES[UnError.ETIMEDOUT] || ERROR_MESSAGES[UnError.ERR_NETWORK];
  }

  return message;
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
  maxConcurrentRequests: 5,
});

// --- 请求拦截器 ---
network.interceptors.request.use(
  function (config) {
    const token = uni.getStorageSync("token");
    if (token) {
      config.header = config.header || {};
      config.header.Authorization = `Bearer ${token}`;
    }

    if (config.isUpload || config.isDownload) {
      if (!config.hideLoading) {
        console.log(`🚀 开始文件传输: ${config.url || config.filePath}`);
      }

      const originalOnProgressUpdate = config.onProgressUpdate;
      config.onProgressUpdate = function (res) {
        if (process.env.NODE_ENV === "development") {
          console.log(
            `📊 传输进度: ${res.progress}% (${res.totalBytesWritten}/${res.totalBytesExpected})`,
          );
        }
        if (
          originalOnProgressUpdate &&
          typeof originalOnProgressUpdate === "function"
        ) {
          originalOnProgressUpdate(res);
        }
      };
    } else {
      if (!config.hideLoading) {
        uni.showLoading({
          title: "加载中...",
          mask: true,
        });
      }
    }

    config.currentRetryCount = config.currentRetryCount || 0;

    if (config.cancelToken === undefined && currentRouteCancelTokenSource) {
      config.cancelToken = currentRouteCancelTokenSource.token;
      if (process.env.NODE_ENV === "development") {
        console.log(
          "🔗 请求绑定到路由取消令牌:",
          config.url || config.filePath,
        );
      }
    } else if (
      config.cancelToken !== undefined &&
      config.cancelToken !== null &&
      config.cancelToken instanceof UnCancelToken
    ) {
      if (process.env.NODE_ENV === "development") {
        console.log(
          "🔗 请求绑定到自定义取消令牌:",
          config.url || config.filePath,
        );
      }
    } else if (config.cancelToken === null) {
      if (process.env.NODE_ENV === "development") {
        console.log("❌ 请求禁用路由取消:", config.url || config.filePath);
      }
    }

    if (config.cancelToken) {
      config.cancelToken.throwIfRequested();
    }

    if (runningRequests >= network.defaults.maxConcurrentRequests) {
      if (process.env.NODE_ENV === "development") {
        console.log(
          `⏸️ 请求进入队列: ${config.url || config.filePath} (当前运行: ${runningRequests}, 队列: ${requestQueue.length})`,
        );
      }
      return new Promise((resolve) => {
        requestQueue.push({ resolve, config });
      });
    } else {
      runningRequests++;
      if (process.env.NODE_ENV === "development") {
        console.log(
          `⬆️ 请求立即执行: ${config.url || config.filePath} (当前运行: ${runningRequests})`,
        );
      }
      return config;
    }
  },
  function (error) {
    if (runningRequests > 0) {
      runningRequests--;
      processQueue();
    }

    const config = error.config || {};
    if (!config.hideLoading && !config.isUpload && !config.isDownload) {
      uni.hideLoading();
    } else if (config.isUpload || config.isDownload) {
      console.error(
        `❌ 文件传输在请求阶段失败: ${config.url || config.filePath}`,
      );
    }

    // 调用新的错误处理函数并显示Toast
    const errorMessage = getUserFriendlyErrorMessage(error, config);
    console.error(
      "⚠️ 请求拦截器 -> 请求失败:",
      error,
      "显示消息:",
      errorMessage,
    );
    uni.showToast({
      title: errorMessage,
      icon: "none",
    });
    return Promise.reject(error);
  },
);

// --- 响应拦截器 ---
network.interceptors.response.use(
  function (response) {
    const config = response.config || {};

    runningRequests--;
    processQueue();

    if (!config.hideLoading && !config.isUpload && !config.isDownload) {
      uni.hideLoading();
    } else if (config.isUpload || config.isDownload) {
      console.log(`✅ 文件传输完成: ${config.url || config.filePath}`);
    }

    if (process.env.NODE_ENV === "development") {
      console.log("✅ 响应拦截器 -> 响应数据:", response.data || response);
    }

    // --- 文件下载的特殊处理：返回结果和错误判断 ---
    if (config.isDownload) {
      if (response.statusCode === HttpStatusCode.Ok) {
        console.log(
          "🎉 文件下载成功，路径:",
          response.tempFilePath || response.filePath,
        );
        return response;
      } else {
        // 下载失败的错误处理
        const errorMsg = getUserFriendlyErrorMessage(response, config); // 这里 response 对象就是错误信息来源
        console.error("❌ 文件下载错误:", errorMsg, response);
        uni.showToast({ title: errorMsg, icon: "none" });
        return Promise.reject(
          new UnError(
            errorMsg,
            String(response.statusCode),
            config,
            response.task,
            response,
          ),
        );
      }
    }

    // --- 普通请求和上传的业务判断 ---
    const resData = response.data;
    if (
      resData &&
      typeof resData === "object" &&
      (resData.code === 200 || resData.code === HttpStatusCode.Ok)
    ) {
      return response;
    } else {
      // 业务错误
      const errorMessage = getUserFriendlyErrorMessage(
        new UnError(
          "业务错误",
          (resData && resData.code) || "BUSINESS_ERROR",
          config,
          response.task,
          response,
        ),
        config,
        resData, // 传递后端返回的 resData 用于获取业务错误码和消息
      );
      console.error(
        "❌ 响应拦截器 -> 业务错误:",
        errorMessage,
        "完整响应:",
        response,
      );
      uni.showToast({
        title: errorMessage,
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
          errorMessage,
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
      runningRequests--;
      processQueue();
    }

    if (!config.hideLoading && !config.isUpload && !config.isDownload) {
      uni.hideLoading();
    } else if (config.isUpload || config.isDownload) {
      console.error(`❌ 文件传输失败: ${config.url || config.filePath}`);
    }

    // --- 重试机制逻辑 ---
    const retryDelay =
      typeof config.retryDelay === "number"
        ? config.retryDelay
        : network.defaults.retryDelay;

    if (shouldRetry) {
      config.currentRetryCount++;
      console.warn(
        `♻️ 请求失败，正在重试第 ${config.currentRetryCount} 次，URL: ${config.url || config.filePath}`,
      );
      return new Promise((resolve) => {
        setTimeout(() => {
          resolve(network(config));
        }, retryDelay * config.currentRetryCount);
      });
    }
    // --- 重试机制逻辑结束 ---

    // 调用新的错误处理函数并显示Toast
    const errorMessage = getUserFriendlyErrorMessage(error, config);
    // 如果是取消请求，getUserFriendlyErrorMessage 会返回 '请求已取消'，此时不显示 Toast
    if (isUnCancel(error)) {
      console.warn("⚡️ 请求被取消:", error.message);
      return Promise.reject(error);
    }

    console.error(
      "🚨 响应拦截器 -> 响应失败:",
      error,
      "显示消息:",
      errorMessage,
    );
    uni.showToast({
      title: errorMessage,
      icon: "none",
      duration: 2000,
    });
    return Promise.reject(error);
  },
);

export default network;

export { isUnCancel, UnError, HttpStatusCode, UnCancelToken };
