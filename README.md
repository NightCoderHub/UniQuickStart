# UniQuickStart

UniApp 模板。

## 📱 项目介绍

UniQuickStart 是一个基于 UniApp 框架的跨平台应用开发模板。

## 🛠️ 技术栈

- **框架**: UniApp + Vue 3
- **状态管理**: Pinia
- **UI 组件**: wot-design-uni
- **分页组件**: z-paging
- **开发语言**: JavaScript/TypeScript
- **代码规范**: ESLint + Prettier + Stylelint
- **包管理器**: pnpm
- **构建工具**: Vite
- **版本控制**: Git + Husky

## 📋 环境要求

- Node.js >= 16.0.0
- pnpm >= 8.0.0
- HBuilderX (推荐) 或 VS Code

## 🚀 快速开始

### 1. 克隆项目

```bash
git clone <repository-url>
cd UniQuickStart
```

### 2. 安装依赖

```bash
pnpm install
```

## 📁 项目结构

```
UniQuickStart/
├── api/                    # API 接口定义
│   ├── auth.js            # 认证相关接口
│   └── index.js           # 通用接口
├── components/            # 公共组件
│   ├── anime-card/        # 动漫卡片组件
│   ├── custom-tabbar/     # 自定义底部导航
│   └── action-confirmation-modal/ # 确认弹窗组件
├── pages/                 # 页面文件
│   ├── index/            # 首页
│   ├── login/            # 登录页
│   ├── me/               # 个人中心
│   ├── register/         # 注册页
│   ├── forgot-password/  # 忘记密码
│   ├── privacy/          # 隐私政策
│   ├── address/          # 地址管理
│   ├── agreement/        # 服务协议
│   └── feedback/         # 意见反馈
├── settingPages/          # 设置相关分包页面
│   ├── setting/          # 系统设置
│   ├── account/          # 账户设置
│   ├── legal/            # 法律条款
│   ├── help-feedback/    # 帮助反馈
│   ├── about/            # 关于我们
│   └── system-permissions/ # 系统权限
├── static/               # 静态资源
│   ├── tabbar/           # 底部导航图标
│   └── images/           # 图片资源
├── stores/               # 状态管理
│   ├── modules/          # 状态模块
│   │   └── device.js     # 设备状态和用户位置
│   │   └── user.js       # 用户状态
│   └── index.js          # 状态入口
├── style/                # 样式文件
│   ├── iconfont          # 图标字体
│   └── wot-ui-variable.scss # UI 变量
├── utils/                # 工具函数
│   ├── request.js        # 网络请求封装
│   └── util.js           # 通用工具
│   └── constants.js      # 应用常量
├── App.vue               # 应用入口
├── main.js               # 主入口文件
├── manifest.json         # 应用配置
├── pages.json            # 页面配置
├── vite.config.js        # Vite 配置
└── package.json          # 项目配置
```

## 🔧 开发指南

### 代码规范

项目集成了完整的代码规范工具链：

```bash
# 代码检查
pnpm lint:check

# 代码修复
pnpm lint

# 格式化检查
pnpm format:check

# 格式化代码
pnpm format

# 样式检查
pnpm lint:style
```

### 状态管理

使用 Pinia 进行状态管理，示例：

```javascript
// stores/modules/user.js
import { defineStore } from "pinia";

export const useUserStore = defineStore("user", {
  state: () => ({
    userInfo: uni.getStorageSync("userInfo") || null,
  }),
  getters: {
    isLoggedIn: (state) => !!state.userInfo,
  },
  actions: {
    setUserInfo(userInfo) {
      this.userInfo = userInfo;
      uni.setStorageSync("userInfo", userInfo);
    },
  },
});
```

### 网络请求

使用封装的 request 工具：

```javascript
import request from "@/utils/request";

// GET 请求
const data = await request.get("/api/data");

// POST 请求
const result = await request.post("/api/login", {
  username: "user",
  password: "pass",
});
```

### 组件开发

使用 wot-design-uni 组件库：

```vue
<template>
  <wd-button type="primary" @click="handleClick"> 点击按钮 </wd-button>
</template>
```

## 🔑 配置说明

### 环境配置

在 `constants/index.js` 中配置应用常量：

```javascript
export const APP_CONFIG = {
  APP_NAME: "UniQuickStart",
  VERSION: "1.0.0",
  API_BASE_URL: "https://api.example.com",
  DEFAULT_PAGE_SIZE: 20,
};
```

### 平台配置

在 `manifest.json` 中配置各平台参数：

- 微信小程序：配置 `mp-weixin.appid`
- 地图服务：配置腾讯地图 API Key
