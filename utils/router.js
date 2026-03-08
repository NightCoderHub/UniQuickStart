/**
 * 统一路由工具（uni-app）
 * - 路径匹配
 * - 按名称跳转
 * - 导航守卫
 * - 404 兜底
 */

// =====================================================================================
// 路由配置区域
// =====================================================================================

import pagesJson from "@/pages.json";

// =====================================================================================
// 路由配置区域
// =====================================================================================

// 1. 解析 pages.json 获取所有页面路径
const ALL_PAGE_PATHS = [];

// 解析主包
(pagesJson.pages || []).forEach((page) => {
  ALL_PAGE_PATHS.push(`/${page.path}`);
});

// 解析分包
(pagesJson.subPackages || []).forEach((sub) => {
  const root = sub.root;
  (sub.pages || []).forEach((page) => {
    ALL_PAGE_PATHS.push(`/${root}/${page.path}`);
  });
});

// 2. 解析 TabBar 路径
const TAB_PATHS = (pagesJson.tabBar?.list || []).map((item) => `/${item.pagePath}`);

// 3. 页面元数据配置：配置别名(name)和权限(requiresAuth)
// key: 绝对路径, value: { name, requiresAuth }
const PAGE_META = {
  "/pages/index/index": { name: "home", requiresAuth: false },
  "/pages/me/index": { name: "me", requiresAuth: true },
  "/pages/login/index": { name: "login", requiresAuth: false },
  "/pages/register/register": { name: "register", requiresAuth: false },
  "/pages/forgot-password/forgot-password": { name: "forgot-password", requiresAuth: false },
  "/pages/not-found/index": { name: "not-found", requiresAuth: false },
  // 新增页面建议在此处配置，否则将使用默认值（name=文件名, requiresAuth=false）
};

// 4. 生成最终路由表
const ROUTES = ALL_PAGE_PATHS.map((path) => {
  const meta = PAGE_META[path] || {};
  // 自动从路径生成 name: /pages/demo/test -> test
  const defaultName = path.split("/").pop();

  return {
    path,
    name: meta.name || defaultName,
    meta: {
      requiresAuth: meta.requiresAuth ?? false, // 默认无需登录
      tab: TAB_PATHS.includes(path), // 自动识别 Tab 页
    },
  };
});

// =====================================================================================
// 路由类定义
// =====================================================================================

class Router {
  constructor() {
    this.beforeGuards = [];

    this.methods = {
      push: "navigateTo",
      replace: "redirectTo",
      reLaunch: "reLaunch",
      tab: "switchTab",
    };

    this.routesByName = new Map(ROUTES.map((route) => [route.name, route]));
    this.routesByPath = new Map(ROUTES.map((route) => [route.path, route]));

    // 绑定 this，防止解构丢失上下文
    this.push = this.push.bind(this);
    this.replace = this.replace.bind(this);
    this.reLaunch = this.reLaunch.bind(this);
    this.tab = this.tab.bind(this);
    this.back = this.back.bind(this);
  }

  // 安全获取 404 路由
  _getNotFoundRoute() {
    const route = this.routesByName.get("not-found");
    if (!route) {
      console.error('[Router] "not-found" route is not defined in ROUTES configuration.');
      // 返回一个临时的安全对象，防止崩溃
      return { path: "/pages/index/index", name: "home" };
    }
    return route;
  }

  _hasPermission() {
    return !!uni.getStorageSync("token");
  }

  _parsePathWithQuery(url = "") {
    const [path, search = ""] = String(url).split("?");
    const query = {};
    if (search) {
      search.split("&").forEach((pair) => {
        if (!pair) return;
        const [rawKey, rawValue = ""] = pair.split("=");
        const key = decodeURIComponent(rawKey || "");
        const value = decodeURIComponent(rawValue || "");
        if (key) query[key] = value;
      });
    }
    return { path, query };
  }

  _resolveTarget(target, params = {}) {
    // 统一处理 fallback
    const fallbackRoute = this._getNotFoundRoute();

    if (typeof target === "object" && target?.name) {
      const route = this.routesByName.get(target.name) || fallbackRoute;
      return {
        route,
        path: route.path, // 此时 route 即使是 fallback 也有 path
        query: { ...params, ...(target.params || {}) },
      };
    }

    if (typeof target === "object" && target?.path) {
      const route = this.routesByPath.get(target.path) || fallbackRoute;
      return {
        route,
        path: route.path,
        query: { ...params, ...(target.params || {}) },
      };
    }

    const { path, query } = this._parsePathWithQuery(target);
    const route = this.routesByPath.get(path) || fallbackRoute;
    const isNotFound = !this.routesByPath.has(path);

    if (isNotFound) {
      return {
        route,
        path: route.path,
        query: {
          from: path,
          ...query,
        },
      };
    }

    return {
      route,
      path: route.path,
      query: { ...query, ...params },
    };
  }

