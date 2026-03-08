# 路由工具使用说明 (Router Utility)

这是一个基于 uni-app 原生路由封装的增强版路由工具，提供了类似 Vue Router 的开发体验。

## 核心特性

1.  **自动配置**：自动解析 `pages.json`（含分包和 TabBar），无需手动维护路由表。
2.  **命名路由**：支持通过 `name` 跳转，解耦具体路径。
3.  **路由守卫**：支持全局 `beforeEach` 钩子，内置登录权限拦截。
4.  **参数处理**：自动序列化/反序列化对象参数，支持 query 传参。
5.  **智能跳转**：自动识别 TabBar 页面并切换为 `switchTab`，自动处理 404 页面。

---

## 1. 路由配置

在 `utils/router.js` 的 `PAGE_META` 对象中配置页面元数据：

```javascript
// key: 绝对路径 (必须以 / 开头)
// value: { name: '别名', requiresAuth: 是否需要登录 }
const PAGE_META = {
  "/pages/index/index": { name: "home", requiresAuth: false },
  "/pages/me/index": { name: "me", requiresAuth: true },
  // ...
};
```

- **name**: 用于 `pushByName` 或 `{ name: '...' }` 跳转。
- **requiresAuth**: 为 `true` 时，未登录用户会被拦截并跳转至登录页。

## 2. 常用 API

引入方式：

```javascript
import router from "@/utils/router";
```

### 2.1 页面跳转

支持 **字符串路径** 或 **路由对象**：

```javascript
// 1. 普通跳转 (navigateTo)
router.push("/pages/modules/contract/index");

// 2. 带参数跳转
router.push("/pages/modules/contract/index", { id: 123, type: "new" });

// 3. 使用命名路由 (推荐)
router.push({ name: "module-contract", params: { id: 123 } });
// 或者
router.pushByName("module-contract", { id: 123 });
```

### 2.2 重定向 (redirectTo)

关闭当前页面，跳转到应用内的某个页面。

```javascript
router.replace({ name: "login" });
```

### 2.3 重启应用 (reLaunch)

关闭所有页面，打开到应用内的某个页面。

```javascript
router.reLaunch({ name: "home" });
```

### 2.4 切换 Tab (switchTab)

跳转到 TabBar 页面。**注意：`switchTab` 不支持 url 传参**。

```javascript
router.tab("/pages/index/index");
// 或
router.push({ name: "home" }); // 系统会自动识别这是 Tab 页并切换为 switchTab
```

### 2.5 返回 (navigateBack)

```javascript
router.back(); // 返回上一页
router.back(2); // 返回上两页
```

## 3. 路由传参

工具内部会自动处理参数的编码（`encodeURIComponent`）和对象序列化。

**发送方：**

```javascript
const user = { name: "张三", age: 18 };
router.push({ name: "profile", params: { user, id: 100 } });
```

**接收方 (onLoad)：**

```javascript
onLoad(options) {
  console.log(options.id); // "100"

  // 如果传递的是对象，uni-app 接收到的是 JSON 字符串，需自行解析
  if (options.user) {
    const user = JSON.parse(decodeURIComponent(options.user));
    console.log(user.name); // "张三"
  }
}
```

## 4. 路由守卫

### 全局前置守卫

可以在 `App.vue` 或 `main.js` 中注册：

```javascript
router.beforeEach((to, from) => {
  console.log("从", from.path, "去往", to.path);

  // 示例：特定页面需要额外校验
  if (to.name === "vip-page" && !isVip) {
    // 返回 false 阻止跳转
    // 或者返回字符串/对象重定向
    return { name: "vip-buy" };
  }

  // 返回 true 或 undefined 表示放行
  return true;
});
```

### 内置权限控制

默认集成了基于 Token 的权限检查：

1.  检查目标页面 `meta.requiresAuth` 是否为 `true`。
2.  检查本地存储 `uni.getStorageSync("token")` 是否存在。
3.  若无权限，自动记录目标页面路径，并跳转至 `/pages/login/index`。

## 5. 404 处理

如果跳转的路径或名称不存在，路由工具会自动尝试跳转到配置的 `not-found` 页面（需在 `PAGE_META` 中配置 `/pages/not-found/index`），并携带 `from` 参数指明来源。
