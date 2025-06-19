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
  log("INFO", "🔄 设置新的路由取消令牌源:", source.token);
}

// --- 请求队列/并发控制相关变量 ---
let runningRequests = 0;
const requestQueue = []; // 现在这是一个优先级队列

// --- 请求优先级定义 ---
const PRIORITY_LEVELS = {
  HIGH: 3,
  NORMAL: 2, // 默认优先级
  LOW: 1,
};

/**
 * 将请求添加到请求队列，根据优先级插入
 * @param {Object} item - 包含 resolve 和 config 的请求项
 */
function addRequestToQueue(item) {
  // 获取请求的优先级，默认为 NORMAL
  const requestPriority =
    PRIORITY_LEVELS[item.config.priority] || PRIORITY_LEVELS.NORMAL;

  let inserted = false;
  // 遍历队列，找到第一个优先级低于当前请求的位置，并在其之前插入
  for (let i = 0; i < requestQueue.length; i++) {
    const existingItemPriority =
      PRIORITY_LEVELS[requestQueue[i].config.priority] ||
      PRIORITY_LEVELS.NORMAL;
    if (requestPriority > existingItemPriority) {
      requestQueue.splice(i, 0, item); // 插入到当前位置之前
      inserted = true;
      break;
    }
  }
  // 如果没有找到更低优先级的，或者队列为空，则插入到队尾
  if (!inserted) {
    requestQueue.push(item);
  }
  log(
    "INFO",
    `➡️ 请求进入队列: ${item.config.url || item.config.filePath} (优先级: ${item.config.priority || "NORMAL"}, 队列长度: ${requestQueue.length})`,
  );
  // 仅在 DEBUG 模式下打印队列顺序，可能包含敏感信息，生产环境应避免
  if (LOG_LEVELS[network.defaults.logLevel || "NONE"] >= LOG_LEVELS.DEBUG) {
    log(
      "DEBUG",
      "当前队列顺序:",
      requestQueue.map((q) => ({
        url: q.config.url ? q.config.url.split("?")[0] : q.config.filePath,
        priority: q.config.priority || "NORMAL",
      })),
    );
  }
}

/**
 * 尝试从队列中取出并执行下一个请求
 */
function processQueue() {
  if (
    runningRequests < network.defaults.maxConcurrentRequests &&
    requestQueue.length > 0
  ) {
    const { resolve, config } = requestQueue.shift(); // 始终从队列头部取出请求（已保证是最高优先级）
    runningRequests++;
    log(
      "INFO",
      `🏃‍♂️ 执行队列请求: ${config.url || config.filePath} (当前运行: ${runningRequests}, 队列剩余: ${requestQueue.length})`,
    );
    config.__fromQueue = true; // 标记为来自队列的请求，以便跳过防抖/节流判断
    resolve(network(config));
  }
}

// --- 错误消息映射表 ---
const ERROR_MESSAGES = {
  [HttpStatusCode.BadRequest]: "请求参数有误，请检查后重试 (400)",
  [HttpStatusCode.Unauthorized]: "登录信息已过期，请重新登录 (401)",
  [HttpStatusCode.Forbidden]: "您没有访问权限 (403)",
  [HttpStatusCode.NotFound]: "请求的资源不存在 (404)",
  [HttpStatusCode.MethodNotAllowed]: "请求方法不允许 (405)",
  [HttpStatusCode.InternalServerError]: "服务器开小差了，请稍后再试 (500)",
  [HttpStatusCode.BadGateway]: "网关错误 (502)",
  [HttpStatusCode.ServiceUnavailable]: "服务暂时不可用，请稍后再试 (503)",
  [HttpStatusCode.GatewayTimeout]: "网络连接超时，请稍后再试 (504)",

  [UnError.ERR_NETWORK]: "网络连接异常，请检查网络设置",
  [UnError.ETIMEDOUT]: "请求超时，请检查网络或稍后再试",
  [UnError.CANCELED]: "请求已取消",

  BUSINESS_ERROR: "业务处理失败，请稍后再试",
  10001: "用户名或密码错误",
  10002: "验证码不正确",
};

