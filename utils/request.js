// request.js

// 默认配置
const defaultConfig = {
  baseUrl: "/services",
  timeout: 10000, // 默认超时时间 10000ms
  header: {
    "Content-Type": "application/json", // 默认 content-type 为 application/json
  },
  showLoading: true,
  interceptError: true, // 是否统一拦截错误
};

let requestQueue = []; // 请求队列，用于取消请求
let isLoading = false; // 控制loading显示

// 请求拦截器
const requestInterceptor = (options) => {
  // 统一添加token
  const token = uni.getStorageSync("token");
  if (token) {
    options.header = {
      ...options.header,
      Authorization: `Bearer ${token}`,
    };
  }

  // 显示Loading
  if (options.showLoading && !isLoading) {
    uni.showLoading({
      title: "加载中...",
      mask: true,
    });
    isLoading = true;
  }

  // 将请求添加到队列，用于后续取消
  requestQueue.push(options);

  return options;
};

// 响应拦截器
const responseInterceptor = (response, options) => {
  // 关闭Loading
  if (options.showLoading) {
    isLoading = false;
    uni.hideLoading();
  }

  // 从队列中移除请求
  requestQueue = requestQueue.filter((req) => req !== options);

  // 统一错误处理
  if (response.statusCode && response.statusCode !== 200) {
    if (options.interceptError) {
      uni.showToast({
        title: `请求失败：${response.statusCode}`,
        icon: "none",
      });
      // 可以根据 statusCode 进行更细致的处理，例如 token 过期跳转登录页
      if (response.statusCode === 401) {
        uni.navigateTo({ url: "/pages/login/login" });
      }
    }
    return Promise.reject(response); // 抛出错误，让业务层捕获
  }

  // 业务错误处理 (假设后端返回的数据结构为 { code: 0, msg: '成功', data: {} })
  // if (response.data && response.data.code !== 0) {
  //   if (options.interceptError) {
  //     uni.showToast({
  //       title: response.data.msg || '业务处理失败',
  //       icon: 'none'
  //     });
  //   }
  //   return Promise.reject(response.data);
  // }

  return response.data.data; // 返回真正的数据
};

// 核心请求方法
const request = (method, url, data = {}, options = {}) => {
  const mergedOptions = {
    ...defaultConfig,
    ...options,
    url: defaultConfig.baseUrl + url,
    method,
    data,
  };

  // 经过请求拦截器处理
  const processedOptions = requestInterceptor(mergedOptions);

  return new Promise((resolve, reject) => {
    // uni.request 返回 requestTask 对象，可用于中断请求
    const requestTask = uni.request({
      ...processedOptions,
      success: (res) => {
        // 经过响应拦截器处理
        try {
          const finalResult = responseInterceptor(res, processedOptions);
          resolve(finalResult);
        } catch (error) {
          reject(error);
        }
      },
      fail: (err) => {
        // 网络请求失败处理
        if (processedOptions.showLoading) {
          isLoading = false;
          uni.hideLoading();
        }
        requestQueue = requestQueue.filter((req) => req !== processedOptions); // 从队列中移除
        if (processedOptions.interceptError) {
          uni.showToast({
            title: "网络请求失败，请检查网络",
            icon: "none",
          });
        }
        reject(err);
      },
      // complete 回调函数会在接口调用结束时执行（调用成功、失败都会执行）
      complete: () => {
        // 可以在这里做一些收尾工作，例如清理计时器等
      },
    });

    // 将 requestTask 存储在 options 中，方便外部调用 abort
    processedOptions.requestTask = requestTask;
  });
};

// 封装get、post等方法
export default {
  get: (url, data, options) => request("GET", url, data, options), // method 有效值必须大写
  post: (url, data, options) => request("POST", url, data, options),
  put: (url, data, options) => request("PUT", url, data, options),
  delete: (url, data, options) => request("DELETE", url, data, options),

  // 取消所有请求（例如在路由跳转时调用）
  cancelAllRequests: () => {
    requestQueue.forEach((options) => {
      if (options.requestTask && options.requestTask.abort) {
        options.requestTask.abort(); // 调用 abort 方法中断请求
      }
    });
    requestQueue = [];
    if (isLoading) {
      isLoading = false;
      uni.hideLoading();
    }
  },
};
