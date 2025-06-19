// src/utils/request.js

// 从 @uni-helper/uni-network 导入默认导出的 un 实例，
// 以及其他可能用到的工具函数，例如 isUnCancel，UnError，HttpStatusCode
import un, {
  isUnCancel,
  UnError,
  HttpStatusCode,
} from "@uni-helper/uni-network";

// 我们可以创建一个新的实例，或者直接使用默认的 'un' 实例
// 通常建议创建一个新的实例，这样可以为你的应用配置特定的 baseURL 和拦截器，
// 避免与其他可能也使用 'un' 的库产生冲突（尽管可能性较小）
const network = un.create({
  // 根据你的后端 API 调整 baseURL
  // 在 uni-app 中，建议使用环境变量来管理不同环境的 baseURL
  baseURL:
    process.env.NODE_ENV === "development"
      ? "http://localhost:3000/api"
      : "https://prod.api.yourdomain.com/api",
  timeout: 10000, // 请求超时时间，单位毫秒
  header: {
    "Content-Type": "application/json;charset=UTF-8",
    // 其他公共请求头，例如：'X-Requested-With': 'XMLHttpRequest'
  },
  // 可以根据需要调整默认的 validateStatus 行为
  validateStatus: function (status) {
    // 默认行为是 2xx 成功。这里我们允许所有 2xx 和 304 (Not Modified) 视为成功
    return (
      (status >= HttpStatusCode.Ok &&
        status < HttpStatusCode.MultipleChoices) ||
      status === HttpStatusCode.NotModified
    );
  },
});

// 2. 添加请求拦截器
network.interceptors.request.use(
  function (config) {
    // 在请求发送前做些什么，例如：
    // - 添加 token 到请求头
    const token = uni.getStorageSync("token");
    if (token) {
      // 这里的 config.header 可能是 undefined，需要安全地赋值
      config.header = config.header || {};
      config.header.Authorization = `Bearer ${token}`;
    }

    // - 显示加载提示
    // 假设你在 config 中添加一个自定义字段 hideLoading 来控制
    if (!config.hideLoading) {
      uni.showLoading({
        title: "加载中...",
        mask: true, // 显示透明蒙层，防止触摸穿透
      });
    }

    // - 打印请求信息 (开发环境)
    if (process.env.NODE_ENV === "development") {
      console.log("🚀 请求拦截器 -> 请求配置:", config);
    }

    return config;
  },
  function (error) {
    // 对请求错误做些什么
    uni.hideLoading(); // 隐藏加载提示
    console.error("⚠️ 请求拦截器 -> 请求失败:", error);
    uni.showToast({
      title: "网络请求失败，请稍后再试！",
      icon: "none",
    });
    return Promise.reject(error); // 继续向下传递错误
  },
);

// 3. 添加响应拦截器
network.interceptors.response.use(
  function (response) {
    // 隐藏加载提示
    // 这里的 response.config 是原始请求配置
    const config = response.config || {};
    if (!config.hideLoading) {
      uni.hideLoading();
    }

    // - 打印响应信息 (开发环境)
    if (process.env.NODE_ENV === "development") {
      console.log("✅ 响应拦截器 -> 响应数据:", response.data);
    }

    // - 根据后端返回的 code 或 status 进行业务判断
    // 假设后端返回的数据结构是 { code: number, msg: string, data: T }
    const resData = response.data;
    // 检查 resData 是否存在且是对象，避免访问 undefined 的属性
    if (
      resData &&
      typeof resData === "object" &&
      (resData.code === 200 || resData.code === HttpStatusCode.Ok)
    ) {
      return response; // 返回完整的响应对象
      // 如果你只想返回业务数据，可以 return resData.data; 但这样会丢失响应头等信息
    } else {
      // 统一处理业务错误
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

      // 特定错误码处理，例如 token 过期，跳转登录页
      if (resData && resData.code === 401) {
        uni.removeStorageSync("token"); // 清除过期 token
        uni.showToast({
          title: "登录过期，请重新登录",
          icon: "none",
          duration: 1500,
          complete: function () {
            // uni.reLaunch 或 uni.navigateTo 到登录页
            uni.navigateTo({ url: "/pages/login/login" });
          },
        });
      }

      // 抛出业务错误，让 Promise chain 进入 catch 块
      // 这里的错误可以是 UnError 或其他错误
      // 这里的 UnError 构造函数参数是 (message, code, config, task, response)
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
    // 隐藏加载提示
    // 这里的 error.config 可能是 undefined，需要安全地访问
    const config = error.config || {};
    if (!config.hideLoading) {
      uni.hideLoading();
    }

    // 对响应错误（网络错误、超时等）做些什么
    let errorMessage = "网络请求失败，请检查网络！";

    if (isUnCancel(error)) {
      // 如果是取消请求，通常不需要显示错误提示给用户，只需在控制台打印
      console.warn("⚡️ 请求被取消:", error.message);
      return Promise.reject(error); // 继续向下传递取消信息
    } else if (error.status) {
      // HTTP 状态码错误 (来自服务器的响应，但状态码不在 validateStatus 范围内)
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
      // 超时错误
      errorMessage = "请求超时，请稍后再试！";
    } else if (error.code === UnError.ERR_NETWORK) {
      // 其他网络错误
      errorMessage = "网络连接异常，请检查网络设置！";
    } else if (error.message) {
      // 兜底显示错误信息
      errorMessage = error.message;
    }

    console.error("🚨 响应拦截器 -> 响应失败:", error);
    uni.showToast({
      title: errorMessage,
      icon: "none",
      duration: 2000,
    });
    return Promise.reject(error); // 继续向下传递错误
  },
);

// 4. 导出配置好的网络请求实例
export default network;

// 如果需要，你也可以导出 isUnCancel 和 UnError 等工具函数，方便外部判断
export { isUnCancel, UnError, HttpStatusCode };
