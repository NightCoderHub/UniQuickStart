// utils/request.js
import config from "../config/request.js";

let loadingCount = 0; // 全局 Loading 计数器
let toastTimer = null; // 用于防抖的计时器
let isRedirecting = false; // 全局锁，防止重复跳转
let loadingTimer = null; // 用于控制 loading 延迟显示的定时器
let isLoadingShowing = false; // 标记 loading 是否已显示

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
    });
  }, 200);
};

const interceptors = {
  // 请求拦截器
  request: (options) => {
    // 1. 添加 Token
    const token = uni.getStorageSync("token");
    if (token) {
      options.header["e-token"] = `${token}`;
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
    success: (response) => {
      const { statusCode, data } = response;
      if (statusCode === 200) {
        if (
          Array.isArray(config.successCodes) &&
          config.successCodes.includes(data.code)
        ) {
          return Promise.resolve(data.data);
        } else if (data.code === 401) {
          uni.removeStorageSync("token");
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
            code: 401,
            message: "登录已过期,请重新登录",
            originalError: data,
          });
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

function request(options) {
  const finalOptions = {
    ...config,
    ...options,
    showLoading: options.showLoading ?? config.showLoading ?? false,
    header: {
      ...config.header,
      ...(options.header || {}),
    },
    url: config.baseURL + options.url,
  };
  const interceptedOptions = interceptors.request(finalOptions);

  return new Promise((resolve, reject) => {
    uni.request({
      ...interceptedOptions,
      success: (res) => {
        interceptors.response.success(res).then(resolve).catch(reject);
      },
      fail: (err) => {
        interceptors.response
          .fail({
            ...err,
            options: interceptedOptions,
          })
          .then(resolve)
          .catch(reject);
      },
    });
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
