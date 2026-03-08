// 应用常量配置
export const COMPANY_INFO = {
  phone: "",
  email: "",
  address: "",
  slogan: "",
  description: "",
  website: "",
  copyright: "",
  support: "",
};

// 应用配置
export const APP_CONFIG = {
  name: "",
  version: uni.getAppBaseInfo().appVersion || "1.0.0",
  defaultPageSize: 10,
};

// 响应状态码
export const RESPONSE_CODE = {
  SUCCESS: 200, // 成功
  SUCCESS_ALT: 0, // 兼容部分接口返回 0 的情况
  UNAUTHORIZED: 401, // 未授权（跳转登录）
  FORBIDDEN: 403, // 无权限
  NOT_FOUND: 404, // 资源不存在
  SERVER_ERROR: 500, // 系统崩溃
};

// 微信支付配置
export const WECHAT_PAY_CONFIG = {
  mchId: "",
  appId: "",
};

// 环境基础URL配置
export const ENV_BASE_URL = {
  development: "/services",
  production: "https://api.ztc.gzhtsk.com/cts/wechat",
};

// 请求配置
export const REQUEST_CONFIG = {
  baseURL: ENV_BASE_URL[process.env.NODE_ENV || "development"],
  header: {
    "Content-Type": "application/json; charset=UTF-8",
    Accept: "application/json",
  },
  timeout: 15000,
  successCodes: [RESPONSE_CODE.SUCCESS, RESPONSE_CODE.SUCCESS_ALT],
  showLoading: false,
};

// 刷新token的接口地址
export const REFRESH_TOKEN_URL = `${REQUEST_CONFIG.baseURL}/auth/refresh-token`;

// 上传文件接口地址
export const UPLOAD_ACTION_URL = `${REQUEST_CONFIG.baseURL}/file/upload`;

// 腾讯地图key
export const TENCENT_MAP_KEY = "AD7BZ-55HLM-72N6E-6ZXGL-MKOLS-D3BJN";