/**
 * 获取用户友好的错误提示
 * @param {Object} error - 错误对象
 * @param {Object} config - 请求配置对象
 * @param {Object} responseData - 如果是业务错误，可能包含后端返回的 data
 * @returns {string} 用户友好的错误提示
 */
function getUserFriendlyErrorMessage(error, config, responseData = null) {
  let message = "未知错误，请联系客服";

  if (isUnCancel(error)) {
    message = ERROR_MESSAGES[UnError.CANCELED] || "请求已取消";
  } else if (error instanceof UnError) {
    if (error.code === UnError.ERR_NETWORK) {
      message = ERROR_MESSAGES[UnError.ERR_NETWORK];
    } else if (error.code === UnError.ETIMEDOUT) {
      message = ERROR_MESSAGES[UnError.ETIMEDOUT];
    } else if (error.status) {
      message = ERROR_MESSAGES[error.status] || `HTTP 错误：${error.status}`;
    } else if (error.code && ERROR_MESSAGES[error.code]) {
      message = ERROR_MESSAGES[error.code];
    } else {
      message = error.message;
    }
  } else if (error.statusCode) {
    message =
      ERROR_MESSAGES[error.statusCode] || `HTTP 错误：${error.statusCode}`;
  } else if (responseData && responseData.code) {
    message =
      ERROR_MESSAGES[responseData.code] ||
      responseData.msg ||
      ERROR_MESSAGES.BUSINESS_ERROR;
  } else if (error.message) {
    message = error.message;
  }

  if (message.includes("timeout of") || message.includes("network error")) {
    message =
      ERROR_MESSAGES[UnError.ETIMEDOUT] || ERROR_MESSAGES[UnError.ERR_NETWORK];
  }

  return message;
}

// --- 日志级别定义 ---
const LOG_LEVELS = {
  DEBUG: 4,
  INFO: 3,
  WARN: 2,
  ERROR: 1,
  NONE: 0,
};

// --- 日志输出函数 ---
/**
 * 根据配置的日志级别输出日志
 * @param {string} level - 日志级别 (DEBUG, INFO, WARN, ERROR)
 * @param {...any} args - 要打印的内容
 */
function log(level, ...args) {
  const currentLevel = network.defaults.logLevel || "NONE"; // 确保有默认值
  if (LOG_LEVELS[level] <= LOG_LEVELS[currentLevel]) {
    switch (level) {
      case "DEBUG":
        console.log("[DEBUG]", ...args);
        break;
      case "INFO":
        console.info("[INFO]", ...args);
        break;
      case "WARN":
        console.warn("[WARN]", ...args);
        break;
      case "ERROR":
        console.error("[ERROR]", ...args);
        break;
      default:
        console.log(`[${level}]`, ...args); // 避免未知级别不输出
    }
  }
}

// --- 请求防抖/节流相关状态 ---
const debounceStates = new Map(); // key -> { timerId, cancelSource, deferredPromise }
const throttleActivePromises = new Map(); // key -> Promise of the currently active throttled request

// Helper for creating a deferred promise
function createDeferred() {
  let resolve, reject;
  const promise = new Promise((res, rej) => {
    resolve = res;
    reject = rej;
  });
  return { resolve, reject, promise };
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
  logLevel: process.env.NODE_ENV === "development" ? "DEBUG" : "WARN",
});

