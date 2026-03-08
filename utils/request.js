// utils/request.js
import { REQUEST_CONFIG as config, RESPONSE_CODE } from "./constants.js";

import { useUserStore } from "@/stores";

let loadingCount = 0; // 全局 Loading 计数器
let toastTimer = null; // 用于防抖的计时器
let isRedirecting = false; // 全局锁，防止重复跳转
let loadingTimer = null; // 用于控制 loading 延迟显示的定时器
let isLoadingShowing = false; // 标记 loading 是否已显示

// 刷新Token相关变量
let isRefreshing = false; // 是否正在刷新Token
let requestsQueue = []; // 存储等待刷新的请求

// 封装一个独立的函数，用于控制 Loading 的显示和隐藏
const hideLoadingIfNeeded = (options) => {
  if (options.showLoading === true) {
    loadingCount = Math.max(0, loadingCount - 1);

    // 如果定时器存在，说明 loading 还没来得及显示，直接清除定时器
    if (loadingTimer) {
      clearTimeout(loadingTimer);
      loadingTimer = null; // 清除后置为 null
    }

    // 只有当 loading 已经显示，并且所有请求都完成后，才关闭 loading
    if (isLoadingShowing && loadingCount === 0) {
      uni.hideLoading();
      isLoadingShowing = false; // 重置状态
    }
  }
};

// 封装一个防抖函数，避免连续弹出 Toast
const showDebouncedToast = (title) => {
  if (toastTimer) {
    clearTimeout(toastTimer);
  }
  toastTimer = setTimeout(() => {
    uni.showToast({
      title,
      icon: "none",
      duration: 3000,
    });
  }, 200);
};

const interceptors = {
  // 请求拦截器
  request: (options) => {
    const userStore = useUserStore();
    // 1. 添加 Token
    const token = userStore.token;
    if (token) {
      options.header["authorization"] = `Bearer ${token}`;
    }

    // 2. 显示 Loading（使用计数器和定时器管理）
    if (options.showLoading === true) {
      // 只有在没有显示 loading 或没有定时器的情况下才创建新的定时器
      if (loadingCount === 0 && !loadingTimer) {
        loadingTimer = setTimeout(() => {
          uni.showLoading({ title: "加载中...", mask: true });
          isLoadingShowing = true; // 标记 loading 已经显示
          loadingTimer = null; // 定时器执行后置为 null
        }, 300); // 300ms 的延迟
      }
      loadingCount++;
    }
    return options;
  }, // 响应拦截器
  response: {
    // 响应成功
    success: async (response, options) => {
      const { statusCode, data } = response;
      const userStore = useUserStore();
      if (statusCode === 200) {
        if (Array.isArray(config.successCodes) && config.successCodes.includes(data.code)) {
          return Promise.resolve(data.data);
        } else if (data.code === RESPONSE_CODE.UNAUTHORIZED) {
          // 如果当前请求就是刷新token的请求，或者没有refreshToken，直接退出登录
          const refreshToken = userStore.refreshToken;
          if (options.url.includes("/sys/auth/access-token") || !refreshToken) {
            userStore.clearUserInfo();
            showDebouncedToast("登录已过期,请重新登录");
            if (!isRedirecting) {
              isRedirecting = true;
              setTimeout(() => {
                uni.reLaunch({
                  url: "/pages/login/index",
                  complete: () => {
                    isRedirecting = false;
                  },
                });
              }, 1500);
            }
            return Promise.reject({
              code: RESPONSE_CODE.UNAUTHORIZED,
              message: "登录已过期,请重新登录",
              originalError: data,
            });
          }

          if (!isRefreshing) {
            isRefreshing = true;
            try {
              // 调用刷新token接口
              const refreshRes = await new Promise((resolve, reject) => {
                uni.request({
                  url: config.baseURL + "/sys/auth/access-token",
                  method: "POST",
                  data: { refreshToken },
                  header: {
                    "content-type": "application/x-www-form-urlencoded",
                  },
                  success: (res) => {
                    if (
                      res.statusCode === 200 &&
                      Array.isArray(config.successCodes) &&
                      config.successCodes.includes(res.data.code)
                    ) {
                      resolve(res.data.data);
                    } else {
                      reject(res);
                    }
                  },
                  fail: reject,
                });
              });

              // 刷新成功，更新token
              const { access_token, refresh_token } = refreshRes;
              userStore.setToken(access_token);
              if (refresh_token) {
                userStore.setRefreshToken(refresh_token);
              }

              // 处理队列中的请求
              requestsQueue.forEach((cb) => cb(access_token));
              requestsQueue = [];

              // 重试当前请求
              return request(options);
            } catch {
              // 刷新失败，清空队列并跳转登录
              requestsQueue.forEach((cb) => cb(null));
              requestsQueue = [];
              userStore.clearUserInfo();
              showDebouncedToast("登录已过期,请重新登录");
              if (!isRedirecting) {
                isRedirecting = true;
                setTimeout(() => {
                  uni.reLaunch({
                    url: "/pages/login/index",
                    complete: () => {
                      isRedirecting = false;
                    },
                  });
                }, 1500);
              }
              return Promise.reject({
                code: RESPONSE_CODE.UNAUTHORIZED,
                message: "登录已过期,请重新登录",
                originalError: data,
              });
            } finally {
              isRefreshing = false;
            }
          } else {
            // 正在刷新，将请求加入队列
            return new Promise((resolve) => {
              requestsQueue.push((token) => {
                if (token) {
                  resolve(request(options));
                } else {
                  // token刷新失败，reject
                  resolve(
                    Promise.reject({
                      code: RESPONSE_CODE.UNAUTHORIZED,
                      message: "登录已过期,请重新登录",
                      originalError: data,
                    }),
                  );
                }
              });
            });
          }
        } else {
          /* 暂时注释掉500错误码的特殊处理
        else if (data.code === 500) {
          // 对500错误码进行特殊处理
          const errorMsg = data.msg || "";
          uni.showModal({
            title: "错误提示 (500)",
            content: errorMsg,
            confirmText: "复制错误",
            cancelText: "关闭",
            success: (res) => {
              if (res.confirm) {
                uni.setClipboardData({
                  data: `错误码: 500\n错误信息: ${errorMsg}`,
                  success: () => {
                    uni.showToast({
                      title: "错误信息已复制",
                      icon: "none",
                    });
                  },
                });
              }
            },
          });
          return Promise.reject({
            code: 500,
            message: errorMsg,
            originalError: data,
          });
        }
        */
          showDebouncedToast(data.msg || "请求失败");
          return Promise.reject({
            code: data.code,
            message: data.msg || "请求失败",
            originalError: data,
          });
        }
      } else {
        showDebouncedToast(`网络错误 ${statusCode}`);
        return Promise.reject({
          code: statusCode,
          message: `网络错误 ${statusCode}`,
          originalError: response,
        });
      }
    }, // 响应失败
    fail: (error) => {
      showDebouncedToast("网络连接异常,请稍后再试");
      return Promise.reject({
        code: 0,
        message: "网络连接异常,请稍后再试",
        originalError: error,
      });
    },
  },
};