  _parseParams(params = {}) {
    const keys = Object.keys(params).filter((key) => params[key] !== undefined);
    if (!keys.length) return "";

    return keys
      .map((key) => {
        const raw = params[key];
        const encodedKey = encodeURIComponent(key);
        if (raw === null) return `${encodedKey}=`;
        if (typeof raw === "object") {
          return `${encodedKey}=${encodeURIComponent(JSON.stringify(raw))}`;
        }
        return `${encodedKey}=${encodeURIComponent(String(raw))}`;
      })
      .join("&");
  }

  _getCurrentRoute() {
    const pages = getCurrentPages();
    const current = pages[pages.length - 1];
    if (!current) return null;

    const path = `/${current.route}`;
    const route = this.routesByPath.get(path) || null;
    return {
      route,
      path,
      query: current.options || {},
      fullPath: this._buildUrl(path, current.options || {}),
    };
  }

  _buildUrl(path, query = {}) {
    const queryString = this._parseParams(query);
    return queryString ? `${path}?${queryString}` : path;
  }

  _preloadRoute(route) {
    // UniApp 自动处理分包加载，此处仅为兼容性保留
    if (typeof route?.loader === "function") {
      route.loader().catch(() => {});
    }
  }

  beforeEach(guard) {
    if (typeof guard === "function") {
      this.beforeGuards.push(guard);
    }
  }

  async _runGuards(to, from) {
    if (to.route?.meta?.requiresAuth && !this._hasPermission()) {
      uni.showToast({ title: "请先登录", icon: "none" });
      return {
        allow: false,
        redirect: {
          path: "/pages/login/index",
          params: { redirect: to.fullPath },
        },
      };
    }

    for (const guard of this.beforeGuards) {
      const result = await Promise.resolve(guard(to, from));
      if (result === false) {
        return { allow: false };
      }
      if (typeof result === "string") {
        return { allow: false, redirect: { path: result } };
      }
      if (result && typeof result === "object" && (result.path || result.name)) {
        return { allow: false, redirect: result };
      }
    }

    return { allow: true };
  }

  async _navigate(type, target, params = {}) {
    let method = this.methods[type];
    if (!method || typeof uni[method] !== "function") {
      return Promise.reject({
        code: "ROUTE_METHOD_INVALID",
        message: `Unknown router type: ${type}`,
      });
    }

    const resolved = this._resolveTarget(target, params);
    // 自动识别 Tab 页
    if (resolved.route?.meta?.tab) {
      method = "switchTab";
    }

    const to = {
      ...resolved,
      fullPath: this._buildUrl(resolved.path, resolved.query),
    };

    // 警告：SwitchTab 丢失参数
    if (method === "switchTab" && Object.keys(resolved.query).length > 0) {
      console.warn("[Router] uni.switchTab does not support query parameters. Params will be ignored:", resolved.query);
    }

    const from = this._getCurrentRoute();

    const guardResult = await this._runGuards(to, from);
    if (!guardResult.allow) {
      if (guardResult.redirect) {
        const redirectTarget = guardResult.redirect.name
          ? { name: guardResult.redirect.name, params: guardResult.redirect.params }
          : { path: guardResult.redirect.path, params: guardResult.redirect.params };
        await this.replace(redirectTarget, {});
      }
      return Promise.reject({
        code: "ROUTE_GUARD_BLOCKED",
        message: "Navigation blocked by guard",
        redirect: guardResult.redirect, // 将重定向信息透传出去
      });
    }

    this._preloadRoute(to.route);

    const canAttachQuery = method !== "switchTab";
    const fullPath = canAttachQuery ? this._buildUrl(to.path, to.query) : to.path;

    return new Promise((resolve, reject) => {
      uni[method]({
        url: fullPath,
        success: resolve,
        fail: (err) => {
          reject({
            code: "ROUTE_CALL_FAIL",
            message: "Navigation call failed",
            originalError: err,
          });
        },
      });
    });
  }

  push(target, params) {
    return this._navigate("push", target, params);
  }

  pushByName(name, params) {
    return this.push({ name, params });
  }

  replace(target, params) {
    return this._navigate("replace", target, params);
  }

  reLaunch(target, params) {
    return this._navigate("reLaunch", target, params);
  }

  tab(target) {
    return this._navigate("tab", target);
  }

  back(delta = 1) {
    return new Promise((resolve, reject) => {
      uni.navigateBack({
        delta,
        success: resolve,
        fail: reject,
      });
    });
  }
}

export default new Router();
