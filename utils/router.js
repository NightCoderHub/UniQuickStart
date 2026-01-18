/**
 * 路由跳转工具类
 */
class Router {
  constructor() {
    // 1. 定义白名单（不需要登录就能访问的页面）
    this.whiteList = ["/pages/index/index", "/pages/login/index", "/pages/register/register"];

    this.methods = {
      push: "navigateTo",
      replace: "redirectTo",
      reLaunch: "reLaunch",
      tab: "switchTab",
      back: "navigateBack",
    };
  }

  /**
   * 模拟权限检查 (实际项目中通常检查 Token)
   */
  _hasPermission() {
    return !!uni.getStorageSync("token");
  }

  /**
   * 路由守卫拦截
   * @param {string} url 目标路径
   * @returns {boolean} 是否放行
   */
  _beforeEach(url) {
    // 去掉参数，只保留路径进行匹配
    const path = url.split("?")[0];

    // 如果在白名单中，直接放行
    if (this.whiteList.includes(path)) {
      return true;
    }

    // 检查是否有权限（如 Token）
    if (this._hasPermission()) {
      return true;
    }

    // 拦截：跳转到登录页，并记录来源页面以便登录后跳回
    uni.showToast({ title: "请先登录", icon: "none" });
    this.push("/pages/login/index", { redirect: url });
    return false;
  }

  /**
   * 核心跳转方法
   * @param {string} type - 跳转类型
   * @param {string} url - 目标页面路径
   * @param {object} params - 跳转携带的参数
   */
  _navigate(type, url, params = {}) {
    const method = this.methods[type];
    if (!method || typeof uni[method] !== "function") {
      return Promise.reject({
        code: "ROUTE_METHOD_INVALID",
        message: `Unknown router type: ${type}`,
      });
    }

    const canNavigate = this._beforeEach(url);
    if (!canNavigate) {
      return Promise.reject({
        code: "ROUTE_GUARD_BLOCKED",
        message: "Navigation blocked by guard",
      });
    }

    const canAttachQuery = method !== "switchTab";
    const queryString = canAttachQuery ? this._parseParams(params) : "";
    const fullPath = queryString ? `${url}?${queryString}` : url;

    return new Promise((resolve, reject) => {
      uni[method]({
        url: fullPath,
        success: (res) => resolve(res),
        fail: (err) => {
          console.error(`Router ${type} Error:`, err);
          reject({
            code: "ROUTE_CALL_FAIL",
            message: "Navigation call failed",
            originalError: err,
          });
        },
      });
    });
  }

  /**
   * 对象转查询字符串
   */
  _parseParams(params = {}) {
    const keys = Object.keys(params).filter((key) => params[key] !== undefined);
    if (!keys.length) {
      return "";
    }

    return keys
      .map((key) => {
        const raw = params[key];
        const encodedKey = encodeURIComponent(key);
        if (raw === null) {
          return `${encodedKey}=`;
        }
        if (typeof raw === "object") {
          return `${encodedKey}=${encodeURIComponent(JSON.stringify(raw))}`;
        }
        return `${encodedKey}=${encodeURIComponent(String(raw))}`;
      })
      .join("&");
  }

  // 保留当前页，跳转到应用内的某个页面
  push(url, params) {
    return this._navigate("push", url, params);
  }

  // 关闭当前页，跳转到应用内的某个页面
  replace(url, params) {
    return this._navigate("replace", url, params);
  }

  // 关闭所有页面，打开到应用内的某个页面
  reLaunch(url, params) {
    return this._navigate("reLaunch", url, params);
  }

  // 跳转到 tabBar 页面，并关闭其他所有非 tabBar 页面
  tab(url) {
    // switchTab 不支持通过 URL 传参，Uni-app 官方限制
    return this._navigate("tab", url);
  }

  // 关闭当前页面，返回上一页面或多级页面
  back(delta = 1) {
    return new Promise((resolve) => {
      uni.navigateBack({
        delta,
        success: () => resolve(),
      });
    });
  }
}

export default new Router();
