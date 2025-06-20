// src/utils/request.js

// 导入 uni-network 库及其核心功能
import un, {
  HttpStatusCode, // HTTP 状态码枚举
  // UnCancelToken, // 已移除: 不再需要取消令牌
} from "@uni-helper/uni-network";

// 扩展的错误消息映射表
const HttpStatusMessages = {
  // 客户端错误
  400: '请求数据有误，请检查输入',
  401: '会话已过期或未授权，请重新登录',
  403: '您没有权限执行此操作',
  404: '请求的资源不存在或已删除',
  405: '不允许的请求方法',
  406: '服务器无法生成您请求的数据格式',
  407: '需要通过代理进行身份验证',
  408: '请求超时，请检查网络或稍后重试',
  409: '操作冲突，数据可能已被修改，请刷新重试',
  410: '请求的资源已永久删除，无法访问',
  411: '请求缺少必要长度信息',
  412: '前提条件失败，数据可能已被其他操作修改',
  413: '请求内容过大，请减小文件大小或数据量',
  414: '请求地址过长，无法处理',
  415: '不支持的媒体类型，请检查上传文件格式',
  416: '请求的文件范围不合法',
  417: '服务器无法满足期望条件',
  421: '当前连接数过多，请稍后重试',
  422: '数据校验失败，请检查输入内容', // 具体错误信息应从后端响应中解析
  423: '资源已被锁定，请稍后重试',
  424: '依赖操作失败，无法完成请求',
  425: '服务器拒绝处理过早的请求',
  426: '需要升级到更安全的协议版本',
  449: '重试条件不足 (微软扩展)', // 极少见，但可以作为了解
  428: '请求缺少必要的前提条件',
  429: '操作过于频繁，请稍后重试',
  431: '请求头部过大，请清理浏览器缓存或Cookie',
  451: '该内容因法律原因无法访问',

  // 服务器错误
  500: '服务器内部错误，请稍后重试或联系管理员',
  501: '服务器不支持当前功能',
  502: '网关或代理错误，服务器通信异常',
  503: '服务暂时不可用，服务器可能在维护或过载',
  504: '网关超时，服务器间通信无响应',
  505: '不支持的 HTTP 协议版本',
  506: '服务器内部配置错误 (Variant Also Negotiates)',
  507: '服务器存储空间不足，无法完成操作',
  508: '服务器处理请求时检测到循环引用',
  510: '请求未包含服务器所需的扩展信息',
  511: '需要进行网络身份验证才能访问',

  // 默认错误
  DEFAULT_ERROR: '请求失败，请检查网络或联系管理员',
};

/**
 * 清除认证信息并重定向到登录页面。
 * 通常在 401 认证过期时调用。
 */
function clearAuthAndRedirectToLogin() {
  uni.removeStorageSync("token"); // 移除 Access Token
  uni.removeStorageSync("refreshToken"); // 移除 Refresh Token
  setTimeout(() => {
    uni.redirectTo({ url: "/pages/login/login" }); // 重定向到登录页
  }, 1500);
}

// --- Uni-Network 实例创建 ---
const network = un.create({
  // 根据开发/生产环境设置不同的基础URL
  baseUrl:
    process.env.NODE_ENV === "development"
      ? "http://localhost:3000" // 开发环境API地址
      : "https://prod.api.yourdomain.com/api", // 生产环境API地址
  timeout: 10000, // 请求超时时间 (毫秒)
  headers: {
    "Content-Type": "application/json;charset=UTF-8", // 默认请求头
  },
  // 验证HTTP状态码，只有符合条件的才被认为是成功的响应
  validateStatus: function (status) {
    return (
      (status >= HttpStatusCode.Ok &&
        status < HttpStatusCode.MultipleChoices) || // 2xx 范围
      status === HttpStatusCode.NotModified // 304 Not Modified
    );
  },
});

// --- 请求拦截器 ---
network.interceptors.request.use(
  function (config) {
    const token = uni.getStorageSync("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  function (error) {
    return Promise.reject(error);
  },
);

// --- 响应拦截器 (成功回调) ---
network.interceptors.response.use(
  function (response) {
    console.log('响应拦截器 (成功回调)', response.data)
    if (
      response.data &&
      response.data.code !== 0 &&
      response.data.code !== 200
    ) {
      const errorMessage = response.data.msg || response.data.message || "业务处理失败，请稍后再试";
      uni.showToast({
        title: errorMessage,
        icon: "none",
        duration: 2000,
      });
      return Promise.reject(errorMessage);
    }
    return response.data.data;
  },
  // 响应拦截器的错误回调
  function (error) {
    const errorResponse = error.toJSON();
    const statusCode = errorResponse.status;
    const errorMessage = HttpStatusMessages[statusCode] || HttpStatusMessages.DEFAULT_ERROR
    uni.showToast({
      title: errorMessage,
      icon: "none",
      duration: 2000,
    });
    if (error.status === HttpStatusCode.Unauthorized) {
      clearAuthAndRedirectToLogin();
      return Promise.reject(error);
    }
    return Promise.reject(error);
  },
);

// --- 导出 ---
// 导出配置好的 network 实例
export default network;
