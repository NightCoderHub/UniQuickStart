// config/request.js
// /api-cts/cts/wechat

const ENV_BASE_URL = {
  development: "/services", //开发环境
  production: "https://api.ztc.gzhtsk.com/cts/wechat", // 生产环境
};

export default {
  // 根据当前环境获取 baseURL
  baseURL: ENV_BASE_URL[process.env.NODE_ENV || "development"],
  // 默认请求头
  header: {
    "Content-Type": "application/json; charset=UTF-8",
    Accept: "application/json",
  },
  // 默认超时时间,单位毫秒
  timeout: 15000,
  //业务成功的状态码
  successCodes: [200, 0],
  // 显示加载
  showLoading: true,
  // 其他自定义配置...
};