// --- 重写 network.request 方法以实现节流 ---
const originalNetworkRequest = network.request;
network.request = function (config) {
  // 如果请求来自队列，则跳过节流/防抖判断，直接执行
  if (config.__fromQueue) {
    log(
      "DEBUG",
      `🔄 请求来自队列，跳过节流/防抖: ${config.url || config.filePath}`,
    );
    delete config.__fromQueue; // 移除标记
    // 标记为内部调用，以防止队列发出的请求再次被拦截器的防抖逻辑处理
    config.__isInternalCall = true;
    return originalNetworkRequest.call(this, config);
  }

  // --- 节流逻辑 (Throttle) ---
  if (typeof config.throttle === "number" && config.throttle > 0) {
    const throttleKey = config.throttleKey || `${config.url}_${config.method}`;
    const activePromise = throttleActivePromises.get(throttleKey);

    if (activePromise) {
      log(
        "INFO",
        `⏸️ 请求被节流: ${config.url || config.filePath} (key: ${throttleKey}). 返回现有 Promise。`,
      );
      return activePromise; // 如果有正在进行中的节流请求，则返回其 Promise
    } else {
      // 这是该节流键的第一个请求，让它正常发起
      // 标记为内部调用，以防止再次进入拦截器的防抖逻辑
      config.__isInternalCall = true;
      const requestPromise = originalNetworkRequest.call(this, config); // 调用原始的请求方法

      // 将此请求的 Promise 存储为活动状态
      throttleActivePromises.set(throttleKey, requestPromise);
      log(
        "DEBUG",
        `⬆️ 节流请求开始执行: ${config.url || config.filePath} (key: ${throttleKey}).`,
      );

      // 请求完成后，设置定时器在 throttle 延迟后清除活动状态
      requestPromise.finally(() => {
        setTimeout(() => {
          // 确保清除的是当前这个 Promise 的状态，防止被新请求覆盖后误删
          if (throttleActivePromises.get(throttleKey) === requestPromise) {
            throttleActivePromises.delete(throttleKey);
            log(
              "DEBUG",
              `节流状态清除: ${throttleKey} (延迟 ${config.throttle}ms).`,
            );
          }
        }, config.throttle);
      });
      return requestPromise;
    }
  }
  // 如果没有节流配置，则直接调用原始请求方法
  return originalNetworkRequest.call(this, config);
};

