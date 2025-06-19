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
    // 重新发起这个请求，并将其结果传递回之前等待的 Promise
    // 注意：这里的 network(config) 会根据 config 的类型（isUpload/isDownload）自动调用对应的 uni 方法
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

    // --- 文件上传/下载的特殊处理：进度显示和加载提示 ---
    // isUpload 和 isDownload 是 uni-network 内部添加的标志
    if (config.isUpload || config.isDownload) {
      // 文件上传/下载通常有自己的进度条，不适合统一的 showLoading/hideLoading
      // 如果你需要统一的进度条，可以在这里通过 uni.showLoading({ mask: true }) 显示
      // 并且需要一个全局状态来跟踪所有上传/下载的进度，或者为每个文件单独显示
      // 这里的 hideLoading 标志依然有效，可以用来禁用全局加载提示
      if (!config.hideLoading) {
        // uni.showToast({ title: '开始传输...', icon: 'loading', mask: true }); // 可以改为更具体的 toast
        console.log(`🚀 开始文件传输: ${config.url || config.filePath}`);
      }

      // 统一处理 onProgressUpdate 回调
      // uni.uploadFile 和 uni.downloadFile 的 onProgressUpdate 是一个函数回调
      // 我们可以在这里将它包装，以便在拦截器外更容易地获取和处理进度
      const originalOnProgressUpdate = config.onProgressUpdate;
      config.onProgressUpdate = function (res) {
        if (process.env.NODE_ENV === "development") {
          console.log(
            `📊 传输进度: ${res.progress}% (${res.totalBytesWritten}/${res.totalBytesExpected})`,
          );
        }
        // 这里可以触发一个全局事件或更新一个全局状态，以便在 UI 中显示进度条
        // 例如：uni.$emit('network:progress', { configId: config.__id__, progress: res.progress });
        if (
          originalOnProgressUpdate &&
          typeof originalOnProgressUpdate === "function"
        ) {
          originalOnProgressUpdate(res);
        }
      };
    } else {
      // 普通请求的加载提示
      if (!config.hideLoading) {
        uni.showLoading({
          title: "加载中...",
          mask: true,
        });
      }
    }

    config.currentRetryCount = config.currentRetryCount || 0;

    // --- 路由切换自动取消的核心逻辑 ---
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

    // --- 并发控制逻辑：检查是否达到并发上限 ---
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

    // 隐藏加载提示 (如果是非文件传输的请求错误)
    const config = error.config || {};
    if (!config.hideLoading && !config.isUpload && !config.isDownload) {
      uni.hideLoading();
    }

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
    processQueue();

    // 隐藏加载提示 (针对普通请求，文件传输的进度条由 onProgressUpdate 管理)
    if (!config.hideLoading && !config.isUpload && !config.isDownload) {
      uni.hideLoading();
    } else if (config.isUpload || config.isDownload) {
      // 文件传输完成，可以关闭进度条或结束提示
      // uni.hideToast(); // 如果之前显示了 loading toast
      console.log(`✅ 文件传输完成: ${config.url || config.filePath}`);
    }

    if (process.env.NODE_ENV === "development") {
      console.log("✅ 响应拦截器 -> 响应数据:", response.data || response); // 下载可能没有 data 字段
    }

    // --- 文件下载的特殊处理：返回结果 ---
    if (config.isDownload) {
      // 下载成功，response.tempFilePath 或 response.filePath 才是真正需要的数据
      // 这里的 response 是 uni-network 包装后的对象，会包含 tempFilePath 等
      if (response.statusCode === HttpStatusCode.Ok) {
        console.log(
          "🎉 文件下载成功，路径:",
          response.tempFilePath || response.filePath,
        );
        return response; // 返回完整的响应，包含 tempFilePath
      } else {
        const errorMsg = `文件下载失败，状态码: ${response.statusCode}`;
        console.error("❌ 下载错误:", errorMsg, response);
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

    // 隐藏加载提示 (针对普通请求，文件传输的进度条由 onProgressUpdate 管理)
    if (!config.hideLoading && !config.isUpload && !config.isDownload) {
      uni.hideLoading();
    } else if (config.isUpload || config.isDownload) {
      // 文件传输失败，可以关闭进度条或结束提示
      // uni.hideToast();
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