// 存储请求任务的 Map，用于取消重复请求
const pendingRequests = new Map();

function request(options) {
  let url = options.url;
  if (url && !url.startsWith("http://") && !url.startsWith("https://")) {
    url = config.baseURL + url;
  }

  const finalOptions = {
    ...config,
    ...options,
    showLoading: options.showLoading ?? config.showLoading ?? false,
    header: {
      ...config.header,
      ...(options.header || {}),
    },
    url,
  };
  const interceptedOptions = interceptors.request(finalOptions);

  // 处理竞态条件/请求取消
  // 1. abortKey: 手动指定唯一标识，用于取消特定请求
  // 2. abortOld: 如果为 true，则根据 method + url 自动生成标识，取消之前的同类请求
  let abortKey = interceptedOptions.abortKey;
  if (!abortKey && interceptedOptions.abortOld) {
    // 使用原始 options.url (相对路径) 生成 key，避免拦截器添加时间戳/随机数导致 key 变化从而使防抖失效
    // 注意：这意味着并发请求同一接口(参数不同)会被互斥。如需并发，请勿开启 abortOld 或手动指定不同 abortKey
    abortKey = `${options.method || "GET"}:${options.url}`;
  }

  // 如果存在之前的同类请求，则取消
  if (abortKey && pendingRequests.has(abortKey)) {
    const task = pendingRequests.get(abortKey);
    if (task && typeof task.abort === "function") {
      task.abort();
    }
    pendingRequests.delete(abortKey);
  }

  return new Promise((resolve, reject) => {
    const requestTask = uni.request({
      ...interceptedOptions,
      success: (res) => {
        if (abortKey) pendingRequests.delete(abortKey);
        interceptors.response.success(res, interceptedOptions).then(resolve).catch(reject);
      },
      fail: (err) => {
        if (abortKey) pendingRequests.delete(abortKey);

        // 识别 aborted 请求 (errMsg 通常包含 abort 或 cancel)
        const isAborted = err.errMsg && (err.errMsg.indexOf("abort") !== -1 || err.errMsg.indexOf("cancel") !== -1);

        if (isAborted) {
          // 如果是被取消的请求，静默失败，不走通用的错误拦截器
          return reject({
            code: -1,
            message: "Request aborted",
            isAbort: true,
            originalError: err,
          });
        }

        interceptors.response
          .fail({
            ...err,
            options: interceptedOptions,
          })
          .then(resolve)
          .catch(reject);
      },
    });

    // 如果有 abortKey，保存 requestTask
    if (abortKey && requestTask) {
      pendingRequests.set(abortKey, requestTask);
    }
  }).finally(() => {
    hideLoadingIfNeeded(interceptedOptions);
  });
}

const http = {
  request,
  get: (url, params = {}, options = {}) =>
    request({
      url,
      method: "GET",
      data: params,
      ...options,
    }),
  post: (url, data = {}, options = {}) =>
    request({
      url,
      method: "POST",
      data,
      ...options,
    }),
  put: (url, data = {}, options = {}) =>
    request({
      url,
      method: "PUT",
      data,
      ...options,
    }),
  delete: (url, data = {}, options = {}) =>
    request({
      url,
      method: "DELETE",
      data,
      ...options,
    }),
};

export default http;