// --- 请求拦截器 ---
network.interceptors.request.use(
  function (config) {
    // 如果是内部调用（来自队列或节流逻辑），则跳过防抖/优先级/并发判断，直接返回 config
    if (config.__fromQueue || config.__isInternalCall) {
      if (config.__isInternalCall) delete config.__isInternalCall; // 移除内部调用标记
      return config;
    }

    // --- 防抖逻辑 (Debounce) ---
    if (typeof config.debounce === "number" && config.debounce > 0) {
      const debounceKey =
        config.debounceKey ||
        `${config.url || config.filePath}_${config.method}`;
      const existingState = debounceStates.get(debounceKey);

      if (existingState) {
        log(
          "INFO",
          `♻️ 请求被防抖: ${config.url || config.filePath} (key: ${debounceKey}). 清除前一个定时器。`,
        );
        clearTimeout(existingState.timerId);
        // 如果存在前一个请求的 CancelToken，则取消它
        if (existingState.cancelSource) {
          existingState.cancelSource.cancel("Debounced by new request");
        }
      }

      const currentDeferred = createDeferred(); // 这个 Promise 会立即返回给调用者
      const newCancelSource = UnCancelToken.source(); // 新的 CancelToken 用于实际发送的请求

      const timerId = setTimeout(() => {
        debounceStates.delete(debounceKey); // 定时器触发后从 Map 中移除
        // 将新的 CancelToken 绑定到 config 上，以确保延迟发送的请求可以被取消
        config.cancelToken = newCancelSource.token;
        // 标记为内部调用，以防止延迟发起的请求再次被防抖/节流处理
        config.__isInternalCall = true;
        log(
          "DEBUG",
          `🚀 发送防抖请求: ${config.url || config.filePath} (key: ${debounceKey}) after ${config.debounce}ms delay.`,
        );

        // 此时，实际的请求才被发起。
        network(config)
          .then(currentDeferred.resolve)
          .catch((error) => {
            // 如果错误是由于被更新的防抖请求取消的，则不传递错误
            if (
              isUnCancel(error) &&
              error.message === "Debounced by new request"
            ) {
              log("DEBUG", `防抖请求 ${debounceKey} 被新请求取消。`);
            } else {
              currentDeferred.reject(error);
            }
          });
      }, config.debounce);

      debounceStates.set(debounceKey, {
        timerId,
        cancelSource: newCancelSource,
        deferredPromise: currentDeferred,
      });

      // 拦截器立即返回这个 deferredPromise，阻止当前请求继续向下传递
      // 实际的请求会在定时器触发时才被发起
      return currentDeferred.promise;
    }

    // --- 路由切换自动取消的核心逻辑 (仅对非节流/防抖请求生效) ---
    // 这个逻辑在防抖/节流处理之后，确保它们拥有自己的取消机制
    if (config.cancelToken === undefined && currentRouteCancelTokenSource) {
      config.cancelToken = currentRouteCancelTokenSource.token;
      log("DEBUG", "🔗 请求绑定到路由取消令牌:", config.url || config.filePath);
    } else if (
      config.cancelToken !== undefined &&
      config.cancelToken !== null &&
      config.cancelToken instanceof UnCancelToken
    ) {
      log(
        "DEBUG",
        "🔗 请求绑定到自定义取消令牌:",
        config.url || config.filePath,
      );
    } else if (config.cancelToken === null) {
      log("DEBUG", "❌ 请求禁用路由取消:", config.url || config.filePath);
    }

    // 检查请求是否已被取消（由防抖或其他机制）
    if (config.cancelToken) {
      config.cancelToken.throwIfRequested();
    }

    // --- 并发控制与优先级逻辑：检查是否达到并发上限 ---
    if (runningRequests >= network.defaults.maxConcurrentRequests) {
      // 达到并发上限，将请求添加到优先级队列
      return new Promise((resolve) => {
        addRequestToQueue({ resolve, config }); // 使用优先级队列添加函数
      });
    } else {
      runningRequests++;
      log(
        "INFO",
        `⬆️ 请求立即执行: ${config.url || config.filePath} (当前运行: ${runningRequests})`,
      );
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
      log(
        "ERROR",
        `❌ 文件传输在请求阶段失败: ${config.url || config.filePath}`,
      );
    }

    const errorMessage = getUserFriendlyErrorMessage(error, config);
    if (isUnCancel(error)) {
      log("WARN", "⚡️ 请求被取消:", error.message);
      return Promise.reject(error);
    }

    log(
      "ERROR",
      "🚨 请求拦截器 -> 请求失败:",
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
      log("INFO", `✅ 文件传输完成: ${config.url || config.filePath}`);
    }

    log("DEBUG", "✅ 响应拦截器 -> 响应数据:", response.data || response);

    if (config.isDownload) {
      if (response.statusCode === HttpStatusCode.Ok) {
        log(
          "INFO",
          "🎉 文件下载成功，路径:",
          response.tempFilePath || response.filePath,
        );
        return response;
      } else {
        const errorMsg = getUserFriendlyErrorMessage(response, config);
        log("ERROR", "❌ 文件下载错误:", errorMsg, response);
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

    const resData = response.data;
    if (
      resData &&
      typeof resData === "object" &&
      (resData.code === 200 || resData.code === HttpStatusCode.Ok)
    ) {
      return response;
    } else {
      const errorMessage = getUserFriendlyErrorMessage(
        new UnError(
          "业务错误",
          (resData && resData.code) || "BUSINESS_ERROR",
          config,
          response.task,
          response,
        ),
        config,
        resData,
      );
      log(
        "ERROR",
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
      log("ERROR", `❌ 文件传输失败: ${config.url || config.filePath}`);
    }

    const retryDelay =
      typeof config.retryDelay === "number"
        ? config.retryDelay
        : network.defaults.retryDelay;

    if (shouldRetry) {
      config.currentRetryCount++;
      log(
        "WARN",
        `♻️ 请求失败，正在重试第 ${config.currentRetryCount} 次，URL: ${config.url || config.filePath}`,
      );
      return new Promise((resolve) => {
        setTimeout(() => {
          resolve(network(config));
        }, retryDelay * config.currentRetryCount);
      });
    }

    const errorMessage = getUserFriendlyErrorMessage(error, config);
    if (isUnCancel(error)) {
      log("WARN", "⚡️ 请求被取消:", error.message);
      return Promise.reject(error);
    }

    log(
      "ERROR",
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
